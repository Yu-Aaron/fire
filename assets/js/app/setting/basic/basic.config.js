/**
 * Setting Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.basic')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.basic', {
            url: '/basic',
            controller: 'BasicCtrl as basic',
            //template: '<div>test setting basic</div>',
            templateUrl: 'templates/setting/basic/index.html',
            //resolve: {
            //    state: function ($rootScope) {
            //        $rootScope.currentState = 'AUDIT_MANAGEMENT';
            //    }
            //}
        });
    }
})();

