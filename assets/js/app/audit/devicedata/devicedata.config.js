/**
 * Audit devicedata Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.devicedata')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('audit.devicedata', {
            url: '/devicedata',
            controller: 'DevicedataCtrl as devicedata',
            templateUrl: 'templates/audit/devicedata/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
