/**
 * Monitor Device Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.device')
        .directive('ucdDevice', securityDevice);

    function securityDevice($q, Device, Topology, Enum, auth, $rootScope) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/device/ucdDevice.html',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            var filter = 'category eq SECURITY_DEVICE';
            var fullDeviceAccess = Enum.get('Role');
            if (!fullDeviceAccess[0].defaultRole) {
                var visibleDevice = Enum.get('deviceAccess');
                if (visibleDevice.length) {
                    filter += " and (";
                    filter += visibleDevice.map(function (field) {
                        return "contains(deviceId, '" + field + "')";
                    }).join(' or ');
                    filter += ")";
                } else {
                    filter += " and (contains(deviceId, 'null'))";
                }
            }
            ctrl.setConfig({
                name: 'device',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            ctrl.getSecondLevelTableData = function (p) {
                var ip;
                for (var i = 0; i < p.devicePorts.length; i++) {
                    if (p.devicePorts[i].isMgmtPort) {
                        ip = p.devicePorts[i].portIp;
                        break;
                    }
                }
                $q.all([auth.autoLogin(ip, '')]).then(function () {
                        var params = [];
                        if (!params['$orderby'] || params['$orderby'] === '') {
                            params['$orderby'] = 'name';
                        }
                        var payload = params || {};
                        payload['$filter'] = 'category ne SECURITY_DEVICE';
                        var iplist = $rootScope.ucdInfo;

                        var myTopoId;
                        if (iplist) {
                            iplist.filter(function (a) {
                                if (a.ip === ip) {
                                    myTopoId = a.topoId;
                                } else {
                                    myTopoId = a.topoId;
                                }
                            });
                        }

                        Device.getAll(payload, myTopoId, ip).then(function (data) {
                            ctrl.secondLevelTable = data;
                        });
                    }
                );
            };

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAll(payload).then(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i]._iconName = Device.getIconName(data[i].iconType);
                        for (var j = 0; j < data[i].devicePorts.length; j++) {
//              console.log(data[i].devicePorts[j]);
                            if (data[i].devicePorts[j].isMgmtPort) {
                                data[i].mmIP = data[i].devicePorts[j].portIp;
                            }
                        }
                    }
                    //console.log(data);
                    var arr = data.map(function (d) {
                        return Topology.getDeviceNodes(d.deviceId);
                    });
                    return arr.length ? $q.all(arr).then(function (nodes) {
                        var set = data.map(function (d, i) {
                            data[i].nodes = nodes[i];
                            return Device.getNodeRules(data[i].nodes).then(function (nodes) {
                                d.nodes = nodes;
                            });
                        });

                        return $q.all(set).then(function () {
                            return setNodeConnectionStatus(data);
                        });
                    }) : [];
                });
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getCount(payload);
            }

            function search(q) {
                return Device.search('SECURITY_DEVICE', q);
            }

            function setNodeConnectionStatus(data) {
                for (var i in data) {
                    if (i && data[i].nodes) {
                        for (var j in data[i].nodes) {
                            if (j && data[i].nodes[j].ports && data[i].nodes[j].type === 'IPS' && data[i].nodes[j].online === 1) {
                                for (var k in data[i].nodes[j].ports) {
                                    if (data[i].nodes[j].online !== 1) {
                                        break;
                                    } else {
                                        if (k && data[i].nodes[j].ports[k]) {
                                            for (var l in data[i].devicePorts) {
                                                if (l && data[i].devicePorts[l].portName === data[i].nodes[j].ports[k]) {
                                                    if (data[i].devicePorts[l].linkState !== 1) {
                                                        data[i].nodes[j].online = data[i].devicePorts[l].linkState;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return data;
            }
        }
    }
})();
