/**
 * PrivateProtocol Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.privateprotocol')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('privateprotocol', {
            parent: 'dashboard',
            url: '/privateprotocol',
            controller: 'PrivateProtocolCtrl as privateprotocol',
            templateUrl: 'templates/privateprotocol/index.html',
            resolve: {
                protocols: function (PrivateProtocol) {
                    return PrivateProtocol.getProtocols();
                },
                hiddenPorts: function (PrivateProtocol) {
                    return PrivateProtocol.getHiddenPorts();
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_PROTOCOL';
                }
            }
        });
    }
})();
