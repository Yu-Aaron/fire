/**
 * Device Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Device', DeviceModel);

    function DeviceModel($q, $http, URI, topologyId, encodeURL, UCD, domain, $filter) {
        var url = URI + '/devices/topology/';

        var service = {
            getGroups: getGroups,
            createGroups: createGroups,
            updateGroups: updateGroups,
            createDevice: createDevice,
            createModel: createModel,
            createNodes: createNodes,
            updateNode: updateNode,
            createIPMACBinding: createIPMACBinding,
            deleteIPMACBinding: deleteIPMACBinding,
            get: get,
            getAll: getAll,
            getCount: getCount,
            getModels: getModels,
            getNewDevices: getNewDevices,
            getDevice: getDevice,
            getDeviceByMac: getDeviceByMac,
            getBlocksRef: getBlocksRef,
            getBlocksRefCount: getBlocksRefCount,
            getIpsidsCount: getIpsidsCount,
            getNodeRules: getNodeRules,
            getNotConnectedPort: getNotConnectedPort,
            getDPIInfo: getDPIInfo,
            getACLInfo: getACLInfo,
            getDeviceDiscoverred: getDeviceDiscoverred,
            getAllProtocols: getAllProtocols,
            deleteACL: deleteACL,
            addACL: addACL,
            deployACL: deployACL,
            hasDuplicateSN: hasDuplicateSN,
            hasDuplicateIP: hasDuplicateIP,
            updateNotConnectedPort: updateNotConnectedPort,
            updateDevicePort: updateDevicePort,
            updateSingleIpSubnet: updateSingleIpSubnet,
            update: update,
            updateMgmIpMac: updateMgmIpMac,
            updateNodeProtocols: updateNodeProtocols,
            addToCurrentTopology: addToCurrentTopology,
            configDevice: configDevice,
            search: search,
            routing: routing,
            pieChart: pieChart,
            //pieChart2: pieChart2,
            lineChart: lineChart,
            getDeviceRuleCount: getDeviceRuleCount,
            getDeviceDomainRuleCount: getDeviceDomainRuleCount,
            getDeviceSignatureCount: getDeviceSignatureCount,
            getIconName: getIconName,
            getSecurityDeviceIconPath: getSecurityDeviceIconPath,
            setDefaultGateway: setDefaultGateway,
            deleteRemoteRoutings: deleteRemoteRoutings,
            addRemoteRoutings: addRemoteRoutings,
            updateRemoteRoutings: updateRemoteRoutings,
            coverRemoteRoutings: coverRemoteRoutings,
            getAllForIpMacBinding: getAllForIpMacBinding,
            updateNodeProperty: updateNodeProperty,
            getSubTopo: getSubTopo,
            deleteOneDevice: deleteOneDevice,
            getAllNodeZone: getAllNodeZone,
            addNodeZone: addNodeZone,
            updateZoneName: updateZoneName,
            deleteNodeZones: deleteNodeZones,
            getNodeZoneCount: getNodeZoneCount,
            updateNodeAssociation: updateNodeAssociation,
            removeNewDevice: removeNewDevice,
            updateAllDevicePorts: updateAllDevicePorts,
            removeNodeByID: removeNodeByID,
            getDebuginfoCollection: getDebuginfoCollection,
            collectDebuginfo: collectDebuginfo,
            getConfBackUpInfos: getConfBackUpInfos,
            getConfBackUpInfoCount: getConfBackUpInfoCount,
            doConfBackUp: doConfBackUp,
            deleteBackUpFiles: deleteBackUpFiles,
            getConfBackUpFileInfos: getConfBackUpFileInfos,
            getConfBackUpFileInfoCount: getConfBackUpFileInfoCount,
            deleteConfBackUpFiles: deleteConfBackUpFiles,
            //doConfBackUpInfo: doConfBackUpInfo
            restoreConfBackUpFiles: restoreConfBackUpFiles,
            getSecretKey: getSecretKey
        };

        return service;

        //////////
        function getGroups() {
            return $http.get(url + topologyId.id + '/devicegroup');
        }

        function createGroups(data) {
            return $http.post(url + topologyId.id + '/devicegroup', data);
        }

        function updateGroups(groupId, idArray) {
            return $http.put(url + topologyId.id + '/devicegroup/' + groupId, idArray);
        }

        function createDevice(params) {
            return $http.post(url + topologyId.id, params).then(function (data) {
                return data.data;
            });
        }

        function createModel(params) {
            return $http.post(url + topologyId.id + '/models', params).then(function (data) {
                return data.data;
            });
        }

        function createNodes(params) {
            return $http.post(URI + '/topologies/' + topologyId.id + '/nodes', params).then(function (data) {
                return data.data;
            });
        }

        function updateNode(node) {
            return $http.put(URI + '/topologies/node/' + node.id, node);
        }

        function get(id, topoId, ip) {
            return $http.get(UCD.getUrl(ip) + url + (topoId || topologyId.id) + '/' + id).then(function (data) {
                return data.data;
            });
        }

        function getAll(params, topoId, ip) {
            if (topoId || topologyId.id) {
                return $http.get(UCD.getUrl(ip) + url + (topoId || topologyId.id), {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            } else {
                return domain.getDomain().then(function (data) {
                    console.log(data[0].domainInfo.currentTopologyId);
                    topologyId.id = data[0].domainInfo.currentTopologyId;
                    return $http.get(url + (topologyId.id), {
                        params: encodeURL(params)
                    }).then(function (data) {
                        return data.data;
                    });
                });
            }
        }

        function getCount(params, topoId, ip) {
            var urlStr = UCD.getUrl(ip) + url + UCD.getDomain(ip, topoId).topoId + '/count';
            return $http.get(urlStr, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getModels(params) {
            return $http.get(url + (topologyId.id ? topologyId.id : '0') + '/models', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getNewDevices(params) {
            return $http.get(URI + '/devices/newdiscovered', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDevice(topologyid, deviceip) {
            return $http.get(url + topologyId.id + '/deviceip/' + deviceip).then(function (data) {
                return data.data;
            }, function () {
                return {
                    name: '未知',
                    iconType: 'unknown-device'
                };
            });
        }

        function getDeviceByMac(topologyid, deviceMac) {
            return $http.get(url + topologyId.id + '/devicemac/' + deviceMac).then(function (data) {
                return data.data;
            }, function () {
                return {
                    name: '未知',
                    iconType: 'unknown-device'
                };
            });
        }

        function getBlocksRef(link, params, ip) {
            return $http.get(UCD.getUrl(ip) + URI + link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getBlocksRefCount(link, params, ip) {
            return $http.get(UCD.getUrl(ip) + URI + link + '/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getIpsidsCount() {
            return $http.get(URI + '/topologies/' + topologyId.id + '/ipsidscount').then(function (data) {
                // return $http.get(url + topologyId.id + '/ipsidscount').then(function (data) {
                return data.data;
            });
        }

        function getNodeRules(nodes, ip) {
            var n = nodes.map(function (n, i) {
                return $http.get(UCD.getUrl(ip) + URI + '/policies/topology/' + n.topologyId + '/nodes/' + n.id + '/rulesignaturecount').then(function (data) {
                    nodes[i].rules = data.data;
                });
            });

            return $q.all(n).then(function () {
                return nodes;
            });
        }

        function getDeviceDiscoverred() {
            return $http.get(URI + '/devices/newdiscovered');
        }

        function setDefaultGateway(deviceId, defaultGateway) {
            return $http.put(URI + '/devices/topology/' + topologyId.id + '/device/' + deviceId + '/defaultgateway', {
                'defaultGateway': defaultGateway
            }).then(function (data) {
                return data.data;
            });
        }

        function addRemoteRoutings(deviceId, remoteRoutingList) {
            return $http.post(URI + '/devices/topology/' + topologyId.id + '/device/' + deviceId + '/remoteroutings', remoteRoutingList)
                .then(function (data) {
                    return data.data;
                });
        }

        function deleteRemoteRoutings(deviceId, remoteRoutingList) {
            return $http.put(URI + '/devices/topology/' + topologyId.id + '/device/' + deviceId + '/remoteroutings/delete', remoteRoutingList)
                .then(function (data) {
                    return data.data;
                });
        }

        function updateRemoteRoutings(deviceId, routeRoutingInfo) {
            return $http.put(URI + '/devices/topology/' + topologyId.id + '/device/' + deviceId + '/remoteroutings', routeRoutingInfo)
                .then(function (data) {
                    return data.data;
                });
        }

        function coverRemoteRoutings(deviceId, remoteRoutingList) {
            return $http.put(URI + '/devices/topology/' + topologyId.id + '/device/' + deviceId + '/coverremoteroutings', remoteRoutingList)
                .then(function (data) {
                    return data.data;
                });
        }

        function getDPIInfo(topologyId, serialNumber, ip) {
            return $http.get(UCD.getUrl(ip) + URI + '/devices/topology/' + topologyId + '/' + serialNumber + '/systemstat');
        }

        function getACLInfo(deviceId) {
            return $http.get(URI + '/devices/device/' + deviceId + '/acls?$orderby=_aclNumber')
                .then(function (data) {
                    return data.data;
                });
        }

        function getAllProtocols() {
            return $http.get(URI + '/devices/model/protocolCategory').then(function (data) {
                return data.data;
            });
        }

        function deleteACL(deviceId, ACLId) {
            return $http({
                url: URI + '/devices/device/' + deviceId + '/acl/delete',
                data: ACLId,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function addACL(deviceId, ACLdata) {
            return $http({
                url: URI + '/devices/device/' + deviceId + '/acl',
                data: ACLdata,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function deployACL(device) {
            return $http({
                url: URI + '/devices/topology/' + topologyId.id + '/device/' + device.deviceId + '/acl',
                data: device,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function lineChart(data, callback) {
            var graphObj = {
                options: {
                    credits: {
                        enabled: false
                    },
                    plotOptions: {
                        area: {
                            lineColor: '#76B900',
                            allowPointSelect: false,
                            fillOpacity: 0.7
                        },
                        line: {
                            animation: false,
                            allowPointSelect: false,
                            lineColor: '#009bd0',
                            lineWidth: 2
                        },
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    chart: {
                        borderColor: '#000000',
                        borderWidth: 0,
                        plotBorderWidth: 1,
                        plotBackgroundColor: "#363636",
                        backgroundColor: '#1f1f1f',
                        plotBorderColor: '#000000',
                        plotShadow: true,
                        events: {
                            load: function () {
                                callback(this);
                            }
                        }
                    },
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        labels: {
                            enabled: false
                        },
                        showEmpty: true,
                        units: null,
                        lineWidth: 0,
                        tickWidth: 0
                    },
                    yAxis: {
                        title: null,
                        gridLineWidth: 0,
                        min: 0,
                        max: 1,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: 'black'
                        },
                            {
                                value: 0.25,
                                width: 0.5,
                                color: 'black'
                            },
                            {
                                value: 0.5,
                                width: 0.5,
                                color: 'black'
                            },
                            {
                                value: 0.75,
                                width: 0.5,
                                color: 'black'
                            },
                            {
                                value: 1,
                                width: 1,
                                color: 'black'
                            }],
                        labels: {
                            formatter: function () {
                                return this.value * 100 + "%";
                            }
                        }
                    }
                },
                title: {
                    text: ''
                },
                size: {
                    width: 269,
                    height: 200
                },
                series: data.data,
                chart: {
                    type: 'scatter'
                },
                useHighStocks: false,
                loading: false
            };
            return graphObj;
        }

        function pieChart(pathSafetyData, score, callback) {

            var pieChartObj = {
                chart: {
                    type: 'area',
                    spacingBottom: 30
                },
                options: {
                    chart: {
                        plotBackgroundColor: '#1f1f1f',
                        plotBorderWidth: null,
                        plotShadow: false,
                        margin: [0, 0, 0, 0],
                        events: {
                            load: function () {
                                callback(this);
                            }
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            shadow: false,
                            center: ['50%', '50%']
                        },
                        series: {
                            animation: false
                        }
                    },
                    legend: {
                        enabled: true,
                        itemDistance: 40,
                        symbolWidth: 9,
                        symbolHeight: 9,
                        symbolPadding: 5,
                        itemStyle: {
                            color: '#CCCCCC',
                            fontSize: '13px'
                        },
                        itemHoverStyle: {
                            color: '#CCCCCC'
                        }
                    }
                },
                series: [{
                    ignoreHiddenPoint: true,
                    type: 'pie',
                    name: 'Browser share',
                    data: pathSafetyData,
                    allowPointSelect: false,
                    cursor: 'pointer',
                    innerSize: 170,
                    minSize: 150,
                    showInLegend: false,
                    size: 130,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        distance: 30,
                        useHTML: true,
                        format: '<b style="color: {point.color}; font-size: 12px;">{point.y}%</b>',
                        style: {
                            color: '#CCCCCC'
                        }
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                },
                    {
                        ignoreHiddenPoint: true,
                        type: 'pie',
                        name: 'Browser share',
                        data: [{
                            y: 100,
                            color: '#9e9e9e'
                        }],
                        allowPointSelect: false,
                        cursor: 'pointer',
                        innerSize: 105,
                        minSize: 100,
                        showInLegend: false,
                        size: 118,
                        borderWidth: 0,
                        dataLabels: {
                            enabled: false
                        },
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    },
                    {
                        name: 'score',
                        allowOverlap: true,
                        allowPointSelect: false,
                        type: 'pie',
                        data: [{
                            color: '#1f1f1f',
                            y: score
                        }],
                        size: 80,
                        borderWidth: 0,
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        dataLabels: {
                            softConnector: false,
                            useHTML: true,
                            format: '<br><b style="font-size: 35px; line-height: 25px;">{point.y}</b><br style="line-height: 13px;"><b style="margin-left:30px;">GB</b>',
                            color: '#CCCCCC',
                            distance: -60
                        }
                    }
                ],
                title: {
                    text: null
                },
                loading: false,
                size: {
                    width: 269,
                    height: 200
                }

            };
            return pieChartObj;
        }

        function routing(device) {
            return $http.put(URI + '/devices/topology/' + topologyId.id + '/device/' + device.deviceId + '/routing', device)
                .then(function (data) {
                    return data.data;
                });
        }

        function getNotConnectedPort(deviceId) {
            return $http.get(url + topologyId.id + '/device/' + deviceId + '/notconnectedport').then(function (data) {
                return data.data;
            });
        }

        function updateNotConnectedPort(deviceId, portMap, devicePorts) {
            return $http.put(url + topologyId.id + '/device/' + deviceId + '/portroutingconfig', {
                'notConnectedPortMap': portMap,
                'devicePorts': devicePorts
            }).then(function (data) {
                return data.data;
            });
        }

        function updateDevicePort(deviceId, port) {
            return $http.put(URI + '/devices/' + deviceId + '/deviceports', port).then(function (data) {
                return data.data;
            });
        }

        function updateSingleIpSubnet(topologyId, deviceId, portIp) {
            return $http({
                method: 'PUT',
                url: url + topologyId + '/device/' + deviceId + '/ipsubnet',
                data: $.param(portIp),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function (data) {
                return data.data;
            }, function (data) {
                return data.data;
            });
        }

        function updateMgmIpMac(topologyId, deviceId, portIpMac, ip, type) {
            type = type ? type : 'ipandmac';
            return $http.put(url + topologyId + '/device/' + deviceId + '/ipmac/' + type, portIpMac).then(function (data) {
                return data.data;
            });
        }

        function update(deviceId, data) {
            return $http.put(url + topologyId.id + '/' + deviceId, data).then(function (data) {
                return data.data;
            });
        }

        function updateNodeProtocols(nodeId, data) {
            return $http.put(URI + '/topologies/node/' + nodeId + '/nodeProtocols', data).then(function (data) {
                return data.data;
            });
        }

        function addToCurrentTopology(deviceId, key) {
            return $http.put(url + topologyId.id + '/assigndevice/' + deviceId, key).then(function (data) {
                return data.data;
            });
        }

        function configDevice(deviceId, data) {
            return $http.put(URI + '/topologies/' + topologyId.id + '/device/' + deviceId + '/configdevice', data).then(function (data) {
                return data.data;
            });
        }

        function search(category, txt, ip) {
            return $http.get(UCD.getUrl(ip) + url + UCD.getDomain(ip, topologyId.id).topoId + '/' + category + '/search/' + txt).then(function (data) {
                return data.data;
            });
        }

        function getDeviceRuleCount(topologyid, deviceid, ip) {
            return $http.get(UCD.getUrl(ip) + URI + '/policies/topology/' + topologyid + '/device/' + deviceid + '/items/count?type=RULE').then(function (data) {
                return data.data;
            });
        }

        function getDeviceDomainRuleCount(topologyid, deviceid) {
            return $http.get(URI + '/policies/topology/' + topologyid + '/device/' + deviceid + '/domains/count').then(function (data) {
                return data.data;
            });
        }

        function getDeviceSignatureCount(topologyid, deviceid, ip) {
            return $http.get(UCD.getUrl(ip) + URI + '/policies/topology/' + topologyid + '/device/' + deviceid + '/items/count?type=SIGNATURE').then(function (data) {
                return data.data;
            });
        }

        function getIconName(IconType, modelName) {
            var iconType = IconType ? IconType.toLowerCase() : 'unknown-device';
            if (iconType !== 'cnc' && iconType !== 'cloud' && iconType !== 'unknown-device' && iconType !== 'deltav' && iconType !== 'hmi' && iconType !== 'opc_client' && iconType !== 'opc_server' && iconType !== 'plc' && iconType !== 'router' && iconType !== 'switch' && iconType !== 'workstation' && iconType !== 'subnet' && iconType !== 'kea-u1000' && iconType !== 'kea-u1142' && iconType !== 'kea-u1000e' && iconType !== 'kea-u2000' && iconType !== 'kea-c200' && iconType !== 'kea-c400' && iconType !== 'ked-c400' && iconType !== 'kev-c200' && iconType !== 'kev-c400' && iconType !== 'kec-u1000') {
                iconType = 'unknown-device';
            }
            if (iconType === 'unknown-device' && modelName) {
                modelName = modelName.substring(modelName.lastIndexOf(" ") + 1);
                iconType = modelName.toLowerCase();
                if (['kea-c200', 'kea-c400', 'ked-c400', 'kev-c200', 'kev-c400', 'kea-u1000', 'kea-u1142', 'kea-u1000e', 'kea-u2000', 'kec-u1000'].indexOf(iconType) === -1) {
                    iconType = 'unknown-device';
                }
            }
            return iconType;
        }

        // returns a security device (IPS/IDS) image based on model name and iconType
        function getSecurityDeviceIconPath(modelName) {
            var iconPath = 'images/devices/security/';
            var iconName = "kea-c200"; // fallback case: if both model name and iconType are unrecognized
            var fixedModelName = modelName ? ($filter('deviceModel')(modelName)).toLowerCase() : '';
            fixedModelName = fixedModelName.indexOf(' / ') > 0 ? fixedModelName.split(' / ')[1].toLowerCase() : fixedModelName;

            if (['kea-c200', 'kea-c400', 'ked-c400', 'kev-c200', 'kev-c400', 'kea-u1000', 'kea-u1142', 'kea-u1000e', 'kea-u2000', 'kec-u1000', 'kev-u800'].indexOf(fixedModelName) > -1) {
                iconName = fixedModelName;
            }
            return iconPath + iconName + '-icon.png';
        }

        function hasDuplicateSN(deviceId, serialNumber) {
            if (!serialNumber) {
                return false;
            }
            var params = {};
            params['$filter'] = "serialNumber eq '" + serialNumber + (deviceId ? ("' and deviceId ne '" + deviceId + "'") : "'");
            return getCount(params).then(function (data) {
                return data === 1;
            }, function () {
                return true;
            });
        }

        function hasDuplicateIP(deviceId, ip, isFactory) {
            if (!ip) {
                return false;
            }
            return getDevice(topologyId.id, ip).then(function (data) {
                return data && data['deviceId'] && data['deviceId'] !== deviceId && ((isFactory) ? true : data.iconType !== 'subnet');
            }, function () {
                return true;
            });
        }

        function createIPMACBinding(param, ip) {
            return $http.post(UCD.getUrl(ip) + URI + '/devices/ipmac/set', param);
        }

        function deleteIPMACBinding(ip) {
            return $http.put(UCD.getUrl(ip) + URI + '/devices/ipmac/delete');
        }

        function getAllForIpMacBinding(params, topoId, ip) {
            return $http.get(UCD.getUrl(ip) + url + UCD.getDomain(ip, (topoId || topologyId.id)).topoId, {
                params: encodeURL(params)
            }).then(function (data) {
                if (data.data) {
                    for (var i = 0; i < data.data.length; i++) {
                        data.data[i]._ipmacBoolean = data.data[i]._ipmac === 1;
                    }
                }
                return data.data;
            });
        }

        function updateNodeProperty(nodeId, param) {
            return $http.put(URI + '/topologies/node/' + nodeId + '/nodeProperty', param).then(function (data) {
                return data.data;
            });
        }

        function getSubTopo(deviceId) {
            return $http.get(URI + '/topologies/subTopology/device/' + deviceId).then(function (data) {
                return data.data;
            });
        }

        function deleteOneDevice(deviceId) {
            return $http.delete(URI + '/devices/topology/' + topologyId.id + '/' + deviceId);
        }

        function getAllNodeZone(params) {
            return $http.get(URI + '/topologies/' + topologyId.id + '/allzones', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function addNodeZone(data) {
            return $http.post(URI + '/topologies/' + topologyId.id + '/nodeZone', data);
        }

        function updateZoneName(data) {
            return $http.put(URI + '/topologies/' + topologyId.id + '/nodeZone/' + data.nodeZoneId + '/zoneName', data);
        }

        function deleteNodeZones(data, callback) {
            $http({
                url: URI + '/topologies/' + topologyId.id + '/nodeZones',
                method: 'DELETE',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .success(function () {
                    callback();
                })
                .error(function (data) {
                    callback(data.error);
                });
        }

        function getNodeZoneCount(params) {
            return $http.get(URI + '/topologies/' + topologyId.id + '/nodeZone/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function updateNodeAssociation(deviceId, nodeZoneId) {
            return $http.put(URI + '/topologies/Device/' + deviceId + '/NodeZone/' + nodeZoneId).then(function (data) {
                return data.data;
            });
        }

        // remove new detected device, the topologyId will be always 0
        function removeNewDevice(deviceId) {
            return $http.delete(url + '-1/securitydevice/' + deviceId).then(function (data) {
                return data.data;
            });
        }

        function updateAllDevicePorts(topologyId, deviceId, data) {
            return $http({
                url: url + topologyId + '/device/' + deviceId + '/deviceports',
                method: 'PUT',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (data) {
                return data.data;
            });
        }

        function removeNodeByID(id) {
            return $http.delete(URI + '/topologies/node/' + id);
        }

        function getDebuginfoCollection(params) {
            return $http.get(URI + '/devices/debuginfos', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function collectDebuginfo(payload, callback) {
            $http({
                url: URI + '/devices/dodebug',
                method: 'POST',
                data: payload,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                callback(data);
            }).error(function (err) {
                callback(null, err);
            });
        }

        function getConfBackUpInfos(params) {
            return $http.get(URI + '/devices/backupinfos', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getConfBackUpInfoCount(params) {
            return $http.get(URI + '/devices/backupinfos/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function doConfBackUp(payload, callback) {
            $http({
                url: URI + '/devices/backup',
                method: 'POST',
                data: payload,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function (data) {
                callback(data);
            }).error(function (err) {
                callback(null, err);
            });
        }

        function deleteBackUpFiles(ids, callback) {
            $http({
                url: URI + '/devices/backup',
                method: 'DELETE',
                data: ids,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function () {
                callback();
            }).error(function (data) {
                callback(data.error);
            });
        }


        function getConfBackUpFileInfos(params) {
            return $http.get(URI + '/devices/confbackupinfos', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getConfBackUpFileInfoCount(params) {
            return $http.get(URI + '/devices/confbackupinfos/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function deleteConfBackUpFiles(ids, callback) {
            $http({
                url: URI + '/devices/confbackup',
                method: 'DELETE',
                data: ids,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function () {
                callback();
            }).error(function (data) {
                callback(data.error);
            });
        }

        function restoreConfBackUpFiles(payload) {
            return $http.put(URI + '/devices/confrestoration',payload);
        }

        function getSecretKey() {
            return $http.get(URI + '/devices/secretkey');
        }
    }
})();
