/**
 * Created by Morgan on 14-12-02.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('apiInfo', apiInfo);

    function apiInfo($http, MOCK) {


        var service = {
            getFullApi: getFullApi,
            sysbaseinfo: sysbaseinfo
        };
        return service;

        //////////

        function getFullApi() {
            return $http.get(MOCK + 'apiInfo/getFullApi.json');
        }

        function sysbaseinfo() {
            return $http.get(MOCK + 'apiInfo/sysbaseinfo.json');
        }

    }

})();
