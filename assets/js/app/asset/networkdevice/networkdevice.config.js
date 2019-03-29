/**
 * Asset Network Device Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.networkdevice')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('asset.networkdevice', {
            url: '/networkdevice',
            controller: 'NetworkDeviceCtrl as networkdevice',
            templateUrl: 'templates/asset/networkdevice/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        }).state('asset.networkdevice.detail', {
            parent: 'asset',
            url: '/networkdevice/deviceid/:deviceID?panel',
            controller: 'NetworkDeviceDetailCtrl as networkdetail',
            templateUrl: 'templates/asset/networkdevice/details/details.html',
            resolve: {
                alldevice: function ($stateParams, dupeInfo) {
                    return dupeInfo.allDevice().then(function (data) {
                        return data;
                    });
                },
                allDeviceFull: function ($stateParams, Topology, topologyId) {
                    return Topology.getAllDeviceFull(topologyId.id);
                },
                device: function ($stateParams, $q, Device, Topology, topologyId, domain) {
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
                                return $q.all([
                                    Device.getBlocksRef(data.blocksRef.baseUrl),
                                    Topology.getDeviceNodes(data.deviceId)
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
        }).state('asset.networkdevice.new', {
            parent: 'asset',
            url: '/networkdevice/new',
            controller: 'NetworkDeviceNewCtrl as newnetwork',
            templateUrl: 'templates/asset/networkdevice/details/new.html',
            resolve: {
                alldevice: function ($stateParams, dupeInfo) {
                    return dupeInfo.allDevice().then(function (data) {
                        return data;
                    });
                },
                allDeviceFull: function ($stateParams, Topology, topologyId) {
                    return Topology.getAllDeviceFull(topologyId.id);
                },
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
