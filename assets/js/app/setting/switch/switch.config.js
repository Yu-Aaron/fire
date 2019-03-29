/**
 * Switch Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.switch')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.switch', {
            url: '/switch',
            controller: 'SwitchCtrl as switch',
            templateUrl: 'templates/setting/switch/index.html',
            //resolve: {
            //    state: function ($rootScope) {
            //        $rootScope.currentState = 'AUDIT_MANAGEMENT';
            //    }
            //}
        });
    }
})();

