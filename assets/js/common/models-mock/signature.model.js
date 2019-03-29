/**
 * Created by Morgan on 14-10-28.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Signature', SignatureModel);

    function SignatureModel($http, URI, $q, encodeURL, MOCK) {
        var policyurl = URI + '/policies/';

        var service = {
            get: get,
            getAll: getAll,
            getCount: getCount,
            uploadSignature: uploadSignature,
            saveSignature: saveSignature,
            deploy: deploy,
            removeSchedule: removeSchedule,
            updateSchedule: updateSchedule,
            updateStatus: updateStatus,
            getRulesbyBlockId: getRulesbyBlockId,
            getSignaturesbyBlockId: getSignaturesbyBlockId,
            getIPMACPolicy: getIPMACPolicy,
            insertRule: insertRule,
            getPolicies: getPolicies,
            getBlacklist: getBlacklist,
            createPolicy: createPolicy,
            getDeployedPolicy: getDeployedPolicy,
            getPolicy: getPolicy,
            getPolicyBlockbyPolicyId: getPolicyBlockbyPolicyId,
            getPolicyBlockCountbyPolicyId: getPolicyBlockCountbyPolicyId,
            getPolicyByPolicyId: getPolicyByPolicyId,
            unlock: unlock,
            unlockAll: unlockAll,
            changePolicyRiskLevel: changePolicyRiskLevel,
            changePolicyBlockRiskLevel: changePolicyBlockRiskLevel,
            changeSignatureRiskLevel: changeSignatureRiskLevel,
            changeRuleRiskLevel: changeRuleRiskLevel,
            changePriority: changePriority,
            getDefaultRulesByPolicyId: getDefaultRulesByPolicyId,
            changePolicyName: changePolicyName,
            changeAction: changeAction,
            changeFields: changeFields,
            changeActionToAllInOnePolicy: changeActionToAllInOnePolicy,
            changeActionToAllinOnePolicyBlock: changeActionToAllinOnePolicyBlock,
            cleanDeploy: cleanDeploy,
            changeDefaultRuleAction: changeDefaultRuleAction,
            changeIPMACAction: changeIPMACAction,
            availableBlocks: availableBlocks,
            getTopologyPolicySignatureRulesCount: getTopologyPolicySignatureRulesCount,
            deleteAllBlocksByPolicyIdandType: deleteAllBlocksByPolicyIdandType,
            deleteBlocksByBlockIds: deleteBlocksByBlockIds,
            exportWhitelistTemplateByTopologyId: exportWhitelistTemplateByTopologyId,
            getMaliciousDomainPolicy: getMaliciousDomainPolicy,
            getMaliciousDomains: getMaliciousDomains,
            getMaliciousDomainCount: getMaliciousDomainCount,
            changeActionToMaliciousDomain: changeActionToMaliciousDomain,
            addMaliciousDomain: addMaliciousDomain,
            deleteMaliciousDomain: deleteMaliciousDomain,
            deployMaliciousDomains: deployMaliciousDomains
        };
        return service;

        //////////
        function get() {
            return $http.get('/api/v2.0/signatures');
        }

        function getAll(topologyId, policyId, status, type, params) {

            var link = policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocks';
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

        function getCount() {   //topologyId, policyId, status, type, params
            return $http.get(MOCK + "num.json").then(function () {
                return Math.floor((Math.random() * 10) + 1);
            });
        }

        function getRulesbyBlockId(blockId) {
            return $http.get(policyurl + 'block/' + blockId + '/rules');
        }

        function insertRule(data) {
            return $http.post('/api/v2.0/signatures/insertRule', {
                data: data
            });
        }

        function updateSchedule(schedule) {
            return $http.post('/api/v2.0/signatures/updateSchedule', {
                data: schedule
            });
        }

        function updateStatus(schedule) {
            return $http.post('/api/v2.0/signatures/updateStatus', {
                data: schedule
            });
        }

        function removeSchedule(id) {
            return $http.post('/api/v2.0/signatures/removeSchedule', {
                data: id
            });
        }

        function saveSignature(sigs) {
            return $http.post('/api/v2.0/signatures/saveSignature', {
                data: sigs
            });
        }

        function getPolicyBlockbyPolicyId(topologyId, policyId, status, type, params) {
            var link = policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocks';
            if (status) {
                link = link + '?lockstatus=' + status;
            }
            if (type) {
                link = link + '&type=' + type;
            }
            return $http.get(link, {
                params: encodeURL(params)
            });
        }

        function getPolicyBlockCountbyPolicyId(topologyId, policyId, status, type, params) {
            var link = policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocks/count';
            if (status) {
                link = link + '?lockstatus=' + status;
            }
            if (type) {
                link = link + '&type=' + type;
            }
            return $http.get(link, {
                params: encodeURL(params)
            });
        }

        function uploadSignature(file) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: policyurl + 'vulnerabilities/fileupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function createPolicy() {
            return $http.get(policyurl + 'newid');
        }

        function getPolicies(topologyId, ptype) {
            return $http.get(policyurl + 'topology/' + topologyId + '?$filter=lockedType eq READYDEPLOY and policyType eq ' + ptype + '&$orderby=inUse desc');
        }

        function getDeployedPolicy(topologyId, ptype) {
            if (ptype) {
                return $http.get(policyurl + 'topology/' + topologyId + '?$filter=inUse eq true and policyType eq ' + ptype);
            } else {
                return $http.get(policyurl + 'topology/' + topologyId + '?$filter=inUse eq true');
            }
        }

        function getPolicy(policyId) {
            return $http.get(policyurl + 'policy/' + policyId);
        }

        function getBlacklist(topologyId) {
            return $http.get(policyurl + 'topology/' + topologyId + '?$filter=lockedType eq READYDEPLOY&_signaturesCount gt 0&$orderby=inUse desc');
        }

        function deploy(policyId) {
            return $http.post(policyurl + policyId + '/deploy');
        }

        function changePolicyName(topologyId, policyId, name) {
            return $http.put(policyurl + 'topology/' + topologyId + '/policy/' + policyId, {
                'name': name
            });
        }

        function unlock(topologyId, policyId, policyName, policyBlockIdList) {
            return $http.post(policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocktype/signature/unlock?policyname=' + policyName, policyBlockIdList);
        }

        function unlockAll(topologyId, policyId, policyName) {
            return $http.post(policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocktype/signature/unlockall?policyname=' + policyName);
        }

        function changePolicyRiskLevel(topologyId, policyId, riskLevel) {
            return $http.put(policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/risklevel/' + riskLevel);
        }

        function changePolicyBlockRiskLevel(topologyId, policyBlockId, riskLevel) {
            return $http.put(policyurl + 'topology/' + topologyId + '/policyblock/' + policyBlockId + '/risklevel/' + riskLevel);
        }

        function changeSignatureRiskLevel(topologyId, signatureId, riskLevel) {
            return $http.put(policyurl + 'topology/' + topologyId + '/signature/' + signatureId + '/risklevel/' + riskLevel);
        }

        function changeRuleRiskLevel(topologyId, ruleId, riskLevel) {
            return $http.put(policyurl + 'topology/' + topologyId + '/rule/' + ruleId + '/risklevel/' + riskLevel);
        }

        function getSignaturesbyBlockId(blockId) {
            return $http.get(policyurl + 'block/' + blockId + '/signatures');
        }

        function getPolicyByPolicyId(policyId) {
            return $http.get(policyurl + 'policy/' + policyId);
        }

        function changePriority(policyId, policyBlock, targetOrder) {
            return $http.put(policyurl + 'policy/' + policyId + '/blocks/priority', {
                "policyBlockId": policyBlock.policyBlockId,
                "currentOrder": policyBlock.priority,
                "targetOrder": targetOrder
            });
        }

        function getDefaultRulesByPolicyId(policyId) {
            return $q.when({
                'policyId': policyId,
                'action1': '阻断',
                'action2': "警告"
            });
            //return $http.get('/api/v2.0/signatures/getDefaultRulesByPolicyId/');
        }

        function changeAction(blockId, ruleId, action) {
            return $http.put(policyurl + 'block/' + blockId + '/rule/' + ruleId, {
                'action': action
            });
        }

        function changeFields(blockId, ruleId, fields) {
            return $http.put(policyurl + 'block/' + blockId + '/rule/' + ruleId, {
                'fields': fields
            });
        }

        function changeActionToAllInOnePolicy(policyId, param) {
            return $http.put(policyurl + 'policy/' + policyId + '/signatures', param);
        }

        function changeActionToAllinOnePolicyBlock(policyBlockId, param) {
            console.log(param);
            return $http.put(policyurl + 'block/' + policyBlockId + '/signatures', param);
        }

        function changeDefaultRuleAction(policyId, action1, action2) {
            return $http.put(policyurl + 'policy/' + policyId + '/defaultrules', {
                "supportRuleAction": action1,
                "unknownRuleAction": action2
            });
        }

        function cleanDeploy(topologyId, param) {
            return $http.delete(policyurl + 'topology/' + topologyId + '/policytype/' + param);
        }

        function availableBlocks(topologyId, policyId, blockType, policyBlockIdArray) {
            return $http.put(policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocktype/' + blockType + '/availableblocks', policyBlockIdArray);
        }

        function getTopologyPolicySignatureRulesCount(topologyId, policyId) {
            return $http.get(policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/sigrules/count');
        }

        function deleteAllBlocksByPolicyIdandType(policyId, policytype) {
            return $http.put(policyurl + 'policyid/' + policyId + '/blocks/deleteall/type/' + policytype);
        }

        function deleteBlocksByBlockIds(BlockIds) {
            return $http.put(policyurl + 'blocks/delete', BlockIds);
        }

        function exportWhitelistTemplateByTopologyId(topologyId, policyId) {
            return $http.get(policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/rule/template/export').then(function (data) {
                return data.data;
            });
        }

        function getIPMACPolicy(topologyId) {
            return $http.get(policyurl + 'topology/' + topologyId + '/ipmac');
        }

        function changeIPMACAction(topologyId, param) {
            return $http.put(policyurl + 'topology/' + topologyId + '/ipmacaction', param);
        }

        function getMaliciousDomainPolicy(topologyId) {
            return $http.get(policyurl + 'topology/' + topologyId + '?$filter=policyType eq MALICIOUS_DOMAIN');
        }

        function getMaliciousDomains(params) {
            return $http.get(policyurl + 'maliciousdomain', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getMaliciousDomainCount(params) {
            return $http.get(policyurl + 'maliciousdomain/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function changeActionToMaliciousDomain(domain) {
            return $http.put(policyurl + 'maliciousdomain', domain);
        }

        function addMaliciousDomain(domain) {
            return $http.post(policyurl + 'maliciousdomain', domain);
        }

        function deleteMaliciousDomain(id) {
            return $http.delete(policyurl + 'maliciousdomain/' + id);
        }

        function deployMaliciousDomains(method, policyId, domains) {
            return $http.post(policyurl + 'maliciousdomain/' + 'method/' + method + '/deploy/' + policyId, domains);
        }

    }
})();
