/**
 * Rule Sync Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.sync')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.sync', {
            url: '/rule/sync?panel',
            controller: 'syncCtrl as syncCtrl',
            templateUrl: 'templates/rule/sync/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                }
            }
        });
    }
})();
