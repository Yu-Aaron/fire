/**
 * Monitor Logger Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.logger')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor.logger', {
            url: '/logger?panel',
            controller: 'LoggerCtrl as logger',
            templateUrl: 'templates/monitor/logger/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'LOG_MANAGEMENT';
                }
            }
        }).state('monitor.logger.detail', {
            parent: 'dashboard',
            url: '/monitor/logger/:logName',
            controller: 'LoggerDetailCtrl as loggerDetail',
            templateUrl: 'templates/monitor/logger/detail.html'
        });
    }
})();
