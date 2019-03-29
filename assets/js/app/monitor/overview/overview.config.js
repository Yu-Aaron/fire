/**
 * Monitor Overview Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.overview')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor.overview', {
            url: '/overview',
            controller: 'OverviewCtrl as overview',
            templateUrl: 'templates/monitor/overview/index.html',
            //state: function ($rootScope) {
            //    $rootScope.currentState = 'REAL_TIME_PROTECTION';
            //}
        });
    }
})();
