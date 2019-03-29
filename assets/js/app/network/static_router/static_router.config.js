/**
 * NetInterface StaticRouter Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.network.static_router')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('network.static_router', {
            url: '/static_router',
            templateUrl: 'templates/network/static_router/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'NETWORK';
                }
            }
        });
    }
})();
