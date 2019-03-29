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

    function IncidentAndEventAPI($resource, $http, URI, topologyId, encodeURL, MOCK) {
        return function (name) {
            var url = URI + '/' + name + '/topology/';

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
            function get() {  // id
                // return $http.get(url + topologyId.id + '/' + id).then(function (data) {
                //     return data.data;
                // });
                if (name === 'incidents') {
                    return $http.get(MOCK + "incidentAndEvent/get_incident.json").then(function (data) {
                        return data.data;
                    });
                } else {
                    return $http.get(MOCK + "incidentAndEvent/get_event.json").then(function (data) {
                        return data.data;
                    });
                }
            }

            function getAll(params) {
                // For futuren use of params
                if (params) {
                    if (name === 'incidents') {
                        return $http.get(MOCK + "incidentAndEvent/getAll_incident.json").then(function (data) {
                            return data.data;
                        });
                    } else {
                        return $http.get(MOCK + "incidentAndEvent/getAll_event.json").then(function (data) {
                            return data.data;
                        });
                    }
                } else {
                    if (name === 'incidents') {
                        return $http.get(MOCK + "incidentAndEvent/getAll_incident.json").then(function (data) {
                            return data.data;
                        });
                    } else {
                        return $http.get(MOCK + "incidentAndEvent/getAll_event.json").then(function (data) {
                            return data.data;
                        });
                    }
                }
            }

            function getCount(params, isIncidentCount) {
                if (isIncidentCount && name === 'incidents') {
                    return $http.get(MOCK + "incidentAndEvent/getCount_incident.json").then(function (data) {
                        return data.data;
                    });
                } else {
                    return $http.get(MOCK + "incidentAndEvent/getCount_event.json").then(function (data) {
                        return data.data;
                    });
                }
            }

            function getIncidentsByDevice(deviceId) {
                return $http.get(MOCK + "num.json").then(function () {
                    var num = deviceId === "92b1a79c-c98e-4224-a505-a1763f77c814" ? 4 : deviceId === "999c3f9c-d209-417b-9694-62e464534b0f" ? 3 : 0;
                    return num;
                });
            }

            function update(id) {
                return $http.put(url + topologyId.id + '/' + id).then(function (data) {
                    return data.data;
                });
            }

            function markAllRead() {
                return $http.get(MOCK + "num.json").then(function (data) {
                    return data.data;
                });
            }

            function markAllDeleted() {
                return $http.get(MOCK + "num.json").then(function (data) {
                    return data.data;
                });
            }

            function getAllExport(params, psw) {
                var pdata = psw ? {password: psw} : null;
                return $http({
                    method: 'POST',
                    url: url + topologyId.id + '/export',
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

            function getGrouped(level, freq, start, end, params) {  //level could be one of: "warn", "error"  frequency could be one of: "hourly", "daily"
                return $http.get(url + topologyId.id + "/points/level/" + level + "/frequency/" + freq + "/starttime/" + start.toISOString() + "/endtime/" + end.toISOString(), {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            }

            function search(keyword) {
                return $http.get(MOCK + "incidentAndEvent/search.json").then(function (data) {
                    return keyword ? data.data : [];
                });
            }

            function getRuleCountOnDevice(deviceId, start, end, params) {
                return $http.get(URI + '/policies/topology/' + topologyId.id + "/devicesignaturecounts/" + deviceId + "/starttime/" + start.toISOString() + "/endtime/" + end.toISOString(), {
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
