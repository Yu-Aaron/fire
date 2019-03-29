/**
 * Monitor Audit Table Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.protocolaudit')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('protocolaudit', {
            parent: 'dashboard',
            url: '/protocolaudit',
            controller: 'AuditTableCtrl as audittable',
            templateUrl: 'templates/protocolaudit/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
