///**
// * Report Protocol Directives
// *
// * Description
// */
//(function () {
//    'use strict';
//
//    angular
//        .module('southWest.report.protocol')
//        .directive('protocolReportTable', protocolReportTable);
//
//    var numPerPage = 100;
//
//    function protocolReportTable(Audit) {
//        var protocolReportTableObj = {
//            scope: false,
//            restrict: 'E',
//            require: '^dtable',
//            replace: true,
//            templateUrl: '/templates/report/protocol/protocol-report.html',
//            link: link
//        };
//
//        return protocolReportTableObj;
//
//        //////////
//        function link(scope, element, attr, ctrl) {
//
//            var datapack = scope.protocoldata;
//            ctrl.disableToolbar = true;
//            ctrl.advancedSearch = false;
//
//            ctrl.setConfig({
//                name: 'audit',
//                pagination: true,
//                numPerPage: numPerPage,
//                scrollable: false,
//                totalCount: true,
//                getAll: getAll,
//                getCount: getCount
//            });
//            function getAll(params) {
//                var payload = {
//                    $orderby: 'packetTimestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                if (params && params.$skip) {
//                    payload.$skip = params.$skip;
//                }
//                if (params && params.$limit) {
//                    payload.$limit = params.$limit;
//                }
//                return Audit.getAllByTime(payload, scope.searchTime.start, scope.searchTime.end).then(function (data) {
//                    var restringMap = {
//                        modbus: 'Modbus',
//                        profinetio: 'Profinetio',
//                        telnet: 'Telnet'
//                    };
//                    data.map(function (d) {
//                        d.flowTimestamp = new Date(d.flowTimestamp || d.packetTimestamp);
//                        d.protocolSourceName = restringMap[d.protocolSourceName] || d.protocolSourceName.toUpperCase();
//                        switch (d.protocolSourceName) {
//                            case "PNRTDCP":
//                            case "GOOSE":
//                            case "SV":
//                                d.sourcePort = "";
//                                d.destinationPort = "";
//                                break;
//                        }
//                    });
//                    setTimeout(function () {
//                        datapack.data = data ? data : [];
//                        datapack.currPage = scope.dtable.currentPage;
//                        datapack.numPages = scope.dtable.numPages;
//                    }, 10);
//                    return data ? data : [];
//                });
//            }
//
//            function getCount() {
//                var payload = {
//                    $orderby: 'packetTimestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                return Audit.getCountByTime(payload, scope.searchTime.start, scope.searchTime.end);
//            }
//
//        }
//    }
//})();
