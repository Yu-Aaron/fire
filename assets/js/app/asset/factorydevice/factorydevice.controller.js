/**
 * Asset Factory Device Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.factorydevice')
        .controller('FactoryDeviceCtrl', FactoryDeviceCtrl)
        .controller('FactoryDeviceDetailCtrl', FactoryDeviceDetailCtrl)
        .controller('FactoryDeviceNewCtrl', FactoryDeviceNewCtrl);

    function FactoryDeviceCtrl($scope, $modal, $log, $state, $rootScope, Enum, Device, uiTree) {
        var vm = this;
        vm.editRight = (Enum.get('privilege').filter(function (a) {
            return a.name === 'DEVICE_MANAGEMENT';
        })[0].actionValue === 30);

        $scope.editMode = {};

        vm.contentEnable = function (target) {
            return uiTree.getContentShow(target);
        };
        vm.defaultTab = vm.contentEnable('FACTORY_DEVICE_LIST') ? 'DEVICE' : vm.contentEnable('FACTORY_DEVICE_ZONE') ? 'NODEZONE' : 'none';

        vm.isEditMode = function (index) {
            return $scope.editMode['edit' + index];
        };

        vm.getAllNodeZones = function () {
            var payload = {};
            payload['$filter'] = "zoneName ne 'NA'";
            payload['$orderby'] = 'zoneName';
            Device.getAllNodeZone(payload).then(function (data) {
                $scope.allNodeZones = data;
            });
        };

        vm.addNodeZone = function () {
            $scope.editMode = {};
            $scope.isAddNodeZone = true;
        };

        vm.doAddNodeZone = function (input) {
            Device.addNodeZone({'zoneName': input}).then(function () {
                vm.cancelAddNodeZone();
                $state.reload().then(function () {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '逻辑分区添加成功'
                    });
                });
            });
        };

        vm.cancelAddNodeZone = function () {
            $scope.editMode = {};
            $scope.newZoneName = "";
            $scope.isAddNodeZone = false;
        };

        vm.editNodeZone = function (nodeZone, index) {
            $scope.editMode = {};
            $scope.editMode['edit' + index] = true;
            $scope.inputZoneName = nodeZone.zoneName;
        };

        vm.checkUniqueOrNA = function (input, index) {
            $scope.isNotUnique = false;
            $scope.isNA = false;
            if (input === 'NA') {
                $scope.isNA = true;
                return;
            }
            var nodeZoneLst = $scope.allNodeZones;
            for (var idx in nodeZoneLst) {
                if (index !== undefined && nodeZoneLst[idx].zoneName === input && Number(idx) !== index) {
                    $scope.isNotUnique = true;
                    return;
                } else if (index === undefined && nodeZoneLst[idx].zoneName === input) {
                    $scope.isNotUnique = true;
                    return;
                }
            }
        };

        vm.doEditNodeZone = function (nodeZone, input) {
            nodeZone.zoneName = input;
            Device.updateZoneName(nodeZone).then(function () {
                vm.cancelEditNodeZone();
                $state.reload().then(function () {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '逻辑分区修改成功'
                    });
                });
            });
        };

        vm.cancelEditNodeZone = function () {
            $scope.editMode = {};
        };

        vm.deleteNodeZones = function (nodeZone) {
            var modalInstance = $modal.open({
                templateUrl: 'delete-record-confirmation.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    items: function () {
                        $scope.deleteItems = [];
                        $scope.deleteItems.push(nodeZone);
                        return $scope.deleteItems;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, Device, items) {

                $scope.deleteMsg = '确认是否删除此记录？';
                $scope.deleteFlg = true;

                $scope.ok = function () {
                    Device.deleteNodeZones(items, function (err) {
                        if (err) {
                            $scope.deleteMsg = err;
                            $scope.deleteFlg = false;
                            $scope.ok = function () {
                                $modalInstance.close();
                            };
                        } else {
                            $modalInstance.close();
                            $state.reload().then(function () {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '逻辑分区删除成功'
                                });
                            });
                        }
                    });

                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        };
    }

    function FactoryDeviceDetailCtrl($scope, Device, device, $rootScope, $state, $q, models, formatVal, alldevice, dupeInfo, allDeviceFull, Topology, Signature) {
        var vm = this;
        vm.device = device;
        vm.editedInfo = {};
        angular.copy(device, vm.editedInfo);

        vm.validate = [];
        var forms = vm.forms = {};
        forms.models = models;

        //initialise nodezone list items
        var payload = {};
        payload['$filter'] = "zoneName ne 'NA'";
        payload['$orderby'] = 'zoneName';
        Device.getAllNodeZone(payload).then(function (data) {
            forms.nodezones = data;
        });

        // Currently allow to add new model
        forms.models.splice(0, 0, {'modelId': 'new', 'model_name': '添加设备型号'});

        Signature.isMacNeeded().then(function (data) {
            $scope.needMac = data;
        });
        vm.checkAllIpMacValid = function () {
            vm.allIpMacValid = false;
            for (var i = 0; i < vm.editedInfo.devicePorts.length; i++) {
                var tmp = vm.editedInfo.devicePorts[i];
                if (tmp.invalidIp || tmp.hasDuplicateIP || tmp.invalidRange || tmp.invalidMac || tmp.hasDuplicateMAC) {
                    return;
                }
            }
            vm.allIpMacValid = true;
        };

        vm.editIP = function () {
            vm.editedInfo = angular.copy(vm.device);
            vm.validateAllIp();
            vm.validateAllMac();
            vm.isIPEdited = true;
        };

        vm.editIPCancel = function () {
            angular.copy(vm.device, vm.editedInfo);
            vm.isIPEdited = false;
        };

        vm.removeIpMac = function (index) {
            vm.editedInfo.devicePorts.splice(index, 1);
            vm.validateAllIp();
            vm.validateAllMac();
            vm.checkAllIpMacValid();
        };

        vm.addIpMac = function () {
            vm.editedInfo.devicePorts.push({
                portIp: "",
                mac: "",
                isMgmtPort: true,
                invalidIp: true,
                invalidMac: $scope.needMac
            });
            vm.checkAllIpMacValid();
        };

        // remove all links id in the array links
        vm.removeLinks = function (topologyId, links) {
            Topology.deleteLink(links, topologyId);
        };

        vm.editIPDone = function () {
            delete vm.editedInfo._iconName;
            delete vm.editedInfo.nodes;
            delete vm.editedInfo.rules;
            var ports = [];
            var portIndex = -1;
            if (vm.editedInfo.devicePorts.length < vm.device.devicePorts.length) {
                portIndex = vm.editedInfo.devicePorts.length;
            }
            for (var i = 0; i < vm.editedInfo.devicePorts.length; i++) {
                var tmp = vm.editedInfo.devicePorts[i];
                delete tmp.hasDuplicateIP;
                delete tmp.hasDuplicateMAC;
                delete tmp.invalidIp;
                delete tmp.invalidMac;
                delete tmp.invalidRange;
                tmp.portName = 'p' + i.toString();
                tmp.mac = tmp.mac ? tmp.mac.toUpperCase() : '';
                ports.push(tmp.portName);
            }

            // get the ids of the links that need to be deleted
            var requests = [];
            requests.push(Topology.getLinks(vm.device.topologyId));
            requests.push(Topology.getDeviceNodes(vm.device.deviceId));

            Device.updateAllDevicePorts(vm.device.topologyId, vm.device.deviceId, vm.editedInfo).then(function () {
                var node = vm.device.nodes[0];
                if (vm.device.iconType !== 'subnet') {
                    node.ports = ports;
                }
                Device.updateNode(node).then(function () {
                    $state.reload().then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '修改设备端口成功'
                        });
                    });
                });
                //get the ids of all the links that need to be removed
                if (portIndex !== -1) {
                    $q.all(requests).then(function (data) {
                        var links = data[0].data;
                        var node = data[1][0];
                        var ids = [];
                        for (var i = 0; i < links.length; i++) {
                            var tmp = links[i];
                            if (tmp.nodeID === node.id) {
                                if (tmp.sourcePortName && parseInt(tmp.sourcePortName.slice(1)) >= portIndex) {
                                    ids.push({id: tmp.id});
                                }
                            }
                        }
                        vm.removeLinks(node.topologyId, ids);
                    });
                }
            }, function () {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '修改设备端口失败'
                });
            });
        };

        vm.editDevice = function () {
            delete vm.device.port;
            vm.editedInfo = angular.copy(vm.device);
            vm.editedInfo.nodeZoneId = vm.device.nodes[0].nodeZoneId;
            vm.isEdited = true;
            validateDevice();
        };

        vm.editCancel = function () {
            angular.copy(vm.device, vm.editedInfo);
            vm.newModel = false;
            vm.isEdited = false;
        };

        vm.editDone = function () {
            var device = {};

            angular.copy(vm.device, device);
            device.name = vm.editedInfo.name;
            device.serialNumber = vm.editedInfo.serialNumber;
            device.make = vm.editedInfo.make;
            device.iconType = vm.editedInfo.iconType;

            delete device.rules;
            delete device.nodes;
            delete device._rulesCount;
            delete device._signaturesCount;
            delete device._iconName;
            delete device._factoryCount;
            delete device.showRoutingInfo;
            delete device.ip;
            delete device.mac;

            if (!device.serialNumber) {
                delete device.serialNumber;
            }
            if (vm.newModel) {
                var newModel = {};
                newModel.model = vm.editedInfo._model_name;
                newModel.model_name = vm.editedInfo._model_name;
                newModel.make = vm.editedInfo.make;
                newModel.iconType = vm.editedInfo.iconType;
                newModel.category = 1;
                var modelExists = false;
                for (var i in vm.forms.models) {
                    if (i && vm.forms.models[i]['model'] === newModel.model && vm.forms.models[i]['version'] === 'N/A' && vm.forms.models[i]['make'] === newModel.make) {
                        modelExists = true;
                        device.modelId = vm.forms.models[i]['modelId'];
                        break;
                    }
                }
                if (modelExists) {
                    vm.newModel = false;
                    updateDevice(device);
                } else {
                    Device.createModel(newModel).then(function (data) {
                        device.modelId = data['modelId'];
                        vm.forms.models.splice(1, 0, {
                            'modelId': data['modelId'],
                            'model_name': newModel['model_name']
                        });
                        vm.editedInfo['modelId'] = data['modelId'];
                        vm.newModel = false;
                        updateDevice(device);
                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '添加设备型号失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                }
            } else {
                device.modelId = vm.editedInfo.modelId;
                updateDevice(device);
            }
        };

        function updateDevice(device) {
            Device.update(device.deviceId, device).then(function () {
                Device.updateNodeAssociation(device.deviceId, vm.editedInfo.nodeZoneId).then(function () {
                    $state.reload().then(function () {
                        vm.isEdited = false;
                        $rootScope.addAlert({
                            type: 'success',
                            content: '修改设备成功'
                        });
                    });
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '修改设备逻辑分区失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
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
            vm.hasDuplicateSN = false;
            if (vm.editedInfo.serialNumber) {
                vm.hasDuplicateSN = formatVal.checkSerialNumberDup(allDeviceFull, vm.editedInfo.serialNumber, vm.editedInfo.deviceId);
            }
            if (vm.newModel) {
                vm.modelError = (!vm.editedInfo._model_name || vm.editedInfo._model_name.length === 0);
            } else {
                vm.modelError = (!vm.editedInfo.modelId || vm.editedInfo.modelId.length === 0);
            }
        }

        vm.modelChange = function (modelId) {
            if (modelId === 'new') {
                vm.newModel = true;
                vm.editedInfo.model = '';
                vm.editedInfo._model_name = '';
                vm.editedInfo.make = '';
                vm.editedInfo.modelId = '';
            } else {
                vm.newModel = false;
                populateModelInfo(modelId);
            }
            vm.validateDevice();
        };

        function populateModelInfo(modelId) {
            for (var i in vm.forms.models) {
                if (i && vm.forms.models[i]['modelId'] === modelId) {
                    vm.editedInfo.modelId = modelId;
                    vm.editedInfo.make = vm.forms.models[i]['make'];
                    vm.editedInfo.iconType = vm.forms.models[i]['iconType'] ? vm.forms.models[i]['iconType'] : vm.editedInfo.iconType ? vm.editedInfo.iconType : 'unknown-device';
                    break;
                }
            }
        }

        vm.deviceIpChange = function (port, index) {
            if (vm.device.iconType === 'subnet') {
                port.invalidIp = formatVal.subnetValidation(port.portIp);
                port.invalidRange = !port.invalidIp && formatVal.subnetOverlap(vm.device, allDeviceFull, port.portIp);
            } else {
                port.invalidIp = !port.portIp || formatVal.validateIp(port.portIp);
                port.hasDuplicateIP = !port.invalidIp && (dupeInfo.checkDupInDevice(vm.editedInfo.devicePorts, port, index, 'portIp') || dupeInfo.dupInOtherDevice('portIp', vm.device.deviceId, allDeviceFull, port.portIp));
                port.invalidRange = !port.invalidIp && !port.hasDuplicateIP && formatVal.checkIpInSubnet(port.portIp, allDeviceFull);
            }
        };

        vm.deviceMacChange = function (port, index) {
            port.invalidMac = port.mac && formatVal.validateMac(port.mac);
            if ($scope.needMac && !port.mac) {
                port.invalidMac = true;
            }
            if (port.mac) {
                port.hasDuplicateMAC = !port.invalidMac && (dupeInfo.checkDupInDevice(vm.editedInfo.devicePorts, port, index, 'mac') || dupeInfo.dupInOtherDevice('mac', vm.device.deviceId, allDeviceFull, port.mac));
            } else {
                port.hasDuplicateMAC = false;
            }
        };

        vm.validateAllIp = function () {
            for (var i = 0; i < vm.editedInfo.devicePorts.length; i++) {
                vm.deviceIpChange(vm.editedInfo.devicePorts[i], i);
            }
            vm.checkAllIpMacValid();
        };

        vm.validateAllMac = function () {
            for (var i = 0; i < vm.editedInfo.devicePorts.length; i++) {
                vm.deviceMacChange(vm.editedInfo.devicePorts[i], i);
            }
            vm.checkAllIpMacValid();
        };
    }

    function FactoryDeviceNewCtrl($rootScope, $scope, $q, Device, models, formatVal, alldevice, dupeInfo, allDeviceFull, Signature) {
        var vm = $scope.newDevice = {};

        initial();

        vm.done = function () {
            var newDevice = {};
            var newModel = {};
            var newNodes = [];
            newDevice['name'] = $scope.device['name'];
            newDevice['modelId'] = $scope.device['modelname'];
            newDevice['_configMismatch'] = $scope.device['_configMismatch'];
            newDevice['protectedDevicesNumber'] = $scope.device['protectedDevicesNumber'];
            newDevice['cmmnPortnumber'] = $scope.device['cmmnPortnumber'];
            newDevice['isProtected'] = $scope.device['isProtected'];
            newDevice['iconType'] = $scope.device['iconType'];
            newDevice['hasUSB'] = $scope.device['hasUSB'];
            newDevice['hasWireless'] = $scope.device['hasWireless'];
            newDevice['hasPort'] = $scope.device['hasPort'];
            newDevice['serialNumber'] = $scope.device['serialNumber'];
            newDevice['devicePorts'] = [];
            var i;
            for (i = 0; i < $scope.device.ipmac.length; i++) {
                var tmp = $scope.device.ipmac[i];
                var data = {
                    isMgmtPort: true,
                    portIp: tmp.ip,
                    mac: tmp.mac ? tmp.mac.toUpperCase() : '',
                };
                if (newDevice['iconType'] === 'subnet') {
                    var lst = data.portIp.split('/');
                    data['netMask'] = formatVal.numToNetmask(lst[1]);
                }
                newDevice['devicePorts'].push(data);
            }
            newModel['model'] = $scope.device['model'] ? $scope.device['model'] : $scope.device['modelname'];
            newModel['model_name'] = $scope.device['modelname'];
            newModel['make'] = $scope.device['modelmake'];
            //newModel['protocol'] = $scope.device['modelprotocol'];
            //newModel['version'] = $scope.device['modelversion'];
            //newModel['firmwareVersion'] = $scope.device['modelfirmware'];
            //newModel['model_serialNo'] = $scope.device['modelserial'];
            newModel['model_memo'] = $scope.device['modelmemo'];
            newModel['numOfPorts'] = $scope.device['modelnumofports'];
            newModel['iconType'] = $scope.device['iconType'];
            newModel['category'] = 1;
            newNodes[0] = {};
            var defaultPort = [];
            for (var dCount = 0; dCount < $scope.device.ipmac.length; dCount++) {
                defaultPort.push('p' + dCount);
            }
            if (newDevice['iconType'] !== 'subnet') {
                newNodes[0]['ports'] = defaultPort;
            }
            newNodes[0]['name'] = $scope.device['name'];
            // newNodes[0]['_MAC'] = $scope.device['mac'];
            // newNodes[0]['_ip'] = ($scope.device['iconType']==='subnet')?$scope.device['subnetIp']:$scope.device['ip'];
            newNodes[0]['type'] = $scope.device['mode'];
            newNodes[0]['zoneName'] = $scope.device['name'];
            // hardcode importance = 1 instead of 0;
            newNodes[0]['importance'] = 1;

            if (vm.newModel) {
                var modelExists = false;
                for (i in $scope.forms.models) {
                    if (i && $scope.forms.models[i]['model'] === newModel.model && $scope.forms.models[i]['version'] === 'N/A' && ($scope.forms.models[i]['make'] === newModel.make || ($scope.forms.models[i]['make'] === 'N/A' && newModel.make === ''))) {
                        modelExists = true;
                        newDevice['modelId'] = $scope.forms.models[i]['modelId'];
                        break;
                    }
                }
                if (modelExists) {
                    vm.newModel = false;
                    createDevice(newDevice, newNodes);
                } else {
                    Device.createModel(newModel).then(function (data) {
                        newDevice['modelId'] = data['modelId'];
                        $scope.forms.models.splice(1, 0, {
                            'modelId': data['modelId'],
                            'model_name': newModel['model_name']
                        });
                        $scope.device['modelname'] = data['modelId'];
                        vm.newModel = false;
                        createDevice(newDevice, newNodes);
                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '添加设备型号失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                        });
                    });
                }
            } else {
                createDevice(newDevice, newNodes);
            }
        };

        vm.serialNumberChanged = function () {
            if ($scope.device['serialNumber']) {
                vm.hasDuplicateSN = formatVal.checkSerialNumberDup(allDeviceFull, $scope.device.serialNumber, -1);
            } else {
                vm.hasDuplicateSN = false;
            }
        };

        $scope.removeIpMac = function (index) {
            $scope.device.ipmac.splice(index, 1);
            vm.validateAllIp();
            vm.validateAllMac();
        };

        vm.validateDevice = function () {
            validateDevice();
        };

        vm.clearModelFields = function () {
            vm.newModel = true;
            $scope.device.model = '';
            $scope.device.modelname = '';
            $scope.device.modelmake = '';
            $scope.device.modelprotocol = '';
            $scope.device.modelversion = '';
            $scope.device.modelfirmware = '';
            $scope.device.modelserial = '';
            $scope.device.modelmemo = '';
        };

        vm.modelChange = function (modelId) {
            if (modelId === 'new') {
                vm.clearModelFields();
            } else {
                vm.newModel = false;
                populateModelInfo(modelId);
            }
            vm.validateDevice();
        };

        vm.modeChange = function () {
            if ($scope.device.modename) {
                for (var i in $scope.forms.modes) {
                    if (i && $scope.forms.modes[i].modename === $scope.device.modename['modename']) {
                        $scope.device['mode'] = $scope.forms.modes[i].mode;
                        $scope.device['iconType'] = $scope.forms.modes[i].icontype;
                        $scope.digest;
                        break;
                    }
                }
                if ($scope.device.modename['modename'] === '子网') {
                    // clear ip mac array when the mode is changed
                    $scope.device.ipmac = [{ip: "", mac: ""}];
                    vm.clearModelFields();
                }
                for (var j = 0; j < $scope.device.ipmac.length; j++) {
                    var tmp = $scope.device.ipmac[j];
                    if (tmp.ip) {
                        vm.validateIp(tmp, j);
                    }
                }
                vm.allIpMacValid();
                vm.validateDevice();
            }
        };

        function validateDevice() {
            if ($scope.device.iconType === 'subnet' && $scope.device.subnetIp) {
                formatVal.subnetParser(vm, $scope.device, $scope.device.subnetIp, alldevice);
            }
            vm.nameError = (!$scope.device['name'] || $scope.device['name'].length === 0);
            vm.modeError = (!$scope.device['mode'] || $scope.device['mode'].length === 0);
            if (vm.newModel) {
                vm.modelError = (!$scope.device['modelname'] || $scope.device['modelname'].length === 0);
            } else {
                vm.modelError = (!$scope.device['modelname'] || $scope.device['modelname'].length === 0);
            }
        }

        vm.validateIp = function (ipmac, index) {
            if ($scope.device.iconType === 'subnet') {
                ipmac.invalidIp = !ipmac.ip || formatVal.subnetValidation(ipmac.ip);
                ipmac.invalidRange = !ipmac.invalidIp && formatVal.subnetOverlap($scope.device, allDeviceFull, ipmac.ip);
            } else {
                ipmac.invalidIp = !ipmac.ip || formatVal.validateIp(ipmac.ip);
                ipmac.hasDuplicateIP = !ipmac.invalidIp && (dupeInfo.dupInOtherDevice('portIp', -1, allDeviceFull, ipmac.ip) || dupeInfo.checkDupInDevice($scope.device.ipmac, ipmac, index, 'ip'));
                ipmac.invalidRange = !ipmac.invalidIp && !ipmac.hasDuplicateIP && formatVal.checkIpInSubnet(ipmac.ip, allDeviceFull);
            }
        };

        vm.validateMac = function (ipmac, index) {
            ipmac.invalidMac = ipmac.mac && formatVal.validateMac(ipmac.mac);
            if (ipmac.mac) {
                ipmac.hasDuplicateMAC = !ipmac.invalidMac && (dupeInfo.dupInOtherDevice('mac', -1, allDeviceFull, ipmac.mac) || dupeInfo.checkDupInDevice($scope.device.ipmac, ipmac, index, 'mac'));
            } else {
                ipmac.hasDuplicateMAC = false;
            }
        };

        $scope.disableAddNewIp = true;
        vm.allIpMacValid = function () {
            $scope.disableAddNewIp = true;
            for (var i = 0; i < $scope.device.ipmac.length; i++) {
                var tmp = $scope.device.ipmac[i];
                if (!tmp.ip || tmp.invalidIp || tmp.hasDuplicateIP || tmp.invalidRange) {
                    $scope.disableAddNewIp = true;
                    return false;
                }
                if (tmp.invalidMac || tmp.hasDuplicateMAC) {
                    $scope.disableAddNewIp = true;
                    return false;
                }
                if ($scope.device.needMac && !tmp.mac) {
                    $scope.disableAddNewIp = true;
                    return false;
                }
            }
            $scope.disableAddNewIp = false;
            return true;
        };

        vm.validateAllIp = function () {
            for (var i = 0; i < $scope.device.ipmac.length; i++) {
                var tmp = $scope.device.ipmac[i];
                vm.validateIp(tmp, i);
            }
            vm.allIpMacValid();
        };

        vm.validateAllMac = function () {
            for (var i = 0; i < $scope.device.ipmac.length; i++) {
                var tmp = $scope.device.ipmac[i];
                vm.validateMac(tmp, i);
            }
            vm.allIpMacValid();
        };

        $scope.addIpMac = function () {
            $scope.device.ipmac.push({ip: "", mac: ""});
            $scope.disableAddNewIp = true;
        };

        function createDevice(newDevice, newNodes) {
            Device.createDevice(newDevice).then(function (data) {
                newNodes[0]['deviceId'] = data['deviceId'];
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
                window.location.href = '/asset/factorydevice';
                $rootScope.addAlert({
                    type: 'success',
                    content: '添加设备到加入当前拓扑成功'
                });
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '加入当前拓扑失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        }

        function populateModelInfo(modelId) {
            for (var i in $scope.forms.models) {
                if (i && $scope.forms.models[i]['modelId'] === modelId) {
                    $scope.device['modelId'] = $scope.forms.models[i]['modelId'];
                    $scope.device['model'] = $scope.forms.models[i]['model'];
                    $scope.device['modelmake'] = $scope.forms.models[i]['make'];
                    $scope.device['modelprotocol'] = $scope.forms.models[i]['protocol'];
                    $scope.device['modelversion'] = $scope.forms.models[i]['version'];
                    $scope.device['modelfirmware'] = $scope.forms.models[i]['firmwareVersion'];
                    $scope.device['modelserial'] = $scope.forms.models[i]['model_serialNo'];
                    $scope.device['modelmemo'] = $scope.forms.models[i]['model_memo'];
                    var iconType = $scope.forms.models[i]['iconType'];
                    if (!iconType) {
                        vm.modeChange();
                    } else {
                        $scope.device['iconType'] = iconType;
                    }
                    break;
                }
            }
        }

        ////////////
        function initial() {
            $scope.device = {};
            $scope.device.category = 'FACTORY_DEVICE';
            var forms = $scope.forms = {};
            forms.models = models;
            // Currently allow to add new model
            forms.models.splice(0, 0, {'modelId': 'new', 'model_name': '添加设备型号'});

            $scope.forms.modes = [
                {mode: 'ENDPOINT', modename: '高端数控机床', icontype: 'cnc'},
                {mode: 'ENDPOINT', modename: 'HMI', icontype: 'hmi'},
                {mode: 'ENDPOINT', modename: 'OPC 客户端', icontype: 'opc_client'},
                {mode: 'ENDPOINT', modename: 'OPC 服务器', icontype: 'opc_server'},
                {mode: 'ENDPOINT', modename: 'PLC', icontype: 'plc'},
                {mode: 'ENDPOINT', modename: '工作站', icontype: 'workstation'},
                {mode: 'ENDPOINT', modename: '子网', icontype: 'subnet'},
                //{mode: 'CLOUD', modename: 'Cloud', icontype: 'cloud'},
                {mode: 'ENDPOINT', modename: '其它', icontype: 'unknown-device'}
            ];

            $scope.device.ipmac = [{ip: "", mac: ""}];

            Signature.isMacNeeded().then(function (data) {
                $scope.device.needMac = data;
            });
        }
    }

})();
