/**
 * Created by Morgan on 14-10-31.
 */
/**
 * Created by Morgan on 14-10-28.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Template', TemplateModel);

    function TemplateModel($http, URI, UCD, $rootScope) {
        var tempurl = URI + '/policies/';

        var service = {
            get: get,
            uploadTemplate: uploadTemplate,
            deploy: deploy,
            unlock: unlock,
            changeAction: changeAction,
            getSimilarEvent: getSimilarEvent,
            updateSimilarEvent: updateSimilarEvent
        };
        return service;

        //////////
        function get(policyId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + tempurl + policyId + '/blocks?lockstatus=NoDeploy');
        }

        function uploadTemplate(file, policyType) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: tempurl + 'rule/policytype/' + policyType + '/blocktype/template/fileupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function unlock(policyId, policyName, policyBlockIdList, policyType) {
            return $http.post(tempurl + 'policy/' + policyId + '/policytype/' + policyType + '/blocktype/template/unlock?policyname=' + policyName, policyBlockIdList);
        }

        function deploy(policyId) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + '/api/v2.0/templates/deploy', {
                data: policyId
            });
        }

        function changeAction(blockId, signatureId, action) {
            return $http.put(UCD.getUrl($rootScope.currentIp) + tempurl + 'block/' + blockId + '/signature/' + signatureId, {
                'action': action
            });
        }

        function getSimilarEvent(topologyId, incidentId) {
            return $http.get(UCD.getUrl($rootScope.currentIp) + tempurl + 'topology/' + UCD.getDomain($rootScope.currentIp, topologyId.id).topoId + '/incident/' + incidentId + '/action').then(function (data) {
                return data.data;
            });
        }

        function updateSimilarEvent(topologyId, incidentId, params) {
            return $http.post(UCD.getUrl($rootScope.currentIp) + tempurl + 'topology/' + UCD.getDomain($rootScope.currentIp, topologyId.id).topoId + '/incident/' + incidentId + '/action', params).then(function (data) {
                return data.data;
            });
        }
    }

})();
