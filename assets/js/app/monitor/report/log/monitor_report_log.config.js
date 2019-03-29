/**
 * Monitor report Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_log')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor.report_log', {
            parent:"monitor",
            url: '/report/log',
            controller: 'ReportLoggerCtrl as rlogger',
            templateUrl: 'templates/monitor/report/log/index.html',
        });
    }
})();
