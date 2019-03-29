/**
 * Created by Morgan on 14-12-29.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Custom', CustomModel);

    function CustomModel($q, $http, URI, encodeURL, $rootScope, UCD) {
        var customurl = URI + '/policies/';

        var service = {
            getData: getData,
            getAll: getAll,
            getCount: getCount,
            createPolicyBlock: createPolicyBlock,
            createRule: createRule,
            deleteRule: deleteRule,
            changePriority: changePriority
        };
        return service;

        //////////


        function getData(params) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + customurl + 'prompt', {
                params: params
            });
        }

        function getAll(policyId, status, type, params, policyType) {
            var link = customurl + 'policy/' + policyId + '/policytype/' + policyType + '/blocks';
            if (status) {
                link = link + '?lockstatus=' + status;
            }
            if (type) {
                link = link + '&type=' + type;
            }
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });

           /* var link = customurl + 'topology/' + topologyId + '/policy/' + policyId + '/policytype/' + policyType + '/blocks';
            if (status) {
                link = link + '?lockstatus=' + status;
            }
            if (type) {
                link = link + '&type=' + type;
            }
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });*/
        }

        function getCount(policyId, status, type, params, policyType) {

            var link = customurl + 'policy/' + policyId + '/policytype/' + policyType + '/blocks/count';
            if (status) {
                link = link + '?lockstatus=' + status;
            }
            if (type) {
                link = link + '&type=' + type;
            }
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function createPolicyBlock(policyId, customPolicyBlock, policyType) {
            return $http.post(customurl + 'policy/' + policyId + '/policytype/' + policyType + '/block', customPolicyBlock);
        }

        function createRule(policyBlockId, rule) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + customurl + 'block/' + policyBlockId + '/rule', rule);
        }

        function deleteRule(ruleItems) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + customurl + 'rules/delete', ruleItems);
        }

        function changePriority(blockId, param) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + customurl + 'block/' + blockId + '/rules/priority', param);
        }

    }

})();
