/**
 * Report Logger Directives
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_log')
        .directive('loginLogs', loginLogs)
        .directive('operationLogs', operationLogs)
        .directive('systemLogs', systemLogs);
        //.directive('loginLogs', loginLogs)
        //.directive('cmdLogs', cmdLogs);

    var numPerPage = 100;

    function loginLogs(Logger) {
        var allLogsTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/report/log/allLogs.html',
            link: link
        };

        return allLogsTableObj;

        //////////
        function link(scope, element, attr, ctrl) {

            var datapack = scope.logindata;
            ctrl.disableToolbar = true;

            ctrl.setConfig({
                name: 'log',
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
                    $limit: numPerPage,
                    $filter: datapack.filter
                };
                if (params && params.$skip) {
                    payload.$skip = params.$skip;
                }
                if (params && params.$limit) {
                    payload.$limit = params.$limit;
                }
                return Logger.getAll(payload).then(function (data) {
                    data.map(function (d) {
                        d.timestamp = new Date(d.timestamp);
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
                return Logger.getCount(payload);
            }

        }
    }

    function operationLogs(Logger) {

        var consoleLoginLogsTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/report/log/consoleLoginLogs.html',
            link: link
        };

        return consoleLoginLogsTableObj;

        function link(scope, element, attr, ctrl) {
            var datapack = scope.operationdata;
            ctrl.disableToolbar = true;

            ctrl.setConfig({
                name: 'log',
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
                    $limit: numPerPage,
                    $filter: datapack.filter
                };
                if (params && params.$skip) {
                    payload.$skip = params.$skip;
                }
                if (params && params.$limit) {
                    payload.$limit = params.$limit;
                }
                return Logger.getAll(payload).then(function (data) {
                    data.map(function (d) {
                        d.timestamp = new Date(d.timestamp);
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
                return Logger.getCount(payload);
            }

        }
    }

    function systemLogs(Logger) {

        var consoleLogsTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/report/log/consoleLogs.html',
            link: link
        };

        return consoleLogsTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var datapack = scope.systemdata;
            ctrl.disableToolbar = true;

            ctrl.setConfig({
                name: 'log',
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
                    $limit: numPerPage,
                    $filter: datapack.filter
                };
                if (params && params.$skip) {
                    payload.$skip = params.$skip;
                }
                if (params && params.$limit) {
                    payload.$limit = params.$limit;
                }
                return Logger.getAll(payload).then(function (data) {
                    data.map(function (d) {
                        d.timestamp = new Date(d.timestamp);
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
                return Logger.getCount(payload);
            }

        }
    }

    //function loginLogs(Logger) {
    //    var loginLogsTableObj = {
    //        scope: false,
    //        restrict: 'E',
    //        require: '^dtable',
    //        replace: true,
    //        templateUrl: '/templates/monitor/report/log/loginLogs.html',
    //        link: link
    //    };
    //
    //    return loginLogsTableObj;
    //
    //    //////////
    //    function link(scope, element, attr, ctrl) {
    //
    //        var datapack = scope.logindata;
    //        ctrl.disableToolbar = true;
    //
    //        ctrl.setConfig({
    //            name: 'log',
    //            pagination: true,
    //            numPerPage: numPerPage,
    //            scrollable: false,
    //            totalCount: true,
    //            getAll: getAll,
    //            getCount: getCount
    //        });
    //        function getAll(params) {
    //            var payload = {
    //                $orderby: 'timestamp',
    //                $limit: numPerPage,
    //                $filter: datapack.filter
    //            };
    //            if (params && params.$skip) {
    //                payload.$skip = params.$skip;
    //            }
    //            if (params && params.$limit) {
    //                payload.$limit = params.$limit;
    //            }
    //            return Logger.getDPILogs(payload, 'DpiUserLogin').then(function (data) {
    //                data.map(function (d) {
    //                    d.timestamp = new Date(d.timestamp);
    //                });
    //                setTimeout(function () {
    //                    datapack.data = data ? data : [];
    //                    datapack.currPage = scope.dtable.currentPage;
    //                    datapack.numPages = scope.dtable.numPages;
    //                }, 10);
    //                return data ? data : [];
    //            });
    //        }
    //
    //        function getCount() {
    //            var payload = {
    //                $orderby: 'timestamp',
    //                $limit: numPerPage,
    //                $filter: datapack.filter
    //            };
    //            return Logger.getDPILogCount(payload, 'DpiUserLogin');
    //        }
    //
    //    }
    //}
    //
    //function cmdLogs(Logger) {
    //    var cmdLogsTableObj = {
    //        scope: false,
    //        restrict: 'E',
    //        require: '^dtable',
    //        replace: true,
    //        templateUrl: '/templates/monitor/report/log/cmdLogs.html',
    //        link: link
    //    };
    //
    //    return cmdLogsTableObj;
    //
    //    //////////
    //    function link(scope, element, attr, ctrl) {
    //
    //        var datapack = scope.cmddata;
    //        ctrl.disableToolbar = true;
    //
    //        ctrl.setConfig({
    //            name: 'log',
    //            pagination: true,
    //            numPerPage: numPerPage,
    //            scrollable: false,
    //            totalCount: true,
    //            getAll: getAll,
    //            getCount: getCount
    //        });
    //        function getAll(params) {
    //            var payload = {
    //                $orderby: 'timestamp',
    //                $limit: numPerPage,
    //                $filter: datapack.filter
    //            };
    //            if (params && params.$skip) {
    //                payload.$skip = params.$skip;
    //            }
    //            if (params && params.$limit) {
    //                payload.$limit = params.$limit;
    //            }
    //            return Logger.getDPILogs(payload, 'DpiUserCmdLog').then(function (data) {
    //                data.map(function (d) {
    //                    d.timestamp = new Date(d.timestamp);
    //                });
    //                setTimeout(function () {
    //                    datapack.data = data ? data : [];
    //                    datapack.currPage = scope.dtable.currentPage;
    //                    datapack.numPages = scope.dtable.numPages;
    //                }, 10);
    //                return data ? data : [];
    //            });
    //        }
    //
    //        function getCount() {
    //            var payload = {
    //                $orderby: 'timestamp',
    //                $limit: numPerPage,
    //                $filter: datapack.filter
    //            };
    //            return Logger.getDPILogCount(payload, 'DpiUserCmdLog');
    //        }
    //
    //    }
    //}

})();
