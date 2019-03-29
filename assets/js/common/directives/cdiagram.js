/**
 * DTable Directive
 *
 * Description
 */
(function () {
    'use strict';
    angular
        .module('southWest.directives')
        .directive('cdiagram', cdiagram);

    function cdiagram(Device, $rootScope, sse, $q, Topology, Attack, $filter, snVal, formatVal) {
        var cdiagramObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: '/templates/common/cdiagram.html',
            controllerAs: 'cdiagram',
            controller: controller,
            link: link
        };

        return cdiagramObj;

        //////////
        function controller($scope, Enum, Topology, $q, domain, Device, topologyId, $rootScope, System, $state) {

            var x = 0;
            var y = 0;
            var linkDeferred = $q.defer();
            $scope.isDPIUpgrading = System.isDPIUpgrading();

            $rootScope.$on('dpiUpgradeState', function () {
                $scope.isDPIUpgrading = System.isDPIUpgrading();
            });

            var vm = this;
            vm.EditMode = false;
            vm.hovered = 100;
            // Style-related variables: colors, brushes, stroke...etc.
            vm.linkPromise = linkDeferred.promise;
            vm.gridPattern = {stroke: "#333333", strokeWidth: 0.8};
            vm.nodeBGBrush = "#000";
            vm.nodeSelectionBrush = "#76B900";
            vm.nodeTopFillBrush = "#1C418F";
            vm.nodeTextBrush = "#E4E4E4";
            vm.nodeTopFont = "10pt SourceHanSansCN-Regular";
            vm.ipFont = "9px sans-serif"; // use default font to avoid clipping on canvas
            vm.iconFont = "8pt FontAwesome";
            vm.statusOffBrush = "#FE540F";
            vm.centerConnectorStroke = "#76B900";
            vm.centerConnectorFill = "black";
            vm.connectorBrush = "#E4E4E4";
            vm.linkBrush = "#CCCCCC";
            vm.linkOpacity = 0.5;
            vm.linkHighlightBrush = "#76B900";
            vm.linkHighlightOpacity = 0.5;
            vm.tooltipBGBrush = "#E6E6E6"; //consistent with LESS styl;
            vm.deviceColor = '';
            vm.invalid = false;
            vm.nodeKeyMaping = {};
            vm.getDeviceColor = function (category) {
                var color = "#193984";
                switch (category) {
                    case "SECURITY_DEVICE":
                        color = "#AA3D11";
                        break;
                    case "FACTORY_DEVICE":
                        color = "#1D3D87";
                        break;
                    case "NETWORK_DEVICE":
                        color = "#107F6D";
                        break;
                }
                return color;
            };

            // set config
            vm.setConfig = function (config) {
                vm.config = config;
            };

            $scope.currentNode = {
                'orderID': null
            };
            $scope.showOptions = false;

            $scope.optionsStyle = {
                'position': 'absolute',
                'left': x + 'px',
                'top': y + 'px'
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

            vm.setPosition = function (x, y) {
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
                if (topologyId.id === void[0]) {
                    domain.getDomain().then(function (data) {
                        if (data && data[0].domainInfo.currentTopologyId) {
                            if (!$scope.topo) {
                                $scope.topo = data[0].domainInfo.currentTopologyId;
                            }
                            $scope.noTopo = false;
                        } else {
                            $scope.noTopo = !$scope.topo;
                        }
                        vm.getTopologyInfo(update);
                    });
                } else {
                    $scope.topo = topologyId.id;
                    vm.getTopologyInfo(update);
                }
            };

            vm.getTopologyInfo = function (update) {
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
                            // this part is for Infsafety
                            if (vm.config.isInfsafety) {
                                for (var i = 0; i < topo.nodes.length; i++) {
                                    for (var j = 0; j < topo.devices.length; j++) {
                                        if (topo.nodes[i].deviceId === topo.devices[j].deviceId) {
                                            topo.nodes[i]._make = topo.devices[j].make;
                                            topo.nodes[i]._serialNumber = topo.devices[j].serialNumber;
                                            topo.nodes[i]._modelIdentifier = topo.devices[j]._model_name;
                                            topo.nodes[i]._zoneNames = topo.devices[j]._zoneNames[0];
                                            topo.nodes[i]._knownVulnerabilitiesNumber = topo.devices[j].knownVulnerabilitiesNumber;
                                            if (topo.devices[j].devicePorts && topo.devices[j].devicePorts.length > 0) {
                                                topo.nodes[i]._ip = topo.devices[j].devicePorts[0].portIp;
                                            }
                                            break;
                                        }
                                    }
                                }
                                $scope.nodeMap = _.indexBy(topo.nodes, 'id');
                                $scope.forms.modes = [
                                    {mode: 'ENDPOINT', modename: 'HMI', icontype: 'hmi'},
                                    {mode: 'ENDPOINT', modename: 'OPC 客户端', icontype: 'opc_client'},
                                    {mode: 'ENDPOINT', modename: 'OPC 服务器', icontype: 'opc_server'},
                                    {mode: 'ENDPOINT', modename: 'PLC', icontype: 'plc'},
                                    {mode: 'ENDPOINT', modename: '工作站', icontype: 'workstation'},
                                    {mode: 'ENDPOINT', modename: '子网', icontype: 'subnet'},
                                    //{mode: 'CLOUD', modename: 'Cloud', icontype: 'cloud'},
                                    {mode: 'ENDPOINT', modename: '其它', icontype: 'unknown-device'}
                                ];

                                for (var q in $scope.nodeMap) {
                                    if (_.findLastIndex($scope.forms.modes, {icontype: $scope.nodeMap[q]._iconType}) === -1) {
                                        $scope.nodeMap[q]._iconType = 'unknown-device';
                                    }
                                }
                            }
                        });
                    });
                }
            };

            vm.updateDiagram = function (promises, thenFunc, final, error) {
                var deferred = $q.defer();
                $q.all(promises).then(function () {
                    deferred.resolve('success');

                    thenFunc;
                    if (true) {
                        $rootScope.addAlert({
                            type: 'success',
                            content: error
                        });
                    }
                }, function () {
                    deferred.resolve('修改设备失败');
                    $rootScope.addAlert({
                        type: 'danger',
                        content: error
                    });
                });
            };
            $scope.render();
        }

        function link(scope, element, attr, ctrlDiagram) {

            var vm = ctrlDiagram;

            vm.linkPromise.then(function (id) {

                if (ctrlDiagram.config.isEdited) {
                    ctrlDiagram.config.EditTopo('edit topo');
                }

                if (ctrlDiagram.config.isInfsafety) {
                    ctrlDiagram.config.drawInfsafety('infsafy');
                }

                if (ctrlDiagram.config.isAttackPath) {
                    ctrlDiagram.config.drawAttackPath('infsafy');
                }

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
                        minScale: 0.1,
                        maxScale: 2,
                        maxSelectionCount: 1,
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
                            return (e === "Device Id") ? true : false;
                        }),
                        new go.Binding("contextMenu", "deviceId", function (e) {
                            return (e === "Device Id") ? nodeMenu : '';
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
                                                    maxSize: new go.Size(450, NaN),
                                                    font: ctrlDiagram.nodeTopFont
                                                },
                                                new go.Binding("text", "nameInDetail", function (name) {
                                                    return "设备名称: " + name;
                                                })
                                            ),
                                            $(go.TextBlock, {
                                                    text: "",
                                                    alignment: go.Spot.Left,
                                                    overflow: go.TextBlock.OverflowEllipsis,
                                                    wrap: go.TextBlock.None,
                                                    maxSize: new go.Size(450, NaN),
                                                    font: ctrlDiagram.nodeTopFont
                                                },
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
                                                    maxSize: new go.Size(450, NaN),
                                                    font: ctrlDiagram.nodeTopFont
                                                },
                                                new go.Binding("visible", "iconType", function (str) {
                                                    return (['cloud'].indexOf(str) >= 0) ? false : true;
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
                                                    maxSize: new go.Size(450, NaN),
                                                    font: ctrlDiagram.nodeTopFont
                                                },
                                                new go.Binding("visible", "iconType", function (str) {
                                                    return (['cloud', 'subnet', 'switch'].indexOf(str) >= 0) ? false : true;
                                                }),
                                                new go.Binding("text", "ports", function (ports) {
                                                    var ipMacTips = [];
                                                    for (var i in ports) {
                                                        if (i && ports[i] && ports[i].isMgmtPort) {
                                                            ipMacTips.push("[ " + (ports[i].portIp ? ports[i].portIp : '未知') + " / " + (ports[i].mac ? ports[i].mac : '未知') + " ]");
                                                        }
                                                    }
                                                    if (ipMacTips.length === 1) {
                                                        return "IP / MAC: " + ipMacTips[0];
                                                    }
                                                    return "IP / MAC: \n" + ipMacTips.join("\n");
                                                })
                                            )
                                        )
                                    )  // end of Adornment
                            },
                            $(go.Panel, "Auto", {row: 0, column: 1, name: "ORDER"},
                                $(go.Shape, "Ellipse", {
                                        fill: "red",
                                        width: 25,
                                        height: 25,
                                        stroke: "red",
                                        visible: false
                                    },
                                    new go.Binding("visible", "targetOrder", function (i) {
                                        return i ? true : false;
                                    })
                                ),
                                $(go.TextBlock, {
                                        textAlign: "center",
                                        stroke: "white",
                                        width: 25,
                                        font: ctrlDiagram.nodeTopFont,
                                        visible: true
                                    },
                                    new go.Binding("text", "targetOrder")
                                )
                            ),
                            $(go.Panel, "Auto", {row: 1, column: 1, name: "BODY"},
                                $(go.Shape, "RoundedRectangle", {
                                        stroke: "red",
                                        strokeWidth: 2,
                                        opacity: 1,
                                        width: 100,
                                        height: 122,
                                        visible: false
                                    },
                                    new go.Binding("visible", "targetOrder", function (i) {
                                        return i ? true : false;
                                    })
                                ),
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
                                        new go.Binding("fill", "category", function (e) {
                                            return ctrlDiagram.getDeviceColor(e);
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
                                        new go.Binding("text", "nameInDetail")
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
                                            $(go.Picture, { // circular icon for displaying security device type {IPS, IDS or Shucai}
                                                    margin: new go.Margin(38, 40, 0, 0),
                                                    width: 30,
                                                    imageStretch: go.GraphObject.Uniform,
                                                },
                                                new go.Binding("visible", "category", function (cat) {
                                                    return cat === 'SECURITY_DEVICE';
                                                }),
                                                new go.Binding("source", "serialNumber", function (sn) {
                                                    // if the serial number starts with ZB, SC, JS, JC, display a badge icon. Otherwise map it
                                                    // to null for empty image.
                                                    var badgePath = null;
                                                    if (sn && sn.length >= 2) {
                                                        var dpiType = sn.substr(0, 2).toLowerCase();
                                                        if (['js', 'jc', 'sc', 'zb'].indexOf(dpiType) >= 0) {
                                                            badgePath = "/images/devices/security/badge-" + (dpiType === 'jc' ? 'js' : dpiType) + ".png";
                                                        }
                                                    }
                                                    return badgePath;
                                                })
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
                                                font: ctrlDiagram.ipFont,
                                                height: 9
                                            },
                                            new go.Binding("visible", "iconType", function (str) {
                                                return ( ['cloud', 'subnet', 'switch'].indexOf(str) >= 0) ? false : true;
                                            }),
                                            new go.Binding("text", "key", function (key) {
                                                var currentDeviceNode = diagram.findNodeForKey(key).data;
                                                if (currentDeviceNode.category === 'FACTORY_DEVICE' && currentDeviceNode.ports && currentDeviceNode.ports.length > 0) {
                                                    return currentDeviceNode.ports[0].portIp ? currentDeviceNode.ports[0].portIp + (currentDeviceNode.ports.length > 1 ? " ..." : "") : "未知";
                                                } else {
                                                    return (currentDeviceNode.ip && currentDeviceNode.ip.length !== 0) ? currentDeviceNode.ip : "未知";
                                                }
                                            }),
                                            new go.Binding("stroke", "statusIconShow", function (s) {
                                                return !s ? ctrlDiagram.nodeTextBrush : ctrlDiagram.statusOffBrush;
                                            })
                                        ),
                                        $(go.TextBlock, {
                                                stroke: ctrlDiagram.nodeTextBrush,
                                                textAlign: "center",
                                                margin: new go.Margin(0, 0, 0, 0),
                                                wrap: go.TextBlock.None,
                                                font: ctrlDiagram.ipFont,
                                                height: 9
                                            },
                                            new go.Binding("visible", "iconType", function (str) {
                                                return ( ['cloud', 'subnet', 'switch'].indexOf(str) >= 0) ? true : false;
                                            })
                                        )
                                    ),
                                    $(go.Shape, "Circle", {
                                            fill: ctrlDiagram.centerConnectorFill,
                                            desiredSize: new go.Size(16, 16),
                                            strokeWidth: 4,
                                            stroke: ctrlDiagram.centerConnectorStroke,
                                            margin: new go.Margin(0, 0, 20, 0),
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
                                                return ctrlDiagram.EditMode ? ctrlDiagram.centerConnectorStroke : ( Math.floor(Number(n[1]) / 2) === ctrlDiagram.hovered ) ? ctrlDiagram.centerConnectorStroke : ctrlDiagram.connectorBrush;
                                            }),
                                            new go.Binding("stroke", "portName", function (n) {
                                                return !ctrlDiagram.EditMode ? null : ( Math.floor(Number(n[1]) / 2) === ctrlDiagram.hovered ) ? "red" : null;
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
                                                                maxSize: new go.Size(450, NaN),
                                                                font: ctrlDiagram.nodeTopFont
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
                                                                maxSize: new go.Size(450, NaN),
                                                                font: ctrlDiagram.nodeTopFont
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
                            ), // end Vertical,
                            // the Panel holding mimic of bottom ports for factory device
                            $(go.Panel, "Horizontal",
                                new go.Binding("itemArray", "bottomArray"),
                                {
                                    row: 2, column: 1,
                                    itemTemplate: $(go.Panel,
                                        {
                                            mouseEnter: function (e, node) {
                                                var array = "bottomArray";
                                                for (var count = 0; count < node.part.data[array].length; count++) {
                                                    if (node.part.data[array][count].portName === node.data.portName) {
                                                        node.part.data[array][count].portColor = ctrlDiagram.centerConnectorStroke;
                                                        break;
                                                    }
                                                }
                                                diagram.updateAllTargetBindings("portColor");
                                            },
                                            mouseLeave: function (e, node) {
                                                var array = "bottomArray";
                                                for (var count = 0; count < node.part.data[array].length; count++) {
                                                    if (node.part.data[array][count].portName === node.data.portName) {
                                                        node.part.data[array][count].portColor = ctrlDiagram.connectorBrush;
                                                        break;
                                                    }
                                                }
                                                diagram.updateAllTargetBindings("portColor");
                                            },
                                            fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
                                            fromLinkable: true, toLinkable: true, cursor: "pointer"
                                        },
                                        new go.Binding("portId", "portName"),
                                        $(go.Shape, "Rectangle", {
                                                desiredSize: new go.Size(8, 8),
                                                margin: new go.Margin(0, 1),
                                            },
                                            new go.Binding("fill", "", function (n) {
                                                return n.portColor ? n.portColor : ctrlDiagram.connectorBrush;
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
                                                                maxSize: new go.Size(450, NaN),
                                                                font: ctrlDiagram.nodeTopFont
                                                            },
                                                            new go.Binding("text", "portName", function (name) {
                                                                return "端口: " + name;
                                                            })
                                                        ),
                                                        $(go.TextBlock, {
                                                                text: "",
                                                                alignment: go.Spot.Left,
                                                                overflow: go.TextBlock.OverflowEllipsis,
                                                                wrap: go.TextBlock.None,
                                                                maxSize: new go.Size(450, NaN),
                                                                font: ctrlDiagram.nodeTopFont
                                                            },
                                                            new go.Binding("text", "portIp", function (ip) {
                                                                return "IP: " + ip;
                                                            })
                                                        )
                                                    )
                                                )
                                        }
                                    )  // end itemTemplate
                                }
                            ) // end Horizontal
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
                            routing: go.Link.Normal,
                            corner: 5,
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
                        new go.Binding('curve', 'curve'),
                        new go.Binding("curviness", "curviness"),

                        // The first invisible shape is used to increase hit-test area for all the links.
                        $(go.Shape, {
                                strokeWidth: 15,
                                stroke: "transparent",
                                isPanelMain: true
                            },
                            new go.Binding("strokeWidth", "strokeWidth"),
                            new go.Binding("stroke", "color"),
                            new go.Binding("visible", "linkId", function (l) {
                                return ( l === -1 && !ctrlDiagram.EditMode) ? false : true;
                            })
                        ),
                        $(go.Shape, {
                                strokeWidth: 5,
                                visible: true
                            },
                            new go.Binding("stroke", "color"),
                            new go.Binding("toArrow", "toArrow"),
                            new go.Binding("visible", "linkId", function (l) {
                                return ( l === -1 && !ctrlDiagram.EditMode) ? false : true;
                            })),
                        $(go.Panel, "Auto", {},
                            $(go.Shape, "Ellipse", {
                                    fill: null,
                                    stroke: "#74b600",
                                    width: 29,
                                    height: 29,
                                    strokeWidth: 2,
                                    opacity: 0.5,
                                    visible: false
                                },
                                new go.Binding("visible", 'suggestionPosition')),
                            $(go.Shape, "Ellipse", {
                                    fill: null,
                                    stroke: "#74b600",
                                    width: 20,
                                    height: 20,
                                    strokeWidth: 2,
                                    opacity: 0.5,
                                    visible: false
                                },
                                new go.Binding("visible", 'suggestionPosition')),
                            $(go.Shape, "Ellipse", {
                                    fill: "#74b600",
                                    stroke: "#74b600",
                                    width: 13,
                                    height: 13,
                                    strokeWidth: 1,
                                    opacity: 0.5,
                                    visible: false
                                },
                                new go.Binding("visible", 'suggestionPosition'))),
                        $(go.TextBlock, {
                                text: "请在此处增加匡恩工控保护设备",
                                font: ctrlDiagram.nodeTopFont,
                                stroke: "#74b600",
                                visible: false,
                                alignmentFocus: new go.Spot(-0.1, 0.5, -3, 0)
                            },
                            new go.Binding("visible", 'suggestionPosition'))
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
                        if (!(node instanceof go.Node) || diagram.selection.dd > 1) {
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

                document.getElementById("topologySingle").onmouseup =
                    function modelMouseUp(e) {
                        if (e.which && e.which === 3) {
                            diagram.toolManager.panningTool.doDeactivate();
                            for (var it = diagram.nodes.iterator; it.next();) {
                                if (it.value instanceof go.Node) {
                                    it.value.location.x = it.value.location.x + (diagram.toolManager.panningTool.originalPosition.x - diagram.position.x);
                                    it.value.location.y = it.value.location.y + (diagram.toolManager.panningTool.originalPosition.y - diagram.position.y);
                                    var node = {
                                        'id': it.value.data.nodeId,
                                        'x': it.value.location.x,
                                        'y': it.value.location.y
                                    };
                                    Topology.updatePosition(node);
                                }
                            }
                        }
                    };

                function selectionMovedHandler(e) {
                    // pv is pivilage, when it over and equal 4, user can edit
                    if ((scope.pv & 4) > 0 && vm.config.setPosition) {
                        var currentObj = diagram.findPartAt(e.diagram.lastInput.documentPoint, false);
                        if (currentObj !== null) {
                            currentObj.selectionAdorned = false;
                        }

                        for (var it = e.diagram.selection.iterator; it.next();) {
                            if (it.value instanceof go.Node && it.value.data.deviceId) {
                                var nodeEdit = {
                                    'id': it.value.data.nodeId,
                                    'x': it.value.location.x,
                                    'y': it.value.location.y
                                };
                                Topology.updatePosition(nodeEdit);
                            } else if (it.value.data.isGroup) {
                                for (var g = it.value.memberParts.iterator; g.next();) {
                                    if (g.value instanceof go.Node && g.value.data.nodeId) {
                                        var groupNodeEdit = {
                                            'id': g.value.data.nodeId,
                                            'x': g.value.location.x,
                                            'y': g.value.location.y
                                        };
                                        Topology.updatePosition(groupNodeEdit);
                                    }
                                }
                            }
                        }
                    }
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
                    scope.validateDevice(scope.selectedDeviceInTable);
                    scope.populateModelOptions(scope.selectedDeviceInTable.category);
                    diagram.select(part);
                }

                ctrlDiagram.saveData =
                    function saveData(area) {
                        diagram.updateAllTargetBindings('nameInDetail');
                        diagram.updateAllTargetBindings('ip');
                        if (ctrlDiagram.EditMode) {
                            if (!scope.selectedDeviceInTable.isEdited) {
                                diagram.model.setDataProperty(scope.selectedDeviceInTable, "isEdited", [area]);
                            } else {
                                ((scope.selectedDeviceInTable.isEdited).indexOf(area) === -1) ?
                                    diagram.model.insertArrayItem(scope.selectedDeviceInTable.isEdited, -1, area) : '';
                            }
                        }
                    };


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
                        scope.populateModelOptions(scope.selectedDeviceInTable.category);
                    }
                    scope.validateDevice(scope.selectedDeviceInTable);
                    scope.$digest();
                }

                scope.forms = {};
                scope.validateIp = angular.copy(formatVal.getIPReg());
                scope.validateMac = angular.copy(formatVal.getMACReg());

                scope.validateDevice = function (selectedDeviceInTable) {
                    selectedDeviceInTable.nameError = (!selectedDeviceInTable.nameInDetail || selectedDeviceInTable.nameInDetail.length === 0);
                    selectedDeviceInTable.modelError = (!selectedDeviceInTable.modelId || selectedDeviceInTable.modelId.length === 0) && (selectedDeviceInTable.iconType.toLowerCase() !== 'subnet');
                    selectedDeviceInTable.invalidIp = ( !selectedDeviceInTable.ip || !(selectedDeviceInTable.ip.match(scope.validateIp) )) && ['router', 'cloud', 'switch'].indexOf(selectedDeviceInTable.iconType.toLowerCase()) === -1;
                    if (selectedDeviceInTable.category === 'SECURITY_DEVICE') {
                        selectedDeviceInTable.serialError = (!selectedDeviceInTable.serialNumber || selectedDeviceInTable.serialNumber.length === 0);
                        selectedDeviceInTable.serialFormatError = !snVal.validSNFormat(selectedDeviceInTable.serialNumber);
                        selectedDeviceInTable.invalidMac = selectedDeviceInTable.mac && !(selectedDeviceInTable.mac.match(scope.validateMac));
                    } else {
                        selectedDeviceInTable.invalidMac = selectedDeviceInTable.mac && !(selectedDeviceInTable.mac.match(scope.validateMac));
                    }
                    (selectedDeviceInTable.iconType.toLowerCase() === 'subnet') ? selectedDeviceInTable.invalidNetMask = !selectedDeviceInTable.ports[0].netMask || !(selectedDeviceInTable.ports[0].netMask.match(scope.validateIp)) : '';

                    selectedDeviceInTable.hasDuplicateSN = hasDuplicateSN(selectedDeviceInTable.deviceId, selectedDeviceInTable.serialNumber, diagram.model.nodeDataArray);
                    selectedDeviceInTable.hasDuplicateIP = hasDuplicateIP(selectedDeviceInTable.deviceId, selectedDeviceInTable.ip, diagram.model.nodeDataArray);
                    selectedDeviceInTable.hasDuplicateMAC = hasDuplicateMAC(selectedDeviceInTable.deviceId, selectedDeviceInTable.mac, diagram.model.nodeDataArray);

                    selectedDeviceInTable.invalid = selectedDeviceInTable.nameError || selectedDeviceInTable.modelError || selectedDeviceInTable.invalidIp || selectedDeviceInTable.serialError || selectedDeviceInTable.invalidMac || selectedDeviceInTable.invalidNetMask || selectedDeviceInTable.hasDuplicateSN || selectedDeviceInTable.hasDuplicateIP || (selectedDeviceInTable.category === 'SECURITY_DEVICE' && selectedDeviceInTable.serialFormatError);
                    var status;
                    for (var count = 0; count < diagram.model.nodeDataArray.length; count++) {
                        status = status || diagram.model.nodeDataArray[count].invalid;
                    }
                    ctrlDiagram.invalid = status;

                };

                scope.populateModelOptions = function (category) {
                    if (scope.selectedDeviceInTable.nodeType.toLowerCase() === 'cloud') {
                        return;
                    }
                    scope.forms.models = [];
                    if (category === 'FACTORY_DEVICE') {
                        scope.forms.models = ctrlDiagram.factory_models;
                    } else if (category === 'NETWORK_DEVICE') {
                        scope.forms.models = ctrlDiagram.network_models;
                    } else if (category === 'SECURITY_DEVICE') {
                        scope.forms.models = ctrlDiagram.security_models;
                        if (!scope.selectedDeviceInTable.modelId) {
                            scope.selectedDeviceInTable.modelId = scope.forms.models[0].modelId;
                            scope.modelChange(scope.selectedDeviceInTable);
                        }
                    }
                };

                scope.populateModeOptions = function (modelsubcategory, modelname) {
                    scope.forms.modes = [];
                    var model = modelname;
                    if (modelname && modelname.indexOf(' / ') > 0) {
                        model = modelname.split(' / ')[1];
                    }
                    if (modelsubcategory === 'DATA_COLLECTION_DEVICE' || model.indexOf('KED') === 0) {
                        scope.forms.modes[0] = {};
                        scope.forms.modes[0]['mode'] = 'IPS';
                        scope.forms.modes[0]['modename'] = '数采隔离';
                    } else {
                        if (model.indexOf('KEA') === 0) {
                            scope.forms.modes[0] = {};
                            scope.forms.modes[0]['mode'] = 'IDS';
                            scope.forms.modes[0]['modename'] = '监测审计';
                        } else if (model.indexOf('KEV') === 0) {
                            if (model === 'KEV-U800') {
                                scope.forms.modes[0] = {};
                                scope.forms.modes[0]['mode'] = 'IPS';
                                scope.forms.modes[0]['modename'] = '智能保护';
                            } else {
                                scope.forms.modes[0] = {};
                                scope.forms.modes[1] = {};
                                scope.forms.modes[0]['mode'] = 'IPS';
                                scope.forms.modes[1]['mode'] = 'ROUTING_IPS';
                                scope.forms.modes[0]['modename'] = '智能保护';
                                scope.forms.modes[1]['modename'] = '路由保护';
                            }
                        } else if (model.indexOf('KEC') === 0) {
                            scope.forms.modes[0] = {};
                            scope.forms.modes[1] = {};
                            scope.forms.modes[0]['mode'] = 'IPS';
                            scope.forms.modes[1]['mode'] = 'IDS';
                            scope.forms.modes[0]['modename'] = '智能保护';
                            scope.forms.modes[1]['modename'] = '监测审计';
                        }
                    }
                };

                scope.modelChange = function (selectedDeviceInTable) {
                    for (var i in scope.forms.models) {
                        if (i && scope.forms.models[i].modelId === selectedDeviceInTable.modelId) {
                            selectedDeviceInTable.manufacturerInDetail = scope.forms.models[i].make;
                            selectedDeviceInTable.numPorts = scope.forms.models[i].numOfPorts;
                            selectedDeviceInTable.modelInDetail = scope.forms.models[i].model_name + ' / ' + scope.forms.models[i].model;
                            if (selectedDeviceInTable.category === "SECURITY_DEVICE") {
                                (['kea-c200', 'kea-c400', 'ked-c400', 'kev-c200', 'kev-c400'].indexOf((scope.forms.models[i].model).toLowerCase()) >= 0) ?
                                    diagram.model.setDataProperty(selectedDeviceInTable, "img", ('images/devices/security/' + (scope.forms.models[i].model).toLowerCase() + '-icon.png')) :
                                    diagram.model.setDataProperty(selectedDeviceInTable, "img", ('images/devices/security/' + scope.forms.models[i].iconType + '-icon.png'));
                                selectedDeviceInTable.iconType = scope.forms.models[i].iconType;
                                var modelName = scope.forms.models[i].model_name + ' / ' + scope.forms.models[i].model;
                                ctrlDiagram.newModel(scope.forms.models[i].model);
                                scope.populateModeOptions(selectedDeviceInTable.subcategory, modelName);
                            }
                            selectedDeviceInTable.subcategory = scope.forms.models[i].subCategory;
                            break;
                        }
                    }
                    ctrlDiagram.saveData('basic');
                    scope.validateDevice(selectedDeviceInTable);
                };

                scope.modeChange = function (selectedDeviceInTable) {
                    for (var i in scope.forms.modes) {
                        if (i && scope.forms.modes[i].modename === selectedDeviceInTable.modeDescription) {
                            selectedDeviceInTable.nodeType = scope.forms.modes[i].mode;
                            if (selectedDeviceInTable.modeDescription === '数采隔离') {
                                selectedDeviceInTable.subCategory = 1;
                            }
                            if (selectedDeviceInTable.modelInDetail.indexOf('KEV') === 0) {
                                ctrlDiagram.newModel(selectedDeviceInTable.modelInDetail);
                            }
                            break;
                        }
                    }
                    scope.validateDevice(selectedDeviceInTable);
                };

                function hasDuplicateSN(deviceId, serialNumber, data) {
                    if (!serialNumber) {
                        return false;
                    }
                    var newSame = 0;
                    for (var index = 0; index < data.length; index++) {
                        if (serialNumber === data[index].serialNumber) {
                            if (deviceId !== data[index].deviceId) {
                                return true;
                            } else if (!deviceId && !data[index].deviceId) {
                                if (newSame === 0) {
                                    newSame++;
                                } else {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }

                function hasDuplicateIP(deviceId, ip, data) {
                    if (!ip) {
                        return false;
                    }
                    var newSame = 0;
                    for (var index = 0; index < data.length; index++) {
                        if (ip === data[index].ip) {
                            if (deviceId !== data[index].deviceId) {
                                return true;
                            } else if (!deviceId && !data[index].deviceId) {
                                if (newSame === 0) {
                                    newSame++;
                                } else {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }

                function hasDuplicateMAC(deviceId, mac, data) {
                    if (!mac) {
                        return false;
                    }
                    for (var index = 0; index < data.length; index++) {
                        if (mac === data[index].mac &&
                            deviceId !== data[index].deviceId) {
                            return true;
                        }
                    }
                    return false;
                }

                function copyNodeData(data) {
                    var copy = {};
                    copy.nameInDetail = data.deviceType;
                    copy.topology = diagram.topologyId;
                    copy.currentTopology = diagram.currentTopology;
                    copy.img = data.img;
                    copy.category = data.category;
                    copy.updateTime = new Date().toJSON();
                    copy.statusIconShow = data.category === "SECURITY_DEVICE";
                    copy.portIdRef = true;
                    copy.loc = '';
                    copy.nodeType = (data.deviceType === 'Cloud') ? "CLOUD" : (data.deviceType === '网络交换机') ? "SWITCH" : (data.deviceType === '路由器') ? "ROUTER" : ( data.deviceType === "安全设备" ) ? "IPS" : "ENDPOINT";
                    copy.isEdited = false;
                    copy.iconType = data.img.substring(7, data.img.length - 9);
                    copy.modelId = (data.deviceType !== 'Cloud') ? "" : "cloud";
                    copy.deviceId = "";
                    if (data.deviceType !== 'Cloud') {
                        copy.ports = [
                            {
                                _subnets: Array[0],
                                deployedRulesNumber: 0,
                                deviceId: "Device Id",
                                isMgmtPort: true,
                                linkState: 0,
                                mac: "",
                                portId: "",
                                portIp: "",
                                portName: "p0",
                                protectedDevicesNumber: 0,
                                status: 0
                            }
                        ];
                        copy.deviceOnline = 0;
                        copy.numPorts = 0;
                        copy.ip = '';
                        copy.manufacturerInDetail = "";
                        copy.modelInDetail = "";
                        copy.versionInDetail = "";
                        copy.routingMode = "Routind Mode";
                        copy.mmgtPort = 0;
                        copy.mac = '';
                        copy.rightArray = [];
                        copy.leftArray = [];
                        copy.bottomArray = (data.category === "FACTORY_DEVICE" && data.deviceType !== "子网") ? [{
                            portName: "p0",
                            portIp: ""
                        }] : [];
                        copy.subcategory = "NORMAL";
                        copy.statusColor = "red";

                        if (data.deviceType === "安全设备") {
                            copy.modeDescription = "";
                            copy.showMode = copy.modeDescription.length;
                            copy.statusText = "未激活";
                            copy.serialNumber = "";
                        }
                    }
                    if (!scope.topologyHasNode) {
                        scope.topologyHasNode = true;
                    }
                    return copy;
                }

                diagram.animationManager.isEnabled = false;
                diagram.toolManager.draggingTool.isGridSnapEnabled = true;
                diagram.toolManager.draggingTool.gridSnapCellSize = new go.Size(1, 1);
                diagram.toolManager.panningTool.isEnabled = false;
                diagram.toolManager.dragSelectingTool.isEnabled = false;
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
                diagram.addDiagramListener("ObjectSingleClicked", objectSingleClickHandler);


                scope.drawTopo = function (data) {
                    drawTopo(data);
                };

                scope.putDiagramData = function (data) {
                    putDiagramData(data);
                };

                function drawTopo(data) {
                    diagram.doMouseWheel = function () {
                        // Binds InputEvent.control to always true so mousewheel always zooms
                        this.lastInput.control = true;
                        diagram.toolManager.doMouseWheel();
                        //  Record scale in localStorage
                        localStorage.setItem('monitor:topology.scale.' + data.topologyId, diagram.scale);
                    };

                    putDiagramData(data);

                    $rootScope.$on('updateDashboardHeader', function () {
                        scope.render('update');
                        for (var i = 0; i < diagram.model.nodeDataArray.length; i++) {
                            diagram.model.nodeDataArray[i].currentTopology = !diagram.model.nodeDataArray[i].currentTopology;
                        }
                    });
                }

                ctrlDiagram.EnterEdit =
                    function EnterEdit(exit) {
                        if (exit) {
                            ctrlDiagram.EditMode = !ctrlDiagram.EditMode;
                            ctrlDiagram.lastSelection = false;
                            scope.render('update');
                            return;
                        }
                        diagram.startTransaction("Edit");
                        if (!ctrlDiagram.EditMode) {
                            for (var fa = 0; fa < diagram.model.linkDataArray.length; fa++) {
                                if (diagram.model.linkDataArray[fa].fromPort === 'unspecified') {
                                    diagram.model.setDataProperty(diagram.model.linkDataArray[fa], "fromPort", "foreGround");
                                }
                                if (diagram.model.linkDataArray[fa].toPort === 'unspecified') {
                                    diagram.model.setDataProperty(diagram.model.linkDataArray[fa], "toPort", "foreGround");
                                }
                            }
                            diagram.toolManager.dragSelectingTool.isEnabled = true;
                            diagram.model.isReadOnly = false;
                            ctrlDiagram.EditMode = true;
                            diagram.updateAllTargetBindings('nameInDetail');
                            diagram.updateAllTargetBindings('linkId');

                        } else {
                            for (var fb = 0; fb < diagram.model.linkDataArray.length; fb++) {
                                if (diagram.model.linkDataArray[fb].fromPort === 'foreGround') {
                                    diagram.model.setDataProperty(diagram.model.linkDataArray[fb], "fromPort", "unspecified");
                                }
                                if (diagram.model.linkDataArray[fb].toPort === 'foreGround') {
                                    diagram.model.setDataProperty(diagram.model.linkDataArray[fb], "toPort", "unspecified");
                                }
                            }
                            diagram.toolManager.dragSelectingTool.isEnabled = false;
                            diagram.toolManager.contextMenuTool.isEnabled = false;
                            diagram.model.isReadOnly = true;
                        }
                        diagram.commitTransaction("Edit");
                    };

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

                function putDiagramData(data) {
                    scope.drawing = true;
                    diagram.topologyId = data.topologyId;
                    function getConnectionPairs(allPorts, allDisconnectedPairs, currentPort) {
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
                    }

                    scope.routingIPS = false;

                    var nodeDataArray = [], cloudHolder = [];
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
                                    if (data.nodes[i].ports) {
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
                        var updateTimeDevice = data.updatedAt;
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

                        vm.nodeKeyMaping[(deviceMap[currDevice.deviceId].positionNodeId).toString()] = deviceCount.toString();

                        var deviceData = {
                            key: -deviceCount,
                            nodeId: deviceMap[currDevice.deviceId].positionNodeId,
                            topologyId: data.topologyId,
                            currentTopology: data.currentTopology,
                            deviceId: currDevice.deviceId,
                            img: (currDevice.category === "SECURITY_DEVICE") ?
                                ( (['kea-c200', 'kea-c400', 'ked-c400', 'kev-c200', 'kev-c400'].indexOf(($filter('deviceModel')(currDevice._model_name)).toLowerCase()) >= 0) ? 'images/devices/security/' + ($filter('deviceModel')(currDevice._model_name)).toLowerCase() + '-icon.png' : 'images/devices/security/' + Device.getIconName(currDevice.iconType) + '-icon.png')
                                : 'images/' + deviceMap[currDevice.deviceId].iconType.toLowerCase() + '-icon.png',
                            iconType: deviceMap[currDevice.deviceId].iconType,
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
                            deviceOnline: currDevice.deviceSource === 'DISCOVERY' ? currDevice.deviceOnline : 0,
                            deviceSource: currDevice.deviceSource,
                            updateTime: updateTimeDevice,
                            mac: macDevice,
                            ip: mmgtPortIPDevice,
                            ports: ( (deviceMap[currDevice.deviceId].iconType.toLowerCase() !== 'switch') ? currDevice.devicePorts : ""),
                            numPorts: currDevice.devicePorts.length,
                            rightArray: [],
                            leftArray: [],
                            nearArray: [],
                            farArray: [],
                            bottomArray: [],
                            category: currDevice.category,
                            subcategory: currDevice._subCategory,
                            nodeType: deviceMap[currDevice.deviceId].nodeType,
                            isEdited: false,
                            invalid: false,
                            startDatetime: currDevice.startDatetime
                        };
                        deviceMap[currDevice.deviceId].devicePorts = deviceData.ports;
                        // For IPS and IDS devices, they will have the side itemArrays of ports,
                        // populate the two arrays according to devicePorts and make crosslinks if IPS.
                        // For Factory devices have multiple ports,
                        // populate the bottom array according to devicePorts.
                        if (['ips', 'ids'].indexOf(deviceMap[currDevice.deviceId].nodeType.toLowerCase()) === -1) {
                            if (deviceData.category === 'FACTORY_DEVICE' && deviceData.iconType.toLowerCase() !== 'subnet') {
                                deviceData.portIdRef = false;
                                for (var dpps = 0; dpps < deviceData.ports.length; dpps++) {
                                    if (deviceData.ports[dpps].isMgmtPort) {
                                        deviceData.bottomArray.push({
                                            portName: deviceData.ports[dpps].portName,
                                            portIp: deviceData.ports[dpps].portIp
                                        });
                                    }
                                }
                            } else {
                                deviceData.portIdRef = true;
                            }
                        } else {
                            deviceData.portIdRef = false;
                            for (var dpp = 0; dpp < deviceData.ports.length; dpp++) {
                                if (!deviceData.ports[dpp].isMgmtPort) {
                                    if (Number(deviceData.ports[dpp].portName.substr(1)) % 2 === 0) {
                                        (deviceMap[currDevice.deviceId].nodeType.toLowerCase() === 'ips') ? deviceData.nearArray.push({portName: deviceData.ports[dpp].portName + "near"}) : '';
                                        deviceData.leftArray.push({portName: deviceData.ports[dpp].portName});
                                    } else {
                                        (deviceMap[currDevice.deviceId].nodeType.toLowerCase() === 'ips') ? deviceData.farArray.push({portName: deviceData.ports[dpp].portName + "far"}) : '';
                                        deviceData.rightArray.push({portName: deviceData.ports[dpp].portName});
                                    }
                                }
                            }
                            for (dpp = 0; dpp < deviceData.nearArray.length; dpp++) {
                                internalLinks.push(new linkTemp(-1, -deviceCount, -deviceCount, deviceData.nearArray[dpp].portName, deviceData.farArray[dpp].portName));
                            }
                        }

                        if (deviceData && deviceData.category === 'SECURITY_DEVICE') {
                            if (deviceData.deviceSource === 'DISCOVERY') {
                                if (deviceData.deviceOnline === 1) {
                                    deviceData.statusText = "连线";
                                    deviceData.statusIconShow = false;
                                    deviceData.statusColor = "green";
                                } else if (deviceData.deviceOnline === -1) {
                                    deviceData.statusText = "掉线";
                                    deviceData.statusIconShow = true;
                                    deviceData.statusColor = "red";
                                } else {
                                    deviceData.statusText = "未激活";
                                    deviceData.statusIconShow = true;
                                    deviceData.statusColor = "red";
                                }
                            } else {
                                deviceData.statusText = "未激活";
                                deviceData.statusIconShow = true;
                                deviceData.statusColor = "red";
                            }
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

                    var linkDataArray = [], linkCopy = {};
                    for (var j = 0; j < data.links.length; j++) {
                        var from = -deviceToKey[nodeToDevice[data.links[j].nodeID]];
                        var to = -deviceToKey[nodeToDevice[data.links[j].destinationNodeID]];
                        var fromPort = "unspecified", toPort = "unspecified";

                        if (deviceMap[nodeToDevice[data.links[j].nodeID]]) {
                            for (var nc = 0; nc < devicesNodeMap[nodeToDevice[data.links[j].nodeID]].length; nc++) {
                                if (devicesNodeMap[nodeToDevice[data.links[j].nodeID]][nc] === data.links[j].nodeID) {
                                    devicesNodeMap[nodeToDevice[data.links[j].nodeID]][nc] = -1;
                                    if (data.links[j].sourcePortName) {
                                        fromPort = data.links[j].sourcePortName;
                                    } else {
                                        fromPort = deviceMap[nodeToDevice[data.links[j].nodeID]].devicePorts[nc].portName.toLowerCase();
                                    }
                                    break;
                                }
                            }
                        }

                        if (deviceMap[nodeToDevice[data.links[j].destinationNodeID]]) {
                            for (var nb = 0; nb < devicesNodeMap[nodeToDevice[data.links[j].destinationNodeID]].length; nb++) {
                                if (devicesNodeMap[nodeToDevice[data.links[j].destinationNodeID]][nb] === data.links[j].destinationNodeID) {
                                    devicesNodeMap[nodeToDevice[data.links[j].destinationNodeID]][nb] = -1;
                                    if (data.links[j].destinationPortName) {
                                        toPort = data.links[j].destinationPortName;
                                    } else {
                                        toPort = deviceMap[nodeToDevice[data.links[j].destinationNodeID]].devicePorts[nb].portName.toLowerCase();
                                    }
                                    break;
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
                    diagram.model.copyNodeDataFunction = copyNodeData;
                    scope.drawing = false;

                    var newLinkDataArray = [];

                    function toggleSuggestedPosition(data) {
                        if (data.mostImprLink && data.mostImprLink.length > 0) {
                            var mifk = -nodeKeyMap(data.mostImprLink[0]);
                            var mitk = -nodeKeyMap(data.mostImprLink[1]);
                            for (var q = 0; q < newLinkDataArray.length; q++) {
                                if ((newLinkDataArray[q].from === mifk && newLinkDataArray[q].to === mitk) || (newLinkDataArray[q].from === mitk && newLinkDataArray[q].to === mifk)) {
                                    newLinkDataArray[q].suggestionPosition = !newLinkDataArray[q].suggestionPosition;
                                    diagram.model = new go.GraphLinksModel(nodeDataArray, newLinkDataArray);
                                }
                            }
                        }
                    }

                    if (vm.config.isInfsafety) {
                        $rootScope.$on('infsafetyResult', function (event, data) {
                            if (data === -1) {
                                newLinkDataArray = [];
                                diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
                            } else {
                                angular.copy(linkDataArray, newLinkDataArray);
                                Object.keys(data.pathSafty).forEach(function (key) {
                                    var linkColor;
                                    if (data.pathSafty[key] <= 60) {
                                        linkColor = '#ff6d28';
                                    } else if (data.pathSafty[key] >= 80) {
                                        linkColor = '#92d219';
                                    } else {
                                        linkColor = '#fff319';
                                    }
                                    key = key.substring(1, key.length - 1).split(/,\s+/);

                                    var fm = nodeKeyMap(key[0]);
                                    var to = nodeKeyMap(key[key.length - 1]);

                                    var linkTemp = {
                                        from: -fm,
                                        to: -to,
                                        color: linkColor,
                                        toArrow: "Standard",
                                        strokeWidth: "3",
                                        suggestionPosition: false,
                                        curve: go.Link.Bezier,
                                        curviness: 50
                                    };
                                    newLinkDataArray.push(linkTemp);
                                });

                                toggleSuggestedPosition(data);

                                diagram.model = new go.GraphLinksModel(nodeDataArray, newLinkDataArray);
                            }
                            diagram.model.linkFromPortIdProperty = "fromPort";
                            diagram.model.linkToPortIdProperty = "toPort";
                            diagram.toolManager.dragSelectingTool.isEnabled = false;
                            diagram.toolManager.contextMenuTool.isEnabled = false;
                            diagram.model.isReadOnly = true;
                        });
                    } else if (vm.config.isAttackPath) {
                        newLinkDataArray = angular.copy(linkDataArray, newLinkDataArray);
                        Attack.getAttackTarget(scope.currentPath.pathId).then(function (data) {
                            if (data.data.length > 1) {
                                for (var m = 1; m < data.data.length; m++) {
                                    var fm = nodeKeyMap(data.data[m - 1].selectedTarget);
                                    var to = nodeKeyMap(data.data[m].selectedTarget);
                                    var linkTempAttack = {
                                        from: -fm,
                                        to: -to,
                                        color: "red",
                                        toArrow: "Standard",
                                        strokeWidth: "3",
                                        suggestionPosition: false,
                                        curve: go.Link.Bezier,
                                        curviness: 50,
                                        targetOrder: data.data[m].targetOrder
                                    };
                                    newLinkDataArray.push(linkTempAttack);
                                }
                                for (var i = 0; i < data.data.length; i++) {
                                    for (var j = 0; j < nodeDataArray.length; j++) {
                                        if (-nodeKeyMap(data.data[i].selectedTarget) === nodeDataArray[j].key) {
                                            nodeDataArray[j].targetOrder = data.data[i].targetOrder;
                                        }
                                    }
                                }
                            }
                            diagram.model = new go.GraphLinksModel(nodeDataArray, newLinkDataArray);
                            diagram.model.linkFromPortIdProperty = "fromPort";
                            diagram.model.linkToPortIdProperty = "toPort";
                            diagram.toolManager.dragSelectingTool.isEnabled = false;
                            diagram.toolManager.contextMenuTool.isEnabled = false;
                            diagram.model.isReadOnly = true;
                        });
                    }

                    function nodeKeyMap(k) {
                        k = k.toString();
                        return vm.nodeKeyMaping[k.toString()] || k;
                    }

                    //If no security devices in valid topology file - just pick first ndoe of diagram
                    if (scope.topologyHasNode) {
                        firstSecurityDevice = (firstSecurityDevice === false) ? 0 : firstSecurityDevice;
                        (ctrlDiagram.lastSelection !== false && diagram.findNodeForKey(-deviceToKey[ctrlDiagram.lastSelection]) ) ? initializeACL(diagram.findNodeForKey(-deviceToKey[ctrlDiagram.lastSelection])) : initializeACL(diagram.findNodeForData(diagram.model.nodeDataArray[firstSecurityDevice]));

                    }
                    scope.oldData = [];
                    for (j = 0; j < diagram.model.nodeDataArray.length; j++) {
                        scope.validateDevice(diagram.model.nodeDataArray[j]);
                        var item = {
                            deviceId: diagram.model.nodeDataArray[j].deviceId,
                            serialNumber: diagram.model.nodeDataArray[j].serialNumber,
                            ip: diagram.model.nodeDataArray[j].ip
                        };
                        scope.oldData.push(item);
                    }
                }
            });
        }
    }
})();
