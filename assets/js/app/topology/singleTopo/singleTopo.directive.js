(function () {
    'use strict';

    angular
        .module('southWest.topology.singleTopo')
        .directive('topoEditorHeader', topoEditorHeader)
        .directive('topoDiagram', topoDiagram)
        .directive('allDevicesTable', allDevicesTable)
        .directive('topoPalette', topoPalette);

    //Palette directive - creates and populates item palette
    function topoPalette() {
        var topoPaletteObj = {
            require: '^topoDiagram',
            scope: false,
            restrict: 'E',
            templateUrl: '/templates/topology/singleTopo/topoPalette.html',
            link: link
        };
        return topoPaletteObj;

        function link(scope, el, attr, ctrl) {
            var $ = go.GraphObject.make;
            {
                var myPalette = $(go.Palette, "topoPaletteDiv");
                myPalette.maxSelectionCount = 1;
                myPalette.toolManager.dragSelectingTool.isEnabled = false;
                // the Palette's node template is different from the main Diagram's
                myPalette.nodeTemplate =
                    $(go.Node, "Auto", {selectionAdorned: false},
                        $(go.Shape, "RoundedRectangle", {
                                fill: null,
                                strokeWidth: 0,
                                stroke: null,
                                fromLinkable: true, toLinkable: true
                            },
                            new go.Binding("fill", "isSelected", function (sel) {
                                return sel ? ctrl.nodeSelectionBrush : null;
                            }).ofObject("")
                        ),
                        $(go.Panel,
                            "Vertical",
                            $(go.Panel, "Auto",
                                $(go.Shape, "RoundedRectangle", {
                                        width: 100,
                                        stroke: null,
                                        name: "TextBox"
                                    },
                                    new go.Binding("fill", "category", function (e) {
                                        return ctrl.getDeviceColor(e);
                                    })
                                ),
                                $(go.Panel, "Horizontal", {alignment: go.Spot.TopLeft},
                                    $(go.TextBlock, {
                                            width: 95,
                                            margin: new go.Margin(2, 0, 6, 0),
                                            stroke: ctrl.nodeTextBrush,
                                            isMultiline: true,
                                            font: ctrl.nodeTopFont,
                                            textAlign: "center",
                                            overflow: go.TextBlock.OverflowEllipsis,
                                            wrap: go.TextBlock.None,
                                            name: "TEXT"
                                        },
                                        new go.Binding("text", "deviceType")
                                    )
                                )
                            ),
                            $(go.Shape, "Rectangle", {
                                    width: 100,
                                    fill: ctrl.nodeBGBrush,
                                    stroke: null,
                                    height: 10,
                                    margin: new go.Margin(-10, 0, 0, 0),
                                }
                            ),
                            $(go.Panel, "Auto",
                                {margin: new go.Margin(-10, 0, 0, 0)},
                                $(go.Shape, "RoundedRectangle", {
                                        width: 100,
                                        fill: ctrl.nodeBGBrush,
                                        strokeWidth: 3,
                                        stroke: null
                                    }
                                ),
                                $(go.Panel, "Vertical",
                                    $(go.Panel, "Auto",
                                        $(go.Picture, {
                                                margin: new go.Margin(5, 0, 5, 0),
                                                width: 80,
                                                height: 65,
                                                imageStretch: go.GraphObject.Uniform,
                                            },
                                            new go.Binding("source", "img")
                                        )
                                    )
                                )
                            )
                        )
                    );
                myPalette.layout.sorting = go.GridLayout.Forward;
                // the list of data/items to show in the Palette
                myPalette.model.nodeDataArray = [
                    {img: "images/ips-icon.png", deviceType: "安全设备", category: "SECURITY_DEVICE", nId: "NotSet"},
                    {img: "images/switch-icon.png", deviceType: "网络交换机", category: "NETWORK_DEVICE", nId: "NotSet"},
                    {img: "images/router-icon.png", deviceType: "路由器", category: "NETWORK_DEVICE", nId: "NotSet"},
                    {img: "images/cloud-icon.png", deviceType: "Cloud", category: "NETWORK_DEVICE", nId: "NotSet"},
                    {img: "images/cnc-icon.png", deviceType: "高端数控机床", category: "FACTORY_DEVICE", nId: "NotSet"},
                    {img: "images/hmi-icon.png", deviceType: "HMI", category: "FACTORY_DEVICE", nId: "NotSet"},
                    {img: "images/workstation-icon.png", deviceType: "工作站", category: "FACTORY_DEVICE", nId: "NotSet"},
                    {img: "images/subnet-icon.png", deviceType: "子网", category: "FACTORY_DEVICE", nId: "NotSet"},
                    {
                        img: "images/opc_client-icon.png",
                        deviceType: "OPC 客户端",
                        category: "FACTORY_DEVICE",
                        nId: "NotSet"
                    },
                    {
                        img: "images/opc_server-icon.png",
                        deviceType: "OPC 服务器",
                        category: "FACTORY_DEVICE",
                        nId: "NotSet"
                    },
                    {img: "images/plc-icon.png", deviceType: "PLC", category: "FACTORY_DEVICE", nId: "NotSet"}
                ];
            }
        }

    }

    //Header above the topology canvas - is different for allInOne canvas in the keystone project
    function topoEditorHeader(Topology, $rootScope, $modal, domain, $log, topologyId) {
        return {
            scope: false,
            restrict: 'E',
            controller: controller,
            templateUrl: '/templates/topology/singleTopo/header.html',
            link: link
        };

        function controller($scope, $q, $state, System, FileUploader, URI) {
            var uploader = $scope.uploader = new FileUploader({
                url: URI + '/files/topology/' + topologyId.id + '/fileupload',
                autoUpload: true,
                queueLimit: 1,
                removeAfterUpload: true
            });

            uploader.onSuccessItem = function (item, response, status) {
                //$rootScope.$broadcast('updateDashboardHeader');
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
                $scope.topologyHasNode = true;
                $scope.render();
            };

            uploader.onErrorItem = function (item, response) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: response.error
                });
                if (uploader._directives.select.length && uploader._directives.select[0].element.length && uploader._directives.select[0].element[0].value) {
                    uploader._directives.select[0].element[0].value = '';
                }

                //uploader.remove();
                //uploader.cancelAll();
            };

        }

        function link(scope, el) {
            scope.topologyHasNode = topologyId.hasNode;

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
                    $rootScope.uploadTaskPromise = null;
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, FileUploader, URI, System, topologyId, $rootScope, $q) {
                    $scope.isDPIUpgrading = System.isDPIUpgrading();

                    var dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
                        $scope.isDPIUpgrading = System.isDPIUpgrading();
                    });
                    $scope.$on('destroy', function () {
                        dpiUpgradeStateHandler();
                    });

                    var uploader = $scope.uploader = new FileUploader({
                        url: URI + '/files/topology/' + topologyId.id + '/fileupload',
                        autoUpload: true,
                        removeAfterUpload: true,
                        queueLimit: 1
                    });
                    var deferred = $q.defer();
                    uploader.onSuccessItem = function (item, response, status) {
                        $rootScope.uploadTaskPromise = null;
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
                        $rootScope.uploadTaskPromise = deferred.promise;
                        $modalInstance.close();
                    };

                    uploader.onErrorItem = function (item, response) {
                        $rootScope.uploadTaskPromise = null;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: response.error
                        });
                    };

                    $scope.ok = function () {
                        $rootScope.uploadTaskPromise = null;
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        $rootScope.uploadTaskPromise = null;
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

    }

    function topoDiagram(Topology, $q, Incident, Device, $rootScope, $state, Enum, domain, topologyId, $filter, Signature, $modal, Dashboard, snVal, formatVal, Learning, SystemUser) {
        var topoDiagramObj = {
            scope: false,
            restrict: 'E',
            templateUrl: '/templates/topology/singleTopo/topoDiagram.html',
            controller: controller,
            controllerAs: 'topoCtrl',
            link: link
        };

        return topoDiagramObj;

        function controller($scope, $q, $state, System, deviceTypeService) {
            var x = 0;
            var y = 0;
            var linkDeferred = $q.defer();
            $scope.isDPIUpgrading = System.isDPIUpgrading();

            var vm = this;

            vm.simplifyModelName = deviceTypeService.simplifyModelName;
            vm.eventHandler = {};

            Signature.isMacNeeded().then(function (data) {
                $scope.needMac = data;
            });
            vm.eventHandler.dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
                $scope.isDPIUpgrading = System.isDPIUpgrading();
            });
            vm.isDefaultRole = Enum.get('Role');
            vm.checkAllDeviceAccess = function (userRole, devices) {
                if (userRole.status === 412) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '没有用户或用户组管理权限， 请联系系统管理员'
                    });
                    $state.transitionTo('monitor.overview');
                    return;
                }
                var ret = false;
                if (userRole && userRole.role.defaultRole) {
                    ret = true;
                } else {
                    var i = 0;
                    for (i = 0; i < devices.length; i++) {
                        var tmp = devices[i];
                        if (userRole.deviceIds.indexOf(tmp.deviceId) === -1) {
                            break;
                        }
                    }
                    if (i === devices.length) {
                        ret = true;
                    }
                }
                return ret;
            };

            vm.hasAllDeviceCtrl = vm.checkAllDeviceAccess($scope.userRole, $scope.devices);

            vm.isDefaultRole = vm.isDefaultRole && vm.isDefaultRole[0] ? vm.isDefaultRole[0].defaultRole : false;
            this.EditMode = false;
            // Style-related variables: colors, brushes, stroke...etc.
            this.linkPromise = linkDeferred.promise;
            this.gridPattern = {stroke: "#393939", strokeWidth: 0.8};
            this.nodeBGBrush = "#000";
            this.nodeSelectionBrush = "#76B900";
            this.nodeTopFillBrush = "#1C418F";
            this.nodeTextBrush = "#E4E4E4";
            this.nodeInvalidBrush = "#FF0000";
            this.nodeTopFont = "14px arial";
            this.tooltipFont = "13px arial";
            this.ipFont = "9px sans-serif"; // use default font to avoid clipping on canvas
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
            this.groupBodyBack = "#1D1D1D";
            this.groupHeadBack = "#CCCCCC";
            this.groupHeadStroke = "#1E1E1E";
            this.groupIcon = 'images/subnet-icon.png';
            this.badGroupAdd = "#631D1D";
            this.goodGroupAdd = "#1D441D";
            this.invalidDeviceList = [];
            this.selectedInvalidDevice = null;

            this.getDeviceColor = function (category) {
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

            this.setPosition = function (x, y) {
                $scope.optionsStyle.left = x + 65 + 'px';
                $scope.optionsStyle.top = y - 10 + 'px';
            };
            if (!$scope.topo) {
                $scope.topo = '';
            }

            $scope.downloadModal = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/topology/singleTopo/downloadModal.html',
                    size: 'sm',
                    controller: downloadModalCtrl,
                    resolve: {
                        currentTopo: function () {
                            return $scope.currentTopo;
                        }
                    }
                });

                function downloadModalCtrl($scope, $modalInstance, currentTopo) {
                    $scope.topoName = currentTopo.name === 'default拓扑图' ? '默认拓扑图' : currentTopo.name;

                    $scope.validateTopoFileName = function () {
                        var reg = '^[\u4e00-\u9fa5_a-zA-Z0-9\-\.]+$';
                        if ($scope.topoName.match(reg)) {
                            $scope.valid = true;
                        } else {
                            $scope.valid = false;
                        }
                    };
                    $scope.validateTopoFileName();
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.confirm = function () {
                        $modalInstance.close($scope.topoName);
                    };
                }

                modalInstance.result.then(function (data) {
                    if (data !== $scope.currentTopo.name) {
                        Topology.changeTopoName($scope.currentTopo.topologyId, data).then(function (data) {
                            $scope.currentTopo = data.data;
                            $scope.downloadTopo();
                        });
                    } else {
                        $scope.downloadTopo();
                    }
                });
            };

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
            });
            $scope.pv = $scope.pv && $scope.pv[0] ? $scope.pv[0].actionValue : 30;

            // Called everytime page refreshes. Get diagram info from MW and redraw canvas
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
                            promises.push(Device.getGroups());
                            $q.all(promises).then(function (results) {
                                topo.nodes = results[0].data;
                                topo.links = results[1].data;
                                topo.devices = results[2].data;
                                for (var index = 0; index < topo.devices.length; index++) {
                                    var splitName = topo.devices[index]._model_name ? topo.devices[index]._model_name.split(' /') : [];
                                    if (splitName[0] === "数控审计保护平台") {
                                        topo.devices[index]._model_name = $filter('resFilter')(splitName[0], 'slideAuditTitle') + ' /' + splitName[1];
                                    }
                                }
                                topo.groups = results[7].data;
                                (!results[3][0].model_name && results[3][0].make === 'N/A' && !results[3][0].model) ? topo.blankModel = results[3][0].modelId : '';
                                vm.factory_models = results[4];
                                vm.network_models = results[5];
                                vm.security_models = results[6];
                                $scope.topologyHasNode = topologyId.hasNode;
                                $scope.currentTopo = topo;
                                //Redraw canvas - first time or updating existing topology
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
            vm.eventHandler.portHandler = $rootScope.$on('port', function (event, data) {
                var targetDevice = $scope.currentTopo.devices.filter(function (d) {
                    return d.deviceId === data.deviceId;
                });
                if (targetDevice) {
                    var targetPort = targetDevice[0].devicePorts.filter(function (p) {
                        return p.portId === data.portId;
                    });
                    if (targetPort) {
                        targetPort[0].linkState = data.linkState;
                    } else {
                        console.log("Cannot find match port with portId");
                    }
                } else {
                    console.log("Cannot find match device with deviceId");
                }
            });

            $scope.render();

            $scope.$on('$destroy', function () {
                vm.eventHandler.dpiUpgradeStateHandler();
                vm.eventHandler.portHandler();
            });
        }

        function link(scope, el, attr, ctrlDiagram) {
            var deviceEventHandler;
            var updateDashboardHeaderEventHandler;

            var cloudNodeToRemove = [];

            // Formatting - prevents canvas body from exceeding viewport and removes unwanted overflow-scroll
            function findHeight() {
                //var height = document.getElementsByTagName("MAIN")[0].offsetHeight;
                //document.getElementById("singleTopoIndexDiv").style.height = height+"px";
                document.getElementById("topologySingle").style.height = ((window.innerHeight - 130 > 1000) ? 1000 : window.innerHeight - 130) + "px";
            }

            findHeight();
            // Calls to recalculate canvas size on zoom so canvas does not clip
            window.onresize = function () {
                ( document.getElementById("singleTopoIndexDiv")) ? findHeight() : '';
            };

            ctrlDiagram.linkPromise.then(function (id) {
                var $ = go.GraphObject.make;

                // Context menu - contains options for nodes, links, groups
                var nodeMenu =
                    $(go.Adornment, "Vertical",
                        $("ContextMenuButton",
                            $(go.TextBlock, {text: "新增分組", font: ctrlDiagram.nodeTopFont}), {
                                click: function (e) {
                                    var diagram = e.diagram;
                                    diagram.startTransaction('newGroup');
                                    if (diagram.selection.count > 0) {
                                        var cmdhnd = diagram.commandHandler;
                                        cmdhnd.groupSelection();
                                    }
                                    diagram.commitTransaction('newGroup');
                                }
                            },
                            new go.Binding("visible", "", function (a) {
                                return (['cloud'].indexOf(a.iconType) >= 0 || a.category === 'SECURITY_DEVICE' || a.group) ? false : ((a.isGroup) ? false : ((a.fromPort) ? false : true));
                            })
                        ),
                        $("ContextMenuButton",
                            $(go.TextBlock, {text: "删除分組", font: ctrlDiagram.nodeTopFont}), {
                                click: function (e) {
                                    var diagram = e.diagram;
                                    diagram.startTransaction('unGroup');
                                    var cmdhnd = diagram.commandHandler;
                                    cmdhnd.ungroupSelection();
                                    var selected = [];
                                    diagram.selection.each(function (node) {
                                        if (node instanceof go.Node) {
                                            selected.push(node);
                                        }
                                    });
                                    for (var i = 0; i < selected.length - 1; i++) {
                                        selected[i].isSelected = false;
                                    }
                                    // getFormData();
                                    diagram.commitTransaction('unGroup');
                                },
                                visible: false
                            },
                            new go.Binding("visible", "", function (a) {
                                return (a.isGroup) ? true : false;
                            })
                        ),
                        $("ContextMenuButton",
                            $(go.TextBlock, {font: ctrlDiagram.nodeTopFont}, {
                                    click: function () {
                                        removeObj();
                                    }
                                },
                                new go.Binding("text", "", function (f) {
                                    var linkFound = false, nodeFound = false;
                                    for (var it = diagram.selection.iterator; it.next();) {
                                        linkFound = (it.value instanceof go.Link && !it.value.data.isGroup) || linkFound;
                                        nodeFound = (it.value instanceof go.Node && !it.value.data.isGroup) || nodeFound;
                                        if (linkFound && nodeFound) {
                                            return '删除所选设备';
                                        }
                                    }
                                    return (f.fromPort) ? "删除连线" : "删除设备";
                                })
                            ),
                            new go.Binding("visible", "", function (a) {
                                return (a.isGroup || (a.category === 'SECURITY_DEVICE' && a.deviceOnline === 1)) ? false : true;
                            })
                        )
                    );

                // GoJs Diagram object for canvas
                var diagram =
                    $(go.Diagram, "topologySingle", {
                            initialContentAlignment: go.Spot.TopCenter, // Center Diagram contents
                            scale: (localStorage.getItem('monitor:topology.scale.' + id) === null ? 1 : parseFloat(localStorage.getItem('monitor:topology.scale.' + id))),
                            "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                            "commandHandler.archetypeGroupData": {isGroup: true, category: "OfNodes"},
                            // "undoManager.isEnabled": true,
                            allowDrop: true,
                            minScale: 0.1,
                            maxScale: 2,
                            maxSelectionCount: 1,
                            grid: $(go.Panel, "Grid", {gridCellSize: new go.Size(50, 50)},
                                $(go.Shape, "LineH", ctrlDiagram.gridPattern),
                                $(go.Shape, "LineV", ctrlDiagram.gridPattern)
                            )
                        }
                    );

                // GoJS Diagram options and fucntion overrides
                diagram.scrollMode = go.Diagram.InfiniteScroll;
                // Create a layer for security devices, which need to be rendered on top of other devices
                var foregroundLayer = diagram.findLayer("Foreground");
                diagram.addLayerBefore($(go.Layer, {name: "SecurityDeviceLayer", allowGroup: false}), foregroundLayer);
                // Create a layer for groups, which need to be rendered on top of the grid, but behind all the devices and connections
                var backgroundLayer = diagram.findLayer("Background");
                diagram.addLayerAfter($(go.Layer, {name: "GroupLayer"}), backgroundLayer);

                diagram.animationManager.isEnabled = false;

                diagram.toolManager.hoverDelay = 500;
                diagram.toolManager.contextMenuTool.isEnabled = false;
                diagram.toolManager.draggingTool.isGridSnapEnabled = true;
                diagram.toolManager.draggingTool.gridSnapCellSize = new go.Size(1, 1);
                diagram.toolManager.panningTool.isEnabled = false;
                diagram.toolManager.dragSelectingTool.isEnabled = false;
                diagram.toolManager.dragSelectingTool.isPartialInclusion = true;
                // linkValidation: limit number of linsk by ports available
                diagram.toolManager.linkingTool.linkValidation = linkNumber;
                diagram.toolManager.relinkingTool.linkValidation = linkNumber;
                diagram.commandHandler.canCopySelection = function () {
                    return false;
                };
                diagram.commandHandler.canPasteSelection = function () {
                    return false;
                };
                //Event Handlers
                diagram.addDiagramListener("SelectionMoved", selectionMovedHandler);
                diagram.addDiagramListener("ChangedSelection", changedSelectionHandler);
                diagram.addDiagramListener("ObjectSingleClicked", objectSingleClickHandler);
                diagram.addDiagramListener("SubGraphExpanded", subGraphHandler);
                diagram.addDiagramListener("SubGraphCollapsed", subGraphHandler);
                diagram.addChangedListener(function (e) {
                    if (e.mm === 'isSubGraphExpanded') {
                        diagram.updateAllTargetBindings('key');
                    }
                });
                //Custom look/layouts
                //Set how ports look during linking transaction
                var linkingTool = diagram.toolManager.linkingTool;
                linkingTool.temporaryFromPort.strokeWidth = 2;
                linkingTool.temporaryFromPort.stroke = ctrlDiagram.centerConnectorStroke;
                linkingTool.temporaryFromPort.figure = "Circle";
                linkingTool.temporaryFromPort.fill = ctrlDiagram.centerConnectorStroke;
                linkingTool.temporaryToPort.strokeWidth = 2;
                linkingTool.temporaryToPort.stroke = ctrlDiagram.centerConnectorStroke;
                linkingTool.temporaryToPort.figure = "Circle";
                linkingTool.temporaryToPort.fill = ctrlDiagram.centerConnectorStroke;
                // hide current tooltip when user starts drawing links
                linkingTool.doActivate = function () {
                    diagram.toolManager.hideToolTip();
                    go.LinkingTool.prototype.doActivate.call(linkingTool);
                };

                diagram.toolManager.dragSelectingTool.box =
                    $(go.Part, {layerName: "Tool"},
                        $(go.Shape, {name: "SHAPE", fill: "gray", opacity: 0.3, strokeWidth: 1})
                    );
                // Set how links look during linking transaction
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

                // Diagram ungrouping function overrides
                diagram.commandHandler.ungroupSelection = function () {
                    diagram.selection.each(function (node) {
                        if (node instanceof go.Node && node.data.groupId) {
                            deleteFromInvalidList(ctrlDiagram.invalidDeviceList, node.data);
                            diagram.groupRef.removed.push(node.data.groupId);
                            for (var x = 0; x < diagram.groupRef.edited.length; x++) {
                                if (diagram.groupRef.edited[x] === node.data.groupId) {
                                    diagram.groupRef.edited.splice(x, 1);
                                }
                            }
                        }
                    });
                    go.CommandHandler.prototype.ungroupSelection.call(this);
                    if (ctrlDiagram.invalidDeviceList.length === 0) {
                        ctrlDiagram.invalid = false;
                    }
                    pickADeviceToBeSelected();
                };

                // Diagram grouping function overrides
                diagram.commandHandler.groupSelection = function () {
                    go.CommandHandler.prototype.groupSelection.call(this);
                    diagram.selection.each(function (node) {
                        if (node instanceof go.Node) {
                            node.data.groupId = diagram.groupRef.obsolete.shift();
                            while (!node.data.groupId && diagram.groupRef[node.data.groupId = Math.floor((Math.random() * 100) + 1)]) {
                                null;
                            }
                            diagram.groupRef[node.data.groupId] = node.data.key;
                            (diagram.groupRef.edited.indexOf(node.data.groupId) === -1) ? diagram.groupRef.edited.push(node.data.groupId) : '';
                            snapShot(node);
                        }
                    });
                };

                // Diagram deletion override - calls custom function removeObj
                diagram.commandHandler.deleteSelection = function () {
                    removeObj();
                };

                // Diagram selectInRect function overrides  - For custom box Zoom
                diagram.toolManager.dragSelectingTool.selectInRect = function (r) {
                    diagram.clearSelection();
                    go.DragSelectingTool.prototype.selectInRect.call(this, r);
                    if (diagram.defaultCursor === "crosshair" && diagram.selection.count > 0) {
                        diagram.zoomToRect(diagram.computePartsBounds(diagram.selection));
                        var objectBounds = diagram.computePartsBounds(diagram.selection).width;
                        var calculated = diagram.viewportBounds.width * (1 - 600 / (document.getElementById('topologySingle').offsetWidth ));
                        if (diagram.scale > 1) {
                            diagram.scale = 1;
                        } else if (objectBounds > calculated) {
                            diagram.scale = diagram.scale * 0.7 - (300 / objectBounds);
                        }
                        diagram.centerRect(diagram.computePartsBounds(diagram.selection));
                    }
                    diagram.defaultCursor = "default";
                    diagram.toolManager.dragSelectingTool.box =
                        $(go.Part, {layerName: "Tool"},
                            $(go.Shape, {name: "SHAPE", fill: "gray", opacity: 0.3, strokeWidth: 1})
                        );
                };

                // Single click handler for canvas, unhighlghts all highlighted objects
                diagram.click = function () {
                    diagram.startTransaction("no highlighteds");
                    diagram.clearHighlighteds();
                    diagram.commitTransaction("no highlighteds");
                    scope.$digest();
                };

                // Any on canvas drop either from Palette or form group->diagram. Populates ACL table to show dropped device info
                diagram.mouseDrop = function (e) {
                    diagram.startTransaction("getNode");
                    diagram.selection.each(function (node) {
                        if (!(node instanceof go.Node) || diagram.selection.count > 1) {
                            return;
                        }
                        initializeACL(node);
                        finishDrop(e, null);
                        scope.$digest();
                    });
                    diagram.commitTransaction("getNode");
                };

                //Grouping Section Start
                // Upon a drop onto a Group, we try to add the selection as members of the Group.
                // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
                // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
                function finishDrop(e, grp) {
                    if (!ctrlDiagram.EditMode) {
                        return;
                    }
                    var group = true, ok;
                    if (grp) {
                        grp.diagram.selection.each(function (node) {
                            if (!(node instanceof go.Node)) {
                                return;
                            }
                            if (['SECURITY_DEVICE'].indexOf(node.data.category) >= 0 || node.data.nodeType === 'CLOUD' || node.data.isGroup) { //if(['SECURITY_DEVICE', 'NETWORK_DEVICE'].indexOf(node.data.category) >= 0 && node.data.nodeType != 'CLOUD'){
                                group = false;
                            }
                        });
                    }

                    (group) ?
                        ok = (grp !== null ) ?
                            grp.addMembers(grp.diagram.selection, true)
                            : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true)
                        : ok = false;
                    if (!ok) {
                        e.diagram.currentTool.doCancel();
                    }
                    if (grp) {
                        diagram.model.setDataProperty(grp.data, 'statusShade', '');
                    }
                    if (ok) {
                        (grp && (diagram.groupRef.edited.indexOf(grp.data.groupId) === -1) ) ? diagram.groupRef.edited.push(grp.data.groupId) : '';
                        (diagram.groupRef.leave && (diagram.groupRef.edited.indexOf(diagram.groupRef.leave) === -1) ) ? diagram.groupRef.edited.push(diagram.groupRef.leave) : '';
                        (grp) ? snapShot(grp) : '';
                        (diagram.groupRef.leave) ? snapShot(diagram.findNodeForKey(diagram.groupRef[diagram.groupRef.leave])) : '';
                        diagram.groupRef.leave = null;
                        scope.validateDevice(scope.selectedDeviceInTable);
                    }

                }

                // Creates group toolTip preview of Group contents

                ctrlDiagram.createSnap = function (node) {
                    if (node.group) {
                        snapShot(diagram.findNodeForKey(node.group));
                    }
                };
                function snapShot(grp) {
                    var parts;
                    if (!grp.isSubGraphExpanded) {
                        grp.expandSubGraph();
                        parts = grp.memberParts;
                    }
                    grp.data.preview = diagram.makeImage({
                        // size: new go.Size(350, 250),
                        parts: (parts) ? parts : grp.memberParts,
                    }).src;
                    (parts) ? grp.collapseSubGraph() : '';
                }


                // this function is used to highlight a Group that the selection may be dropped into
                function highlightGroup(e, grp, show) {
                    if (!grp) {
                        return;
                    }
                    e.handled = true;
                    if (show && ctrlDiagram.EditMode) {
                        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
                        // instead depend on the DraggingTool.draggedParts or .copiedParts
                        var tool = grp.diagram.toolManager.draggingTool;
                        var map = tool.draggedParts || tool.copiedParts;  // this is a Map
                        // now we can check to see if the Group will accept membership of the dragged Parts
                        // if (grp.canAddMembers(map.toKeySet())) {
                        var success = true;
                        map.each(function (node) {
                            if (node.key instanceof go.Node) {
                                if (['SECURITY_DEVICE'].indexOf(node.key.data.category) >= 0 || node.key.data.nodeType === 'CLOUD') { //if(['SECURITY_DEVICE', 'NETWORK_DEVICE'].indexOf(node.key.data.category) >= 0 && node.key.data.nodeType != 'CLOUD'){
                                    success = false;
                                }
                            }
                        });
                        (success) ? diagram.model.setDataProperty(grp.data, 'statusShade', 'good') : diagram.model.setDataProperty(grp.data, 'statusShade', 'bad');
                        return;
                        // }
                    }
                    diagram.model.setDataProperty(grp.data, 'statusShade', '');
                }

                // The group Template
                diagram.groupTemplate =
                    $(go.Group, go.Panel.Auto,
                        {
                            background: "transparent",
                            ungroupable: true,
                            groupable: false,
                            deletable: false,
                            computesBoundsIncludingLinks: false,
                            layerName: "GroupLayer",
                            contextMenu: nodeMenu,
                            computesBoundsAfterDrag: true,
                            selectionAdorned: false,
                            toolTip:  // define a tooltip for each node that displays the color as text
                                $(go.Adornment, "Auto", {stretch: go.GraphObject.Fill},
                                    $(go.Shape, "Rectangle", {isPanelMain: true, fill: "rgb(42, 43, 49)"}),
                                    $(go.Picture, {imageStretch: go.GraphObject.Uniform},
                                        new go.Binding("source", "preview"),
                                        new go.Binding("visible", "", function (a) {
                                            return !(diagram.findNodeForData(a).isSubGraphExpanded);
                                        })
                                    )
                                ),  // end of Adornment
                            mouseDragEnter: function (e, grp) {
                                highlightGroup(e, grp, true);
                            },
                            mouseDragLeave: function (e, grp) {
                                (!diagram.groupRef.leave ) ? diagram.groupRef.leave = grp.data.groupId : '';
                                highlightGroup(e, grp, false);
                            },
                            click: function () {
                                diagram.updateAllTargetBindings('key');
                            },
                            mouseDrop: function (e, node) {
                                finishDrop(e, node);
                            },
                            doubleClick: function (e, grp) {
                                (grp.isSubGraphExpanded) ? grp.collapseSubGraph() : grp.expandSubGraph();
                            }
                        },
                        $(go.Shape, "RoundedRectangle", {
                                fill: null,
                                strokeWidth: 0,
                                stroke: null,
                                portId: "unspecified"
                            },
                            new go.Binding("fill", "isSelected", function (sel) {
                                return sel ? ctrlDiagram.nodeSelectionBrush : null;
                            }).ofObject(""),
                            new go.Binding("stroke", "invalid", function (iv) {
                                return iv ? ctrlDiagram.nodeInvalidBrush : null;
                            }),
                            new go.Binding("strokeWidth", "invalid", function (iv) {
                                return iv ? 3 : 0;
                            })
                        ),
                        $(go.Panel, "Auto",
                            $(go.Shape, "RoundedRectangle", {strokeWidth: 1.5, stroke: ctrlDiagram.groupHeadBack},
                                new go.Binding("stroke", "isSelected", function (sel) {
                                    return sel ? ctrlDiagram.nodeSelectionBrush : ctrlDiagram.groupHeadBack;
                                }).ofObject(""),
                                new go.Binding("fill", "statusShade", function (h) {
                                    return (h === 'good') ? ctrlDiagram.goodGroupAdd : ((h === 'bad') ? ctrlDiagram.badGroupAdd : ctrlDiagram.groupBodyBack);
                                })
                            ),
                            $(go.Panel, "Vertical",
                                $(go.Shape, "RoundedRectangle", {
                                        fill: ctrlDiagram.groupHeadBack,
                                        stroke: null,
                                        name: "TextBox",
                                        height: 26,
                                        stretch: go.GraphObject.Horizontal,
                                    }
                                ),
                                $(go.Panel, go.Panel.Horizontal, {
                                        margin: new go.Margin(-30, 10, 0, 0),
                                        padding: 0,
                                        alignment: go.Spot.Left
                                    }, // button next to TextBlock
                                    $("SubGraphExpanderButton", {
                                        alignment: go.Spot.Right,
                                        margin: new go.Margin(8, 5, 10, 5)
                                    }),
                                    $(go.TextBlock,
                                        {
                                            alignment: go.Spot.Left,
                                            isMultiline: false,
                                            font: ctrlDiagram.nodeTopFont,
                                            stroke: ctrlDiagram.groupHeadStroke,
                                        },
                                        new go.Binding("text", "nameInDetail").makeTwoWay())
                                ),
                                $(go.Shape, "Rectangle", {
                                        fill: ctrlDiagram.groupBodyBack,
                                        stroke: null,
                                        height: 10,
                                        margin: new go.Margin(-7, 0, 0, 0),
                                        stretch: go.GraphObject.Horizontal,
                                    },
                                    new go.Binding("fill", "statusShade", function (h) {
                                        return (h === 'good') ? ctrlDiagram.goodGroupAdd : ((h === 'bad') ? ctrlDiagram.badGroupAdd : ctrlDiagram.groupBodyBack);
                                    })
                                ),
                                $(go.Panel, "Auto", {margin: new go.Margin(-10, 0, 0, 0), alignment: go.Spot.Center},
                                    $(go.Shape, "RoundedRectangle", {
                                            margin: new go.Margin(-9, 0, 0, 0),
                                            fill: null,
                                            stroke: null,
                                        }
                                    ),
                                    $(go.Picture, {
                                            margin: new go.Margin(5),
                                            source: ctrlDiagram.groupIcon,
                                            width: 80,
                                            height: 65,
                                            imageStretch: go.GraphObject.Uniform,
                                        },
                                        new go.Binding("visible", "key", function (n) {
                                            return (diagram.findNodeForKey(n).isSubGraphExpanded) ? false : true;
                                        })
                                    ),
                                    $(go.Placeholder, {
                                            background: null,
                                            padding: 15,
                                        }
                                    )
                                )
                            )
                        )
                    );  // end Group and call to add to template Map
                //Grouping Section End

                //Diagram node/item Template - provide custom Node appearance
                diagram.nodeTemplate =
                    $(go.Node, "Spot", {
                            margin: 50,
                            name: "NODE",
                            selectionAdorned: false,
                            contextMenu: nodeMenu
                        },
                        new go.Binding("location", "loc", go.Point.parse),
                        new go.Binding("groupable", "", function (e) {
                            return (['ips', 'cloud'].indexOf(e.iconType) === -1 && !e.group) ? true : false;
                        }),
                        new go.Binding("layerName", "category", function (c) {
                            return c === "SECURITY_DEVICE" ? "SecurityDeviceLayer" : "";
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
                                                    font: ctrlDiagram.tooltipFont
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
                                                    font: ctrlDiagram.tooltipFont
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
                                                    font: ctrlDiagram.tooltipFont
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
                                                    font: ctrlDiagram.tooltipFont
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
                            // Main Body - split into three sub-parts
                            $(go.Panel, "Auto", {row: 1, column: 1, name: "BODY"},
                                $(go.Shape, "RoundedRectangle", {
                                        fill: null,
                                        strokeWidth: 0,
                                        stroke: null,
                                        portId: "unspecified"
                                    },
                                    new go.Binding("fill", "isSelected", function (sel) {
                                        return sel ? ctrlDiagram.nodeSelectionBrush : null;
                                    }).ofObject(""),
                                    new go.Binding("stroke", "invalid", function (iv) {
                                        return iv ? ctrlDiagram.nodeInvalidBrush : null;
                                    }),
                                    new go.Binding("strokeWidth", "invalid", function (iv) {
                                        return iv ? 3 : 0;
                                    })
                                ),
                                // First Part, Banner (Device Name, and banner color differentiated by device.category)
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
                                // Second Part, Rectangle placer (to get straight square bottom edge of banner, since entire object needs to be Rounded rectangle)
                                $(go.Shape, "Rectangle", {
                                        alignment: go.Spot.Top,
                                        width: 100,
                                        fill: ctrlDiagram.nodeBGBrush,
                                        stroke: null,
                                        height: 10,
                                        margin: new go.Margin(20, 0, 0, 0)
                                    }
                                ),
                                // Third Part, Body (holds images and shows device IP if applicable)
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
                            // the Panel holding mimic of left port elements, so paired ports can show a linking between without compromising actual links between nodes (only used for nodeTypes =IPS)
                            // sits behind actaul Panel holding the ports
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
                            // the Panel holding mimic of right port elements, so paired ports can show a linking between without compromising actual links between nodes (only used for nodeTypes =IPS)
                            // sits behind actaul Panel holding the ports
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
                            // the Panel holding the right port elements, which are themselves Panels (only for nodeTypes = IDS or IPS)
                            $(go.Panel, "Vertical",
                                new go.Binding("itemArray", "rightArray"),
                                {
                                    row: 1, column: 2,
                                    itemTemplate: $(go.Panel,
                                        {
                                            mouseEnter: function (e, node) {
                                                var array = (Number(node.data.portName[1]) % 2 === 1) ? "rightArray" : "leftArray";
                                                for (var count = 0; count < node.part.data[array].length; count++) {
                                                    if (node.part.data[array][count].portName === node.data.portName) {
                                                        node.part.data[array][count].portColor = ctrlDiagram.centerConnectorStroke;
                                                        (node.part.data.nodeType === 'IPS') ? node.part.data[(Number(node.data.portName[1]) % 2 === 1) ? "leftArray" : "rightArray"][count].portColor = ctrlDiagram.centerConnectorStroke : '';
                                                        break;
                                                    }
                                                }
                                                diagram.updateAllTargetBindings("portColor");
                                            },
                                            mouseLeave: function (e, node) {
                                                var array = (Number(node.data.portName[1]) % 2 === 1) ? "rightArray" : "leftArray";
                                                for (var count = 0; count < node.part.data[array].length; count++) {
                                                    if (node.part.data[array][count].portName === node.data.portName) {
                                                        node.part.data[array][count].portColor = ctrlDiagram.connectorBrush;
                                                        (node.part.data.nodeType === 'IPS') ? node.part.data[(Number(node.data.portName[1]) % 2 === 1) ? "leftArray" : "rightArray"][count].portColor = ctrlDiagram.connectorBrush : '';
                                                        break;
                                                    }
                                                }
                                                diagram.updateAllTargetBindings("portColor");
                                            },
                                            fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
                                            fromLinkable: true, toLinkable: true, cursor: "pointer"
                                        },
                                        new go.Binding("portId", "portName"),
                                        $(go.Shape, "Rectangle", {
                                                desiredSize: new go.Size(8, 8),
                                                margin: new go.Margin(1, 0),
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
                                                        )
                                                    )
                                                )
                                        }
                                    )  // end itemTemplate
                                }
                            ),  // end Vertical Panel
                            // the Panel holding the left port elements, which are themselves Panels (only for nodeTypes = IDS or IPS)
                            $(go.Panel, "Vertical",
                                new go.Binding("itemArray", "leftArray"),
                                {
                                    row: 1, column: 0,
                                    itemTemplate: $(go.Panel,
                                        {
                                            mouseEnter: function (e, node) {
                                                var array = (Number(node.data.portName[1]) % 2 === 1) ? "rightArray" : "leftArray";
                                                for (var count = 0; count < node.part.data[array].length; count++) {
                                                    if (node.part.data[array][count].portName === node.data.portName) {
                                                        node.part.data[array][count].portColor = ctrlDiagram.centerConnectorStroke;
                                                        (node.part.data.nodeType === 'IPS') ? node.part.data[(Number(node.data.portName[1]) % 2 === 1) ? "leftArray" : "rightArray"][count].portColor = ctrlDiagram.centerConnectorStroke : '';
                                                        break;
                                                    }
                                                }
                                                diagram.updateAllTargetBindings("portColor");
                                            },
                                            mouseLeave: function (e, node) {
                                                var array = (Number(node.data.portName[1]) % 2 === 1) ? "rightArray" : "leftArray";
                                                for (var count = 0; count < node.part.data[array].length; count++) {
                                                    if (node.part.data[array][count].portName === node.data.portName) {
                                                        node.part.data[array][count].portColor = ctrlDiagram.connectorBrush;
                                                        (node.part.data.nodeType === 'IPS') ? node.part.data[(Number(node.data.portName[1]) % 2 === 1) ? "leftArray" : "rightArray"][count].portColor = ctrlDiagram.connectorBrush : '';
                                                        break;
                                                    }
                                                }
                                                diagram.updateAllTargetBindings("portColor");
                                            },
                                            fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                                            fromLinkable: true, toLinkable: true, cursor: "pointer"
                                        },
                                        new go.Binding("portId", "portName"),
                                        $(go.Shape, "Rectangle", {
                                                desiredSize: new go.Size(8, 8),
                                                margin: new go.Margin(1, 0),
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
                                                margin: new go.Margin(0, 1)
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
                            )
                        )
                    );

                // Template for links
                diagram.linkTemplate =
                    $(go.Link, {
                            curve: go.Link.JumpOver,
                            routing: go.Link.AvoidsNodes,
                            corner: 5,
                            contextMenu: nodeMenu,
                            relinkableFrom: true,
                            relinkableTo: true
                        },
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

                // Function called on delete of any canvas object either by key shortcut or context menu
                function removeObj() {
                    // If a security device has ever been activated, it cannot be deleted
                    var onlineSecurityDevices = [];
                    diagram.selection.each(function (object) {
                        if (object instanceof go.Node && !object.data.isGroup && object.data.deviceId && object.data.category === 'SECURITY_DEVICE' && object.data.deviceOnline === 1) {
                            onlineSecurityDevices.push(object.data);
                        }
                    });
                    if (onlineSecurityDevices.length > 0) {
                        ctrlDiagram.cannotDelete(onlineSecurityDevices);
                        return;
                    }
                    diagram.startTransaction("removePortFinal");
                    var remove = [], confirmNode = [];
                    diagram.selection.each(function (object) {
                        if ((object instanceof go.Link || object instanceof go.Node) && !object.data.isGroup) {
                            (object.data.deviceId && object instanceof go.Node) ? confirmNode.push(object) : remove.push(object);
                        }
                    });
                    if (confirmNode.length === 0) {
                        for (var ie = 0; ie < remove.length; ie++) {
                            diagram.remove(remove[ie]);
                            deleteFromInvalidList(ctrlDiagram.invalidDeviceList, remove[ie].data);
                        }
                        if (ctrlDiagram.invalidDeviceList.length === 0) {
                            ctrlDiagram.invalid = false;
                        }
                        pickADeviceToBeSelected();
                    } else {
                        (confirmNode.length > 0) ? ctrlDiagram.deleteDevice(confirmNode, remove) : '';
                    }
                    diagram.commitTransaction("removePortFinal");
                }

                // custom mouse down to make panning tool right mosue click versus left
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

                document.getElementById("topologySingle").oncontextmenu =
                    function modelContextMenu(e) {
                        e.stopPropagation();
                    };

                // custom key down to check for CTRL key press to implemnent custom box zoom (dragSelectingTool override)
                document.getElementById("topologySingle").onkeydown =
                    function modelKeyDown(e) {
                        if (e.ctrlKey && ctrlDiagram.EditMode) {
                            diagram.defaultCursor = "crosshair";
                            diagram.toolManager.dragSelectingTool.box =
                                $(go.Part, {layerName: "Tool"},
                                    $(go.Shape, {
                                        name: "SHAPE",
                                        fill: "orange",
                                        opacity: 0.3,
                                        strokeWidth: 2,
                                        stroke: "orange"
                                    })
                                );
                        }
                    };

                document.getElementById("topologySingle").onkeyup =
                    function modelKeyUp(e) {
                        if (!e.ctrlKey) {
                            diagram.defaultCursor = "default";
                            diagram.toolManager.dragSelectingTool.box =
                                $(go.Part, {layerName: "Tool"},
                                    $(go.Shape, {name: "SHAPE", fill: "gray", opacity: 0.3, strokeWidth: 1})
                                );
                        }
                    };

                // Put in for b/c of inifinte scroll disables document zoom
                document.getElementById("topologySingle").onmouseover = function () {
                    ctrlDiagram.over = true;
                };
                document.getElementById("topologySingle").onmouseleave = function () {
                    ctrlDiagram.over = false;
                };

                // Whenever a node object is moved, save and push its new position to MW
                function selectionMovedHandler(e) {
                    // pv is pivilage, when it over and equal 4, user can edit
                    if ((scope.pv & 4) > 0) {
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

                // Whenever a canvas item is selected (singleClicked, boxSelected, dragged, etc) fires to check highlight new selection and updates ACL table if single object select
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

                    if (scope.selectedDeviceInTable) {
                        var save = (scope.selectedDeviceInTable.deviceId) ? true : false;
                        for (var count = 0; count < selected.length; count++) {
                            if (selected[count].key === scope.selectedDeviceInTable.key) {
                                save = false;
                            }
                        }
                        if (save) {
                            if (scope.selectedDeviceInTable && scope.selectedDeviceInTable.isEdited && !scope.selectedDeviceInTable.invalid) {
                                saveEditedDevice(scope.selectedDeviceInTable);
                            }
                        }
                    }
                    // If single Item - set selected as next selctedDeviceInTable device which populates ACL table
                    if (selected.length === 1) {
                        setSelectedDeviceInTable(selected[0]);
                        (selected[0].category === "SECURITY_DEVICE") ? scope.populateModeOptions(scope.selectedDeviceInTable.subcategory, scope.selectedDeviceInTable.modelInDetail) : scope.populateModelOptions(scope.selectedDeviceInTable.category);
                        ctrlDiagram.lastSelection = selected[0].key;
                    }
                    diagram.commitTransaction("highlight");
                }

                // Handler whenever a group is expanded or collapsed. Keep track of group edition
                function subGraphHandler(grp) {
                    diagram.startTransaction("highlight");
                    (diagram.groupRef.edited.indexOf(grp.subject.q[0].data.groupId) === -1) ? diagram.groupRef.edited.push(grp.subject.q[0].data.groupId) : '';
                    diagram.commitTransaction("highlight");
                }

                // SECURITY_DEVICE's have different formats,  when model changes reformats the canvas item to have the proper format
                ctrlDiagram.newModel =
                    function newModel(modelName) {
                        var cases = {
                            "KEV-U1600": {portNum: 16},
                            "KEV-U800": {portNum: 8},
                            "KEV-C400": {portNum: 4},
                            "KEV-C200": {portNum: 2},
                            "KEC-U1000": {portNum: 4},
                            "KEA-U2000": {portNum: 2},
                            "KEA-U1000E": {portNum: 5},
                            "KEA-U1000": {portNum: 2},
                            "KEA-U1142": {portNum: 6},
                            "KEA-C400": {portNum: 4},
                            "KEA-C200": {portNum: 2},
                            "KED-U1600": {portNum: 16},
                            "KED-U800": {portNum: 8},
                            "KED-C400": {portNum: 4},
                            "KED-C200": {portNum: 2},
                        }; //KEV or KED is IPS
                        if (scope.selectedDeviceInTable.category !== 'SECURITY_DEVICE') {
                            return;
                        }

                        function newPort(name, isMgmt) {
                            this._subnets = Array[0],
                                this.deployedRulesNumber = 0,
                                this.deviceId = scope.selectedDeviceInTable.deviceId,
                                this.protectedDevicesNumber = 0,
                                this.status = 0,
                                this.linkState = 0,
                                this.isMgmtPort = isMgmt,
                                this.portName = name,
                                this.mac = "",
                                this.portIp = (isMgmt) ? scope.selectedDeviceInTable.ip : "";
                        }

                        if (scope.selectedDeviceInTable.nodeType !== "ROUTING_IPS") {
                            scope.populateModeOptions(scope.selectedDeviceInTable.subcategory, scope.selectedDeviceInTable.modelInDetail);
                            scope.selectedDeviceInTable.modeDescription = scope.forms.modes[0]['modename'];
                            scope.selectedDeviceInTable.nodeType = scope.forms.modes[0].mode;
                            if (scope.selectedDeviceInTable.modeDescription === '数采隔离') {
                                scope.selectedDeviceInTable.subCategory = 'DATA_COLLECTION_DEVICE';
                            } else {
                                scope.selectedDeviceInTable.subCategory = 'NORMAL';
                            }
                        }

                        var rArray = [], lArray = [], nArray = [], fArray = [], counter = 0, currentPortIdRef;
                        scope.selectedDeviceInTable.ports = [];
                        if (cases[modelName]) {
                            currentPortIdRef = scope.selectedDeviceInTable.nodeType === "ROUTING_IPS";
                            //populate actual devicePorts (fills the four itmeArrays in the nodeTemplate)
                            for (var pn = 0; pn <= cases[modelName].portNum; pn++) {
                                if (pn !== cases[modelName].portNum) {
                                    scope.selectedDeviceInTable.ports.push(new newPort(("p" + pn), false));
                                    (!currentPortIdRef) ? ((pn % 2 === 0) ? lArray.push({portName: scope.selectedDeviceInTable.ports[pn].portName}) : rArray.push({portName: scope.selectedDeviceInTable.ports[pn].portName})) : "";
                                    ( scope.selectedDeviceInTable.nodeType === "IPS") ? ((pn % 2 === 0) ? nArray.push({portName: scope.selectedDeviceInTable.ports[pn].portName + 'near'}) : fArray.push({portName: scope.selectedDeviceInTable.ports[pn].portName + 'far'})) : "";
                                } else {
                                    scope.selectedDeviceInTable.ports.push(new newPort("mgmt", true));
                                }
                            }

                            var newLinks = [], del = [];
                            // Relinks previously connected links to the newly created ports (delete middle/intermediate links if changing from IPS to other types)
                            for (pn = 0; pn < diagram.model.linkDataArray.length; pn++) {
                                if (diagram.model.linkDataArray[pn].linkId !== -1) {
                                    if (scope.selectedDeviceInTable.portIdRef === false) {
                                        if ((!currentPortIdRef && scope.selectedDeviceInTable.nodeType !== "ROUTING_IPS") && (diagram.model.linkDataArray[pn].from === scope.selectedDeviceInTable.key || diagram.model.linkDataArray[pn].to === scope.selectedDeviceInTable.key )) {
                                            newLinks.push(new linkTemp(diagram.model.linkDataArray[pn].linkId, diagram.model.linkDataArray[pn].from, diagram.model.linkDataArray[pn].to, diagram.model.linkDataArray[pn].fromPort, diagram.model.linkDataArray[pn].toPort));
                                        } else if (currentPortIdRef) {
                                            if (diagram.model.linkDataArray[pn].from === scope.selectedDeviceInTable.key) {
                                                newLinks.push(new linkTemp(diagram.model.linkDataArray[pn].linkId, diagram.model.linkDataArray[pn].from, diagram.model.linkDataArray[pn].to, "foreGround", diagram.model.linkDataArray[pn].toPort));
                                            }
                                            if (diagram.model.linkDataArray[pn].to === scope.selectedDeviceInTable.key) {
                                                newLinks.push(new linkTemp(diagram.model.linkDataArray[pn].linkId, diagram.model.linkDataArray[pn].from, diagram.model.linkDataArray[pn].to, diagram.model.linkDataArray[pn].fromPort, "foreGround"));
                                            }
                                        }
                                    } else {
                                        if (diagram.model.linkDataArray[pn].from === scope.selectedDeviceInTable.key || diagram.model.linkDataArray[pn].to === scope.selectedDeviceInTable.key) {
                                            if (currentPortIdRef) {
                                                newLinks.push(new linkTemp(diagram.model.linkDataArray[pn].linkId, diagram.model.linkDataArray[pn].from, diagram.model.linkDataArray[pn].to, diagram.model.linkDataArray[pn].fromPort, diagram.model.linkDataArray[pn].toPort));
                                            } else {
                                                newLinks.push(new linkTemp(diagram.model.linkDataArray[pn].linkId, diagram.model.linkDataArray[pn].from, diagram.model.linkDataArray[pn].to, (diagram.model.linkDataArray[pn].from === scope.selectedDeviceInTable.key) ? "p" + counter : diagram.model.linkDataArray[pn].toPort, (diagram.model.linkDataArray[pn].to === scope.selectedDeviceInTable.key) ? "p" + counter : diagram.model.linkDataArray[pn].toPort));
                                                counter++;
                                            }
                                            del.push(diagram.model.linkDataArray[pn]);
                                        }
                                    }
                                }
                            }
                            // Update diagram properties
                            diagram.model.setDataProperty(scope.selectedDeviceInTable, "leftArray", lArray);
                            diagram.model.setDataProperty(scope.selectedDeviceInTable, "rightArray", rArray);
                            diagram.model.setDataProperty(scope.selectedDeviceInTable, "portIdRef", currentPortIdRef);
                            diagram.model.setDataProperty(scope.selectedDeviceInTable, "numPorts", scope.selectedDeviceInTable.ports.length);
                            diagram.model.setDataProperty(scope.selectedDeviceInTable, "nearArray", nArray);
                            diagram.model.setDataProperty(scope.selectedDeviceInTable, "farArray", fArray);
                            for (pn = 0; pn < del.length; pn++) {
                                diagram.model.removeLinkData(del[pn]);
                            }
                            for (pn = 0; pn < newLinks.length; pn++) {
                                diagram.model.addLinkData(newLinks[pn]);
                            }
                            for (pn = 0; pn < nArray.length; pn++) {
                                diagram.model.addLinkData(new linkTemp(-1, scope.selectedDeviceInTable.key, scope.selectedDeviceInTable.key, nArray[pn].portName, fArray[pn].portName));
                            }
                        }
                    };

                // Populate the ACL table when ther isn't an actual singleObjectClick
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

                //  Keeps track of what fields are edited to increase saving efficiency when save button hit. Also updates realtime canvas visible variables
                ctrlDiagram.saveData =
                    function saveData(area) {
                        diagram.updateAllTargetBindings('nameInDetail');
                        diagram.updateAllTargetBindings('key');
                        if (ctrlDiagram.EditMode) {
                            if (!scope.selectedDeviceInTable.isEdited) {
                                diagram.model.setDataProperty(scope.selectedDeviceInTable, "isEdited", [area]);
                            } else {
                                ((scope.selectedDeviceInTable.isEdited).indexOf(area) === -1) ?
                                    diagram.model.insertArrayItem(scope.selectedDeviceInTable.isEdited, -1, area) : '';
                            }
                        }
                    };

                // Specific save for groupName edit. Sets the group as edited so that groupEditedSave will retain name change
                ctrlDiagram.groupNameEdit =
                    function groupNameEdit() {
                        diagram.updateAllTargetBindings('nameInDetail');
                        diagram.groupRef.edited.push(scope.selectedDeviceInTable.groupId);
                    };

                // Dynamic Sort
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

                // Set the selectedDevinceInTable to populate ACL table on right
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

                // Canvas item single click handler, mostly just shows populated ACL table
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

                // Device Validation - ensures proper IP, Mac, serialNumber, duplicates etc
                scope.forms = {};
                scope.forms.netMasks = angular.copy(formatVal.getNetMasks());
                scope.validateIp = angular.copy(formatVal.getIPReg());
                scope.validateMac = angular.copy(formatVal.getMACReg());

                scope.validateDevice = function (selectedDeviceInTable) {
                    selectedDeviceInTable.hasDuplicateSN = false;
                    selectedDeviceInTable.invalidIp = false;
                    selectedDeviceInTable.invalidMac = false;
                    selectedDeviceInTable.invalidNetMask = false;
                    selectedDeviceInTable.hasDuplicateIP = false;
                    selectedDeviceInTable.hasDuplicateMAC = false;
                    selectedDeviceInTable.invalidRange = false;
                    selectedDeviceInTable.nameError = (!selectedDeviceInTable.nameInDetail || selectedDeviceInTable.nameInDetail.length === 0);
                    if (selectedDeviceInTable.iconType.toLowerCase() !== 'subnet') {
                        selectedDeviceInTable.modelError = (!selectedDeviceInTable.modelId || selectedDeviceInTable.modelId.length === 0);
                    }

                    var allIPList = [], allMACList = [], allDeviceList = [];
                    for (var i in diagram.model.nodeDataArray) {
                        if (i) {
                            var device = diagram.model.nodeDataArray[i];
                            if (device.ports) {
                                device.devicePorts = device.ports;
                                allDeviceList.push(device);
                            }
                            if (selectedDeviceInTable.key !== device.key && device.serialNumber && selectedDeviceInTable.serialNumber === device.serialNumber) {
                                selectedDeviceInTable.hasDuplicateSN = true;
                            }
                            if (device.iconType.toLowerCase() === 'subnet') {
                                if (device.subnetIp) {
                                    allIPList.push(device.subnetIp.split('/')[0]);
                                }
                            } else if (device.category !== 'FACTORY_DEVICE') {
                                if (device.ip) {
                                    allIPList.push(device.ip);
                                }
                                if (device.mac) {
                                    allMACList.push(device.mac);
                                }
                            } else {
                                if (device.ports) {
                                    for (var j = 0; j < device.ports.length; j++) {
                                        if (device.ports[j].isMgmtPort) {
                                            if (device.ports[j].portIp) {
                                                allIPList.push(device.ports[j].portIp);
                                            }
                                            if (device.ports[j].mac) {
                                                allMACList.push(device.ports[j].mac);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (selectedDeviceInTable.category === 'SECURITY_DEVICE') {
                        selectedDeviceInTable.serialError = (!selectedDeviceInTable.serialNumber || selectedDeviceInTable.serialNumber.length === 0);
                        selectedDeviceInTable.serialFormatError = !snVal.validSNFormat(selectedDeviceInTable.serialNumber);
                        selectedDeviceInTable.invalidIp = !selectedDeviceInTable.ip || formatVal.validateIp(selectedDeviceInTable.ip);
                        selectedDeviceInTable.invalidMac = selectedDeviceInTable.mac && !(selectedDeviceInTable.mac.match(scope.validateMac));
                        if (!selectedDeviceInTable.invalidIp) {
                            selectedDeviceInTable.hasDuplicateIP = scope.checkDuplicate(selectedDeviceInTable.ip, allIPList);
                            selectedDeviceInTable.invalidRange = formatVal.checkIpInSubnet(selectedDeviceInTable.ip, allDeviceList);
                        }
                        if (!selectedDeviceInTable.invalidMac) {
                            selectedDeviceInTable.hasDuplicateMAC = scope.checkDuplicate(selectedDeviceInTable.mac, allMACList, true);
                        }
                    } else if (selectedDeviceInTable.category === 'NETWORK_DEVICE') {
                        selectedDeviceInTable.invalidIp = selectedDeviceInTable.ip && formatVal.validateIp(selectedDeviceInTable.ip);
                        selectedDeviceInTable.invalidMac = selectedDeviceInTable.mac && !(selectedDeviceInTable.mac.match(scope.validateMac));
                        if (!selectedDeviceInTable.invalidIp) {
                            selectedDeviceInTable.hasDuplicateIP = scope.checkDuplicate(selectedDeviceInTable.ip, allIPList);
                            selectedDeviceInTable.invalidRange = formatVal.checkIpInSubnet(selectedDeviceInTable.ip, allDeviceList);
                        }
                        if (!selectedDeviceInTable.invalidMac) {
                            selectedDeviceInTable.hasDuplicateMAC = scope.checkDuplicate(selectedDeviceInTable.mac, allMACList, true);
                        }
                    } else if (selectedDeviceInTable.category === 'FACTORY_DEVICE') {
                        if (selectedDeviceInTable.iconType.toLowerCase() === 'subnet') {
                            selectedDeviceInTable.invalidNetMask = !selectedDeviceInTable.subnetIp || formatVal.subnetValidation(selectedDeviceInTable.subnetIp);
                            if (!selectedDeviceInTable.invalidNetMask) {
                                selectedDeviceInTable.invalidRange = formatVal.subnetOverlap(selectedDeviceInTable, allDeviceList, selectedDeviceInTable.subnetIp);
                            }
                        } else {
                            for (var k = 0; k < selectedDeviceInTable.ports.length; k++) {
                                var port = selectedDeviceInTable.ports[k];
                                if (port.isMgmtPort) {
                                    port.invalidIp = !port.portIp || formatVal.validateIp(port.portIp);
                                    port.invalidMac = scope.needMac ? (!port.mac || !(port.mac.match(scope.validateMac))) : (port.mac && !(port.mac.match(scope.validateMac)));
                                    selectedDeviceInTable.invalidIp = port.invalidIp || selectedDeviceInTable.invalidIp;
                                    selectedDeviceInTable.invalidMac = port.invalidMac || selectedDeviceInTable.invalidMac;
                                    if (!port.invalidIp) {
                                        port.hasDuplicateIP = scope.checkDuplicate(port.portIp, allIPList);
                                        port.invalidRange = formatVal.checkIpInSubnet(port.portIp, allDeviceList);
                                        selectedDeviceInTable.hasDuplicateIP = port.hasDuplicateIP || selectedDeviceInTable.hasDuplicateIP;
                                        selectedDeviceInTable.invalidRange = port.invalidRange || selectedDeviceInTable.invalidRange;
                                    }
                                    if (!port.invalidMac) {
                                        port.hasDuplicateMAC = scope.checkDuplicate(port.mac, allMACList, true);
                                        selectedDeviceInTable.hasDuplicateMAC = port.hasDuplicateMAC || selectedDeviceInTable.hasDuplicateMAC;
                                    }
                                }
                            }
                        }
                    }

                    selectedDeviceInTable.invalid = selectedDeviceInTable.nameError || selectedDeviceInTable.modelError || selectedDeviceInTable.invalidIp || selectedDeviceInTable.serialError || selectedDeviceInTable.invalidMac || selectedDeviceInTable.invalidNetMask || selectedDeviceInTable.invalidRange || selectedDeviceInTable.hasDuplicateSN || selectedDeviceInTable.hasDuplicateIP || selectedDeviceInTable.hasDuplicateMAC || (selectedDeviceInTable.category === 'SECURITY_DEVICE' && selectedDeviceInTable.serialFormatError);
                    var status;
                    for (var count = 0; count < diagram.model.nodeDataArray.length; count++) {
                        status = status || diagram.model.nodeDataArray[count].invalid;
                    }
                    ctrlDiagram.invalid = status;
                    if (selectedDeviceInTable.invalid) {
                        upsertToInvalidList(ctrlDiagram.invalidDeviceList, selectedDeviceInTable);
                        ctrlDiagram.selectedInvalidDevice = selectedDeviceInTable;
                    } else {
                        deleteFromInvalidList(ctrlDiagram.invalidDeviceList, selectedDeviceInTable);
                    }
                    diagram.updateAllTargetBindings('invalid');
                };

                scope.checkDuplicate = function (value, array, ignoreCase) {
                    var newSameSN = 0;
                    for (var index = 0; index < array.length; index++) {
                        if (value && (ignoreCase ? (value.toLowerCase() === (array[index] ? array[index].toLowerCase() : '')) : value === array[index])) {
                            newSameSN++;
                        }
                    }
                    return newSameSN > 1;
                };

                scope.addIpMac = function () {
                    diagram.startTransaction("addPort");
                    var newDevicePort = {};
                    var newBottomPort = {};
                    newDevicePort.isMgmtPort = true;
                    newDevicePort.portIp = "";
                    newDevicePort.mac = "";
                    newDevicePort.portName = "p" + scope.selectedDeviceInTable.ports.length;
                    newBottomPort.portIp = "";
                    newBottomPort.portName = "p" + scope.selectedDeviceInTable.bottomArray.length;
                    scope.selectedDeviceInTable.ports.push(newDevicePort);
                    diagram.model.insertArrayItem(scope.selectedDeviceInTable.bottomArray, scope.selectedDeviceInTable.ports.length - 1, newBottomPort);
                    diagram.commitTransaction("addPort");
                };

                scope.removeIpMac = function (index) {
                    diagram.startTransaction("removePort");
                    scope.selectedDeviceInTable.ports.splice(index, 1);
                    diagram.model.removeArrayItem(scope.selectedDeviceInTable.bottomArray, index);
                    diagram.commitTransaction("removePort");
                };

                // Models change with device.category. Selects correct model list onclick (see singleClickHandler)
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
                    }
                };

                // Modifies device detail according to changes in serial number.
                // Changes model and related info.
                // Only for SECURITY_DEVICES
                scope.serialNumberChanged = function (sn) {
                    if (scope.selectedDeviceInTable.category !== 'SECURITY_DEVICE') {
                        return;
                    }
                    scope.selectedDeviceInTable.modelInDetail = "";
                    scope.selectedDeviceInTable.modelId = "";
                    scope.selectedDeviceInTable.mode = "";
                    scope.selectedDeviceInTable.manufacturerInDetail = "";
                    scope.selectedDeviceInTable.numPorts = "";
                    scope.selectedDeviceInTable.modeDescription = "";
                    scope.forms.modes = [];
                    var model = snVal.getModelBySN(sn, scope.forms.models)['model'];
                    if (model) {
                        for (var i in scope.forms.models) {
                            if (i && scope.forms.models[i].iconType && scope.forms.models[i].model === model) {
                                scope.selectedDeviceInTable.modelId = scope.forms.models[i].modelId;
                                scope.modelChange(scope.selectedDeviceInTable);
                                break;
                            }
                        }
                    }
                };

                // Different model Types have different nodeTypes adn modes, select correct list of options on serialNumber -> model change
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

                // Changes in model chagnes different device details and ACL table info.
                // Calls to ctrlDiagram.newModel to reformat canvas device. Updates info
                scope.modelChange = function (selectedDeviceInTable) {
                    for (var i in scope.forms.models) {
                        if (i && scope.forms.models[i].modelId === selectedDeviceInTable.modelId) {
                            selectedDeviceInTable.manufacturerInDetail = scope.forms.models[i].make;
                            selectedDeviceInTable.numPorts = scope.forms.models[i].numOfPorts;
                            selectedDeviceInTable.modelInDetail = scope.forms.models[i].model_name + ' / ' + scope.forms.models[i].model;
                            if (selectedDeviceInTable.category === "SECURITY_DEVICE") {
                                diagram.updateAllTargetBindings('serialNumber'); // updates badge icon
                                diagram.model.setDataProperty(selectedDeviceInTable, "img", Device.getSecurityDeviceIconPath(scope.forms.models[i].model, scope.forms.models[i].iconType));
                                selectedDeviceInTable.subcategory = scope.forms.models[i].subCategory;
                                selectedDeviceInTable.iconType = scope.forms.models[i].iconType ? scope.forms.models[i].iconType.toLowerCase() : '';
                                var modelName = scope.forms.models[i].model_name + ' / ' + scope.forms.models[i].model;
                                ctrlDiagram.newModel(scope.forms.models[i].model);
                                scope.populateModeOptions(selectedDeviceInTable.subcategory, modelName);
                            }
                            break;
                        }
                    }
                    ctrlDiagram.saveData('basic');
                    scope.validateDevice(selectedDeviceInTable);
                };

                // Changes in model changes different device details and ACL table info. (for ZN / KEV- series)
                // Calls to ctrlDiagram.newModel to reformat canvas device. Updates info
                scope.modeChange = function (selectedDeviceInTable) {
                    for (var i in scope.forms.modes) {
                        if (i && scope.forms.modes[i].modename === selectedDeviceInTable.modeDescription) {
                            selectedDeviceInTable.nodeType = scope.forms.modes[i].mode;
                            if (selectedDeviceInTable.modeDescription === '数采隔离') {
                                selectedDeviceInTable.subCategory = 1;
                            }
                            if (selectedDeviceInTable.modelInDetail.indexOf('KEV') >= 0) {
                                var parsedModel = $filter('deviceModel')(selectedDeviceInTable.modelInDetail);
                                ctrlDiagram.newModel(parsedModel.substring(parsedModel.indexOf('KEV'), parsedModel.length));
                            }
                            break;
                        }
                    }
                    scope.validateDevice(selectedDeviceInTable);
                };

                // Select an invalid device from the ivnalid list, will centralize and zoom the selected device.
                scope.selectInvalidDevice = function (selectedInvalidDevice) {
                    if (!selectedInvalidDevice.key) {
                        return;
                    }
                    var selectNode = diagram.findNodeForData(selectedInvalidDevice);
                    diagram.select(selectNode);
                    diagram.zoomToRect(selectNode.actualBounds);
                    diagram.centerRect(selectNode.actualBounds);
                    var objectBounds = diagram.computePartsBounds(diagram.selection).width;
                    var calculated = diagram.viewportBounds.width * (1 - 600 / (document.getElementById('topologySingle').offsetWidth ));
                    if (diagram.scale > 1) {
                        diagram.scale = 1;
                    } else if (objectBounds > calculated) {
                        diagram.scale = diagram.scale * 0.7 - (300 / objectBounds);
                    }
                };

                // Function called when dragging item from Palette to canvas
                // Populates dragged in canvas node with followign information
                function copyNodeData(data) {
                    var copy = {};
                    copy.key = -diagram.nodeCopy.count;
                    diagram.nodeCopy.count++;
                    copy.nameInDetail = data.deviceType;
                    copy.topology = diagram.topologyId;
                    copy.currentTopology = diagram.currentTopology;
                    copy.img = (data.img) ? data.img : "images/cloud-icon.png";
                    copy.category = (data.category) ? data.category : "";
                    copy.updateTime = new Date().toJSON();
                    copy.statusIconShow = data.category === "SECURITY_DEVICE";
                    copy.portIdRef = (data.deviceType !== 'Cloud') && !(data.category === "FACTORY_DEVICE" && data.deviceType !== "子网");
                    copy.loc = '';
                    copy.nodeType = (!data.deviceType || data.deviceType === 'Cloud') ? "CLOUD" : (data.deviceType === '网络交换机') ? "SWITCH" : (data.deviceType === '路由器') ? "ROUTER" : ( data.deviceType === "安全设备" ) ? "IPS" : "ENDPOINT";
                    copy.isEdited = false;
                    copy.iconType = (data.img) ? data.img.substring(7, data.img.length - 9) : "cloud";
                    copy.modelId = (data.deviceType !== 'Cloud') ? "" : "cloud";
                    copy.deviceId = "";
                    copy.hasUSB = data.category === "SECURITY_DEVICE";
                    copy.hasWireless = false;
                    copy.hasPorts = (data.deviceType === 'Cloud') ? false : true;
                    if (data.isGroup) {
                        copy.modelId = "Group";
                        copy.statusShade = '';
                        copy.preview = "";
                        copy.isGroup = true;
                        copy.img = ctrlDiagram.groupIcon;
                        copy.nameInDetail = "_分组";
                        for (var it = diagram.selection.iterator; it.next();) {
                            if (it.value instanceof go.Node) {
                                copy.nameInDetail = it.value.data.nameInDetail + "分组";
                                break;
                            }
                        }
                    }
                    if (data.deviceType && data.deviceType !== 'Cloud') {
                        var firstPort =
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
                            status: 0,
                            netMask: ''
                        };
                        (data.deviceType === "子网") ? firstPort.netMask = '255.255.255.0' : '';
                        copy.ports = [firstPort];
                        copy.deviceOnline = 0;
                        copy.deviceSource = "";
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

                // linkValidation: limit number of linsk by ports available
                function linkNumber(fromnode, fromport, tonode, toport, link) {
                    var relinkingFrom = false;
                    var relinkingTo = false;
                    if (link) {
                        if (link.fromPort !== fromport && link.toPort === toport) {
                            relinkingFrom = true;
                        } else if (link.fromPort === fromport && link.toPort !== toport) {
                            relinkingTo = true;
                        } else {
                            return true;
                        }
                    }

                    var fromConnected = fromnode.findLinksConnected(fromport.portId);
                    var toConnected = tonode.findLinksConnected(toport.portId);
                    var fromVal, toVal, count;
                    if (fromnode.data.category === 'SECURITY_DEVICE') {
                        if (["IPS", "IDS"].indexOf(fromnode.data.nodeType) === -1) {
                            var fromLimit = 1;
                            if (!fromnode.data.deviceId) {
                                fromLimit = fromnode.data.numPorts - 1;
                            } else {
                                for (count = 0; count < diagram.allData.nodes.length; count++) {
                                    if (diagram.allData.nodes[count].deviceId === fromnode.data.deviceId) {
                                        fromLimit = diagram.allData.nodes[count].ports.length;
                                        break;
                                    }
                                }
                            }
                            var fromPortCount = fromLimit;
                            for (var f = 0; f < fromPortCount; f++) {
                                var ripsFC = fromnode.findLinksConnected("p" + f);
                                fromLimit = (ripsFC.count > 0 ? (fromLimit - ripsFC.count) : fromLimit);
                            }
                            fromVal = relinkingTo ? true : ((fromLimit - fromConnected.count) > 0);
                        } else {
                            fromVal = relinkingTo ? true : fromConnected.count < 1;
                        }
                    } else {
                        if (fromnode.data.category === 'FACTORY_DEVICE') {
                            fromVal = relinkingTo ? true : fromConnected.count < 1;
                        } else {
                            fromVal = true;
                        }
                    }

                    if (tonode.data.category === 'SECURITY_DEVICE') {
                        if (["IPS", "IDS"].indexOf(tonode.data.nodeType) === -1) {
                            var toLimit = 1;
                            if (!tonode.data.deviceId) {
                                toLimit = tonode.data.numPorts - 1;
                            } else {
                                for (count = 0; count < diagram.allData.nodes.length; count++) {
                                    if (diagram.allData.nodes[count].deviceId === tonode.data.deviceId) {
                                        toLimit = diagram.allData.nodes[count].ports.length;
                                        break;
                                    }
                                }
                            }
                            var toPortCount = toLimit;
                            for (var t = 0; t < toPortCount; t++) {
                                var ripsTC = tonode.findLinksConnected("p" + t);
                                toLimit = (ripsTC.count > 0 ? (toLimit - ripsTC.count) : toLimit);
                            }
                            toVal = relinkingFrom ? true : ((toLimit - toConnected.count) > 0);
                        } else {
                            toVal = relinkingFrom ? true : toConnected.count < 1;
                        }
                    } else {
                        if (tonode.data.category === 'FACTORY_DEVICE') {
                            toVal = relinkingFrom ? true : toConnected.count < 1;
                        } else {
                            toVal = true;
                        }
                    }

                    return fromVal && toVal;
                }


                scope.drawTopo = function (data) {
                    drawTopo(data);
                };

                scope.putDiagramData = function (data) {
                    putDiagramData(data);
                };

                // Redraws topology - called by render, only really draws witht he putDiagamData function
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

                    deviceEventHandler = $rootScope.$on('updateDashboardHeader', function () {
                        scope.render('update');
                        for (var i = 0; i < diagram.model.nodeDataArray.length; i++) {
                            diagram.model.nodeDataArray[i].currentTopology = !diagram.model.nodeDataArray[i].currentTopology;
                        }
                    });

                    updateDashboardHeaderEventHandler = $rootScope.$on('device', streamUpdate);
                    //sse.listen('device', scope, streamUpdate);

                    scope.$on('$destroy', function () {
                        deviceEventHandler();
                        updateDashboardHeaderEventHandler();
                    });

                    function streamUpdate(evt, data) {
                        diagram.startTransaction("连掉线");
                        diagram.model.nodeDataArray.forEach(function (objc, ind) {
                            if (objc.deviceId === data.deviceId) {
                                if (data.deviceOnline === -1) {
                                    diagram.model.nodeDataArray[ind].statusText = "掉线";
                                    diagram.model.nodeDataArray[ind].statusColor = "red";
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "statusIconShow", true);
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "deviceOnline", data.online);
                                } else if (data.deviceOnline === 1 && data.deviceSource === "DISCOVERY") {
                                    diagram.model.nodeDataArray[ind].statusText = "连线";
                                    diagram.model.nodeDataArray[ind].statusColor = "green";
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "statusIconShow", false);
                                    diagram.model.setDataProperty(diagram.model.nodeDataArray[ind], "deviceOnline", data.online);
                                }
                            }
                        });
                        diagram.commitTransaction("连掉线");
                        diagram.requestUpdate();
                    }

                }

                // Pick a device to be as selected, used when delete devices/group
                function pickADeviceToBeSelected() {
                    for (var i = 0; i < diagram.allData.nodes.length; i++) {
                        var node = diagram.findNodeForKey(-i);
                        if (node) {
                            diagram.select(node);
                            break;
                        }
                    }
                }

                // Parse canvas items to differentiate new or old nodes and calls API to update or create - called after saveAddedDevices
                // After 2.2 All devices have single node for each device with how ever many ports.
                function saveEditedNodes() {
                    var index = 0, needNodes = [], updateNodes = [];
                    var dHolder = {};
                    var fields = ['from', 'to'];

                    for (var ul = 0; ul < diagram.model.linkDataArray.length; ul++) {
                        var unknownLinkData = diagram.model.linkDataArray[ul];
                        if (unknownLinkData.linkId === -1) {
                            continue;
                        }
                        // Parse out connected nodes of canvas items
                        for (var va = 0; va < fields.length; va++) {
                            var currDevice = diagram.keyToDevice[-unknownLinkData[fields[va]]];
                            if (currDevice.category === "SECURITY_DEVICE") {
                                dHolder[currDevice.deviceId] = dHolder[currDevice.deviceId] || {"DeviceRef": currDevice};
                                index = 1;
                                dHolder[currDevice.deviceId][index] = dHolder[currDevice.deviceId][index] || [];
                                var nodePorts = false;
                                for (var count = 0; count < diagram.allData.nodes.length; count++) {
                                    if (diagram.allData.nodes[count].deviceId === currDevice.deviceId) {
                                        nodePorts = diagram.allData.nodes[count].ports;
                                    }
                                }
                                if (nodePorts) {
                                    dHolder[currDevice.deviceId][index] = nodePorts;
                                } else {
                                    for (var i = 0; i < currDevice.ports.length - 1; i++) {
                                        if (!currDevice.ports[i].isMgmtPort) {
                                            if (dHolder[currDevice.deviceId][index].length === 0 || dHolder[currDevice.deviceId][index].indexOf(currDevice.ports[i].portName) < 0) {
                                                dHolder[currDevice.deviceId][index].push(currDevice.ports[i].portName);
                                            }
                                        }
                                    }
                                }
                            } else if (currDevice.nodeType) {
                                var ports = [];
                                if (currDevice.category === "FACTORY_DEVICE" && currDevice.iconType !== 'subnet') {
                                    for (var j = 0; j < currDevice.ports.length; j++) {
                                        ports.push('p' + j.toString());
                                    }
                                }
                                dHolder[currDevice.deviceId] =
                                    dHolder[currDevice.deviceId] ||
                                    {
                                        deviceId: ( ['CLOUD'].indexOf(currDevice.nodeType) === -1 ) ? currDevice.deviceId : '0',
                                        name: currDevice.nameInDetail,
                                        type: currDevice.nodeType,
                                        x: diagram.findNodeForKey(unknownLinkData[fields[va]]).location.x,
                                        y: diagram.findNodeForKey(unknownLinkData[fields[va]]).location.y,
                                        importance: 1,
                                        zoneName: (currDevice.category === "FACTORY_DEVICE") ? currDevice.nameInDetail : '',
                                        category: currDevice.category,
                                        ports: currDevice.ports
                                    };
                                if (ports.length > 0) {
                                    dHolder[currDevice.deviceId].ports = ports;
                                }
                                //================ cs-8656 ========================
                                if (currDevice.iconType === 'subnet') {
                                    delete dHolder[currDevice.deviceId].ports;
                                }
                                //================ cs-8656 end =====================
                                if (currDevice.category !== 'FACTORY_DEVICE') {
                                    delete dHolder[currDevice.deviceId].category;
                                    delete dHolder[currDevice.deviceId].ports;
                                }
                            }
                        }
                    }
                    // Get list of existing nodes - check to see if node already exists - if so update info
                    // Though only info that actually gets updated is name, since IP and ports is non-mutalbe in MW
                    var oldNodes = diagram.allData.nodes;
                    for (var SDNodes in dHolder) {
                        if (dHolder.hasOwnProperty(SDNodes)) {
                            for (var ol = 0; ol < oldNodes.length; ol++) {
                                if (SDNodes === oldNodes[ol].deviceId) { //Existing node
                                    (dHolder[SDNodes].DeviceRef) ? (index = 1) : '';
                                    // Ports non-mutalbe thus used as variable to determine node identity since node Id not kept
                                    if ((dHolder[SDNodes].DeviceRef && !dHolder[SDNodes][index] ) || ((dHolder[SDNodes].DeviceRef) ? ((!oldNodes[ol].ports) ? true : (dHolder[SDNodes][index].sort().join('_') !== oldNodes[ol].ports.sort().join('_'))) : false)) {
                                        continue;
                                    }
                                    var nameDiff = (!oldNodes[ol].name) ? false : ((dHolder[SDNodes].DeviceRef) ? (oldNodes[ol].name !== dHolder[SDNodes].DeviceRef['nameInDetail'] + '_' + dHolder[SDNodes][index].sort().join('_')) : (oldNodes[ol].name !== dHolder[SDNodes]['name']));
                                    var typeDiff = (dHolder[SDNodes].DeviceRef) ? (oldNodes[ol].type !== dHolder[SDNodes].DeviceRef['nodeType']) : (oldNodes[ol].type !== dHolder[SDNodes]['type']);
                                    if (nameDiff || typeDiff) {
                                        var next = {};
                                        next['id'] = oldNodes[ol].id;
                                        next['nodeZoneId'] = oldNodes[ol].nodeZoneId;
                                        next['name'] = (dHolder[SDNodes].DeviceRef) ? dHolder[SDNodes].DeviceRef['nameInDetail'] + '_' + dHolder[SDNodes][index].sort().join('_') : dHolder[SDNodes]['name'];
                                        next['type'] = (dHolder[SDNodes].DeviceRef) ? dHolder[SDNodes].DeviceRef['nodeType'] : dHolder[SDNodes]['type'];
                                        //================ cs-8656 ========================
                                        if (dHolder[SDNodes].category && dHolder[SDNodes].category === 'FACTORY_DEVICE' && dHolder[SDNodes].ports) {
                                            //================ cs-8656 end ========================
                                            next['ports'] = dHolder[SDNodes].ports;
                                        } else {
                                            (dHolder[SDNodes].DeviceRef) ? next['ports'] = dHolder[SDNodes][index].sort() : '';
                                        }
                                        for (var na in  next) {
                                            if (next.hasOwnProperty(na)) {
                                                (!next[na]) ? delete next[na] : '';
                                            }
                                        }
                                        updateNodes.push(next);
                                    }
                                    // Delete updated nodes
                                    (!dHolder[SDNodes].DeviceRef || Object.keys(dHolder[SDNodes]).length === 2) ? delete dHolder[SDNodes] : delete dHolder[SDNodes][index];
                                    if (!dHolder[SDNodes]) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    // All other connected nodes from initial parse must be new thus created.
                    for (SDNodes in dHolder) {
                        if (dHolder.hasOwnProperty(SDNodes)) {
                            if (!dHolder[SDNodes].DeviceRef) {
                                needNodes.push(dHolder[SDNodes]);
                            } else {
                                for (var inNodes in dHolder[SDNodes]) {
                                    if (dHolder[SDNodes].hasOwnProperty(inNodes) && inNodes !== "DeviceRef") {
                                        needNodes.push({
                                            deviceId: dHolder[SDNodes].DeviceRef.deviceId,
                                            name: dHolder[SDNodes].DeviceRef.nameInDetail + '_' + dHolder[SDNodes][inNodes].sort().join('_'),
                                            type: dHolder[SDNodes].DeviceRef.nodeType,
                                            ports: dHolder[SDNodes][inNodes].sort(),
                                            importance: 1,
                                            x: diagram.findNodeForKey(dHolder[SDNodes].DeviceRef.key).location.x,
                                            y: diagram.findNodeForKey(dHolder[SDNodes].DeviceRef.key).location.y
                                        });
                                    }
                                }
                            }
                        }
                    }
                    // Finds all non connected devices and makes a default node for it.
                    // Also takes into account ndoes that existed, but links removed
                    for (ul = 0; ul < diagram.model.nodeDataArray.length; ul++) {
                        var addInto = true;
                        var unknownDevice = diagram.model.nodeDataArray[ul];
                        if (unknownDevice.isGroup) {
                            continue;
                        }
                        if (diagram.devicesNodeMapCopy[unknownDevice.deviceId] === -1) {
                            for (var il = 0; il < needNodes.length; il++) {
                                if (needNodes[il].deviceId === unknownDevice.deviceId || ((unknownDevice.iconType === 'cloud') && needNodes[il].deviceId === '0')) {
                                    addInto = false;
                                    break;
                                }
                            }
                            if (addInto) {
                                var addNode = {};
                                (['CLOUD'].indexOf(unknownDevice.nodeType) >= 0) ? addNode['deviceId'] = '0' : addNode['deviceId'] = unknownDevice.deviceId;
                                addNode['name'] = unknownDevice.nameInDetail;
                                addNode['type'] = unknownDevice.nodeType;
                                var defaultPort = [], dCount;
                                if (['SECURITY_DEVICE'].indexOf(unknownDevice.category) >= 0) {
                                    for (dCount = 0; dCount < unknownDevice.ports.length - 1; dCount++) {
                                        defaultPort.push('p' + dCount);
                                    }
                                    addNode['ports'] = defaultPort;
                                    addNode['name'] = unknownDevice.nameInDetail + '_' + defaultPort.sort().join('_');
                                }
                                addNode['x'] = diagram.findNodeForKey(unknownDevice.key).location.x;
                                addNode['y'] = diagram.findNodeForKey(unknownDevice.key).location.y;
                                if (unknownDevice.category === 'FACTORY_DEVICE') {
                                    if (unknownDevice.iconType !== 'subnet') {
                                        for (dCount = 0; dCount < unknownDevice.ports.length; dCount++) {
                                            defaultPort.push('p' + dCount);
                                        }
                                        addNode['ports'] = defaultPort;
                                    }
                                    addNode['zoneName'] = unknownDevice.nameInDetail;
                                }
                                addNode['importance'] = 1;
                                needNodes.push(addNode);
                            }
                            diagram.devicesNodeMapCopy[unknownDevice.deviceId] = [];
                            if (unknownDevice.ports) {
                                for (var p = 0; p < unknownDevice.ports.length; p++) {
                                    diagram.devicesNodeMapCopy[unknownDevice.deviceId].push(-1);
                                }
                            } else {
                                diagram.devicesNodeMapCopy[unknownDevice.deviceId] = "cloud";
                            }
                        }
                    }

                    // Fill Promise with API
                    var promises = [];
                    for (ul = 0; ul < updateNodes.length; ul++) {
                        promises.push(Device.updateNode(updateNodes[ul]));
                    }
                    for (var tmpIndex = 0; tmpIndex < needNodes.length; tmpIndex++) {
                        delete needNodes[tmpIndex].category;
                    }
                    promises.push(Device.createNodes(needNodes));

                    // Execute promise async
                    var deferred = $q.defer();
                    $q.all(promises).then(function () {
                        deferred.resolve('success');
                        recursiveNodeCheck(needNodes.length);
                    }, function (data) {
                        deferred.resolve('创建设备失败');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '创建设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                }

                // Check if nodes that are requested to be made have been made, else check again
                function recursiveNodeCheck(need) {
                    var pendingMake = true;
                    $q.all([Topology.getNodes(scope.topo)]).then(function (results) {
                        if (diagram.allData.nodes.length + need === results[0].data.length) {
                            // All expected ndoes have been made, cleat ot proceed
                            pendingMake = false;
                            parseNodeReturns();
                        } else {
                            // Waits 100ms before next check, for the sake savign processing
                            setTimeout(function () {
                                recursiveNodeCheck(need);
                            }, 100);
                        }
                    });
                }

                // Parse canvas items to differentiate new or old links and calls API to update or create - called after saveEditedNodes
                function saveEditedLinks() {
                    diagram.startTransaction("linkHandler");
                    var newLinks = [], oldLinks = [], deleteLinks = [], promises = [], ndId, dndId;

                    for (var il = 0; il < diagram.model.linkDataArray.length; il++) {
                        var currLinkData = diagram.model.linkDataArray[il];
                        if (currLinkData.linkId === -1) {
                            continue;
                        }

                        if ((typeof diagram.keyToDevice[-currLinkData.from] === "number") ? true : (typeof diagram.devicesNodeMapCopy[diagram.keyToDevice[-currLinkData.from].deviceId] === "number")) {
                            ndId = (typeof diagram.keyToDevice[-currLinkData.from] === "number") ? diagram.keyToDevice[-currLinkData.from] : diagram.devicesNodeMapCopy[diagram.keyToDevice[-currLinkData.from].deviceId];
                        } else {
                            //Devices that have multiple nodes
                            for (var ii = 0; ii < diagram.keyToDevice[-currLinkData.from].ports.length; ii++) {
                                if (diagram.keyToDevice[-currLinkData.from].ports[ii].portName.toLowerCase() === currLinkData.fromPort.toLowerCase()) {
                                    ndId = diagram.devicesNodeMapCopy[diagram.keyToDevice[-currLinkData.from].deviceId][ii];
                                    break;
                                }
                            }
                        }
                        if (( typeof diagram.keyToDevice[-currLinkData.to] === "number") ? true : (typeof diagram.devicesNodeMapCopy[diagram.keyToDevice[-currLinkData.to].deviceId] === "number")) {
                            dndId = (typeof diagram.keyToDevice[-currLinkData.to] === "number") ? diagram.keyToDevice[-currLinkData.to] : diagram.devicesNodeMapCopy[diagram.keyToDevice[-currLinkData.to].deviceId];
                        } else {
                            for (var ia = 0; ia < diagram.keyToDevice[-currLinkData.to].ports.length; ia++) {
                                if (diagram.keyToDevice[-currLinkData.to].ports[ia].portName.toLowerCase() === currLinkData.toPort.toLowerCase()) {
                                    dndId = diagram.devicesNodeMapCopy[diagram.keyToDevice[-currLinkData.to].deviceId][ia];
                                    break;
                                }
                            }
                        }

                        if (currLinkData.linkId) {
                            if (diagram.linkCopy[currLinkData.linkId].from !== currLinkData.from ||
                                diagram.linkCopy[currLinkData.linkId].to !== currLinkData.to ||
                                diagram.linkCopy[currLinkData.linkId].fromPort !== currLinkData.fromPort ||
                                diagram.linkCopy[currLinkData.linkId].toPort !== currLinkData.toPort) {
                                oldLinks.push({
                                    id: currLinkData.linkId,
                                    nodeID: ndId,
                                    destinationNodeID: dndId,
                                    sourcePortName: currLinkData.fromPort === 'unspecified' ? '' : currLinkData.fromPort,
                                    destinationPortName: currLinkData.toPort === 'unspecified' ? '' : currLinkData.toPort
                                });
                            }
                            delete diagram.linkCopy[currLinkData.linkId];
                        } else {
                            newLinks.push({
                                nodeID: ndId,
                                destinationNodeID: dndId,
                                sourcePortName: currLinkData.fromPort === 'unspecified' ? '' : currLinkData.fromPort,
                                destinationPortName: currLinkData.toPort === 'unspecified' ? '' : currLinkData.toPort
                            });
                        }
                    }

                    for (var link in diagram.linkCopy) {
                        if (diagram.linkCopy.hasOwnProperty(link)) {
                            deleteLinks.push({id: link});
                        }
                    }

                    if (deleteLinks.length > 0) {
                        promises.push(Topology.deleteLink(deleteLinks, diagram.topologyId));
                    }
                    if (oldLinks.length > 0) {
                        promises.push(Topology.updateLink(oldLinks, diagram.topologyId));
                    }
                    if (newLinks.length > 0) {
                        promises.push(Topology.addLink(newLinks, diagram.topologyId));
                    }

                    var deferred = $q.defer();
                    $q.all(promises).then(function () {
                        deferred.resolve('success');
                        scope.render('update');
                        if (true) {
                            ctrlDiagram.EditMode = false;
                            if (diagram.validationMessage && diagram.validationMessage.length) {
                                $rootScope.addAlert({
                                    type: 'warning',
                                    content: '警告!\n- ' + diagram.validationMessage
                                });
                            } else {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: "修改设备成功"
                                });
                            }
                        }
                        Dashboard.updateDashboard({
                            'dashBoardTypeDetail': 'TOPOLOGY_STRUCTURESAFETY'
                        });
                    }, function (data) {
                        deferred.resolve('修改设备失败');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                    diagram.commitTransaction("linkHandler");
                }

                // Calls after focus change from existing device after an edit
                // Sends update API on a one device basis
                function saveEditedDevice(currDeviceData) {
                    diagram.startTransaction("linkHandler");
                    var promises = [];
                    if (-currDeviceData.key <= diagram.nodeCopy.length) {
                        var basicDevice = {};
                        (!currDeviceData.modelInDetail || currDeviceData.modelInDetail === 'N/A') ? "" : basicDevice['_model_name'] = currDeviceData.modelInDetail;
                        (!currDeviceData.modelId || currDeviceData.modelId === 'N/A') ? "" : basicDevice['modelId'] = currDeviceData.modelId;
                        basicDevice['_subCategory'] = currDeviceData.subcategory;
                        basicDevice['category'] = currDeviceData.category;
                        basicDevice['deviceId'] = currDeviceData.deviceId;
                        if (currDeviceData.ports) {
                            basicDevice['devicePorts'] = [];
                            for (var i = 0; i < currDeviceData.ports.length; i++) {
                                var port = {
                                    isMgmtPort: currDeviceData.ports[i].isMgmtPort,
                                    portName: currDeviceData.ports[i].portName,
                                    portIp: currDeviceData.ports[i].portIp,
                                    mac: currDeviceData.ports[i].mac ? currDeviceData.ports[i].mac.toUpperCase() : '',
                                    portId: currDeviceData.ports[i].portId
                                };
                                basicDevice['devicePorts'].push(port);
                            }
                        }
                        basicDevice['hasPort'] = (currDeviceData.ports.length > 0);
                        basicDevice['iconType'] = currDeviceData.iconType;
                        basicDevice['make'] = currDeviceData.manufacturerInDetail;
                        basicDevice['name'] = currDeviceData.nameInDetail;
                        (!currDeviceData.serialNumber || currDeviceData.serialNumber === 'N/A') ? "" : basicDevice['serialNumber'] = currDeviceData.serialNumber;
                        basicDevice['topologyId'] = currDeviceData.topologyId;
                        basicDevice['updatedAt'] = new Date().toJSON();
                        //Update device basic info
                        if ((currDeviceData.isEdited).indexOf('basic') >= 0) {
                            promises.push(Device.update(basicDevice.deviceId, basicDevice));
                        }
                        //Update device IP/Mac
                        if ((currDeviceData.isEdited).indexOf('ipmac') >= 0) {
                            if (currDeviceData.nodeType !== "SWITCH" && (currDeviceData.category !== 'SECURITY_DEVICE' || currDeviceData.deviceOnline === 0)) {
                                if (currDeviceData.category === 'FACTORY_DEVICE' && currDeviceData.iconType !== 'subnet') {
                                    promises.push(Device.updateAllDevicePorts(currDeviceData.topologyId, currDeviceData.deviceId, basicDevice));
                                } else {
                                    for (var pm = 0; pm < currDeviceData.ports.length; pm++) {
                                        if (currDeviceData.ports[pm].isMgmtPort) {
                                            var portIpMac = {
                                                portIp: (currDeviceData.iconType === 'subnet') ? currDeviceData.subnetIp : currDeviceData.ip,
                                                mac: currDeviceData.mac ? currDeviceData.mac.toUpperCase() : '',
                                                portId: currDeviceData.ports[pm].portId
                                            };
                                            promises.push(Device.updateMgmIpMac(currDeviceData.topologyId, currDeviceData.deviceId, portIpMac));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var deferred = $q.defer();
                    $q.all(promises).then(function () {
                        currDeviceData.isEdited = false;
                        if (currDeviceData.category === 'FACTORY_DEVICE' && currDeviceData.iconType !== 'subnet') {
                            var requests = [];
                            requests.push(Topology.getLinks(currDeviceData.topologyId));
                            requests.push(Topology.getDeviceNodes(currDeviceData.deviceId));
                            $q.all(requests).then(function (data) {
                                var links = data[0].data;
                                var node = data[1][0];
                                var ports = [];
                                var ids = [];
                                for (var i = 0; i < currDeviceData.ports.length; i++) {
                                    ports.push('p' + i.toString());
                                }
                                node.ports = ports;
                                Device.updateNode(node).then(function () {
                                }, function (data) {
                                    deferred.resolve('修改设备失败');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                                    });
                                });
                                for (var j = 0; j < links.length; j++) {
                                    var tmp = links[j];
                                    if (tmp.nodeID === node.id) {
                                        if (tmp.sourcePortName && parseInt(tmp.sourcePortName.slice(1)) >= currDeviceData.ports.length) {
                                            ids.push({id: tmp.id});
                                        }
                                    }
                                }
                                if (ids.length > 0) {
                                    Topology.deleteLink(ids, currDeviceData.topologyId);
                                }
                            });
                        }
                        deferred.resolve('success');
                    }, function (data) {
                        deferred.resolve('修改设备失败');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                    diagram.commitTransaction("DeviceHandler");
                }

                // Parse canvas items to find new or old links and calls API to create - called after validateTopo
                // When Creating subnet devices, must have a blank model to assign - creates if neccesaary
                function saveAddedDevices() {
                    diagram.startTransaction("linkHandler");
                    var prom = [];
                    for (var iN = 0; iN < diagram.model.nodeDataArray.length; iN++) {
                        var currDeviceData = diagram.model.nodeDataArray[iN];
                        if (-currDeviceData.key > diagram.nodeCopy.length) {
                            if (currDeviceData.iconType !== 'cloud') {
                                var newDevice = {};
                                currDeviceData['mac'] ? currDeviceData['mac'] = currDeviceData['mac'].toUpperCase() : '';
                                newDevice['name'] = currDeviceData['nameInDetail'];
                                newDevice['iconType'] = currDeviceData['iconType'];
                                (currDeviceData['serialNumber']) ? newDevice['serialNumber'] = currDeviceData['serialNumber'] : "";
                                newDevice['modelId'] = currDeviceData['modelId'];
                                newDevice['devicePorts'] = (currDeviceData.ports) ? currDeviceData.ports : [];
                                if (currDeviceData['category'] === "FACTORY_DEVICE") {
                                    newDevice['devicePorts'][0]['portIp'] = (currDeviceData['iconType'] === 'subnet') ? currDeviceData['subnetIp'] : newDevice['devicePorts'][0]['portIp'];
                                } else {
                                    newDevice['devicePorts'][0]['portIp'] = currDeviceData['ip'];
                                    newDevice['devicePorts'][0]['mac'] = currDeviceData['mac'];
                                }
                                for (var i = 0; i < currDeviceData.ports.length; i++) {
                                    (newDevice['devicePorts'][i].hasOwnProperty('deployedRulesNumber')) ? delete newDevice['devicePorts'][i]['deployedRulesNumber'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('deviceId')) ? delete newDevice['devicePorts'][i]['deviceId'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('linkState')) ? delete newDevice['devicePorts'][i]['linkState'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('portId')) ? delete newDevice['devicePorts'][i]['portId'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('protectedDevicesNumber')) ? delete newDevice['devicePorts'][i]['protectedDevicesNumber'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('status')) ? delete newDevice['devicePorts'][i]['status'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('_subnets')) ? delete newDevice['devicePorts'][i]['_subnets'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('invalidIp')) ? delete newDevice['devicePorts'][i]['invalidIp'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('invalidMac')) ? delete newDevice['devicePorts'][i]['invalidMac'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('hasDuplicateIP')) ? delete newDevice['devicePorts'][i]['hasDuplicateIP'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('hasDuplicateMAC')) ? delete newDevice['devicePorts'][i]['hasDuplicateMAC'] : '';
                                    (newDevice['devicePorts'][i].hasOwnProperty('invalidRange')) ? delete newDevice['devicePorts'][i]['invalidRange'] : '';
                                }
                                if (currDeviceData['iconType'] === 'subnet') {
                                    newDevice['modelId'] = diagram.blankModelId;
                                    newDevice['devicePorts'][0]['netMask'] = currDeviceData['ports'][0].netMask;
                                }
                                prom.push(Device.createDevice(newDevice));
                                currDeviceData.isEdited = false;
                            }
                        } else {
                            delete diagram.nodeCopy[currDeviceData.deviceId];
                        }
                    }
                    // There can be no creation API calls after a delete thus delete API pushed last just prior to promise resolve
                    for (var node in diagram.nodeCopy) {
                        if (diagram.nodeCopy.hasOwnProperty(node) && ['length', 'count'].indexOf(node) === -1) {
                            prom.push(Device.deleteOneDevice(node));
                        }
                    }
                    for (var cloud = 0; cloud < cloudNodeToRemove.length; cloud++) {
                        prom.push(Device.removeNodeByID(cloudNodeToRemove[cloud].nodeId));
                        for (var idx = 0; idx < diagram.allData.nodes.length; idx++) {
                            var tmp = diagram.allData.nodes[idx];
                            if (cloudNodeToRemove[cloud].nodeId === tmp.id) {
                                diagram.allData.nodes.splice(idx, 1);
                                break;
                            }
                        }
                    }
                    var deferred = $q.defer();
                    $q.all(prom).then(function (returned) {
                        deferred.resolve('success');
                        parseDeviceReturns(returned);
                        saveEditedGroups();
                        saveEditedNodes();
                    }, function (data) {
                        deferred.resolve('修改设备失败');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                    diagram.commitTransaction("DeviceHandler");
                }

                // Parse canvas items to find new or old groups and calls API to create - saveAddedDevice
                // No actual group deletion, since unused groups are never dispalyed, groupIds are tracked so usused groups in MW are replaced with new ones using updates
                function saveEditedGroups() {
                    var groupProm = [];
                    for (var iN = 0; iN < diagram.groupRef.removed.length; iN++) {
                        groupProm.push(Device.updateGroups(diagram.groupRef.removed[iN], []));
                    }
                    for (iN = 0; iN < diagram.groupRef.edited.length; iN++) {
                        var currGroup = diagram.findNodeForKey(diagram.groupRef[diagram.groupRef.edited[iN]]);
                        if (!currGroup) {
                            continue;
                        }
                        var parts = [], newGroup = {};
                        newGroup['groupName'] = currGroup.data['nameInDetail'];
                        newGroup['groupX'] = currGroup.location.x;
                        newGroup['groupY'] = currGroup.location.y;
                        newGroup['isExpaneded'] = currGroup.isSubGraphExpanded;
                        newGroup['groupId'] = currGroup.data.groupId;
                        groupProm.push(Device.createGroups(newGroup));

                        for (var g = currGroup.memberParts.iterator; g.next();) {
                            if (g.value instanceof go.Node) {
                                parts.push(g.value.data.deviceId);
                            }
                        }
                        groupProm.push(Device.updateGroups(currGroup.data.groupId, parts));
                    }

                    var deferred = $q.defer();
                    $q.all(groupProm).then(function () {
                        deferred.resolve('success');
                    }, function (data) {
                        deferred.resolve('修改设备失败');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                }

                // Executed before a save to validate Topology correctness
                // Does a detached parse of entire topology for links, nodes, devices, models and packs them into JSON format for API call
                // Detacehd parse refers to maintaining a items relations and input correctness but have self generated fields for ids. - based on OFFLINE TOPOMAKER Export to Zip function
                // Save abort if fail validation
                function topologyValidate() {
                    var parsedObject = JSON.parse(diagram.model.toJson());
                    var nodeArray = parsedObject.nodeDataArray;
                    var linkArray = parsedObject.linkDataArray;
                    var fileArray = {}, keys, variable, subVariable, portField;
                    var count = 0, textJSON = '', nodeCounter = 0;
                    var devicesHolderParse = {}, nodesHolderParse = {}, modelHolderParse = {};

                    //Populate Objects - setUp for node/device/model populate
                    function populator(obj, id) {
                        if (!obj.isGroup) {
                            if (obj.nodeType !== "CLOUD") {
                                devicesHolderParse[id] = new devicePopulator(obj, id);
                                modelHolderParse[id] = new modelPopulator(obj, id);
                            } else {
                                nodesHolderParse[nodeCounter.toString() + obj.key] = new nodePopulator(obj, id, false, []);
                                nodeCounter++;
                            }
                        }
                    }

                    // Creates nodes - dependent on devicePopulator
                    function nodePopulator(obj, id, chosenId, parsedPorts) {
                        var concat = (chosenId) ? chosenId : "";
                        if (concat) {
                            concat = "_" + concat;
                        }
                        this.id = 100 * id;
                        this.deviceId = id.toString();
                        this.importance = (['IPS', 'IDS', 'ROUTING_IPS'].indexOf(obj.nodeType) >= 0 ) ? 1 : 2;
                        this.name = obj.nameInDetail + concat;
                        this.zoneName = (obj.zoneName) ? ((parsedPorts.length > 0) ? obj.zoneName[Math.floor(Number(parsedPorts[0][1]) / 2)] : obj.zoneName[0]) : (obj.category === 'FACTORY_DEVICE') ? obj.nameInDetail : 'NA';
                        this.type = obj.nodeType;
                        this.nodeProperty = (parsedPorts.length > 0 && obj.nodeProperty && obj.category === "SECURITY_DEVICE") ? obj.nodeProperty[Math.floor(Number(parsedPorts[0][1]) / 2)] : '';
                        this.x = diagram.findNodeForKey(obj.key).x;
                        this.y = diagram.findNodeForKey(obj.key).y;

                        if (parsedPorts.length > 0) {
                            this.ports = [];
                            for (var count = 0; count < parsedPorts.length; count++) {
                                this.ports.push(parsedPorts[count]);
                            }
                        }
                    }

                    // Creates devices
                    function devicePopulator(obj, id) {
                        this.deviceId = id.toString();
                        this.modelId = id.toString();
                        this.category = obj.category;
                        this.name = obj.nameInDetail;
                        this.modelIdentifier = (obj.modelIdentifier) ? obj.modelIdentifier : "";
                        this.serialNumber = obj.serialNumber;
                        this.devicePorts = "";
                        this.iconType = obj.iconType;
                        this.hasUSB = obj.hasUSB;
                        this.hasWireless = obj.hasWireless;
                        this.hasPort = true;
                        this.notConnectedPortMap = (obj.notConnectedPortMap) ? obj.notConnectedPortMap : "";
                        function portMaker(obj, mmgtPortIP) {
                            this.portName = (obj.portName) ? obj.portName : "";
                            this.isMgmtPort = (obj.isMgmtPort) ? obj.isMgmtPort : false;
                            this.portIp = (obj.isMgmtPort) ? mmgtPortIP : ((obj.portIp) ? obj.portIp : "");
                            this.netMask = (obj.netMask) ? obj.netMask : "";
                            this.mac = (obj.mac) ? obj.mac : "";
                        }

                        var deviceNode;
                        var dPort = 0;
                        // Create node and ports
                        if (!diagram.deviceNodesHolder[obj.deviceId]) {
                            var parsedPorts = [];
                            if (obj.ports) {
                                var newPorts = [];
                                for (dPort = 0; dPort < obj.ports.length; dPort++) {
                                    if (obj.iconType === 'subnet') {
                                        newPorts.push(new portMaker(obj.ports[dPort], obj.subnetIp));
                                    } else {
                                        if (obj.category === "FACTORY_DEVICE") {
                                            newPorts.push(new portMaker(obj.ports[dPort], obj.ports[dPort].portIp));
                                        } else {
                                            newPorts.push(new portMaker(obj.ports[dPort], obj.ip));
                                        }
                                    }
                                    (obj.ports[dPort].portName.indexOf('p') === 0) ? parsedPorts.push('p' + dPort) : '';
                                }
                                this.devicePorts = newPorts;
                            }
                            deviceNode = new nodePopulator(obj, id, parsedPorts.join('_'), parsedPorts);
                        } else {
                            if (obj.ports) {
                                this.devicePorts = obj.ports;
                                for (dPort = 0; dPort < this.devicePorts.length; dPort++) {
                                    delete this.devicePorts[dPort].index;
                                    delete this.devicePorts[dPort].connection;
                                }
                            }
                            deviceNode = new nodePopulator(obj, id, diagram.deviceNodesHolder[obj.deviceId][0].sort().join('_'), diagram.deviceNodesHolder[obj.deviceId][0]);
                        }
                        nodesHolderParse['0' + obj.key] = deviceNode;
                    }

                    // Creates models
                    function modelPopulator(obj, id) {
                        var parsedModel = $filter('deviceModel')(obj.modelInDetail);

                        this.modelId = id.toString();
                        this.category = obj.category;
                        this.make = obj.manufacturerInDetail;
                        if (obj.category === 'SECURITY_DEVICE') {
                            this.model = parsedModel.substring(parsedModel.indexOf('KE'), parsedModel.length);
                        } else {
                            this.model = parsedModel;
                        }
                        this.version = (obj.version) ? obj.version : "";
                    }

                    // Create Links
                    function linkMaker(obj, nodeArray) {
                        var from, to, fromSeek, toSeek, inParser, port, node, fromPort, toPort;
                        var addFromTail = false;
                        var addToTail = false;
                        for (var count = 0; count < nodeArray.length; count++) {

                            if (nodeArray[count].key === obj.from) {
                                for (inParser in nodesHolderParse) {
                                    if (Number(inParser.split('-')[1]) === -nodeArray[count].key) {
                                        from = 100 * nodesHolderParse[inParser].deviceId;
                                        fromPort = obj.fromPort;
                                        break;
                                    }
                                }
                                if (["IPS", "IDS"].indexOf(nodeArray[count].nodeType) >= 0) {
                                    addFromTail = true;
                                    fromSeek = from / 100;
                                }
                            }

                            if (nodeArray[count].key === obj.to) {
                                for (inParser in nodesHolderParse) {
                                    if (Number(inParser.split('-')[1]) === -nodeArray[count].key) {
                                        to = 100 * nodesHolderParse[inParser].deviceId;
                                        toPort = obj.toPort;
                                        break;
                                    }
                                }
                                if (["IPS", "IDS"].indexOf(nodeArray[count].nodeType) >= 0) {
                                    addToTail = true;
                                    toSeek = to / 100;
                                }
                            }
                        }

                        if (addFromTail) {
                            for (node in nodesHolderParse) {
                                if (from === nodesHolderParse[node].id) {
                                    break;
                                } else if (fromSeek === Number(nodesHolderParse[node].deviceId)) {
                                    for (port = 0; port < nodesHolderParse[node].ports.length; port++) {
                                        if (nodesHolderParse[node].ports[port] === obj.fromPort) {
                                            from = nodesHolderParse[node].id;
                                            fromPort = obj.fromPort;
                                        }
                                    }
                                }
                            }
                        }
                        if (addToTail) {
                            for (node in nodesHolderParse) {
                                if (to === nodesHolderParse[node].id) {
                                    break;
                                } else if (toSeek === Number(nodesHolderParse[node].deviceId)) {
                                    for (port = 0; port < nodesHolderParse[node].ports.length; port++) {
                                        if (nodesHolderParse[node].ports[port] === obj.toPort) {
                                            to = nodesHolderParse[node].id;
                                            toPort = obj.toPort;
                                        }
                                    }
                                }
                            }
                        }

                        this.nodeID = from;
                        this.destinationNodeID = to;
                        this.sourcePortName = fromPort;
                        this.destinationPortName = toPort;
                    }

                    // Backup deviceNodesHolder before doing topo validation
                    var deviceNodesHolderBackup = angular.copy(diagram.deviceNodesHolder);

                    // Starting device Id and populate links/models/devices/nodes
                    var nId = 1;
                    for (count = 0; count < nodeArray.length; count++) {
                        populator(nodeArray[count], nId);
                        nId++;
                    }

                    // Turn parsed items to JSON format and store for API use
                    //.nodes
                    textJSON = [];
                    keys = Object.keys(nodesHolderParse);
                    for (count = 0; count < keys.length; count++) {
                        //for(node in nodesHolder){

                        var nextNode = nodesHolderParse[keys[count]];
                        for (variable in nextNode) {
                            if (!(nextNode[variable]) && (['id', 'importance'].indexOf(variable) === -1)) {
                                delete nextNode[variable];
                            }
                        }
                        textJSON.push(nextNode);
                    }
                    fileArray["nodes"] = textJSON;

                    //.devices
                    textJSON = [];
                    keys = Object.keys(devicesHolderParse);
                    for (count = 0; count < keys.length; count++) {
                        //for( device in devicesHolder){
                        var nextDevice = devicesHolderParse[keys[count]];
                        for (variable in nextDevice) {
                            if (!(nextDevice[variable]) && (['hasUSB', 'hasWireless', 'hasPort'].indexOf(variable) === -1)) {
                                delete nextDevice[variable];
                            }
                            else if (variable === "devicePorts") {
                                for (subVariable in nextDevice[variable]) {
                                    if (!nextDevice[variable].hasOwnProperty(subVariable)) {
                                        continue;
                                    }
                                    for (portField  in nextDevice[variable][subVariable]) {
                                        if (!( nextDevice[variable][subVariable][portField] ) && ( portField !== "isMgmtPort" )) {
                                            delete nextDevice[variable][subVariable][portField];
                                        }
                                    }
                                }
                            }
                        }
                        textJSON.push(nextDevice);
                    }
                    fileArray["devices"] = textJSON;

                    //.models
                    textJSON = [];
                    keys = Object.keys(modelHolderParse);
                    for (count = 0; count < keys.length; count++) {
                        var nextModel = modelHolderParse[keys[count]];
                        for (variable in nextModel) {
                            if (!(nextModel[variable]) && (['make', 'model', 'category'].indexOf(variable) === -1)) {
                                delete nextModel[variable];
                            }
                        }
                        textJSON.push(nextModel);
                    }
                    fileArray["models"] = textJSON;

                    //.links
                    var finalLinkArray = [];
                    for (count = 0; count < linkArray.length; count++) {
                        if (linkArray[count].from !== linkArray[count].to) {
                            finalLinkArray.push(new linkMaker(linkArray[count], nodeArray));
                        }
                    }
                    textJSON = finalLinkArray;
                    fileArray["links"] = textJSON;

                    var deferred = $q.defer();
                    $q.all([Topology.validateTopo(fileArray)]).then(function (response) {
                        deferred.resolve('success');
                        diagram.validationMessage = response[0].data.warningInfos.join("\n- ");
                        saveAddedDevices();
                        checkDiscoveredDevices(false);
                        diagram.toolManager.dragSelectingTool.isEnabled = false;
                        diagram.toolManager.contextMenuTool.isEnabled = false;
                        diagram.model.isReadOnly = true;
                    }, function (data) {
                        ctrlDiagram.isUpdating = false;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: "验证拓扑失败" + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                        // Restore deviceNodesHolder if topo validation failed
                        diagram.deviceNodesHolder = angular.copy(deviceNodesHolderBackup);
                        diagram.toolManager.dragSelectingTool.isEnabled = true;
                        diagram.toolManager.contextMenuTool.isEnabled = true;
                        diagram.model.isReadOnly = false;
                    });
                }

                // Called after saveAddedDevice to assign newly created deviceIds to the diagram countertparts
                function parseDeviceReturns(returned) {
                    //  match up newly created device with deviceId
                    var inner = 0;
                    for (var iN = 0; iN < diagram.model.nodeDataArray.length; iN++) {
                        var currDeviceData = diagram.model.nodeDataArray[iN];

                        ( (ctrlDiagram.lastSelection === currDeviceData.key ) && (-ctrlDiagram.lastSelection <= diagram.nodeCopy.length)) ? ctrlDiagram.lastSelection = (currDeviceData.iconType.toLowerCase() !== 'cloud') ? currDeviceData.deviceId : -currDeviceData.key : '';
                        if (-currDeviceData.key > diagram.nodeCopy.length) {
                            if (currDeviceData.iconType !== 'cloud') {
                                (ctrlDiagram.lastSelection === currDeviceData.key) ? ctrlDiagram.lastSelection = returned[inner].deviceId : '';
                                currDeviceData.deviceId = returned[inner].deviceId;
                                inner++;
                            } else {
                                currDeviceData.deviceId = -currDeviceData.key;
                                (ctrlDiagram.lastSelection === currDeviceData.key) ? ctrlDiagram.lastSelection = -currDeviceData.key : '';
                            }
                            diagram.keyToDevice[-currDeviceData.key] = currDeviceData;
                            diagram.keyToDevice.length = diagram.keyToDevice.length + 1;
                            diagram.devicesNodeMapCopy[currDeviceData.deviceId] = -1;
                        }
                    }
                }

                // Called after saveEditedDevice to assign newly created node Ids to the diagram countertparts
                // Also updates diagram.devicesNodeMapCopy so links can find an corresponding node id
                function parseNodeReturns() {
                    var promises = [], newNodeList = [], newDeviceList = [];

                    promises.push(Topology.getDevices(scope.topo));
                    promises.push(Topology.getNodes(scope.topo));

                    $q.all(promises).then(function (results) {
                        //  match up newly created device with deviceId
                        newNodeList = results[1].data;
                        newDeviceList = results[0].data;
                        for (var nd = 0; nd < diagram.model.nodeDataArray.length; nd++) {
                            var foundNode = diagram.model.nodeDataArray[nd];
                            var deviceNode = false;
                            for (var nak = 0; nak < newDeviceList.length; nak++) {
                                if (diagram.model.nodeDataArray[nd].deviceId === newDeviceList[nak].deviceId) {
                                    deviceNode = newDeviceList[nak].deviceId;
                                    break;
                                }
                            }
                            if (deviceNode) {
                                for (var dvk = 0; dvk < newNodeList.length; dvk++) {
                                    if (newNodeList[dvk].deviceId === foundNode.deviceId) {
                                        if (newNodeList[dvk].ports) {
                                            for (var dvl = 0; dvl < newNodeList[dvk].ports.length; dvl++) {
                                                for (var dvp = 0; dvp < foundNode.ports.length; dvp++) {
                                                    if (foundNode.ports[dvp].portName.toLowerCase() === newNodeList[dvk].ports[dvl].toLowerCase()) {
                                                        if (['ips', 'ids'].indexOf(foundNode.nodeType.toLowerCase()) >= 0) {
                                                            if (Array.isArray(diagram.devicesNodeMapCopy[foundNode.deviceId])) {
                                                                diagram.devicesNodeMapCopy[foundNode.deviceId][dvp] = newNodeList[dvk].id;
                                                            }
                                                        } else {
                                                            diagram.devicesNodeMapCopy[foundNode.deviceId] = newNodeList[dvk].id;
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
                                        } else {
                                            diagram.devicesNodeMapCopy[foundNode.deviceId] = newNodeList[dvk].id;
                                        }
                                    }
                                }
                            } else {
                                //Created cloud Case
                                if (diagram.devicesNodeMapCopy[-foundNode.key] === 'cloud') {
                                    for (var dk = 0; dk < newNodeList.length; dk++) {
                                        if (newNodeList[dk].type.toLowerCase() === 'cloud') {
                                            diagram.devicesNodeMapCopy[-foundNode.key] = newNodeList[dk].id;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        saveEditedLinks();
                    });
                }

                // Topo clear modal
                ctrlDiagram.cleanupTopo = function () {
                    var role = Enum.get('Role');
                    if (role.length && role[0].roleId) {
                        SystemUser.getUserGroup(role[0].roleId).then(function (data) {
                            // check if the user role is allowed to edit all kinds of devices in the topo again, in case the user permission is changed at the backend
                            var modalInstance;
                            var ModalInstanceCtrl;
                            if (ctrlDiagram.checkAllDeviceAccess(data, scope.devices)) {
                                ModalInstanceCtrl = function ($scope, $modalInstance, Topology, $state, topologyId, Signature) {
                                    $scope.hasDeployment = false;
                                    Signature.getDeployedPolicy('BLACKLIST').then(function (data) {
                                        if (data.data.length > 0) {
                                            $scope.hasDeployment = true;
                                        } else {
                                            Signature.getDeployedPolicy('WHITELIST').then(function (data) {
                                                $scope.hasDeployment = data.data.length > 0;
                                            });
                                        }
                                    });

                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };

                                    $scope.confirm = function () {
                                        Topology.cleanup(topologyId.id).then(function () {
                                            $state.reload();
                                        });
                                        $modalInstance.close('done');
                                    };
                                };
                                modalInstance = $modal.open({
                                    templateUrl: 'templates/topology/singleTopo/cleanupConfirmation.html',
                                    size: 'sm',
                                    controller: ModalInstanceCtrl
                                });

                                modalInstance.result.then(function () {
                                }, function () {
                                });
                            } else {
                                ModalInstanceCtrl = function ($scope, $modalInstance) {
                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                };
                                modalInstance = $modal.open({
                                    templateUrl: 'templates/topology/singleTopo/hasNoAuthority.html',
                                    size: 'sm',
                                    controller: ModalInstanceCtrl
                                });
                            }
                        });
                    }

                };

                ctrlDiagram.uploadCheckAuthority = function () {
                    var role = Enum.get('Role');
                    if (role.length && role[0].roleId) {
                        SystemUser.getUserGroup(role[0].roleId).then(function (data) {
                            if (ctrlDiagram.checkAllDeviceAccess(data, scope.devices)) {
                                ctrlDiagram.uploadTopologyModal();
                            } else {
                                var ModalInstanceCtrl = function ($scope, $modalInstance) {
                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                };
                                $modal.open({
                                    templateUrl: 'templates/topology/singleTopo/hasNoAuthority.html',
                                    size: 'sm',
                                    controller: ModalInstanceCtrl
                                });
                            }
                        });
                    }
                };

                ctrlDiagram.uploadTopologyModal = function () {
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
                        $rootScope.uploadTaskPromise = null;
                    });

                    function ModalInstanceCtrl($scope, $modalInstance, FileUploader, URI, System, topologyId, $rootScope, $q) {
                        $scope.isDPIUpgrading = System.isDPIUpgrading();

                        var dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
                            $scope.isDPIUpgrading = System.isDPIUpgrading();
                        });
                        $scope.$on('destroy', function () {
                            dpiUpgradeStateHandler();
                        });

                        var uploader = $scope.uploader = new FileUploader({
                            url: URI + '/files/topology/' + topologyId.id + '/fileupload',
                            autoUpload: true,
                            removeAfterUpload: true,
                            queueLimit: 1
                        });
                        var deferred = $q.defer();

                        uploader.onSuccessItem = function (item, response, status) {
                            $rootScope.uploadTaskPromise = null;
                            $rootScope.$broadcast('updateDashboardHeader');
                            if (response.warningInfos.length) {
                                $rootScope.addAlert({
                                    type: 'warning',
                                    content: '警告!\n- ' + response.warningInfos.join("\n- ")
                                });
                            } else if (status === 200) {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '拓扑文件上传成功'
                                });
                            }
                        };

                        uploader.onProgressAll = function () {
                            $rootScope.uploadTaskPromise = deferred.promise;
                            $modalInstance.close();
                        };

                        uploader.onErrorItem = function (item, response) {
                            $rootScope.uploadTaskPromise = null;
                            $rootScope.addAlert({
                                type: 'danger',
                                content: response.error
                            });
                        };

                        $scope.ok = function () {
                            $rootScope.uploadTaskPromise = null;
                            $modalInstance.close();
                        };

                        $scope.cancel = function () {
                            $rootScope.uploadTaskPromise = null;
                            $modalInstance.dismiss('cancel');
                        };
                    }
                };

                // Cannot delete a device modal and warngin
                ctrlDiagram.cannotDelete = function (devices) {
                    var modalInstance = $modal.open({
                        templateUrl: 'templates/asset/cannotDelete.html',
                        controller: ModalInstanceCtrl,
                        size: 'sm',
                        resolve: {
                            devices: function () {
                                return devices;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                    }, function () {
                    });

                    function ModalInstanceCtrl($scope, $modalInstance, devices) {
                        $scope.devices = devices;
                        $scope.cancel = function () {
                            $modalInstance.close();
                        };
                    }
                };

                function removeCloudNode(data) {
                    cloudNodeToRemove.push(data);
                }

                // Delete a device modal and warngin
                ctrlDiagram.deleteDevice = function (dvc, other) {
                    var modalInstance = $modal.open({
                        templateUrl: 'templates/asset/deleteDevice.html',
                        controller: ModalInstanceCtrl,
                        size: 'sm',
                        resolve: {
                            device: function () {
                                return dvc;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                    }, function () {
                    });

                    function ModalInstanceCtrl($scope, $modalInstance, device) {
                        $scope.device = (device.length === 1) ? device[0].data : device;
                        $scope.ok = function () {
                            $modalInstance.close();
                            for (var ie = 0; ie < device.length; ie++) {
                                diagram.remove(device[ie]);
                                deleteFromInvalidList(ctrlDiagram.invalidDeviceList, device[ie].data);
                                if (ctrlDiagram.invalidDeviceList.length === 0) {
                                    ctrlDiagram.invalid = false;
                                }
                                pickADeviceToBeSelected();
                                var newArray = [];
                                for (var count = 0; count < diagram.allData.nodes.length; count++) {
                                    (diagram.allData.nodes[count].deviceId !== device[ie].data.deviceId) ? newArray.push(diagram.allData.nodes[count]) : '';
                                }
                                diagram.allData.nodes = newArray;
                                if (device[ie].data.iconType === 'cloud') {
                                    removeCloudNode(device[ie].data);
                                }
                            }
                            for (ie = 0; ie < other.length; ie++) {
                                diagram.remove(other[ie]);
                                deleteFromInvalidList(ctrlDiagram.invalidDeviceList, other[ie].data);
                                if (ctrlDiagram.invalidDeviceList.length === 0) {
                                    ctrlDiagram.invalid = false;
                                }
                                pickADeviceToBeSelected();
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    }
                };

                // EnterEdit - toggles by the edit button, enables edit only features or saves changes
                ctrlDiagram.EnterEdit =
                    function EnterEdit(exit) {
                        if (exit) {
                            ctrlDiagram.EditMode = !ctrlDiagram.EditMode;
                            ctrlDiagram.lastSelection = false;
                            ctrlDiagram.invalidDeviceList = [];
                            diagram.toolManager.dragSelectingTool.isEnabled = false;
                            diagram.toolManager.contextMenuTool.isEnabled = false;
                            diagram.maxSelectionCount = 1;
                            scope.render('update');
                            checkDiscoveredDevices(exit);
                        } else {
                            if (!ctrlDiagram.EditMode) {
                                Learning.getLearningTasks().then(function (data) {
                                    var arr = data.data;
                                    var abort = false;
                                    for (var i = 0; i < arr.length; i++) {
                                        // if there are learning tasks and at least one of them is in processing or paused state, display warning message
                                        if (arr[i].state === "PROCESSING" || arr[i].state === "PAUSED") {
                                            abort = true;
                                        }
                                    }
                                    if (abort) {
                                        var modalInstance = $modal.open({
                                            templateUrl: 'templates/topology/singleTopo/learingInProgressAlert.html',
                                            size: 'sm',
                                            controller: modalController
                                        });
                                        modalInstance.result.then(function (selected) {
                                            if (selected) {
                                                startEdit(exit);
                                            }
                                        });
                                    } else {
                                        startEdit(exit);
                                    }
                                });
                            } else {
                                diagram.startTransaction("Edit");
                                ctrlDiagram.isUpdating = true;
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

                                if (scope.selectedDeviceInTable && scope.selectedDeviceInTable.deviceId && scope.selectedDeviceInTable.isEdited && !scope.selectedDeviceInTable.invalid) {
                                    saveEditedDevice(scope.selectedDeviceInTable);
                                }

                                topologyValidate();
                                diagram.commitTransaction("Edit");
                            }
                        }
                    };

                function startEdit(exit) {
                    diagram.startTransaction("Edit");
                    ctrlDiagram.isUpdating = false;
                    for (var fa = 0; fa < diagram.model.linkDataArray.length; fa++) {
                        if (diagram.model.linkDataArray[fa].fromPort === 'unspecified') {
                            diagram.model.setDataProperty(diagram.model.linkDataArray[fa], "fromPort", "foreGround");
                        }
                        if (diagram.model.linkDataArray[fa].toPort === 'unspecified') {
                            diagram.model.setDataProperty(diagram.model.linkDataArray[fa], "toPort", "foreGround");
                        }
                    }
                    diagram.toolManager.dragSelectingTool.isEnabled = true;
                    diagram.toolManager.contextMenuTool.isEnabled = true;
                    diagram.maxSelectionCount = Number.MAX_VALUE;
                    diagram.model.isReadOnly = false;
                    ctrlDiagram.EditMode = true;
                    diagram.updateAllTargetBindings('nameInDetail');
                    diagram.updateAllTargetBindings('linkId');
                    checkDiscoveredDevices(exit);
                    diagram.commitTransaction("Edit");
                }

                function modalController($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.close(false);
                    };
                    $scope.confirm = function () {
                        $modalInstance.close(true);
                    };
                }

                function checkDiscoveredDevices(exit) {
                    // If found new dicovered device with same serial number, confirm if should merge.
                    Device.getNewDevices({'$orderby': 'name'}).then(function (data) {
                        var newDiscoveredDevices = [];
                        var index = 0;
                        var targetNode = {};
                        for (var i in data) {
                            if (i) {
                                for (var j in diagram.model.nodeDataArray) {
                                    if (j) {
                                        if (exit && !diagram.model.nodeDataArray[j].deviceId) {
                                            continue;
                                        }
                                        if (diagram.model.nodeDataArray[j].category === "SECURITY_DEVICE") {
                                            if (data[i].serialNumber === diagram.model.nodeDataArray[j].serialNumber) {
                                                newDiscoveredDevices[index] = data[i];
                                                targetNode = diagram.model.nodeDataArray[j];
                                                index++;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (newDiscoveredDevices.length > 0) {
                            $q.when(confirmation($modal, $q, newDiscoveredDevices, targetNode)).then(function () {
                                var deferred = $q.defer();
                                var promises = [];
                                for (var k in newDiscoveredDevices) {
                                    if (k) {
                                        promises.push(Device.addToCurrentTopology(newDiscoveredDevices[k].deviceId, ''));
                                    }
                                }
                                $q.all(promises).then(function () {
                                    deferred.resolve('success');
                                    $state.reload();
                                    $rootScope.addAlert({
                                        type: 'success',
                                        content: '加入当前拓扑成功'
                                    });
                                }, function (data) {
                                    deferred.resolve('加入当前拓扑失败');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '加入当前拓扑失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                                    });
                                });
                            });
                        }
                    });
                }

                function confirmation($modal, $q, newDiscoveredDevices, existingSecurityDevices) {
                    var names = [];
                    for (var i in newDiscoveredDevices) {
                        if (i) {
                            names[i] = newDiscoveredDevices[i].name;
                        }
                    }
                    var deferred = $q.defer();
                    $modal.open({
                        size: 'sm',
                        templateUrl: 'templates/asset/securitydevice/confirm-panel.html',
                        controller: function ($scope, $modalInstance) {
                            $scope.title = '发现相同序列号设备';
                            $scope.content1 = '已安装设备中" ' + existingSecurityDevices.nameInDetail + ' "与自动发现的新设备＂' + names + '＂序列号相同（SN: ' + existingSecurityDevices.serialNumber + '）。';
                            $scope.content2 = '请注意，此操作可能会导致"' + existingSecurityDevices.nameInDetail + '"的设备规格与MAC地址被覆盖。';
                            $scope.confirm = function () {
                                $modalInstance.close();
                                deferred.resolve();
                            };
                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                                deferred.reject();
                            };
                        }
                    });
                    return deferred.promise;
                }

                // Constructor used to help create canvas links
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

                // Main function that parses and constructs the canvas diagram from data returned by MW
                function putDiagramData(data) {
                    // Prevents user for Editing while the topology is drawing (shoudl never actually be visible due to draw speed)
                    scope.drawing = true;
                    diagram.topologyId = data.topologyId;

                    // getConnectionPairs - results visible in third accordian panel of ACL table for SECURITY DEVICES
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
                    var devicesNodeMap = {}, devicesNodeMapCopy = {}, deviceMap = {}, nodePropertyMap = {}, zoneNameMap = {}, nodeToDevice = {}, nodeCopy = {}, deviceNodesHolder = {};
                    // Popualte reference objects devicesNodeMap, devicesNodeMapCopy, zoneNameMap with device placeholders
                    for (var ak = 0; ak < data.devices.length; ak++) {
                        (data.devices[ak].category === "SECURITY_DEVICE") ? deviceNodesHolder[data.devices[ak].deviceId] = [] : '';
                        zoneNameMap[data.devices[ak].deviceId] = {};
                        devicesNodeMap[data.devices[ak].deviceId] = [];
                        devicesNodeMapCopy[data.devices[ak].deviceId] = [];
                        for (var p = 0; p < data.devices[ak].devicePorts.length; p++) {
                            devicesNodeMap[data.devices[ak].deviceId].push(-1);
                            devicesNodeMapCopy[data.devices[ak].deviceId].push(-1);
                            zoneNameMap[data.devices[ak].deviceId][p] = "NA";
                        }
                    }

                    // Popualte reference objects devicesNodeMap, devicesNodeMapCopy, zoneNameMap, deviceMap with data from nodes
                    // Neccessary because canvas objects drawn from topology devices, some info only found in nodes (links, nodeType, location, etc)
                    // Also parses out and saves clouds - not a topology devices
                    for (var i = 0; i < data.nodes.length; i++) {
                        if (data.nodes[i].type !== "CLOUD") {
                            nodeToDevice[data.nodes[i].id] = data.nodes[i].deviceId;
                            if (data.nodes[i].ports && ['ips', 'routing_ips', 'ids'].indexOf(data.nodes[i].type.toLowerCase()) >= 0) {
                                nodePropertyMap[data.nodes[i].deviceId] = nodePropertyMap[data.nodes[i].deviceId] || {};
                                nodePropertyMap[data.nodes[i].deviceId][Math.floor(Number(data.nodes[i].ports[0][1]) / 2)] = data.nodes[i].nodeProperty;
                            }
                            zoneNameMap[data.nodes[i].deviceId][(data.nodes[i].ports && data.nodes[i].ports[0]) ? Math.floor(Number(data.nodes[i].ports[0][1]) / 2) : 0] = data.nodes[i].zoneName;
                            deviceMap[data.nodes[i].deviceId] = {
                                positionNodeId: data.nodes[i].id,
                                loc: data.nodes[i].x + " " + data.nodes[i].y,
                                x: data.nodes[i].x,
                                y: data.nodes[i].y,
                                iconType: Device.getIconName(data.nodes[i]._iconType),
                                nodeType: data.nodes[i].type,
                                subcategory: data.nodes[i]._subcategory
                            };

                            (deviceNodesHolder[data.nodes[i].deviceId]) ? deviceNodesHolder[data.nodes[i].deviceId].push(data.nodes[i].ports) : '';

                            if (!scope.routingIPS && data.nodes[i].type === 'ROUTING_IPS') {
                                scope.routingIPS = true;
                            }

                            for (var dvk = 0; dvk < data.devices.length; dvk++) {
                                if (data.devices[dvk].deviceId === data.nodes[i].deviceId) {
                                    if (data.nodes[i].ports) {
                                        for (var dvl = 0; dvl < data.nodes[i].ports.length; dvl++) {
                                            for (var dvp = 0; dvp < data.devices[dvk].devicePorts.length; dvp++) {
                                                if (data.devices[dvk].devicePorts[dvp].portName.toLowerCase() === data.nodes[i].ports[dvl].toLowerCase()) {
                                                    if (Array.isArray(devicesNodeMap[data.devices[dvk].deviceId])) {
                                                        devicesNodeMap[data.devices[dvk].deviceId][dvp] = data.nodes[i].id;
                                                    }
                                                    if (['ips', 'ids'].indexOf(data.nodes[i].type.toLowerCase()) >= 0) {
                                                        if (Array.isArray(devicesNodeMapCopy[data.devices[dvk].deviceId])) {
                                                            devicesNodeMapCopy[data.devices[dvk].deviceId][dvp] = data.nodes[i].id;
                                                        }
                                                    } else {
                                                        devicesNodeMapCopy[data.devices[dvk].deviceId] = data.nodes[i].id;
                                                    }
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
                            portIdRef: false,
                            nodeType: 'CLOUD',
                            deviceId: 'cloud'
                        };
                        cloudHolder.push(cloudData);
                    }

                    var deviceCount = 1;
                    var deviceToKey = {}, keyToDevice = {};
                    var firstSecurityDevice = false, internalLinks = [];

                    // Main canvas populator - parse devices list to insert as canvas items
                    for (var ai = 0; ai < data.devices.length; ai++) {
                        var currDevice = data.devices[ai];
                        if (!deviceMap[currDevice.deviceId]) {
                            continue;
                        }
                        var updateTimeDevice = currDevice.updatedAt;
                        var mmgtPortDevice, mmgtPortIPDevice, macDevice, netMaskDevice;
                        mmgtPortDevice = mmgtPortIPDevice = macDevice = netMaskDevice = '';

                        for (var d = 0; d < currDevice.devicePorts.length; d++) {
                            if (currDevice.devicePorts[d].isMgmtPort) {
                                mmgtPortDevice = currDevice.devicePorts[d].linkState || '';
                                mmgtPortIPDevice = currDevice.devicePorts[d].portIp || '';
                                macDevice = currDevice.devicePorts[d].mac || '';
                                netMaskDevice = currDevice.devicePorts[d].netMask || '';
                            }
                        }

                        // Another refrence used when making links
                        deviceToKey[currDevice.deviceId] = deviceCount;

                        var routingMode = (deviceMap[currDevice.deviceId].nodeType === 'ROUTING_IPS');
                        var allDisconnectedPairs;

                        if (routingMode) {
                            var ka;
                            //Now for given device, iterate to find the ndoes that belong to it
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
                                        if (!currDevice.devicePorts[ka].isMgmtPort && currDevice.devicePorts[ka].netMask && currDevice.devicePorts[ka].netMask !== '0' && !scope.forms.netMasks[currDevice.devicePorts[ka].netMask]) {
                                            // If the net mask in db is an IP, change the value to Int.
                                            currDevice.devicePorts[ka].netMask = scope.forms.netMasks.indexOf(currDevice.devicePorts[ka].netMask);
                                        }
                                    }
                                }
                            }
                        }

                        var modeDescription = (deviceMap[currDevice.deviceId].nodeType && deviceMap[currDevice.deviceId].nodeType === 'ROUTING_IPS' ? '路由保护' :
                            (deviceMap[currDevice.deviceId].nodeType && (deviceMap[currDevice.deviceId].nodeType === 'IDS' ? '监测审计' :
                                (deviceMap[currDevice.deviceId].nodeType && (deviceMap[currDevice.deviceId].nodeType === 'IPS' ? ((currDevice._subCategory === 'DATA_COLLECTION_DEVICE') ? '数采隔离' : '智能保护') : '')))));

                        // Canvas items format each device item will have this set of info behind it
                        var deviceData = {
                            key: -deviceCount,
                            nodeId: deviceMap[currDevice.deviceId].positionNodeId,
                            topologyId: data.topologyId,
                            currentTopology: data.currentTopology,
                            deviceId: currDevice.deviceId,
                            img: (currDevice.category === "SECURITY_DEVICE") ? Device.getSecurityDeviceIconPath(currDevice._model_name, currDevice.iconType) : 'images/' + deviceMap[currDevice.deviceId].iconType.toLowerCase() + '-icon.png',
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
                            deviceOnline: currDevice.deviceSource === 'DISCOVERY' ? currDevice.deviceOnline : 0,
                            deviceSource: currDevice.deviceSource,
                            updateTime: updateTimeDevice,
                            mac: macDevice,
                            ip: mmgtPortIPDevice,
                            netMask: netMaskDevice,
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
                            startDatetime: currDevice.startDatetime,
                            nodeProperty: nodePropertyMap[currDevice.deviceId],
                            zoneName: zoneNameMap[currDevice.deviceId],
                            modelIdentifier: currDevice.modelIdentifier,
                            hasWireless: currDevice.hasWireless,
                            hasUSB: currDevice.hasUSB,
                            // For Grouping
                            group: currDevice.groupId
                        };

                        // If device is subnet, will have to parse ip notation into valid ip and netmask
                        if (deviceData.iconType === 'subnet' && deviceData.ip.indexOf('/') >= 0) {
                            deviceData.subnetIp = deviceData.ip;
                            var netMask = '', maskNumerals = deviceData.ip.split('/');
                            deviceData.ip = maskNumerals[0];
                            for (var nm = 0; nm < 4; nm++) {
                                var maskBits = (maskNumerals[1] > 0 ) ? ((maskNumerals[1] = maskNumerals[1] - 8) > 0) ? Array(9).join("1") : Array(maskNumerals[1] + 9).join("1") + Array(1 - maskNumerals[1]).join("0") : "0";
                                netMask = netMask + parseInt(maskBits, 2).toString();
                                (nm !== 3) ? netMask = netMask + '.' : '';
                            }
                            deviceData.netMask = netMask;
                        }

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

                        // Determin online status
                        if (deviceData && deviceData.category === 'SECURITY_DEVICE') {
                            if (deviceData.deviceSource === 'DISCOVERY') {
                                if (deviceData.deviceOnline === 1) {
                                    deviceData.statusText = "连线";
                                    deviceData.indicator = "bullet bullet-online";
                                    deviceData.statusIconShow = false;
                                    deviceData.statusColor = "green";
                                } else if (deviceData.deviceOnline === -1) {
                                    deviceData.statusText = "掉线";
                                    deviceData.indicator = "bullet bullet-offline";
                                    deviceData.statusIconShow = true;
                                    deviceData.statusColor = "red";
                                } else {
                                    deviceData.statusText = "未激活";
                                    deviceData.indicator = "bullet bullet-unactivated";
                                    deviceData.statusIconShow = true;
                                    deviceData.statusColor = "red";
                                }
                            } else {
                                deviceData.statusText = "未激活";
                                deviceData.indicator = "bullet bullet-unactivated";
                                deviceData.statusIconShow = true;
                                deviceData.statusColor = "red";
                            }
                        } else {
                            deviceData.statusText = "";
                            deviceData.statusIconShow = false;
                            deviceData.statusColor = "white";
                        }

                        // Finds position of FIRST security device in the diagram
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

                    // Insert any found clouds into the diagram
                    for (var bi = 0; bi < cloudHolder.length; bi++) {
                        deviceToKey[deviceCount] = deviceCount;
                        keyToDevice[deviceCount] = cloudHolder[bi].key;
                        nodeToDevice[cloudHolder[bi].key] = deviceCount;
                        devicesNodeMapCopy[deviceCount] = cloudHolder[bi].key;
                        cloudHolder[bi].key = -deviceCount;
                        nodeDataArray.push(cloudHolder[bi]);
                        deviceCount++;
                    }

                    // Parse and create links, use references from above to map form node ID to canvas item keys
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
                                        fromPort = deviceMap[nodeToDevice[data.links[j].nodeID]].nodeType === 'ROUTING_IPS' ? "foreGround" : deviceMap[nodeToDevice[data.links[j].nodeID]].devicePorts[nc].portName.toLowerCase();
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
                                        toPort = deviceMap[nodeToDevice[data.links[j].destinationNodeID]].nodeType === 'ROUTING_IPS' ? "foreGround" : deviceMap[nodeToDevice[data.links[j].destinationNodeID]].devicePorts[nb].portName.toLowerCase();
                                    }
                                    break;
                                }
                            }
                        }

                        linkDataArray.push(new linkTemp(data.links[j].id, from, to, fromPort, toPort));
                        linkCopy[data.links[j].id] = new linkTemp(data.links[j].id, from, to, fromPort, toPort);
                    }

                    // Include the crosslinks of any IPS devices made earlier
                    linkDataArray = linkDataArray.concat(internalLinks);

                    //Group Creation
                    var groupRef = {leave: null, removed: [], edited: [], obsolete: []};
                    for (bi = 0; bi < data.groups.length; bi++) {
                        var empty = true;
                        var groupData = {key: -deviceCount};
                        groupData.nameInDetail = data.groups[bi].groupName;
                        groupData.x = data.groups[bi].groupX;
                        groupData.y = data.groups[bi].groupY;
                        groupData.initialExpansion = data.groups[bi].isExpaneded;
                        groupData.groupId = data.groups[bi].groupId;
                        groupData.topologyId = data.topologyId;
                        groupData.currentTopology = data.currentTopology;
                        groupData.img = ctrlDiagram.groupIcon;
                        groupData.category = (data.category) ? data.category : "";
                        groupData.updateTime = new Date().toJSON();
                        groupData.statusIconShow = data.category === "SECURITY_DEVICE";
                        groupData.nodeType = (!data.deviceType || data.deviceType === 'Cloud') ? "CLOUD" : (data.deviceType === '网络交换机') ? "SWITCH" : (data.deviceType === '路由器') ? "ROUTER" : ( data.deviceType === "安全设备" ) ? "IPS" : "ENDPOINT";
                        groupData.isEdited = false;
                        groupData.iconType = (data.img) ? data.img.substring(7, data.img.length - 9) : "cloud";
                        groupData.modelId = "Group";
                        groupData.deviceId = "";
                        groupData.statusShade = '';
                        groupData.preview = "";
                        groupData.isGroup = true;
                        deviceCount++;

                        groupRef[data.groups[bi].groupId] = groupData.key;
                        for (j = 0; j < nodeDataArray.length; j++) {
                            if (nodeDataArray[j].group && Number(nodeDataArray[j].group) === groupData.groupId) {
                                nodeDataArray[j].group = groupData.key;
                                empty = false;
                            }
                        }
                        if (empty) {
                            groupRef.obsolete.push(data.groups[bi].groupId);
                        } else {
                            nodeDataArray.push(groupData);
                        }
                    }

                    // Set diagram references to use for saving and editing
                    diagram.groupRef = groupRef;
                    diagram.linkCopy = linkCopy;
                    nodeCopy["length"] = nodeDataArray.length;
                    nodeCopy["count"] = deviceCount;
                    diagram.nodeCopy = nodeCopy;
                    diagram.devicesNodeMapCopy = devicesNodeMapCopy;
                    keyToDevice.length = nodeDataArray.length;
                    diagram.keyToDevice = keyToDevice;
                    diagram.allData = data;
                    diagram.currentTopology = data.currentTopology;
                    diagram.topologyId = data.topologyId;
                    diagram.topoName = data.name;
                    diagram.blankModelId = data.blankModel;
                    diagram.deviceNodesHolder = deviceNodesHolder;

                    // Create the canvas from the nodeDataArray and linkDataArray that parsed links/nodes have been inserted into
                    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
                    diagram.model.linkFromPortIdProperty = "fromPort";
                    diagram.model.linkToPortIdProperty = "toPort";
                    diagram.model.isReadOnly = true;
                    diagram.model.copyNodeDataFunction = copyNodeData;

                    scope.GOJSmodel = diagram.model;
                    // End Draw
                    scope.drawing = false;

                    // Select the first valid SECUIRTY DEVICE or last edited device
                    // If no security devices in valid topology file - just pick first node of diagram
                    if (scope.topologyHasNode) {
                        firstSecurityDevice = (firstSecurityDevice === false) ? 0 : firstSecurityDevice;
                        (ctrlDiagram.lastSelection !== false && diagram.findNodeForKey(-deviceToKey[ctrlDiagram.lastSelection]) ) ? initializeACL(diagram.findNodeForKey(-deviceToKey[ctrlDiagram.lastSelection])) : initializeACL(diagram.findNodeForData(diagram.model.nodeDataArray[firstSecurityDevice]));
                    }

                    // Group collapsed does not imply position property (loc does not fire even if set), so check and set group expansion and location;
                    for (var count = 0; count < diagram.model.nodeDataArray.length; count++) {
                        if (diagram.model.nodeDataArray[count].isGroup) {
                            snapShot(diagram.findNodeForKey(diagram.model.nodeDataArray[count].key));
                            diagram.findNodeForKey(diagram.model.nodeDataArray[count].key).isSubGraphExpanded = diagram.model.nodeDataArray[count].initialExpansion;
                            if (!diagram.model.nodeDataArray[count].initialExpansion) {
                                diagram.findNodeForKey(diagram.model.nodeDataArray[count].key).location.x = diagram.model.nodeDataArray[count].x;
                                diagram.findNodeForKey(diagram.model.nodeDataArray[count].key).location.y = diagram.model.nodeDataArray[count].y;
                            }
                        }
                    }

                    // Validations of inserted devices
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

    function allDevicesTable(Device, $modal, $rootScope, $stateParams, topologyId, formatVal) {
        var funcs = {};
        var allDevicesObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/topology/singleTopo/devicesTable/table.html',
            link: link
        };

        return allDevicesObj;

        function link(scope, element, attr, ctrl) {
            scope.open = function (device) {
                if (device.category === 'FACTORY_DEVICE') {
                    dialog({
                        tmpl: 'factorySettingDialog.html',
                        device: device,
                        size: 'sm',
                        ctrl: 'factoryCtrl'
                    });
                } else if (device.category === 'SECURITY_DEVICE') {
                    dialog({
                        tmpl: 'securitySettingDialog.html',
                        device: device,
                        size: 'lg',
                        ctrl: 'securityCtrl'
                    });
                }
            };

            scope.disableWhenTopologyInUse = function () {
                if (!$stateParams.topo) {
                    return false;
                }
                if (topologyId.id && $stateParams.topo === topologyId.id) {
                    return false;
                }
                return true;
            };

            ctrl.setConfig({
                name: 'device',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                return Device.getAll(params, scope.topo);
            }

            function getCount(params) {
                return Device.getCount(params, scope.topo);
            }

            function search(q) {
                return Device.search('SECURITY_DEVICE', q);
            }
        }

        function dialog(opt) {
            [
                function factoryCtrl($scope, $modalInstance) {
                    $scope.validateIp = angular.copy(formatVal.getIPRangeReg());
                    $scope.deviceCopy = angular.copy(opt.device);
                    $scope.confirm = function () {
                        if ($scope.deviceCopy.invalid) {
                            return;
                        }
                        var portIp = {
                            iporsubnet: $scope.deviceCopy.devicePorts[0].portIp
                        };

                        Device.updateSingleIpSubnet(opt.device.topologyId, opt.device.deviceId, portIp).then(function (data) {
                            if (data.message) {
                                $scope.updateSingleIpSubnetErrorMsg = data.message;
                            } else {
                                opt.device.devicePorts = data;
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: opt.device.name + '已保存'
                                });
                                $modalInstance.close();
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },

                function securityCtrl($scope, $modalInstance) {
                    $scope.device = opt.device;
                    $scope.device.port = opt.device.port;
                    $scope.deviceCopy = angular.copy(opt.device);
                    $scope.confirm = function () {
                        var copy = $scope.deviceCopy.devicePorts;
                        for (var i = 0; i < copy.length; i++) {
                            if (copy[i].isMgmtPort) {
                                continue;
                            } else if (copy[i].mask || copy[i].ip || !copy[i].portIp || !copy[i].netMask) {
                                return;
                            }
                        }
                        var portArr = [];
                        $scope.deviceCopy.devicePorts.forEach(function (port) {
                            portArr.push({
                                portId: port.portId,
                                portIp: port.portIp,
                                netMask: port.netMask
                            });
                        });

                        Device.updateDevicePort(opt.device.deviceId, portArr).then(function (data) {
                            opt.device.devicePorts = data;
                            $rootScope.addAlert({
                                type: 'success',
                                content: opt.device.name + '已保存'
                            });
                        });
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        opt.device.port = $scope.deviceCopy.port;
                        $modalInstance.dismiss('cancel');
                    };
                }
            ].forEach(function (func) {
                funcs[func.name] = func;
            });
        }
    }

    function upsertToInvalidList(deviceList, device) {
        var exist = false;
        for (var i in deviceList) {
            if (i && deviceList[i].key === device.key) {
                deviceList[i] = device;
                exist = true;
                break;
            }
        }
        if (!exist) {
            deviceList.push(device);
        }
    }

    function deleteFromInvalidList(deviceList, device) {
        for (var i in deviceList) {
            if (i && deviceList[i].key === device.key) {
                deviceList.splice(i, 1);
                break;
            }
        }
    }

})();
