/**
 * Asset Network Device Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.networkdevice')
        .controller('NetworkDeviceCtrl', NetworkDeviceCtrl)
        .controller('NetworkDeviceDetailCtrl', NetworkDeviceDetailCtrl)
        .controller('NetworkDeviceNewCtrl', NetworkDeviceNewCtrl);

    function NetworkDeviceCtrl(Enum) {
        var vm = this;
        vm.editRight = (Enum.get('privilege').filter(function (a) {
            return a.name === 'DEVICE_MANAGEMENT';
        })[0].actionValue === 30);
    }

    function NetworkDeviceDetailCtrl(Device, device, $rootScope, $state, $q, models, formatVal, alldevice, dupeInfo, allDeviceFull) {
        var vm = this;
        vm.device = device;
        vm.validateIp = angular.copy(formatVal.getIPReg());
        vm.validateMac = angular.copy(formatVal.getMACReg());

        vm.validate = [];

        var forms = vm.forms = {};
        forms.models = models;
        // Currently allow to add new model
        forms.models.splice(0, 0, {'modelId': 'new', 'model_name': '添加设备型号'});

        vm.editIP = function () {
            vm.editedInfo = angular.copy(vm.device);
            for (var i = 0; i < vm.device.devicePorts.length; i++) {
                if (vm.device.devicePorts[i].isMgmtPort) {
                    vm.editedInfo.ip = vm.device.devicePorts[i].portIp;
                    vm.editedInfo.mac = vm.device.devicePorts[i].mac;
                    break;
                }
            }
            vm.deviceIpChange();
            vm.deviceMacChange();
            vm.isIPEdited = true;
        };

        vm.editIPCancel = function () {
            vm.isIPEdited = false;
        };

        vm.editIPDone = function () {
            var portIpMac = {
                portIp: vm.editedInfo.ip,
                mac: vm.editedInfo.mac ? vm.editedInfo.mac.toUpperCase() : '',
                portId: vm.editedInfo.devicePorts[0].portId
            };
            Device.updateMgmIpMac(vm.device.topologyId, vm.device.deviceId, portIpMac).then(function () {
                vm.isIPEdited = false;
                $state.reload().then(function () {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '修改设备端口成功'
                    });
                });
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '修改设备端口失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
            });
        };

        vm.editDevice = function () {
            delete vm.device.port;
            vm.editedInfo = angular.copy(vm.device);
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
            delete device._networkCount;
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
                newModel.category = 2;
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
            vm.hasDuplicateSN = false;
            if (vm.editedInfo.serialNumber) {
                vm.hasDuplicateSN = formatVal.checkSerialNumberDup(allDeviceFull, vm.editedInfo.serialNumber, vm.editedInfo.deviceId);
            }
            vm.nameError = (!vm.editedInfo.name || vm.editedInfo.name.length === 0);
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

        vm.deviceIpChange = function () {
            vm.invalidIp = vm.editedInfo.ip && formatVal.validateIp(vm.editedInfo.ip);
            if (!vm.invalidIp && vm.editedInfo.ip) {
                vm.hasDuplicateIP = dupeInfo.dupInOtherDevice('portIp', vm.editedInfo.deviceId, allDeviceFull, vm.editedInfo.ip);
                vm.invalidRange = !vm.hasDuplicateIP && formatVal.checkIpInSubnet(vm.editedInfo.ip, allDeviceFull);
            } else {
                vm.hasDuplicateIP = false;
                vm.invalidRange = false;
            }
        };

        vm.deviceMacChange = function () {
            vm.invalidMac = vm.editedInfo.mac && !(vm.editedInfo.mac.match(vm.validateMac));
            vm.hasDuplicateMAC = false;
            if (vm.editedInfo.mac && !vm.invalidMac) {
                vm.hasDuplicateMAC = dupeInfo.dupInOtherDevice('mac', vm.editedInfo.deviceId, allDeviceFull, vm.editedInfo.mac);
            }
        };
    }

    function NetworkDeviceNewCtrl($rootScope, $scope, $q, Device, models, formatVal, alldevice, dupeInfo, allDeviceFull) {
        var vm = $scope.newDevice = {};
        vm.validateIp = angular.copy(formatVal.getIPReg());
        vm.validateMac = angular.copy(formatVal.getMACReg());
        var iconType;

        initial();
        validateDevice();

        vm.done = function () {
            var newDevice = {};
            var newModel = {};
            var newNodes = [];
            $scope.device['mac'] ? $scope.device['mac'] = $scope.device['mac'].toUpperCase() : '';
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
            newDevice['devicePorts'][0] = {};
            newDevice['devicePorts'][0]['isMgmtPort'] = true;
            newDevice['devicePorts'][0]['portIp'] = $scope.device['ip'];
            newDevice['devicePorts'][0]['mac'] = $scope.device['mac'];
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
            newModel['category'] = 2;
            newNodes[0] = {};
            newNodes[0]['name'] = $scope.device['name'];
            //newNodes[0]['_MAC'] = $scope.device['mac'];
            //newNodes[0]['_ip'] = $scope.device['ip'];
            newNodes[0]['type'] = $scope.device['mode'];
            newNodes[0]['zoneName'] = 'NA';
            // hardcode importance = 1 instead of 0;
            newNodes[0]['importance'] = 1;

            if (vm.newModel) {
                var modelExists = false;
                for (var i in $scope.forms.models) {
                    if (i && $scope.forms.models[i]['model'] === newModel.model && $scope.forms.models[i]['version'] === 'N/A' && $scope.forms.models[i]['make'] === newModel.make) {
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

        vm.validateDevice = function () {
            validateDevice();
        };

        vm.modelChange = function (modelId) {
            if (modelId === 'new') {
                vm.newModel = true;
                $scope.device.model = '';
                $scope.device.modelname = '';
                $scope.device.modelmake = '';
                $scope.device.modelprotocol = '';
                $scope.device.modelversion = '';
                $scope.device.modelfirmware = '';
                $scope.device.modelserial = '';
                $scope.device.modelmemo = '';
            } else {
                vm.newModel = false;
                populateModelInfo(modelId);
            }
            vm.validateDevice();
        };

        vm.modeChange = function () {
            if ($scope.device['mode'] !== 'ROUTER') {
                $scope.device['ip'] = '';
                $scope.device['mac'] = '';
            }
            if ($scope.device.modename) {
                for (var i in $scope.forms.modes) {
                    if (i && $scope.forms.modes[i].modename === $scope.device.modename['modename']) {
                        $scope.device['mode'] = $scope.forms.modes[i].mode;
                        $scope.device['iconType'] = iconType ? iconType : $scope.forms.modes[i].icontype;
                        break;
                    }
                }
                vm.validateDevice();
            }
        };

        function validateDevice() {
            vm.nameError = (!$scope.device['name'] || $scope.device['name'].length === 0);
            vm.modeError = (!$scope.device['mode'] || $scope.device['mode'].length === 0);
            vm.invalidIp = $scope.device['ip'] && formatVal.validateIp($scope.device['ip']);
            vm.invalidMac = $scope.device['mac'] && !($scope.device['mac'].match(vm.validateMac));
            if ($scope.device.ip && !vm.invalidIp) {
                vm.hasDuplicateIP = !vm.invalidIp && dupeInfo.dupInOtherDevice('portIp', -1, allDeviceFull, $scope.device.ip);
                vm.invalidRange = !vm.invalidIp && !vm.hasDuplicateIP && formatVal.checkIpInSubnet($scope.device.ip, allDeviceFull);
            } else {
                vm.hasDuplicateIP = false;
                vm.invalidRange = false;
            }
            if ($scope.device.mac && !vm.invalidMac) {
                vm.hasDuplicateMAC = dupeInfo.dupInOtherDevice('mac', -1, allDeviceFull, $scope.device.mac);
            } else {
                vm.hasDuplicateMAC = false;
            }
            if (vm.newModel) {
                vm.modelError = (!$scope.device['modelname'] || $scope.device['modelname'].length === 0);
            } else {
                vm.modelError = (!$scope.device['modelname'] || $scope.device['modelname'].length === 0);
            }
        }

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
                window.location.href = '/asset/networkdevice';
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
            $scope.device.category = 'NETWORK_DEVICE';
            var forms = $scope.forms = {};
            forms.models = models;
            // Currently allow to add new model
            forms.models.splice(0, 0, {'modelId': 'new', 'model_name': '添加设备型号'});

            $scope.forms.modes = [
                {mode: 'SWITCH', modename: '网络交换机', icontype: 'switch'},
                {mode: 'ROUTER', modename: '路由器', icontype: 'router'},
                {mode: 'SWITCH', modename: '其它', icontype: 'unknown-device'}
            ];
        }

        vm.serialNumberChanged = function () {
            if ($scope.device['serialNumber']) {
                vm.hasDuplicateSN = formatVal.checkSerialNumberDup(allDeviceFull, $scope.device.serialNumber, -1);
            } else {
                vm.hasDuplicateSN = false;
            }
        };
    }

})();
