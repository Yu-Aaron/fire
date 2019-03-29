/**
 * Monitor Signatrue Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        // first two tabs
        .directive('deployedTable', deployedTable)
        .directive('policyManagementTable', policyManagementTable)
        // policy detail page
        .directive('policyDetailTable', policyDetailTable)
        .directive('totalRuleBlockTable', totalRuleBlockTable);


    function deployedTable() {
        var deployedTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/whitelist/deployed-table.html',
            controller: ['$scope', '$modal', 'Signature', 'Template', 'Dashboard', 'Incident', '$rootScope', '$timeout', 'Task', 'Topology', '$state', 'WhiteListService', controller],
            controllerAs: 'whiteDeployedPolicies',
            link: function () {

            }
        };

        return deployedTableObj;

        //////////
        function controller($scope, $modal, Signature, Template, Dashboard, Incident, $rootScope, $timeout, Task, Topology, $state, WhiteListService) {
            var vm = this;
            vm.currentPage = 1; //current page
            vm.numPerPage = 20; //max rows for data table
            vm.table = [];

            //if ($state.current.name.indexOf('networklist') !== -1) {
            //    vm.policyType = 'networklist';
            //} else {
            vm.policyType = 'whitelist_manager';
            //}

            //getTableData();
            var policyId = $scope.getDeployedPolicies().policyId;

            getTableData();
            initializeDashboard();

            var refreshDeployedTable = $scope.$on('refreshDeployedTable', function () {
                //topologyId = $scope.getCurrentTopoId();
                policyId = $scope.getDeployedPolicies().policyId;
                getTableData();
                initializeDashboard();
            });
            $scope.$on('destroy', function () {
                refreshDeployedTable();
            });

            $scope.createPolicy = function () {
                //var topoId = topologyId;
                //if (topoId) {
                Signature.createPolicy().then(function (data) {
                    $state.go('rule.' + vm.policyType + '.editor', {
                        //'topologyId': topoId,
                        'policyId': data.data.value,
                        'tab': 'total'
                    });
                });
                //}
            };


            vm.cleanDeploy = function () {


                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/whitelist/confirmCleanDeploy.html',
                    controller: function ($scope, $modalInstance) {
                        "ngInject";

                        $scope.check = {
                            checkDisconnect: true
                        };
                        $scope.msg = {
                            'text': '清空已部署规则将会把系统还原至无规则部署的状态，这个步骤无法还原。',
                            'qus': '确定清空已部署规则？',
                            'buttonText': '清空已部署规则',
                            'fontAwesomeText': 'fa-times-circle-o',
                            'isShowDeviceConnectedCnt': 1,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '规则将无法部署以下未连线设备：'
                        };
                        /*   $scope.deviceDisconnetedPool = [];

                         for (var k = 0; k < Ddata.data.length; k++) {
                         if (Ddata.data[k].category === "SECURITY_DEVICE") {
                         if (Ddata.data[k].deviceOnline !== 1) {
                         $scope.msg.isShowDeviceDisconnectedMsg = true;
                         $scope.check.checkDisconnect = false;
                         $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                         } else {
                         $scope.msg.isShowDeviceConnectedCnt++;
                         }
                         }
                         }
                         if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                         $scope.msg.text = "没有设备在线，无法清空已部署规则。";
                         $scope.msg.qus = "";
                         $scope.msg.buttonText = '关闭';
                         $scope.msg.fontAwesomeText = '';
                         }*/

                        $scope.ok = function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
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
                    //var topologyId = $scope.getCurrentTopoId();
                    var type = 'WHITELIST';
                    //if (vm.policyType === 'networklist') {
                    //    type = 'IP_RULE';
                    //}
                    Signature.cleanDeploy(type).then(function (data) {

                        var taskId = data.data.taskId;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {

                                Task.getTask(taskId, $rootScope.currentIp).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $scope.refreshDeployPanel();
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '清空已部署规则成功'
                                        });
                                        $timeout.cancel(checkDeploy);
                                        $state.go('rule.whitelist_manager.deploy', {tab: 'policyManagement'});
                                    } else if (data.data.state === 'FAILED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '清空已部署规则失败'
                                        });
                                        $timeout.cancel(checkDeploy);
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '清空部署规则超时'
                                        });
                                        $timeout.cancel(checkDeploy);
                                    }
                                });
                            }, 1000);
                        })(10);
                    }, function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '清空已部署规则失败'
                        });
                    });
                });

            };

            vm.showDetail = function (policyBlock) {
                var templateUrl = '/templates/rule/whitelist/policyContent.html';

                var ctrl = ['$scope', '$modalInstance', 'items', 'policyBlock', 'policy', function ($scope, $modalInstance, items, policyBlock, policy) {
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
                    $scope.deployedPolicy = policy.data.inUse;


                    $scope.changeAction = function (policy, action) {
                        policy.action = action;
                        if (policyBlock.type === 'SIGNATURE') {
                            Template.changeAction(policyBlock.policyBlockId, policy.signatureId, action).then(function () {
                            });
                        } else {
                            Signature.changeAction(policyBlock.policyBlockId, policy.ruleId, action).then(function () {
                            });
                        }
                    };

                    $scope.pageChanged = function () {
                        policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                            $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                    };

                    $scope.ok = function () {
                        $modalInstance.close('ok');
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }];
                if ($state.current.name.indexOf('networklist') !== -1) {
                    templateUrl = '/templates/rule/whitelist/ip-rule-policy-content.html';
                    ctrl = WhiteListService.showIpRuleDetailCtrl;
                }
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
                        policy: function () {
                            return Signature.getPolicyByPolicyId(policyId);
                        }
                    }
                });

                modalInstance.result.then(function () {
                });
            };

            vm.pageChanged = function () {
                getTableData();
            };


            //////////
            function getTableData() {
                var payload = {
                    '$skip': (vm.currentPage - 1) * vm.numPerPage,
                    '$limit': vm.numPerPage,
                    '$orderby': 'priority'
                };
                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }
                vm.policy = $scope.getDeployedPolicies();

                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload, 'WHITELIST').then(function (data) {
                    vm.table = data.data;
                });

                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload, 'WHITELIST').then(function (data) {
                    vm.totalNum = data.data || 0;
                });
            }

            function initializeDashboard() {
                //if (vm.policyType === 'whitelist_manager') {
                Dashboard.getRuleDeployedCount().then(function (data) {
                    vm.policyRuleDeployedCount = data.data.statsValue;
                });

                Dashboard.getWhiteListPolicyUpdateTime().then(function (data) {
                    vm.updateTime = data;
                });
                //} else {
                //    Dashboard.getIPRuleDeployedCount().then(function (data) {
                //        vm.policyRuleDeployedCount = data.data.statsValue;
                //    });
                //    Dashboard.getIPRulePolicyUpdateTime().then(function (data) {
                //        vm.updateTime = data;
                //    });
                //}

                Incident.getIncidentCount({'$filter': 'level ne INFO'}, true).then(function (data) {
                    vm.incidentCount = data;
                });
            }
        }
    }

    function policyManagementTable() {
        var policyManagementTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/whitelist/policy-management-table.html',
            controller: ['$scope', 'Signature', '$state', '$modal', '$rootScope', controller],
            controllerAs: 'policies',
            link: function () {
            }
        };
        return policyManagementTableObj;


        //////////
        function controller($scope, Signature, $state, $modal, $rootScope) {
            var vm = this;
            vm.ruleDeployed = false;
            //if ($state.current.name.indexOf('networklist') !== -1) {
            //    vm.policyType = 'networklist';
            //} else {
            vm.policyType = 'whitelist_manager';
            //}
            vm.currentPage = 1; //current page
            vm.numPerPage = 20; //max rows for data table
            vm.table = [];
            vm.showPolicyDetail = false;
            vm.selectAll = false;

            vm.createPolicy = function () {
                Signature.createPolicy().then(function (data) {
                    $state.go('rule.' + vm.policyType + '.editor', {
                        'policyId': data.data.value,
                        'tab': 'total'
                    });
                });
            };

            vm.viewDetail = function (policyId) {
                $state.go('rule.' + vm.policyType + '.policyDetail', {
                    policyId: policyId
                });
            };

            vm.deletePolicy = function (policyId) {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/whitelist/confirmDelete.html',
                    controller: function ($scope, $modalInstance, policyId) {
                        "ngInject";
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.delete = function () {
                            Signature.deletePolicySetByPolicyId(policyId).then(function (result) {
                                if (!result.message) {
                                    $state.reload().then(function () {
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '删除规则成功'
                                        });
                                    });
                                } else {
                                    $state.reload().then(function () {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '删除规则失败：' + result.message
                                        });
                                    });
                                }
                            }, function (data) {
                                $state.reload().then(function () {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '删除规则集失败：' + data.data.error
                                    });
                                });
                            });
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.msg = {
                            'title': '删除规则集',
                            'text': '删除规则集合，将同时删除此规则中所有的规则项，这个步骤无法还原。',
                            'qus': '确定删除规则集？',
                            'buttonText': '确定',
                            'fontAwesomeText': 'fa-check text-green icon-left',
                        };

                    },
                    size: 'sm',
                    resolve: {
                        policyId: function () {
                            return policyId;
                        }
                    }
                });


                modalInstance.result.then(function () {

                }, function () {
                });

            };

            vm.toggle = function () {
                for (var a = 0; a < vm.table.length; a++) {
                    vm.table[a].checked = vm.selectAll;
                }
            };

            getTableData();

            var onRefreshPolicy = $scope.$on('refreshPolicy', function () {
                getTableData();
            });
            $scope.$on('destroy', function () {
                onRefreshPolicy();
            });

            //////////


            function initializeDate(data) {
                if (data && data.length) {
                    for (var a = 0; a < data.length; a++) {
                        if (data[a].checked === undefined) {
                            data[a].checked = false;
                        }
                        vm.ruleDeployed = vm.ruleDeployed || data[a].inUse;
                    }
                }
                return data;
            }

            function getTableData() {
                var payload = {
                    offset: (vm.currentPage - 1) * vm.numPerPage,
                    limit: vm.numPerPage
                };

                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }
                vm.table = initializeDate($scope.allPolicies);
            }
        }
    }

    function policyDetailTable() {
        var policyDetailTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/whitelist/policy-detail-table.html',
            controller: ['$scope', '$modal', 'Signature', 'Template', '$stateParams', '$timeout', '$rootScope', 'Task', '$q', 'Device', 'Topology', 'CommonService', 'System', '$state', 'WhiteListService', controller],
            controllerAs: 'policyItem',
            link: function () {

            }
        };

        return policyDetailTableObj;


        function controller($scope, $modal, Signature, Template, $stateParams, $timeout, $rootScope, Task, $q, Device, Topology, CommonService, System, $state, WhiteListService) {
            var vm = this;
            vm.policyType = 'whitelist_manager';
            vm.currentPage = 1; //current page
            vm.numPerPage = 20; //max rows for data table
            vm.table = [];
            var policyId = $stateParams.policyId;

            var onRefreshPolicy = $scope.$on('refreshPolicy', function () {
                getTableData();
            });
            $scope.$on('destroy', function () {
                onRefreshPolicy();
            });

            vm.deploy = function () {

                var deviceNumber = 0;
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/whitelist/confirmDeploy.html',
                    controller: function ($scope, $modalInstance) {
                        "ngInject";
                        var isUpgrading;
                        //Topology.getDevices(topologyId, $rootScope.currentIp).then(function (Ddata) {
                        //     System.getDPIUpgradeInfo().then(function (upgradeData) {
                        //         isUpgrading = (upgradeData.data.filter(function (a) {
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
                         if (results[m][n].nodeProperty === 'SignatureONLY') {
                         for (var p = 0; p < Ddata.data.length; p++) {
                         if (Ddata.data[p].deviceId === results[m][n].deviceId) {
                         $scope.blacklistOnlyWarningDevicePool.push({
                         "name": Ddata.data[p].name,
                         "ports": results[m][n].ports
                         });
                         }
                         }
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
                        //     });
                        // });

                        $scope.ok = function () {
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

                    Signature.deploy(policyId).then(function (data) {
                        var taskId = data.data.taskId;
                        var deferred = $q.defer();
                        $rootScope.deployTaskPromise = deferred.promise;

                        $rootScope.deployTaskPromise.then(function (result) {
                            if (result === 'success') {
                                $state.go('rule.whitelist_manager.deploy', {'tab': 'deployedPanel'});
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

                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.rejectReason ? ('部署失败：' + data.data.rejectReason) : '部署失败')
                        });
                    });
                });
            };

            getTableData();

            vm.pageChanged = function () {
                getTableData();
            };

            vm.export = function (policyId) {
                var ruleType = '';
                if ($state.current.name.indexOf('networklist') !== -1) {
                    ruleType = 'IPRULES';
                } else {
                    ruleType = 'WHITELIST';
                }
                Signature.exportWhitelistTemplate(policyId, ruleType).then(function (data) {
                    window.open('./' + data, '_self');
                });
            };


            vm.showDetail = function (policyBlock) {
                var templateUrl = '/templates/rule/whitelist/policyContent.html';

                var ctrl = ['$scope', '$modalInstance', 'items', 'policyBlock', 'policy', function ($scope, $modalInstance, items, policyBlock, policy) {
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
                    $scope.deployedPolicy = policy.data.inUse;

                    $scope.changeRiskLevel = function (rule, lv) {
                        rule.riskLevel = lv;
                        Signature.changeRuleRiskLevel(rule.ruleId, rule.riskLevel).then(function (data) {
                            console.log(data);
                        });
                    };

                    $scope.changeAction = function (policy, action) {
                        policy.action = action;
                        if (policyBlock.type === 'SIGNATURE') {
                            Template.changeAction(policyBlock.policyBlockId, policy.signatureId, action).then(function () {
                            });
                        } else {
                            Signature.changeAction(policyBlock.policyBlockId, policy.ruleId, action).then(function () {
                            });
                        }
                    };

                    $scope.pageChanged = function () {
                        policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                            $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                    };

                    $scope.ok = function () {
                        $modalInstance.close('ok');
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }];
                if ($state.current.name.indexOf('networklist') !== -1) {
                    templateUrl = '/templates/rule/whitelist/ip-rule-policy-content.html';
                    ctrl = WhiteListService.showIpRuleDetailCtrl;
                }
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
                        policy: function () {
                            return Signature.getPolicyByPolicyId(policyId);
                        }
                    }
                });

                modalInstance.result.then(function () {
                });
            };


            function getTableData() {
                var payload = {
                    '$skip': (vm.currentPage - 1) * vm.numPerPage,
                    '$limit': vm.numPerPage
                };

                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }

                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload, 'WHITELIST').then(function (data) {
                    vm.table = data.data;
                });

                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload, 'WHITELIST').then(function (data) {
                    vm.totalNum = data.data || 0;
                });
            }

        }
    }

    function totalRuleBlockTable($state, Custom, $stateParams, $modal, Signature, WhiteListService, $rootScope, Template, dataservice, $q) {
        var obj = {
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/rule/whitelist/total-rule-block-table.html',
            link: link
        };
        return obj;
        function link(scope, element, attr, ctrl) {
            var vm = ctrl;
            vm.table = [];
            vm.blockCount = 0;
            vm.selectedBlockCount = 0;
            vm.selectedRuleCount = 0;
            vm.disableToolbar = true;
            vm.selectAllSigsText = '';
            //if ($state.current.name.indexOf('networklist') !== -1) {
            //    ctrl.policyType = 'IP_RULE';
            //} else {
            ctrl.policyType = 'WHITELIST';
            //}
            var policyId = $stateParams.policyId;
            ctrl.setConfig({
                name: 'signature',
                pagination: true,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
                fields: [],
                predicate: 'updatedAt',
                reverse: true
            });
            ctrl.disableSearch = true;
            scope.$on('updateLeftSelectAllStatus', function () {
                if (!vm.selectAllSigs) {
                    vm.selectAll = false;
                }
            });
            scope.$on('total', function () {
                var policyBlockIdList = [];
                var i,j;
                if (vm.selectAllSigs) {
                    var promises = [];
                    promises.push(Signature.getPolicyBlockbyPolicyId(policyId, 'NoDeploy', null, {'$limit': 10000, '$orderby': 'createdAt desc'}, ctrl.policyType));
                    promises.push(Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, {'$limit': 10000, '$orderby': 'createdAt desc'}, ctrl.policyType));
                    $q.all(promises).then(function (data) {
                        var isNoDeploy = data[0].data && data[0].data.length;
                        var isReadyDeploy = data[1].data && data[1].data.length;
                        var isExist = false;
                        if (isNoDeploy) {
                            for (i = 0; i < data[0].data.length; i++) {
                                if(isReadyDeploy){
                                    for(j = 0; j<data[1].data.length; j++){
                                        if(data[0].data[i].policyBlockId === data[1].data[j].sourceId){
                                            isExist = true;
                                            break;
                                        }
                                    }
                                }
                                if (!isExist){
                                    policyBlockIdList.push(data[0].data[i].policyBlockId);
                                }
                                isExist = false;
                            }
                            $rootScope.unlockPromise = Template.unlock(policyId, dataservice.policyName, policyBlockIdList, ctrl.policyType).then(function (data) {
                                for (var a = 0; a < vm.table.length; a++) {
                                    if (vm.table[a].checked && !vm.table[a].deployed) {
                                        vm.table[a].deployed = true;
                                    }
                                }
                                $rootScope.$broadcast('refreshPreDeployTable', data.data);
                            });
                        }
                    });
                } else {
                    for (var a = 0; a < vm.table.length; a++) {
                        if (vm.table[a].checked && !vm.table[a].deployed) {
                            policyBlockIdList.push(vm.table[a].policyBlockId);
                        }
                    }
                    if (policyBlockIdList.length > 0) {
                        $rootScope.unlockPromise = Template.unlock(policyId, dataservice.policyName, policyBlockIdList, ctrl.policyType).then(function (data) {
                            for (var a = 0; a < vm.table.length; a++) {
                                if (vm.table[a].checked && !vm.table[a].deployed) {
                                    vm.table[a].deployed = true;
                                }
                            }
                            $rootScope.$broadcast('refreshPreDeployTable', data.data);
                        });
                    }
                }
            });

            vm.toggle = function () {
                vm.selectedBlockCount = 0;
                vm.selectedRuleCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        vm.table[a].checked = vm.selectAll;
                        if (vm.selectAll) {
                            vm.selectedBlockCount++;
                            vm.selectedRuleCount += vm.table[a]['_rulesCount'];
                        }
                    }
                }
            };

            $rootScope.$on('refreshLeftTable', function () {
                ctrl.getTableData();
            });

            function getAll(params) {
                var payload = params || {};
                return Custom.getAll(policyId, 'NoDeploy', null, payload, ctrl.policyType);
            }

            function getCount(params) {
                var payload = params || {};
                return Custom.getCount(policyId, 'NoDeploy', null, payload, ctrl.policyType);
            }

            scope.getDateTime = function (s) {
                var d = new Date(s);
                return d.toLocaleString('en-GB');
            };

            ctrl.showDetail = function (policyBlock) {
                var templateUrl = '/templates/rule/whitelist/policyContent.html';
                var ctrl = WhiteListService.showWhiteListRuleDetailCtrl;
                if ($state.current.name.indexOf('networklist') !== -1) {
                    templateUrl = '/templates/rule/whitelist/ip-rule-policy-content.html';
                    ctrl = WhiteListService.showIpRuleDetailCtrl;
                }
                $modal.open({
                    templateUrl: templateUrl,
                    controller: ctrl,
                    size: 'lg',
                    backdrop:true,
                    resolve: {
                        items: function () {
                            return Signature.getRulesbyBlockId(policyBlock.policyBlockId);
                        },
                        policyBlock: function () {
                            return policyBlock;
                        },
                        policy: function () {
                            return Signature.getPolicyByPolicyId(policyId);
                        }
                    }
                });
            };

            vm.countSelected = function (signature) {
                if (signature.checked) {
                    vm.selectedBlockCount++;
                    vm.selectedRuleCount += signature['_rulesCount'];
                } else {
                    vm.selectedBlockCount--;
                    vm.selectedRuleCount -= signature['_rulesCount'];
                }
                var canSelectedCount = 0, selectedCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        canSelectedCount++;
                        if (vm.table[a].checked) {
                            selectedCount++;
                        }
                    }
                }
                var hasSelected = selectedCount > 0;
                var selectedAll = selectedCount === canSelectedCount;
                vm.selectAll = hasSelected ? (selectedAll ? true : null) : false;
            };

            vm.selectAllSignature = function () {
                vm.selectAllCheckBox = !vm.selectAllCheckBox;
                vm.selectAllSigs = !vm.selectAllSigs;
                vm.selectAllSigsText = vm.selectAllSigs ? '清除全部勾选' : '全选所有规则';
                vm.selectAll = vm.selectAllSigs;
                vm.selectedBlockCount = vm.selectAllSigs ? vm.totalNum : 0;
                vm.selectedRuleCount = vm.selectAllSigs ? vm.blockCount : 0;
                for (var a = 0; a < vm.table.length; a++) {
                    vm.table[a].checked = vm.selectAllSigs;
                }
            };

            vm.deleteWhiteList = function () {
                var selectedBlockId = [];
                for (var a = 0; a < vm.table.length; a++) {
                    if (vm.table[a].checked) {
                        selectedBlockId.push(vm.table[a].policyBlockId);
                    }
                }
                Signature.deleteBlocksByBlockIds(selectedBlockId).then(function (result) {
                    if (!result.message) {
                        $state.reload().then(function () {
                            $rootScope.addAlert({
                                type: 'success',
                                content: '删除规则成功'
                            });
                        });
                    } else {
                        $state.reload().then(function () {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '删除规则失败：' + result.message
                            });
                        });
                    }
                }, function (data) {
                    $state.reload().then(function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '删除规则集失败：' + data.data.error
                        });
                    });
                });
            };

            vm.selectAllSigsText = '全选所有规则';

            vm.getSource = function (s) {
                if (s === 'LEARN') {
                    return '学习';
                } else if (s === 'TEMPLATE') {
                    return '模版';
                } else {
                    return '自定义';
                }
            };

        }
    }
})();
