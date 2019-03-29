/**
 * help Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help.monitor')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('help.monitor_overview', {
            url: '/monitor/overview',
            template: '<div>test help monitor overview</div>'
        }).state('help.monitor_incident', {
            parent:'help',
            url: '/monitor/incident',
            template: '<div>test help monitor incident</div>'
        }).state('help.monitor_logger', {
            parent:'help',
            url: '/monitor/logger',
            template: '<div>test help monitor logger</div>'
        }).state('help.monitor_report', {
            parent:'help',
            url: '/monitor/report',
            template: '<div>test help monitor report</div>'
        });
    }
})();
