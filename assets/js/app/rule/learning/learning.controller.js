(function () {
    'use strict';

    angular.module('southWest.rule.learning')
        .controller('learningCtrl', learningCtrl);

    var DEFAULT_INTERVAL = {'days': 0, 'hours': 0, 'minutes': 2};
    var MAX_DATE = "2199-12-31";

    function learningCtrl($scope, $timeout, $state, localStorage, Learning, $rootScope, Signature, $modal, $log, $interval, WhiteListService, $q, Enum) {
        var vm = this;
        vm.state = $state.current.name;
        vm.learningTasks = [];
        vm.detailPanel = {};
        vm.showDetailPanel = false;
        vm.editLearningDetail = false;
        vm.isCollapsed = true;
        vm.taskId = null;
        //vm.setInterval = false;
        vm.interval = angular.copy(DEFAULT_INTERVAL);
        vm.eventHandler = {};
        // vm.isDPIUpgrading = System.isDPIUpgrading();
        vm.viewLearningDetail = false;

        vm.countOfICRules = 0;
        vm.countOfIPRules = 0;
        vm.action = 30;
        vm.disabledAdd = false;
        Enum.get('privilege').filter(function (a) {
            if (a.name === "RULE_WHITELIST") {
                vm.action = a.actionValue;
            }
        });
        vm.titleshow = vm.action === 30;

        /*   vm.eventHandler.dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
         vm.isDPIUpgrading = System.isDPIUpgrading();
         });*/

        vm.goBack = function () {
            window.history.back();
        };

        vm.eventHandler.learningHandler = $rootScope.$on('learning', function (event, data) {
            if (vm.startLearningDefer) {
                vm.startLearningDefer.resolve('success');
            }
            if (data.learningEventType === 'LEARNING_STOPPED') {
                if (vm.stopLearningDefer) {
                    vm.stopLearningDefer.resolve('success');
                }
                if (!vm.learningAbort) {
                    $state.reload().then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '学习任务完成'
                        });
                    });
                }
                vm.learningAbort = false;
            }

            if (vm.showDetailPanel || !vm.enableAddSchedule) {
                vm.learningDetail(vm.taskId);
                $scope.$broadcast('refreshTask');
                $scope.$broadcast('refreshLearningTable');
                vm.getTask().then(function (data) {
                    Learning.getLearningBlocksByRef(data.data['_resultRef'].baseUrls[0]).then(function (data) {
                        vm.countOfICRules = data.data.length;
                    });
                    /*Learning.getLearningBlocksByRef(data.data['_resultRef'].baseUrls[1]).then(function (data) {
                     vm.countOfIPRules = data.data.length;
                     });*/
                });
            } else {
                vm.checklearningTasks();
            }

        });

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
        //vm.previousState = $state.previous.state;
        //vm.previousParams = $state.previous.params;
        //时间刷新定时器

        /*vm.updateTimer = function () {
         setTimeout(function () {
         vm.initTimePicker();
         vm.updateTimer();
         }, 100);
         };*/

        var timeDiffer, interval1, changenow;
        $scope.$on('$destroy', function () {
            $interval.cancel(interval1);
            $interval.cancel(changenow);
        });

        vm.initTimePicker = function (detailPanelItem) {
            WhiteListService.initTimePicker(detailPanelItem, vm, MAX_DATE).then(function () {
                timeDiffer = vm.startdt ? (new Date(vm.startdt).getTime() - new Date().getTime()) : 0;
                $interval.cancel(interval1);
                $interval.cancel(changenow);
                renderTime();
                changenowTime();
                interval1 = $interval(renderTime, 40);
                changenow = $interval(changenowTime, 40);
            });
        };
        vm.cancelRenderTime = function () {
            $interval.cancel(interval1);
        };
        function renderTime() {
            vm.startdt = new Date(new Date().getTime() + timeDiffer);
            vm.startdt_date = vm.startdt;
            vm.startdt_time = vm.startdt;
        }

        function changenowTime() {
            vm.now = new Date(new Date().getTime() + (timeDiffer - 1000));
            vm.now.setSeconds(0);
        }

        //vm.updateTimer();

        $scope.$watch('[learningCtrl.startdt_date, learningCtrl.startdt_time]', function (newVal) {
            if (newVal && newVal[0] && newVal[1]) {
                vm.startdt = new Date(newVal[0].getFullYear(), newVal[0].getMonth(), newVal[0].getDate(), newVal[1].getHours(), newVal[1].getMinutes(), newVal[1].getSeconds());
            }
            vm.intervalError = false;
            vm.intervalError = vm.startdt < vm.now;
        });

        vm.calculateValues = function () {
            WhiteListService.calculateValues(vm);
        };

        vm.checkInUsepolicy = function (collapse) {
            WhiteListService.checkInUsepolicy(collapse, vm, 'WHITELIST');
        };

        vm.changeInterval = function () {
            WhiteListService.changeInterval(vm);
        };

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
            vm.stopCountDown();
            vm.initTimePicker();
            Learning.removeLearningTask(detailPanelItem.taskId).then(function () {
                vm.interval = angular.copy(DEFAULT_INTERVAL);
                vm.checklearningTasks();
                vm.detailPanelItem = null;
            }, function () {
                vm.detailPanelItem = null;
            }).catch(function () {
            }).finally(function () {
                $timeout(function () {
                    vm.disabledAdd = false;
                }, 5000);
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
            $scope.macItems = items;

            $scope.ok = function () {
                $modalInstance.close($scope.selected.item);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.updateMac = function (activity) {
                var tempActivity = angular.copy(activity);
                tempActivity.assetMac = tempActivity.realMac;
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

        vm.setTimeInterval = function () {
            vm.startLearningDefer = $q.defer();
            /*if (!setInterval) {
             $rootScope.protocolDeployTaskPromise = vm.startLearningDefer.promise;
             }*/
            WhiteListService.setTimeInterval(vm);
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
            WhiteListService.moveToPreDeployTable($scope);
        };

        vm.hasSuccessTask = function () {
            for (var i = 0; i < vm.learningTasks.length; i++) {
                var tmp = vm.learningTasks[i];
                if (tmp.state === 'SUCCESS') {
                    return true;
                }
            }
            return false;
        };

        vm.editPolicy = function (tab) {
            Signature.createPolicy().then(function (data) {
                $state.go('rule.' + tab + '_manager.editor', {
                    'policyId': data.data.value,
                    'tab': 'total'
                });
            });
        };
    }

})();
