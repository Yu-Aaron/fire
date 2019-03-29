/**
 * ai Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.ai')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('ai', {
            parent: 'dashboard',
            abstract: true,
            template: '<div ui-view></div>'
        }).state('ai.learning', {
            url: '/ai/learning/',
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
