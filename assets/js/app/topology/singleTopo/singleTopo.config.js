/**
 * Created by Morgan on 14-11-12.
 */
(function () {
    'use strict';

    angular
        .module('southWest.topology.singleTopo')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('topology.singleTopo', {
            url: '/topology/singleTopo',
            controller: 'singleTopoCtrl as singleTopo',
            templateUrl: 'templates/topology/singleTopo/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                },
                user: function (auth) {
                    return auth.whoAmI();
                },
                userRole: function (user, Enum, SystemUser) {
                    var role = Enum.get('Role');
                    if (role.length && role[0].roleId) {
                        return SystemUser.getUserGroup(role[0].roleId).then(function (data) {
                            return data;
                        }, function (error) {
                            return error;
                        });
                    }
                    return false;
                },
                topology: function (Topology) {
                    return Topology.getTopologies();
                },
                devices: function (topology, Device) {
                    var filter = '(category eq SECURITY_DEVICE)';
                    var payload = [];
                    payload['$filter'] = filter;
                    return Device.getAll(payload, topology.data[0].topologyId);
                }
            }
        }).state('topology.singleTopo.topo', {
            url: '/',
            controller: 'singleTopoCtrl as singleTopo',
            templateUrl: 'templates/topology/singleTopo/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'DEVICE_MANAGEMENT';
                }
            }
        });
    }
})();
