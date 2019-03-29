/**
 * Created by Morgan on 14-12-22.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .service('Dashboard', DashboardModel);

    function DashboardModel($http, $rootScope, URI, topologyId, UCD, encodeURL, $q) {
        var dashboardurl = URI + '/dashboards/';

        var service = {
            getRuleDeployedCount: getRuleDeployedCount,
            getSignatureDeployedCount: getSignatureDeployedCount,
            getStrategyDeployCount:getStrategyDeployCount,
            getWhiteListPolicyUpdateTime: getWhiteListPolicyUpdateTime,
            getBlackListPolicyUpdateTime: getBlackListPolicyUpdateTime,
            getPeakHour: getPeakHour,
            getHeartBeat: getHeartBeat,
            updateDashboard: updateDashboard,
            getTodoList: getTodoList,
            updateTodoList: updateTodoList,
            doTodoItem: doTodoItem,
            getIPRuleDeployedCount: getIPRuleDeployedCount,
            getIPRulePolicyUpdateTime: getIPRulePolicyUpdateTime
        };

        return service;

        //////////
        function getRuleDeployedCount() {
            return $http.get(UCD.getUrl($rootScope.currentIp) + dashboardurl + 'policy/type/POLICY_DEPLOYED_RULE_COUNT');
        }

        function getSignatureDeployedCount() {
            return $http.get(UCD.getUrl($rootScope.currentIp) + dashboardurl + 'policy/type/POLICY_DEPLOYED_SIGNATURE_COUNT');
        }

        function getStrategyDeployCount(){
            //TODO
            return $q.resolve(22) ;
        }

        function localize(d) {
            var date = new Date(d + " UTC").getTime();
            if (isNaN(date)) {
                return "N/A";
            }
            return date;
        }

        function getWhiteListPolicyUpdateTime() {
            return $http.get(dashboardurl + 'policy/type/POLICY_WHITELIST_UPDATED').then(function (data) {
                return localize(data.data.statsString);
            });
        }

        function getBlackListPolicyUpdateTime() {
            return $http.get(dashboardurl + 'policy/type/POLICY_SIGNATURE_UPDATED').then(function (data) {
                return localize(data.data.statsString);
            });
        }

        function getPeakHour() {
            return $http.get(UCD.getUrl($rootScope.currentIp) + dashboardurl + 'incident/topology/' + UCD.getDomain($rootScope.currentIp, topologyId.id).topoId + '/peakhour').then(function (data) {
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

        function getTodoList(param) {
            return $http.get(URI + '/todolists/topology/' + topologyId.id, {
                params: encodeURL(param)
            }).then(function (data) {
                return data.data;
            });
        }

        function updateTodoList(todoListId, data) {
            return $http.put(URI + '/todolists/topology/' + topologyId.id + '/todolist/' + todoListId + '/status', data).then(function (data) {
                return data.data;
            });
        }

        function doTodoItem(item) {
            return $http({
                method: item.operationMethod,
                url: URI + item.operationApi,
                data: item.operationContent,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (data) {
                return data.data;
            }, function (data) {
                return data.data;
            });
        }

        function getIPRuleDeployedCount() {
            return $http.get(dashboardurl + 'policy/type/POLICY_DEPLOYED_IP_RULE_COUNT');
        }

        function getIPRulePolicyUpdateTime() {
            return $http.get(dashboardurl + 'policy/type/POLICY_IP_RULE_UPDATED').then(function (data) {
                return localize(data.data.statsString);
            });
        }
    }
})();
