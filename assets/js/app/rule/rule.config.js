/**
 * rule Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule', {
            parent: 'dashboard',
            abstract: true,
            controller: 'RuleCtrl as menuCtrl',
            templateUrl: 'templates/includes/nav-left.html',
            url: '/rule'
            //resolve: {
            //    state: function ($rootScope) {
            //        $rootScope.currentState = 'POLICY';
            //        $rootScope.openWhitelist = true;
            //    }
            //}

        });
    }
})();
