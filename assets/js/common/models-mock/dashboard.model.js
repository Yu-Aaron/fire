/**
 * Created by Morgan on 14-12-22.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .service('Dashboard', DashboardModel);

    function DashboardModel($http, URI, topologyId, MOCK) {
        var dashboardurl = URI + '/dashboards/';

        var service = {
            getRuleDeployedCount: getRuleDeployedCount,
            getSignatureDeployedCount: getSignatureDeployedCount,
            getWhiteListPolicyUpdateTime: getWhiteListPolicyUpdateTime,
            getBlackListPolicyUpdateTime: getBlackListPolicyUpdateTime,
            getPeakHour: getPeakHour,
            getHeartBeat: getHeartBeat,
            updateDashboard: updateDashboard
        };

        return service;

        //////////
        function getRuleDeployedCount() {
            return $http.get(MOCK + "dashboard/getRuleDeployedCount.json");
        }

        function getSignatureDeployedCount() {
            return $http.get(MOCK + "dashboard/getSignatureDeployedCount.json");
        }

        function localize(d) {
            var date = new Date(d + " UTC").getTime();
            if (isNaN(date)) {
                return "N/A";
            }
            return date;
        }

        function getWhiteListPolicyUpdateTime(topologyId) {
            return $http.get(dashboardurl + 'policy/topology/' + topologyId + '/type/POLICY_UPDATED').then(function (data) {
                return localize(data.data.statsString);
            });
        }

        function getBlackListPolicyUpdateTime(topologyId) {
            return $http.get(dashboardurl + 'policy/topology/' + topologyId + '/type/POLICY_SIGNATURE_UPDATED').then(function (data) {
                return localize(data.data.statsString);
            });
        }

        function getPeakHour() {
            return $http.get(MOCK + "dashboard/getPeakHour.json").then(function (data) {
                return data.data;
            });
        }

        function getHeartBeat() {
            return $http.get(dashboardurl).then(function () {
                return;
            }, function (data) {
                return data;
            });
        }

        function updateDashboard(param) {
            return $http.put(dashboardurl + 'topology/' + topologyId.id + '/dashboard', param);
        }
    }
})();
