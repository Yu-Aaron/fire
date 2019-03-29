/**
 * blacklist blacklist Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.blacklist')
        // first two tabs
        .directive('blacklistDeployedTable', deployedTable)
        .directive('blacklistPolicyManagementTable', policyManagementTable)
        // policy detail page
        .directive('blacklistPolicyDetailTable', policyDetailTable);


    function deployedTable() {
        var deployedTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/blacklist/deployed-table.html',
            controller: controller,
            controllerAs: 'deployedPolicies',
            link: function () {

            }
        };

        return deployedTableObj;

        function controller($state, $scope, $modal, Signature, Template, Dashboard, Incident, $rootScope, $timeout, Task) {
            "ngInject";
            var vm = this;
            vm.currentPage = 1; //current page
            vm.numPerPage = 10; //max rows for data table
            vm.table = [];

            //getTableData();
            //var topologyId = $scope.getCurrentTopoId();
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

            $scope.createPolicy = function (tab) {
                //var topoId = topologyId;
                //if (topoId) {
                    Signature.createPolicy().then(function (data) {
                        $state.go('rule.blacklist.editor', {
                            //'topologyId': topoId,
                            'policyId': data.data.value,
                            'tab': tab
                        });
                    });
                //}
            };

            function ModalInstanceCtrl($scope, $modalInstance, items, policyBlock, policy) {
                //console.log(policyBlock);

                if (policyBlock.type === 'SIGNATURE') {
                    policyBlock.signatures = items.data;
                } else {
                    policyBlock.rules = items.data;
                }
                $scope.policyBlocks = policyBlock;
                $scope.deployedPolicy = policy.data.inUse;
                //console.log($scope.policyBlocks);

                $scope.changeAction = function (policy, action) {
                    //console.log(action);
                    //console.log(priority);
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
            }

            vm.cleanDeploy = function () {


               /* var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/confirmCleanDeploy.html',
                    controller: function ($scope, $modalInstance) {

                        // Topology.getDevices($rootScope.currentIp).then(function (Ddata) {
                            $scope.check = {
                                checkDisconnect: true
                            };
                            $scope.msg = {
                                'text': '清空已部署规则将会把系统还原至无规则部署的状态，这个步骤无法还原。',
                                'qus': '确定清空已部署规则？',
                                'buttonText': '清空已部署规则',
                                'fontAwesomeText': 'fa-times-circle-o',
                                'isShowDeviceConnectedCnt': 0,
                                'isShowDeviceDisconnectedMsg': false,
                                'isShowDeviceDisconnectedText': '规则将无法部署以下未连线设备：'
                            };
                        /!*$scope.deviceDisconnetedPool = [];

                            for (var k = 0; k < Ddata.data.length; k++) {
                                //console.log(data.data[i]);
                                if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                    //console.log(data.data[i].deviceOnline);
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
                            }*!/
                        // });

                        $scope.ok = function () {
                            // if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                            //     $modalInstance.dismiss('cancel');
                            // } else {
                                $modalInstance.close();
                            // }
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                    },
                    size: 'sm'
                });

                modalInstance.result.then(function () {*/
                    Signature.cleanDeploy("BLACKLIST").then(function (data) {
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
                                        $state.go('rule.blacklist', {tab: 'policyManagement'});
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
                                            content: '清空已部署规则超时'
                                        });
                                        $timeout.cancel(checkDeploy);
                                    }
                                });
                            }, 1000);
                        })(10);


                    }, function (data) {
                        console.log(data);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '清空已部署规则失败'
                        });
                    });
                /*}, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });*/

            };

            vm.showDetail = function (policyBlock) {
                //console.log(policyBlock);

                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/policyContent-signature.html',
                    controller: ['$scope', '$modalInstance', 'items', 'policyBlock', 'policy',ModalInstanceCtrl],
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
                        policy: function () {
                            return Signature.getPolicyByPolicyId(policyId);
                        }
                    }
                });

                modalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };

            vm.pageChanged = function () {
                getTableData();
            };
            $rootScope.$on('refreshRuleCurrentIp', function () {
                $state.reload();
            });

            //////////
            function getTableData() {
                var payload = {
                    '$skip': (vm.currentPage - 1) * vm.numPerPage,
                    '$limit': vm.numPerPage,
                    '$orderby': 'createdAt,priority,name'
                };
                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }
                vm.policy = $scope.getDeployedPolicies();

                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload).then(function (data) {
                    vm.table = data.data;
                });

                Signature.getPolicyBlockCountbyPolicyId(policyId, 'ReadyDeploy', null, null).then(function (data) {
                    vm.totalNum = data.data || 0;
                });
                //console.log(vm.policy);
            }

            function initializeDashboard() {
                //console.log(policyId);
                Dashboard.getRuleDeployedCount().then(function (data) {
                    vm.policyRuleDeployedCount = data.data.statsValue;
                });

                Dashboard.getSignatureDeployedCount().then(function (data) {
                    vm.policySignatueFixedCount = data.data.statsValue;
                });

                Dashboard.getBlackListPolicyUpdateTime().then(function (data) {
                    vm.updateTime = data;
                });

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
            templateUrl: '/templates/rule/blacklist/policy-management-table.html',
            controller: ['$rootScope', '$scope', 'Signature', '$modal', '$state',controller],
            controllerAs: 'policies',
            link: function () {
            }
        };
        return policyManagementTableObj;


        //////////
        function controller($rootScope, $scope, Signature, $modal, $state) {
            var vm = this;
            vm.ruleDeployed = false;
            vm.currentPage = 1; //current page
            vm.numPerPage = 20; //max rows for data table
            vm.table = [];
            vm.showPolicyDetail = false;
            vm.selectAll = false;

            vm.createPolicy = function () {
                //var topoId = $scope.getCurrentTopoId();
                //if (topoId) {
                    Signature.createPolicy().then(function (data) {
                        $state.go('rule.blacklist.editor', {
                            'policyId': data.data.value,
                            'tab': 'signatures'
                        });
                    });
                //}
            };

            vm.deletePolicy = function (policyId) {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/confirmDelete.html',
                    controller: function ($scope, $modalInstance, policyId) {
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.delete = function () {
                            var results = [];
                            Signature.deletePolicySetByPolicyId(policyId).then(function(r4){
                                results.push(r4);
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
                                            content: '删除漏洞集成功'
                                        });
                                    });
                                } else {
                                    $state.reload().then(function () {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '删除漏洞集失败：' + updateError
                                        });
                                    });
                                }
                            }, function(data){
                                $state.reload().then(function () {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '删除漏洞集失败：' + data.data.error
                                    });
                                });
                            });
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.msg = {
                            'title': '删除漏洞集',
                            'text': '删除漏洞集合，将同时删除此集合中所有的漏洞，这个步骤无法还原。',
                            'qus': '确定删除漏洞集？',
                            'buttonText': '确定',
                            'fontAwesomeText': 'fa-check text-green icon-left',
                        };

                    },
                    size: 'sm',
                    resolve: {
                        policyId : function(){return policyId;}
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
            templateUrl: '/templates/rule/blacklist/policy-detail-table.html',
            controller: controller,
            controllerAs: 'policyItem',
            link: function () {

            }
        };

        return policyDetailTableObj;


        function controller($scope, $modal, Signature, Template, $stateParams, $timeout, $rootScope, Task, $q, CommonService, System, $state) {
            "ngInject";
            var vm = this;
            vm.currentPage = 1; //current page
            vm.numPerPage = 20; //max rows for data table
            vm.table = [];
            var policyId = $stateParams.policyId;
            // var topologyId = $stateParams.topologyId;

            var onRefreshPolicy = $scope.$on('refreshPolicy', function () {
                getTableData();
            });
            $scope.$on('destroy', function () {
                onRefreshPolicy();
            });

            vm.deploy = function () {
                var deviceNumber = 0;
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/confirmDeploy.html',
                    controller: function ($scope, $modalInstance) {
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
                        // $rootScope.addAlert({type: 'success',content: 'n条类似规则已合并，规则部署完成。'});


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

            getTableData();

            vm.pageChanged = function () {
                getTableData();
            };

            function ModalInstanceCtrl($scope, $modalInstance, items, policyBlock, policy) {
                if (policyBlock.type === 'SIGNATURE') {
                    policyBlock.signatures = items.data;
                } else {
                    policyBlock.rules = items.data;
                }
                $scope.policyBlocks = policyBlock;
                $scope.deployedPolicy = policy.data.inUse;
                //console.log($scope.policyBlocks);

                $scope.changeAction = function (policy, action) {
                    //console.log(action);
                    //console.log(priority);
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
            }

            vm.showDetail = function (policyBlock) {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/policyContent-signature.html',
                    controller: ['$scope', '$modalInstance', 'items', 'policyBlock', 'policy',ModalInstanceCtrl],
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
                        policy: function () {
                            return Signature.getPolicyByPolicyId(policyId);
                        }
                    }
                });

                modalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };


            function getTableData() {
                var payload = {
                    '$skip': (vm.currentPage - 1) * vm.numPerPage,
                    '$limit': vm.numPerPage,
                    '$orderby': 'createdAt,priority,name'
                };

                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }

                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, payload).then(function (data) {
                    vm.table = data.data;
                });

                Signature.getPolicyBlockCountbyPolicyId(policyId, 'ReadyDeploy').then(function (data) {
                    vm.totalNum = data.data || 0;
                });
            }

        }
    }
})();
