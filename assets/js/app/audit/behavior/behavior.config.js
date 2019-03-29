/**
 * Created by yucai on 16-7-25.
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.behavior')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('audit.behavior', {
            url: '/behavior',
            controller: 'BehaviorCtrl as BehaviorCtrl',
            templateUrl: 'templates/audit/behavior/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
