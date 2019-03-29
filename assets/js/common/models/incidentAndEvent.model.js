/**
 * IncidentAndEvent Module
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .service('_IncidentEventAPI', IncidentAndEventAPI);

    function IncidentAndEventAPI($http, URI, encodeURL, UCD, $rootScope, $q) {
        return function (name) {
            var url = URI + '/' + name + '';

            var service = {
                get: get,
                getAll: getAll,
                getCount: getCount,
                getIncidentsByDevice: getIncidentsByDevice,
                update: update,
                markAllRead: markAllRead,
                markAllDeleted: markAllDeleted,
                getAllExport: getAllExport,
                getScheduleSetting: getScheduleSetting,
                setScheduleSetting: setScheduleSetting,
                getGrouped: getGrouped,
                getRuleCountOnDevice: getRuleCountOnDevice,
                search: search
            };

            return service;

            //////////
            function get(id) {
                return $http.get(url + id).then(function (data) {
                    return data.data;
                });
            }

            function getAll(params) {
                return $http.get(url, {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            }

            function getCount(params, isIncidentCount) {
                if (isIncidentCount && name === 'incidents') {
                    return $http.get(UCD.getUrl($rootScope.currentIp) + url + '/incidentcount', {
                        params: encodeURL(params)
                    }).then(function (data) {
                        return data.data;
                    });
                } else {
                    return $http.get(UCD.getUrl($rootScope.currentIp) + url + '/count', {
                        params: encodeURL(params)
                    }).then(function (data) {
                        return data.data;
                    });
                }
            }

            function getIncidentsByDevice(deviceId, start) {
                return $http.get(url + '/devices/' + deviceId + '/' + start).then(function (data) {
                    return data.data;
                });
            }

            function update(id) {
                return $http.put(url + '/' + id).then(function (data) {
                    return data.data;
                });
            }

            function markAllRead() {
                return $http.put(url + '/markallread').then(function (data) {
                    return data.data;
                });
            }

            function markAllDeleted() {
                return $http.put(url + '/markalldeleted').then(function (data) {
                    return data.data;
                });
            }

            function getAllExport(params, psw) {
                var pdata = psw ? {password: psw} : null;
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

            function getGrouped(level, riskLevel, freq, start, end, params) {  //level could be one of: "warn", "error"  frequency could be one of: "hourly", "daily"
                return $http.get(url + "/points/level/" + level + (name === "incidents" ? ("/risklevel/" + riskLevel) : "") + "/frequency/" + freq + "/starttime/" + start.toISOString() + "/endtime/" + end.toISOString(), {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            }

            function search(keyword) {
                if (keyword) {
                    return $http.get(URI + '/datadictionaries/source/' + keyword).then(function (data) {
                        return data.data;
                    });
                } else {
                    var dfd = $q.defer();
                    dfd.resolve([]);
                    return dfd.promise;
                }
            }

            function getRuleCountOnDevice(deviceId, start, end, level, params) {
                return $http.get(URI + '/policies/devicesignaturecounts/' + deviceId + "/starttime/" + start.toISOString() + "/endtime/" + end.toISOString() + "/level/" + level, {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                }, function () {
                    return [
                        {
                            "signatureName": "test1",
                            "signatureCount": 2
                        },
                        {
                            "signatureName": "test2",
                            "signatureCount": 12
                        },
                        {
                            "signatureName": "test3",
                            "signatureCount": 12
                        },
                        {
                            "signatureName": "test4",
                            "signatureCount": 12
                        },
                        {
                            "signatureName": "test5",
                            "signatureCount": 12
                        },
                        {
                            "signatureName": "test6",
                            "signatureCount": 12
                        },
                        {
                            "signatureName": "test7",
                            "signatureCount": 12
                        },
                        {
                            "signatureName": "test8",
                            "signatureCount": 12
                        },
                        {
                            "signatureName": "CONTROL_MICROSYSTEMS_(Event_40)_TCP_UDP_Port_Change_Attempt",
                            "signatureCount": 15
                        },
                        {
                            "signatureName": "TROJAN_Win32/Wecorl.gen!A_Download",
                            "signatureCount": 26
                        },
                        {
                            "signatureName": "NETBIOS_SMB_llsrconnect_overflow_attempt",
                            "signatureCount": 19
                        }, {
                            "signatureName": "test1",
                            "signatureCount": 12
                        }
                    ];
                });
            }
        };
    }
})();
