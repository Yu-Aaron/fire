/**
 * Redirect Service
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('redirect', redirect);

    function redirect($state, Enum, auth, Topology, Device, topologyId, uiCtrl, $rootScope) {

        var service = {
            teleport: teleport
        };
        return service;

        function teleport(currentstate) {
            if (auth.getUserType() === 1) {
                $state.transitionTo('domain');
            } else {
                Topology.getDevices(topologyId.id).then(function (nodes) {
                    var level;
                    if (!nodes.data.length) {
                        if (!currentstate) {
                            currentstate = 'REAL_TIME_PROTECTION';
                        }
                        Device.getDeviceDiscoverred().then(function (dpi) {
                            //console.log(dpi);
                            var sysSetting = Enum.get('privilege').filter(function (a) {
                                return a.name === 'SYSTEM_MANAGEMENT';
                            })[0].actionValue;
                            if (!dpi.data.length) {
                                //console.log("currentstate" + currentstate);
                                level = Enum.get('privilege').filter(function (a) {
                                    return a.name === 'TOPOLOGY';
                                })[0].actionValue;
                                if (level === 1) {
                                    if (sysSetting > 1) {
                                        $state.transitionTo("setting.systemconsole");
                                    } else {
                                        $state.transitionTo("myaccount");
                                    }
                                } else {
                                    $state.transitionTo("topology.singleTopo");
                                }
                            } else {
                                level = Enum.get('privilege').filter(function (a) {
                                    return a.name === 'DEVICE_MANAGEMENT';
                                })[0].actionValue;
                                if (level === 1) {
                                    if (sysSetting > 1) {
                                        $state.transitionTo("setting.systemconsole");
                                    } else {
                                        $state.transitionTo("myaccount");
                                    }
                                } else {
                                    $state.transitionTo("asset.securitydevice");
                                }
                            }
                        });
                    } else if ($rootScope.isC05 && Enum.get('Role')[0].name === "高级安全审计员") {
                        $state.go("monitor.logger");
                    } else if ($rootScope.isC05 && Enum.get('Role')[0].name === "高级系统管理员") {
                        $state.go("setting.systemconsole");
                    } else {
                        uiCtrl.findLand('OVERVIEW', 1);
                        //$state.transitionTo("monitor.overview");
                    }
                });
            }
        }
    }
})();
