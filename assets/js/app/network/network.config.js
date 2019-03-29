///**
// * Network Config
// *
// * Description
// */
(function () {
    'use strict';

    angular
        .module('southWest.network')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('network', {
            abstract: true,
            parent: 'dashboard',
            url: '/network',
            controller: 'NetworkCtrl as menuCtrl',
            templateUrl: 'templates/includes/nav-left.html'
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
