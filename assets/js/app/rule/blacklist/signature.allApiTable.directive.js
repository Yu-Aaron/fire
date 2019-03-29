/**
 * Monitor Signatrue left side 4 tab: signatureTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.blacklist')
        .directive('blacklistAllDpiTable', blacklistAllDpiTable);

    function blacklistAllDpiTable(Device) {
        var AllDpiTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/blacklist/signature-all-dpi-table.html',
            controller: controller,
            controllerAs: 'blacklistAllDpi',
            link: function () {
            }
        };

        return AllDpiTableObj;

        //////////

        function controller($state, $scope, $modal, Topology, $rootScope, Signature, $q, uiCtrl, auth, $timeout, Task) {
            var vm = this;
            vm.dpiSelectAll = false;
            vm.selectDPI = [];
            var filter = 'category eq SECURITY_DEVICE';

            vm.selectAllDPI = function () {
                for (var i = 0; i < vm.selectDPI.length; i++) {
                    //Only select online device
                    vm.selectDPI[i] = vm.dpiData[i].deviceOnline ? vm.dpiSelectAll : false;
                }
            };

            vm.deployAll = function () {
                var DpiList = [];
                var isEmpty = true;
                for (var i = 0; i < vm.selectDPI.length; i++) {
                    if (vm.selectDPI[i]) {
                        DpiList.push(vm.dpiData[i].serialNumber);
                        isEmpty = false;
                    }
                }
                if (isEmpty) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '请先选择需要部署规则的设备！'
                    });
                    return;
                }
                Signature.deployAll(DpiList, 'BLACKLIST').then(function (data) {
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

                }, function (data) {
                    vm.showEdit = false;
                    //console.log(data.data);
                    $rootScope.addAlert({
                        type: 'danger',
                        content: (data.data.rejectReason ? ('部署失败：' + data.data.rejectReason) : '部署失败')
                    });
                });
            };

            (function getDpiData() {
                var payload = {'$filter': filter};
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
                        if (!($rootScope.domainLogin[d.mgmtIp] || !uiCtrl.isRemote())) {
                            return auth.autoLogin(d.mgmtIp).then(function () {
                                return Topology.getDeviceNodes(d.deviceId, d.mgmtIp);
                            });
                        } else {
                            return Topology.getDeviceNodes(d.deviceId, d.mgmtIp);
                        }
                    });
                    return arr.length ? $q.all(arr).then(function (nodes) {
                        var set = data.map(function (d, i) {
                            data[i].nodes = nodes[i];
                            return Device.getNodeRules(data[i].nodes, d.mgmtIp).then(function (nodes) {
                                d.deployRulesNum = nodes[i].rules;
                            });
                        });
                        return $q.all(set).then(function () {
                            vm.dpiData = data;
                        });
                    }) : [];
                });
            })();
        }
    }
})();
