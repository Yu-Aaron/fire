/*
 redirect config
 */
(function () {
    'use strict';

    angular
        .module('southWest.redirect')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('redirect', {
            parent: 'dashboard',
            url: '/',
            controller: "RedirectCtrl as redirect",
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'REAL_TIME_PROTECTION';
                }

            }
        });
    }
})();
