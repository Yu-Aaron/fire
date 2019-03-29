/**
 * Rule Sync Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.sync')
        .directive('syncIcResultTable', syncIcResultTable)
        .directive('syncIpResultTable', syncIpResultTable);

    function syncIcResultTable(SyncRules, topologyId) {
        var syncIcResultTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/rule/sync/syncIcResultTable.html',
            link: link
        };
        return syncIcResultTableObj;

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
                if (vm) {
                    vm.selectAllRules = true;
                    vm.selectAllRule();
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'priority';
                } else {
                    params['$orderby'] += ', priority';
                }
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'ruleType eq WHITELIST';
                } else {
                    params['$filter'] += ' and ruleType eq WHITELIST';
                }
                scope.params = params;
                return SyncRules.getSyncResult(topologyId.id, params).then(function (data) {
                    return data;
                });
            }

            function getCount(params) {
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'ruleType eq WHITELIST';
                } else {
                    params['$filter'] += ' and ruleType eq WHITELIST';
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

    function syncIpResultTable(SyncRules, topologyId) {
        var syncIpResultTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/rule/sync/syncIpResultTable.html',
            link: link
        };
        return syncIpResultTableObj;

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
                if (vm) {
                    vm.selectAllRules = true;
                    vm.selectAllRule();
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'priority';
                } else {
                    params['$orderby'] += ', priority';
                }
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'ruleType eq IPRULES';
                } else {
                    params['$filter'] += ' and ruleType eq IPRULES';
                }
                scope.params = params;
                return SyncRules.getSyncResult(topologyId.id, params).then(function (data) {
                    return data;
                });
            }

            function getCount(params) {
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'ruleType eq IPRULES';
                } else {
                    params['$filter'] += ' and ruleType eq IPRULES';
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
