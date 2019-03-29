///**
// * strategy Config
// *
// * Description
// */
(function () {
    'use strict';

    angular
        .module('southWest.strategy')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('strategy', {
            abstract: true,
            parent: 'dashboard',
            url: '/strategy',
            controller: 'StrategyCtrl as menuCtrl',
            templateUrl: 'templates/includes/nav-left.html'
        });
    }
})();
