(function () {
    'use strict';

    angular.module('southWest.rule.networklist')
        .controller('networkListCtrl', networkListCtrl)
        .controller('networkEditorCtrl', networkEditorCtrl);

    function networkListCtrl($scope, Signature, $state, $rootScope, Topology, Dashboard, Enum, topologyId, uiTree, deployedPolicyArr, policiesArr, ruleService) {
        var vm = this;
        vm.showDash = null;
        vm.tab = null;
        vm.deployedPanelCount = 0;
        vm.policyManagementCount = 0;
        vm.eventHandler = {};
        vm.showUI = false;
        var topo = Topology.getTopo(topologyId.id);
        var deployedPolicy = {'blocks': []};
        var policies = [];
        vm.topologyId = topologyId.id;

        vm.contentEnable = function (target) {
            return uiTree.getContentShow(target);
        };

        vm.createPolicy = function (tab) {
            var topoId = topologyId.id;
            if (topoId) {
                Signature.createPolicy().then(function (data) {
                    $state.go('rule.whitelist.editor', {'topologyId': topoId, 'policyId': data.data.value, 'tab': tab});
                    vm.showUI = true;
                });
            }
        };

        $scope.getCurrentTopoId = function () {
            return vm.currentTopoId;
        };

        $scope.getDeployedPolicies = function () {
            return deployedPolicy;
        };

        $scope.getPolicies = function () {
            return policies;
        };

        $scope.refreshDeployPanel = function () {
            //topo = Topology.getCurrentTopo();
            vm.getDeployedPolicy();
            refreshBadge();
        };

        function refreshBadge() {
            vm.deployedPanelCount = 0;
            Signature.getDeployedPolicy('IP_RULE').then(function (data) {
                if (data.data.length > 0) {
                    var topology = data.data[0];
                    Dashboard.getIPRuleDeployedCount(topology.topologyId).then(function (data) {
                        vm.deployedPanelCount = data.data.statsValue;
                    });
                }
            });
        }

        topo.then(function (data) {
            if (data && data.topologyId) {
                vm.currentTopoId = data.topologyId;
                refreshBadge();
            }
            Signature.getPolicies("IP_RULE").then(function (data) {
                vm.policyManagementCount = data.data.length;
            });

        });

        vm.eventHandler.stateChangeSuccessHandler = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $state.previous = {};
            $state.previous.state = fromState.name;
            $state.previous.params = fromParams;
        });

        // if (Enum.get('privilege')) {
        //   $scope.pv = Enum.get('privilege').filter(function (a) {
        //     console.log(a);
        //     return a.name === $rootScope.currentState;
        //   })[0].actionValue;
        //   vm.canEdit = (($scope.pv & 4) > 0);
        // } else {
        //   vm.eventHandler.privilegeHandler = $rootScope.$on('privilege', function () {
        //     $scope.pv = Enum.get('privilege').filter(function (a) {
        //       return a.name === $rootScope.currentState;
        //     })[0].actionValue;
        //     vm.canEdit = (($scope.pv & 4) > 0);
        //   });
        // }
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
                ruleService.createPolicy('networklist', 'total');
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
            topo.then(function () {
                    if (vm.currentTopoId) {
                        Signature.getDeployedPolicy('IP_RULE')
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
                    }
                }
            );
        };

        vm.getPolicies = function () {
            topo.then(function () {
                if (vm.currentTopoId) {
                    Signature.getPolicies("IP_RULE").then(function (data) {
                        $scope.allPolicies = data.data;
                        $scope.$broadcast('refreshPolicy', data.data);
                    });
                }
            });
        };

        if (vm.tab === 'deployedPanel') {
            vm.getDeployedPolicy();
        } else if (vm.tab === 'policyManagement') {
            vm.getPolicies();
        }

        vm.hasDeployedPolicy = true;
        if (deployedPolicyArr.length === 0) {
            vm.hasDeployedPolicy = false;
        }
    }

    var DEFAULT_INTERVAL = {'days': 0, 'hours': 0, 'minutes': 2};
    var MAX_DATE = "2199-12-31";

    function networkEditorCtrl($scope, $timeout, $state, localStorage, Learning, $rootScope, System, Signature, $modal, $log, $interval, policiesArr, Topology, Custom, WhiteListService, topologyId) {
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
        vm.isDPIUpgrading = System.isDPIUpgrading();
        vm.learningType = 'IP_RULE';
        vm.topologyId = topologyId.id;

        vm.hasPolicies = policiesArr.length > 0 ? true : false;

        vm.eventHandler.dpiUpgradeStateHandler = $rootScope.$on('dpiUpgradeState', function () {
            vm.isDPIUpgrading = System.isDPIUpgrading();
        });

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
            vm.eventHandler.dpiUpgradeStateHandler();
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

        $scope.$watch('[editor.startdt_date, editor.startdt_time]', function (newVal) {
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

        vm.getTopologyId = function () {
            return $state.params.topologyId;
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
            WhiteListService.moveToPreDeployTable($scope);
        };

        // function ModalInstanceCtrl_customRule($scope, $modalInstance, tree, topologyId) {
        //   $scope.editRules = false;
        //   $scope.editRuleItem = false;
        //   $scope.ruleItems = [];
        //   $scope.currentTree = {};
        //   $scope.selectedRuleItems = [];


        //   $scope.customPolicyBlock = {};
        //   $scope.customPolicyBlock.name = '';
        //   $scope.customPolicyBlock.sourceZoneName = '';
        //   $scope.customPolicyBlock.destinationZoneName = '';
        //   $scope.customPolicyBlock.descirption = '';
        //   $scope.customPolicyBlock.timeStamp = new Date();
        //   $scope.customPolicyBlock.type = 'CUSTOM';
        //   $scope.customPolicyBlock.topology = '当前没有应用的拓扑';
        //   $scope.customPolicyBlock.ruleItems = $scope.ruleItems;
        //   $scope.customPolicyBlock.selectAll = false;
        //   $scope.zones = [];

        //   Topology.getTopo(topologyId.id).then(function (data) {
        //     //console.log(data);
        //     $scope.customPolicyBlock.topology = data.name;
        //   });

        //   Topology.getZones(topologyId.id).then(function (data) {
        //     $scope.zones = data.data;
        //   });


        //   tree($scope);

        //   $scope.createRuleItem = function () {
        //     $scope.editRules = true;
        //     $scope.currentTree = {};
        //     var payload = {
        //       'currentValue': '[]'
        //     };

        //     Custom.getData(payload).then(function (data) {
        //       console.log(data.data);
        //       var json = data.data.nodeTree;
        //       //console.log(json);

        //       $scope.generateTree(json.nodes);

        //     });
        //   };


        //   $scope.confirmCreateRule = function () {
        //     $scope.editRules = false;
        //     var rules = [];

        //     for (var node in $scope.currentTree) {
        //       if ($scope.currentTree[node]) {
        //         if (!$scope.currentTree[node].active) {
        //           var rule = {};
        //           rule.name = $scope.currentTree[node].nodeDisplayName;
        //           rule.value = $scope.currentTree[node].nodeDisplayValue;

        //           rules.push(rule);
        //         }
        //       }
        //     }

        //     if (rules.length > 0) {
        //       $scope.ruleItems.push({
        //         'fields': rules,
        //         'action': 'DROP',
        //         'checked': false
        //       });
        //     }
        //     $scope.editRuleItem = false;
        //   };

        //   $scope.modifyRuleItem = function (ruleItemIndex, ruleItem) {
        //     //console.log(angular.toJson(ruleItem));
        //     //console.log(angular.toJson(ruleItem.fields));

        //     $scope.ruleItemIndex = ruleItemIndex;
        //     $scope.editRules = true;
        //     $scope.editRuleItem = true;
        //     var payload = {
        //       'currentValue': angular.toJson(ruleItem.fields)
        //     };

        //     Custom.getData(payload).then(function (data) {
        //       var json = data.data.nodeTree;
        //       $scope.currentTree = json.nodes;
        //       $scope.generateTree(json.nodes);

        //     });
        //   };


        //   $scope.confirmRuleEdit = function () {
        //     $scope.editRules = false;
        //     //console.log($scope.currentTree);
        //     var rules = [];
        //     for (var node in $scope.currentTree) {
        //       if ($scope.currentTree[node]) {
        //         if (!$scope.currentTree[node].active) {
        //           var rule = {};
        //           rule.name = $scope.currentTree[node].nodeDisplayName;
        //           rule.value = $scope.currentTree[node].nodeDisplayValue;
        //           rules.push(rule);
        //         }
        //       }
        //     }
        //     $scope.ruleItems[$scope.ruleItemIndex].fields = rules;
        //     $scope.editRuleItem = false;
        //   };

        //   $scope.cancelRuleEdit = function () {
        //     $scope.editRules = false;

        //     $("#diagram", "*").empty();
        //   };

        //   $scope.selectRuleItem = function (ruleItem, index) {
        //     if (ruleItem.checked) {
        //       $scope.selectedRuleItems.push(index);
        //       if ($scope.selectedRuleItems.length === $scope.ruleItems.length) {
        //         $scope.customPolicyBlock.selectAll = true;
        //       }
        //       //console.log($scope.selectedRuleItems);
        //     } else {
        //       $scope.selectedRuleItems = _.without($scope.selectedRuleItems, index);
        //       $scope.customPolicyBlock.selectAll = false;
        //       //console.log($scope.selectedRuleItems);
        //     }
        //   };

        //   $scope.selectAllRuleItem = function () {
        //     $scope.selectedRuleItems = [];
        //     $scope.ruleItems.forEach(function (rule, index) {
        //       rule.checked = $scope.customPolicyBlock.selectAll;
        //       if ($scope.customPolicyBlock.selectAll) {
        //         $scope.selectedRuleItems.push(index);
        //       }
        //     });
        //   };

        //   $scope.moveUp = function () {
        //     var originIndex = $scope.selectedRuleItems[0];
        //     if (originIndex === 0) {
        //       return;
        //     } else {
        //       var targetIndex = originIndex - 1;
        //       var temp = $scope.ruleItems[originIndex];
        //       $scope.ruleItems[originIndex] = $scope.ruleItems[targetIndex];
        //       $scope.ruleItems[targetIndex] = temp;
        //       $scope.selectedRuleItems[0] = targetIndex;
        //     }
        //   };

        //   $scope.moveDown = function () {
        //     var originIndex = $scope.selectedRuleItems[0];
        //     if (originIndex === $scope.ruleItems.length - 1) {
        //       return;
        //     } else {
        //       var targetIndex = originIndex + 1;
        //       var temp = $scope.ruleItems[originIndex];
        //       $scope.ruleItems[originIndex] = $scope.ruleItems[targetIndex];
        //       $scope.ruleItems[targetIndex] = temp;
        //       $scope.selectedRuleItems[0] = targetIndex;
        //     }
        //   };

        //   $scope.deleteRuleItems = function () {
        //     $scope.selectedRuleItems.forEach(function (index) {
        //       delete $scope.ruleItems[index];
        //       $scope.selectedRuleItems = _.without($scope.selectedRuleItems, index);
        //     });
        //     $scope.ruleItems = _.without($scope.ruleItems, undefined);
        //     $scope.customPolicyBlock.selectAll = false;
        //   };

        //   $scope.changeAction = function (ruleItem, action) {
        //     ruleItem.action = action;
        //   };

        //   $scope.ok = function () {
        //     $modalInstance.close($scope.customPolicyBlock);
        //   };

        //   $scope.cancel = function () {
        //     $modalInstance.dismiss('cancel');
        //   };
        // }

        // vm.createCustomRules = function (tab) {
        //   policyid = $state.params.policyId;
        //   console.log(tab);
        //   if (tab === 'acl'){
        //     var modalInstance = $modal.open({
        //       templateUrl: '/templates/rule/whitelist/custom-rule-editor.html',
        //       controller: ModalInstanceCtrl_customRule,
        //       size: 'lg'
        //     });

        //     modalInstance.result.then(function (customPolicyBlock) {
        //       var policyBlock = {};
        //       policyBlock.name = customPolicyBlock.name;
        //       policyBlock._sourceZoneName = customPolicyBlock.sourceZoneName;
        //       policyBlock._destinationZoneName = customPolicyBlock.destinationZoneName;
        //       policyBlock.description = customPolicyBlock.description;

        //       Custom.createPolicyBlock(topologyId, policyId, policyBlock).then(function (data) {
        //         var policyBlockId = data.data.policyBlockId;
        //         if (customPolicyBlock.ruleItems.length) {
        //           var promises = [];
        //           customPolicyBlock.ruleItems.forEach(function (ruleItem, index) {
        //             var rule = {};
        //             rule.priority = index;
        //             rule.action = ruleItem.action;
        //             rule.fields = angular.copy(ruleItem.fields);
        //             promises.push(Custom.createRule(policyBlockId, rule));
        //           });

        //           $q.all(promises).then(function () {
        //             ctrl.getTableData();
        //             ctrl.getTableDataCount();
        //           });


        //         } else {
        //           ctrl.getTableData();
        //           ctrl.getTableDataCount();
        //         }

        //       });

        //     }, function () {
        //       console.log('Modal dismissed at: ' + new Date());
        //     });
        //   }else if (tab === 'network_layer'){
        //     console.log('network_layer');
        //   }
        // };
    }

})();
