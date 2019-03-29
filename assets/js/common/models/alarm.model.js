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

    function AlarmModel($http, URI, encodeURL) {
        var url = URI + '/alarms';

        var service = {
            get: get,
            getCount: getCount,
            update: update
        };

        return service;

        //////////
        function get(params) {
            return $http.get(url+'/getAlarms', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount() {
            return $http.get(url +  '/new/count').then(function (data) {
                return data.data;
            });
        }

        function update() {
            return $http.put(url + '/read').then(function (data) {
                return data.data;
            });
        }
    }
})();
