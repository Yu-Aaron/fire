///**
// * strategy Config
// *
// * Description
// */
(function () {
    'use strict';

    angular
        .module('southWest.strategy.nat')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('strategy.nat_snat', {
            parent:'strategy',
            url: '/nat/snat',
            templateUrl: 'templates/strategy/nat/snat.html'
        }).state('strategy.nat_dnat', {
            parent:'strategy',
            url: '/nat/dnat',
            templateUrl: 'templates/strategy/nat/dnat.html'
        });
    }
})();
