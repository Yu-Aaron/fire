/**
 * Monitor Signature Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        .controller('editorCtrl', ['$scope', '$timeout', '$state', 'localStorage', 'Learning', '$rootScope', 'System', 'Signature', '$modal', '$log', '$interval', 'Custom', 'WhiteListService',function ($scope, $timeout, $state, localStorage, Learning, $rootScope, System, Signature, $modal, $log, $interval, Custom, WhiteListService) {
            var vm = this;
            vm.state = $state.current.name;
            vm.learningTasks = [];
            vm.detailPanel = {};
            vm.showDetailPanel = false;
            vm.editLearningDetail = false;
            vm.isCollapsed = true;
            vm.taskId = null;
            vm.setInterval = true;
            vm.interval = angular.copy(DEFAULT_INTERVAL);
            vm.eventHandler = {};
            // vm.isDPIUpgrading = System.isDPIUpgrading();
            //vm.topologyId = topologyId.id;
            vm.learningType = 'WHITELIST';

            $rootScope.$on('refreshRuleCurrentIp', function () {
                $state.go('rule.whitelist_manager');
            });

            vm.toLearning =function () {
                $state.go('rule.whitelist_learning');
            };
            vm.hasPolicies = $state.params.hasPolicies;

            /*vm.eventHandler.dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
             vm.isDPIUpgrading = System.isDPIUpgrading();
             });*/

            vm.goBack = function () {
                window.history.back();
            };

            vm.eventHandler.learningHandler = $rootScope.$on('learning', function (event, data) {
                if (data.learningEventType === 'LEARNING_STOPPED') {
                    if (!vm.learningAbort) {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '学习任务完成'
                        });
                    }
                    vm.learningAbort = false;
                }

                if (vm.showDetailPanel) {
                    vm.learningDetail(vm.taskId);
                    $scope.$broadcast('refreshTask');
                    $scope.$broadcast('refreshLearningTable');
                } else {
                    vm.checklearningTasks();
                }

            }, null, $rootScope.currentIp);

            vm.eventHandler.learningResultHandler = $rootScope.$on('learningResult', function (event, data) {
                if (vm.detailPanelItem && data.taskId && data.taskId === vm.detailPanelItem.taskId) {
                    vm.detailPanelItem.learningResult = data.learningResult;
                }
                if (vm.showDetailPanel) {
                    vm.learningDetail(vm.taskId);
                    $scope.$broadcast('refreshTask');
                    $scope.$broadcast('refreshLearningTable');
                } else {
                    vm.checklearningTasks();
                }
            });
            vm.eventHandler.learnedIpMacHandler = $rootScope.$on('learnedIpMac', function (event, data) {
                if (vm.detailPanelItem && data.taskId && data.taskId === vm.detailPanelItem.taskId) {
                    vm.detailPanelItem.macData = data;
                }
            });

            $scope.$on('$destroy', function () {
                // vm.eventHandler.dpiUpgradeStateHandler();
                vm.eventHandler.learningHandler();
                vm.eventHandler.learningResultHandler();
                vm.eventHandler.learnedIpMacHandler();
            });

            if ($state.previous) {
                localStorage.setItem('previous', JSON.stringify($state.previous));
            } else {
                $state.previous = JSON.parse(localStorage.getItem('previous'));
            }

            // vm.previousState = $state.previous.state;
            // vm.previousParams = $state.previous.params;

            vm.initTimePicker = function (detailPanelItem) {
                WhiteListService.initTimePicker(detailPanelItem, vm, MAX_DATE);
            };

            /* $scope.$watch('[editor.startdt_date, editor.startdt_time]', function (newVal) {
             if (newVal && newVal[0] && newVal[1]) {
             vm.startdt = new Date(newVal[0].getFullYear(), newVal[0].getMonth(), newVal[0].getDate(), newVal[1].getHours(), newVal[1].getMinutes(), newVal[1].getSeconds());
             }
             vm.intervalError = false;
             vm.intervalError = (vm.startdt < vm.now) || (vm.startdt >= vm.enddt) || (vm.enddt > vm.maxTime);
             });

             $scope.$watch('[editor.enddt_date, editor.enddt_time]', function (newVal) {
             if (newVal && newVal[0] && newVal[1]) {
             vm.enddt = new Date(newVal[0].getFullYear(), newVal[0].getMonth(), newVal[0].getDate(), newVal[1].getHours(), newVal[1].getMinutes(), newVal[1].getSeconds());
             }
             vm.intervalError = false;
             vm.intervalError = (vm.startdt < vm.now) || (vm.startdt >= vm.enddt) || (vm.enddt > vm.maxTime);
             });*/

            vm.calculateValues = function () {
                WhiteListService.calculateValues(vm);
            };

            vm.checkInUsepolicy = function (collapse) {
                WhiteListService.checkInUsepolicy(collapse, vm, 'WHITELIST');
            };

            vm.changeInterval = function () {
                WhiteListService.changeInterval(vm);
            };

            /*vm.getTopologyId = function () {
             return $state.params.topologyId;
             };*/

            vm.getPolicyId = function () {
                return $state.params.policyId;
            };

            vm.getTask = function () {
                return Learning.getTask(vm.taskId);
            };

            vm.changeURL = function (tab) {
                WhiteListService.changeURL(tab);
            };

            vm.changeLearningInterval = function (detailPanelItem) {
                WhiteListService.changeLearningInterval(detailPanelItem, vm);
            };

            vm.changeLearning = function (detailPanelItem) {
                WhiteListService.changeLearning(detailPanelItem, vm);
            };
            vm.checklearningTasks = function () {
                WhiteListService.checklearningTasks(vm);
            };

            vm.remove = function (detailPanelItem) {
                vm.learningAbort = true;
                Learning.removeLearningTask(detailPanelItem.taskId).then(function () {
                    vm.interval = angular.copy(DEFAULT_INTERVAL);
                    vm.checklearningTasks();
                    vm.detailPanelItem = null;
                });
            };


            vm.openRecord = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/whitelist/device-activity-record.html',
                    controller: ModalInstanceCtrl,
                    size: "sm",
                    resolve: {
                        items: function () {
                            return vm.detailPanelItem.learningResult;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            function ModalInstanceCtrl($scope, $modalInstance, items) {
                "ngInject";
                $scope.learningItems = items;
                $scope.recordTab = {};
                $scope.tabs = [
                    {"name": "设备活动", "active": true, "disable": false},
                    {"name": "未知设备活动", "active": false, "disable": false}
                ];

                $scope.ok = function () {
                    $modalInstance.close($scope.selected.item);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            vm.openIPMACRecord = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/whitelist/mac-activity-record.html',
                    controller: MacModalInstanceCtrl,
                    size: "lg",
                    resolve: {
                        items: function () {
                            return vm.detailPanelItem.macData;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            function MacModalInstanceCtrl($scope, $modalInstance, items) {
                "ngInject";
                $scope.macItems = items;

                $scope.ok = function () {
                    $modalInstance.close($scope.selected.item);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.updateMac = function (activity) {
                    var tempActivity = angular.copy(activity);
                    tempActivity.topoMac = tempActivity.realMac;
                    Learning.setTaskMac(tempActivity).then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: 'MAC地址更新完成'
                        });
                        Learning.getTaskMac(activity.taskId).then(function (macData) {
                            vm.detailPanelItem.macData = $scope.macItems = macData.data;
                        });
                    }, function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: 'MAC地址更新失败'
                        });
                    });
                };
            }

            vm.countdown = function (detailPanelItem, state) {
                WhiteListService.countdown(detailPanelItem, state, vm);
            };

            vm.stopCountDown = function () {
                if (vm.countDownloop) {
                    $interval.cancel(vm.countDownloop);
                }
            };

            vm.learningDetail = function (taskId) {
                WhiteListService.learningDetail(taskId, vm, $scope);
            };

            vm.setTimeInterval = function (setInterval) {
                WhiteListService.setTimeInterval(setInterval, vm);
            };

            vm.setTime = function () {
                WhiteListService.setTime(vm);
            };

            vm.pauseLearning = function (detailPanelItem) {
                WhiteListService.pauseLearning(detailPanelItem, vm, $scope);
            };

            vm.resumeLearning = function (detailPanelItem) {
                WhiteListService.resumeLearning(detailPanelItem, vm, $scope);
            };

            vm.cancelLearning = function (detailPanelItem) {
                WhiteListService.cancelLearning(detailPanelItem, vm, $scope);
            };

            vm.startLearning = function () {
                vm.currentlyLearning = true;
            };

            vm.refreshPreDeployTable = function (block) {
                WhiteListService.refreshPreDeployTable(block);
            };

            vm.moveToPreDeployTable = function () {
                $scope.$broadcast('rebuildselectedPolicy');
                $scope.$broadcast('updateLeftSelectAllStatus');
                WhiteListService.moveToPreDeployTable($scope);
            };
        }])
        .controller('policyDetailCtrl', ['$scope', '$state', 'Signature', '$rootScope',function ($scope, $state, Signature, $rootScope) {
            var vm = this;
            if ($state.current.name.indexOf('networklist') !== -1) {
                vm.protocolType = 'networklist';
            } else {
                vm.protocolType = 'whitelist_manager';
            }
            var policyBlock = [];
            // vm.isDPIUpgrading = System.isDPIUpgrading();
            vm.eventHandler = {};

            /*vm.eventHandler.dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
             vm.isDPIUpgrading = System.isDPIUpgrading();
             });*/
            $rootScope.$on('refreshRuleCurrentIp', function () {
                $state.go('rule.whitelist_manager');
            });


            $scope.getPolicy = function () {
                return vm.policy;
            };

            $scope.viewPolicyDetail = function (policyId) {
                $state.go('rule.' + vm.protocolType + '.editor', {
                    policyId: policyId,
                    tab: 'learning'
                });
            };

            $scope.goBack = function () {
                $state.go('rule.' + vm.protocolType, {tab: 'policyManagement'});
            };

            $scope.getPolicyBlock = function () {
                return policyBlock;
            };
            Signature.getPolicy($state.params.policyId)
                .then(function (data) {
                    vm.policy = data.data;
                    return Signature.getPolicyBlockbyPolicyId(data.data.policyId, 'ReadyDeploy', null, null, 'WHITELIST');
                }).then(function (data) {
                policyBlock = data.data;
                $scope.$broadcast('refreshPolicy');
            });

            vm.eventHandler.stateChangeSuccessHandler = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $state.previous = {};
                $state.previous.state = fromState.name;
                $state.previous.params = fromParams;
            });

            $scope.$on('destroy', function () {
                // vm.eventHandler.dpiUpgradeStateHandler();
                vm.eventHandler.stateChangeSuccessHandler();
            });

        }])
        .controller('SignatureCtrl', ['$scope', 'Signature', '$state', '$rootScope', 'Device', '$q', 'Dashboard', 'Enum', 'uiTree', 'deployedPolicyArr', 'policiesArr', 'ruleService',function ($scope, Signature, $state, $rootScope, Device, $q, Dashboard, Enum, uiTree, deployedPolicyArr, policiesArr, ruleService) {
            var vm = this;
            vm.showDash = null;
            vm.tab = null;
            vm.deployedPanelCount = 0;
            vm.policyManagementCount = 0;
            vm.eventHandler = {};
            vm.showUI = false;
            //var topo = Topology.getTopo(topologyId.id, $rootScope.currentIp);
            var deployedPolicy = {'blocks': []};
            var policies = [];

            vm.contentEnable = function (tab) {
                if(tab === 'POLICY_MANAGEMENT'){
                    return policiesArr.length >= 0;
                }else if(tab === 'DEPLOYED_WHITE_LIST'){
                    return deployedPolicyArr.length > 0;
                }

            };

            $rootScope.$on('refreshRuleCurrentIp', function () {
                $state.reload();
            });
            /*var payload = {
             '$filter': 'category eq SECURITY_DEVICE'
             };
             vm.whitelistDeployEnabled = true;
             Device.getAll(payload).then(function (data) {
             var arr = data.map(function (d) {
             return Topology.getDeviceNodes(d.deviceId);
             });
             return arr.length ? $q.all(arr).then(function (nodes) {
             vm.whitelistDeployEnabled = nodes.filter(function (n) {
             console.log(n[0].nodeProperty);
             return n[0].nodeProperty === "AllRules";
             }).length > 0;
             }) : false;
             });*/
            vm.createPolicy = function (tab) {
                Signature.createPolicy().then(function (data) {
                    $state.go('rule.whitelist_manager.editor', {'policyId': data.data.value, 'tab': tab});
                    vm.showUI = true;
                });
            };

            /*$scope.getCurrentTopoId = function () {
             return vm.currentTopoId;
             };*/

            $scope.getDeployedPolicies = function () {
                return deployedPolicy;
            };

            $scope.getPolicies = function () {
                return policies;
            };

            $scope.refreshDeployPanel = function () {
                vm.getDeployedPolicy();
                refreshBadge();
            };

            function refreshBadge() {
                vm.deployedPanelCount = 0;
                Signature.getDeployedPolicy('WHITELIST').then(function (data) {
                    if (data.data.length > 0) {
                        Dashboard.getRuleDeployedCount().then(function (data) {
                            vm.deployedPanelCount = data.data.statsValue;
                        });
                    }
                });
                vm.policyManagementCount = 0;
                Signature.getPolicies("WHITELIST").then(function (data) {
                    vm.policyManagementCount = data.data.length;
                });
            }

            vm.eventHandler.stateChangeSuccessHandler = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $state.previous = {};
                $state.previous.state = fromState.name;
                $state.previous.params = fromParams;
            });

            vm.canEdit = false;
            if ($state.params.tab) {
                vm.showUI = true;
                vm.tab = $state.params.tab;
            } else if (vm.canEdit) {
                if (deployedPolicyArr.length) {
                    vm.tab = "deployedPanel";
                    vm.showUI = true;
                } else if (policiesArr.length) {
                    vm.tab = 'policyManagement';
                    vm.showUI = true;
                } else {
                    vm.showUI = false;
                    ruleService.createPolicy('whitelist_manager', 'total');
                }
            } else {
                vm.showUI = true;
                vm.tab = "deployedPanel";
            }

            $scope.$on('destroy', function () {
                vm.eventHandler.stateChangeSuccessHandler();
                vm.eventHandler.privilegeHandler ? vm.eventHandler.privilegeHandler() : null;
            });

            vm.getDeployedPolicy = function () {
                var policy = {};
                Signature.getDeployedPolicy('WHITELIST')
                    .then(function (data) {
                        if (data.data.length > 0) {
                            vm.showDash = false;
                            policy = data.data[0];
                            deployedPolicy = policy;
                            $scope.$broadcast('refreshDeployedTable');
                        } else {
                            vm.showDash = true;
                        }
                    });
            };

            vm.getPolicies = function () {
                Signature.getPolicies("WHITELIST").then(function (data) {
                    vm.policyManagementCount = data.data.length;
                    $scope.allPolicies = data.data;
                    $scope.$broadcast('refreshPolicy', data.data);
                });
            };

            if (vm.tab === 'deployedPanel') {
                vm.getDeployedPolicy();
            } else if (vm.tab === 'policyManagement') {
                vm.getPolicies();
            }
            refreshBadge();
            vm.hasDeployedPolicy = true;
            if (deployedPolicyArr.length === 0) {
                vm.hasDeployedPolicy = false;
            }

        }]);

    var DEFAULT_INTERVAL = {'days': 0, 'hours': 0, 'minutes': 2};
    var MAX_DATE = "2199-12-31";






})();
