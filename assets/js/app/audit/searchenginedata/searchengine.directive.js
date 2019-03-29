/**
 * Monitor Audit Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.searchenginedata')
        .directive('searchEngineTable', SearchEngineTable);

    function SearchEngineTable($q, Audit, $modal, $log) {
        var auditTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/audit/searchenginedata/searchengine.html',
            link: link
        };

        return auditTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var fields = ['usrIp', 'usrMac', 'searchName', 'searchContent', 'searchTimestamp'];

            setConfig();

            function setConfig() {
                var advancedSearchOptions = [
                    {
                        'name': 'searchTimestamp',
                        'display': '日期',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'usrIp', 'display': 'IP地址', 'input': 'ipAdress', 'option': false, value: ""},
                    {'name': 'usrMac', 'display': 'MAC地址', 'input': 'macAdress', 'option': false, value: ""},
                    {'name': 'searchContent', 'display': '搜索内容', 'input': 'string', 'option': false, value: ""},
                    {'name': 'searchName', 'display': '搜索引擎', 'input': 'string', 'option': false, value: ""}
                ];

                var config = {
                    name: 'audit',
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    fields: fields,
//                    dateTimeRange: 'timestamp',
                    advancedSearch: 'searchengine'
                };
                ctrl.query = ctrl.isSearching = ctrl.advancedSearchQuery = "";
                angular.extend(config, {
                    advancedSearchOptions: advancedSearchOptions,
                    disabledTimeOptions: true
                });
                ctrl.setConfig(config);
            }

            function getCount(params) {
                //var hasAdvanceSearch = ctrl.advancedSearchQuery !== '' || ctrl.query !== '';

                return Audit.getSearchengineCount(params);
            }

            function search(params) {
                scope.params = params;
                return getAll(params);
            }

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'searchTimestamp desc';
                }
                //var hasAdvanceSearch = ctrl.advancedSearchQuery !== '' || ctrl.query !== '';

                scope.params = params;
                //console.log(params);

                return Audit.getSearchengineAll(params).then(function (searchdata) {
                    return searchdata;
                });
            }

            scope.openExportPanel = function (flag) {
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        var regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*(_|[^\w])).+$/g;
                        return psw && psw.match(regex) && psw.length >= 8;
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$orderby'] = "searchTimestamp desc";
                        Audit.getSearchengineExport(p, psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }
    }
})();
