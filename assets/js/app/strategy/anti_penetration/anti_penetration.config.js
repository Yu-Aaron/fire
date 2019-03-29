///**
// * anti_penetration Config
// *
// * Description
// */
(function () {
    'use strict';

    angular
        .module('southWest.strategy.anti_penetration')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('strategy.anti_penetration', {
            url: '/anti_penetration',
            controller: 'antiPenetrationCtrl as antiPenetrationCtrl',
            templateUrl: 'templates/strategy/antiPenetration/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'STRATEGY';
                }
            }
        });
    }
})();
