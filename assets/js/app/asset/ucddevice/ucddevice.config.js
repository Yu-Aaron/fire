/**
 * Asset Network Device Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.ucddevice')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('asset.ucddevice', {
            parent: 'dashboard',
            url: '/asset/ucddevice',
            controller: 'UCDDeviceCtrl as ucddevice',
            templateUrl: 'templates/asset/ucddevice/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        }).state('asset.ucddevice.detail', {
            parent: 'dashboard',
            url: '/ucddevice/deviceid/:deviceID?panel?ip',
            controller: 'UCDDeviceDetailCtrl as ucddetail',
            templateUrl: 'templates/asset/ucddevice/details/details.html',
            resolve: {
                device: function ($stateParams, $q, Device, Topology, topologyId, domain, $rootScope, UCD) {

                    if (!topologyId.id) {
                        return domain.getDomain().then(function () {
                            return getDevice();
                        });
                    } else {
                        return getDevice();
                    }

                    var tid = null;

                    function getDevice() {

                        tid = UCD.getDomain($stateParams.ip);

                        return Device.get($stateParams.deviceID, tid.topoId, tid.ip).then(function (data) {
                            return $q.all([
                                Device.getBlocksRef(data.blocksRef.baseUrl, $stateParams.ip),
                                Topology.getDeviceNodes(data.deviceId, $stateParams.ip)
                            ]).then(function (d) {
                                data.rules = d[0];
                                data.nodes = d[1];
                                data._iconName = Device.getIconName(data.iconType);
                                return data;
                            });
                        }, function () {
                            return false;
                        });
                    }
                },
                models: function ($stateParams, topologyId, Device, domain) {
                    if (!topologyId.id) {
                        return domain.getDomain().then(function () {
                            return getDevice();
                        });
                    } else {
                        return getDevice();
                    }
                    function getDevice() {
                        return Device.get($stateParams.deviceID)
                            .then(function (data) {
                                return getModelList(data.category);
                            }, function () {
                                return false;
                            });
                    }

                    function getModelList(category) {
                        return Device.getModels({
                            '$select': ["modelId", "model", "model_name", "make", "protocol", "version", "firmwareVersion", "model_serialNo", "model_memo", "iconType", "numOfPorts", "subCategory"],
                            '$filter': 'category eq ' + category,
                            '$limit': 1000000,
                            '$orderby': 'model_name'
                        });
                    }
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        }).state('asset.ucddevice.new', {
            parent: 'dashboard',
            url: '/ucddevice/new',
            controller: 'UCDDeviceNewCtrl as newucd',
            templateUrl: 'templates/asset/ucddevice/details/new.html',
            resolve: {
                models: function (Device) {
                    return Device.getModels({
                        '$select': ["modelId", "model", "model_name", "make", "protocol", "version", "firmwareVersion", "model_serialNo", "model_memo", "iconType", "numOfPorts", "subCategory"],
                        '$filter': 'category eq NETWORK_DEVICE',
                        '$limit': 1000000,
                        '$orderby': 'model_name'
                    });
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        });
    }
})();
