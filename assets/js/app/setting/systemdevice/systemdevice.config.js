/**
 * Setting Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.systemdevice')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.systemdevice', {
            url: '/systemdevice',
            params: {tab: null},
            controller: 'SystemDeviceCtrl as sysdevice',
            templateUrl: 'templates/setting/systemdevice/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_DPI_REBOOT SETTINGS_DPI_UPGRADE_RESET';
                }
            }
        }).state('setting.systemdevice.backup', {
            parent: 'setting',
            url: '/systemdevice/backup',
            params: {deviceid: null, deviceName: null},
            controller: 'SystemDeviceBackUpCtrl',
            templateUrl: 'templates/setting/systemdevice/configuration-backup-device-detail.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        });
    }
})();
