/**
 * Monitor report Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_event')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor.report_event', {
            parent:"monitor",
            url: '/report/event',
            controller: 'ReportEventCtrl as revent',
            templateUrl: 'templates/monitor/report/event/index.html',
        });
    }
})();
