///**
// * Monitor Config
// *
// * Description
// */
(function () {
    'use strict';

    angular
        .module('southWest.monitor')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor', {
            abstract: true,
            parent: 'dashboard',
            url: '/monitor',
            controller: 'MonitorCtrl as menuCtrl',
            templateUrl: 'templates/includes/nav-left.html',
            //resolve: {
                //topo: function ($location, topo) {
                //    if (!topo) {
                //        //$location.url('/');
                //    }
                //},
                //state: function ($rootScope) {
                //    $rootScope.currentState = 'REAL_TIME_PROTECTION';
                //}

            //}
        });
    }
})();
