/**
 * Rule Malicious Domain Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.maliciousdomain')
        .directive('deployedTab', deployedTab)
        .directive('waitingTab', waitingTab);

    function deployedTab(Signature) {
        var deployedTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/rule/maliciousdomain/deployedTab.html',
            link: link
        };
        return deployedTabObj;

        function link(scope, element, attr, ctrl) {
            var fields = ['domainName'];
            ctrl.setConfig({
                name: 'rules',
                pagination: true,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                advancedSearch: 'maliciousdomains',
                advancedSearchOptions: [
                    {
                        'name': 'deployedTime',
                        'display': '部署时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'domainName', 'display': '域名', 'input': 'string', 'option': false, value: ""},
                    // We might need this in the future
                    // {'name': 'domainProtocolType', 'display': '协议名称', 'input': 'checkbox', 'option': true, value: -1, 'options': [{'value': -1, 'text': '全部'}, {'value': 'DNS', 'text': 'DNS'}, {'value': 'NETBIOS', 'text': 'NETBIOS'}]},
                    {
                        'name': 'action',
                        'display': '处理方式',
                        'input': 'checkbox',
                        'option': true,
                        value: -1,
                        'options': [{'value': -1, 'text': '全部'}, {'value': 'ALLOW', 'text': '允许'}, {
                            'value': 'ALERT',
                            'text': '警告'
                        }, {'value': 'DENY', 'text': '阻断'}]
                    }
                ]
            });

            var vm = ctrl;
            vm.table = [];
            vm.selectedDomainCount = 0;
            vm.selectAll = false;
            vm.selectAllDomains = false;
            vm.selectAllDomainsText = '';

            vm.selectAllDomain = function () {
                vm.selectAllDomains = !vm.selectAllDomains;
                vm.selectAllDomainsText = vm.selectAllDomains ? '清除全部勾选' : '全选所有规则';
                vm.selectAll = vm.selectAllDomains;
                vm.selectedDomainCount = vm.selectAllDomains ? vm.totalNum : 0;
                for (var a = 0; a < vm.table.length; a++) {
                    vm.table[a].checked = vm.selectAllDomains;
                }
            };

            vm.selectAllDomainsText = '全选所有规则';

            vm.countSelected = function (domain) {
                if (domain.checked) {
                    vm.selectedDomainCount++;
                } else {
                    vm.selectedDomainCount--;
                    vm.selectAll = false;
                }
            };

            vm.toggle = function () {
                vm.selectedDomainCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        vm.table[a].checked = vm.selectAll;
                        if (vm.selectAll) {
                            vm.selectedDomainCount++;
                        }
                    }
                }
            };

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'domainName';
                } else {
                    params['$orderby'] += ', domainName';
                }
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'deployStatus eq DEPLOYED';
                } else {
                    params['$filter'] += ' and deployStatus eq DEPLOYED';
                }
                scope.params = params;
                return Signature.getMaliciousDomains(params).then(function (data) {
                    if (!vm.selectAllDomains) {
                        vm.selectAll = false;
                        vm.selectedDomainCount = 0;
                    }
                    for (var i = 0; i < data.length; i++) {
                        var tmp = data[i];
                        if (vm) {
                            tmp.checked = vm.selectAllDomains;
                        }
                    }
                    return data;
                });
            }

            function getCount(params) {
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'deployStatus eq DEPLOYED';
                } else {
                    params['$filter'] += ' and deployStatus eq DEPLOYED';
                }
                var payload = params || {};
                return Signature.getMaliciousDomainCount(payload);
            }

            function search(params) {
                if (vm) {
                    vm.selectAllDomains = true;
                    vm.selectAllDomain();
                }
                return getAll(params);
            }
        }
    }

    function waitingTab(Signature) {
        var waitingTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/rule/maliciousdomain/waitingTab.html',
            link: link
        };
        return waitingTabObj;

        ////////

        function link(scope, element, attr, ctrl) {
            var fields = ['domainName'];
            ctrl.setConfig({
                name: 'rules',
                pagination: true,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                advancedSearch: 'maliciousdomains',
                advancedSearchOptions: [
                    {
                        'name': 'createdAt',
                        'display': '创建时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'domainName', 'display': '域名', 'input': 'string', 'option': false, value: ""},
                    // We might need this in the future
                    //{'name': 'domainProtocolType', 'display': '协议名称', 'input': 'checkbox', 'option': true, value: -1, 'options': [{'value': -1, 'text': '全部'}, {'value': 'DNS', 'text': 'DNS'}, {'value': 'NETBIOS', 'text': 'NETBIOS'}]},
                    {
                        'name': 'action',
                        'display': '处理方式',
                        'input': 'checkbox',
                        'option': true,
                        value: -1,
                        'options': [{'value': -1, 'text': '全部'}, {'value': 'ALLOW', 'text': '允许'}, {
                            'value': 'ALERT',
                            'text': '警告'
                        }, {'value': 'DENY', 'text': '阻断'}]
                    }
                ]
            });

            var vm = ctrl;
            vm.table = [];
            vm.selectedDomainCount = 0;
            vm.selectedActivatedDomainCount = 0;
            vm.selectAll = false;
            vm.selectAllDomains = false;
            vm.selectAllDomainsText = '';

            vm.selectAllDomain = function () {
                vm.selectAllDomains = !vm.selectAllDomains;
                vm.selectAllDomainsText = vm.selectAllDomains ? '清除全部勾选' : '全选所有规则';
                vm.selectAll = vm.selectAllDomains;
                vm.selectedDomainCount = vm.selectAllDomains ? vm.totalNum : 0;
                vm.selectedActivatedDomainCount = vm.selectAllDomains ? vm.totalNum : 0;
                for (var a = 0; a < vm.table.length; a++) {
                    vm.table[a].checked = vm.selectAllDomains;
                }
            };

            vm.selectAllDomainsText = '全选所有规则';

            vm.countSelected = function (domain) {
                if (domain.checked) {
                    vm.selectedDomainCount++;
                    if (domain.maliciousDomainStatus === 'ACTIVATED') {
                        vm.selectedActivatedDomainCount++;
                    }
                } else {
                    vm.selectedDomainCount--;
                    if (domain.maliciousDomainStatus === 'ACTIVATED') {
                        vm.selectedActivatedDomainCount--;
                    }
                    vm.selectAll = false;
                }
            };

            vm.toggle = function () {
                vm.selectedDomainCount = 0;
                vm.selectedActivatedDomainCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        vm.table[a].checked = vm.selectAll;
                        if (vm.selectAll) {
                            vm.selectedDomainCount++;
                            if (vm.table[a].maliciousDomainStatus === 'ACTIVATED') {
                                vm.selectedActivatedDomainCount++;
                            }
                        }
                    }
                }
            };

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'domainName';
                } else {
                    params['$orderby'] += ', domainName';
                }
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'deployStatus ne DEPLOYED';
                } else {
                    params['$filter'] += ' and deployStatus ne DEPLOYED';
                }
                scope.params = params;
                return Signature.getMaliciousDomains(params).then(function (data) {
                    if (!vm.selectAllDomains) {
                        vm.selectAll = false;
                        vm.selectedDomainCount = 0;
                    }
                    for (var i = 0; i < data.length; i++) {
                        var tmp = data[i];
                        if (vm) {
                            tmp.checked = vm.selectAllDomains;
                        }
                    }
                    return data;
                });
            }

            function getCount(params) {
                if (!params['$filter'] || params['$filter'] === '') {
                    params['$filter'] = 'deployStatus ne DEPLOYED';
                } else {
                    params['$filter'] += ' and deployStatus ne DEPLOYED';
                }
                var payload = params || {};
                return Signature.getMaliciousDomainCount(payload);
            }

            function search(params) {
                if (vm) {
                    vm.selectAllDomains = true;
                    vm.selectAllDomain();
                }
                return getAll(params);
            }
        }
    }

})();
