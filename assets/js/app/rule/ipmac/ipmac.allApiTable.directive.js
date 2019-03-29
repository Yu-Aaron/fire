(function () {
    'use strict';

    angular
        .module('southWest.rule.ipmac')
        .directive('ipmacAllDpiTable', ipmacAllDpiTable);

    function ipmacAllDpiTable(Device, auth, Signature) {
        var ipmacTableObj = {
            scope: false,
            restrict: 'E',
            templateUrl: '/templates/rule/ipmac/ipmac-all-dpi-table.html',
            controller: controller,
            controllerAs: 'IpMacAllDpi',
            link: function () {
            }
        };

        return ipmacTableObj;

        //////////
        function controller($state, $scope, $q, $rootScope, uiCtrl, $timeout, Task) {
            var vm = this;
            vm.actionAll = 'DROP';
            vm.turnOnAll = false;
            vm.dpiSelectAll = false;
            vm.selectDPI = [];
            var Sfilter = 'category eq SECURITY_DEVICE';
            var Ffilter = 'category eq FACTORY_DEVICE';

            vm.selectAllDPI = function () {
                for (var i = 0; i < vm.selectDPI.length; i++) {
                    //Only select online device
                    vm.selectDPI[i] = vm.dpiData[i].deviceOnline ? vm.dpiSelectAll : false;
                }
            };

            vm.isEmpty = function () {
                return vm.selectDPI.filter(function (a) {
                    return a === true;
                })[0] ? false : true;
            };

            vm.deploy = function () {
                if (vm.isEmpty()) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '请先选择需要部署规则的设备！'
                    });
                    return;
                }
                var param = {};
                param['ipMacAction'] = vm.actionAll;
                var promises = [];
                for (var i = 0; i < vm.dpiData.length; i++) {
                    if (vm.selectDPI[i]) {
                        //console.log(vm.dpiData[i].mgmtIp);
                        var factoryDeviceArray = [];
                        for (var j = 0; j < vm.dpiData[i].factoryDevice.length; j++) {
                            for (var k = 0; k < vm.dpiData[i].factoryDevice[j].devicePorts.length; k++) {
                                if (vm.dpiData[i].factoryDevice[j].devicePorts[k].isMgmtPort && vm.dpiData[i].factoryDevice[j].devicePorts[k].mac) {
                                    factoryDeviceArray.push(vm.dpiData[i].factoryDevice[j].deviceId);
                                }
                            }
                        }
                        promises.push(Signature.changeIPMACAction(param, vm.dpiData[i].mgmtIp));
                        if (factoryDeviceArray.length) {
                            if (vm.turnOnAll) {
                                promises.push(Device.createIPMACBinding(null, factoryDeviceArray, vm.dpiData[i].mgmtIp));
                            } else {
                                promises.push(Device.deleteIPMACBinding(null, vm.dpiData[i].mgmtIp));
                            }
                        }
                    }
                }
                $q.all(promises).then(function () {
                    //console.log("Start Deploy IPMAC");
                    var selectDpiSN = [];
                    for (var i = 0; i < vm.dpiData.length; i++) {
                        if (vm.selectDPI[i]) {
                            selectDpiSN.push(vm.dpiData[i].serialNumber);
                        }
                    }
                    Signature.deployAll(selectDpiSN, 'IPMAC').then(function (data) {
                        vm.showEdit = false;
                        //console.log(data.data);
                        var taskId = data.data.taskId;
                        var deferred = $q.defer();
                        $rootScope.isDeployingAll = true;
                        $rootScope.deployAllTaskPromise = deferred.promise;

                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {

                                Task.getTask(taskId, $rootScope.currentIp).then(function (data) {
                                    console.log(data.data);
                                    if (data.data.state === 'SUCCESS') {
                                        $state.reload();
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '部署成功'
                                        });
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        $rootScope.isDeployingAll = false;
                                        getDpiData();
                                    } else if (data.data.state === 'FAILED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('部署失败：' + data.data.reason) : '部署失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                        $rootScope.isDeployingAll = false;
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '部署超时'
                                        });
                                        $rootScope.isDeployingAll = false;
                                    }
                                });
                            }, 1000);
                        })(120);
                    });
                });
            };

            function findMac(d) {
                for (var j = 0; j < d.length; j++) {
                    for (var i = 0; i < d[j].devicePorts.length; i++) {
                        if (d[j].devicePorts[i].isMgmtPort) {
                            d[j].mac = d[j].devicePorts[i].mac;
                            d[j].ip = d[j].devicePorts[i].portIp;
                        }
                    }
                }
            }

            function getDpiData() {
                var payload = {'$filter': Sfilter};
                Device.getAll(payload).then(function (data) {
                    var arr = data.map(function (d) {
                        vm.selectDPI.push(false);
                        d.deployRulesNum = 0;
                        for (var j = 0; j < d.devicePorts.length; j++) {
                            d.deployRulesNum += d.devicePorts[j].deployedRulesNumber;
                            if (d.devicePorts[j].isMgmtPort) {
                                d.mgmtIp = d.devicePorts[j].portIp;
                            }
                        }
                        payload = {'$filter': Ffilter};
                        if (uiCtrl.isRemote()) {
                            if ($rootScope.domainLogin[d.mgmtIp]) {
                                return Device.getAllForIpMacBinding(payload, null, d.mgmtIp).then(function (Idata) {
                                    d.ipmac = Idata;
                                    return Signature.getIPMACPolicy(null, d.mgmtIp).then(function (data) {
                                        d.ipmacPolicy = data.data;
                                        return Device.getAll(payload, null).then(function (Ddata) {
                                            d.factoryDevice = Ddata;
                                            findMac(d.factoryDevice);
                                        });
                                    });
                                });
                            } else {
                                return auth.autoLogin(d.mgmtIp).then(function () {
                                    return Device.getAllForIpMacBinding(payload, null, d.mgmtIp).then(function (Idata) {
                                        d.ipmac = Idata;
                                        return Signature.getIPMACPolicy(null, d.mgmtIp).then(function (data) {
                                            d.ipmacPolicy = data.data;
                                            return Device.getAll(payload, null, d.mgmtIp).then(function (Ddata) {
                                                d.factoryDevice = Ddata;
                                                findMac(d.factoryDevice);
                                            });
                                        });
                                    });
                                });
                            }
                        } else {
                            return Device.getAllForIpMacBinding(payload, null, d.mgmtIp).then(function (Idata) {
                                d.ipmac = Idata;
                                return Signature.getIPMACPolicy(null, d.mgmtIp).then(function (data) {
                                    d.ipmacPolicy = data.data;
                                    return Device.getAll(payload).then(function (Ddata) {
                                        d.factoryDevice = Ddata;
                                        findMac(d.factoryDevice);
                                    });
                                });
                            });
                        }
                    });
                    return arr.length ? $q.all(arr).then(function () {
                        vm.dpiData = data;
                    }) : [];
                });
            }

            getDpiData();
        }
    }
})();
