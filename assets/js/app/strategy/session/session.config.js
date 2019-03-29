///**
// * object Config
// *
// * Description
// */
(function () {
    'use strict';

    angular.module('southWest.strategy.session').config(config);

    function config($stateProvider) {
        $stateProvider.state('strategy.session', {
            url: '/session',
            templateUrl: 'templates/strategy/session/index.html'
        });
    }
})();
