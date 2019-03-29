(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('SyncRules', SyncRulesModel);

    function SyncRulesModel($http, URI, $q, encodeURL) {
        var policyurl = URI + '/policies/';

        var service = {
            getLatestSyncTask: getLatestSyncTask,
            checkSyncRules: checkSyncRules,
            getSyncResult: getSyncResult,
            getSyncResultCount: getSyncResultCount,
            addSyncResultToLib: addSyncResultToLib
        };
        return service;

        function getLatestSyncTask(policytype) {
            return $http.get(policyurl + 'policytype/' + policytype + '/synchronization/tasks?$orderby=startDatetime desc&$limit=1');
        }

        function checkSyncRules(topologyId, policytype) {
            return $http.post(policyurl + 'topology/' + topologyId + '/policytype/' + policytype + '/synchronization');
        }

        function getSyncResult(topologyId, params) {
            return $http.get(policyurl + 'topology/' + topologyId + '/temprules/', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getSyncResultCount(topologyId, params) {
            return $http.get(policyurl + 'topology/' + topologyId + '/temprules/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function addSyncResultToLib(topologyId, policytype, rules) {
            return $http.post(policyurl + 'topology/' + topologyId + '/policytype/' + policytype + '/temprules/addition', rules);
        }

    }
})();
