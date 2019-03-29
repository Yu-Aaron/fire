/**
 * Report Event Directives
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_event')
        .directive('incidentReportTable', incidentReportTable)
        .directive('eventReportTable', eventReportTable);

    var numPerPage = 100;

    function incidentReportTable(Incident) {
        var incidentTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/report/event/incident-table.html',
            link: link
        };

        return incidentTableObj;

        //////////
        function link(scope, element, attr, ctrl) {

            var datapack = scope.incidentdata;
            ctrl.disableToolbar = true;

            ctrl.setConfig({
                name: 'incident',
                pagination: true,
                numPerPage: numPerPage,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount
            });
            function getAll(params) {
                var payload = {
                    $orderby: 'timestamp',
                    $limit: 10,
                    $filter: datapack.filter
                };
                if (params && params.$skip) {
                    payload.$skip = params.$skip;
                }
                if (params && params.$limit) {
                    payload.$limit = params.$limit;
                }
                return Incident.getAll(payload).then(function (data) {
                    data.map(function (d) {
                        d.action = d.action === 'DROP' ? '丢弃' : d.action === 'WARN' ? '警告' : d.action === 'ALERT' ? '警告' : d.action === 'REJECTBOTH' ? '阻断' : '';
                    });
                    setTimeout(function () {
                        datapack.data = data ? data : [];
                        datapack.currPage = scope.dtable.currentPage;
                        datapack.numPages = scope.dtable.numPages;
                    }, 10);
                    return data ? data : [];
                });
            }

            function getCount() {
                var payload = {
                    $orderby: 'timestamp',
                    $limit: numPerPage,
                    $filter: datapack.filter
                };
                return Incident.getCount(payload);
            }

        }
    }

    function eventReportTable(Event) {
        var eventTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/report/event/event-table.html',
            link: link
        };

        return eventTableObj;

        //////////
        function link(scope, element, attr, ctrl) {

            var datapack = scope.eventdata;
            ctrl.disableToolbar = true;

            ctrl.setConfig({
                name: 'event',
                pagination: true,
                numPerPage: numPerPage,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount
            });
            function getAll(params) {
                var payload = {
                    $orderby: 'timestamp',
                    $limit: 10,
                    $filter: datapack.filter
                };
                if (params && params.$skip) {
                    payload.$skip = params.$skip;
                }
                if (params && params.$limit) {
                    payload.$limit = params.$limit;
                }
                return Event.getAll(payload).then(function (data) {
                    data.map(function (d) {
                        d.action = d.action === 'REJECTBOTH' ? '阻断' : d.action === 'WARN' ? '警告' : d.action === 'ALERT' ? '警告' : d.action === 'DROP' ? '丢弃' : '';
                    });
                    setTimeout(function () {
                        datapack.data = data ? data : [];
                        datapack.currPage = scope.dtable.currentPage;
                        datapack.numPages = scope.dtable.numPages;
                    }, 10);
                    return data ? data : [];
                });
            }

            function getCount() {
                var payload = {
                    $orderby: 'timestamp',
                    $limit: numPerPage,
                    $filter: datapack.filter
                };
                return Event.getCount(payload);
            }

        }
    }

})();
