/*
 reduction config
 */
(function () {
    'use strict';

    angular
        .module('southWest.reduction')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('reduction', {
            parent: 'dashboard',
            url: '/reduction',
            controller: "ReductionCtrl as reductionctrl",
            templateUrl: 'templates/reduction/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }

            }
        });
    }
})();
