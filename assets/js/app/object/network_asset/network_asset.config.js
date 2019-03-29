/**
* object network asset Config
*
* Description
*/
(function () {
    'use strict';

    angular
        .module('southWest.object.network_asset')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('object.network_asset_address', {
            url: '/network_asset/address',
            controller: 'IpPoolCtrl as ipPool',
            templateUrl: 'templates/object/network_asset/ipPool.html'
        }).state('object.network_asset_security_area', {
            url: '/network_asset/security_area',
            controller: 'SecurityAreaCtrl as secarea',
            templateUrl: 'templates/object/network_asset/securityArea.html'
        }).state('object.network_asset_device_asset', {
            url: '/network_asset/device_asset',
            controller: 'DeviceAssetCtrl as dvcasset',
            templateUrl: 'templates/object/network_asset/deviceAsset.html',
            resolve: {
                task: function ($rootScope) {
                    if(!$rootScope.dvcAssetTask){
                        $rootScope.dvcAssetTask = {};
                    }
                }
            }
        });
    }
})();
