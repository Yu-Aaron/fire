(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_protocol')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor.report_protocol', {
            parent:"monitor",
            url: '/report/protocol',
            controller: 'ReportProtocolCtrl as rprotocol',
            templateUrl: 'templates/monitor/report/protocol/index.html',
        });
    }
})();
