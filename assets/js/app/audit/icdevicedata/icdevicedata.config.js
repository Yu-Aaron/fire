/**
 * Monitor Audit Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.icdevicedata')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('audit.icdevice_data', {
            url: '/icdevicedata',
            controller: 'ICDeviceDataCtrl as icdevicedata',
            templateUrl: 'templates/audit/icdevicedata/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('audit.icdevice_data.detail', {
            parent: 'audit',
            url: '/icdevicedata/deviceid/:deviceID/deviceInfo/:deviceInfo',
            controller: 'ICDeviceProtocolTrafficDataCtrl as icdeviceprotocoltrafficdata',
            templateUrl: 'templates/audit/icdevicedata/icDeviceProtocolTraffic.html',
            resolve: {
                deviceId: function ($stateParams) {
                    return $stateParams.deviceID;
                },
                deviceInfo: function ($stateParams) {
                    return $stateParams.deviceInfo;
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
