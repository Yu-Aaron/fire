/**
 * Created by Morgan on 14-12-02.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Logger', LoggerModel);

    function LoggerModel($http, URI, encodeURL, topologyId, MOCK) {
        var url = URI + '/operationlogs';

        var service = {
            get: get,
            getAll: getAll,
            getAllExport: getAllExport,
            getCount: getCount,
            getDPILogs: getDPILogs,
            getDPILogsExport: getDPILogsExport,
            getDPILogCount: getDPILogCount,
            createlog: createlog,
            mocklogs: mocklogs,
            getScheduleSetting: getScheduleSetting,
            setScheduleSetting: setScheduleSetting
        };
        return service;

        //////////

        function get() {  //id, type
            return $http.get(MOCK + "logger/getAll.json").then(function (data) {
                return data.data;
            });
        }

        function getAll() {
            return $http.get(MOCK + "logger/getAll.json").then(function (data) {
                return data.data;
            });
        }

        function getAllExport(params, psw) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: url + '/topology/' + topologyId.id + '/all/export',
                data: pdata,
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join("&");
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount() {
            return $http.get(MOCK + "num.json").then(function () {
                return Math.floor((Math.random() * 10) + 1);
            });
        }

        function getDPILogs() {
            return $http.get(MOCK + "array.json").then(function (data) {
                return data.data;
            });
        }

        function getDPILogsExport(params, type, psw) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: url + '/topology/' + topologyId.id + '/type/' + type + '/export',
                data: pdata,
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join("&");
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDPILogCount() { //params, type
            return $http.get(MOCK + "num.json").then(function (data) {
                return data.data;
            });
        }

        function createlog(log) {
            return $http.post('/api/v2.0/logger/createlog', {
                data: log
            });
        }

        function mocklogs() {
            return $http.get('/api/v2.0/logger/mocklogs');
        }

        function getScheduleSetting(category) {
            return $http.get(URI + "/jobscheduler/jobbuilder/category/" + category).then(function (data) {
                return data.data;
            });
        }

        function setScheduleSetting(data) {
            return $http.put(URI + "/jobscheduler/jobbuilder", data).then(function (data) {
                return data.data;
            });
        }
    }

})();
