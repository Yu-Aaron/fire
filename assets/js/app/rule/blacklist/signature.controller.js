/**
 * blacklist Signature Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.blacklist')
        .controller('blacklistSignatureCtrl', ['$scope', 'Signature', '$state', '$rootScope', 'Dashboard', 'Enum', 'uiCtrl', 'UCD', 'uiTree', 'deployedPolicyArr', 'policiesArr', 'ruleService', function SignatureCtrl($scope, Signature, $state, $rootScope, Dashboard, Enum, uiCtrl, UCD, uiTree, deployedPolicyArr, policiesArr, ruleService) {
            //uiCtrl.findLand('BLACK_LIST', 1);
            var vm = this;
            vm.showDash = null;
            vm.tab = null;
            vm.deployedPanelCount = 0;
            vm.policyManagementCount = 0;
            vm.showUI = false;
            var deployedPolicy = {'blocks': []};
            var policies = [];

            //$scope.prefix_state = prefix_state;

            vm.contentEnable = function (target) {
                if(target === 'SIGNATURE_MANAGEMENT'){
                    return policiesArr.length > 0;
                }else if(target === 'DEPLOYED_BLACK_LIST'){
                    return deployedPolicyArr.length > 0;
                }
            };

            vm.createPolicy = function (tab) {
                Signature.createPolicy().then(function (data) {
                    $state.go('rule.blacklist.editor', {
                        'policyId': data.data.value,
                        'tab': tab
                    });
                });
            };

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
                Signature.getDeployedPolicy("BLACKLIST").then(function (data) {
                    if (data.data.length > 0) {
                        Dashboard.getSignatureDeployedCount().then(function (data) {
                            vm.deployedPanelCount = data.data.statsValue;
                        });
                    }
                });
                vm.policyManagementCount = 0;
                Signature.getPolicies("BLACKLIST").then(function (data) {
                    vm.policyManagementCount = data.data.length;
                });
            }

            /*topo.then(function (data) {
             if (data && data.topologyId) {
             vm.currentTopoId = data.topologyId;
             refreshBadge();
             }
             Signature.getPolicies("BLACKLIST").then(function (data) {
             vm.policyManagementCount = data.data.length;
             });

             });*/

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $state.previous = {};
                $state.previous.state = fromState.name;
                $state.previous.params = fromParams;
            });
            /*if (Enum.get('privilege')) {
             $scope.pv = Enum.get('privilege').filter(function (a) {
             return a.name === $rootScope.currentState;
             })[0].actionValue;
             vm.canEdit = (($scope.pv & 4) > 0);
             } else {
             $rootScope.$on('privilege', function () {
             $scope.pv = Enum.get('privilege').filter(function (a) {
             return a.name === $rootScope.currentState;
             })[0].actionValue;
             vm.canEdit = (($scope.pv & 4) > 0);
             });
             }*/
            vm.canEdit = true;
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
                    ruleService.createPolicy('blacklist', 'signatures');
                }
            } else {
                vm.showUI = true;
                vm.tab = "deployedPanel";
            }

            vm.getDeployedPolicy = function () {
                var policy = {};
                //topo.then(function () {
                //        if (vm.currentTopoId) {
                Signature.getDeployedPolicy('BLACKLIST')
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
                //    }
                //}
                //);
            };

            vm.getPolicies = function () {
                //topo.then(function () {
                //    if (vm.currentTopoId) {
                Signature.getPolicies("BLACKLIST").then(function (data) {
                    $scope.allPolicies = data.data;
                    $scope.$broadcast('refreshPolicy', data.data);
                });
                //    }
                //});
            };

            if (vm.tab === 'deployedPanel') {
                vm.getDeployedPolicy();
            } else if (vm.tab === 'policyManagement') {
                vm.getPolicies();
            }
            refreshBadge();
            //if there is no deployed policy, check if there is any undeployed policies, if none, redirect to add new policy page, otherwise, to policies list page
            vm.hasDeployedPolicy = true;
            if (deployedPolicyArr.length === 0) {
                vm.hasDeployedPolicy = false;
            }

        }])
        .controller('blacklistPolicyDetailCtrl', ['$scope', '$state', 'Signature', 'System', '$rootScope',function policyDetailCtrl($scope, $state, Signature, System, $rootScope) {
            var vm = this;
            var policyBlock = [];
            // vm.isDPIUpgrading = System.isDPIUpgrading();

            $rootScope.$on('refreshRuleCurrentIp', function () {
                $state.go('rule.whitelist_manager');
            });

            /*$rootScope.$on('dpiUpgradeState', function () {
             vm.isDPIUpgrading = System.isDPIUpgrading();
             });*/

            //var prefix_state = $rootScope.isJAXX ? 'vul' : 'rule';
            //$scope.prefix_state = prefix_state;

            $scope.getPolicy = function () {
                return vm.policy;
            };

            $scope.getPolicyBlock = function () {
                return policyBlock;
            };
            Signature.getPolicy($state.params.policyId)
                .then(function (data) {
                    vm.policy = data.data;
                    return Signature.getPolicyBlockbyPolicyId(data.data.policyId, 'ReadyDeploy', null, null);
                }).then(function (data) {
                policyBlock = data.data;
                $scope.$broadcast('refreshPolicy');
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $state.previous = {};
                $state.previous.state = fromState.name;
                $state.previous.params = fromParams;
            });

        }])
        .controller('blacklistEditorCtrl', ['$scope', '$timeout', '$state', 'localStorage', '$rootScope', 'Signature', '$log', '$interval', 'policiesArr',function editorCtrl($scope, $timeout, $state, localStorage, $rootScope, Signature, $log, $interval, policiesArr) {
            var vm = this;
            vm.hasPolicies = policiesArr.length > 0 ? true : false;

            if ($state.previous) {
                localStorage.setItem('previous', JSON.stringify($state.previous));
            } else {
                $state.previous = JSON.parse(localStorage.getItem('previous'));
            }

            // vm.previousState = $state.previous.state;
            // vm.previousParams = $state.previous.params;

            vm.goBack = function () {
                window.history.back();
            };

            /* vm.getTopologyId = function () {
             return $state.params.topologyId;
             };*/

            vm.getPolicyId = function () {
                return $state.params.policyId;
            };

            vm.refreshPreDeployTable = function (block) {
                $rootScope.$broadcast('refreshPreDeployTable', block);
            };

            vm.moveToPreDeployTable = function () {
                $scope.$broadcast($state.params.tab);
                $scope.$broadcast("updateLeftSelectAllStatus");
            };

        }]);


})();
