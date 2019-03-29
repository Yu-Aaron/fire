/**
 * Created by Morgan on 51-15-92.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('mOverview', mOverview);

    function mOverview($http, URI, MOCK) {
        var service = {

            getDashboardUserProfile: getDashboardUserProfile,
            setDashboardUserProfile: setDashboardUserProfile,
            setUserWidgetOption: setUserWidgetOption,
            getSystemUsage: getSystemUsage,
            getETHList: getETHList
        };
        return service;

        //////////




        function getDashboardUserProfile() {
            return $http.get(MOCK + "overview/getDashboardUserProfile.json");
        }

        function setDashboardUserProfile() {
            return $http.get(MOCK + "overview/getDashboardUserProfile.json");
        }

        function setUserWidgetOption(data) {
            return $http.get(MOCK + "overview/getDashboardUserProfile.json").then(function () {
                var d = {data: data};
                return d;
            });
        }

        function getSystemUsage() {
            var result = {};
            return $http.get(MOCK + "overview/getSystemUsage.json").then(function (data) {
                if (data.data) {
                    result.cpu = data.data.cpuUsage;
                    result.memory = data.data.memoryUsage;
                    result.storage = 0;
                    for (var i = 0; i < data.data.partitionUsage.length; i++) {
                        if (data.data.partitionUsage[i].partitionName === '/data') {
                            result.storage = data.data.partitionUsage[i].usage;
                            break;
                        }
                    }
                    return result;
                } else {
                    result.cpu = result.memory = result.storage = 0;
                    return result;
                }
            });
        }

        function getETHList() {
            return $http.get(MOCK + "overview/getETHList.json")
                .then(function (data) {
                    return data.data;
                });
        }
    }

})();
