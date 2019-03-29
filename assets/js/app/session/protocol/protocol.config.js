/**
 * Created by liuzhen on 16-12-2.
 */
(function () {
    'use strict';

    angular
        .module('southWest.session.protocol')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('session.protocol', {
            url: '/protocol',
            controller: 'SessionProtocolCtrl as SessionProtocolCtrl',
            templateUrl: 'templates/session/protocol/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'STRATEGY';
                }
            }
        });
    }
})();
