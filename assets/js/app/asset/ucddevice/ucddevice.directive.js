/**
 * Asset Network Device Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.ucddevice')
        .directive('ucdDeviceTable', ucdDeviceTable);

    function ucdDeviceTable(Device, UCD, $rootScope, auth, $q, Topology) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/asset/ucddevice/ucdDeviceTable.html',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            var filter = 'category eq SECURITY_DEVICE';
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
                        for (var j = 0; j < data[i].devicePorts.length; j++) {
                            if (data[i].devicePorts[j].isMgmtPort) {
                                data[i].mmIP = data[i].devicePorts[j].portIp;
                            }
                        }
                    }
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
                            return (data);
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
        }
    }

})();
