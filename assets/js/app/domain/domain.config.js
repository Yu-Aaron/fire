/**
 // Init Config
 //
 // Description
 **/
(function () {
    'use strict';

    angular
        .module('southWest.domain')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('domain', {
            parent: 'dashboard',
            url: '/domain',
            controller: 'DomainCtrl as domain',
            templateUrl: 'templates/domain/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                },
                strategyInfo: function (System) {
                    return System.getStrategyInfo();
                }
            }
        });
    }
})();
