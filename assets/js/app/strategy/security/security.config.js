/**
 * strategy Config
 *
 * Description
*/
(function () {
    'use strict';

    angular
        .module('southWest.strategy.security')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('strategy.security', {
            url: '/security',
            controller: 'SecurityStrategyCtrl as security',
            templateUrl: 'templates/strategy/security/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'STRATEGY';
                }
            }
        });
    }
})();
