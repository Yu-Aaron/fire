/**
 * Asset Security Device Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.securitydevice')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('asset.securitydevice', {
            url: '/securitydevice?panel',
            templateUrl: 'templates/asset/securitydevice/index.html',
            controller: 'SecurityDeviceCtrl as securitydevice',
            resolve: {
                protocols: function (Device) {
                    return Device.getAllProtocols();
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        }).state('asset.securitydevice.detail', {
            parent: 'asset',
            url: '/securitydevice/deviceid/:deviceID/subcategory/:subCategory?panel',
            controller: 'SecurityDeviceDetailCtrl as securitydetail',
            templateUrl: 'templates/asset/securitydevice/details/details.html',
            resolve: {
                protocols: function (Device) {
                    return Device.getAllProtocols();
                },
                allDeviceFull: function ($stateParams, Topology, topologyId) {
                    return Topology.getAllDeviceFull(topologyId.id);
                },
                device: function ($stateParams, $q, Device, Topology, topologyId, domain, $filter) {
                    if (!topologyId.id) {
                        return domain.getDomain().then(function (data) {
                            var currTopologyId = '';
                            if (data[0] && data[0].domainInfo) {
                                currTopologyId = data[0].domainInfo.currentTopologyId;
                            }
                            return getDevice(currTopologyId);
                        });
                    } else {
                        return getDevice();
                    }

                    function getDevice(currTopologyId) {
                        return Device.get($stateParams.deviceID, currTopologyId)
                            .then(function (data) {
                                return $q.all([
                                    Device.getBlocksRef(data.blocksRef.baseUrl),
                                    Topology.getDeviceNodes(data.deviceId),
                                    Device.getDeviceRuleCount(topologyId.id, data.deviceId),
                                    Device.getDeviceSignatureCount(topologyId.id, data.deviceId)
                                ]).then(function (d) {
                                    data.rules = d[0];
                                    data.nodes = d[1];
                                    data._rulesCount = d[2];
                                    data._signaturesCount = d[3];
                                    data._iconName = Device.getIconName(data.iconType);
                                    var splitName = data._model_name ? data._model_name.split(' /') : [];
                                    if (splitName[0] === "数控审计保护平台") {
                                        data._model_name = $filter('resFilter')(splitName[0], 'slideAuditTitle') + ' /' + splitName[1];
                                    }
                                    data.backTo = $stateParams.subCategory;
                                    return data;
                                });
                            }, function () {
                                return false;
                            });
                    }
                },
                models: function (Device, $stateParams) {
                    return Device.getModels({
                        '$select': ["modelId", "model", "model_name", "make", "protocol", "version", "firmwareVersion", "model_serialNo", "model_memo", "iconType", "numOfPorts", "subCategory"],
                        '$filter': 'category eq SECURITY_DEVICE' + ($stateParams.subCategory ? ' and subCategory eq ' + $stateParams.subCategory : ''),
                        '$limit': 1000000,
                        '$orderby': 'model_name'
                    });
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        }).state('asset.securitydevice.new', {
            parent: 'asset',
            url: '/securitydevice/new/:subCategory',
            controller: 'SecurityDeviceNewCtrl as securitynew',
            templateUrl: 'templates/asset/securitydevice/details/new.html',
            resolve: {
                allDeviceFull: function ($stateParams, Topology, topologyId) {
                    return Topology.getAllDeviceFull(topologyId.id);
                },
                categories: function (Device) {
                    return Device.getModels({
                        '$select': 'category',
                        "$limit": 10000
                    });
                },
                models: function (Device, $stateParams) {
                    return Device.getModels({
                        '$select': ["modelId", "model", "model_name", "make", "protocol", "version", "firmwareVersion", "model_serialNo", "model_memo", "iconType", "numOfPorts", "subCategory"],
                        '$filter': 'category eq SECURITY_DEVICE' + ($stateParams.subCategory ? ' and subCategory eq ' + $stateParams.subCategory : ''),
                        '$limit': 1000000,
                        '$orderby': 'model_name'
                    });
                },
                subCategory: function ($stateParams) {
                    return $stateParams.subCategory;
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        });
    }
})();
