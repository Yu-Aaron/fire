/**
 * Created by liuzhen on 16-12-2.
 */
(function () {
    'use strict';

    angular
        .module('southWest.session.state')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('session.state', {
            url: '/state',
            controller: 'SessionStateCtrl as sessionState',
            templateUrl: 'templates/session/state/index.html'
        });
    }
})();
