(function () {
    'use strict';

    angular
        .module('southWest.topology.singleTopo')
        .directive('topoAllInOneHeader', topoAllInOneHeader)
        .directive('topoAllInOne', topoAllInOne);

    function topoAllInOneHeader(Topology, $rootScope, $modal, domain, $log) {
        return {
            scope: false,
            restrict: 'E',
            templateUrl: '/templates/topology/singleTopo/allInOneHeader.html',
            link: function (scope, el) {
                // scope.topologyHasNode = topologyId.hasNode;

                scope.uploadTopologyModal = function () {
                    var modalInstance = $modal.open({
                        animation: true,
                        templateUrl: 'upload-confirmation.html',
                        controller: ModalInstanceCtrl,
                        size: 'sm',
                        resolve: {
                            scope: function () {
                                return scope;
                            },
                            element: function () {
                                return el;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

                    function ModalInstanceCtrl($scope, $modalInstance, $state, FileUploader, URI, System, topologyId, $rootScope) {
                        $scope.isDPIUpgrading = System.isDPIUpgrading();

                        $rootScope.$on('dpiUpgradeState', function () {
                            $scope.isDPIUpgrading = System.isDPIUpgrading();
                        });

                        var uploader = $scope.uploader = new FileUploader({
                            url: URI + '/files/topology/' + topologyId.id + '/fileupload',
                            autoUpload: true,
                            removeAfterUpload: true,
                            queueLimit: 1
                        });


                        uploader.onSuccessItem = function (item, response, status) {
                            $rootScope.$broadcast('updateDashboardHeader');
                            if (response.warningInfos.length) {
                                $rootScope.addAlert({
                                    type: 'warning',
                                    content: '警告!' + response.warningInfos
                                });
                            } else if (status === 200) {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '拓扑文件上传成功'
                                });
                            }
                        };

                        uploader.onProgressAll = function () {
                            $modalInstance.close();
                        };

                        uploader.onErrorItem = function (item, response) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: response.error
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                };

                scope.deployAllEndpoint = function () {
                    domain.getDomain().then(function (data) {
                        Topology.deployAllEndpoint(data[0].domainInfo.currentTopologyId).then(function (results) {
                            if (results.data && results.data.state === 'SUCCESS') {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '配置所有终端成功'
                                });
                            } else {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: "配置所有终端失败" + (results.data && results.data.reason ? ": " + results.data.reason : "")
                                });
                            }
                        }, function (data) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: "配置所有终端失败" + (data && data.data && data.data.error ? '：' + data.data.error : '')
                            });
                        });
                    });
                };
            }
        };
    }

    function topoAllInOne(Topology, sse, $q, Incident, Device, $rootScope, Enum, domain, topologyId, $location, UCD, auth) {
        var topoAllInOneObj = {
            scope: false,
            restrict: 'E',
            templateUrl: '/templates/topology/singleTopo/topoDiagram.html',
            controller: controller,
            controllerAs: 'topoCtrl',
            link: link
        };

        return topoAllInOneObj;

        function controller($scope, $q, $state, System) {
            var x = 0;
            var y = 0;
            var linkDeferred = $q.defer();
            $scope.isDPIUpgrading = System.isDPIUpgrading();

            $rootScope.$on('dpiUpgradeState', function () {
                $scope.isDPIUpgrading = System.isDPIUpgrading();
            });
            var vm = this;
            this.hovered = 100;
            // Style-related variables: colors, brushes, stroke...etc.
            this.linkPromise = linkDeferred.promise;
            this.gridPattern = {stroke: "#333333", strokeWidth: 0.8};
            this.nodeBGBrush = "#000";
            this.nodeSelectionBrush = "#76B900";
            this.nodeTopFillBrush = "#1C418F";
            this.nodeTextBrush = "#E4E4E4";
            this.nodeTopFont = "10pt SourceHanSansCN-Regular";
            this.nodeFont = "8pt SourceHanSansCN-Regular";
            this.iconFont = "8pt FontAwesome";
            this.statusOffBrush = "#FE540F";
            this.centerConnectorStroke = "#76B900";
            this.centerConnectorFill = "black";
            this.connectorBrush = "#E4E4E4";
            this.linkBrush = "#CCCCCC";
            this.linkOpacity = 0.5;
            this.linkHighlightBrush = "#76B900";
            this.linkHighlightOpacity = 0.5;
            this.tooltipBGBrush = "#E6E6E6"; //consistent with LESS styl;
            this.deviceColor = '';
            this.invalid = false;
            this.location = $location.$$host;
            this.getDeviceColor = function (category) {
                var color = "#193984";
                switch (category) {
                    case "SECURITY_DEVICE":
                        color = "#814E00";
                        break;
                    case "FACTORY_DEVICE":
                        color = "#102B6B";
                        break;
                    case "NETWORK_DEVICE":
                        color = "#056555";
                        break;
                }
                return color;
            };


            //Added for allInOne
            this.level = [];
            this.levelInfo = {}; // KEY by topologyId, which for each allinone will be different and a remote diagram either has blank or none
            this.holder;

            $scope.currentNode = {
                'orderID': null
            };
            $scope.showOptions = false;

            $scope.optionsStyle = {
                'position': 'absolute',
                'left': x + 'px',
                'top': y + 'px'
            };

            $scope.saveChange = function () {
                Topology.updateNode($scope.currentNodeCopy).then(function () {
                    angular.copy($scope.currentNodeCopy, $scope.currentNode);
                });
            };

            $scope.detailStyle = {
                'position': 'absolute',
                'left': '0px',
                'top': '0px'
            };

            $scope.showDetailPanel = false;

            $scope.calculatePosition = function () {
                $scope.detailStyle.left = x + 30 + 'px';
                $scope.detailStyle.top = y + 'px';
            };

            this.setPosition = function (x, y) {
                $scope.optionsStyle.left = x + 65 + 'px';
                $scope.optionsStyle.top = y - 10 + 'px';
            };
            if (!$scope.topo) {
                $scope.topo = '';
            }

            $scope.downloadTopo = function () {
                Topology.downloadLink($scope.currentTopo.topologyId).then(function (data) {
                    window.open('./' + data, '_self');
                });
            };

            $scope.discoverTopo = function () {
                $state.transitionTo("topology.discovery");
            };

            $scope.pv = Enum.get('privilege').filter(function (a) {
                return a.name === $rootScope.currentState;
            })[0].actionValue;

            $scope.render = function (update) {

                domain.getDomain().then(function (data) {

                    if (data && data[0].domainInfo.currentTopologyId) {
                        //  if $scope.topo is not set, we are showing current topology
                        if (!$scope.topo || data[0].domainInfo.currentTopologyId === $scope.topo) {
                            $scope.switchAlternate = 'on';
                        }
                        if (!$scope.topo) {
                            $scope.topo = data[0].domainInfo.currentTopologyId;
                        }
                        $scope.noTopo = false;
                    } else {
                        $scope.noTopo = !$scope.topo;
                    }

                    if ($scope.topo) {
                        linkDeferred.resolve($scope.topo);
                        Topology.getTopo($scope.topo).then(function (data) {
                            var topo = data;
                            var promises = [];
                            promises.push(Topology.getNodes($scope.topo));
                            promises.push(Topology.getLinks($scope.topo));
                            promises.push(Topology.getDevices($scope.topo));
                            promises.push(Device.getModels({
                                '$select': ['modelId', 'model_name', 'model', 'subCategory', "make", "iconType", "numOfPorts"],
                                '$limit': 1000000,
                                '$orderby': 'model_name'
                            }));
                            promises.push(Device.getModels({
                                '$select': ['modelId', 'model_name', 'model', 'subCategory', "make", "iconType", "numOfPorts"],
                                '$filter': 'category eq FACTORY_DEVICE',
                                '$limit': 1000000,
                                '$orderby': 'model_name'
                            }));
                            promises.push(Device.getModels({
                                '$select': ['modelId', 'model_name', 'model', 'subCategory', "make", "iconType", "numOfPorts"],
                                '$filter': 'category eq NETWORK_DEVICE',
                                '$limit': 1000000,
                                '$orderby': 'model_name'
                            }));
                            promises.push(Device.getModels({
                                '$select': ['modelId', 'model_name', 'model', 'subCategory', "make", "iconType", "numOfPorts"],
                                '$filter': 'category eq SECURITY_DEVICE',
                                '$limit': 1000000,
                                '$orderby': 'model_name'
                            }));
                            $q.all(promises).then(function (results) {
                                topo.nodes = results[0].data;
                                topo.links = results[1].data;
                                topo.devices = results[2].data;
                                (!results[3][0].model_name && !results[3][0].make && !results[3][0].model) ? topo.blankModel = results[3][0].modelId : '';
                                vm.factory_models = results[4];
                                vm.network_models = results[5];
                                vm.security_models = results[6];
                                $scope.topologyHasNode = topologyId.hasNode;
                                $scope.currentTopo = topo;
                                if (update) {
                                    $scope.putDiagramData(topo);
                                } else {
                                    $scope.drawTopo(topo);
                                }
                            });
                        });
                    }
                });
            };

            this.updateDiagram = function (newIp) {
                //Replace with new domain changer
                // domain.getDomain().then(function (data) {

                // if (data && data[0].domainInfo.currentTopologyId) {
                //   //  if $scope.topo is not set, we are showing current topology
                //   if (!$scope.topo || data[0].domainInfo.currentTopologyId === $scope.topo) {
                //     $scope.switchAlternate = 'on';
                //   }
                //   $scope.topo = data[0].domainInfo.currentTopologyId;
                //   $scope.noTopo = (data[0].domainInfo.currentTopologyId)?false:true;
                // } else {
                //   $scope.noTopo = true;
                // }

                // if ($scope.topo) {
                // linkDeferred.resolve($scope.topo);
                $q.all([auth.autoLogin(newIp)]).then(function () {
                    Topology.getTopo($scope.topo, newIp).then(function (data) {
                        var topo = data;
                        var promises = [];
                        promises.push(Topology.getNodes($scope.topo, newIp));
                        promises.push(Topology.getLinks($scope.topo, newIp));
                        promises.push(Topology.getDevices($scope.topo, newIp));
                        promises.push(Device.getModels({
                            '$select': ['modelId', 'model_name', 'model', 'subCategory', "make", "iconType", "numOfPorts"],
                            '$limit': 1000000,
                            '$orderby': 'model_name'
                        }));
                        $q.all(promises).then(function (results) {
                            topo.nodes = results[0].data;
                            topo.links = results[1].data;
                            topo.devices = results[2].data;
                            (!results[3][0].model_name && !results[3][0].make && !results[3][0].model) ? topo.blankModel = results[3][0].modelId : '';
                            // $scope.topologyHasNode = topologyId.hasNode;
                            // $scope.currentTopo = topo;
                            $scope.putDiagramData(topo);
                        });
                    });
                });
                // }
                // });
            };


            $scope.render();
        }

        function link(scope, el, attr, ctrlDiagram) {
            scope.$on('$destroy', function () {
                sse.unsubscribe('node');
            });
            document.getElementsByTagName("MAIN")[0].style.overflowY = "hidden";
            function findHeight() {
                var height = document.getElementsByTagName("MAIN")[0].offsetHeight;
                document.getElementById("singleTopoIndexDiv").style.height = height + "px";
                document.getElementById("topologySingle").style.height = ((window.innerHeight - 190 > 800) ? 800 : window.innerHeight - 190) + "px";
            }

            window.onresize = function () {
                ( document.getElementById("singleTopoIndexDiv")) ? findHeight() : '';
            };
            findHeight();
            ctrlDiagram.linkPromise.then(function (id) {
                var $ = go.GraphObject.make;

                var nodeMenu =  // context menu for each Node
                    $(go.Adornment, "Vertical",
                        $("ContextMenuButton",
                            $(go.TextBlock, "删除设备"),
                            {
                                click: function () {
                                    removeObj();
                                }
                            }
                        )
                    );

                var diagram =
                    $(go.Diagram, "topologySingle", {
                        initialContentAlignment: go.Spot.TopCenter, // Center Diagram contents
                        scale: (localStorage.getItem('monitor:topology.scale.' + id) === null ? 1 : parseFloat(localStorage.getItem('monitor:topology.scale.' + id))),
                        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                        "undoManager.isEnabled": true,
                        allowDrop: true,
                        grid: $(go.Panel, "Grid", {gridCellSize: new go.Size(50, 50)},
                            $(go.Shape, "LineH", ctrlDiagram.gridPattern),
                            $(go.Shape, "LineV", ctrlDiagram.gridPattern)
                        )
                    });
                diagram.scrollMode = go.Diagram.InfiniteScroll;
                diagram.nodeTemplate = // provide custom Node appearance
                    $(go.Node, "Spot", {
                            margin: 50,
                            name: "NODE",
                            selectionAdorned: false,
                            deletable: false,
                        },
                        //new go.Binding("contextMenu", "", function() { return ctrlDiagram.EditMode ? nodeMenu : null; }),
                        new go.Binding("location", "loc", go.Point.parse),
                        new go.Binding("deletable", "deviceId", function (e) {
                            return (!e) ? true : false;
                        }),
                        new go.Binding("contextMenu", "deviceId", function (e) {
                            return (!e) ? nodeMenu : '';
                        }),

                        $(go.Panel, "Table",
                            {
                                toolTip:  // define a tooltip for each node that displays the color as text
                                    $(go.Adornment, "Auto", {stretch: go.GraphObject.Fill},
                                        $(go.Shape, "Rectangle", {
                                            isPanelMain: true,
                                            fill: ctrlDiagram.tooltipBGBrush,
                                            maxSize: new go.Size(500, NaN)
                                        }),
                                        $(go.Panel, "Vertical", {margin: 10},
                                            $(go.TextBlock, {
                                                    text: "",
                                                    alignment: go.Spot.Left,
                                                    overflow: go.TextBlock.OverflowEllipsis,
                                                    wrap: go.TextBlock.None,
                                                    maxSize: new go.Size(450, NaN)
                                                },
                                                new go.Binding("text", "nameInDetail", function (name) {
                                                    return "设备名称: " + name;
                                                })
                                            ),
                                            $(go.TextBlock, {text: "", alignment: go.Spot.Left},
                                                new go.Binding("visible", "category", function (cat) {
                                                    return cat === "SECURITY_DEVICE";
                                                }),
                                                new go.Binding("text", "statusText", function (str) {
                                                    return "设备状态: " + str;
                                                })
                                            ),
                                            $(go.TextBlock, {
                                                    text: "",
                                                    alignment: go.Spot.Left,
                                                    overflow: go.TextBlock.OverflowEllipsis,
                                                    wrap: go.TextBlock.None,
                                                    maxSize: new go.Size(450, NaN)
                                                },
                                                new go.Binding("visible", "iconType", function (str) {
                                                    return (['cloud', 'remote'].indexOf(str) >= 0) ? false : true;
                                                }),
                                                new go.Binding("text", "modelInDetail", function (model) {
                                                    return "型号: " + model;
                                                })
                                            ),
                                            $(go.TextBlock, {
                                                    text: "",
                                                    alignment: go.Spot.Left,
                                                    overflow: go.TextBlock.OverflowEllipsis,
                                                    wrap: go.TextBlock.None,
                                                    maxSize: new go.Size(450, NaN)
                                                },
                                                new go.Binding("visible", "iconType", function (str) {
                                                    return (['cloud', 'subnet', 'switch'].indexOf(str) >= 0) ? false : true;
                                                }),
                                                new go.Binding("text", "ip", function (str) {
                                                    return "IP: " + str;
                                                })
                                            ),
                                            $(go.TextBlock, {
                                                    text: "",
                                                    alignment: go.Spot.Left,
                                                    overflow: go.TextBlock.OverflowEllipsis,
                                                    wrap: go.TextBlock.None,
                                                    maxSize: new go.Size(450, NaN)
                                                },
                                                new go.Binding("visible", "iconType", function (str) {
                                                    return (['cloud', 'subnet', 'switch', 'remote'].indexOf(str) >= 0 ) ? false : true;
                                                }),
                                                new go.Binding("text", "mac", function (str) {
                                                    return "MAC: " + str;
                                                })
                                            )
                                        )
                                    )  // end of Adornment
                            },
                            $(go.Panel, "Auto", {row: 1, column: 1, name: "BODY"},
                                $(go.Shape, "RoundedRectangle", {
                                        fill: null,
                                        strokeWidth: 2,
                                        stroke: null,
                                        portId: "unspecified"
                                    },
                                    new go.Binding("fill", "isSelected", function (sel) {
                                        return sel ? ctrlDiagram.nodeSelectionBrush : null;
                                    }).ofObject("")
                                ),
                                $(go.Panel, "Auto", {alignment: go.Spot.Top},
                                    $(go.Shape, "RoundedRectangle", {
                                            width: 100,
                                            fill: ctrlDiagram.nodeTopFillBrush,
                                            stroke: null,
                                            name: "TextBox"
                                        },
                                        new go.Binding("fill", "", function (e) {
                                            return (e.iconType === 'remote') ? "#737272" : ctrlDiagram.getDeviceColor(e.category);
                                        })
                                    ),
                                    $(go.TextBlock, {
                                            margin: new go.Margin(2, 0, 6, 0),
                                            stroke: ctrlDiagram.nodeTextBrush,
                                            isMultiline: false,
                                            width: 90,
                                            font: ctrlDiagram.nodeTopFont,
                                            textAlign: "center",
                                            overflow: go.TextBlock.OverflowEllipsis,
                                            wrap: go.TextBlock.None,
                                            name: "TEXT"
                                        },
                                        new go.Binding("text", "nameInDetail", function (name) {
                                            return (ctrlDiagram.level.length === 1 && name !== "远端监管平台") ? name + '' : name;
                                        })
                                    )
                                ),
                                $(go.Shape, "Rectangle", {
                                        alignment: go.Spot.Top,
                                        width: 100,
                                        fill: ctrlDiagram.nodeBGBrush,
                                        stroke: null,
                                        height: 10,
                                        margin: new go.Margin(20, 0, 0, 0)
                                    }
                                ),
                                $(go.Panel, "Auto",
                                    {margin: new go.Margin(20, 0, 0, 0)},
                                    $(go.Shape, "RoundedRectangle", {
                                            width: 100,
                                            fill: ctrlDiagram.nodeBGBrush,
                                            strokeWidth: 3,
                                            stroke: null
                                        }
                                    ),
                                    $(go.Panel, "Vertical", {
                                            margin: new go.Margin(0, 5, 0, 5),
                                        },
                                        $(go.Panel, "Auto",
                                            $(go.Picture, {
                                                    margin: new go.Margin(5),
                                                    width: 80,
                                                    height: 65,
                                                    imageStretch: go.GraphObject.Uniform,
                                                },
                                                new go.Binding("source", "img")
                                            ),
                                            $(go.Picture, {
                                                    name: "OfflineIcon",
                                                    margin: new go.Margin(0, 0, 0, 0),
                                                    width: 60,
                                                    height: 55,
                                                    source: "/images/Warning.png",
                                                },
                                                new go.Binding("visible", "statusIconShow")
                                            )
                                        ),
                                        $(go.TextBlock, {
                                                stroke: ctrlDiagram.nodeTextBrush,
                                                textAlign: "center",
                                                margin: new go.Margin(0, 0, 0, 0),
                                                wrap: go.TextBlock.None,
                                                font: ctrlDiagram.nodeFont,
                                                height: 9
                                            },
                                            new go.Binding("visible", "iconType", function (str) {
                                                return ( ['cloud', 'subnet', 'switch'].indexOf(str) >= 0) ? false : true;
                                            }),
                                            new go.Binding("text", "ip", function (str) {
                                                return (str && str.length !== 0) ? str : "未知";
                                            }),
                                            new go.Binding("stroke", "statusIconShow", function (s) {
                                                return !s ? ctrlDiagram.nodeTextBrush : ctrlDiagram.statusOffBrush;
                                            })
                                        )
                                    ),
                                    $(go.Shape, "Circle", {
                                            fill: ctrlDiagram.centerConnectorFill,
                                            desiredSize: new go.Size(16, 16),
                                            strokeWidth: 4,
                                            stroke: ctrlDiagram.centerConnectorStroke,
                                            fromLinkable: true, toLinkable: true,
                                            name: "middlePort"
                                        },
                                        new go.Binding("opacity", "", function () {
                                            return ctrlDiagram.EditMode ? 1 : 0;
                                        }),
                                        new go.Binding("portId", "portIdRef", function (sel) {
                                            return sel ? "foreGround" : "security";
                                        }),
                                        new go.Binding("cursor", "", function () {
                                            return ctrlDiagram.EditMode ? "pointer" : "default";
                                        }),
                                        new go.Binding("visible", "portIdRef")
                                    )
                                )
                            ),
                            // the Panel holding the left port elements, which are themselves Panels,
                            $(go.Panel, "Vertical",
                                new go.Binding("itemArray", "nearArray"),
                                {
                                    row: 1, column: 0,
                                    itemTemplate: $(go.Panel, {
                                            fromSpot: go.Spot.Right, toSpot: go.Spot.Left,
                                        },
                                        new go.Binding("portId", "portName"),
                                        $(go.Shape, "Rectangle", {
                                                stroke: null,
                                                fill: null,
                                                desiredSize: new go.Size(8, 8),
                                                margin: new go.Margin(1, 0),
                                            }
                                        )
                                    )  // end itemTemplate
                                }
                            ), // end Vertical
                            $(go.Panel, "Vertical",
                                new go.Binding("itemArray", "farArray"),
                                {
                                    row: 1, column: 2,
                                    itemTemplate: $(go.Panel,
                                        {
                                            fromSpot: go.Spot.Right, toSpot: go.Spot.Left,
                                        },
                                        new go.Binding("portId", "portName"),
                                        $(go.Shape, "Rectangle", {
                                                stroke: null,
                                                fill: null,
                                                desiredSize: new go.Size(8, 8),
                                                margin: new go.Margin(1, 0),
                                            }
                                        )
                                    )  // end itemTemplate
                                }
                            ),  // end Vertical Panel
                            // the Panel holding the right port elements, which are themselves Panels,
                            $(go.Panel, "Vertical",
                                new go.Binding("itemArray", "rightArray"),
                                {
                                    row: 1, column: 2,
                                    itemTemplate: $(go.Panel,
                                        {
                                            mouseEnter: function (e, node) {
                                                ctrlDiagram.hovered = Math.floor(Number(node.data.portName[1]) / 2);
                                                diagram.updateAllTargetBindings("portName");
                                            },
                                            mouseLeave: function () {
                                                ctrlDiagram.hovered = 100;
                                                diagram.updateAllTargetBindings("portName");
                                            },
                                            fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
                                            fromLinkable: true, toLinkable: true, cursor: "pointer"
                                        },
                                        new go.Binding("portId", "portName"),
                                        $(go.Shape, "Rectangle", {
                                                desiredSize: new go.Size(8, 8),
                                                margin: new go.Margin(1, 0),
                                            },
                                            new go.Binding("fill", "portName", function (n) {
                                                return Math.floor(Number(n[1]) / 2) === ctrlDiagram.hovered ? ctrlDiagram.centerConnectorStroke : ctrlDiagram.connectorBrush;
                                            }),
                                            new go.Binding("cursor", "", function () {
                                                return ctrlDiagram.EditMode ? "pointer" : "default";
                                            })
                                        ),
                                        {
                                            toolTip:  // define a tooltip for each node that displays the color as text
                                                $(go.Adornment, "Auto", {stretch: go.GraphObject.Fill},
                                                    $(go.Shape, "Rectangle", {
                                                        isPanelMain: true,
                                                        fill: ctrlDiagram.tooltipBGBrush,
                                                        maxSize: new go.Size(500, NaN)
                                                    }),
                                                    $(go.Panel, "Vertical", {margin: 10},
                                                        $(go.TextBlock, {
                                                                text: "",
                                                                alignment: go.Spot.Left,
                                                                overflow: go.TextBlock.OverflowEllipsis,
                                                                wrap: go.TextBlock.None,
                                                                maxSize: new go.Size(450, NaN)
                                                            },
                                                            new go.Binding("text", "portName", function (name) {
                                                                return "端口: " + name;
                                                            })
                                                        )
                                                    )
                                                )
                                        }
                                    )  // end itemTemplate
                                }
                            ),  // end Vertical Panel
                            // the Panel holding the left port elements, which are themselves Panels,
                            $(go.Panel, "Vertical",
                                new go.Binding("itemArray", "leftArray"),
                                {
                                    row: 1, column: 0,
                                    itemTemplate: $(go.Panel,
                                        {
                                            mouseEnter: function (e, node) {
                                                ctrlDiagram.hovered = Math.floor(Number(node.data.portName[1]) / 2);
                                                diagram.updateAllTargetBindings("portName");
                                            },
                                            mouseLeave: function () {
                                                ctrlDiagram.hovered = 100;
                                                diagram.updateAllTargetBindings("portName");
                                            },
                                            fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                                            fromLinkable: true, toLinkable: true, cursor: "pointer"
                                        },
                                        new go.Binding("portId", "portName"),
                                        $(go.Shape, "Rectangle", {
                                                desiredSize: new go.Size(8, 8),
                                                margin: new go.Margin(1, 0),
                                            },
                                            new go.Binding("fill", "portName", function (n) {
                                                return Math.floor(Number(n[1]) / 2) === ctrlDiagram.hovered ? ctrlDiagram.centerConnectorStroke : ctrlDiagram.connectorBrush;
                                            }),
                                            new go.Binding("cursor", "", function () {
                                                return ctrlDiagram.EditMode ? "pointer" : "default";
                                            })
                                        ),
                                        {
                                            toolTip:  // define a tooltip for each node that displays the color as text
                                                $(go.Adornment, "Auto", {stretch: go.GraphObject.Fill},
                                                    $(go.Shape, "Rectangle", {
                                                        isPanelMain: true,
                                                        fill: ctrlDiagram.tooltipBGBrush,
                                                        maxSize: new go.Size(500, NaN)
                                                    }),
                                                    $(go.Panel, "Vertical", {margin: 10},
                                                        $(go.TextBlock, {
                                                                text: "",
                                                                alignment: go.Spot.Left,
                                                                overflow: go.TextBlock.OverflowEllipsis,
                                                                wrap: go.TextBlock.None,
                                                                maxSize: new go.Size(450, NaN)
                                                            },
                                                            new go.Binding("text", "portName", function (name) {
                                                                return "端口: " + name;
                                                            })
                                                        )
                                                    )
                                                )
                                        }
                                    )  // end itemTemplate
                                }
                            ) // end Vertical,

                        )
                    );

                var linkMenu =  // context menu for each Node
                    $(go.Adornment, "Vertical",
                        $("ContextMenuButton",
                            $(go.TextBlock, "删除连线"),
                            {
                                click: function () {
                                    removeObj();
                                }
                            }
                        )
                    );

                diagram.linkTemplate =
                    $(go.Link, {
                            curve: go.Link.JumpOver,
                            routing: go.Link.AvoidsNodes,
                            contextMenu: linkMenu,
                            relinkableFrom: true,
                            relinkableTo: true
                        },
                        new go.Binding("contextMenu", "", function () {
                            return ctrlDiagram.EditMode ? linkMenu : null;
                        }),
                        new go.Binding("selectable", "linkId", function (e) {
                            return e !== -1;
                        }),
                        new go.Binding("routing", "link"),

                        // The first invisible shape is used to increase hit-test area for all the links.
                        $(go.Shape, {
                                strokeWidth: 15,
                                stroke: "transparent",
                                isPanelMain: true
                            },
                            new go.Binding("visible", "linkId", function (l) {
                                return ( l === -1 && !ctrlDiagram.EditMode) ? false : true;
                            })
                        ),
                        $(go.Shape, {
                                strokeWidth: 2,
                                stroke: ctrlDiagram.linkBrush,
                                opacity: ctrlDiagram.linkOpacity,
                                isPanelMain: true,
                                visible: true
                            },
                            new go.Binding("stroke", "isHighlighted", function (sel) {
                                return sel ? ctrlDiagram.linkHighlightBrush : ctrlDiagram.linkBrush;
                            }).ofObject(""),
                            new go.Binding("opacity", "isHighlighted", function (sel) {
                                return sel ? ctrlDiagram.linkHighlightOpacity : ctrlDiagram.linkOpacity;
                            }).ofObject(""),
                            new go.Binding("visible", "linkId", function (l) {
                                return ( l === -1 && !ctrlDiagram.EditMode) ? false : true;
                            })
                        )
                    );

                function removeObj() {
                    diagram.startTransaction("removePortFinal");
                    var remove = [];
                    diagram.selection.each(function (object) {
                        if (object instanceof go.Node || object instanceof go.Link) {
                            remove.push(object);
                        }
                    });
                    for (var ie = 0; ie < remove.length; ie++) {
                        diagram.remove(remove[ie]);
                    }
                    diagram.commitTransaction("removePortFinal");
                }

                diagram.click = function () {
                    diagram.startTransaction("no highlighteds");
                    diagram.clearHighlighteds();
                    diagram.commitTransaction("no highlighteds");
                    scope.$digest();
                };

                diagram.mouseDrop = function () {
                    diagram.startTransaction("getNode");
                    diagram.selection.each(function (node) {
                        if (!(node instanceof go.Node) || diagram.selection.count > 1) {
                            return;
                        }
                        initializeACL(node);
                        scope.$digest();
                    });
                    diagram.commitTransaction("getNode");
                };

                document.getElementById("topologySingle").onmousedown =
                    function modelMouseDown(e) {
                        if (e.which && e.which === 3) {
                            diagram.toolManager.panningTool.doActivate();
                        }
                    };

                document.getElementById("topologySingle").onmousemove =
                    function modelMouseMove(e) {
                        if (e.which === 3 || ( (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) && e.buttons === 2)) {
                            diagram.toolManager.panningTool.doMouseMove();
                            diagram.currentCursor = "all-scroll";
                            diagram.toolManager.draggingTool.doCancel();
                        }
                    };

                function selectionMovedHandler(e) {
                    // pv is pivilage, when it over and equal 4, user can edit
                    if ((scope.pv & 4) > 0) {
                        var currentObj = diagram.findPartAt(e.diagram.lastInput.documentPoint, false);
                        if (currentObj !== null) {
                            currentObj.selectionAdorned = false;
                        }

                        // if(ctrlDiagram.EditMode) {
                        for (var it = e.diagram.selection.iterator; it.next();) {
                            if (it.value instanceof go.Node && it.value.data.deviceId) {
                                var nodeEdit = {
                                    'id': it.value.data.nodeId,
                                    'x': it.value.location.x,
                                    'y': it.value.location.y
                                };
                                Topology.updatePosition(nodeEdit);
                            }
                        }
                    }
                }

                function changedSelectionHandler() {
                    diagram.startTransaction("highlight");
                    diagram.clearHighlighteds();
                    var selected = [];
                    diagram.selection.each(function (nodeEach) {
                        // for each Link coming out of the Node, set Link.isHighlighted
                        if (nodeEach instanceof go.Node) {
                            nodeEach.findLinksConnected().each(function (l) {
                                l.isHighlighted = true;
                            });
                            selected.push(nodeEach.data);
                        }
                    });

                    if (selected.length === 1) {
                        setSelectedDeviceInTable(selected[0]);
                        ctrlDiagram.lastSelection = selected[0].key;
                    }

                    diagram.commitTransaction("highlight");
                }


                function initializeACL(part) {
                    setSelectedDeviceInTable(part.data);
                    if (part.data.deviceId) {
                        Device.getACLInfo(part.data.deviceId).then(function (data) {
                            scope.hasacltable = false;
                            if (data.length > 0) {
                                scope.hasacltable = true;
                            }
                            scope.acltable = data;
                        }, function () {
                            scope.hasacltable = false;
                        });
                    }
                    diagram.select(part);
                }

                function dynamicSort(property) {
                    var sortOrder = 1;
                    if (property[0] === "-") {
                        sortOrder = -1;
                        property = property.substr(1);
                    }
                    return function (a, b) {
                        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                        return result * sortOrder;
                    };
                }

                // when this device is selected, set device data into right bar. then we can sort the ports
                function setSelectedDeviceInTable(data) {
                    scope.selectedDeviceInTable = data;
                    if (scope.selectedDeviceInTable.ports) {
                        for (var i = 0; i < scope.selectedDeviceInTable.ports.length; i++) {
                            if (scope.selectedDeviceInTable.ports[i].portName.toLowerCase() !== 'mgmt') {
                                scope.selectedDeviceInTable.ports[i].index = +scope.selectedDeviceInTable.ports[i].portName.substr(1);
                            }
                        }
                        scope.selectedDeviceInTable.ports.sort(dynamicSort('index'));
                        for (var k = 0; k < scope.selectedDeviceInTable.ports.length; k++) {
                            if (scope.selectedDeviceInTable.ports[k].portName.toLowerCase() !== 'mgmt') {
                                delete scope.selectedDeviceInTable.ports[k].index;
                            }
                        }
                        scope.selectedDeviceInTable.ports.sort(dynamicSort('index'));
                    }
                }

                function objectSingleClickHandler(e) {
                    if (e.subject.part.data.key) {
                        if (e.subject.part.data.deviceId) {
                            Device.getACLInfo(e.subject.part.data.deviceId).then(function (data) {
                                scope.hasacltable = false;
                                if (data.length > 0) {
                                    scope.hasacltable = true;
                                }
                                scope.acltable = data;
                            }, function () {
                                scope.hasacltable = false;
                            });
                        }
                    }
                    scope.$digest();
                }

                scope.forms = {};


                diagram.animationManager.isEnabled = false;
                diagram.toolManager.draggingTool.isGridSnapEnabled = true;
                diagram.toolManager.draggingTool.gridSnapCellSize = new go.Size(10, 10);
                diagram.toolManager.panningTool.isEnabled = false;
                // diagram.toolManager.dragSelectingTool.isEnabled = true;
                diagram.toolManager.hoverDelay = 1200;
                diagram.toolManager.dragSelectingTool.box =
                    $(go.Part, {layerName: "Tool"},
                        $(go.Shape, {name: "SHAPE", fill: "gray", opacity: 0.3, strokeWidth: 1})
                    );


                diagram.toolManager.linkingTool.temporaryLink =
                    $(go.Link, {layerName: "Tool"},
                        $(go.Shape, {
                            strokeWidth: 2,
                            stroke: ctrlDiagram.centerConnectorStroke,
                        }),
                        $(go.Shape, {  // the arrowhead
                            toArrow: "Standard",
                            fill: ctrlDiagram.centerConnectorStroke,
                            stroke: null
                        })
                    );

                diagram.toolManager.linkingTool.temporaryFromPort.strokeWidth = 2;
                diagram.toolManager.linkingTool.temporaryFromPort.stroke = ctrlDiagram.centerConnectorStroke;
                diagram.toolManager.linkingTool.temporaryFromPort.figure = "Circle";
                diagram.toolManager.linkingTool.temporaryFromPort.fill = ctrlDiagram.centerConnectorStroke;

                diagram.toolManager.linkingTool.temporaryToPort.strokeWidth = 2;
                diagram.toolManager.linkingTool.temporaryToPort.stroke = ctrlDiagram.centerConnectorStroke;
                diagram.toolManager.linkingTool.temporaryToPort.figure = "Circle";
                diagram.toolManager.linkingTool.temporaryToPort.fill = ctrlDiagram.centerConnectorStroke;

                diagram.addDiagramListener("SelectionMoved", selectionMovedHandler);
                diagram.addDiagramListener("ChangedSelection", changedSelectionHandler);
                diagram.addDiagramListener("ObjectSingleClicked", objectSingleClickHandler);


                scope.drawTopo = function (data) {
                    drawTopo(data);
                };

                scope.putDiagramData = function (data) {
                    putDiagramData(data);
                };

                document.getElementById("topologySingle").onmouseover = function () {
                    ctrlDiagram.over = true;
                };
                document.getElementById("topologySingle").onmouseleave = function () {
                    ctrlDiagram.over = false;
                };

                function drawTopo(data) {
                    diagram.doMouseWheel = function () {
                        // Binds InputEvent.control to always true so mousewheel always zooms
                        if (ctrlDiagram.over) {
                            this.lastInput.control = true;
                            diagram.toolManager.doMouseWheel();
                        }
                        // //  Record scale in localStorage
                        localStorage.setItem('monitor:topology.scale.' + data.topologyId, diagram.scale);
                    };
                    putDiagramData(data);

                    $rootScope.$on('updateDashboardHeader', function () {
                        scope.render('update');
                        for (var i = 0; i < diagram.model.nodeDataArray.length; i++) {
                            diagram.model.nodeDataArray[i].currentTopology = !diagram.model.nodeDataArray[i].currentTopology;
                        }
                    });


                    sse.listen('node', scope, streamUpdate);

                    function streamUpdate(data) {
                        diagram.startTransaction("连掉线");
                        diagram.model.nodeDataArray.forEach(function (objc, ind) {
                            var found = false;
                            if (diagram.devicesNodeMapCopy[objc.deviceId] === data.id) {
                                found = true;
                            } else {
                                for (var count = 0; count < diagram.devicesNodeMapCopy[objc.deviceId].length; count++) {
                                    if (diagram.devicesNodeMapCopy[objc.deviceId][count] === data.id) {
                                        found = true;
                                        break;
                                    }
                                }
                            }

                            if (found) {
                                if (data.online === -1) {
                                    diagram.model.nodeDataArray[ind].statusText = "掉线";
                                    diagram.model.nodeDataArray[ind].statusColor = "red";
                                    // diagram.model.nodeDataArray[ind].statusIconShow = true;
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "statusIconShow", true);
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "deviceOnline", data.online);
                                } else if (data.online === 1) {
                                    diagram.model.nodeDataArray[ind].statusText = "连线";
                                    diagram.model.nodeDataArray[ind].statusColor = "green";
                                    // diagram.model.nodeDataArray[ind].statusIconShow = false;
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "statusIconShow", false);
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "deviceOnline", data.online);
                                }

                            }
                        });
                        diagram.commitTransaction("连掉线");
                        diagram.requestUpdate();
                        // scope.uploadImage();
                    }

                    // scope.uploadImage = function () {
                    //   //  add offset to make sure that we are always capturing a square snapshot
                    //   var d = diagram.documentBounds;
                    //   var h = d.height;
                    //   var w = d.width;
                    //   var w_offset = 0;
                    //   var h_offset = 0;
                    //   if (h / 2 * 3 > w) {
                    //     w_offset = (h / 2 * 3 - w) / 2;
                    //     w = h / 2 * 3;
                    //   } else {
                    //     h_offset = (w - h / 2 * 3) / 3;
                    //     h = w * 2 / 3;
                    //   }
                    //   var img = diagram.makeImage({
                    //     type: "image/jpeg",
                    //     scale: 1,
                    //     position: new go.Point(d.x - w_offset, d.y - h_offset),
                    //     size: new go.Size(w, h)
                    //   });

                    //   function imageSource(src, title) {
                    //     var img = new Image();
                    //     img.src = src.src;
                    //     img.title = title;
                    //     return img.src;
                    //   }

                    //   var jpgImage = imageSource(img, "title");
                    //   jpgImage = jpgImage.replace("data:image/jpeg;base64,", "");
                    //   Topology.uploadImage(jpgImage, scope.topo);
                    // };

                    // setTimeout(function () {
                    //   scope.uploadImage();
                    // }, 3000);
                }

                function linkTemp(id, from, to, fromPort, toPort) {
                    this.from = from,
                        this.to = to,
                        this.fromPort = fromPort,
                        this.toPort = toPort,
                        this.color = "gray",
                        this.toArrow = "",
                        this.strokeWidth = "1",
                        this.linkId = id,
                        this.link = go.Link.AvoidsNodes;
                }

                ctrlDiagram.crumbClick =
                    function crumbClick(index) {
                        var changed = false;
                        while (ctrlDiagram.level.length - 1 !== index) {
                            ctrlDiagram.level.pop();
                            changed = true;
                        }
                        (changed) ? putDiagramData({ip: ctrlDiagram.level[index].ip}) : '';
                    };

                function putDiagramData(data) {
                    if (ctrlDiagram.levelInfo[data.ip]) {
                        diagram.model = ctrlDiagram.levelInfo[data.ip].model;
                        diagram.model.linkFromPortIdProperty = "fromPort";
                        diagram.model.linkToPortIdProperty = "toPort";
                        diagram.model.linkToPortIdProperty = "toPort";
                        diagram.model.isReadOnly = true;
                        return;
                    }
                    var nodeDataArray = [], linkDataArray = [];
                    if (ctrlDiagram.level.length === 0) {
                        diagram.nodeTemplate.doubleClick = function (e, node) {
                            if (node.data.deviceOnline === 1 && node.data.ip !== ctrlDiagram.level[0].ip && ctrlDiagram.level.length <= 1) {
                                ctrlDiagram.level.push({
                                    name: node.data.nameInDetail,
                                    ip: node.data.ip
                                });
                                scope.$digest();
                                if (ctrlDiagram.levelInfo[node.data.ip]) {
                                    // var modelContent = ctrlDiagram.levelInfo[node.data.ip].model.nodeDataArray;
                                    // scope.topologyHasNode = modelContent.length > 0;
                                    // scope.currentTopo  = ctrlDiagram.levelInfo[node.data.ip].topo;
                                    // scope.topo = ctrlDiagram.levelInfo[node.data.ip].topo.topologyId;
                                    putDiagramData({ip: node.data.ip});
                                } else {
                                    ctrlDiagram.holder = node.data.ip;
                                    ctrlDiagram.updateDiagram(node.data.ip);
                                    // putDiagramData(scope.currentTopo);
                                }
                            }
                        };
                        var key = 1;
                        var remoteData = {
                            key: key,
                            iconType: "remote",
                            topologyId: data.topologyId,
                            modelId: "cloud",
                            img: 'images/devices/security/kep-icon.png',
                            loc: "0 0",
                            nameInDetail: "远端监管平台",
                            category: 'CLOUD',
                            manufacturerInDetail: '匡恩网络',
                            modelInDetail: 'KEP-C2000',
                            updateTime: data.updatedAt,
                            statusIconShow: false,
                            portIdRef: true,
                            ip: ctrlDiagram.location
                        };
                        nodeDataArray.push(remoteData);
                        key++;

                        for (var ir = 0; ir < data.devices.length; ir++) {
                            var remoteDevice = data.devices[ir];
                            if (remoteDevice.category !== "SECURITY_DEVICE") {
                                continue;
                            }

                            var updateTimeRemote = remoteDevice.updatedAt;
                            var mmgtPortRemote = '';
                            var mmgtPortIPRemote = '';
                            var macRemote = '';
                            for (var dr = 0; dr < remoteDevice.devicePorts.length; dr++) {
                                if (remoteDevice.devicePorts[dr].isMgmtPort) {
                                    mmgtPortRemote = remoteDevice.devicePorts[dr].linkState || '';
                                    mmgtPortIPRemote = remoteDevice.devicePorts[dr].portIp || '';
                                    macRemote = remoteDevice.devicePorts[dr].mac || '';
                                }
                            }

                            remoteData = {
                                key: key,
                                topologyId: data.topologyId,
                                currentTopology: data.currentTopology,
                                deviceId: remoteDevice.deviceId,
                                img: /*'images/devices/security/kec-icon.png',*/
                                    (remoteDevice.category === "SECURITY_DEVICE") ?
                                        Device.getSecurityDeviceIconPath(remoteDevice._model_name, remoteDevice.iconType) :
                                    'images/' + remoteDevice.iconType.toLowerCase() + '-icon.png',
                                iconType: remoteDevice.iconType.toLowerCase(),
                                loc: (-200 * data.devices.length / 2 + 200 * key ) + " 200",
                                nameInDetail: remoteDevice.name,
                                manufacturerInDetail: (remoteDevice && remoteDevice.make ? remoteDevice.make : ""),
                                modelId: (remoteDevice && remoteDevice.modelId) ? remoteDevice.modelId : "",
                                modelInDetail: (remoteDevice && remoteDevice._model_name) ? remoteDevice._model_name : "",
                                versionInDetail: (remoteDevice && remoteDevice.version ? remoteDevice.version : ""),
                                serialNumber: ( remoteDevice.serialNumber ? remoteDevice.serialNumber : ""),
                                ruleOnNode: '',
                                countOfIncident: '',
                                unreadCountOfIncident: '',
                                mmgtPort: mmgtPortRemote,
                                deviceOnline: remoteDevice.deviceOnline,
                                updateTime: updateTimeRemote,
                                mac: macRemote,
                                ip: mmgtPortIPRemote,
                                ports: ( (remoteDevice.iconType.toLowerCase() !== 'switch') ? remoteDevice.devicePorts : ""),
                                numPorts: remoteDevice.devicePorts.length,
                                category: remoteDevice.category,
                                subcategory: remoteDevice._subCategory,
                                startDatetime: remoteDevice.startDatetime,
                            };
                            key++;
                            if (data.devices[ir].deviceOnline === 1) {
                                remoteData.statusText = "连线";
                                remoteData.statusIconShow = false;
                                remoteData.statusColor = "green";
                            } else if (data.devices[ir].deviceOnline === 0 && (data.devices[ir]) ? data.devices[ir].category === 'SECURITY_DEVICE' : false) {
                                remoteData.statusText = "未激活";
                                remoteData.statusIconShow = true;
                                remoteData.statusColor = "red";
                            } else if (data.devices[ir].deviceOnline === -1) {
                                remoteData.statusText = "掉线";
                                remoteData.statusIconShow = true;
                                remoteData.statusColor = "red";
                            } else {
                                remoteData.statusText = "";
                                remoteData.statusIconShow = false;
                                remoteData.statusColor = "white";
                            }

                            nodeDataArray.push(remoteData);
                            var newLink = new linkTemp(1, nodeDataArray[0].key, remoteData.key, 'unspecified', 'unspecified');
                            newLink.link = go.Link.Normal;
                            linkDataArray.push(newLink);
                        }
                        var allDomain = UCD.getAllDomains(); // All domains, hardcode mockup in ucd.js
                        for (ir = 1; ir < nodeDataArray.length; ir++) {
                            (allDomain[ir - 1]) ? nodeDataArray[ir].ip = allDomain[ir - 1].ip : ''; // assign domain mockup
                            nodeDataArray[ir].loc = (-200 * nodeDataArray.length / 2 + 200 * (nodeDataArray[ir].key - 1) ) + " 200";
                        }

                        diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
                        initializeACL(diagram.findNodeForKey(diagram.model.nodeDataArray[0].key));
                        ctrlDiagram.holder = ctrlDiagram.location;
                        ctrlDiagram.level.push({
                            name: "远端总览",
                            ip: ctrlDiagram.location
                        });
                    } else {
                        diagram.topologyId = data.topologyId;
                        var getConnectionPairs = function getConnectionPairs(allPorts, allDisconnectedPairs, currentPort) {
                            var result = ['', ''];
                            if (allPorts) {
                                //  Check if other ports are connected
                                for (var m = 0; m < allPorts.length; m++) {
                                    //  Skip current port
                                    if (allPorts[m] !== currentPort) {
                                        var found = false;
                                        //  Loop through disconnected pairs
                                        if (allDisconnectedPairs) {
                                            for (var n = 0; n < allDisconnectedPairs.length; n++) {
                                                if (allDisconnectedPairs[n].length === 2) {
                                                    if ((allDisconnectedPairs[n][0] === allPorts[m] && allDisconnectedPairs[n][1] === currentPort) ||
                                                        (allDisconnectedPairs[n][0] === currentPort && allDisconnectedPairs[n][1] === allPorts[m])) {
                                                        found = true;
                                                        if (result[1].length > 0) {
                                                            result[1] += ",";
                                                        }
                                                        result[1] += allPorts[m];
                                                    }
                                                }
                                            }
                                        }
                                        if (!found) {
                                            if (result[0].length > 0) {
                                                result[0] += ",";
                                            }
                                            result[0] += allPorts[m];
                                        }
                                    }
                                }
                            }
                            return result;
                        };

                        scope.routingIPS = false;

                        var cloudHolder = [];
                        var devicesNodeMap = {}, devicesNodeMapCopy = {}, deviceMap = {}, nodeToDevice = {}, nodeCopy = {};

                        for (var ak = 0; ak < data.devices.length; ak++) {
                            devicesNodeMap[data.devices[ak].deviceId] = [];
                            devicesNodeMapCopy[data.devices[ak].deviceId] = [];
                            for (var p = 0; p < data.devices[ak].devicePorts.length; p++) {
                                devicesNodeMap[data.devices[ak].deviceId].push(-1);
                                devicesNodeMapCopy[data.devices[ak].deviceId].push(-1);
                            }
                        }

                        for (var i = 0; i < data.nodes.length; i++) {
                            if (data.nodes[i].type !== "CLOUD") {
                                nodeToDevice[data.nodes[i].id] = data.nodes[i].deviceId;
                                deviceMap[data.nodes[i].deviceId] = {
                                    positionNodeId: data.nodes[i].id,
                                    loc: data.nodes[i].x + " " + data.nodes[i].y,
                                    x: data.nodes[i].x,
                                    y: data.nodes[i].y,
                                    iconType: Device.getIconName(data.nodes[i]._iconType),
                                    nodeType: data.nodes[i].type,
                                    subcategory: data.nodes[i]._subcategory
                                };

                                if (!scope.routingIPS && data.nodes[i].type === 'ROUTING_IPS') {
                                    scope.routingIPS = true;
                                }

                                for (var dvk = 0; dvk < data.devices.length; dvk++) {
                                    if (data.devices[dvk].deviceId === data.nodes[i].deviceId) {
                                        if (data.nodes[i].ports && data.devices[dvk].devicePorts.length > 1) {
                                            for (var dvl = 0; dvl < data.nodes[i].ports.length; dvl++) {
                                                for (var dvp = 0; dvp < data.devices[dvk].devicePorts.length; dvp++) {
                                                    if (data.devices[dvk].devicePorts[dvp].portName === data.nodes[i].ports[dvl]) {
                                                        devicesNodeMap[data.devices[dvk].deviceId][dvp] = data.nodes[i].id;
                                                        ( data.nodes[i].type.toLowerCase() === 'ips' ) ? devicesNodeMapCopy[data.devices[dvk].deviceId][dvp] = data.nodes[i].id : devicesNodeMapCopy[data.devices[dvk].deviceId] = data.nodes[i].id;
                                                        break;
                                                    }
                                                }
                                            }
                                        } else {
                                            devicesNodeMapCopy[data.devices[dvk].deviceId] = data.nodes[i].id;
                                        }
                                        break;
                                    }
                                }
                                continue;
                            }

                            var cloudData = {
                                key: data.nodes[i].id,
                                nodeId: data.nodes[i].id,
                                iconType: "cloud",
                                topologyId: data.nodes[i].topologyId,
                                currentTopology: data.currentTopology,
                                modelId: "cloud",
                                img: 'images/cloud-icon.png',
                                loc: data.nodes[i].x + " " + data.nodes[i].y,
                                nameInDetail: data.nodes[i].name,
                                category: 'NETWORK_DEVICE',
                                updateTime: data.updatedAt,
                                statusIconShow: false,
                                portIdRef: true,
                                nodeType: 'CLOUD',
                                deviceId: 'cloud'
                            };
                            cloudHolder.push(cloudData);
                        }
                        var deviceCount = 1;
                        var deviceToKey = {}, keyToDevice = {};
                        var firstSecurityDevice = false, internalLinks = [];

                        for (var ai = 0; ai < data.devices.length; ai++) {
                            var currDevice = data.devices[ai];
                            if (!deviceMap[currDevice.deviceId]) {
                                continue;
                            }
                            var updateTimeDevice = currDevice.updatedAt;
                            var mmgtPortDevice = '';
                            var mmgtPortIPDevice = '';
                            var macDevice = '';
                            for (var d = 0; d < currDevice.devicePorts.length; d++) {
                                if (currDevice.devicePorts[d].isMgmtPort) {
                                    mmgtPortDevice = currDevice.devicePorts[d].linkState || '';
                                    mmgtPortIPDevice = currDevice.devicePorts[d].portIp || '';
                                    macDevice = currDevice.devicePorts[d].mac || '';
                                }
                            }

                            deviceToKey[currDevice.deviceId] = deviceCount;

                            var routingMode = (deviceMap[currDevice.deviceId].nodeType === 'ROUTING_IPS');
                            var allDisconnectedPairs;

                            if (routingMode) {
                                var ka;
                                //Now for given device, iterate to find the ndoes taht blong to it
                                for (i = 0; i < data.nodes.length; i++) {
                                    if (data.nodes[i].deviceId !== currDevice.deviceId) {
                                        continue;
                                    }
                                    //  build notConnectedPortMap into array of a paired nodes
                                    if (currDevice && currDevice.notConnectedPortMap) {
                                        allDisconnectedPairs = currDevice.notConnectedPortMap.split(/\[(.*?)\]/g);
                                        for (ka = allDisconnectedPairs.length - 1; ka >= 0; ka--) {
                                            if (allDisconnectedPairs[ka].length < 2) {
                                                allDisconnectedPairs.splice(ka, 1);
                                            } else {
                                                allDisconnectedPairs[ka] = allDisconnectedPairs[ka].split(",");
                                            }
                                        }
                                    }

                                    if (currDevice.devicePorts) {
                                        for (ka = 0; ka < currDevice.devicePorts.length; ka++) {
                                            for (var q = 0; q < currDevice.devicePorts.length; q++) {
                                                currDevice.devicePorts.index = q;
                                                if (currDevice.devicePorts[ka].portName === ('p' + q)) {
                                                    currDevice.devicePorts[ka].index = +currDevice.devicePorts[ka].portName.substr(1);
                                                    currDevice.devicePorts[ka].connection = getConnectionPairs(data.nodes[i].ports, allDisconnectedPairs, ('p' + q));
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            var modeDescription = (deviceMap[currDevice.deviceId].nodeType && deviceMap[currDevice.deviceId].nodeType === 'ROUTING_IPS' ? '路由保护' :
                                (deviceMap[currDevice.deviceId].nodeType && (deviceMap[currDevice.deviceId].nodeType === 'IDS' ? '监测审计' :
                                    (deviceMap[currDevice.deviceId].nodeType && (deviceMap[currDevice.deviceId].nodeType === 'IPS' ? ((currDevice._subCategory === 'DATA_COLLECTION_DEVICE') ? '数采隔离' : '智能保护') : '')))));

                            var deviceData = {
                                key: -deviceCount,
                                nodeId: deviceMap[currDevice.deviceId].positionNodeId,
                                topologyId: data.topologyId,
                                currentTopology: data.currentTopology,
                                deviceId: currDevice.deviceId,
                                img: (currDevice.category === "SECURITY_DEVICE") ?
                                    Device.getSecurityDeviceIconPath(currDevice._model_name, currDevice.iconType) :
                                'images/' + deviceMap[currDevice.deviceId].iconType.toLowerCase() + '-icon.png',
                                iconType: deviceMap[currDevice.deviceId].iconType.toLowerCase(),
                                loc: deviceMap[currDevice.deviceId].loc,
                                nameInDetail: currDevice.name,
                                manufacturerInDetail: (currDevice && currDevice.make ? currDevice.make : ""),
                                modelId: (currDevice && currDevice.modelId) ? currDevice.modelId : "",
                                modelInDetail: (currDevice && currDevice._model_name) ? currDevice._model_name : "",
                                versionInDetail: (currDevice && currDevice.version ? currDevice.version : ""),
                                serialNumber: ( currDevice.serialNumber ? currDevice.serialNumber : ""),
                                modeDescription: modeDescription,
                                ruleOnNode: '',
                                countOfIncident: '',
                                unreadCountOfIncident: '',
                                showMode: modeDescription.length > 0,
                                routingMode: routingMode,
                                mmgtPort: mmgtPortDevice,
                                deviceOnline: currDevice.deviceOnline,
                                updateTime: updateTimeDevice,
                                mac: macDevice,
                                ip: mmgtPortIPDevice,
                                ports: ( (deviceMap[currDevice.deviceId].iconType.toLowerCase() !== 'switch') ? currDevice.devicePorts : ""),
                                numPorts: currDevice.devicePorts.length,
                                rightArray: [],
                                leftArray: [],
                                nearArray: [],
                                farArray: [],
                                category: currDevice.category,
                                subcategory: currDevice._subCategory,
                                nodeType: deviceMap[currDevice.deviceId].nodeType,
                                isEdited: false,
                                invalid: false,
                                startDatetime: currDevice.startDatetime
                            };
                            deviceMap[currDevice.deviceId].devicePorts = deviceData.ports;
                            if (deviceMap[currDevice.deviceId].nodeType.toLowerCase() !== "ips") {
                                deviceData.portIdRef = true;
                            } else {
                                deviceData.portIdRef = false;
                                for (var dpp = 0; dpp < deviceData.ports.length; dpp++) {
                                    if (!deviceData.ports[dpp].isMgmtPort) {
                                        if (Number(deviceData.ports[dpp].portName.substr(1)) % 2 === 0) {
                                            deviceData.nearArray.push({portName: deviceData.ports[dpp].portName + "near"});
                                            deviceData.leftArray.push({portName: deviceData.ports[dpp].portName});
                                        } else {
                                            deviceData.farArray.push({portName: deviceData.ports[dpp].portName + "far"});
                                            deviceData.rightArray.push({portName: deviceData.ports[dpp].portName});
                                        }
                                    }
                                }
                                for (dpp = 0; dpp < deviceData.leftArray.length; dpp++) {
                                    internalLinks.push(new linkTemp(-1, -deviceCount, -deviceCount, deviceData.nearArray[dpp].portName, deviceData.farArray[dpp].portName));
                                }
                            }

                            if (currDevice.deviceOnline === 1) {
                                deviceData.statusText = "连线";
                                deviceData.statusIconShow = false;
                                deviceData.statusColor = "green";
                            } else if (currDevice.deviceOnline === 0 && (currDevice) ? currDevice.category === 'SECURITY_DEVICE' : false) {
                                deviceData.statusText = "未激活";
                                deviceData.statusIconShow = true;
                                deviceData.statusColor = "red";
                            } else if (currDevice.deviceOnline === -1) {
                                deviceData.statusText = "掉线";
                                deviceData.statusIconShow = true;
                                deviceData.statusColor = "red";
                            } else {
                                deviceData.statusText = "";
                                deviceData.statusIconShow = false;
                                deviceData.statusColor = "white";
                            }

                            if (!firstSecurityDevice && deviceData.category === "SECURITY_DEVICE") {
                                firstSecurityDevice = deviceCount - 1;
                            }

                            var deviceCopy = {};
                            for (var field in deviceData) {
                                if (deviceData.hasOwnProperty(field)) {
                                    deviceCopy[field] = deviceData[field];
                                }
                            }

                            nodeDataArray.push(deviceData);
                            keyToDevice[deviceCount] = deviceData;

                            nodeCopy[deviceCopy.deviceId] = deviceCopy;

                            deviceCount++;
                        }

                        for (var bi = 0; bi < cloudHolder.length; bi++) {
                            deviceToKey[deviceCount] = deviceCount;
                            keyToDevice[deviceCount] = cloudHolder[bi].key;
                            nodeToDevice[cloudHolder[bi].key] = deviceCount;
                            devicesNodeMapCopy[deviceCount] = cloudHolder[bi].key;
                            cloudHolder[bi].key = -deviceCount;
                            nodeDataArray.push(cloudHolder[bi]);
                            deviceCount++;
                        }

                        var linkCopy = {};
                        for (var j = 0; j < data.links.length; j++) {
                            var from = -deviceToKey[nodeToDevice[data.links[j].nodeID]];
                            var to = -deviceToKey[nodeToDevice[data.links[j].destinationNodeID]];
                            var fromPort = "unspecified", toPort = "unspecified";

                            if (deviceMap[nodeToDevice[data.links[j].nodeID]]) {
                                if (deviceMap[nodeToDevice[data.links[j].nodeID]].nodeType.toLowerCase() === 'ips') {
                                    for (var nc = 0; nc < devicesNodeMap[nodeToDevice[data.links[j].nodeID]].length; nc++) {
                                        if (devicesNodeMap[nodeToDevice[data.links[j].nodeID]][nc] === data.links[j].nodeID) {
                                            devicesNodeMap[nodeToDevice[data.links[j].nodeID]][nc] = -1;
                                            fromPort = deviceMap[nodeToDevice[data.links[j].nodeID]].devicePorts[nc].portName;
                                            break;
                                        }
                                    }
                                }
                            }

                            if (deviceMap[nodeToDevice[data.links[j].destinationNodeID]]) {
                                if (deviceMap[nodeToDevice[data.links[j].destinationNodeID]].nodeType.toLowerCase() === 'ips') {
                                    for (var nb = 0; nb < devicesNodeMap[nodeToDevice[data.links[j].destinationNodeID]].length; nb++) {
                                        if (devicesNodeMap[nodeToDevice[data.links[j].destinationNodeID]][nb] === data.links[j].destinationNodeID) {
                                            devicesNodeMap[nodeToDevice[data.links[j].destinationNodeID]][nb] = -1;
                                            toPort = deviceMap[nodeToDevice[data.links[j].destinationNodeID]].devicePorts[nb].portName;
                                            break;
                                        }
                                    }
                                }
                            }

                            linkDataArray.push(new linkTemp(data.links[j].id, from, to, fromPort, toPort));
                            linkCopy[data.links[j].id] = new linkTemp(data.links[j].id, from, to, fromPort, toPort);

                        }

                        linkDataArray = linkDataArray.concat(internalLinks);

                        diagram.linkCopy = linkCopy;
                        nodeCopy["length"] = nodeDataArray.length;
                        diagram.nodeCopy = nodeCopy;

                        diagram.devicesNodeMapCopy = devicesNodeMapCopy;
                        keyToDevice.length = nodeDataArray.length;
                        diagram.keyToDevice = keyToDevice;
                        diagram.allData = data;
                        diagram.currentTopology = data.currentTopology;
                        diagram.topologyId = data.topologyId;
                        diagram.blankModelId = data.blankModel;

                        diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
                        diagram.model.linkFromPortIdProperty = "fromPort";
                        diagram.model.linkToPortIdProperty = "toPort";
                        diagram.model.isReadOnly = true;

                        //If no security devices in valid topology file - just pick first ndoe of diagram
                        if (scope.topologyHasNode) {
                            firstSecurityDevice = (firstSecurityDevice === false) ? 0 : firstSecurityDevice;
                            (ctrlDiagram.lastSelection !== false && diagram.findNodeForKey(-deviceToKey[ctrlDiagram.lastSelection]) ) ? initializeACL(diagram.findNodeForKey(-deviceToKey[ctrlDiagram.lastSelection])) : initializeACL(diagram.findNodeForData(diagram.model.nodeDataArray[firstSecurityDevice]));

                        }
                        scope.oldData = [];
                        for (j = 0; j < diagram.model.nodeDataArray.length; j++) {

                            var item = {
                                deviceId: diagram.model.nodeDataArray[j].deviceId,
                                serialNumber: diagram.model.nodeDataArray[j].serialNumber,
                                ip: diagram.model.nodeDataArray[j].ip
                            };
                            scope.oldData.push(item);
                        }
                    }
                    ctrlDiagram.levelInfo[ctrlDiagram.holder] = {
                        model: new go.GraphLinksModel(nodeDataArray, linkDataArray),
                        topo: data
                    };
                    diagram.model.linkFromPortIdProperty = "fromPort";
                    diagram.model.linkToPortIdProperty = "toPort";
                    diagram.model.isReadOnly = true;

                }


            });

        }
    }


})();
