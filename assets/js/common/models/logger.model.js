/**
 * Created by Morgan on 14-12-02.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Logger', LoggerModel);

    function LoggerModel($http, URI, encodeURL) {
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
            setScheduleSetting: setScheduleSetting,
            getStartTime: getStartTime,
            getReport: getReport,
            getOutPutReport: getOutPutReport,
            deleteLogDc: deleteLogDc,
            deleteLogDf: deleteLogDf,
            deleteLogDl: deleteLogDl,
            deleteLogPf: deleteLogPf,
            deleteLogPl: deleteLogPl,
            deleteEvent: deleteEvent,
            clearLogDc: clearLogDc,
            clearLogDf: clearLogDf,
            clearLogDl: clearLogDl,
            clearLogPf: clearLogPf,
            clearLogPl: clearLogPl,
            clearEvents: clearEvents
        };
        return service;

        //////////

        function get(id, type) {
            return $http.get(url + '/operationlog/' + id + '/type/' + type).then(function (data) {
                return data.data;
            });
        }

        function getAll(params) {
            return $http.get(url + '/all', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getAllExport(params, psw, type) {
            var pdata = psw ? {password: psw} : null;
            if (type !== undefined && type !== null) {
                pdata = angular.extend(pdata ? pdata : {}, {"type": type});
            }
            return $http({
                method: 'POST',
                url: url + '/all/export',
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

        function getCount(params) {
            return $http.get(url + '/all/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDPILogs(params, type) {
            return $http.get(url + '/type/' + type, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDPILogsExport(params, type, psw) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: url + '/type/' + type + '/export',
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

        function getDPILogCount(params, type) {
            return $http.get(url + '/type/' + type + '/count', {
                params: encodeURL(params)
            }).then(function (data) {
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

        function getStartTime() {
            return $http.get(url + '/starttime'
            ).then(function (data) {
                return data.data;
            });
        }

        function getReport(start, end, schedule) {
            return $http.get(url + '/report/start/' + start + '/end/' + end + '/schedule/' + schedule + '', {timeout: 300000}).then(function (data) {
                return data.data;
            });
        }

        function getOutPutReport(image, image2, start, end, type) {
            var pdata = {image: image, image2: image2};
            return $http({
                method: 'POST',
                url: url + '/export/Image/start/' + start + '/end/' + end + '/type/' + type + '',
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
                }
            }).then(function (data) {
                return data.data;
            });
        }


        function deleteLogDc(logIds) {
            return $http.post(url + '/deleteDpiUserCmdLog', logIds);
        }

        function deleteLogDf(logIds) {
            return $http.post(url + '/deleteFwFlowdata', logIds);
        }

        function deleteLogDl(logIds) {
            return $http.post(url + '/deleteDpiUserLogin', logIds);
        }

        function deleteLogPf(logIds) {
            return $http.post(url + '/deleteOperationLog', logIds);
        }

        function deleteLogPl(logIds) {
            return $http.post(url + '/deleteMWLoginLog', logIds);
        }

        function clearLogDc() {
            return $http.post(url + '/clearDpiUserCmdLogs');
        }

        function clearLogDf() {
            return $http.post(url + '/clearFwFlowdatas');
        }

        function clearLogDl() {
            return $http.post(url + '/clearDpiUserLogins');
        }

        function clearLogPf() {
            return $http.post(url + '/clearOperationLogs');
        }

        function clearLogPl() {
            return $http.post(url + '/clearMWLoginLogs');
        }

        function deleteEvent(logIds) {
            return $http.post(url + '/deleteEvent', logIds);
        }

        function clearEvents() {
            return $http.post(url + '/clearEvents');
        }

    }

})();
