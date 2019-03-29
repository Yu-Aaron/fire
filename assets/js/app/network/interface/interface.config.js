/**
 * NetInterface Interface Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.network.interface')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('network.interface', {
            url: '/interface',
            templateUrl: 'templates/network/interface/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'NETWORK';
                }
            }
        });
    }
})();
