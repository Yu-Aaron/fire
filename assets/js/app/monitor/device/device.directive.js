/**
 * Monitor Device Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.device')
        .directive('securityDevice', securityDevice)
        .directive('factoryDevice', factoryDevice)
        .directive('networkDevice', networkDevice)
        .directive('deviceView', deviceView)
        .directive('deviceRules', deviceRules);

    function securityDevice($q, Device, Topology, Enum, topologyId, deviceTypeService, $filter) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/device/securityDevice.html',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            scope.simplifyModelName = deviceTypeService.simplifyModelName;
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

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAll(payload).then(function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i]._iconName = Device.getIconName(data[i].iconType);
                        var splitName = data[i]._model_name ? data[i]._model_name.split(' /') : [];
                        if (splitName[0] === "数控审计保护平台") {
                            data[i]._model_name = $filter('resFilter')(splitName[0], 'slideAuditTitle') + ' /' + splitName[1];
                        }
                    }
                    var arr = data.map(function (d) {
                        return Topology.getDeviceNodes(d.deviceId);
                    });
                    return arr.length ? $q.all(arr).then(function (nodes) {
                        var set = data.map(function (d, i) {
                            var parray = [];
                            for (var nd = 0; nd < nodes[i][0].ports.length; nd++) {
                                parray.push(+nodes[i][0].ports[nd].substr(1));
                            }
                            var p = parray.sort();
                            nodes[i][0].portRange = 'p' + p[0] + '-p' + p[p.length - 1];
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
                return Device.getCount(payload, topologyId.id);
            }

            function search(q) {
                return Device.search('SECURITY_DEVICE', q);
            }
        }
    }

    function factoryDevice(Device, topologyId, deviceTypeService) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/device/factoryDevice.html',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            var filter = 'category eq FACTORY_DEVICE';
            ctrl.setConfig({
                name: 'device',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getCount(payload, topologyId.id);
            }

            function search(q) {
                return Device.search('FACTORY_DEVICE', q);
            }

            ctrl.getType = function (type) {
                return deviceTypeService.getFactoryType(type);
            };
        }
    }

    function networkDevice(Device, topologyId, deviceTypeService) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/device/networkDevice.html',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            var filter = 'category eq NETWORK_DEVICE';
            ctrl.setConfig({
                name: 'device',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getCount(payload, topologyId.id);
            }

            function search(q) {
                return Device.search('NETWORK_DEVICE', q);
            }

            ctrl.getType = function (type) {
                return deviceTypeService.getNetworkType(type);
            };
        }
    }

    function deviceView() {
        var deviceViewObj = {
            scope: {
                device: '=',
                isEdit: '@'
            },
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/device/details/details-device-view.html',
            link: link
        };

        return deviceViewObj;

        //////////
        function link(scope) {
            scope.validateIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
            scope.validateSubnet = /^((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}(-((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}|\/((1|2|3(?=1|2))\d|\d))\b$/;
        }
    }

    function deviceRules(Device) {
        var deviceRulesObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/device/details/details-device-rules.html',
            link: link
        };

        return deviceRulesObj;

        function link(scope, el, attr, ctrl) {
            ctrl.disableToolbar = true;
            scope.disableToolbarButtons = true;
            ctrl.setConfig({
                name: 'rules',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                return Device.getBlocksRef(scope.detail.device.blocksRef.baseUrl, params);
            }

            function getCount(params) {
                return Device.getBlocksRefCount(scope.detail.device.blocksRef.baseUrl, params);
            }

            function search(q) {
                return Device.search('FACTORY_DEVICE', q);
            }
        }
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
})();
