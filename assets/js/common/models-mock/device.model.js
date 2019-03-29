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

    function DeviceModel($q, $http, URI, topologyId, encodeURL, $filter, MOCK) {
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
            deleteOneDevice: deleteOneDevice,
            getAllNodeZone: getAllNodeZone,
            addNodeZone: addNodeZone,
            updateZoneName: updateZoneName,
            deleteNodeZones: deleteNodeZones,
            getNodeZoneCount: getNodeZoneCount,
            updateNodeAssociation: updateNodeAssociation,
            removeNewDevice: removeNewDevice
        };

        return service;

        //////////
        function getGroups() {
            //return $http.get(url + topologyId.id + '/devicegroup');
            return $http.get(MOCK + "array.json");
        }

        function createGroups() { //data
            //return $http.post(url + topologyId.id + '/devicegroup', data);
            return $http.get(MOCK + "array.json");
        }

        function updateGroups() { //groupId, idArray
            //return $http.put(url + topologyId.id + '/devicegroup/'+groupId, idArray);
            return $http.get(MOCK + "array.json");
        }

        function createDevice() { //params
            // return $http.post(url + topologyId.id, params).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "object.json").then(function (data) {
                return data.data;
            });
        }

        function createModel() {  //params
            // return $http.post(url + topologyId.id + '/models', params).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "object.json").then(function (data) {
                return data.data;
            });
        }

        function createNodes() {  //params
            // return $http.post(URI + '/topologies/' + topologyId.id + '/nodes', params).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "object.json").then(function (data) {
                return data.data;
            });
        }

        function updateNode() { //node
            // return $http.put(URI + '/topologies/node/' + node.id, {
            //   name : node.name,
            //   nodeZoneId: node.nodeZoneId,
            //   _MAC : node._MAC,
            //   _ip  : node._ip,
            //   type : node.type,
            //   ports : node.ports
            // });
            return $http.get(MOCK + "object.json");
        }

        function get(id) {
            var path = id === "92b1a79c-c98e-4224-a505-a1763f77c814" ? "get1.json" : id === "c68b3c7f-adc0-4b53-a044-3daad00a2ecf" ? "get2.json" : "get1.json";
            return $http.get(MOCK + "device/" + path).then(function (data) {
                return data.data;
            });
        }

        function getAll(params) {
            var jsonPath = (!params) ? "getAll_all.json" : params.$filter.includes("category eq SECURITY_DEVICE") ? "getAll_securityDevice.json" : params.$filter.includes("category eq FACTORY_DEVICE") ? "getAll_factoryDevice.json" : params.$filter.includes("category eq NETWORK_DEVICE") ? "getAll_networkDevice.json" : "getAll_all.json";
            return $http.get(MOCK + "device/" + jsonPath).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var jsonPath = (!params) ? "getCount_all.json" : params.$filter.includes("category eq SECURITY_DEVICE") ? "getCount_securityDevice.json" : params.$filter.includes("category eq FACTORY_DEVICE") ? "getCount_factoryDevice.json" : params.$filter.includes("category eq NETWORK_DEVICE") ? "getCount_networkDevice.json" : "getCount_all.json";
            return $http.get(MOCK + "device/" + jsonPath).then(function (data) {
                return data.data;
            });
        }

        function getModels(params) {
            var jsonPath = (!params) ? "getModels_all.json" : params.$filter.includes("category eq SECURITY_DEVICE") ? "getModels_securityDevice.json" : params.$filter.includes("category eq FACTORY_DEVICE") ? "getModels_factoryDevice.json" : params.$filter.includes("category eq NETWORK_DEVICE") ? "getModels_networkDevice.json" : "getModels_all.json";
            // return $http.get(url + (topologyId.id ? topologyId.id : '0') + '/models', {
            //     params: encodeURL(params)
            // }).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "device/" + jsonPath).then(function (data) {
                return data.data;
            });
        }

        function getNewDevices() {  //params
            // return $http.get(URI + '/devices/newdiscovered', {
            //     params: encodeURL(params)
            // }).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function getDevice(topologyid, deviceip) {
            // return $http.get(url + topologyId.id + '/deviceip/' + deviceip).then(function (data) {
            //     return data.data;
            // }, function () {
            //     return {
            //         name: '未知',
            //         iconType: 'unknown-device'
            //     };
            // });
            var jsonPath = (deviceip && deviceip === "10.0.10.59") ? "getDevice_59.json" : (deviceip && deviceip === "10.0.10.57") ? "getDevice_59.json" : "getDevice_unknown.json";
            return $http.get(MOCK + "device/" + jsonPath).then(function (data) {
                return data.data;
            });
        }

        function getDeviceByMac() {  // topologyid, deviceMac
            // return $http.get(url + topologyId.id + '/devicemac/' + deviceMac).then(function (data) {
            //     return data.data;
            // }, function () {
            //     return {
            //         name: '未知',
            //         iconType: 'unknown-device'
            //     };
            // });
            return $http.get(MOCK + "device/getDeviceByMac.json").then(function (data) {
                return data.data;
            });
        }

        function getBlocksRef() { // link, params
            // return $http.get(URI + link, {
            //     params: encodeURL(params)
            // }).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function getBlocksRefCount() {  //link, params
            // return $http.get(URI + link + '/count', {
            //     params: encodeURL(params)
            // }).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "num.json").then(function (data) {
                return data.data;
            });
        }

        function getIpsidsCount() {
            return $http.get(MOCK + "device/getIpsidsCount.json").then(function (data) {
                return data.data;
            });
        }

        function getNodeRules(nodes) {
            var n = nodes.map(function () { //n, i
                return $http.get(MOCK + "num.json").then(function (data) {
                    return data.data;
                });
            });

            return $q.all(n).then(function () {
                return nodes;
            });
        }

        function getDeviceDiscoverred() {
            // return $http.get(URI + '/devices/newdiscovered');
            return $http.get(MOCK + "array.json");
        }

        //================ Not in use ================
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

        //================ End of Not in use ================

        function getDPIInfo() {  //topologyId, serialNumber
            return $http.get(MOCK + "device/getDPIInfo.json").then(function (data) {
                data.data.cpuUsage = Math.random();
                return data;
            });
        }

        function getACLInfo(deviceId) {
            var path = deviceId === "92b1a79c-c98e-4224-a505-a1763f77c814" ? "array.json" : "array.json";
            return $http.get(MOCK + path)
                .then(function (data) {
                    return data.data;
                });
        }

        function getAllProtocols() {
            // return $http.get(URI+ '/devices/model/protocolCategory').then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + 'device/getAllProtocols.json').then(function (data) {
                return data.data;
            });
        }

        function deleteACL() { // deviceId, ACLId
            // return $http({
            //   url: URI + '/devices/device/' + deviceId + '/acl/delete',
            //   data: ACLId,
            //   method: 'PUT',
            //   headers: {
            //     'Content-Type': 'application/json'
            //   }
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function addACL() {  // deviceId, ACLdata
            // return $http({
            //   url: URI + '/devices/device/' + deviceId + '/acl',
            //   data: ACLdata,
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json'
            //   }
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function deployACL() { // device
            // return $http({
            //   url: URI + '/devices/topology/' + topologyId.id + '/device/' + device.deviceId + '/acl',
            //   data: device,
            //   method: 'PUT',
            //   headers: {
            //     'Content-Type': 'application/json'
            //   }
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
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

        function updateDevicePort() { // deviceId, port
            // return $http.put(URI + '/devices/' + deviceId + '/deviceports', port).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function updateSingleIpSubnet() { //topologyId, deviceId, portIp
            // return $http({
            //     method: 'PUT',
            //     url: url + topologyId + '/device/' + deviceId + '/ipsubnet',
            //     data: $.param(portIp),
            //     headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // }).then(function (data) {
            //     return data.data;
            // }, function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function updateMgmIpMac() {  // topologyId, deviceId, portIpMac
            // return $http.put(url + topologyId + '/device/' + deviceId + '/ipmac', portIpMac).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function update() { // deviceId, data
            // return $http.put(url + topologyId.id + '/' + deviceId, data).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function updateNodeProtocols() {  // nodeId, data
            // return $http.put(URI + '/topologies/node/' + nodeId + '/nodeProtocols', data).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function addToCurrentTopology() { // deviceId, key
            // return $http.put(url + topologyId.id + '/assigndevice/' + deviceId, key).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function configDevice() { // deviceId, data
            // return $http.put(URI + '/topologies/' + topologyId.id + '/device/' + deviceId + '/configdevice', data).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function search() { // category, txt
            // return $http.get(url + topologyId.id + '/' + category + '/search/' + txt).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function getDeviceRuleCount() { //topologyid, deviceid
            return $http.get(MOCK + "num.json").then(function () {
                return Math.floor((Math.random() * 10) + 1);
            });
        }

        function getDeviceSignatureCount() {  //topologyid, deviceid
            return $http.get(MOCK + "num.json").then(function () {
                return Math.floor((Math.random() * 10) + 1);
            });
        }

        function getIconName(IconType) {
            var iconType = IconType ? IconType.toLowerCase() : 'unknown-device';
            if (iconType !== 'cnc' && iconType !== 'cloud' && iconType !== 'unknown-device' && iconType !== 'deltav' && iconType !== 'hmi' && iconType !== 'ips' && iconType !== 'ips8' && iconType !== 'opc_client' && iconType !== 'opc_server' && iconType !== 'plc' && iconType !== 'router' && iconType !== 'switch' && iconType !== 'workstation' && iconType !== 'subnet' && iconType !== 'kea' && iconType !== 'kea-u1000' && iconType !== 'kea-u1000e' && iconType !== 'kea-u2000' && iconType !== 'kea-c200' && iconType !== 'kea-c400' && iconType !== 'ked-c400' && iconType !== 'kev-c200' && iconType !== 'kev-c400' && iconType !== 'ked' && iconType !== 'kec' && iconType !== 'kep') {
                iconType = 'unknown-device';
            }
            return iconType;
        }

        // returns a security device (IPS/IDS) image based on model name and iconType
        function getSecurityDeviceIconPath(modelName, iconType) {
            var iconPath = 'images/devices/security/';
            var iconName = "ips"; // fallback case: if both model name and iconType are unrecognized

            var fixedModelName = modelName ? ($filter('deviceModel')(modelName)).toLowerCase() : '';
            fixedModelName = fixedModelName.indexOf(' / ') > 0 ? fixedModelName.split(' / ')[1].toLowerCase() : fixedModelName;

            if (['kea-c200', 'kea-c400', 'ked-c400', 'kev-c200', 'kev-c400', 'kea-u1000', 'kea-u1000e', 'kea-u2000'].indexOf(fixedModelName) > -1) {
                iconName = fixedModelName;
            }
            else if (iconType) {
                iconType = iconType.toLowerCase();
                if (['ips', 'ips8', 'kea', 'ked', 'kec', 'kep'].indexOf(iconType) > -1) {
                    iconName = iconType;
                }
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

        function createIPMACBinding() { // topologyId, param
            // return $http.post(URI + '/devices/ipmac/topology/' + topologyId + '/set', param);
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function deleteIPMACBinding() { // topologyId
            // return $http.put(URI + '/devices/ipmac/topology/' + topologyId + '/delete');
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function getAllForIpMacBinding(params) {  // params, topoId
            // return $http.get(url + (topoId || topologyId.id), {
            //     params: encodeURL(params)
            // }).then(function (data) {
            //     if (data.data) {
            //       for (var i = 0; i < data.data.length; i++) {
            //         data.data[i]._ipmacBoolean = data.data[i]._ipmac === 1;
            //       }
            //     }
            //     return data.data;
            // });
            var jsonPath = (!params) ? "getAll_all.json" : params.$filter.includes("category eq SECURITY_DEVICE") ? "getAllForIpMacBinding_securityDevice.json" : params.$filter.includes("category eq FACTORY_DEVICE") ? "getAllForIpMacBinding_factoryDevice.json" : params.$filter.includes("category eq NETWORK_DEVICE") ? "getAllForIpMacBinding_networkDevice.json" : "getAllForIpMacBinding_all.json";
            return $http.get(MOCK + "device/" + jsonPath).then(function (data) {
                return data.data;
            });
        }

        function updateNodeProperty() { // nodeId, param
            // return $http.put(URI + '/topologies/node/' + nodeId + '/nodeProperty', param).then(function (data) {
            //   return data.data;
            // });
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function deleteOneDevice() { // deviceId
            // return $http.delete(URI + '/devices/topology/' + topologyId.id + '/' + deviceId);
            return $http.get(MOCK + "array.json");
        }

        function getAllNodeZone() { // params
            // return $http.get(URI + '/topologies/' + topologyId.id + '/allzones', {
            //     params: encodeURL(params)
            // }).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + 'device/getAllNodeZone.json').then(function (data) {
                return data.data;
            });
        }

        function addNodeZone() {  // data
            // return $http.post(URI + '/topologies/' + topologyId.id + '/nodeZone', data);
            return $http.get(MOCK + "array.json");
        }

        function updateZoneName() { // data
            // return $http.put(URI + '/topologies/' + topologyId.id + '/nodeZone/' + data.nodeZoneId + '/zoneName', data);
            return $http.get(MOCK + "array.json");
        }

        function deleteNodeZones(data, callback) {
            // $http({
            //     url: URI + '/topologies/' + topologyId.id + '/nodeZones',
            //     method: 'DELETE',
            //     data:data,
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // })
            //     .success(function(){
            //         callback();
            //     })
            //     .error(function (data) {
            //         callback(data.error);
            //     });

            return $http.get(MOCK + "array.json").success(function () {
                callback();
            })
                .error(function (data) {
                    callback(data.error);
                });
        }

        function getNodeZoneCount() { // params
            // return $http.get(URI + '/topologies/' + topologyId.id + '/nodeZone/count', {
            //     params: encodeURL(params)
            // }).then(function (data) {
            //         return data.data;
            // });
            return $http.get(MOCK + 'num.json').then(function (data) {
                return data.data;
            });
        }

        function updateNodeAssociation() {  // deviceId, nodeZoneId
            // return $http.put(URI + '/topologies/Device/' + deviceId + '/NodeZone/' + nodeZoneId).then(function (data) {
            //     return data.data;
            // });
            return $http.get(MOCK + 'array.json').then(function (data) {
                return data.data;
            });
        }

        // remove new detected device, the topologyId will be always 0
        function removeNewDevice() { // deviceId
            // return $http.delete(url + '-1/securitydevice/' + deviceId).then(function (data) {
            //   return data.data;
            // });
            return $http.get(MOCK + 'array.json').then(function (data) {
                return data.data;
            });
        }
    }
})();
