///**
// * Report Logger Directives
// *
// * Description
// */
//(function () {
//    'use strict';
//
//    angular
//        .module('southWest.report.logger')
//        .directive('allLogs', allLogs)
//        .directive('consoleLoginLogs', consoleLoginLogs)
//        .directive('consoleLogs', consoleLogs)
//        .directive('loginLogs', loginLogs)
//        .directive('cmdLogs', cmdLogs);
//
//    var numPerPage = 100;
//
//    function allLogs(Logger) {
//        var allLogsTableObj = {
//            scope: false,
//            restrict: 'E',
//            require: '^dtable',
//            replace: true,
//            templateUrl: '/templates/report/logger/allLogs.html',
//            link: link
//        };
//
//        return allLogsTableObj;
//
//        //////////
//        function link(scope, element, attr, ctrl) {
//
//            var datapack = scope.alldata;
//            ctrl.disableToolbar = true;
//
//            ctrl.setConfig({
//                name: 'log',
//                pagination: true,
//                numPerPage: numPerPage,
//                scrollable: false,
//                totalCount: true,
//                getAll: getAll,
//                getCount: getCount
//            });
//            function getAll(params) {
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                if (params && params.$skip) {
//                    payload.$skip = params.$skip;
//                }
//                if (params && params.$limit) {
//                    payload.$limit = params.$limit;
//                }
//                return Logger.getAll(payload).then(function (data) {
//                    data.map(function (d) {
//                        d.timestamp = new Date(d.timestamp);
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
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                return Logger.getCount(payload);
//            }
//
//        }
//    }
//
//    function consoleLoginLogs(Logger) {
//
//        var consoleLoginLogsTableObj = {
//            scope: false,
//            restrict: 'E',
//            require: '^dtable',
//            replace: true,
//            templateUrl: '/templates/report/logger/consoleLoginLogs.html',
//            link: link
//        };
//
//        return consoleLoginLogsTableObj;
//
//        function link(scope, element, attr, ctrl) {
//            var datapack = scope.consolelogindata;
//            ctrl.disableToolbar = true;
//
//            ctrl.setConfig({
//                name: 'log',
//                pagination: true,
//                numPerPage: numPerPage,
//                scrollable: false,
//                totalCount: true,
//                getAll: getAll,
//                getCount: getCount
//            });
//            function getAll(params) {
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                if (params && params.$skip) {
//                    payload.$skip = params.$skip;
//                }
//                if (params && params.$limit) {
//                    payload.$limit = params.$limit;
//                }
//                return Logger.getAll(payload).then(function (data) {
//                    data.map(function (d) {
//                        d.timestamp = new Date(d.timestamp);
//                    });
//
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
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                return Logger.getCount(payload);
//            }
//
//        }
//    }
//
//    function consoleLogs(Logger) {
//
//        var consoleLogsTableObj = {
//            scope: false,
//            restrict: 'E',
//            require: '^dtable',
//            replace: true,
//            templateUrl: '/templates/report/logger/consoleLogs.html',
//            link: link
//        };
//
//        return consoleLogsTableObj;
//
//        //////////
//        function link(scope, element, attr, ctrl) {
//            var datapack = scope.consoledata;
//            ctrl.disableToolbar = true;
//
//            ctrl.setConfig({
//                name: 'log',
//                pagination: true,
//                numPerPage: numPerPage,
//                scrollable: false,
//                totalCount: true,
//                getAll: getAll,
//                getCount: getCount
//            });
//            function getAll(params) {
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                if (params && params.$skip) {
//                    payload.$skip = params.$skip;
//                }
//                if (params && params.$limit) {
//                    payload.$limit = params.$limit;
//                }
//                return Logger.getAll(payload).then(function (data) {
//                    data.map(function (d) {
//                        d.timestamp = new Date(d.timestamp);
//                    });
//
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
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                return Logger.getCount(payload);
//            }
//
//        }
//    }
//
//    function loginLogs(Logger) {
//        var loginLogsTableObj = {
//            scope: false,
//            restrict: 'E',
//            require: '^dtable',
//            replace: true,
//            templateUrl: '/templates/report/logger/loginLogs.html',
//            link: link
//        };
//
//        return loginLogsTableObj;
//
//        //////////
//        function link(scope, element, attr, ctrl) {
//
//            var datapack = scope.logindata;
//            ctrl.disableToolbar = true;
//
//            ctrl.setConfig({
//                name: 'log',
//                pagination: true,
//                numPerPage: numPerPage,
//                scrollable: false,
//                totalCount: true,
//                getAll: getAll,
//                getCount: getCount
//            });
//            function getAll(params) {
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                if (params && params.$skip) {
//                    payload.$skip = params.$skip;
//                }
//                if (params && params.$limit) {
//                    payload.$limit = params.$limit;
//                }
//                return Logger.getDPILogs(payload, 'DpiUserLogin').then(function (data) {
//                    data.map(function (d) {
//                        d.timestamp = new Date(d.timestamp);
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
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                return Logger.getDPILogCount(payload, 'DpiUserLogin');
//            }
//
//        }
//    }
//
//    function cmdLogs(Logger) {
//        var cmdLogsTableObj = {
//            scope: false,
//            restrict: 'E',
//            require: '^dtable',
//            replace: true,
//            templateUrl: '/templates/report/logger/cmdLogs.html',
//            link: link
//        };
//
//        return cmdLogsTableObj;
//
//        //////////
//        function link(scope, element, attr, ctrl) {
//
//            var datapack = scope.cmddata;
//            ctrl.disableToolbar = true;
//
//            ctrl.setConfig({
//                name: 'log',
//                pagination: true,
//                numPerPage: numPerPage,
//                scrollable: false,
//                totalCount: true,
//                getAll: getAll,
//                getCount: getCount
//            });
//            function getAll(params) {
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                if (params && params.$skip) {
//                    payload.$skip = params.$skip;
//                }
//                if (params && params.$limit) {
//                    payload.$limit = params.$limit;
//                }
//                return Logger.getDPILogs(payload, 'DpiUserCmdLog').then(function (data) {
//                    data.map(function (d) {
//                        d.timestamp = new Date(d.timestamp);
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
//                    $orderby: 'timestamp',
//                    $limit: numPerPage,
//                    $filter: datapack.filter
//                };
//                return Logger.getDPILogCount(payload, 'DpiUserCmdLog');
//            }
//
//        }
//    }
//
//})();
