/**
 * Rule Sync Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.ipmacsync')
        .directive('syncIpmacResultTable', syncIpmacResultTable);

    function syncIpmacResultTable(SyncRules, topologyId) {
        var syncIpmacResultTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/rule/ipmacsync/syncIpmacResultTable.html',
            link: link
        };
        return syncIpmacResultTableObj;

        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'rules',
                pagination: true,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            var vm = ctrl;
            vm.table = [];
            vm.selectedRuleCount = 0;
            vm.selectAll = false;
            vm.selectAllRules = false;
            vm.selectAllRulesText = '';

            vm.selectAllRule = function () {
                vm.selectAllRules = !vm.selectAllRules;
                vm.selectAllRulesText = vm.selectAllRules ? '清除全部勾选' : '全选所有规则';
                vm.selectAll = vm.selectAllRules;
                vm.selectedRuleCount = vm.selectAllRules ? vm.totalNum : 0;
                for (var a = 0; a < vm.table.length; a++) {
                    vm.table[a].checked = vm.selectAllRules;
                }
            };

            vm.selectAllRulesText = '全选所有规则';

            vm.countSelected = function (domain) {
                if (domain.checked) {
                    vm.selectedRuleCount++;
                } else {
                    vm.selectedRuleCount--;
                    vm.selectAll = false;
                }
            };

            vm.toggle = function () {
                vm.selectedRuleCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        vm.table[a].checked = vm.selectAll;
                        if (vm.selectAll) {
                            vm.selectedRuleCount++;
                        }
                    }
                }
            };

            function getAll(params) {

                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'priority';
                } else {
                    params['$orderby'] += ', priority';
                }
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'ruleType eq IPMAC';
                } else {
                    params['$filter'] += ' and ruleType eq IPMAC';
                }
                scope.params = params;
                return SyncRules.getSyncResult(topologyId.id, params).then(function (data) {
                    if (!vm.selectAllRules) {
                        vm.selectAll = false;
                        vm.selectedDomainCount = 0;
                    }
                    for (var i = 0; i < data.length; i++) {
                        var tmp = data[i];
                        if (vm) {
                            tmp.checked = vm.selectAllRules;
                        }
                    }
                    return data;
                });
            }

            function getCount(params) {
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'ruleType eq IPMAC';
                } else {
                    params['$filter'] += ' and ruleType eq IPMAC';
                }
                var payload = params || {};
                return SyncRules.getSyncResultCount(topologyId.id, payload);
            }

            function search(params) {
                if (vm) {
                    vm.selectAllRules = true;
                    vm.selectAllRule();
                }
                return getAll(params);
            }
        }
    }

})();
