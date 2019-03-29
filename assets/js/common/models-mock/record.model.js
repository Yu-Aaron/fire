/**
 * System Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Record', RecordModel);

    function RecordModel($http, URI, encodeURL) {
        var recordUrl = URI + '/operationlogs';
        var service = {
            deleteRecord: deleteRecord,
            getBackupLogs: getBackupLogs,
            getBackupLogsCount: getBackupLogsCount,
            generateRecord: generateRecord,
            search: search
        };
        return service;

        //////////
        function deleteRecord(id) {
            return $http.put(recordUrl + '/backuplogs/delete', id);
        }

        function getBackupLogs(params) {
            return $http.get(recordUrl + '/backuplogs', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getBackupLogsCount(params) {
            return $http.get(recordUrl + '/backuplogs/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function generateRecord() {
            return $http.post(recordUrl + '/backuplog');
        }

        function search() {
            //return $http.get(url + topologyId.id + '/' + category + '/search/' + txt).then(function (data) {
            //  return data.data;
            //});
            return $http.get(recordUrl + '/backuplogs').then(function (data) {
                return data.data;
            });
        }
    }
})();
