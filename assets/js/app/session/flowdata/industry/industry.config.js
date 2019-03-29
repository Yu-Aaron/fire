(function () {
    'use strict';

    angular
        .module('southWest.session.flowdata_industry')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('session.flowdata_industry', {
            url: '/flowdata/industry',
            controller: 'ICDeviceDataCtrl2 as icdevicedata',
            templateUrl: 'templates/session/flowdata/industry/index.html'
            //resolve: {
            //    state: function ($rootScope) {
            //        $rootScope.currentState = 'AUDIT_MANAGEMENT';
            //    }
            //}
        }).state('session.flowdata_industry.detail', {
            parent: 'session',
            url: '/flowdata/industry/detail/deviceid/:deviceID/deviceInfo/:deviceInfo',
            controller: 'ICDeviceProtocolTrafficDataCtrl2 as icdeviceprotocoltrafficdata',
            templateUrl: 'templates/session/flowdata/industry/icDeviceProtocolTraffic.html',
            resolve: {
                menuState:function(){
                    return 'session.flowdata_industry';
                },
                deviceId: function ($stateParams) {
                    return $stateParams.deviceID;
                },
                deviceInfo: function ($stateParams) {
                    return $stateParams.deviceInfo;
                }
                //state: function ($rootScope) {
                //    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                //}
            }
        });
    }
})();
