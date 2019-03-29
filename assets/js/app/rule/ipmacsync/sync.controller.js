/**
 * Rule Sync Controler
 *
 * Description
 */
(function () {
    'use strict';

    angular.module('southWest.rule.ipmacsync')
        .controller('ipmacsyncCtrl', ipmacsyncCtrl);

    function ipmacsyncCtrl($scope, $timeout, $state, $rootScope, $q, $modal, $interval, System, Enum, WhiteListService, Task, Topology, topologyId, Signature, SyncRules, ruleService) {
        var vm = this;
        vm.state = $state.current.name;
        vm.syncTask = null;
        vm.editRight = Enum.get('privilege').filter(function (data) {
            return data.name === 'POLICY';
        });
        vm.editRight = vm.editRight && vm.editRight[0] && vm.editRight[0].actionValue === 30;
        vm.isDPIUpgrading = System.isDPIUpgrading();
        $rootScope.$on('dpiUpgradeState', function () {
            vm.isDPIUpgrading = System.isDPIUpgrading();
        });

        vm.checkSyncInitial = function () {
            SyncRules.getLatestSyncTask("IPMAC").then(function (data) {
                var deferred = $q.defer();
                if (data.data.length > 0) {
                    vm.syncTask = data.data[0];
                    if (vm.syncTask.state === 'PENDING' || vm.syncTask.state === 'PROCESSING') {
                        vm.syncTask.hasSyncingTask = true;
                        var taskId = data.data[0].taskId;
                        vm.syncTaskPromise = deferred.promise;
                        (function countdown(counter) {
                            var checkSync = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        deferred.resolve('success');
                                        $timeout.cancel(checkSync);
                                        vm.syncTask.hasSyncingTask = false;
                                        vm.syncTask.hasSyncedTask = true;
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '检测规则同步成功'
                                        });
                                        SyncRules.getSyncResultCount(topologyId.id, {'$filter': 'ruleType eq IPMAC'}).then(function (ipmacSyncResultCount) {
                                            vm.syncTask.ipmacSyncResultCount = ipmacSyncResultCount;
                                        });
                                    } else if (data.data.state === 'FAILED') {
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkSync);
                                        vm.syncTask.hasSyncingTask = false;
                                        vm.syncTask.hasSyncedTask = false;
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('检测规则同步失败：' + data.data.reason) : '检测规则同步失败')
                                        });
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        deferred.resolve('timeout');
                                        vm.syncTask.hasSyncingTask = false;
                                        vm.syncTask.hasSyncedTask = false;
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '检测规则同步超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(3600);
                    } else {
                        vm.syncTask.hasSyncingTask = false;
                        vm.syncTask.hasSyncedTask = true;
                        SyncRules.getSyncResultCount(topologyId.id, {'$filter': 'ruleType eq IPMAC'}).then(function (ipmacSyncResultCount) {
                            vm.syncTask.ipmacSyncResultCount = ipmacSyncResultCount;
                        });
                    }
                }
            });
        };

        vm.start = function (isRestart) {
            var modalInstance = $modal.open({
                controller: ModalInstanceCtrl,
                templateUrl: '/templates/rule/ipmacsync/confirmStart.html',
                size: 'sm'
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, $timeout, Topology, topologyId) {
                var isUpgrading;
                Topology.getDevices(topologyId.id).then(function (Ddata) {
                    System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        isUpgrading = (dpiUpgradeData.data.filter(function (data) {
                            return (data.state !== 'NONE' || (data.state === 'NONE' && data.percentage !== 0 && data.percentage !== 100)) && !data.error;
                        })[0]) ? true : false;
                        $scope.check = {
                            checkDisconnect: true
                        };
                        $scope.msg = {
                            'title': '检测规则同步',
                            'text': '检测规则同步会把DPI设备上部署的规则和监管平台上的规则进行比较。此操作可能需要几分钟时间。',
                            'qus': '确定开始检测规则同步？',
                            'buttonText': '检测规则同步',
                            'fontAwesomeText': 'fa-search-plus',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '无法检测以下未连线设备的规则：',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        $scope.deviceDisconnetedPool = [];
                        var promises = [];
                        promises.push(Topology.getLinks(topologyId.id));
                        for (var k = 0; k < Ddata.data.length; k++) {
                            if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                if (Ddata.data[k].deviceOnline !== 1) {
                                    $scope.msg.isShowDeviceDisconnectedMsg = true;
                                    $scope.check.checkDisconnect = false;
                                    $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                                } else {
                                    $scope.msg.isShowDeviceConnectedCnt++;
                                    promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId));
                                }
                            }
                        }
                        $q.all(promises).then(function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                                $scope.msg.text = "没有设备在线，无法检测规则同步。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                        });
                    });
                });

                $scope.start = function () {
                    SyncRules.checkSyncRules(topologyId.id, "IPMAC").then(function (data) {
                        var deferred = $q.defer();
                        vm.syncTaskPromise = deferred.promise;
                        if (isRestart) {
                            data.data.hasSyncingTask = vm.syncTask.hasSyncingTask;
                            data.data.hasSyncedTask = vm.syncTask.hasSyncedTask;
                            if (vm.hasSyncResult()) {
                                data.data.ipmacSyncResultCount = vm.syncTask.ipmacSyncResultCount;
                            }
                        }
                        vm.syncTask = data.data;
                        var taskId = vm.syncTask.taskId;
                        (function countdown(counter) {
                            var checkSync = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        deferred.resolve('success');
                                        $timeout.cancel(checkSync);
                                        vm.syncTask.hasSyncingTask = false;
                                        vm.syncTask.hasSyncedTask = true;
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '检测规则同步成功'
                                        });
                                        SyncRules.getSyncResultCount(topologyId.id, {'$filter': 'ruleType eq IPMAC'}).then(function (ipmacSyncResultCount) {
                                            vm.syncTask.ipmacSyncResultCount = ipmacSyncResultCount;
                                            $state.reload();
                                        });
                                    } else if (data.data.state === 'FAILED') {
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkSync);
                                        vm.syncTask.hasSyncingTask = false;
                                        vm.syncTask.hasSyncedTask = false;
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('检测规则同步失败：' + data.data.reason) : '检测规则同步失败')
                                        });
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        deferred.resolve('timeout');
                                        vm.syncTask.hasSyncingTask = false;
                                        vm.syncTask.hasSyncedTask = false;
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '检测规则同步超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(3600);
                    }, function (data) {
                        var conflict = data.status === 409;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('检测规则同步失败：' + data.data.error) : '检测规则同步失败' + (conflict ? '， 正在检测中， 请稍后再试。' : ''))
                        });
                    });
                };

                $scope.ok = function () {
                    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                        $modalInstance.dismiss('cancel');
                    } else {
                        $scope.start();
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        };

        vm.add = function (dTable, ruleType) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/ipmacsync/confirmAdd.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    rules: function () {
                        var table = dTable.table;
                        var rules = [];
                        if (!dTable.selectAllRules) {
                            for (var i = 0; i < table.length; i++) {
                                if (table[i].checked) {
                                    var rule = angular.copy(table[i]);
                                    delete rule.checked;
                                    rules.push(rule);
                                }
                            }
                        } else {
                            SyncRules.getSyncResult(topologyId.id, {
                                '$filter': 'ruleType eq ' + ruleType,
                                '$limit': 1000000
                            }).then(function (data) {
                                for (var j = 0; j < data.length; j++) {
                                    rules.push(data[j]);
                                }
                            });
                        }
                        return rules;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, rules) {

                $scope.ok = function () {
                    var deferred = $q.defer();
                    var policyType = (ruleType === 'IPMAC' ? 'IPMAC' : '');
                    SyncRules.addSyncResultToLib(topologyId.id, policyType, rules).then(function () {
                        deferred.resolve('success');
                        $modalInstance.close();
                        dTable.getTableData();
                        $rootScope.addAlert({
                            type: 'success',
                            content: '加入模板库成功'
                        });
                        if (ruleType === 'IPMAC') {
                            vm.syncTask.ipmacSyncResultCount -= rules.length;
                        }
                        $state.go('unknown.ipmac', {'topologyId': topologyId.id});
                    }, function (data) {
                        deferred.resolve('fail');
                        $modalInstance.close();
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('加入模板库失败：' + data.data.error) : '加入模板库失败')
                        });
                    });
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.close();
                };
            }
        };

        vm.hasSyncingTask = function () {
            return vm.syncTask && vm.syncTask.hasSyncingTask;
        };
        vm.hasSyncedTask = function () {
            return vm.syncTask && vm.syncTask.hasSyncedTask;
        };
        vm.hasSyncResult = function () {
            return vm.syncTask && vm.syncTask.hasSyncedTask && vm.syncTask.ipmacSyncResultCount > 0;
        };
        vm.lastSyncSuccess = function () {
            return vm.syncTask && vm.syncTask.state === 'SUCCESS';
        };

        vm.getProtocolType = ruleService.getProtocolType;
        vm.getSourcePort = ruleService.getSourcePort;
        vm.getDestinationPort = ruleService.getDestinationPort;

        vm.getRuleCreatedAt = ruleService.getRuleCreatedAt;
        vm.getIpmacStr = function (rule) {
            var lst = rule.fields;
            var ip, mac;
            for (var i = 0; i < lst.length; i++) {
                if (lst[i].name === 'IP') {
                    ip = lst[i].value;
                } else if (lst[i].name === 'MAC') {
                    mac = lst[i].value;
                }
            }
            return ip + '/' + mac;
        };
    }

})();
