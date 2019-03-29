/**
 * Asset Security Device Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.securitydevice')
        .controller('SecurityDeviceCtrl', SecurityDeviceCtrl)
        .controller('SecurityDeviceDetailCtrl', SecurityDeviceDetailCtrl)
        .controller('SecurityDevicePortsCtrl', SecurityDevicePortsCtrl)
        .controller('SecurityDeviceNewCtrl', SecurityDeviceNewCtrl);

    function SecurityDeviceCtrl(Enum, $modal, $rootScope, $scope, $state, Topology, Device, protocols, uiCtrl, uiTree) {
        uiCtrl.findLand('SECURITY_DEVICE', 1);
        var vm = this;
        vm.editRight = (Enum.get('privilege').filter(function (a) {
            return a.name === 'DEVICE_MANAGEMENT';
        })[0].actionValue === 30);

        // DC Device
        vm.hasDCDevice = ($rootScope.VERSION_NUMBER.slice(-4) !== '-C02' && $rootScope.VERSION_NUMBER.slice(-4) !== '-X00' && $rootScope.VERSION_NUMBER.slice(-4) !== '-X01' && $rootScope.VERSION_NUMBER.slice(-4) !== '-X02' && $rootScope.VERSION_NUMBER.slice(-4) !== '-X03' && $rootScope.VERSION_NUMBER.slice(-5, -2) !== '-JA'); //Hide DC for Baoxin and Xianjinzhizao

        vm.contentEnable = function (target) {
            return uiTree.getContentShow(target);
        };
        vm.defaultTab = vm.contentEnable('NORMAL') ? 'ALL' : vm.contentEnable('DATA_COLLECTION_DEVICE') ? 'DATA_COLLECTION_DEVICE' : 'none';

        $rootScope.$on('addedToCurrentTopology', function () {
            $state.reload();
        });

        vm.uiEnable = function (description, lv) {
            return uiCtrl.isShow(description, lv);
        };
        $scope.editNode = function (node) {
            var origin = angular.copy(node.protocols);
            node.origin = origin;
            node.isEdited = true;
        };
        $scope.editNodeCancel = function (node) {
            var origin = angular.copy(node.origin);
            delete node.origin;
            node.protocols = origin;
            node.isEdited = false;
        };
        $scope.editNodeDone = function (node) {
            var nodeProtocols = [];
            for (var i in node.protocols) {
                if (i) {
                    var item = {};
                    item.nodeId = node.id;
                    item.protocolCategory = node.protocols[i].id;
                    nodeProtocols[i] = item;
                }
            }
            Device.updateNodeProtocols(node.id, nodeProtocols).then(function () {
                $rootScope.addAlert({
                    type: 'success',
                    content: '更改协议成功'
                });
                Topology.getDeviceNodes(node.deviceId).then(function (data) {
                    for (var i in data) {
                        if (i && data[i].id === node.id) {
                            node.updatedAt = data[i].updatedAt;
                            break;
                        }
                    }
                });
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '更改协议失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
            node.isEdited = false;
            delete node.origin;
        };
        $scope.forms = {};
        $scope.forms.protocols = [];
        for (var i in protocols) {
            if (i) {
                var protocol = {};
                protocol.id = protocols[i];
                protocol.label = protocols[i];
                $scope.forms.protocols[i] = protocol;
            }
        }
        $scope.noProtocolTexts = {buttonDefaultText: '无'};
    }

    function SecurityDeviceDetailCtrl(Device, Topology, device, $rootScope, Enum, $scope, $q, $modal, $state, System, protocols, models, snVal, formatVal, dupeInfo, allDeviceFull, deviceTypeService) {
        var vm = this;
        vm.simplifyModelName = deviceTypeService.simplifyModelName;
        vm.isDPIUpgrading = System.isDPIUpgrading();
        var alldevice;

        dupeInfo.allDevice(allDeviceFull).then(function (data) {
            alldevice = data;
        });
        $rootScope.$on('dpiUpgradeState', function () {
            vm.isDPIUpgrading = System.isDPIUpgrading();
        });

        vm.editRight = (Enum.get('privilege').filter(function (a) {
            return a.name === 'DEVICE_MANAGEMENT';
        })[0].actionValue === 30);

        vm.device = device;
        vm.modelName = vm.device._model_name.substring(vm.device._model_name.lastIndexOf(' ') + 1);
        vm.device.showRoutingInfo = device.nodes[0] && device.nodes[0].type === 'ROUTING_IPS';
        vm.validateIp = angular.copy(formatVal.getIPReg());
        vm.validateMac = angular.copy(formatVal.getMACReg());
        vm.validateSubnet = angular.copy(formatVal.getSubnetReg());
        vm.validPortEdit = true;

        // Get Protrocol for DC Device:
        if (vm.device._subCategory === "DATA_COLLECTION_DEVICE") {
            Topology.getDeviceNodes(vm.device.deviceId).then(function (nodes) {
                for (var j in nodes) {
                    if (j) {
                        nodes[j].protocols = [];
                        for (var k in nodes[j]._nodeProtocolLinks) {
                            if (k) {
                                var protocol = {};
                                protocol.id = nodes[j]._nodeProtocolLinks[k].protocolCategory;
                                protocol.label = nodes[j]._nodeProtocolLinks[k].protocolCategory;
                                nodes[j].protocols[k] = protocol;
                            }
                        }
                    }
                }
                vm.device.nodes = nodes;
            });
        }
        vm.aclData = [];
        vm.acl = {
            acls_numValidate: [],
            acls_sourceIpValidate: [],
            acls_destinationIpValidate: [],
            acls_sourcePortValidate: [],
            acls_destinationPortValidate: [],
            acls_sourceIpEdit: [],
            acls_destinationIpEdit: [],
            acls_sourcePortEdit: [],
            acls_destinationPortEdit: [],
            acls_sourceIpDisable: [],
            acls_destinationIpDisable: [],
            acls_sourcePortDisable: [],
            acls_destinationPortDisable: []
        };
        vm.validate = [];
        vm.subnetsValidate = [];
        vm.nodePortsVisibility = [];

        $scope.editNode = function (node) {
            var origin = angular.copy(node.protocols);
            node.origin = origin;
            node.isEdited = true;
        };
        $scope.editNodeCancel = function (node) {
            var origin = angular.copy(node.origin);
            delete node.origin;
            node.protocols = origin;
            node.isEdited = false;
        };
        $scope.editNodeDone = function (node) {
            var nodeProtocols = [];
            for (var i in node.protocols) {
                if (i) {
                    var item = {};
                    item.nodeId = node.id;
                    item.protocolCategory = node.protocols[i].id;
                    nodeProtocols[i] = item;
                }
            }
            Device.updateNodeProtocols(node.id, nodeProtocols).then(function () {
                $rootScope.addAlert({
                    type: 'success',
                    content: '更改协议成功'
                });
                Topology.getDeviceNodes(node.deviceId).then(function (data) {
                    for (var i in data) {
                        if (i && data[i].id === node.id) {
                            node.updatedAt = data[i].updatedAt;
                            break;
                        }
                    }
                });
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '更改协议失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
            node.isEdited = false;
            delete node.origin;
        };
        $scope.protocols = [];
        for (var i in protocols) {
            if (i) {
                var protocol = {};
                protocol.id = protocols[i];
                protocol.label = protocols[i];
                $scope.protocols[i] = protocol;
            }
        }
        $scope.noProtocolTexts = {buttonDefaultText: '无'};
        $scope.$on('port', function (event, data) {
            var targetPort = vm.device.devicePorts.filter(function (p) {
                return p.portId === data.portId;
            });
            if (targetPort && targetPort[0]) {
                targetPort[0].linkState = data.linkState;
            } else {
                console.log("Cannot find match port with portId");
            }
        });

        $scope.$on("device", function (event, data) {
            if (data.deviceId === vm.device.deviceId) {
                vm.device.deviceOnline = data.deviceOnline;
                vm.device.deviceSource = data.deviceSource;
            }
        });

        var forms = vm.forms = {};
        forms.models = models;
        forms.netMasks = angular.copy(formatVal.getNetMasks());

        for (var k = 0; k < vm.device.nodes.length; k++) {
            if (vm.device.nodes[k]) {
                for (var j = 0; j < vm.device.nodes[k].ports.length; j++) {
                    vm.nodePortsVisibility.push(vm.device.nodes[k].ports[j]);
                }
            }
        }

        vm.checkNodePortsVisibility = function (pId) {
            var inputPid = pId;
            return !!_.find(vm.nodePortsVisibility, function (num) {
                return num === inputPid;
            });
        };

        vm.device.devicePorts.forEach(function (port) {
            if (!port.isMgmtPort) {
                if (!port.netMask || port.netMask === '0') {
                    port.netMaskIP = '';
                } else {
                    // If the net mask in db is an Int, display as an IP; if it is an IP, display as an IP and change the backend value to Int so it will be saved as Int.
                    if (forms.netMasks[port.netMask]) {
                        port.netMaskIP = forms.netMasks[port.netMask];
                    } else {
                        port.netMaskIP = port.netMask;
                        port.netMask = forms.netMasks.indexOf(port.netMaskIP);
                    }
                }
                if (!port._subnets) {
                    port._subnets = [];
                }
            }
        });

        vm.checkPortEdit = function (ip, mask, index) {
            vm.portsEditValidation[index - 1] = (ip !== undefined && !formatVal.validateIp(ip) && mask !== undefined && mask > 0);
            vm.validPortEdit = vm.portsEditValidation.indexOf(false) === -1;
        };

        vm.updateNodeProperty = function (node) {
            var param = {'nodeProperty': node.tempNodeProperty};
            node.isedting = false;
            return Device.updateNodeProperty(node.id, param).then(function (data) {
                $rootScope.addAlert({
                    type: 'success',
                    content: '修改部署属性成功'
                });
                node.nodeProperty = data.nodeProperty;
            }, function () {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '修改部署属性失败'
                });
            });
        };

        vm.editIP = function () {
            vm.editedInfo = angular.copy(vm.device);
            for (var i = 0; i < vm.device.devicePorts.length; i++) {
                if (vm.device.devicePorts[i].isMgmtPort) {
                    vm.editedInfo.ip = vm.device.devicePorts[i].portIp;
                    vm.editedInfo.mac = vm.device.devicePorts[i].mac;
                    break;
                }
            }
            vm.invalidIp = !vm.editedInfo.ip || formatVal.validateIp(vm.editedInfo.ip);
            vm.invalidMac = vm.editedInfo.mac && !(vm.editedInfo.mac.match(vm.validateMac));
            vm.hasDuplicateIP = dupeInfo.dupeCheck(vm.editedInfo.deviceId, 'ip', vm.editedInfo.ip, alldevice);
            vm.hasDuplicateMAC = dupeInfo.dupeCheck(vm.editedInfo.deviceId, 'mac', vm.editedInfo.mac, alldevice);
            vm.isIPEdited = true;
        };

        vm.editIPCancel = function () {
            initDeviceView(vm.device);
            portMapToArr(vm.device.notConnectedPortMap);
            vm.isIPEdited = false;
        };

        vm.editIPDone = function () {
            var portId = "";
            for (var i = 0; i < vm.editedInfo.devicePorts.length; i++) {
                var tmp = vm.editedInfo.devicePorts[i];
                if (tmp.isMgmtPort) {
                    portId = tmp.portId;
                    break;
                }
            }
            var portIpMac = {
                portIp: vm.editedInfo.ip,
                mac: vm.editedInfo.mac ? vm.editedInfo.mac.toUpperCase() : '',
                portId: portId
            };
            Device.updateMgmIpMac(vm.device.topologyId, vm.device.deviceId, portIpMac).then(function () {
                vm.isIPEdited = false;
                $state.reload().then(function () {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '修改设备管理端口成功'
                    });
                });
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '修改设备管理端口失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        };

        vm.editDevice = function () {
            delete vm.device.port;
            vm.editedInfo = angular.copy(vm.device);
            vm.editedInfo.numOfPorts = vm.device.devicePorts.length > 0 ? vm.device.devicePorts.length - 1 : 0;
            vm.editedInfo.iconType = vm.device.iconType ? vm.device.iconType.toLowerCase() : '';
            vm.isEdited = true;
            validateDevice();
        };

        vm.editCancel = function (isBasicInfo) {
            // For non-basic-info page, (ports&acl), should restore original info
            if (!isBasicInfo) {
                angular.copy(vm.editedInfo, vm.device);
            }
            initDeviceView(vm.device);
            portMapToArr(vm.device.notConnectedPortMap);
            loadAcl();
            vm.isEdited = false;
        };

        vm.editDone = function (tab) {
            var device = {};

            angular.copy(vm.device, device);
            device.name = vm.editedInfo.name;
            device.serialNumber = vm.editedInfo.serialNumber;
            device.make = vm.editedInfo.make;
            device.iconType = vm.editedInfo.iconType;
            device.modelId = vm.editedInfo.modelId;

            delete device.backTo;
            delete device.rules;
            delete device.nodes;
            delete device._rulesCount;
            delete device._signaturesCount;
            delete device._iconName;
            delete device._securityCount;
            delete device.showRoutingInfo;
            delete device.ip;
            delete device.mac;
            delete device.numOfPorts;
            var i;
            for (i = 0; i < device.devicePorts.length; i++) {
                var tmp = device.devicePorts[i];
                delete tmp.netMaskIP;
            }

            if (tab === 'basic') {
                $q.all([
                    Device.getNewDevices({'$orderby': 'name'})
                ]).then(function (data) {
                    var newDiscoveredDevices = data[0];
                    // If found new dicovered device with same serial number, confirm if should merge.
                    var newDiscoveredDevice;
                    var shouldMerge = false;
                    for (var i in newDiscoveredDevices) {
                        if (i && newDiscoveredDevices[i].serialNumber === device.serialNumber) {
                            newDiscoveredDevice = newDiscoveredDevices[i];
                            break;
                        }
                    }
                    if (newDiscoveredDevice) {
                        $q.when(confirmation($modal, $q, newDiscoveredDevice, device)).then(function () {
                            Device.update(device.deviceId, device).then(function () {
                                Device.addToCurrentTopology(newDiscoveredDevice.deviceId, '').then(function () {
                                    vm.isEdited = false;
                                    $state.reload().then(function () {
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '加入当前拓扑成功'
                                        });
                                    });
                                }, function () {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '加入当前拓扑失败'
                                    });
                                });
                            }, function (data) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                                });
                            });
                        });
                    } else {
                        if (vm.newModel) {
                            var newModel = {};
                            newModel.model = vm.editedInfo._model_name;
                            newModel.model_name = vm.editedInfo._model_name;
                            newModel.make = vm.editedInfo.make;
                            newModel.iconType = vm.editedInfo.iconType;
                            newModel.category = 1;
                            Device.createModel(newModel).then(function (data) {
                                device.modelId = data['modelId'];
                                vm.forms.models.splice(1, 0, {
                                    'modelId': data['modelId'],
                                    'model_name': newModel['model_name']
                                });
                                vm.editedInfo['modelId'] = data['modelId'];
                                vm.newModel = false;
                                updateDevice(device, shouldMerge, newDiscoveredDevice);
                            }, function (data) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '添加设备型号失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                                });
                            });
                        } else {
                            device.modelId = vm.editedInfo.modelId;
                            updateDevice(device, shouldMerge, newDiscoveredDevice);
                        }
                    }
                });

            } else if (tab === 'ports') {
                var newRemoteRoutingList = [];
                for (var a = 0; a < device._remoteRoutings.length; a++) {
                    newRemoteRoutingList.push({
                        'networkSegment': device._remoteRoutings[a].networkSegment,
                        'gateway': device._remoteRoutings[a].gateway
                    });
                }

                var portInfo = getPortInfoFunction();
                device.notConnectedPortMap = portInfo.portMap;

                var devicePorts = [];
                for (var b = 0; b < device.devicePorts.length; b++) {
                    if (!device.devicePorts[b].isMgmtPort) {
                        var port = {};
                        port.portId = device.devicePorts[b].portId;
                        port._subnets = [];
                        for (var c = 0; c < device.devicePorts[b]._subnets.length; c++) {
                            if (device.devicePorts[b]._subnets[c].subnet) {
                                port._subnets.push({'subnet': device.devicePorts[b]._subnets[c].subnet});
                            }
                            delete device.devicePorts[b]._subnets[c].createdAt;
                            delete device.devicePorts[b]._subnets[c].portId;
                            delete device.devicePorts[b]._subnets[c].portRoutingId;
                            delete device.devicePorts[b]._subnets[c].status;
                            delete device.devicePorts[b]._subnets[c].updatedAt;
                        }
                        devicePorts.push(port);
                    }
                }

                var portArr = [];
                vm.device.devicePorts.forEach(function (port) {
                    if (!port.isMgmtPort) {
                        portArr.push({
                            portId: port.portId,
                            portIp: port.portIp,
                            netMask: port.netMask
                        });
                    }
                });

                var promises = [];
                var deviceToSave = angular.copy(device);
                for (var d = 0; d < deviceToSave.devicePorts.length; d++) {
                    if (!deviceToSave.devicePorts[d].isMgmtPort) {
                        delete deviceToSave.devicePorts[d].netMaskIP;
                    }
                }
                promises.push(Device.update(device.deviceId, deviceToSave));
                promises.push(Device.updateDevicePort(device.deviceId, portArr));
                promises.push(Device.routing(deviceToSave));

                var deferred = $q.defer();
                $q.all(promises).then(function (results) {
                    var updateError = "";
                    for (var i = 0; i < results.length; i++) {
                        if (typeof results[i].message !== 'undefined' && results[i].message.length > 0) {
                            updateError += (results[i].message + ' ');
                        }
                    }
                    if (!updateError) {
                        vm.isEdited = false;
                        deferred.resolve('SUCCESS');
                        $state.reload().then(function () {
                            $rootScope.addAlert({
                                type: 'success',
                                content: '修改设备成功'
                            });
                        });
                    } else {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '修改设备失败：' + updateError
                        });
                    }
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                    });
                });

            } else if (tab === 'acl') {
                if (vm.device.showRoutingInfo) {
                    vm.confirmAcl().then(function () {
                        loadAcl();
                        vm.isEdited = false;
                    });
                }
            }
        };

        function updateDevice(device) {
            var deviceToSave = angular.copy(device);
            for (var d = 0; d < deviceToSave.devicePorts.length; d++) {
                if (!deviceToSave.devicePorts[d].isMgmtPort) {
                    delete deviceToSave.devicePorts[d].netMaskIP;
                }
            }
            Device.update(device.deviceId, deviceToSave).then(function () {
                vm.isEdited = false;
                $state.reload().then(function () {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '修改设备成功'
                    });
                });
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '修改设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        }

        vm.validateDevice = function () {
            validateDevice();
        };

        function validateDevice() {
            vm.nameError = (!vm.editedInfo.name || vm.editedInfo.name.length === 0);
            vm.serialError = (!vm.editedInfo.serialNumber || vm.editedInfo.serialNumber.length === 0);
            vm.serialFormatError = !snVal.validSNFormat(vm.editedInfo.serialNumber);
            vm.hasDuplicateSN = false;
            if (vm.editedInfo.serialNumber && !vm.serialError && !vm.serialFormatError) {
                vm.hasDuplicateSN = formatVal.checkSerialNumberDup(allDeviceFull, vm.editedInfo.serialNumber, vm.editedInfo.deviceId);
            }
            if (vm.newModel) {
                vm.modelError = (!vm.editedInfo._model_name || vm.editedInfo._model_name.length === 0);
            } else {
                vm.modelError = (!vm.editedInfo.modelId || vm.editedInfo.modelId.length === 0);
            }
        }

        vm.serialNumberChanged = function (sn) {
            vm.editedInfo.model = '';
            vm.editedInfo._model_name = '';
            vm.editedInfo.make = '';
            vm.editedInfo.modelId = '';
            vm.editedInfo.numOfPorts = '';
            var model = snVal.getModelBySN(sn, vm.forms.models);
            if (model) {
                populateModelInfo(model['model']);
            }
        };

        function populateModelInfo(model) {
            for (var i in vm.forms.models) {
                if (i && vm.forms.models[i]['iconType'] && vm.forms.models[i]['model'] === model) {
                    vm.editedInfo.modelId = vm.forms.models[i]['modelId'];
                    vm.editedInfo.make = vm.forms.models[i]['make'];
                    vm.editedInfo.iconType = vm.forms.models[i]['iconType'] ? vm.forms.models[i]['iconType'].toLowerCase() : '';
                    vm.editedInfo.numOfPorts = vm.forms.models[i]['numOfPorts'];
                    vm.editedInfo._model_name = vm.forms.models[i]['model_name'] + ' / ' + vm.forms.models[i]['model'];
                    break;
                }
            }
        }

        vm.configDevice = function (device) {
            var deviceData = angular.copy(device);
            delete deviceData.backTo;
            delete deviceData.rules;
            delete deviceData.nodes;
            delete deviceData._rulesCount;
            delete deviceData._securityCount;
            delete deviceData._signaturesCount;
            delete deviceData._iconName;
            delete deviceData._factoryCount;
            delete deviceData.showRoutingInfo;
            var deferred = $q.defer();
            Device.configDevice(device.deviceId, device).then(function () {
                loadAcl();
                deferred.resolve('SUCCESS');
                $rootScope.addAlert({
                    type: 'success',
                    content: '配置终端成功'
                });
            }, function (data) {
                deferred.resolve('配置终端失败');
                $rootScope.addAlert({
                    type: 'danger',
                    content: '配置终端失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        };

        vm.deployDeviceACL = function (device) {
            var deviceData = angular.copy(device);
            delete deviceData.backTo;
            delete deviceData.rules;
            delete deviceData.nodes;
            delete deviceData._rulesCount;
            delete deviceData._securityCount;
            delete deviceData._signaturesCount;
            delete deviceData._iconName;
            delete deviceData._factoryCount;
            delete deviceData.showRoutingInfo;
            var deferred = $q.defer();
            Device.deployACL(deviceData).then(function () {
                loadAcl();
                deferred.resolve('SUCCESS');
                $rootScope.addAlert({
                    type: 'success',
                    content: '下发成功'
                });
            }, function (data) {
                deferred.resolve('下发失败');
                $rootScope.addAlert({
                    type: 'danger',
                    content: '下发失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        };

        vm.fillValidate = function () {
            vm.validate = [];
            for (var a = 0; a < vm.device._remoteRoutings.length; a++) {
                vm.validate[a] = {
                    'networkSegment': true,
                    'gateway': true
                };
            }

            vm.subnetsValidate = [];
            vm.device.devicePorts.forEach(function (port) {
                var subnets = [];
                if (port.isMgmtPort) {
                    vm.subnetsValidate.push(subnets);
                } else {
                    port._subnets.forEach(function () {
                        subnets.push(true);
                    });
                    vm.subnetsValidate.push(subnets);
                }
            });
        };

        vm.validateSubnets = function () {
            for (var a = 0; a < vm.subnetsValidate.length; a++) {
                for (var b = 0; b < vm.subnetsValidate[a].length; b++) {
                    if (!vm.subnetsValidate[a][b]) {
                        vm.invalidSubnet = true;
                        return;
                    }
                }
            }
            vm.invalidSubnet = false;
        };

        vm.validateInput = function () {
            var result = true;
            for (var a = 0; a < vm.validate.length; a++) {
                result = result && vm.validate[a].networkSegment && vm.validate[a].gateway;
            }
            vm.invalidPorts = !result;
        };

        vm.addRouteTableItem = function () {
            vm.device._remoteRoutings.push({
                'networkSegment': '',
                'gateway': ''
            });
            vm.validate.push({
                'networkSegment': false,
                'gateway': false
            });
            vm.validateInput();
        };

        vm.deleteRouteTableItem = function (index) {
            vm.device._remoteRoutings.splice(index, 1);
            vm.validate.splice(index, 1);
            vm.validateInput();
        };

        vm.getSignatureCount = function () {
            var count = 0;
            if (vm.device.rules) {
                for (var i = 0; i < vm.device.rules.length; i++) {
                    count += vm.device.rules[i]._signaturesCount;
                }
            }
            return count;
        };

        vm.setSendPortFunction = function (getPortInfoFunction, initDeviceView, portMapToArr) {
            vm.getPortInfoFunction = getPortInfoFunction;
            vm.initDeviceView = initDeviceView;
            vm.portMapToArr = portMapToArr;
        };

        vm.deviceIpChange = function () {
            vm.invalidIp = !vm.editedInfo.ip || formatVal.validateIp(vm.editedInfo.ip);
            vm.hasDuplicateIP = !vm.invalidIp && dupeInfo.dupInOtherDevice('portIp', vm.editedInfo.deviceId, allDeviceFull, vm.editedInfo.ip);
            vm.invalidRange = !vm.invalidIp && !vm.hasDuplicateIP && formatVal.checkIpInSubnet(vm.editedInfo.ip, allDeviceFull);
            // vm.hasDuplicateIP = dupeInfo.dupeCheck(vm.editedInfo.deviceId, 'ip', vm.editedInfo.ip, alldevice);
        };

        vm.deviceMacChange = function () {
            vm.invalidMac = vm.editedInfo.mac && !(vm.editedInfo.mac.match(vm.validateMac));
            vm.hasDuplicateMAC = false;
            if (vm.editedInfo.mac && !vm.invalidMac) {
                vm.hasDuplicateMAC = dupeInfo.dupInOtherDevice('mac', vm.editedInfo.deviceId, allDeviceFull, vm.editedInfo.mac);
            }
        };

        //Device ACL:
        function loadAcl() {
            Device.getACLInfo(device.deviceId).then(function (data) {
                vm.aclData = angular.copy(data);

                vm.acl.acls_numValidate = [];
                vm.acl.acls_sourceIpValidate = [];
                vm.acl.acls_destinationIpValidate = [];
                vm.acl.acls_sourcePortValidate = [];
                vm.acl.acls_destinationPortValidate = [];
                vm.acl.acls_sourceIpEdit = [];
                vm.acl.acls_destinationIpEdit = [];
                vm.acl.acls_sourcePortEdit = [];
                vm.acl.acls_destinationPortEdit = [];
                vm.acl.acls_sourceIpDisable = [];
                vm.acl.acls_destinationIpDisable = [];
                vm.acl.acls_sourcePortDisable = [];
                vm.acl.acls_destinationPortDisable = [];
                vm.invalidAcl = false;

                for (var i = 0; i < vm.aclData.length; i++) {
                    if (vm.aclData[i].sourceIp === "0.0.0.0/0") {
                        vm.aclData[i].sourceIp = "任意";
                    }
                    if (vm.aclData[i].sourcePort === "0") {
                        vm.aclData[i].sourcePort = "任意";
                    }
                    if (vm.aclData[i].destinationIp === "0.0.0.0/0") {
                        vm.aclData[i].destinationIp = "任意";
                    }
                    if (vm.aclData[i].destinationPort === "0") {
                        vm.aclData[i].destinationPort = "任意";
                    }
                    if (vm.aclData[i].protocolType === "ANY") {
                        vm.aclData[i].protocolType = "任意";
                    }
                    if (vm.aclData[i].aclAction === 'permit') {
                        vm.aclData[i]._aclAction = '允许';
                    } else {
                        vm.aclData[i]._aclAction = '阻断';
                    }

                    vm.acl.acls_numValidate.push(true);
                    vm.acl.acls_sourceIpValidate.push(true);
                    vm.acl.acls_destinationIpValidate.push(true);
                    vm.acl.acls_sourcePortValidate.push(true);
                    vm.acl.acls_destinationPortValidate.push(true);

                    vm.acl.acls_sourceIpEdit.push((vm.aclData[i].sourceIp === '任意') ? false : true);
                    vm.acl.acls_destinationIpEdit.push((vm.aclData[i].destinationIp === '任意') ? false : true);
                    vm.acl.acls_sourcePortEdit.push((vm.aclData[i].sourcePort === '任意') ? false : true);
                    vm.acl.acls_destinationPortEdit.push((vm.aclData[i].destinationPort === '任意') ? false : true);
                    vm.acl.acls_sourceIpDisable.push((vm.aclData[i].protocolType === 'OPC_Classic') ? true : false);
                    vm.acl.acls_destinationIpDisable.push((vm.aclData[i].protocolType === 'OPC_Classic') ? true : false);
                    vm.acl.acls_sourcePortDisable.push((vm.aclData[i].protocolType === 'ICMP' || vm.aclData[i].protocolType === 'OPC_Classic') ? true : false);
                    vm.acl.acls_destinationPortDisable.push((vm.aclData[i].protocolType === 'ICMP' || vm.aclData[i].protocolType === 'OPC_Classic') ? true : false);
                }
                vm.checkValidation();
            });
        }

        loadAcl();
        vm.setErrorClass = function (b) {
            return (b ? "acl-error" : "acl-correct");
        };
        vm.checkNum = function (num, index) {
            var repeatedNum = false;
            for (var i = 0; i < vm.aclData.length; i++) {
                if (vm.aclData[i].aclNumber.toString() === num && i !== index) {
                    repeatedNum = true;
                }
            }
            var reg = /\D/;
            vm.acl.acls_numValidate[index] = !(repeatedNum || num === null || num === "" || num.match(reg) !== null || num < 1 || num > 1024);
            vm.checkValidation();
        };
        vm.checkIp = function (ip, index, set) {
            (set === 'source') ? vm.acl.acls_sourceIpValidate[index] = ipValidation(ip) : vm.acl.acls_destinationIpValidate[index] = ipValidation(ip);
            vm.checkValidation();
        };
        function ipValidation(ip) {
            //var exp = angular.copy(formatVal.getIPRangeReg());
            //return (ip.match(exp));
            return ip && !formatVal.validateIpRange(ip);
        }

        vm.ipChange = function (index, set) {
            (set === 'source') ? ((vm.acl.acls_sourceIpEdit[index]) ? vm.aclData[index].sourceIp = '' : vm.aclData[index].sourceIp = '任意') : ((vm.acl.acls_destinationIpEdit[index]) ? vm.aclData[index].destinationIp = '' : vm.aclData[index].destinationIp = '任意');
            (set === 'source') ? ((vm.acl.acls_sourceIpEdit[index]) ? vm.acl.acls_sourceIpValidate[index] = false : vm.acl.acls_sourceIpValidate[index] = true) : ((vm.acl.acls_destinationIpEdit[index]) ? vm.acl.acls_destinationIpValidate[index] = false : vm.acl.acls_destinationIpValidate[index] = true);
            vm.checkValidation();
        };

        vm.checkPort = function (port, index, set) {
            (set === 'source') ? vm.acl.acls_sourcePortValidate[index] = portValidation(port) : vm.acl.acls_destinationPortValidate[index] = portValidation(port);
            vm.checkValidation();
        };
        function portValidation(port) {
            var exp = angular.copy(formatVal.getPortReg());
            return port.match(exp);
        }

        vm.portChange = function (index, set) {
            (set === 'source') ? ((vm.acl.acls_sourcePortEdit[index]) ? vm.aclData[index].sourcePort = '' : vm.aclData[index].sourcePort = '任意') : ((vm.acl.acls_destinationPortEdit[index]) ? vm.aclData[index].destinationPort = '' : vm.aclData[index].destinationPort = '任意');
            (set === 'source') ? ((vm.acl.acls_sourcePortEdit[index]) ? vm.acl.acls_sourcePortValidate[index] = false : vm.acl.acls_sourcePortValidate[index] = true) : ((vm.acl.acls_destinationPortEdit[index]) ? vm.acl.acls_destinationPortValidate[index] = false : vm.acl.acls_destinationPortValidate[index] = true);

            vm.checkValidation();
        };
        vm.checkAclProtocol = function (protocolType, index) {
            if (protocolType === "ICMP" || protocolType === "OPC_Classic") {
                vm.aclData[index].sourcePort = "-1";
                vm.aclData[index].destinationPort = "-1";
                vm.acl.acls_sourcePortDisable[index] = true;
                vm.acl.acls_destinationPortDisable[index] = true;
                vm.acl.acls_sourcePortEdit[index] = false;
                vm.acl.acls_destinationPortEdit[index] = false;
            } else {
                vm.acl.acls_sourcePortEdit[index] = false;
                vm.acl.acls_destinationPortEdit[index] = false;
                vm.acl.acls_sourcePortDisable[index] = false;
                vm.acl.acls_destinationPortDisable[index] = false;
            }
            if (protocolType === "OPC_Classic") {
                vm.aclData[index].sourceIp = "任意";
                vm.aclData[index].destinationIp = "任意";
                vm.acl.acls_sourceIpDisable[index] = true;
                vm.acl.acls_destinationIpDisable[index] = true;
                vm.acl.acls_sourceIpEdit[index] = false;
                vm.acl.acls_destinationIpEdit[index] = false;
            } else {
                vm.acl.acls_sourceIpEdit[index] = false;
                vm.acl.acls_destinationIpEdit[index] = false;
                vm.acl.acls_sourceIpDisable[index] = false;
                vm.acl.acls_destinationIpDisable[index] = false;
            }
            vm.portChange(index, "source");
            vm.portChange(index, "destination");
            vm.ipChange(index, "source");
            vm.ipChange(index, "destination");
        };
        vm.addAcl = function () {
            var nextIndex = 1;
            for (var i = 0; i < vm.aclData.length; i++) {
                nextIndex = (nextIndex > vm.aclData[i].aclNumber) ? nextIndex : (parseInt(vm.aclData[i].aclNumber) + 1);
            }
            vm.aclData.push({
                aclNumber: nextIndex,
                aclAction: "permit",
                sourceIp: "任意",
                destinationIp: "任意",
                protocolType: "任意",
                sourcePort: "任意",
                destinationPort: "任意",
                aclLog: false
            });

            vm.acl.acls_numValidate.push(true);
            vm.acl.acls_sourceIpValidate.push(true);
            vm.acl.acls_destinationIpValidate.push(true);
            vm.acl.acls_sourcePortValidate.push(true);
            vm.acl.acls_destinationPortValidate.push(true);

            vm.acl.acls_sourceIpEdit.push(false);
            vm.acl.acls_destinationIpEdit.push(false);
            vm.acl.acls_sourcePortEdit.push(false);
            vm.acl.acls_destinationPortEdit.push(false);
            vm.checkValidation();
        };
        vm.deleteSingleAcl = function (index) {
            var ACLId = [{"deviceACLId": vm.aclData[index].deviceACLId}];
            Device.deleteACL(device.deviceId, ACLId).then(function () {
                vm.aclData.splice(index, 1);
                vm.acl.acls_numValidate.splice(index, 1);
                vm.acl.acls_sourceIpValidate.splice(index, 1);
                vm.acl.acls_destinationIpValidate.splice(index, 1);
                vm.acl.acls_sourcePortValidate.splice(index, 1);
                vm.acl.acls_destinationPortValidate.splice(index, 1);
                vm.acl.acls_sourceIpEdit.splice(index, 1);
                vm.acl.acls_destinationIpEdit.splice(index, 1);
                vm.acl.acls_sourcePortEdit.splice(index, 1);
                vm.acl.acls_destinationPortEdit.splice(index, 1);
                vm.acl.acls_sourceIpDisable.splice(index, 1);
                vm.acl.acls_destinationIpDisable.splice(index, 1);
                vm.acl.acls_sourcePortDisable.splice(index, 1);
                vm.acl.acls_destinationPortDisable.splice(index, 1);
                vm.checkValidation();
            });
        };
        vm.checkValidation = function () {
            var validAcl = true;
            for (var i = 0; i < vm.aclData.length; i++) {
                validAcl = validAcl && vm.acl.acls_numValidate[i] && vm.acl.acls_sourceIpValidate[i] && vm.acl.acls_destinationIpValidate[i] && vm.acl.acls_sourcePortValidate[i] && vm.acl.acls_destinationPortValidate[i];
            }
            vm.invalidAcl = !validAcl;
        };
        vm.confirmAcl = function () {
            var deferred = $q.defer();

            vm.checkValidation();
            if (!vm.invalidAcl) {
                var ids = [];
                for (var j = 0; j < vm.aclData.length; j++) {
                    if (vm.aclData[j].deviceACLId !== undefined) {
                        ids.push(vm.aclData[j].deviceACLId);
                    }
                }

                if (ids.length > 0) {
                    var ACLId = [{"deviceACLId": ids}];
                    Device.deleteACL(device.deviceId, ACLId).then(function () {
                        vm.checkValidation();
                        processAddACL().then(function () {
                            deferred.resolve('SUCCESS');
                        });
                    });
                } else {
                    processAddACL().then(function () {
                        deferred.resolve('SUCCESS');
                    });
                }
            }

            return deferred.promise;
        };

        function processAddACL() {
            vm.acl.acls_numValidate = [];
            vm.acl.acls_sourceIpValidate = [];
            vm.acl.acls_destinationIpValidate = [];
            vm.acl.acls_sourcePortValidate = [];
            vm.acl.acls_destinationPortValidate = [];

            var promises = [];
            for (var i = 0; i < vm.aclData.length; i++) {
                if (vm.aclData[i].sourceIp === "任意") {
                    vm.aclData[i].sourceIp = "0.0.0.0/0";
                }
                if (vm.aclData[i].sourcePort === "任意") {
                    vm.aclData[i].sourcePort = "0";
                }
                if (vm.aclData[i].destinationIp === "任意") {
                    vm.aclData[i].destinationIp = "0.0.0.0/0";
                }
                if (vm.aclData[i].destinationPort === "任意") {
                    vm.aclData[i].destinationPort = "0";
                }
                if (vm.aclData[i].protocolType === "任意") {
                    vm.aclData[i].protocolType = "ANY";
                }
                if (vm.aclData[i].sourceIp.indexOf("/") < 0) {
                    vm.aclData[i].sourceIp += "/32";
                }
                if (vm.aclData[i].destinationIp.indexOf("/") < 0) {
                    vm.aclData[i].destinationIp += "/32";
                }
                var ACLdata = {
                    "aclNumber": vm.aclData[i].aclNumber,
                    "aclAction": vm.aclData[i].aclAction,
                    "aclLog": vm.aclData[i].aclLog,
                    "sourceIp": vm.aclData[i].sourceIp,
                    "sourcePort": vm.aclData[i].sourcePort,
                    "destinationIp": vm.aclData[i].destinationIp,
                    "destinationPort": vm.aclData[i].destinationPort,
                    "protocolType": vm.aclData[i].protocolType,
                    "protocolTypeName": vm.aclData[i].protocolType
                };
                promises.push(Device.addACL(device.deviceId, ACLdata));
            }
            return $q.all(promises).then(function () {
            });
        }

        //Device Ports:
        var ports = [];
        var portArr = [];
        vm.portsEditValidation = [];

        device.devicePorts.forEach(function (port) {
            if (!port.isMgmtPort) {
                ports.push(port);
                vm.portsEditValidation.push(true);
            } else {
                vm.mgmt = port;
            }
        });

        vm.port = device.port || {};
        initDeviceView();
        portMapToArr(device.notConnectedPortMap);

        vm.changeTopoStatus = function (p1, p2) {
            if (vm.port[p1][p2].model) {
                portArr = portArr.filter(function (port) {
                    return port !== vm.port[p1][p2].port;
                });
            } else {
                portArr.push(vm.port[p1][p2].port);
            }

        };

        vm.updateSubnetStatus = function (portIndex, subnetIndex, subnetStatus, subnetValue) {
            if (subnetStatus === 'delete') {
                device.devicePorts[portIndex]._subnets.splice(subnetIndex, 1);
                vm.subnetsValidate[portIndex].splice(subnetIndex, 1);
            } else if (subnetStatus === 'add') {
                //console.log(device.devicePorts[portIndex]);
                device.devicePorts[portIndex]._subnets.push({'subnet': ''});
                vm.subnetsValidate[portIndex].push(true);
            } else {
                subnetStatus = subnetValue ? vm.validateSubnet.test(subnetValue) : true;
                vm.subnetsValidate[portIndex][subnetIndex] = subnetStatus;
            }
            vm.validateSubnets();
        };

        function getPortInfoFunction() {
            var str = portArr.join('],[');
            str = str && '[' + str + ']';
            return {'portMap': str};
        }


        function initDeviceView(newDevice) {
            if (newDevice) {
                vm.device = newDevice;
                portArr = [];
            }

            if (vm.device.port) {
                return;
            }
            for (var c = 0; c < ports.length; c++) {
                vm.port[ports[c].portName] = {};
            }

            for (var i = 0; i < ports.length; i++) {
                for (var j = 0; j < ports.length; j++) {
                    if (i !== j && vm.port[ports[i].portName][ports[j].portName] === undefined) {
                        vm.port[ports[i].portName][ports[j].portName] = vm.port[ports[j].portName][ports[i].portName] = {
                            model: true,
                            port: ports[i].portName + ',' + ports[j].portName
                        };
                    }
                }
            }
        }

        function portMapToArr(input) {
            if (input && !device.port) {
                portArr = input.substring(1, input.length - 1).split('],[');
                portArr.forEach(function (port) {
                    var substrArr = port.split(',');
                    vm.port[substrArr[0]][substrArr[1]].model = false;
                });
                device.port = vm.port;
            }
        }
    }

    function SecurityDeviceNewCtrl($rootScope, $scope, $q, $modal, Device, categories, subCategory, models, snVal, formatVal, dupeInfo, allDeviceFull, deviceTypeService) {
        var vm = $scope.newDevice = {};
        $scope.simplifyModelName = deviceTypeService.simplifyModelName;
        vm.validateIp = angular.copy(formatVal.getIPReg());
        vm.validateMac = angular.copy(formatVal.getMACReg());
        vm.validateSubnet = angular.copy(formatVal.getSubnetReg());
        initial();
        validateDevice();

        var alldevice;
        dupeInfo.allDevice(allDeviceFull).then(function (data) {
            alldevice = data;
        });

        vm.subCategory = subCategory;
        vm.backTo = subCategory;

        vm.done = function () {
            var newDevice = {};
            var newModel = {};
            var newNodes = [];
            $scope.device['mac'] ? $scope.device['mac'] = $scope.device['mac'].toUpperCase() : '';
            newDevice['name'] = $scope.device['name'];
            newDevice['modelId'] = $scope.device['modelId'];
            newDevice['_configMismatch'] = $scope.device['_configMismatch'];
            newDevice['protectedDevicesNumber'] = $scope.device['protectedDevicesNumber'];
            newDevice['cmmnPortnumber'] = $scope.device['cmmnPortnumber'];
            newDevice['isProtected'] = $scope.device['isProtected'];
            newDevice['iconType'] = $scope.device['iconType'] ? $scope.device['iconType'] : 'ips';
            newDevice['hasUSB'] = $scope.device['hasUSB'];
            newDevice['hasWireless'] = $scope.device['hasWireless'];
            newDevice['hasPort'] = $scope.device['hasPort'];
            newDevice['serialNumber'] = $scope.device['serialNumber'];
            newDevice['devicePorts'] = [];
            newDevice['devicePorts'][0] = {};
            newDevice['devicePorts'][0]['isMgmtPort'] = true;
            newDevice['devicePorts'][0]['portName'] = 'Mgmt';
            newDevice['devicePorts'][0]['portIp'] = $scope.device['ip'];
            newDevice['devicePorts'][0]['mac'] = $scope.device['mac'];
            for (var i = 0; i < $scope.device['modelnumofports']; i++) {
                newDevice['devicePorts'][i + 1] = {};
                newDevice['devicePorts'][i + 1]['isMgmtPort'] = false;
                newDevice['devicePorts'][i + 1]['portName'] = ('p' + i);
            }
            newModel['model'] = $scope.device['model'] ? $scope.device['model'] : $scope.device['modelname'];
            newModel['model_name'] = $scope.device['modelname'];
            newModel['make'] = $scope.device['modelmake'];
            newModel['protocol'] = $scope.device['modelprotocol'];
            newModel['version'] = $scope.device['modelversion'];
            newModel['firmwareVersion'] = $scope.device['modelfirmware'];
            newModel['model_serialNo'] = $scope.device['modelserial'];
            newModel['model_memo'] = $scope.device['modelmemo'];
            newModel['numOfPorts'] = $scope.device['modelnumofports'];
            newModel['iconType'] = 'ips';
            newModel['category'] = 0;
            newModel['subCategory'] = $scope.device['modelsubcategory'] === 'DATA_COLLECTION_DEVICE' ? 1 : 0;

            $q.all([
                Device.getNewDevices({'$orderby': 'name'})
            ]).then(function (data) {
                var newDiscoveredDevices = data[0];
                // If found new dicovered device with same serial number, confirm if should merge.
                var newDiscoveredDevice;
                for (var i in newDiscoveredDevices) {
                    if (i && newDiscoveredDevices[i].serialNumber === newDevice['serialNumber']) {
                        newDiscoveredDevice = newDiscoveredDevices[i];
                        break;
                    }
                }
                if (newDiscoveredDevice) {
                    $q.when(confirmation($modal, $q, newDiscoveredDevice, newDevice)).then(function () {
                        Device.addToCurrentTopology(newDiscoveredDevice.deviceId, '').then(function () {
                            window.location.href = '/asset/securitydevice' + (subCategory !== '' ? '?panel=' + subCategory : '');
                            $rootScope.addAlert({
                                type: 'success',
                                content: '加入当前拓扑成功'
                            });
                        }, function () {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '加入当前拓扑失败'
                            });
                        });
                    });
                } else {
                    if (vm.newModel) {
                        Device.createModel(newModel).then(function (data) {
                            newDevice['modelId'] = data['modelId'];
                            $scope.forms.models.splice(1, 0, {
                                'modelId': data['modelId'],
                                'model_name': newModel['model_name']
                            });
                            $scope.device['modelId'] = data['modelId'];
                            vm.newModel = false;
                            createDevice(newDevice, newNodes);
                        }, function (data) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '添加设备型号失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                            });
                        });
                    } else {
                        createDevice(newDevice, newNodes);
                    }
                }

            });
        };

        vm.validateDevice = function () {
            validateDevice();
        };

        function validateDevice() {
            vm.nameError = (!$scope.device['name'] || $scope.device['name'].length === 0);
            vm.serialError = (!$scope.device['serialNumber'] || $scope.device['serialNumber'].length === 0);
            vm.serialFormatError = !snVal.validSNFormat($scope.device['serialNumber']);
            vm.hasDuplicateSN = false;
            if ($scope.device.serialNumber && !vm.serialError && !vm.serialFormatError) {
                vm.hasDuplicateSN = formatVal.checkSerialNumberDup(allDeviceFull, $scope.device.serialNumber, -1);
            }
            vm.modeError = (!$scope.device['mode'] || $scope.device['mode'].length === 0);
            vm.invalidIp = !$scope.device['ip'] || formatVal.validateIp($scope.device['ip']);
            vm.invalidMac = $scope.device['mac'] && !($scope.device['mac'].match(vm.validateMac));
            vm.hasDuplicateIP = !vm.invalidIp && dupeInfo.dupInOtherDevice('portIp', -1, allDeviceFull, $scope.device.ip);
            vm.invalidRange = !vm.invalidIp && !vm.hasDuplicateIP && formatVal.checkIpInSubnet($scope.device.ip, allDeviceFull);
            vm.hasDuplicateMAC = false;
            if ($scope.device.mac && !vm.invalidMac) {
                vm.hasDuplicateMAC = dupeInfo.dupInOtherDevice('mac', -1, allDeviceFull, $scope.device.mac);

            }
            if (vm.newModel) {
                vm.modelError = (!$scope.device['modelname'] || $scope.device['modelname'].length === 0);
                vm.portsError = (!$scope.device['modelnumofports'] || $scope.device['modelnumofports'].length === 0);
            } else {
                vm.modelError = (!$scope.device['modelname'] || $scope.device['modelname'].length === 0);
                vm.portsError = false;
            }
        }

        function createDevice(newDevice, newNodes) {
            delete newDevice['backTo'];
            Device.createDevice(newDevice).then(function (data) {
                prepareNodes(newNodes, data['deviceId']);
                createNodes(newNodes);
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '添加设备失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        }

        function createNodes(newNodes) {
            Device.createNodes(newNodes).then(function () {
                window.location.href = '/asset/securitydevice' + (subCategory !== '' ? '?panel=' + subCategory : '');
                $rootScope.addAlert({
                    type: 'success',
                    content: '添加设备到当前拓扑成功'
                });
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '加入当前拓扑失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        }

        function populateModeOptions(modelsubcategory, model) {
            $scope.forms.modes = [];
            if (modelsubcategory === 'DATA_COLLECTION_DEVICE' || model.indexOf('KED') === 0) {
                $scope.forms.modes[0] = {};
                $scope.forms.modes[0]['mode'] = 'IPS';
                $scope.forms.modes[0]['modename'] = '数采隔离模式';
            } else {
                if (model.indexOf('KEA') === 0) {
                    $scope.forms.modes[0] = {};
                    $scope.forms.modes[0]['mode'] = 'IDS';
                    $scope.forms.modes[0]['modename'] = '监测审计模式';
                } else if (model.indexOf('KEV') === 0) {
                    if (model === 'KEV-U800') {
                        $scope.forms.modes[0] = {};
                        $scope.forms.modes[0]['mode'] = 'IPS';
                        $scope.forms.modes[0]['modename'] = '智能保护模式';
                    } else {
                        $scope.forms.modes[0] = {};
                        $scope.forms.modes[1] = {};
                        $scope.forms.modes[0]['mode'] = 'IPS';
                        $scope.forms.modes[1]['mode'] = 'ROUTING_IPS';
                        $scope.forms.modes[0]['modename'] = '智能保护模式';
                        $scope.forms.modes[1]['modename'] = '路由保护模式';
                    }
                } else if (model.indexOf('KEC') === 0) {
                    $scope.forms.modes[0] = {};
                    $scope.forms.modes[1] = {};
                    $scope.forms.modes[0]['mode'] = 'IPS';
                    $scope.forms.modes[1]['mode'] = 'IDS';
                    $scope.forms.modes[0]['modename'] = '智能保护模式';
                    $scope.forms.modes[1]['modename'] = '监测审计模式';
                }
            }
            $scope.device.mode = $scope.forms.modes[0].mode;
        }

        vm.serialNumberChanged = function (sn) {
            $scope.device['model'] = "";
            $scope.device['modelname'] = "";
            $scope.device['modelmake'] = "";
            $scope.device['modelmemo'] = "";
            $scope.device['modelnumofports'] = "";
            $scope.device['mode'] = "";
            $scope.forms.modes = [];
            var model = snVal.getModelBySN(sn, $scope.forms.models);
            if (model) {
                populateModelInfo(model['model']);
            }
        };

        function populateModelInfo(model) {
            for (var i in $scope.forms.models) {
                if (i && $scope.forms.models[i].iconType && $scope.forms.models[i]['model'] === model) {
                    $scope.device['modelId'] = $scope.forms.models[i]['modelId'];
                    $scope.device['model'] = $scope.forms.models[i]['model'];
                    $scope.device['modelmake'] = $scope.forms.models[i]['make'];
                    $scope.device['modelprotocol'] = $scope.forms.models[i]['protocol'];
                    $scope.device['modelversion'] = $scope.forms.models[i]['version'];
                    $scope.device['modelfirmware'] = $scope.forms.models[i]['firmwareVersion'];
                    $scope.device['modelserial'] = $scope.forms.models[i]['model_serialNo'];
                    $scope.device['modelmemo'] = $scope.forms.models[i]['model_memo'];
                    $scope.device['iconType'] = $scope.forms.models[i]['iconType'].toLowerCase();
                    $scope.device['modelnumofports'] = $scope.forms.models[i]['numOfPorts'];
                    $scope.device['modelsubcategory'] = $scope.forms.models[i]['subCategory'];
                    $scope.device['modelname'] = $scope.forms.models[i]['model_name'] + ' / ' + $scope.forms.models[i]['model'];
                    populateModeOptions($scope.forms.models[i]['subCategory'], $scope.forms.models[i]['model']);
                    break;
                }
            }
        }

        function prepareNodes(newNodes, deviceId) {
            newNodes[0] = {};
            newNodes[0]['name'] = $scope.device['name'];
            //newNodes[0]['_MAC'] = $scope.device['mac'];
            //newNodes[0]['_ip'] = $scope.device['ip'];
            newNodes[0]['type'] = $scope.device['mode'];
            newNodes[0]['zoneName'] = 'NA';
            newNodes[0]['importance'] = 1;
            newNodes[0]['deviceId'] = deviceId;
            newNodes[0]['ports'] = [];
            for (var j = 0; j < $scope.device['modelnumofports']; j++) {
                newNodes[0]['ports'][j] = ('p' + j);
                newNodes[0]['name'] = newNodes[0]['name'] + ('_p' + j);
            }
        }

        ////////////
        function initial() {
            $scope.device = {};
            $scope.device.category = 'SECURITY_DEVICE';
            var forms = $scope.forms = {};
            forms.models = models;
            forms.modes = {};
        }
    }

    function SecurityDevicePortsCtrl(Enum) {
        var vm = this;
        port(vm);

        vm.editRight = (Enum.get('privilege').filter(function (a) {
            return a.name === 'DEVICE_MANAGEMENT';
        })[0].actionValue === 30);

        //////////
        function port(vm) {
            vm.selectedPort = 'mgmt';
            vm.ports = [{
                name: 'P0/P1',
                mode: 'IDS',
                status: 1,
                sub: [{
                    name: 'P0',
                    status: 1
                }, {
                    name: 'P1',
                    status: 1
                }]
            }, {
                name: 'P2/P3',
                mode: 'IDS',
                status: 1,
                sub: [{
                    name: 'P2',
                    status: 0
                }, {
                    name: 'P3',
                    status: 1
                }]
            }];

            vm.selectPort = function (port) {
                var index;
                if (port === 'P0' || port === 'P1') {
                    index = 0;
                } else if (port === 'P2' || port === 'P3') {
                    index = 1;
                } else {
                    vm.selectedPort = port;
                    return;
                }

                if (vm.ports[index].mode === 'IPS') {
                    vm.selectedPort = vm.ports[index].name;
                } else {
                    vm.selectedPort = port;
                }
            };

            vm.is = function (option1, option2) {
                return vm.selectedPort === option1 || vm.selectedPort === option2;
            };

            vm.portsWidth = function () {
                var panelNum = 1;
                for (var i = 0; i < vm.ports.length; i++) {
                    panelNum += vm.ports[i].mode === 'IDS' ? 2 : 1;
                }
                return 290 * panelNum;
            };
        }
    }

    function confirmation($modal, $q, newDiscoveredDevice, existingSecurityDevices) {
        var deferred = $q.defer();
        $modal.open({
            size: 'sm',
            templateUrl: 'templates/asset/securitydevice/confirm-panel.html',
            controller: function ($scope, $modalInstance) {
                $scope.title = '发现相同序列号设备';
                $scope.content1 = '已安装设备中" ' + existingSecurityDevices.name + ' "与自动发现的新设备＂' + newDiscoveredDevice.name + '＂序列号相同（SN: ' + existingSecurityDevices.serialNumber + '）。';
                $scope.content2 = '请注意，此操作可能会导致"' + existingSecurityDevices.name + '"的设备规格与MAC地址被覆盖。';
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

})();
