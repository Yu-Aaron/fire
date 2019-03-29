/**
 * help Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('help', {
            abstract: true,
            parent: 'dashboard',
            url: '/help',
            controller: 'HelpCtrl as menuCtrl',
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
