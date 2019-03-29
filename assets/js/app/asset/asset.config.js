/**
 * Asset Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('asset', {
            abstract: true,
            parent: 'dashboard',
            url: '/asset',
            controller: 'AssetCtrl as asset',
            templateUrl: 'templates/asset/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }

            }
        });
    }
})();
