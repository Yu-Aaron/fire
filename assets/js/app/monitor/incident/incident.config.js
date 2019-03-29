/**
 * Monitor incident Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.incident')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('monitor.incident', {
            url: '/incident',
            controller: 'IncidentCtrl as incident',
            templateUrl: 'templates/monitor/incident/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'INCIDENT EVENT';
                }
            }
        }).state('monitor.incident.graph', {
            url: '/graph?panel',
            resolve: {
                menuState: function () {
                    return 'monitor.incident';
                }
            }
        }).state('monitor.incident.list', {
            url: '/list?panel',
            resolve: {
                menuState: function () {
                    return 'monitor.incident';
                }
            }
        }).state('monitor.incident.detail', {
            parent: 'dashboard',
            url: '/monitor/incident/:eventId',
            controller: 'IncidentDetailCtrl as detail',
            templateUrl: 'templates/monitor/incident/detail.html',
            resolve: {
                detail: function ($stateParams, $q, Incident, domain, apiInfo, secretKey){ // jshint ignore:line
                    var detail = {};

                    return apiInfo.sysbaseinfo().then(function (data) {
                        var now = new Date(data.data);
                        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        detail.startOfDay = startOfDay;
                        return Incident.getIncidentById($stateParams.eventId)
                            .then(function (data) {
                                detail.incident = data;
                                return $q.all([
                                    Incident.getAsset(detail.incident.sourceIp),
                                    Incident.getAsset(detail.incident.destinationIp)
                                ]);
                            }).then(function (data) {
                                detail.nodes = {};
                                var source = data[0].length > 0 ? data[0][0] : {};
                                source.category = 'ASSET';
                                detail.nodes[0] = source;

                                detail.nodes[1] = {};
                                detail.nodes[1].category = "SECURITY_DEVICE";
                                detail.nodes[1].name = "防火墙";

                                var destination = data[1].length > 0 ? data[1][0] : {};
                                destination.category = 'ASSET';
                                detail.nodes[2] = destination;

                                return detail;
                            });
                    });

                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'INCIDENT';
                },
                menuState: function () {
                    return 'monitor.incident';
                }
            }
        });
    }
})();
