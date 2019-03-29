/**
 * Setting Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.systemdevice')
        .controller('SystemDeviceCtrl', SystemDeviceCtrl)
        .controller('SystemDeviceBackUpCtrl', SystemDeviceBackUpCtrl);

    function SystemDeviceCtrl($modal, $scope, domain, Device, topologyId, System, FileUploader, URI, $rootScope, Enum, uiTree, deviceTypeService, $stateParams) {
        var vm = this;
        vm.simplifyModelName = deviceTypeService.simplifyModelName;
        upgrade_getDpiData();
        vm.upgrade_dpiSelectAll = false;
        vm.reset_dpiSelectAll = false;
        vm.eventHandler = {};
        vm.variable = {
            'upgrade_stats': 'NONE'
        };

        // Init landing tab for system_device
        var system_device_child_nodes = uiTree.getNode("SYSTEM_DEVICE_MANAGEMENT").getChilds();
        var system_device_tabs = ["DEVICE_RESET", "DEVICE_UPGRADE"];
        for (var i = 0; i < system_device_child_nodes.length; i++) {
            if (system_device_child_nodes[i].getPrivilegeValue() > 1) {
                console.log(system_device_child_nodes[i]);
                vm.system_device_init_tab = system_device_tabs[i];   //As the first two privilege both point to SYSTEM_SETTING
                break;
            }
        }

        if ($stateParams.tab !== null) {
            vm.system_device_init_tab = $stateParams.tab;
        }
        vm.getMenuFromTarget = function (target) {
            if ($rootScope.parsedMenu && $rootScope.parsedMenu[2]) {
                for (var i = 0; i < $rootScope.parsedMenu[2].length; i++) {
                    var tmp = $rootScope.parsedMenu[2][i];
                    if (tmp.target === target && tmp.active) {
                        return tmp.description;
                    }
                }
            }
            return false;
        };
        vm.systemConsoleTabEnabled = function (target) {
            if (vm.getMenuFromTarget(target)) {
                return true;
            }
            return false;
        };

        vm.eventHandler.deviceHandler = $rootScope.$on('device', function (event, data) {
            //sse.listen('device', $scope, function(data){
            if (data.deviceOnline === -1 || data.deviceOnline === 1) {
                for (var i = 0; i < vm.dpiData.length; i++) {
                    if (vm.dpiData[i].deviceId === data.deviceId) {
                        vm.dpiData[i].deviceOnline = data.deviceOnline;
                        $scope.$apply();
                        return;
                    }
                }
            }
        });
        $scope.$on('destroy', function () {
            vm.eventHandler.deviceHandler();
            vm.eventHandler.dpiUpgradeStateHandler();
        });

        vm.editRight = (Enum.get('privilege').filter(function (a) {
            return a.name === 'DEVICE_MANAGEMENT';
        })[0].actionValue === 30);

        //Upgrade System:
        vm.uploader = new FileUploader({
            url: URI + '/files/device/uploadimage',
            autoUpload: true,
            queueLimit: 1
        });

        vm.uploader.onErrorItem = function (item, response) {
            vm.uploadImageFail = response.reason === 'invalid_file_format' ? '升级包文件无效' : '无效的升级包文件或网络有问题';
        };
        vm.uploader.onSuccessItem = function (item, response) {
            vm.upgradeImageInfo = response;
            vm.changeUpdate();
        };

        vm.validate = {
            packageUploaded: false,
            isUploading: false,
            uploadFailed: false
        };
        vm.reset = {
            type: "restart"
        };

        vm.reset_selectAllDPI = function () {
            vm.reset_selectDPI = [];
            for (var i = 0; i < vm.dpiData.length; i++) {
                vm.reset_selectDPI.push(vm.reset_dpiSelectAll && vm.onlineDPI[i] && !vm.dpiData[i].isUpgrading);
            }
        };
        vm.confirmReset = function () {
            var selectedDPI = [];
            var selectedDPINum = [];
            for (var i = 0; i < vm.dpiData.length; i++) {
                if (vm.reset_selectDPI[i]) {
                    selectedDPI.push(vm.dpiData[i]);
                    selectedDPINum.push({'serialNumber': vm.dpiData[i].serialNumber});
                }
            }
            console.log(selectedDPI);
            if (!selectedDPI.length) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '没有选中任何设备。'
                });
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/systemdevice/reset-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, System) {
                $scope.title = '设备重置';
                if (vm.reset.type === "restart") {
                    $scope.info = '你现在选择以下设备重启:';
                    $scope.confirmInfo = '确定要重启吗？';
                } else if (vm.reset.type === "reset") {
                    $scope.info = '你现在选择以下设备恢复原厂设置:';
                    $scope.confirmInfo = '此动作会将设备信息移除, 确定要恢复原厂设置吗？';
                } else if (vm.reset.type === "shutdown") {
                    $scope.info = '你现在选择关闭以下设备:';
                    $scope.confirmInfo = '确定要关闭吗？';
                }
                $scope.deviceList = selectedDPI;
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    if (vm.reset.type === "restart") {
                        System.restartDevice(selectedDPINum, topologyId.id).then(function (data) {
                            console.log("factory restart success");
                            console.log(data);
                            $rootScope.addAlert({
                                type: 'success',
                                content: '设备即将开始重启。请稍等。。。'
                            });
                        }, function (data) {
                            console.log('factory restart failed');
                            console.log(data);
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '设备重启没有成功。'
                            });
                        });
                    } else if (vm.reset.type === "reset") {
                        System.resetDevice(selectedDPINum, topologyId.id).then(function (data) {
                            console.log("factory reset success");
                            console.log(data);
                            $rootScope.addAlert({
                                type: 'success',
                                content: '设备即将开始恢复原厂设置。请稍等。。。'
                            });
                        }, function (data) {
                            console.log('factory reset failed');
                            console.log(data);
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '恢复原厂设置失败。'
                            });
                        });
                    } else if (vm.reset.type === "shutdown") {
                        System.shutdownDevice(selectedDPINum, topologyId.id).then(function (data) {
                            console.log("factory reset success");
                            console.log(data);
                            $rootScope.addAlert({
                                type: 'success',
                                content: '设备即将关闭。请稍等。。。'
                            });
                        }, function (data) {
                            console.log('factory reset failed');
                            console.log(data);
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '关闭设备没有成功。'
                            });
                        });
                    }

                    vm.reset_selectDPI = vm.reset_selectDPI.map(function (d) {
                        d = false;
                    });
                    vm.reset_dpiSelectAll = false;
                    $modalInstance.close('done');
                };
            }
        };

        //===================================Device Upgrade=============================================
        vm.isUpgrading = false;
        vm.downgradeWarning = false;
        vm.firstConfirmUpgrade = false;
        vm.showLastUpgrade = false;
        vm.upgrade_selectDPI = [];
        System.getUpgradeImageInfo().then(function (data) {
            vm.upgradeImageInfo = data.data;
        });

        vm.eventHandler.dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
            //console.log("State Change");
            upgrade_getDpiData();
        });

        vm.upgrade_selectAllDPI = function () {
            vm.upgrade_selectDPI = [];
            for (var i = 0; i < vm.dpiData.length; i++) {
                console.log(vm.onlineDPI[i] + ", " + vm.dpiData[i].topologyId);
                vm.upgrade_selectDPI.push(vm.upgrade_dpiSelectAll && (vm.onlineDPI[i] || vm.dpiData[i].topologyId === '-1'));
            }
            vm.changeUpdate();
        };
        vm.changeUpdate = function () {
            var imageVersion = {};
            var currentVersion = {};
            vm.versionCompare = [];
            var imgVersionString = vm.upgradeImageInfo && vm.upgradeImageInfo.imageVersion ? vm.upgradeImageInfo.imageVersion.slice(vm.upgradeImageInfo.imageVersion.indexOf('-') + 1, vm.upgradeImageInfo.imageVersion.lastIndexOf('-')) : null;
            if (imgVersionString) {
                imageVersion.buildStr = imgVersionString.slice(0, imgVersionString.indexOf('-'));
                imgVersionString = imgVersionString.slice(0, imgVersionString.lastIndexOf('-'));
                imageVersion.versionStr = imgVersionString.slice(imgVersionString.lastIndexOf('-') + 1, imgVersionString.length);
            }

            vm.upgradelist = [];
            vm.upgradeDevicelist = [];
            for (var i = 0; i < vm.dpiData.length; i++) {
                if (vm.upgrade_selectDPI[i]) {
                    vm.upgradelist.push(vm.dpiData[i].serialNumber);
                    vm.upgradeDevicelist.push(vm.dpiData[i]);
                }
            }
            vm.upgradeDevicelist.map(function (d) {
                var curVersionString = d.version.slice(d.version.indexOf('-') + 1, d.version.length);
                currentVersion.buildStr = curVersionString.slice(0, curVersionString.indexOf('-'));
                curVersionString = curVersionString.slice(0, curVersionString.lastIndexOf('-'));
                currentVersion.versionStr = curVersionString.slice(curVersionString.lastIndexOf('-') + 1, curVersionString.length);
                vm.versionCompare.push(!imgVersionString ? 'N/A' : currentVersion.buildStr > imageVersion.buildStr || (currentVersion.buildStr === imageVersion.buildStr && currentVersion.versionStr > imageVersion.versionStr) ? 'LOWER' : currentVersion.buildStr === imageVersion.buildStr && currentVersion.versionStr === imageVersion.versionStr ? 'SAME' : 'HIGHER');
            });
            vm.downgradeWarning = vm.versionCompare && vm.versionCompare.filter(function (v) {
                    return v !== 'HIGHER';
                }).length;
        };
        vm.upgrade_isAnySelected = function () {
            for (var i = 0; i < vm.upgrade_selectDPI.length; i++) {
                if (vm.upgrade_selectDPI[i]) {
                    return true;
                }
            }
        };
        vm.confirmUpgrade = function () {
            vm.changeUpdate();
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/systemdevice/upgrade-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });
            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, System) {
                $scope.title = '设备升级';
                $scope.confirmInfo = '确定要升级吗？';
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    if (vm.upgradelist.length) {
                        System.upgradeDPI(vm.upgradelist).then(function (data) {
                            if (data.data.state === "REJECTED") {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '升级失败，' + data.data.rejectReason
                                });
                            } else {
                                vm.firstConfirmUpgrade = true;
                            }
                        });
                    }
                    $modalInstance.close('done');
                };
            }
        };
        vm.upgradeInfo = function () {
            var filterString = "";
            var timeParam = {
                "NONE": 0,
                "COMMAND_RESOLVED": 1,
                "DOWNLOADING": 2,
                "UPGRADING": 3
            };
            for (var n = 0; n < vm.dpiSNlist.length; n++) {
                filterString += 'serialNumber=' + vm.dpiSNlist[n] + '&';
            }
            filterString = filterString ? filterString.substring(0, filterString.length - 1) : "";
            filterString += '&$orderby=deviceId';
            //console.log(filterString);
            if (filterString) {
                return System.getDPIUpgradeInfo(filterString).then(function (data) {
                    vm.upgradingDPIinfo = data.data;
                    //console.log(vm.upgradingDPIinfo);
                    vm.upgradingDevices = [];
                    if (vm.upgradingDPIinfo) {
                        for (var j = 0; j < vm.upgradingDPIinfo.length; j++) {
                            for (var i = 0; i < vm.dpiData.length; i++) {
                                //console.log(vm.dpiData[i].deviceId + ", " + vm.upgradingDPIinfo[j].deviceId);
                                if (vm.dpiData[i].deviceId === vm.upgradingDPIinfo[j].deviceId) {
                                    vm.upgradingDevices.push(vm.dpiData[i]);
                                }
                            }
                            //Convert 4 stage into 1 stage with 100% bar:

                            vm.upgradingDPIinfo[j].percentageShow = 25 * timeParam[vm.upgradingDPIinfo[j].state] + Math.round(vm.upgradingDPIinfo[j].percentage / 4);
                            //HardCode:
                            if (vm.upgradingDPIinfo[j].state === 'NONE' && vm.upgradingDPIinfo[j].percentage === 100) {
                                vm.upgradingDPIinfo[j].percentageShow = 100;
                            }

                            //console.log(vm.upgradingDPIinfo[j].percentage);
                            //console.log(vm.upgradingDevices);
                            if (vm.upgrade_selectDPI[i]) {
                                vm.upgradelist.push(vm.dpiData[i].serialNumber);
                            }
                        }
                        vm.isUpgrading = (vm.upgradingDPIinfo.filter(function (a) {
                            return (a.state !== 'NONE' || (a.state === 'NONE' && a.percentage !== 0 && a.percentage !== 100)) && !a.error;
                        })[0]) ? true : false;
                        vm.showLastUpgrade = vm.isUpgrading ? true : vm.showLastUpgrade;
                    } else {
                        vm.upgradingDPIinfo = [];
                        vm.isUpgrading = false;
                    }
                    return vm.isUpgrading;
                });
            } else {
                vm.upgradingDPIinfo = [];
                vm.isUpgrading = false;
                return vm.isUpgrading;
            }
        };

        function upgrade_getDpiData() {
            var params = {};
            var filter = 'category eq SECURITY_DEVICE';
            var fullDeviceAccess = Enum.get('Role');
            if (!fullDeviceAccess[0].defaultRole) {
                var visibleDevice = Enum.get('deviceAccess');
                if (visibleDevice.length) {
                    filter += " and (";
                    filter += visibleDevice.map(function (field) {
                        return "contains(deviceId, '" + field + "')";
                    }).join(' or ');
                    filter += ")";
                } else {
                    filter += " and (contains(deviceId, 'null'))";
                }
            }
            //console.log(filter);
            params['$filter'] = filter;
            params['$orderby'] = 'deviceId';

            Device.getAll(params).then(function (data) {
                //Device.getNewDevices(params).then(function (newD) {   //Not allow upgrading new discovered device
                //vm.dpiData = data.concat(newD);
                vm.dpiData = data;
                //console.log(vm.dpiData);
                vm.reset_selectDPI = [];
                vm.upgrade_selectDPI = [];
                vm.onlineDPI = [];
                //Initial State:
                vm.dpiSNlist = [];
                for (var i = 0; i < vm.dpiData.length; i++) {
                    for (var j = 0; j < vm.dpiData[i].devicePorts.length; j++) {
                        if (vm.dpiData[i].devicePorts[j].isMgmtPort) {
                            vm.dpiData[i].ip = vm.dpiData[i].devicePorts[j].portIp;
                        }
                    }
                    vm.reset_selectDPI.push(false);
                    vm.upgrade_selectDPI.push(false);
                    vm.dpiSNlist.push(vm.dpiData[i].serialNumber);
                    vm.onlineDPI.push(vm.dpiData[i].deviceOnline === 1 && vm.dpiData[i].deviceSource === 'DISCOVERY');
                }
                vm.upgradeInfo().then(function () {
                    for (var i = 0; i < vm.dpiData.length; i++) {
                        var deviceUpgradeInfo;
                        if (vm.dpiData[i].deviceId === vm.upgradingDPIinfo[i].deviceId) {
                            deviceUpgradeInfo = vm.upgradingDPIinfo[i];
                        } else {
                            for (var j = i; j < vm.upgradingDPIinfo.length; j++) {
                                if (vm.upgradingDPIinfo[j].deviceId === vm.dpiData[i].deviceId) {
                                    deviceUpgradeInfo = vm.upgradingDPIinfo[j];
                                    break;
                                }
                            }
                        }
                        vm.dpiData[i].isUpgrading = (!deviceUpgradeInfo) || !((deviceUpgradeInfo.state === "NONE" && (deviceUpgradeInfo.percentage === 0 || deviceUpgradeInfo.percentage === 100)) || deviceUpgradeInfo.error);
                    }
                });
                // vm.upgradeInfo().then(function () {
                //   if(vm.isUpgrading){
                //     console.log("start upgrading");
                //     $timeout.cancel($rootScope.upgradeDpiTimer);
                //     $rootScope.upgradeDpiTimer = $timeout(function(){
                //      upgrade_getDpiData();
                //     }, 5000);
                //   }else{
                //     //console.log("upgrading finished");
                //     $timeout.cancel($rootScope.upgradeDpiTimer);
                //   }
                // });
                //});
            });

        }
    }

    function SystemDeviceBackUpCtrl($scope, $stateParams) {
        $scope.deviceid = $stateParams.deviceid;
        $scope.deviceName = $stateParams.deviceName;
    }
})();
