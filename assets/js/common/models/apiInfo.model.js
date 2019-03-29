/**
 * Created by Morgan on 14-12-02.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('apiInfo', apiInfo);

    function apiInfo($http, $rootScope) {


        var service = {
            getFullApi: getFullApi,
            sysbaseinfo: sysbaseinfo,
            getCurDate: getCurDate
        };
        return service;

        //////////

        function getFullApi() {
            return $http.get('/api');
        }

        function sysbaseinfo() {
            return $http.get('/api/v2.0/sysbaseinfo/curtime', {
                ignoreLoadingBar: true
            }).then(function (data) {
                $rootScope.currentTime = new Date(data.data || "");
                return data;
            });
        }

        function getCurDate() {
            return $http.get('/api/v2.0/sysbaseinfo/curtimesimple');
        }

    }

})();
