/**
 * Attack Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.attack')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('attack', {
            parent: 'dashboard',
            url: '/attack',
            controller: 'AttackCtrl as attack',
            templateUrl: 'templates/attack/index.html',
            resolve: {
                //topo: function ($location, topo) {
                //    if (!topo) {
                //        //$location.url('/');
                //    }
                //},
                state: function ($rootScope) {
                    $rootScope.currentState = 'ATTACKPATH';
                }
            }
        });
    }
})();
