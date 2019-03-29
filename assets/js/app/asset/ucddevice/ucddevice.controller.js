/**
 * Asset Network Device Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.ucddevice')
        .controller('UCDDeviceCtrl', UCDDeviceCtrl)
        .controller('UCDDeviceDetailCtrl', UCDDeviceDetailCtrl)
        .controller('UCDDeviceNewCtrl', UCDDeviceNewCtrl);

    var VALIDATE_IP = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
    var VALIDATE_MAC = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;

    function UCDDeviceCtrl(Enum) {
        var vm = this;
        vm.editRight = (Enum.get('privilege').filter(function (a) {
            return a.name === 'DEVICE_MANAGEMENT';
        })[0].actionValue === 30);
    }

    function UCDDeviceDetailCtrl(Device, device, $rootScope, $state, $q, models, snVal) {
//      console.log(device);
        var vm = this;
        vm.device = device;
        vm.validateIp = angular.copy(VALIDATE_IP);
        vm.validateMac = angular.copy(VALIDATE_MAC);

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
            vm.invalidIp = vm.editedInfo.ip && !(vm.editedInfo.ip.match(vm.validateIp));
            vm.invalidMac = vm.editedInfo.mac && !(vm.editedInfo.mac.match(vm.validateMac));
            vm.isIPEdited = true;
        };

        vm.editIPCancel = function () {
            angular.copy(vm.editedInfo, vm.device);
            vm.isIPEdited = false;
        };

        vm.editIPDone = function () {
            var portIpMac = {portIp: vm.editedInfo.ip, mac: vm.editedInfo.mac ? vm.editedInfo.mac : ''};
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

            $q.all([
                Device.hasDuplicateSN(device['deviceId'], device['serialNumber'])
            ]).then(function (data) {
                var hasDuplicateSN = data[0];
                if (hasDuplicateSN) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '添加设备失败：设备序列号已经存在。'
                    });
                } else {
                    if (vm.newModel) {
                        var newModel = {};
                        newModel.model = vm.editedInfo._model_name;
                        newModel.model_name = vm.editedInfo._model_name;
                        newModel.make = vm.editedInfo.make;
                        newModel.iconType = vm.editedInfo.iconType;
                        newModel.category = 2;
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
                    } else {
                        device.modelId = vm.editedInfo.modelId;
                        updateDevice(device);
                    }
                }
            });
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

        vm.serialChange = function () {
            (vm.editedInfo.category === "SECURITY_DEVICE") ? vm.serialNumberChanged(vm.editedInfo.serialNumber) : '';
            validateDevice();
        };

        function validateDevice() {
            vm.nameError = (!vm.editedInfo.name || vm.editedInfo.name.length === 0);
            vm.serialError = (!vm.editedInfo.serialNumber || vm.editedInfo.serialNumber.length === 0);
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
                vm.editedInfo._model_name = model['modelName'];
                populateModelInfo(model['id']);
            }
        };

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
                if (i && vm.forms.models[i]['iconType'] && vm.forms.models[i]['modelId'] === modelId) {
                    vm.editedInfo.modelId = modelId;
                    vm.editedInfo.make = vm.forms.models[i]['make'];
                    vm.editedInfo.iconType = vm.forms.models[i]['iconType'] ? vm.forms.models[i]['iconType'] : vm.editedInfo.iconType ? vm.editedInfo.iconType : 'unknown-device';
                    break;
                }
            }
        }

        vm.deviceIpChange = function () {
            vm.invalidIp = vm.editedInfo.ip && !(vm.editedInfo.ip.match(vm.validateIp));
        };

        vm.deviceMacChange = function () {
            vm.invalidMac = vm.editedInfo.mac && !(vm.editedInfo.mac.match(vm.validateMac));
        };
    }

    function UCDDeviceNewCtrl($rootScope, $scope, $q, Device, models) {
        var vm = $scope.newDevice = {};
        vm.validateIp = angular.copy(VALIDATE_IP);
        vm.validateMac = angular.copy(VALIDATE_MAC);
        var modelIconType;

        initial();
        validateDevice();

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
            newDevice['iconType'] = $scope.device['modelicontype'];
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
            newModel['protocol'] = $scope.device['modelprotocol'];
            newModel['version'] = $scope.device['modelversion'];
            newModel['firmwareVersion'] = $scope.device['modelfirmware'];
            newModel['model_serialNo'] = $scope.device['modelserial'];
            newModel['model_memo'] = $scope.device['modelmemo'];
            newModel['numOfPorts'] = $scope.device['modelnumofports'];
            newModel['iconType'] = $scope.device['modelicontype'];
            newModel['category'] = 2;
            newNodes[0] = {};
            newNodes[0]['name'] = $scope.device['name'];
            newNodes[0]['_MAC'] = $scope.device['mac'];
            newNodes[0]['_ip'] = $scope.device['ip'];
            newNodes[0]['type'] = $scope.device['mode'];
            newNodes[0]['zoneName'] = 'NA';

            $q.all([
                Device.hasDuplicateSN(newDevice['deviceId'], newDevice['serialNumber']),
                Device.hasDuplicateIP(newDevice['deviceId'], $scope.device['ip'])
            ]).then(function (data) {
                var hasDuplicateSN = data[0];
                var hasDuplicateIP = data[1];
                if (hasDuplicateSN) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '添加设备失败：设备序列号已经存在。'
                    });
                }
                if (hasDuplicateIP) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '添加设备失败：设备IP已经存在。'
                    });
                }
                if (!hasDuplicateSN && !hasDuplicateIP) {
                    if (vm.newModel) {
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
                    } else {
                        createDevice(newDevice, newNodes);
                    }
                }
            });
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
                        $scope.device['modelicontype'] = modelIconType ? modelIconType : $scope.forms.modes[i].icontype;
                        break;
                    }
                }
                vm.validateDevice();
            }
        };

        function validateDevice() {
            vm.nameError = (!$scope.device['name'] || $scope.device['name'].length === 0);
            vm.modeError = (!$scope.device['mode'] || $scope.device['mode'].length === 0);
            vm.invalidIp = $scope.device['ip'] && !($scope.device['ip'].match(vm.validateIp));
            vm.invalidMac = $scope.device['mac'] && !($scope.device['mac'].match(vm.validateMac));
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
                    var modelIconType = $scope.forms.models[i]['iconType'];
                    if (!modelIconType) {
                        vm.modeChange();
                    } else {
                        $scope.device['modelicontype'] = modelIconType;
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
                {mode: 'ENDPOINT', modename: '其它', icontype: 'unknown-device'}
            ];
        }
    }

})();
