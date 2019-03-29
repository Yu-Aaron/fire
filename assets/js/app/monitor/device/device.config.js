/**
 * Monitor Device Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.device')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor.device', {
            url: '/device?panel',
            controller: 'DeviceCtrl as device',
            templateUrl: 'templates/monitor/device/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        }).state('monitor.device.detail', {
            parent: 'dashboard',
            url: '/monitor/device/:deviceID?ip?allInOneIP',
            controller: 'DeviceDetailCtrl as detail',
            templateUrl: 'templates/monitor/device/details/details.html',
            resolve: {
                device: function ($stateParams, $q, Device, Topology, topologyId, domain, UCD) {
                    var ucdInfo = UCD.getDomain($stateParams.allInOneIP || $stateParams.ip, topologyId.id);
                    if (!topologyId.id) {
                        return domain.getDomain().then(function () {
                            return getDevice();
                        });
                    } else {
                        return getDevice();
                    }

                    function getDevice() {
                        //console.log(ucdInfo);
                        return Device.get($stateParams.deviceID, ucdInfo.topoId, ucdInfo.ip)
                            .then(function (data) {
                                for (var i = 0; i < data.length; i++) {
                                    console.log(data[i].category === "SECURITY_DEVICE");
                                    if (data[i].category === "SECURITY_DEVICE") {
                                        data = data[i];
                                        break;
                                    }
                                }

                                var factoryCount = Device.getCount({
                                    '$filter': 'category eq FACTORY_DEVICE'
                                });
                                //console.log(ucdInfo.topoId);
                                return $q.all([
                                    Device.getBlocksRef(data.blocksRef.baseUrl, ucdInfo.ip),
                                    Topology.getDeviceNodes(data.deviceId, ucdInfo.ip),
                                    Device.getDeviceRuleCount(ucdInfo.topoId ? ucdInfo.topoId : topologyId.id, data.deviceId, ucdInfo.ip),
                                    Device.getDeviceSignatureCount(ucdInfo.topoId ? ucdInfo.topoId : topologyId.id, data.deviceId, ucdInfo.ip),
                                    factoryCount,
                                    Device.getDeviceDomainRuleCount(ucdInfo.topoId ? ucdInfo.topoId : topologyId.id, data.deviceId)
                                ]).then(function (d) {
                                    data.rules = d[0];
                                    data.nodes = d[1];
                                    data._rulesCount = d[2];
                                    data._signaturesCount = d[3];
                                    data._iconName = Device.getIconName(data.iconType);
                                    data._factoryCount = d[4];
                                    data._domainRulesCount = d[5];
                                    return data;
                                });
                            }, function () {
                                return false;
                            });
                    }
                },
                deviceIncidents: function ($stateParams, Incident, Topology, topologyId, domain) {
                    if (!topologyId.id) {
                        return domain.getDomain().then(function () {
                            return getDeviceIncidents();
                        });
                    } else {
                        return getDeviceIncidents();
                    }

                    function getDeviceIncidents() {
                        var now = new Date();
                        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        return Incident.getIncidentsByDevice($stateParams.deviceID, moment(startOfDay).utc().format()).then(function (data) {
                            //console.log(data);
                            return data;
                        });
                    }
                },
                allInOneIP: function ($stateParams) {
                    return $stateParams.allInOneIP;
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        });
    }
})();
