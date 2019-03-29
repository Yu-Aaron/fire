/**
 * Monitor Signatrue right side preDeployTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.blacklist')
        .directive('blacklistPreDeployTable', preDeployTable);

    function preDeployTable() {
        var preDepolyTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/blacklist/pre-deploy-table.html',
            controllerAs: 'policyblocks',
            controller: controller
        };

        return preDepolyTableObj;

        function controller($scope, $modal, Signature, $rootScope, $timeout, Task, dataservice, Template, System, apiInfo, $stateParams, $q, $log, $state) {
            "ngInject";
            var vm = this;
            vm.currentPage = 1; //current page
            vm.numPerPage = 10; //max rows for data table
            vm.policy = {};
            vm.table = [];
            vm.disableRearrange = true;
            vm.actions = ["允许", "警告", "阻断"];
            vm.foreverDeployed = $rootScope.alreadyDeployed = (vm.alreadyDeployed = false);
            vm.blockCount = 0;
            vm.enableDefaultRuleEdit = false;
            vm.isDPIUpgrading = System.isDPIUpgrading();

            $rootScope.disableDeploy = false;

            $rootScope.$on('dpiUpgradeState', function () {
                vm.isDPIUpgrading = System.isDPIUpgrading();
            });


            var policyId = $stateParams.policyId;
            //var topologyId = $stateParams.topologyId;

            $rootScope.$$listeners['refreshPreDeployTable'] = [];

            $rootScope.$on('refreshPreDeployTable', function (event, block) {
                if (block > 0 || block.length) {
                    $rootScope.alreadyDeployed = (vm.alreadyDeployed = false);
                    vm.enableDefaultRuleEdit = true;
                    Signature.getPolicyByPolicyId(policyId)
                        .then(function (data) {
                            if (data.data) {
                                vm.policy = data.data;
                            }
                        });
                    getTableData();
                    getTableDataCount();
                }
            });

            vm.deleteAllPredeployPolicy = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/rule/blacklist/confirmDeleteAllPreDeploy.html',
                    controller: ['$scope', '$modalInstance', 'Signature', '$state',ModalInstanceCtrl],
                    size: 'sm'
                });

                function ModalInstanceCtrl($scope, $modalInstance, Signature, $state) {
                    $scope.done = function () {
                        Signature.deleteAllBlocksByPolicyIdandType(policyId, 'SIGNATURE').then(function () {
                            vm.pageChanged();
                            $rootScope.addAlert({
                                type: 'success',
                                content: '删除规则成功'
                            });
                        }, function (data) {
                            $state.reload().then(function () {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '学习规则删除失败：' + data.data.error
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

            vm.changeAction = function (pb, action) {
                vm.alreadyDeployed = false;
                var allActions = {
                    'action': action
                };
                Signature.changeActionToAllinOnePolicyBlock(pb.policyBlockId, allActions).then(function () {
                });

            };

            vm.changeActionToAll = function (action) {
                vm.alreadyDeployed = false;
                var deferred = $q.defer();
                $rootScope.ActionPromise = deferred.promise;
                var allActions = {
                    'action': action
                };
                Signature.changeActionToAllInOnePolicy(policyId, allActions).then(function () {
                    deferred.resolve('success');
                    vm.pageChanged();
                }, function () {
                    deferred.resolve('fail');
                });

            };

            vm.removePolicyBlockFromPolicy = function () {
            };

            getTableData(true);
            getTableDataCount();

            function getTableDataCount() {
                Signature.getPolicyBlockCountbyPolicyId(policyId, 'ReadyDeploy').then(function (data) {
                    vm.totalNum = data.data || 0;
                });
            }

            vm.pageChanged = function () {
                getTableData();
                getTableDataCount();
            };

            function getTableData(updateStatus) {
                var payload = {
                    '$skip': (vm.currentPage - 1) * vm.numPerPage,
                    '$limit': vm.numPerPage,
                    '$orderby': 'createdAt,priority,name'
                };

                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }

                var promise = [];
                promise.push(Signature.getPolicyByPolicyId(policyId));
                promise.push(apiInfo.getCurDate());
                $q.all(promise).then(function (data) {
                    if(data[0] && data[1]){
                        if (data[0].data) {
                            vm.policy = data[0].data;
                            vm.enableDefaultRuleEdit = true;
                            dataservice.policyName = vm.policy.name;
                            if (vm.policy.inUse && updateStatus) {
                                vm.foreverDeployed = $rootScope.alreadyDeployed = (vm.alreadyDeployed = true);
                            }
                            return Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload);
                        } else if(data[1].data){
                            vm.enableDefaultRuleEdit = false;
                            var date = data[1].data;
                            date = date.replace(" ", "T");
                            date = date + "Z";
                            date = moment(date).format('YYYY-MM-DD HH:mm:ss');
                            date = date.replace(" ", "-");
                            date = date.substring(0, date.lastIndexOf(":"));
                            var name = '规则-' + date;

                            dataservice.policyName = name;
                            vm.policy = {
                                'name': dataservice.policyName
                            };
                        }else {
                            vm.enableDefaultRuleEdit = false;
                            var defaultDate = new Date();
                            var currentMonth = defaultDate.getMonth() + 1;
                            var month = currentMonth < 10 ? '0' + currentMonth : currentMonth;
                            var day = defaultDate.getDate() < 10 ? '0' + defaultDate.getDate() : defaultDate.getDate();
                            var hour = defaultDate.getHours() < 10 ? '0' + defaultDate.getHours() : defaultDate.getHours();
                            var minutes = defaultDate.getMinutes() < 10 ? '0' + defaultDate.getMinutes() : defaultDate.getMinutes();
                            var defaultName = '规则-' + defaultDate.getFullYear() + '-' + month + '-' + day + '-' + hour + ':' + minutes;

                            dataservice.policyName = defaultName;
                            vm.policy = {
                                'name': dataservice.policyName
                            };
                        }
                    }

                }).then(function (data) {
                    if (data) {
                        if (data.data.length === 0 && updateStatus) {
//                this part should be true, when deploy a empty rule to dpi
//                vm.alreadyDeployed = true;
                            vm.foreverDeployed = $rootScope.alreadyDeployed = (vm.alreadyDeployed = false);
                        }
                        vm.policy.blocks = data.data;
                        vm.table = initializeData(data.data);
                        for (var i = 0; i < vm.table.length; i++) {
                            getSigbyBlockId(vm.table[i].policyBlockId);
                        }
                    }
                });
            }

            function getSigbyBlockId(para) {
                Signature.getSignaturesbyBlockId(para).then(function (data) {
                    readMyAction(data.data[0]);
                });
            }

            function readMyAction(sig) {
                for (var i = 0; i < vm.table.length; i++) {
                    if (vm.table[i].policyBlockId === sig._policyBlockId) {
                        vm.table[i].sigAction = sig.action;
                    }
                }
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

                if (policyBlock.type === 'SIGNATURE') {
                    policyBlock.signatures = items.data;
                } else {
                    policyBlock.rules = items.data;
                }

                $scope.changePolicyBlockAction = function (policy, action) {
                    var allActions = {
                        'action': action
                    };
                    Signature.changeActionToAllinOnePolicyBlock(policy.policyBlockId, allActions).then(function () {
                    });
                };

                $scope.changeRiskLevel = function (signature, lv) {
                    signature.riskLevel = lv;
                    Signature.changeSignatureRiskLevel(signature.signatureId, signature.riskLevel).then(function (data) {
                        console.log(data);
                    });
                };

                $scope.policyBlocks = policyBlock;

                tree($scope);
                ruleItemEdit($scope);

                $scope.changeAction = function (policy, action) {
                    vm.alreadyDeployed = false;
                    policy.action = action;
                    if (policyBlock.type === 'SIGNATURE') {
                        Template.changeAction(policyBlock.policyBlockId, policy.signatureId, action).then(function () {
                        });
                    } else {
                        Signature.changeAction(policyBlock.policyBlockId, policy.ruleId, action).then(function () {
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
                if (!bool) {
                    vm.alreadyDeployed = false;
                }
                vm.alreadyDeployed = false;
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/policyContent.html',
                    controller: ['$scope', '$modalInstance', 'items', 'policyBlock', 'tree', 'ruleItemEdit', 'enable',ModalInstanceCtrl],
                    windowClass: 'blacklist-modal',
                    backdrop:true,
                    size: 'lg',
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
                        }
                    }
                });

                modalInstance.result.then(function () {
                }, function () {
                    Signature.getPolicySignatureRulesCount(policyId).then(function (data) {
                        $rootScope.disableDeploy = (data && data.data === 0);
                    });
                });
            };

            vm.deleteAllPredeployPolicy = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/rule/whitelist/confirmDeleteAllPreDeploy.html',
                    controller: ModalCtrl,
                    size: 'sm'
                });

                function ModalCtrl($scope, $modalInstance, Signature, $state) {
                    $scope.done = function () {
                        var promises = [];
                        promises.push(Signature.deleteAllBlocksByPolicyIdandType(policyId, 'SIGNATURE'));
                        $q.all(promises).then(function (results) {
                            var updateError = "";
                            for (var i = 0; i < results.length; i++) {
                                if (typeof results[i].message !== 'undefined' && results[i].message.length > 0) {
                                    updateError += (results[i].message + ' ');
                                }
                            }
                            if (!updateError) {
                                $state.reload().then(function () {
                                    $rootScope.addAlert({
                                        type: 'success',
                                        content: '删除规则成功'
                                    });
                                });
                            } else {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '删除规则失败：' + updateError
                                });
                            }
                        }, function (data) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '删除规则失败：' + data.data.error
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

            vm.deletePredeployPolicy = function (policy) {
                vm.alreadyDeployed = false;
                $rootScope.$broadcast('refreshSignatureTable');
                var policyBlockIds = [policy.policyBlockId];
                Signature.deleteBlocksByBlockIds(policyBlockIds).then(function () {
                    vm.pageChanged();
                    $rootScope.addAlert({
                        type: 'success',
                        content: '删除规则成功'
                    });
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '删除规则失败：' + data.data.error
                    });
                });
            };
            vm.deploy = function () {
                var deviceNumber = 0;
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/confirmDeploy.html',
                    controller: function ($scope, $modalInstance) {
                        /*var isUpgrading;
                        Topology.getDevices(topologyId, $rootScope.currentIp).then(function (Ddata) {
                            System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                                isUpgrading = (dpiUpgradeData.data.filter(function (a) {
                                    return (a.state !== 'NONE' || (a.state === 'NONE' && a.percentage !== 0 && a.percentage !== 100)) && !a.error;
                                })[0]) ? true : false;

                                $scope.check = {
                                    checkIDS: true,
                                    checkProtocol: true,
                                    checkDisconnect: true
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
                                    'isShowDeviceUpgradingMsg': isUpgrading
                                };

                                $scope.IDSPool = [];
                                $scope.deviceDisconnetedPool = [];
                                $scope.noProtocolWarningDevicePool = [];

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
                                                            //$scope.check.checkProtocol = false;
                                                            //$scope.noProtocolWarningDevicePool.push(CommonService.mapDeviceAndNode($scope.securityDevicePool,results[m][n].deviceId) + results[m][n].ports.toString().replace(/,/g, "_"));
                                                        }
                                                    }
                                                }
                                            }
                                            if ($scope.msg.hasIDS && $scope.msg.noProtocolWarning) {
                                                break;
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
                                    }
                                    if ($scope.msg.isShowDeviceUpgradingMsg) {
                                        $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                        $scope.msg.qus = "";
                                        $scope.msg.buttonText = '关闭';
                                        $scope.msg.fontAwesomeText = '';
                                    }

                                    $scope.noProtocolWarningDevicePool = _.uniq($scope.noProtocolWarningDevicePool);
                                    $scope.IDSPool = _.uniq($scope.IDSPool);
                                });
                            });
                        });*/
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
                            'isShowDeviceUpgradingMsg': false
                        };
                        $scope.ok = function () {
                            //$scope.msg.isShowDeviceConnectedCnt === 0 ||
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
                                $state.go('rule.blacklist', {'tab': 'deployedPanel'});
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
                });
            };
        }
    }

})();
