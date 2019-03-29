/**
 * Audit Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('audit', {
            abstract: true,
            parent: 'securityaudit',
            url: '/audit',
            controller: 'AuditCtrl as audit',
            templateUrl: 'templates/audit/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                },
                topo: function (domain) {
                    domain.getDomain();
                }
            }
        });
    }
})();
