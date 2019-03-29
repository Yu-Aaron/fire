/**
 * Incident Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Incident', IncidentModel);

    function IncidentModel($http, URI, encodeURL) {
        var url = URI + '/incidents';

        var service = {
            getUnreadIncidentCount: getUnreadIncidentCount,
            getUnreadStrategyCount: getUnreadStrategyCount,
            getTodayIncidentCount: getTodayIncidentCount,
            getHistoryIncidentCount: getHistoryIncidentCount,
            getPeakHour: getPeakHour,
            getErrorCount: getErrorCount,
            getIncidents: getIncidents,
            getIncidentCount: getIncidentCount,
            updateIncidentStatus: updateIncidentStatus,
            markAllRead: markAllRead,
            deletedAll: deletedAll,
            getAllExport: getAllExport,
            getIncidentById: getIncidentById,
            getStartTime: getStartTime,
            getReport: getReport,
            getIpDevices: getIpDevices,
            getScheduleSetting: getScheduleSetting,
            setScheduleSetting: setScheduleSetting,
            getReportIp: getReportIp,
            getAsset: getAsset,
            getOutPutReport: getOutPutReport,
            getTimelineIncidents: getTimelineIncidents,
        };
        return service;

        ///////////

        function getUnreadIncidentCount() {
            return $http.get(url + '/unreadCount/incident').then(function (data) {
                return data.data;
            });
        }

        function getUnreadStrategyCount() {
            return $http.get(url + '/unreadCount/strategy').then(function (data) {
                return data.data;
                //return 1;
            });
        }

        function getTodayIncidentCount() {
            var zoneOffset = new Date().getTimezoneOffset() / 60 * -1;
            return $http.get(url + '/todayIncidentCount/' + zoneOffset).then(function (data) {
                return data.data;
            });
        }

        function getHistoryIncidentCount() {
            var zoneOffset = new Date().getTimezoneOffset() / 60 * -1;
            return $http.get(url + '/historyIncidentCount/' + zoneOffset).then(function (data) {
                return data.data;
            });
        }

        function getPeakHour() {
            var zoneOffset = new Date().getTimezoneOffset() / 60 * -1;
            return $http.get(url + '/peakHour/' + zoneOffset).then(function (data) {
                return data.data;
            });
        }

        function getErrorCount() {
            return $http.get(url + '/errorIncidentCount').then(function (data) {
                return data.data;
            });
        }

        function getIncidents(params) {
            return $http.get(url + '/incidents', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function getIncidentCount(params) {
            return $http.get(url + '/count/incident', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function updateIncidentStatus(id) {
            return $http.get(url + '/updateIncidentStatus/' + id).then(function (data) {
                return data.data;
            });
        }

        function markAllRead(type) {
            return $http.put(url + '/markallread/' + type).then(function (data) {
                return data.data;
            });
        }

        function deletedAll(type) {
            return $http.put(url + '/deleteAll/' + type).then(function (data) {
                return data.data;
            });
        }

        function getIncidentById(id) {
            return $http.get(url + "/" + id).then(function (data) {
                return data.data;
            });
        }

        function getStartTime() {
            return $http.get(url + "/starttime").then(function (data) {
                return data.data;
            });
        }

        function getReport(type, srcIp, dstIp, start, end, schedule) {
            return $http.get(url + '/report/type/' + type + '/srcIp/' + srcIp + '/dstIp/' + dstIp + '/start/' + start + '/end/' + end + '/schedule/' + schedule + '', {timeout: 300000}).then(function (data) {
                return data.data;
            });
        }

        function getIpDevices(start, end) {
            return $http.get(url + '/ipdevices/start/' + start + '/end/' + end + '').then(function (data) {
                return data.data;
            });
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

        function getAllExport(params, psw) {
            var pdata = psw ? {
                password: psw,
                clienttime: new Date().getTimezoneOffset() / 60
            } : {clienttime: new Date().getTimezoneOffset() / 60};
            return $http({
                method: 'POST',
                url: url + '/export',
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

        function getReportIp(type, ip, start, end) {
            return $http.get(url + '/report/type/' + type + '/ip/' + ip + '/start/' + start + '/end/' + end + '/', {timeout: 300000}).then(function (data) {
                return data.data;
            });
        }

        function getAsset(ip) {
            var filter = "";
            if (ip) {
                filter = filter + "ipAddress eq '" + ip + "'";
            }
            // if(mac){
            //     if(filter.length>0){
            //         filter = filter + " and ";
            //     }
            //     filter = filter + "macAddress eq '" + mac +"'";
            // }
            var payload = {'$filter': filter};

            return $http.get(URI + "/objects/asset/ipmac/set",
                {
                    params: encodeURL(payload)
                }).then(function (data) {
                return data.data;
            });
        }

        function getOutPutReport(image, image2,selectSrcIp,selectDstIp, start, end, type) {
            var pdata = {image: image, image2: image2};
            return $http({
                method: 'POST',
                url: url + '/export/Image/srcIp/' + selectSrcIp + '/dstIp/' + selectDstIp + '/start/' + start + '/end/' + end + '/type/' + type + '',
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


        function getTimelineIncidents(params) {
            return $http.get(URI + '/incidents/timeLine/startTime/' + params.start + '/endTime/' + params.end)
                .then(function (data) {
                    return data.data;
                });
        }


    }

})();
