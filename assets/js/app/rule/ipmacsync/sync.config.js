/**
 * Rule Sync Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.ipmacsync')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.ipmacsync', {
            url: '/rule/ipmacsync?panel',
            controller: 'ipmacsyncCtrl as ipmacsyncCtrl',
            templateUrl: 'templates/rule/ipmacsync/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                }
            }
        });
    }
})();
