/**
 * Record Table Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.record')
        .directive('recordTable', recordTable);

    function recordTable(Record) {
        var recordTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            require: '^dtable',
            templateUrl: '/templates/record/record-table.html',
            link: link
        };

        return recordTableObj;

        ////////////////////
        function link(scope, element, attr, ctrl) {

            var fields = ['logname', 'createdAt'];

            ctrl.setConfig({
                name: '条记录',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                dateTimeRange: 'createdAt'
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'createdAt desc';
                }
                return Record.getBackupLogs(params).then(function (data) {
                    return data;
                });
            }

            function getCount(params) {
                return Record.getBackupLogsCount(params).then(function (data) {
                    return data;
                });
            }

            function search(params) {
                //return 'search';
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'createdAt desc';
                }
                return Record.getBackupLogs(params).then(function (data) {
                    return data;
                });
            }

            scope.refreshTable = function () {
                ctrl.getTableData();
            };
        }
    }
})();
