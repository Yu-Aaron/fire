/**
 * Created by Morgan on 14-12-29.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Custom', CustomModel);

    function CustomModel($q, $http, URI, encodeURL) {
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
            return $http.get(customurl + 'prompt', {
                params: params
            });
        }

        function getAll(topologyId, policyId, status, type, params) {

            var link = customurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocks';
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

        function getCount(topologyId, policyId, status, type, params) {

            var link = customurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocks/count';
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

        function createPolicyBlock(topologyId, policyId, customPolicyBlock) {
            return $http.post(customurl + 'topology/' + topologyId + '/policy/' + policyId + '/block', customPolicyBlock);
        }

        function createRule(policyBlockId, rule) {
            return $http.post(customurl + 'block/' + policyBlockId + '/rule', rule);
        }

        function deleteRule(ruleItems) {
            return $http.put(customurl + 'rules/delete', ruleItems);
        }

        function changePriority(blockId, param) {
            return $http.put(customurl + 'block/' + blockId + '/rules/priority', param);
        }

    }

})();
