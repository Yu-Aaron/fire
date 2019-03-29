/**
 * Alarms Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Alarm', AlarmModel);

    function AlarmModel($http, URI, topologyId, encodeURL, MOCK) {
        //var url = URI + '/alarms/topology/';

        var service = {
            get: get,
            getCount: getCount,
            update: update
        };

        return service;

        //////////
        function get(params) {
            return $http.get(MOCK + "alarm/get.json").then(function (data) {
                console.log(params);
                return data.data;
            });
        }

        function getCount() {
            return $http.get(MOCK + "alarm/getCount.json").then(function (data) {
                return data.data;
            });
        }

        function update() {
            return $http.get(MOCK + "num.json").then(function (data) {
                return data.data;
            });
        }
    }
})();