/**
 * Setting Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.systemconsole')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.systemconsole', {
            url: '/systemconsole',
            params: {tab: null},
            controller: 'SystemConsoleCtrl as sysconsole',
            templateUrl: 'templates/setting/systemconsole/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_POLICY SETTINGS_PLATFORM_REBOOT SETTINGS_PLATFORM_UPGRADE_RESET SETTINGS_IP_LOGIN SETTINGS_PROTOCOL';
                }
            }
        });
    }
})();
