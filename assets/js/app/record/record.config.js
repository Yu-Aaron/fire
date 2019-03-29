/**
 * record Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.record')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('record', {
            parent: 'dashboard',
            url: '/record',
            controller: 'RecordCtrl as record',
            templateUrl: 'templates/record/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
