/**
 * Monitor Signatrue left side 4 tab: learningTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        // edit page left 4 tabs table
        .directive('learningTable', learningTable);

    function learningTable() {
        var templateTableObj = {
            restrict: 'E',
            scope: {
                policyId: '=',
                task: '=',
                move: '&',
                learningType: '=',
                checkbox: '=',
                count: '=',
            },
            templateUrl: '/templates/rule/whitelist/learning-table.html',
            controllerAs: 'learnings',
            controller: controller,
            link: function () {

            }
        };

        return templateTableObj;

        //////////

        function controller($scope, Learning, $modal, Signature, Template, dataservice, $rootScope, System, $state, WhiteListService) {
            "ngInject";// jshint ignore:line
            var vm = this;
            vm.currentPage = 1; //current page
            vm.numPerPage = 20; //max rows for data table
            vm.table = [];
            vm.enableUploadTemplate = false;
            vm.blockCount = 0;
            vm.selectedBlockCount = 0;
            vm.selectedRuleCount = 0;
            vm.task = {};
            vm.isDPIUpgrading = false;
            vm.learningType = $scope.learningType;

            $rootScope.$on('refreshLeftTable', function () {
                getTableData();
            });

            $scope.$on('updateLeftSelectAllStatus', function () {
                if(!vm.selectAllSigs){
                    vm.selectAll = false;
                }
            });

            vm.updateNumPerPage = function () {
                console.log(vm.numPerPage);
            };


            var policyId = $scope.policyId();

            //var policyId = $scope.policyId();
            var task = $scope.task();

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

            vm.countSelected = function (learning) {
                //console.log(learning);
                if (learning.checked) {
                    vm.selectedBlockCount++;
                    vm.selectedRuleCount += learning['_rulesCount'];
                    var count = 0;
                    for (var i = 0; i < vm.table.length; i++) {
                        count += (vm.table[i].deployed || vm.table[i].checked) ? 1 : 0;
                    }
                    vm.selectAll = (count === vm.table.length);
                } else {
                    vm.selectedBlockCount--;
                    vm.selectedRuleCount -= learning['_rulesCount'];
                    vm.selectAll = false;
                }
            };

            var onLearning = $scope.$on('learning', function () {
                var policyBlockIdList = [];
                for (var a = 0; a < vm.table.length; a++) {
                    if (vm.table[a].checked && !vm.table[a].deployed) {
                        policyBlockIdList.push(vm.table[a].policyBlockId);
                    }
                }
                if (policyBlockIdList.length > 0) {
                    $rootScope.unlockPromise = Template.unlock(policyId, dataservice.policyName, policyBlockIdList, vm.learningType).then(function (data) {
                        for (var a = 0; a < vm.table.length; a++) {
                            if (vm.table[a].checked && !vm.table[a].deployed) {
                                vm.table[a].deployed = true;
                            }
                        }
                        return $scope.move({
                            'block': data.data
                        });
                    });
                }
            });

            function initializeData(blocks, callback) {
                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, null, 'WHITELIST').then(function (data) {
                    vm.blockCount = 0;
                    vm.selectedBlockCount = 0;
                    vm.selectedRuleCount = 0;
                    vm.selectAll = false;
                    for (var a = 0; a < blocks.length; a++) {
                        blocks[a].checked = false;
                        vm.blockCount += blocks[a]['_rulesCount'];
                        for (var b = 0; b < data.data.length; b++) {
                            if (blocks[a].policyBlockId === data.data[b].sourceId) {
                                blocks[a].deployed = true;
                            }
                        }
                    }
                    if (callback) {
                        callback(blocks);
                    }
                });
            }

            var ModalInstanceCtrl = function ($scope, $modalInstance, items, policyBlock) {
                "ngInject";// jshint ignore:line

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
                    for (var i = 0; i < items.data.length; i++) {
                        if (items.data[i].fields.length > 1) {
                            if (items.data[i].fields[0].name === "协议") {
                                continue;
                            }
                            else {
                                var protocolIndex = 0;
                                for (var j = 1; j < items.data[i].fields.length; i++) {
                                    if (items.data[i].fields[j].name === "协议") {
                                        protocolIndex = j;
                                        break;
                                    }
                                }
                                var protocolItem = items.data[i].fields.splice(protocolIndex, 1)[0];
                                items.data[i].fields.splice(0, 0, protocolItem);

                            }
                        }
                    }
                    policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                        $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                }
                $scope.policyBlocks = policyBlock;

                $scope.changeRiskLevel = function (rule, lv) {
                    rule.riskLevel = lv;
                    Signature.changeRuleRiskLevel(rule.ruleId, rule.riskLevel).then(function (data) {
                        console.log(data);
                    });
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

            };
            vm.showDetail = function (policyBlock) {
                var templateUrl = '/templates/rule/whitelist/policyContent.html';
                var ctrl = ModalInstanceCtrl;
                if ($scope.learningType === 'IP_RULE') {
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

                modalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };

            var onRefreshTask = $scope.$on('refreshTask', function () {
                $scope.task().then(function (data) {
                    vm.task = data.data;
                    $rootScope.disableDeploy = false;
                    if (vm.task.state === 'PROCESSING' || vm.task.state === 'PAUSED') {
                        $rootScope.disableDeploy = true;
                    }
                });
            });

            var onRefreshLearningTable = $scope.$on('refreshLearningTable', function () {
                getTableData();
            });

            $scope.$on('destroy', function () {
                onLearning();
                onRefreshTask();
                onRefreshLearningTable();
            });

            getTableData();

            function getTableData() {
                var payload = {
                    offset: (vm.currentPage - 1) * vm.numPerPage,
                    limit: vm.numPerPage
                };

                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }

                task.then(function (data) {
                    var url_index = 0;
                    if ($scope.learningType === 'IP_RULE') {
                        url_index = 1;
                    }
                    Learning.getLearningBlocksByRef(data.data['_resultRef'].baseUrls[url_index]).then(function (data) {
                        $scope.count = data.data.length;
                        initializeData(data.data, function (blocks) {
                            vm.table = blocks;
                        });
                    });

                });
            }
        }
    }
})();
