/**
 * Monitor Signatrue right side preDeployTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        .directive('preDeployTable', preDeployTable);

    function preDeployTable() {
        var preDepolyTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/whitelist/pre-deploy-table.html',
            controllerAs: 'policyblocks',
            controller: controller
        };

        return preDepolyTableObj;

        //////////
        function controller($scope, $modal, Signature, $rootScope, $timeout, $state, Task, $log, Device, dataservice, System, Topology, Template, $stateParams, $q) {
            "ngInject";
            var vm = this;
            //if ($state.current.name.indexOf('networklist') !== -1) {
            //    vm.protocolType = 'networklist';
            //} else {
            vm.protocolType = 'whitelist_manager';
            //}
            vm.currentPage = 1; //current page
            vm.numPerPage = 10; //max rows for data table
            vm.policy = {};
            vm.table = [];
            vm.disableRearrange = true;
            vm.actions = ["允许", "警告", "阻断"];
            vm.foreverDeployed = $rootScope.alreadyDeployed = (vm.alreadyDeployed = false);
            vm.blockCount = 0;
            vm.enableDefaultRuleEdit = false;
            // vm.isDPIUpgrading = System.isDPIUpgrading();

            /* $rootScope.$on('dpiUpgradeState', function () {
             vm.isDPIUpgrading = System.isDPIUpgrading();
             });*/


            var policyId = $stateParams.policyId;

            $rootScope.$$listeners['refreshPreDeployTable'] = [];

            $scope.$on('rebuildselectedPolicy', function () {
                vm.selectedPolicyBlocks = [];
            });

            $rootScope.$on('refreshPreDeployTable', function (event, block) {
                //console.log(block);
                if (block > 0 || block.length) {
                    $rootScope.alreadyDeployed = (vm.alreadyDeployed = false);
                    // vm.enableDefaultRuleEdit = true;
                    Signature.getPolicyByPolicyId(policyId)
                        .then(function (data) {
                            if (data.data) {
                                //console.log(data.data);
                                vm.policy = data.data;
                            }
                        });
                    getTableData();
                    getTableDataCount();
                }

                //vm.table = vm.table.concat(block);
                //for (var a = 0; a < block.length; a++) {
                //  if (block[a].type === 'SIGNATURE') {
                //    vm.blockCount += block[a]['_signaturesCount'];
                //  } else {
                //    vm.blockCount += block[a]['_rulesCount'];
                //  }
                //}
            });

            vm.changeDefaultRuleAction = function (policy, field, action) {
                var action1 = null;
                var action2 = null;
                if (field === 'supportRuleAction') {
                    action1 = action;
                    action2 = policy.unknownRuleAction;
                } else if (field === 'unknownRuleAction') {
                    action1 = policy.supportRuleAction;
                    action2 = action;
                }
                Signature.changeDefaultRuleAction(policyId, action1, action2).then(function (data) {
                    $rootScope.alreadyDeployed = (vm.alreadyDeployed = false);
                    policy.supportRuleAction = data.data.supportRuleAction;
                    policy.unknownRuleAction = data.data.unknownRuleAction;
                });
            };

            vm.changeName = function () {
                Signature.changePolicyName(policyId, vm.policy.name).then(function (data) {
                    dataservice.policyName = data.data.name;
                    $rootScope.$broadcast('updateDashboardHeader');
                });
            };
            /*
             vm.changeNumPerPage = function(){
             if(!isNaN(vm.numPerPage)&&vm.numPerPage>=1){
             vm.numPerPage = Math.floor(vm.numPerPage);
             getTableData(true);
             getTableDataCount();

             }
             }
             */

            getTableData(true);
            getTableDataCount();

            vm.deleteAllPredeployPolicy = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/rule/whitelist/confirmDeleteAllPreDeploy.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                function ModalInstanceCtrl($scope, $modalInstance, Signature, $state) {
                    $scope.done = function () {
                        Signature.deleteAllBlocksByPolicyIdandType(policyId, 'CUSTOM').then(function () {
                            vm.pageChanged();
                            $rootScope.addAlert({
                                type: 'success',
                                content: '删除规则成功'
                            });
                            $rootScope.$broadcast('refreshLeftTable');
                        }, function (data) {
                            $state.reload().then(function () {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '规则删除失败：' + data.data.error
                                });
                            });
                        });
                        $modalInstance.close('done');
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });


            };

            vm.deleteSelectPredeployPolicy = function () {
                var policyBlockIds = [];
                vm.selectedPolicyBlocks.forEach(function (policyBlock) {
                    policyBlockIds.push(policyBlock.policyBlockId);
                });
                vm.selectedPolicyBlocks = [];
                vm.alreadyDeployed = false;
                // var policyBlockIds = [policy.policyBlockId];
                Signature.deleteBlocksByBlockIds(policyBlockIds).then(function () {
                    vm.pageChanged();
                    $rootScope.addAlert({
                        type: 'success',
                        content: '删除规则成功'
                    });
                    $rootScope.$broadcast('refreshLeftTable');
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '删除规则失败：' + data.data.error
                    });
                });
            };
            vm.selectedPolicyBlocks = [];
            vm.countSelected = function (policy, state, index) {
                policy['index'] = index;
                if (state) {
                    vm.selectedPolicyBlocks.push(policy);
                } else {
                    removeByValue(vm.selectedPolicyBlocks, policy);
                }
                checkMStatus();
            };
            function removeByValue(arr, val) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].policyBlockId === val.policyBlockId) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            function checkMStatus(){
                vm.tt = true;
                vm.ut = true;
                vm.lt = true;
                vm.bt = true;
                var minPriority;
                var maxPriority;
                vm.selectedPolicyBlocks.forEach(function (policy) {
                    policyId = policy.policyId;
                    if (!minPriority || !maxPriority) {
                        minPriority = policy.index;
                        maxPriority = policy.index;
                    } else {
                        if (policy.index > maxPriority) {
                            maxPriority = policy.index;
                        }
                        if (policy.index < minPriority) {
                            minPriority = policy.index;
                        }
                    }
                });
                if ((maxPriority - minPriority + 1) !== vm.selectedPolicyBlocks.length) {
                    vm.tt = false;
                    vm.ut = false;
                    vm.lt = false;
                    vm.bt = false;
                }
                if (minPriority === 1) {
                    vm.tt = false;
                    vm.ut = false;

                }
                if (maxPriority === vm.totalNum) {
                    vm.lt = false;
                    vm.bt = false;
                }
            }

            //根据选中的policys修改优先级(不支持跨页选择和跨优先级选择)
            vm.policyPriority = false;
            vm.updatePriority = function (direction) {
                if (vm.policyPriority) {
                    return;
                }
                if (vm.selectedPolicyBlocks.length > 0) {
                    var minPriority;
                    var maxPriority;
                    var policyId;
                    var size = 0;
                    vm.selectedPolicyBlocks.forEach(function (policy) {
                        policyId = policy.policyId;
                        if (!minPriority || !maxPriority) {
                            minPriority = policy.index;
                            maxPriority = policy.index;
                        } else {
                            if (policy.index > maxPriority) {
                                maxPriority = policy.index;
                            }
                            if (policy.index < minPriority) {
                                minPriority = policy.index;
                            }
                        }
                        delete policy['index'];
                        delete policy['select'];
                        delete policy['selectAll'];
                    });
                    if (vm.selectedPolicyBlocks.length !== 1 && (maxPriority - minPriority + 1) !== vm.selectedPolicyBlocks.length) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '不能跨行选择排序'
                        });
                        vm.pageChanged();
                        return;
                    }
                    if (direction === 't' || direction === 'u') {
                        if (minPriority === 1) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '已经为最高优先级不能上移'
                            });
                            vm.pageChanged();
                            return;
                        }
                    } else {
                        if (maxPriority === vm.totalNum) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '已经为最低优先级不能下移'
                            });
                            vm.pageChanged();
                            return;
                        }
                    }
                    if (direction === 't') {
                        size = minPriority - 1;
                    } else if (direction === 'u') {
                        size = 1;
                    } else if (direction === 'l') {
                        size = -1;
                    } else {
                        size = maxPriority - vm.totalNum;
                    }

                    //更新操作
                    vm.alreadyDeployed = false;
                    $rootScope.$broadcast('refreshLeftTable');
                    vm.policyPriority = true;
                    Signature.changePriorityByDirection(policyId, vm.selectedPolicyBlocks, direction, size).then(function () {

                        $rootScope.addAlert({
                            type: 'success',
                            content: '优先级更新成功'
                        });
                        return vm.pageChanged();
                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '优先级更新失败：' + data.data.error
                        });
                    }).then(function () {
                        vm.policyPriority = false;
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '请最少选择一个规则'
                    });
                }
            };


            function getTableDataCount() {
                var type = 'WHITELIST';
                /*if (vm.protocolType === 'networklist') {
                 type = 'IP_RULE';
                 }*/
                return Signature.getPolicyBlockCountbyPolicyId(policyId, 'ReadyDeploy', null, null, type).then(function (data) {
                    vm.totalNum = data.data || 0;
                });
            }

            vm.pageChanged = function () {
                return $q.all([
                        getTableData(),
                        getTableDataCount()
                    ]
                );
            };

            function getTableData(updateStatus) {
                var payload = {
                    '$skip': (vm.currentPage - 1) * vm.numPerPage,
                    '$limit': vm.numPerPage,
                    '$orderby': 'priority'
                };

                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }


                return Signature.getPolicyByPolicyId(policyId)
                    .then(function (data) {
                        if (data.data) {
                            vm.policy = data.data;
                            // vm.enableDefaultRuleEdit = true;
                            dataservice.policyName = vm.policy.name;
                            if (vm.policy.inUse && updateStatus) {
                                vm.foreverDeployed = $rootScope.alreadyDeployed = (vm.alreadyDeployed = true);
                            }
                            var type = 'WHITELIST';
                            /* if (vm.protocolType === 'networklist') {
                             type = 'IP_RULE';
                             }*/
                            return Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload, type);
                        } else {
                            vm.enableDefaultRuleEdit = false;
                            var date = new Date();
                            var currentMonth = date.getMonth() + 1;
                            var month = currentMonth < 10 ? '0' + currentMonth : currentMonth;
                            var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                            var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
                            var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                            var name = '规则-' + date.getFullYear() + '-' + month + '-' + day + '-' + hour + ':' + minutes;

                            dataservice.policyName = name;
                            vm.policy = {
                                'name': dataservice.policyName
                            };
                        }
                    }).then(function (data) {
                        if (data) {
                            if (data.data.length === 0 && updateStatus) {
                                $rootScope.alreadyDeployed = (vm.alreadyDeployed = false);
                            }
                            vm.policy.blocks = data.data;
                            vm.table = initializeData(data.data);
                            vm.table.forEach(function (policy) {
                                policy['select'] = false;
                                vm.selectedPolicyBlocks.forEach(function (selectpolicy) {
                                    if (policy['policyBlockId'] === selectpolicy['policyBlockId']) {
                                        policy['select'] = true;
                                    }
                                });
                            });
                            var payloadtable = {
                                '$skip': 0,
                                '$limit': 10000,
                                '$orderby': 'priority'
                            };
                            return Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payloadtable, 'WHITELIST').then(function (data) {
                                var tableData = initializeData(data.data);
                                tableData.forEach(function (policy, index) {
                                    vm.selectedPolicyBlocks.forEach(function (selectpolicy) {
                                        if (policy['policyBlockId'] === selectpolicy['policyBlockId']) {
                                            selectpolicy['priority'] = policy['priority'];
                                            selectpolicy['index'] = index + 1;
                                        }
                                    });
                                });

                            });
                        }
                    }).then(function () {
                        checkMStatus();
                    });
            }

            function initializeData(data) {
                vm.blockCount = 0;
                for (var a = 0; a < data.length; a++) {
                    if (data[a].type === 'SIGNATURE') {
                        vm.blockCount += data[a]['_signaturesCount'];
                    } else {
                        vm.blockCount += data[a]['_rulesCount'];
                    }
                }

                Signature.getPolicySignatureRulesCount(policyId).then(function (data) {
                    $rootScope.disableDeploy = (data && data.data === 0);
                });

                return data;
            }

            var ModalInstanceCtrl = function ($scope, $modalInstance, items, policyBlock, tree, ruleItemEdit, enable) {
                $scope.enableEdit = true;

                $scope.enableAction = enable;

                $scope.rulePagination = {
                    currentPage : 1,
                    numPerPage : 5,
                    totalNum : 0
                };
                $scope.rulePagination.totalNum = items.data.length;
                $scope.rulePagination.numPages = parseInt($scope.rulePagination.totalNum/$scope.rulePagination.numPerPage);

                if (policyBlock.type === 'SIGNATURE') {
                    policyBlock.signatures = items.data;
                } else {
                    policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                        $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                }
                $scope.policyBlocks = policyBlock;

                tree($scope);
                ruleItemEdit($scope, items);

                $scope.changeRiskLevel = function (rule, lv) {
                    rule.riskLevel = lv;
                    Signature.changeRuleRiskLevel(rule.ruleId, rule.riskLevel).then(function (data) {
                        console.log(data);
                    });
                };

                $scope.pageChanged = function () {
                    policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                        $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                };

                $scope.changeAction = function (policy, action) {
                    policy.action = action;
                    if (policyBlock.type === 'SIGNATURE') {
                        Template.changeAction(policyBlock.policyBlockId, policy.signatureId, action).then(function (data) {
                            console.log(data.data);
                        });
                    } else {
                        Signature.changeAction(policyBlock.policyBlockId, policy.ruleId, action).then(function (data) {
                            console.log(data.data);
                        });
                    }
                };

                $scope.ok = function () {
                    $modalInstance.close('ok');
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            vm.showDetail = function (policyBlock, bool) {
                var templateUrl = '/templates/rule/whitelist/policyContent.html';
                var ctrl = ModalInstanceCtrl;
                /*if (vm.protocolType === 'networklist') {
                 templateUrl = '/templates/rule/whitelist/ip-rule-policy-content.html';
                 ctrl = WhiteListService.showIpRuleDetailCtrl;
                 }*/
                vm.alreadyDeployed = false;
                var modalInstance = $modal.open({
                    templateUrl: templateUrl,
                    controller: ctrl,
                    size: 'lg',
                    backdrop:true,
                    resolve: {
                        items: function () {
                            if (policyBlock.type === 'SIGNATURE') {
                                return Signature.getSignaturesbyBlockId(policyBlock.policyBlockId);
                            } else {
                                return Signature.getRulesbyBlockId(policyBlock.policyBlockId);
                            }

                        },
                        policyBlock: function () {
                            return policyBlock;
                        },
                        enable: function () {
                            return bool;
                        },
                        policy: function () {
                            return Signature.getPolicyByPolicyId(policyId);
                        }
                    }
                });

                modalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    Signature.getPolicySignatureRulesCount(policyId).then(function (data) {
                        $rootScope.disableDeploy = (data && data.data === 0);
                    });
                    console.log('Modal dismissed at: ' + new Date());
                });
            };

            vm.deploy = function () {
                var deviceNumber = 0;
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/whitelist/confirmDeploy.html',
                    controller: function ($scope, $modalInstance) {
                        var isUpgrading = false;
                        // Topology.getDevices(topologyId, $rootScope.currentIp).then(function (Ddata) {
                        //     System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        //         isUpgrading = (dpiUpgradeData.data.filter(function (a) {
                        //             return (a.state !== 'NONE' || (a.state === 'NONE' && a.percentage !== 0 && a.percentage !== 100)) && !a.error;
                        //         })[0]) ? true : false;

                        $scope.check = {
                            checkIDS: true,
                            checkProtocol: true,
                            checkDisconnect: true,
                            checkBlacklistOnly: true
                        };
                        $scope.msg = {
                            'text': '部署新规则将会覆盖原部署规则，这个步骤无法还原。',
                            'qus': '确定部署新规则？',
                            'buttonText': '部署规则',
                            'fontAwesomeText': 'fa-cloud-download',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '规则将无法部署以下未连线设备：',
                            'hasIDS': false,
                            'hasIDSText': '以下监测审计设备上的阻断规则会被智能替换为告警。',
                            'noProtocolWarning': false,
                            'noProtocolWarningText': '以下数采隔离设备没有选择数采隔离协议。如果部署规则，经过以下隔离设备的所有的协议流量将会被阻止。',
                            'hasWhitelistPort': false,
                            'blacklistOnlyWarningText': '以下设备只能部署黑名单。白名单将无法部署到以下设备:',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        /* $scope.IDSPool = [];
                         $scope.deviceDisconnetedPool = [];
                         $scope.noProtocolWarningDevicePool = [];
                         $scope.blacklistOnlyWarningDevicePool = [];

                         $scope.securityDevicePool = Ddata.data;
                         deviceNumber = Ddata.data.length;

                         var promises = [];
                         var isDATA_COLLECTION_DEVICE = [0];
                         var links = [];
                         promises.push(Topology.getLinks(topologyId, $rootScope.currentIp));
                         for (var k = 0; k < Ddata.data.length; k++) {
                         if (Ddata.data[k].category === "SECURITY_DEVICE") {
                         if (Ddata.data[k].deviceOnline !== 1) {
                         $scope.msg.isShowDeviceDisconnectedMsg = true;
                         $scope.check.checkDisconnect = false;
                         $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                         } else {
                         $scope.msg.isShowDeviceConnectedCnt++;
                         promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId, $rootScope.currentIp));
                         isDATA_COLLECTION_DEVICE.push(Ddata.data[k]._subCategory === 'DATA_COLLECTION_DEVICE');
                         }
                         }
                         }

                         $q.all(promises).then(function (results) {
                         for (var l = 0; l < results[0].data.length; l++) {
                         links.push(results[0].data[l].nodeID);
                         links.push(results[0].data[l].destinationNodeID);
                         }
                         for (var m = 1; m < results.length; m++) {
                         for (var n = 0; n < results[m].length; n++) {
                         if (results[m][n].type === 'IDS') {
                         $scope.msg.hasIDS = true;
                         $scope.check.checkIDS = false;
                         $scope.IDSPool.push(CommonService.mapDeviceAndNode($scope.securityDevicePool, results[m][n].deviceId) + results[m][n].ports.toString().replace(/,/g, "_"));
                         }
                         if (!results[m][n]._nodeProtocolLinks.length) {
                         if (isDATA_COLLECTION_DEVICE[m]) {
                         for (var u = 0; u < links.length; u++) {
                         if (links[u] === results[m][n].id) {
                         $scope.msg.noProtocolWarning = true;
                         $scope.check.checkProtocol = false;
                         $scope.noProtocolWarningDevicePool.push(CommonService.mapDeviceAndNode($scope.securityDevicePool, results[m][n].deviceId) + results[m][n].ports.toString().replace(/,/g, "_"));
                         }
                         }
                         }
                         }
                         if ($scope.msg.hasIDS && $scope.msg.noProtocolWarning) {
                         break;
                         }
                         var deviceName = "";
                         if (results[m][n].nodeProperty === 'SignatureONLY') {
                         for (var d = 0; d < Ddata.data.length; d++) {
                         if (Ddata.data[d].deviceId === results[m][n].deviceId) {
                         deviceName = Ddata.data[d].name;
                         break;
                         }
                         }
                         $scope.blacklistOnlyWarningDevicePool.push({
                         "name": deviceName ? deviceName : results[m][n].name,
                         "ports": results[m][n].ports
                         });
                         $scope.check.checkBlacklistOnly = false;
                         } else {
                         $scope.msg.hasWhitelistPort = true;
                         }
                         }
                         if ($scope.msg.hasIDS && $scope.msg.noProtocolWarning) {
                         break;
                         }
                         }
                         if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                         $scope.msg.text = "没有设备在线，无法部署规则。";
                         $scope.msg.qus = "";
                         $scope.msg.buttonText = '关闭';
                         $scope.msg.fontAwesomeText = '';
                         } else if (!$scope.msg.hasWhitelistPort) {
                         $scope.msg.text = "没有设备端口可以部署白名单。";
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

                         $scope.noProtocolWarningDevicePool = _.uniq($scope.noProtocolWarningDevicePool);
                         $scope.IDSPool = _.uniq($scope.IDSPool);
                         });*/
                        // });
                        // });

                        $scope.ok = function () {
                            //    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg || !$scope.msg.hasWhitelistPort) {
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $modalInstance.dismiss('cancel');
                            } else {
                                $modalInstance.close();
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                    if (vm.table.length === 0) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '没有有效的规则，不可部署'
                        });
                        return;
                    }
                    Signature.deploy(policyId).then(function (data) {
                        var taskId = data.data.taskId;
                        var deferred = $q.defer();
                        $rootScope.deployTaskPromise = deferred.promise;

                        $rootScope.deployTaskPromise.then(function (result) {
                            if (result === 'success') {
                                $state.go('rule.' + vm.protocolType + '.deploy', {'tab': 'deployedPanel'});
                            }
                        });

                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {

                                Task.getTask(taskId, $rootScope.currentIp).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '部署成功'
                                        });
                                        for (var a = 0; a < vm.table.length; a++) {
                                            vm.table[a].status = 'ACTIVE';
                                        }
                                        vm.foreverDeployed = $rootScope.alreadyDeployed = (vm.alreadyDeployed = true);
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                    } else if (data.data.state === 'FAILED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('部署失败：' + data.data.reason) : '部署失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '部署超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(120 + deviceNumber * 15);


                        //getTableData();

                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.rejectReason ? ('部署失败：' + data.data.rejectReason) : '部署失败')
                        });
                    });
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };
        }
    }

})();
