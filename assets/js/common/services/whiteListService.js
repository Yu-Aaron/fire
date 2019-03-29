/**
 * whitelist Services
 *
 * Description
 * Common functions for whitelist and network_whitelist modules
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('WhiteListService', whitelistservice);

    function whitelistservice(Learning, Signature, $state, $rootScope, $interval, topologyId, apiInfo, Template, $q) {
        var service = {
            initTimePicker: initTimePicker,
            calculateValues: calculateValues,
            checkInUsepolicy: checkInUsepolicy,
            changeInterval: changeInterval,
            changeURL: changeURL,
            changeLearningInterval: changeLearningInterval,
            changeLearning: changeLearning,
            checklearningTasks: checklearningTasks,
            countdown: countdown,
            learningDetail: learningDetail,
            setTimeInterval: setTimeInterval,
            setTime: setTime,
            pauseLearning: pauseLearning,
            resumeLearning: resumeLearning,
            cancelLearning: cancelLearning,
            refreshPreDeployTable: refreshPreDeployTable,
            moveToPreDeployTable: moveToPreDeployTable,
            showIpRuleDetailCtrl: ["policyBlock", "items", "$scope", "$modalInstance", "policy", showIpRuleDetailCtrl],
            showWhiteListRuleDetailCtrl: ["$scope", "$modalInstance", "items", "policyBlock", "tree", "ruleItemEdit", showWhiteListRuleDetailCtrl],
        };

        function initTimePicker(detailPanelItem, vm, MAX_DATE) {
            return apiInfo.sysbaseinfo().then(function (data) {
                vm.now = new Date(data.data || "");
                //vm.now.setSeconds(0);
                vm.now.setMilliseconds(0);

                vm.startdt = vm.now;
                var year = vm.startdt.getFullYear();
                var month = vm.startdt.getMonth() + 1;
                if (month < 10) {
                    month = '0' + month;
                }
                var date = vm.startdt.getDate();
                if (date < 10) {
                    date = '0' + date;
                }
                var result = year + '-' + month + '-' + date;
                vm.minDate = result;
                vm.maxDate = angular.copy(MAX_DATE);
                vm.maxTime = new Date(vm.maxDate);
                var hour = vm.maxTime.getHours();
                vm.maxTime.setHours(hour + vm.maxTime.getTimezoneOffset() / 60 + 24);
                vm.maxTime.setMinutes(0);
                vm.maxTime.setSeconds(0);

                vm.enddt = moment(vm.now).add(2, 'minutes').toDate();
                vm.interval.minutes = 2;
                vm.interval.hours = 0;
                vm.interval.days = 0;
                vm.intervalError = false;

                if (detailPanelItem) {
                    vm.startdt = new Date(detailPanelItem.startDatetime);
                    vm.enddt = new Date(detailPanelItem.endDatetime);
                }
                vm.startdt_date = vm.startdt;
                vm.startdt_time = vm.startdt;
                vm.enddt_date = vm.enddt;
                vm.enddt_time = vm.enddt;
            });
        }

        function calculateValues(vm) {
            if (vm.interval.minutes >= 60) {
                var increaseHours = Math.floor(vm.interval.minutes / 60);
                vm.interval.hours = +(vm.interval.hours ? vm.interval.hours : 0) + increaseHours;
                vm.interval.minutes = vm.interval.minutes % 60;
            }
            if (vm.interval.hours >= 24) {
                var increaseDays = Math.floor(vm.interval.hours / 24);
                vm.interval.days = +(vm.interval.days ? vm.interval.days : 0) + increaseDays;
                vm.interval.hours = vm.interval.hours % 24;
            }
        }

        function checkInUsepolicy(collapse, vm, section) {
            if (!collapse) {
                Signature.getDeployedPolicy(section).then(function (data) {
                    vm.inUsePolicy = data.data;
                });
            }
        }

        function changeInterval(vm) {
            vm.intervalError = false;
            vm.intervalErrorMessage = '';
            if ((!vm.interval.days || vm.interval.days.toString() === '0') &&
                (!vm.interval.hours || vm.interval.hours.toString() === '0') &&
                (!vm.interval.minutes || vm.interval.minutes.toString() === '0')) {
                vm.intervalError = true;
                vm.intervalErrorMessage = '请输入学习时间';
                return;
            }

            if (vm.interval.days) {
                if (isNaN(vm.interval.days)) {
                    vm.intervalError = true;
                    vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请在天数区域输入数字';
                } else if (vm.interval.days < 0) {
                    vm.intervalError = true;
                    vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请输入大于0的天数';
                }
            }
            if (vm.interval.hours) {
                if (isNaN(vm.interval.hours)) {
                    vm.intervalError = true;
                    vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请在小时数区域输入数字';
                } else if (vm.interval.hours < 0) {
                    vm.intervalError = true;
                    vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请输入大于0的小时数';
                }
            }
            if (vm.interval.minutes) {
                if (isNaN(vm.interval.minutes)) {
                    vm.intervalError = true;
                    vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请在分钟数区域输入数字';
                } else if (vm.interval.minutes < 0) {
                    vm.intervalError = true;
                    vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请输入大于0的分钟数';
                }
            }
            if (vm.intervalError) {
                return;
            }

            var one_day = 1000 * 60 * 60 * 24;
            var one_hour = 1000 * 60 * 60;
            var one_minute = 1000 * 60;
            var maxdate = new Date();
            maxdate = new Date(maxdate.getTime() + 3600000 * 24 * 60000 + 59000);
            var maxtime = maxdate.getTime();
            var mintime = new Date();
            mintime = mintime.getTime() +
                (vm.interval.days ? vm.interval.days * one_day : 0) +
                (vm.interval.hours ? vm.interval.hours * one_hour : 0) +
                (vm.interval.minutes ? vm.interval.minutes * one_minute : 0);
            var difference_ms = maxtime - mintime;
            if (Math.round(difference_ms / one_minute) < 1) {
                vm.intervalError = true;
                vm.intervalErrorMessage = '请输入少于60000天的学习时间';
                return;
            }
        }

        function changeURL(tab) {
            var params = $state.params;
            params.tab = tab;
            var state = $state.current.name;
            $state.go(state, params, {reload: false, inherit: true, notify: false});
        }

        function changeLearningInterval(detailPanelItem, vm) {
            apiInfo.sysbaseinfo().then(function (data) {
                vm.now = new Date(data.data || "");
                vm.now.setMilliseconds(0);
                var timeDiff = vm.now.getTime() - vm.startdt.getTime();
                if (timeDiff <= 0) {
                    vm.changeLearning(detailPanelItem);
                } else if (timeDiff < 60000) {
                    vm.startdt = vm.now;
                    vm.changeLearning(detailPanelItem);
                } else {
                    return;
                }
            });
        }

        function pad(number, length) {
            var str = "" + number;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }

        function changeLearning(detailPanelItem, vm) {
            var offset = new Date().getTimezoneOffset();
            offset = ((offset < 0 ? '+' : '-') + pad(parseInt(Math.abs(offset / 60)), 2) + pad(Math.abs(offset % 60), 2));

            var schedule = {
                'startTime': vm.startdt.toISOString(),
                'endTime': vm.enddt.toISOString(),
                'timeZoneOffset': offset
            };

            Learning.updateLearningTask(detailPanelItem.taskId, schedule).then(function () {
                vm.learningDetail(detailPanelItem.taskId);
            });
            vm.editLearningDetail = false;
        }

        function checklearningTasks(vm) {
            Learning.getLearningTasks().then(function (data) {
                vm.learningTasks = data.data;
                if (vm.learningTasks.length === 0) {
                    vm.initialView = true;
                    vm.enableAddSchedule = true;
                } else {
                    vm.initialView = false;
                    vm.enableAddSchedule = true;
                    $rootScope.disableDeploy = false;
                    for (var c = 0; c < vm.learningTasks.length; c++) {
                        if (vm.learningTasks[c].state === 'PROCESSING' || vm.learningTasks[c].state === 'PAUSED') {
                            $rootScope.disableDeploy = true;
                        }

                        if (vm.learningTasks[c].state === 'PENDING' || vm.learningTasks[c].state === 'PROCESSING' || vm.learningTasks[c].state === 'PAUSED') {
                            learningDetail(vm.learningTasks[c].taskId, vm);
                            vm.learningTaskId = vm.learningTasks[c].taskId;
                            vm.enableAddSchedule = false;
                        }
                    }
                }
            });
        }

        function countdown(detailPanelItem, state, vm) {
            apiInfo.sysbaseinfo().then(function (data) {
                vm.remainTime = {};
                var systemTime = new Date(data.data || "").getTime();
                var endTime = new Date(detailPanelItem.endDatetime).getTime();
                var now = new Date();
                var localTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
                var offset = systemTime - localTime;

                var timeDiff = endTime - systemTime;

                if (timeDiff < 0) {
                    timeDiff = 0;
                }

                vm.remainTime.days = Math.floor(timeDiff / (1000 * 3600 * 24));
                vm.remainTime.hours = Math.floor((timeDiff - (vm.remainTime.days * 1000 * 3600 * 24)) / (3600 * 1000));
                vm.remainTime.minutes = Math.floor((timeDiff - (vm.remainTime.days * 1000 * 3600 * 24) - (vm.remainTime.hours * 3600 * 1000)) / (60 * 1000));
                vm.remainTime.seconds = Math.floor((timeDiff - (vm.remainTime.days * 1000 * 3600 * 24) - (vm.remainTime.hours * 3600 * 1000) - (vm.remainTime.minutes * 60 * 1000)) / 1000);
                vm.value = (1 - (timeDiff / Math.abs(new Date(detailPanelItem.endDatetime).getTime() - new Date(detailPanelItem.startDatetime).getTime()))) * 100;

                if (state && state === 'PAUSED') {
                    return;
                }
                countDown(offset);

                function countDown(offset) {
                    vm.countDownloop = $interval(function () {
                        var now = new Date();
                        var localTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

                        timeDiff = endTime - (localTime + offset);

                        if (timeDiff <= 0) {
                            vm.stopCountDown();
                            timeDiff = 0;
                        }

                        vm.remainTime.days = Math.floor(timeDiff / (1000 * 3600 * 24));
                        vm.remainTime.hours = Math.floor((timeDiff - (vm.remainTime.days * 1000 * 3600 * 24)) / (3600 * 1000));
                        vm.remainTime.minutes = Math.floor((timeDiff - (vm.remainTime.days * 1000 * 3600 * 24) - (vm.remainTime.hours * 3600 * 1000)) / (60 * 1000));
                        vm.remainTime.seconds = Math.floor((timeDiff - (vm.remainTime.days * 1000 * 3600 * 24) - (vm.remainTime.hours * 3600 * 1000) - (vm.remainTime.minutes * 60 * 1000)) / 1000);
                        var currentValue = (1 - (timeDiff / Math.abs(new Date(detailPanelItem.endDatetime).getTime() - new Date(detailPanelItem.startDatetime).getTime()))) * 100;
                        if (currentValue < vm.value) {
                            console.log(currentValue + "<" + vm.value);
                        } else {
                            vm.value = currentValue;
                        }
                    }, 1000);

                }
            });
        }

        function learningDetail(taskId, vm, scope) {
            vm.taskId = taskId;

            Learning.getTask(taskId).then(function (data) {
                Learning.getTaskMac(taskId).then(function (macData) {
                    if (scope) {
                        scope.$broadcast('refreshTask');
                    }

                    Learning.getLearningBlocksByRef(data.data['_resultRef'].baseUrls[0]).then(function (data) {
                        vm.countOfICRules = data.data.length;
                    });
                    /*Learning.getLearningBlocksByRef(data.data['_resultRef'].baseUrls[1]).then(function (data) {
                     vm.countOfIPRules = data.data.length;
                     });*/

                    vm.detailPanelItem = data.data;
                    vm.detailPanelItem.macData = macData.data;
                    vm.detailPanelItem.startDatetimeLocal = new Date(vm.detailPanelItem.startDatetime).toLocaleString(navigator.language, {hour12: false});
                    vm.detailPanelItem.endDatetimeLocal = new Date(vm.detailPanelItem.endDatetime).toLocaleString(navigator.language, {hour12: false});

                    vm.detailPanelItem.timeDiff = Math.abs(new Date(vm.detailPanelItem.startDatetime).getTime() - new Date(vm.detailPanelItem.endDatetime).getTime());
                    vm.detailPanelItem.difference = {};
                    vm.detailPanelItem.difference.days = Math.floor(vm.detailPanelItem.timeDiff / (1000 * 3600 * 24));
                    vm.detailPanelItem.difference.hours = Math.floor((vm.detailPanelItem.timeDiff - (vm.detailPanelItem.difference.days * 1000 * 3600 * 24)) / (3600 * 1000));
                    vm.detailPanelItem.difference.mins = (vm.detailPanelItem.timeDiff - (vm.detailPanelItem.difference.days * 1000 * 3600 * 24) - (vm.detailPanelItem.difference.hours * 3600 * 1000)) / (60 * 1000);
                });
            });

        }

        function setTimeInterval(vm) {
            apiInfo.sysbaseinfo().then(function (data) {
                vm.now = new Date(data.data || "");
                vm.now.setMilliseconds(0);
                var timeDiff = vm.now.getTime() - vm.startdt.getTime();
                var timezoneDiff;
                if (timeDiff <= 0) {
                    vm.enddt = moment(vm.startdt).add(vm.interval).toDate();
                    timezoneDiff = (vm.startdt.getTimezoneOffset() - vm.enddt.getTimezoneOffset()) * 60000;
                    vm.enddt = moment(vm.enddt).add(timezoneDiff).toDate();
                    vm.setTime();
                } else if (timeDiff < 60000) {
                    vm.startdt = vm.now;
                    vm.enddt = moment(vm.startdt).add(vm.interval).toDate();
                    timezoneDiff = (vm.startdt.getTimezoneOffset() - vm.enddt.getTimezoneOffset()) * 60000;
                    vm.enddt = moment(vm.enddt).add(timezoneDiff).toDate();
                    vm.setTime();
                } else {
                    return;
                }
            });
        }

        function setTime(vm) {
            var offset = new Date().getTimezoneOffset();
            offset = ((offset < 0 ? '+' : '-') + pad(parseInt(Math.abs(offset / 60)), 2) + pad(Math.abs(offset % 60), 2));

            var schedule = {
                'startTime': vm.startdt.toISOString(),
                'endTime': vm.enddt.toISOString(),
                'taskName': vm.startdt.toLocaleString(navigator.language, {hour12: false}) + '至' + vm.enddt.toLocaleString(navigator.language, {hour12: false}) + '规则学习',
                'timeZoneOffset': offset,
                'learningTypes': ['WHITELIST']
                /*'learningTypes': ['WHITELIST', 'IP_RULE']*/
            };

            var deferred = $q.defer();
            $rootScope.protocolDeployTaskPromise = deferred.promise;
            Learning.createLearningTask(schedule).then(function (data) {
                if (data.data.state === 'REJECT') {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '创建学习任务失败'
                    });
                    deferred.resolve('fail');
                    if (vm.startLearningDefer) {
                        vm.startLearningDefer.resolve('fail');
                    }
                } else {
                    deferred.resolve('success');
                    $rootScope.addAlert({
                        type: 'success',
                        content: '创建学习任务成功'
                    });
                }
                vm.checklearningTasks();
            }, function (data) {
                deferred.resolve('fail');
                if (vm.startLearningDefer) {
                    vm.startLearningDefer.resolve('fail');
                }
                if (data && data.data && data.data.rejectReason) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: data.data.rejectReason
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '创建学习任务失败'
                    });
                }
            });
        }

        function pauseLearning(detailPanelItem, vm, scope) {
            Learning.pause(detailPanelItem.taskId).then(function () {
                vm.currentlyLearning = false;
                scope.$broadcast('refreshTask');
            });
        }

        function resumeLearning(detailPanelItem, vm, scope) {
            Learning.resume(detailPanelItem.taskId).then(function () {
                vm.currentlyLearning = true;
                scope.$broadcast('refreshTask');
            });
        }

        function cancelLearning(detailPanelItem, vm, scope) {
            Learning.stop(detailPanelItem.taskId).then(function () {
                delete vm.detailPanelItem;
                vm.stopCountDown();

                vm.stopLearningDefer = $q.defer();
                $rootScope.protocolDeployTaskPromise = vm.stopLearningDefer.promise;
                scope.$broadcast('refreshTask');
            });
        }

        function refreshPreDeployTable(block) {
            $rootScope.$broadcast('refreshPreDeployTable', block);
        }

        function moveToPreDeployTable(scope) {
            scope.$broadcast($state.params.tab);
        }

        function showIpRuleDetailCtrl(policyBlock, items, $scope, $modalInstance, policy) {

            $scope.policyBlock = policyBlock;
            $scope.rule = items.data[0];
            $scope.policy = policy.data;
            for (var i = 0; i < $scope.rule.fields.length; i++) {
                var tmp = $scope.rule.fields[i];
                $scope.rule[tmp.name] = tmp.value;
            }
            $scope.rule.protocolType = $scope.rule['协议'].toUpperCase();
            $scope.getRuleAction = function (action) {
                var lst = {
                    REJECTBOTH: '阻断',
                    DROP: '丢弃',
                    ALERT: '警告',
                    ALLOW: '允许'
                };
                return lst[action];
            };

            $scope.getRuleRiskLevel = function (idx) {
                var lst = {
                    LOW: '低',
                    MEDIUM: '中',
                    HIGH: '高'
                };
                return lst[idx];
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.changeAction = function (rule, action) {
                Signature.changeAction(policyBlock.policyBlockId, rule.ruleId, action);
            };
            $scope.changeRiskLevel = function (rule, lv) {
                rule.riskLevel = lv;
                Signature.changeRuleRiskLevel(topologyId.id, rule.ruleId, lv);
            };
        }

        function showWhiteListRuleDetailCtrl($scope, $modalInstance, items, policyBlock, tree, ruleItemEdit) {
            var policyBlockId = policyBlock.policyBlockId;
            $scope.enableEdit = true;
            $scope.rulePagination = {
                currentPage: 1,
                numPerPage: 5,
                totalNum: 0
            };
            $scope.rulePagination.totalNum = items.data.length;
            $scope.rulePagination.numPages = parseInt($scope.rulePagination.totalNum / $scope.rulePagination.numPerPage);

            if (policyBlock.type === 'SIGNATURE') {
                policyBlock.signatures = items.data;
            } else {
                policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                    $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                policyBlock.rules.forEach(function (rule) {
                    rule.checked = false;
                });
            }
            $scope.policyBlocks = policyBlock;
            tree($scope);
            ruleItemEdit($scope, items);

            $scope.changeAction = function (policy, action) {
                policy.action = action;
                if (policyBlock.type === 'SIGNATURE') {
                    Template.changeAction(policyBlockId, policy.signatureId, action).then(function () {
                    });
                } else {
                    Signature.changeAction(policyBlockId, policy.ruleId, action).then(function () {
                    });
                }
            };

            $scope.pageChanged = function () {
                policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                    $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                policyBlock.rules.forEach(function (rule) {
                    rule.checked = false;
                });
            };

            $scope.changeRiskLevel = function (rule, lv) {
                rule.riskLevel = lv;
                Signature.changeRuleRiskLevel(rule.ruleId, rule.riskLevel).then(function (data) {
                    console.log(data);
                });
            };

            $scope.ok = function () {
                $modalInstance.close('ok');
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }

        return service;
    }
})();
