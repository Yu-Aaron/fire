/**
 * Reliable Config
 *
 * Description
 */
(function () {
    'use strict';

    angular.module('southWest.setting.reliable').config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.reliable', {
            url: '/reliable',
            controller: 'ReliableCtrl as reliable',
            templateUrl: 'templates/setting/reliable/index.html'
        });
    }
})();
