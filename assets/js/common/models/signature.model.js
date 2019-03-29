/**
 * Created by Morgan on 14-10-28.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Signature', SignatureModel);

    function SignatureModel($http, URI, $q, encodeURL, UCD, $rootScope) {
        var policyurl = URI + '/policies/';

        var service = {
            get: get,
            getAll: getAll,
            getCount: getCount,
            uploadSignature: uploadSignature,
            signatureIsValid: signatureIsValid,
            saveSignature: saveSignature,
            deploy: deploy,
            deployAll: deployAll,
            removeSchedule: removeSchedule,
            updateSchedule: updateSchedule,
            updateStatus: updateStatus,
            getRulesbyBlockId: getRulesbyBlockId,
            getSignaturesbyBlockId: getSignaturesbyBlockId,
            getIPMACPolicy: getIPMACPolicy,
            getIPMACSwitch: getIPMACSwitch,
            isMacNeeded: isMacNeeded,
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
            changeIPMACSwitch: changeIPMACSwitch,
            availableBlocks: availableBlocks,
            getPolicySignatureRulesCount: getPolicySignatureRulesCount,
            deleteAllBlocksByPolicyIdandType: deleteAllBlocksByPolicyIdandType,
            deleteBlocksByBlockIds: deleteBlocksByBlockIds,
            deletePolicySetByPolicyId: deletePolicySetByPolicyId,
            exportWhitelistTemplate: exportWhitelistTemplate,
            getMaliciousDomainPolicy: getMaliciousDomainPolicy,
            getMaliciousDomains: getMaliciousDomains,
            getMaliciousDomainCount: getMaliciousDomainCount,
            changeActionToMaliciousDomain: changeActionToMaliciousDomain,
            addMaliciousDomain: addMaliciousDomain,
            deleteMaliciousDomain: deleteMaliciousDomain,
            deployMaliciousDomains: deployMaliciousDomains,
            changePriorityByDirection:changePriorityByDirection
        };
        return service;

        //////////
        function get() {
            var urlStr = UCD.getUrl($rootScope.currentIp) + '/api/v2.0/signatures';
            return $http.get(urlStr);
        }

        function getAll(policyId, status, type, category,desc, sid, signame, params) {
            var link = policyurl + 'policy/' + policyId + '/policytype/BLACKLIST/blocks';
            if (status) {
                link = link + '?lockstatus=' + status;
            }
            if (type) {
                link = link + '&type=' + type;
            }
            if (category) {
                link = link + '&category=' + category;
            }
            if (desc) {
                link = link + '&desc=' + desc;
            }
            if (sid) {
                link = link + '&sid=' + sid;
            }
            if (signame) {
                link = link + '&signame=' + signame;
            }
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(policyId, status, type, category, desc, sid, signame, params) {

            var link = policyurl + 'policy/' + policyId + '/policytype/BLACKLIST/blocks/count';
            if (status) {
                link = link + '?lockstatus=' + status;
            }
            if (type) {
                link = link + '&type=' + type;
            }
            if (category) {
                link = link + '&category=' + category;
            }
            if (desc) {
                link = link + '&desc=' + desc;
            }
            if (sid) {
                link = link + '&sid=' + sid;
            }
            if (signame) {
                link = link + '&signame=' + signame;
            }
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getRulesbyBlockId(blockId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'block/' + blockId + '/rules');
        }

        function insertRule(data) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + '/api/v2.0/signatures/insertRule', {
                data: data
            });
        }

        function updateSchedule(schedule) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + '/api/v2.0/signatures/updateSchedule', {
                data: schedule
            });
        }

        function updateStatus(schedule) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + '/api/v2.0/signatures/updateStatus', {
                data: schedule
            });
        }

        function removeSchedule(id) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + '/api/v2.0/signatures/removeSchedule', {
                data: id
            });
        }

        function saveSignature(sigs) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + '/api/v2.0/signatures/saveSignature', {
                data: sigs
            });
        }

        function getPolicyBlockbyPolicyId(policyId, status, type, params, policyType) {
            if (!policyType) {
                policyType = 'BLACKLIST';
            }
            var link = policyurl + 'policy/' + policyId + '/policytype/' + policyType + '/blocks';
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

        function getPolicyBlockCountbyPolicyId(policyId, status, type, params, policyType) {
            if (!policyType) {
                policyType = 'BLACKLIST';
            }
            var link = policyurl + 'policy/' + policyId + '/policytype/' + policyType + '/blocks/count';
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

        function signatureIsValid(file) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: UCD.getUrl($rootScope.currentIp) + policyurl + 'vulnerabilities/fileupload/isValid',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function uploadSignature(file) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: UCD.getUrl($rootScope.currentIp) + policyurl + 'vulnerabilities/fileupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function createPolicy() {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'newid');
        }

        function getPolicies(ptype) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'getPolicies?$filter=lockedType eq READYDEPLOY and policyType eq ' + ptype + '&$orderby=inUse desc, updatedAt desc');
        }

        function getDeployedPolicy(ptype) {
            if (ptype) {
                return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'getPolicies?$filter=inUse eq true and policyType eq ' + ptype);
            } else {
                return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'getPolicies?$filter=inUse eq true');
            }
        }

        function getPolicy(policyId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId);
        }

        function getBlacklist() {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'getPolicies?$filter=lockedType eq READYDEPLOY&_signaturesCount gt 0&$orderby=inUse desc');
        }

        function deploy(policyId, ip) {
            return $http.post(UCD.getUrl(ip || $rootScope.currentIp) + policyurl + policyId + '/deploy');
        }

        function deployAll(DpiIds, type) {
            return $http.post(policyurl + 'policytype/' + type + '/all/deploy', DpiIds);
        }

        function changePolicyName(policyId, name) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId, {
                'name': name
            });
        }

        function unlock(policyId, policyName, policyBlockIdList, policyType) {
            return $http.post(policyurl + 'policy/' + policyId + '/policytype/' + policyType + '/blocktype/signature/unlock?policyname=' + policyName, policyBlockIdList);
        }

        function unlockAll(policyId, policyName, policyType) {
            return $http.post(policyurl + 'policy/' + policyId + '/policytype/' + policyType + '/unlockall?policyname=' + policyName);
        }

        function changePolicyRiskLevel(topologyId, policyId, riskLevel) {
            return $http.put(policyurl + 'topology/' + topologyId + '/policy/' + policyId + '/risklevel/' + riskLevel);
        }

        function changePolicyBlockRiskLevel(policyBlockId, riskLevel) {
            return $http.put(policyurl + 'policyblock/' + policyBlockId + '/risklevel/' + riskLevel);
        }

        function changeSignatureRiskLevel(signatureId, riskLevel) {
            return $http.put(policyurl + 'signature/' + signatureId + '/risklevel/' + riskLevel);
        }

        function changeRuleRiskLevel(ruleId, riskLevel) {
            return $http.put(policyurl + 'rule/' + ruleId + '/risklevel/' + riskLevel);
        }

        function getSignaturesbyBlockId(blockId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'block/' + blockId + '/signatures');
        }

        function getPolicyByPolicyId(policyId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId);
        }

        function changePriority(policyId, policyBlock, targetOrder) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId + '/blocks/priority', {
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
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'block/' + blockId + '/rule/' + ruleId, {
                'action': action
            });
        }

        function changeFields(blockId, ruleId, fields) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'block/' + blockId + '/rule/' + ruleId, {
                'fields': fields
            });
        }

        function changeActionToAllInOnePolicy(policyId, param) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId + '/signatures', param);
        }

        function changeActionToAllinOnePolicyBlock(policyBlockId, param) {
            console.log(param);
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'block/' + policyBlockId + '/signatures', param);
        }

        function changeDefaultRuleAction(policyId, action1, action2) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId + '/defaultrules', {
                "supportRuleAction": action1,
                "unknownRuleAction": action2
            });
        }

        function cleanDeploy(policyType) {
            return $http.delete(UCD.getUrl($rootScope.currentIp) + policyurl + 'policytype/' + policyType);
        }

        function availableBlocks(policyId, blockType, policyBlockIdArray) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId + '/blocktype/' + blockType + '/availableblocks', policyBlockIdArray);
        }

        function getPolicySignatureRulesCount(policyId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId + '/sigrules/count');
        }

        function deleteAllBlocksByPolicyIdandType(policyId, policytype) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'policyid/' + policyId + '/blocks/deleteall/type/' + policytype);
        }

        function deleteBlocksByBlockIds(BlockIds) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'blocks/delete', BlockIds);
        }

        function deletePolicySetByPolicyId(policyId) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId + '/policyset');
        }

        function exportWhitelistTemplate(policyId, ruleType) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + policyurl + 'policy/' + policyId + '/rule/' + ruleType + '/template/export').then(function (data) {
                return data.data;
            });
        }

        function getIPMACPolicy(ip) {
            return $http.get(UCD.getUrl(ip || $rootScope.currentIp) + policyurl + 'ipmac');
        }

        function getIPMACSwitch() {
                return $http.get(URI + '/servicesetting/ipmacswitch');
        }

        function isMacNeeded() {
            return getIPMACSwitch().then(function (data) {
                var result = false;
                data.data.map(function (d) {
                    if (d.subscriptionType === "IP_MAC" && d.operationStatus === 0) {
                        result = d.subscriptionStatus !== "OFF";
                    }
                });
                return result;
            }, function () {
                return false;
            });
        }

        function changeIPMACAction(param, ip) {
            return $http.put(UCD.getUrl(ip || $rootScope.currentIp) + policyurl + 'ipmacaction', param);
        }

        function changeIPMACSwitch(param) {
            return $http.post(URI + '/servicesetting/ipmacswitch', param);
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
        function changePriorityByDirection(policyId,policyBlocks,direction,size){
            return $http.put(policyurl + 'policy/' + policyId + '/blocks/prioritys/direction/'+direction+'/size/'+size, policyBlocks);
        }
    }
})();
