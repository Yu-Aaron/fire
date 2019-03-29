/**
 * Attack Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Attack', AttackModel);

    function AttackModel($resource, $http, URI) {
        var Attack = $resource(URI + '/attack');

        var tempurl = URI + '/attackpaths/';

        var service = {
            get: get,
            createAttackPath: createAttackPath,
            downloadTargetFile: downloadTargetFile,
            deleteTargetFile: deleteTargetFile,
            getAttackTargetFilter: getAttackTargetFilter,
            getPath: getPath,
            getQuery: getQuery,
            getQueryDetail: getQueryDetail,
            createAttackTarget: createAttackTarget,
            editAttackTarget: editAttackTarget,
            getAttackTarget: getAttackTarget,
            updateAttackTarget: updateAttackTarget,
            uploadMultipleFiles: uploadMultipleFiles
        };

        return service;

        //////////
        function get() {
            return Attack.query().$promise;
        }

        function createAttackPath(id, data) {
            return $http.post(tempurl + "topology/" + id, data);

            // return $http({
            //     url: tempurl + topologyId + '/imageupload',
            //     method: 'POST',
            //     data: fd,
            //     transformRequest: angular.identity,
            //     headers: {
            //         'Content-Type': undefined
            //     }
            // });
        }

        function downloadTargetFile(fileId) {
            // return $http.get(URI+ '/files/type/attacktarget/fileid/' + fileId + '/download');
            return $http({
                url: URI + '/files/type/attacktarget/fileid/' + fileId + '/download',
                method: 'GET'
            });
        }

        function deleteTargetFile(fileId) {
            return $http({
                url: URI + '/files/fileid/' + fileId + '/filedelete',
                method: 'DELETE'
            });
        }

        function getPath(topologyId) {
            return $http.get(tempurl + 'topology/' + topologyId);
        }

        function getQuery() {
            return $http.get(tempurl + 'searchcriteria/');
        }

        function getQueryDetail(topologyId, detail) {
            // console.log(topologyId);
            // console.log(detail);
            return $http.get(tempurl + 'searchcriteria/topology/' + topologyId + '/' + detail);
        }

        function getAttackTargetFilter(topologyId, pathId, condition) {
            // console.log(tempurl+"topology/"+topologyId+"/attackpath/"+pathId+"/nodes?$filter=hasUSB%20eq%20true");
            // console.log(condition);
            return $http.get(tempurl + "topology/" + topologyId + "/attackpath/" + pathId + '/' + condition);
        }

        function createAttackTarget(pathId, data) {
            // console.log(pathId);
            return $http({
                url: tempurl + "attackpath/" + pathId + "/attacktarget",
                method: 'POST',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function editAttackTarget(pathId, targetId, data) {
            // console.log(pathId);
            return $http({
                url: tempurl + "attackpath/" + pathId + "/attacktarget/" + targetId,
                method: 'PUT',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function getAttackTarget(pathId) {
            // console.log(pathId);
            return $http.get(tempurl + "attackpath/" + pathId + "/targets");
        }

        function updateAttackTarget(pathId, targetId, data) {
            return $http({
                url: tempurl + "attackpath/" + pathId + "/attacktarget/" + targetId,
                method: 'PUT',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function uploadMultipleFiles(targetId, file) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: URI + '/files/type/attackpath/sourceid/' + targetId + '/multipleupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }
    }
})();
