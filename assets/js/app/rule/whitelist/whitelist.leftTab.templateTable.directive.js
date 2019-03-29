/**
 * Monitor Signatrue left side 4 tab: templateTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        .directive('templateTable', templateTable);


    function templateTable($stateParams, $modal, Signature, Template, dataservice, $rootScope, $state, WhiteListService) {
        var templateTableObj = {
            restrict: 'E',
//      scope: {
//        topologyId: '=',
//        policyId: '=',
//        move: '&'
//      },
            scope: false,
            require: '^dtable',
            templateUrl: '/templates/rule/whitelist/template-table.html',
//      controllerAs: 'templates',
//      controller: controller,
            link: linker
        };

        return templateTableObj;

        //////////

        function linker(scope, element, attr, ctrl) {
            var $scope = scope;
            var vm = ctrl;

            if ($state.current.name.indexOf('networklist') !== -1) {
                vm.protocolType = 'networklist';
            } else {
                vm.protocolType = 'whitelist';
            }
            vm.currentPage = 1; //current page
            vm.numPerPage = 10; //max rows for data table
            vm.table = [];
            vm.updateNumPerPage = function () {
                console.log(vm.numPerPage);
            };
            vm.blockCount = 0;
            vm.selectedBlockCount = 0;
            vm.selectedRuleCount = 0;

            $rootScope.$on('refreshLeftTable', function () {
                vm.refresh();
            });

            scope.$on('updateLeftSelectAllStatus', function () {
                if(!vm.selectAllSigs){
                    vm.selectAll = false;
                }
            });
            var policyId = $stateParams.policyId;

            $scope.$on('templates', function () {
                var policyBlockIdList = [];

                for (var a = 0; a < vm.table.length; a++) {
                    if (vm.table[a].checked && !vm.table[a].deployed) {
                        //console.log(vm.table[a].policyBlockId);
                        //var policyBlockId = vm.table[a].policyBlockId;
                        policyBlockIdList.push(vm.table[a].policyBlockId);
                    }
                }
                if (policyBlockIdList.length > 0) {
                    var type = 'WHITELIST';
                    if (vm.protocolType === 'networklist') {
                        type = 'IP_RULE';
                    }
                    $rootScope.unlockPromise = Template.unlock(policyId, dataservice.policyName, policyBlockIdList, type).then(function (data) {
                        //console.log(data.data);
                        for (var a = 0; a < vm.table.length; a++) {
                            if (vm.table[a].checked && !vm.table[a].deployed) {
                                vm.table[a].deployed = true;
                            }
                        }
                        $rootScope.$broadcast('refreshPreDeployTable', data.data);
                    });
                }
            });

            vm.countSelected = function (signature) {
                //console.log(signature);
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


            angular.element('input.template').bind('change', function (event) {
                var tmp = event.target.files[0];
                if (!tmp) {
                    return;
                }
                var file = tmp;
                var ruleType = 'WHITELIST';
                if (vm.protocolType === 'networklist') {
                    ruleType = 'IPRULES';
                }
                vm.uploadTemplate(file, ruleType);
                this.value = null;
            });



            vm.showDetail = function (policyBlock) {
                var templateUrl = '/templates/rule/whitelist/policyContent.html';
                var ctrl = ['$scope', '$modalInstance', 'items', 'policyBlock',function ($scope, $modalInstance, items, policyBlock) {
                    $scope.rulePagination = {
                        currentPage : 1,
                        numPerPage : 5,
                        totalNum : 0
                    };
                    $scope.rulePagination.totalNum = items.data.length;
                    $scope.rulePagination.numPages = parseInt($scope.rulePagination.totalNum/$scope.rulePagination.numPerPage);

                    if (policyBlock.type === 'SIGNATURE') {
                        console.log('this is a signature');
                    } else {
                        policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                            $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                    }
                    $scope.policyBlocks = policyBlock;

                    $scope.changeAction = function (policy, action) {
                        console.log(policy);
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

                    $scope.pageChanged = function () {
                        policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                            $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
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
                }];
                if (vm.protocolType === 'networklist') {
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

            vm.uploadTemplate = function (file, type) {
                $scope.uploadTemplatePromise = Template.uploadTemplate(file, type)
                    .then(function (data) {
                        data = data.data;
                        if (data.error && data.error.length > 0) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: ('上传失败: ' + data.error)
                            });
                        } else {
//              getTableData();
                            vm.refresh();
                            $rootScope.addAlert({
                                type: 'success',
                                content: ('上传成功')
                            });
                        }
                    }, function (data) {
                        data = data.data;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: ('上传失败: ' + (data.error ? (': ' + data.error) : ''))
                        });
                    });
            };

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

            function initializeData(blocks, callback) {
                Signature.getPolicyBlockbyPolicyId(policyId, 'ReadyDeploy', null, null, 'WHITELIST').then(function (data) {
                    vm.blockCount = 0;
                    vm.selectedBlockCount = 0;
                    vm.selectedRuleCount = 0;
                    vm.selectAll = false;
                    for (var a = blocks.length - 1; a >= 0; a--) {
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


            //getTableData();

            function getTableData() {
                var payload = {
                    offset: (vm.currentPage - 1) * vm.numPerPage,
                    limit: vm.numPerPage
                };

                if (vm.predicate) {
                    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
                }
                var type = 'WHITELIST';
                if (vm.protocolType === 'networklist') {
                    type = 'IP_RULE';
                }
                Signature.getPolicyBlockbyPolicyId(policyId, 'NoDeploy', 'template', {'$orderby': 'policyBlockSource desc, priority, createdAt desc'}, type).then(function (data) {
                    initializeData(data.data, function (blocks) {
                        vm.tableAll = blocks;
                    });
                });
            }

            ctrl.setConfig({
                name: 'template',
                pagination: true,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
                fields: [],
                predicate: 'updatedAt',
                reverse: true
            });
            ctrl.disableToolbar = true;

            function getAll(params) {
                getTableData();

                var type = 'WHITELIST';
                if (vm.protocolType === 'networklist') {
                    type = 'IP_RULE';
                }
                var payloads = params || {};
                if (!payloads['$orderby'] || payloads['$orderby'] === '') {
                    payloads['$orderby'] = 'policyBlockSource desc, priority, updatedAt desc';
                } else {
                    payloads['$orderby'] += ', policyBlockSource desc, priority';
                }
                return Signature.getPolicyBlockbyPolicyId(policyId, 'NoDeploy', 'template', payloads, type).then(function (data) {
                    return data.data;
                });
            }

            function getCount(params) {
                var type = 'WHITELIST';
                if (vm.protocolType === 'networklist') {
                    type = 'IP_RULE';
                }
                var payloads = params || {};
                /*return Signature.getPolicyBlockbyPolicyId(topologyId, policyId, 'NoDeploy', 'template', payloads, type).then(function (data) {
                    return data.data.length;
                });*/
                return Signature.getPolicyBlockbyPolicyId(policyId, 'NoDeploy', 'template', payloads, type).then(function (data) {
                    return data.data.length;
                });
            }
        }
    }

})();
