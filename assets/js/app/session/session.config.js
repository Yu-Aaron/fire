/**
 * Created by liuzhen on 16-12-2.
 */
/**
 * Setting Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.session')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('session', {
            abstract: true,
            parent: 'dashboard',
            url: '/session',
            controller: 'SessionCtrl as menuCtrl',
            templateUrl: 'templates/includes/nav-left.html'
            //resolve: {
            //    state: function ($rootScope) {
            //        $rootScope.currentState = 'AUDIT_MANAGEMENT';
            //    }
            //}
        });
    }
})();
