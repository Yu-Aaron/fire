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

    function TemplateModel($http, URI) {
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
            return $http.get(tempurl + policyId + '/blocks?lockstatus=NoDeploy');
        }

        function uploadTemplate(file, topologyId) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: tempurl + 'topology/' + topologyId + '/rule/template/fileupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function unlock(topologyId, policyId, policyName, policyBlockIdList) {
            return $http.post(tempurl + 'topology/' + topologyId + '/policy/' + policyId + '/blocktype/template/unlock?policyname=' + policyName, policyBlockIdList);
        }

        function deploy(policyId) {
            return $http.post('/api/v2.0/templates/deploy', {
                data: policyId
            });
        }

        function changeAction(blockId, signatureId, action) {
            return $http.put(tempurl + 'block/' + blockId + '/signature/' + signatureId, {
                'action': action
            });
        }

        function getSimilarEvent(topologyId, incidentId) {
            return $http.get(tempurl + 'topology/' + topologyId.id + '/incident/' + incidentId + '/action').then(function (data) {
                return data.data;
            });
        }

        function updateSimilarEvent(topologyId, incidentId, params) {
            return $http.post(tempurl + 'topology/' + topologyId.id + '/incident/' + incidentId + '/action', params).then(function (data) {
                return data.data;
            });
        }
    }

})();
