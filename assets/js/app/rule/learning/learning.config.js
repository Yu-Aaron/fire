/**
 * Monitor Signature Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.learning')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.whitelist_learning', {
            url: '/whitelist/learning',
            controller: 'learningCtrl as learningCtrl',
            templateUrl: 'templates/rule/learning/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                }
            }
        });
    }
})();
