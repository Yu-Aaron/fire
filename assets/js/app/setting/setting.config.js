/**
 * Setting Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting', {
            abstract: true,
            parent: 'dashboard',
            url: '/setting',
            controller: 'SettingCtrl as menuCtrl',
            templateUrl: 'templates/includes/nav-left.html'
            //resolve: {
            //    state: function ($rootScope) {
            //        $rootScope.currentState = 'AUDIT_MANAGEMENT';
            //    }
            //}
        });
    }
})();
