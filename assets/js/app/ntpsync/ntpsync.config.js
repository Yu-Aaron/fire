/**
 * ntp sync Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.ntpsync')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('ntpsync', {
            abstract: true,
            parent: 'dashboard',
            url: '/ntpsync',
            controller: 'SettingCtrl as setting',
            templateUrl: 'templates/ntpsync/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_POLICY';
                }
            }
        }).state('ntpsync.setting', {
            url: '/setting',
            controller: 'SystemConsoleCtrl as sysconsole',
            templateUrl: 'templates/ntpsync/setting.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_POLICY';
                }
            }

        });
    }
})();
