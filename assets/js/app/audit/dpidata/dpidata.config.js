/**
 * Monitor Audit Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.dpidata')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('audit.dpidata', {
            url: '/dpidata',
            controller: 'DPIDataCtrl as dpidata',
            templateUrl: 'templates/audit/dpidata/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
