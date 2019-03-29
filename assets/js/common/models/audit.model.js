/**
 * Audit Model
 *
 * Description
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Audit', auditModel)
        .factory('mwdata', mwdata)
        .factory("dpidevicedata", dpidevicedata)
        .factory("icdevicedata", icdevicedata)
        .factory("behaviordata", behaviordata);

    function auditModel($q, $http, URI, encodeURL, topologyId) {
        var url = URI + '/auditlogs';

        var service = {
            get: get,
            getDetails: getDetails,
            getDetailsCount: getDetailsCount,
            getAllByTime: getAllByTime,
            getAll: getAll,
            getAllReduction: getAllReduction,
            getSep: getSep,
            getReductionCount: getReductionCount,
            getCount: getCount,
            getCountByTime: getCountByTime,
            getDeviceData: getDeviceData,
            getFtpControlFlowData: getFtpControlFlowData,
            getViewCommand: getViewCommand,
            getDownloadCommand: getDownloadCommand,
            getDownloadZipPath: getDownloadZipPath,
            getDownloadFileZipPath: getDownloadFileZipPath,
            getAllExport: getAllExport,
            getGrouped: getGrouped,
            getScheduleSetting: getScheduleSetting,
            setScheduleSetting: setScheduleSetting,
            getAuditProtocolExport: getAuditProtocolExport,
            getForumpostAll: getForumpostAll,
            getForumpostCount: getForumpostCount,
            getForumpostExport: getForumpostExport,
            getSearchengineAll: getSearchengineAll,
            getSearchengineCount: getSearchengineCount,
            getSearchengineExport: getSearchengineExport,
            getHttpActionByIp: getHttpActionByIp,
            getSearchContentByIp: getSearchContentByIp,
            getForumpostByIp: getForumpostByIp
        };

        return service;

        //////////
        function get(id, type) {
            return $http.get(url + '/head/' + id + '/type/' + type).then(function (data) {
                return data.data;
            });
        }

        function getDetails(params, id, type) {
            return $http.get(url + '/head/' + id + '/type/' + type, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDetailsCount(id, type) {
            return $http.get(url + '/head/' + id + '/type/' + type + '/count').then(function (data) {
                return data.data;
            });
        }

        function getAll(params, type, hasAdvanceSearch) {

            var factory = (type === 'normal' || type === 'http' || type === 'ftp' || type === 'pop3' || type === 'smtp' || type === 'telnet') ? false : true;
            if (type && factory && hasAdvanceSearch) {
                return $http.get(url + '/detailinfo/type/' + type, {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            }

            return $http.get(url + '/heads', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });

        }

        function getForumpostAll(params) {
            return $http.get(url + '/content/forumpost/', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            }, function () {
                var json = '[{"id": 1,"usrIp": "192.168.11.12","usrMac": "00:0c:29:e7:6e:4d","forumName": "天涯论坛","titile": "懒惰是社会发展的源动力","postContent": "人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最终傲立食物链之巅。经过了数千年的发展社会制度越来越完善，人们也通过摸索学会了制造与使用更多的工具。　　有的人认为是因为人学会了分工和使用武器。是智慧使得人们更加强大。　　这些说法都有道理，但是我觉得，人之所以会使用工具，会分工合作全是因为人类的学习能力和懒惰的本性。　　懒惰是深深地潜藏在人骨子里的一种属性，也许有的人表现得很勤快，但是他仍然是有惰性的。不劳而获永远是最最吸引我们的一种诱惑。所以我们拼命地学习可以减少我们劳动力的方法，制造机器，分工合作也只是其中的一小部分罢了。　　在原始社会中，有的人个体比较强大，就会胁迫比较弱小的个体成为自己的下属，最终形成部落，部落相互吞并形成大部落，最后是国家。这时候阶级就表现出他独特的优势来了。因为上位者可以不用干活，而享受到最好的物品。这个时候维持这个社会的也是武力，只有强大的武力可以威慑民众不敢反抗。而后过了几代几十代形成了一种惯性，民众们习惯了上面有统治者的管理，才让国家这个形式流传到现在。而惯性的形成也是因为懒，只有懒得去改变才会形成习惯。　　到了现代社会，人们变得越发的懒惰，所以开始发明各种解放我们的双手的机械。　　归结到底，人们有需要，但是又不想劳动，才会去想着发明各种东西来代替自己工作。这样也带动了社会的发展。人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最终傲立食物链之巅。经过了数千年的发展社会制度越来越完善，人们也通过摸索学会了制造与使用更多的工具。　　有的人认为是因为人学会了分工和使用武器。是智慧使得人们更加强大。　　这些说法都有道理，但是我觉得，人之所以会使用工具，会分工合作全是因为人类的学习能力和懒惰的本性。　　懒惰是深深地潜藏在人骨子里的一种属性，也许有的人表现得很勤快，但是他仍然是有惰性的。不劳而获永远是最最吸引我们的一种诱惑。所以我们拼命地学习可以减少我们劳动力的方法，制造机器，分工合作也只是其中的一小部分罢了。　　在原始社会中，有的人个体比较强大，就会胁迫比较弱小的个体成为自己的下属，最终形成部落，部落相互吞并形成大部落，最后是国家。这时候阶级就表现出他独特的优势来了。因为上位者可以不用干活，而享受到最好的物品。这个时候维持这个社会的也是武力，只有强大的武力可以威慑民众不敢反抗。而后过了几代几十代形成了一种惯性，民众们习惯了上面有统治者的管理，才让国家这个形式流传到现在。而惯性的形成也是因为懒，只有懒得去改变才会形成习惯。　　到了现代社会，人们变得越发的懒惰，所以开始发明各种解放我们的双手的机械。　　归结到底，人们有需要，但是又不想劳动，才会去想着发明各种东西来代替自己工作。这样也带动了社会的发展。人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最终傲立食物链之巅。经过了数千年的发展社会制度越来越完善，人们也通过摸索学会了制造与使用更多的工具。　　有的人认为是因为人学会了分工和使用武器。是智慧使得人们更加强大。　　这些说法都有道理，但是我觉得，人之所以会使用工具，会分工合作全是因为人类的学习能力和懒惰的本性。　　懒惰是深深地潜藏在人骨子里的一种属性，也许有的人表现得很勤快，但是他仍然是有惰性的。不劳而获永远是最最吸引我们的一种诱惑。所以我们拼命地学习可以减少我们劳动力的方法，制造机器，分工合作也只是其中的一小部分罢了。　　在原始社会中，有的人个体比较强大，就会胁迫比较弱小的个体成为自己的下属，最终形成部落，部落相互吞并形成大部落，最后是国家。这时候阶级就表现出他独特的优势来了。因为上位者可以不用干活，而享受到最好的物品。这个时候维持这个社会的也是武力，只有强大的武力可以威慑民众不敢反抗。而后过了几代几十代形成了一种惯性，民众们习惯了上面有统治者的管理，才让国家这个形式流传到现在。而惯性的形成也是因为懒，只有懒得去改变才会形成习惯。　　到了现代社会，人们变得越发的懒惰，所以开始发明各种解放我们的双手的机械。　　归结到底，人们有需要，但是又不想劳动，才会去想着发明各种东西来代替自己工作。这样也带动了社会的发展。人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最终傲立食物链之巅。经过了数千年的发展社会制度越来越完善，人们也通过摸索学会了制造与使用更多的工具。　　有的人认为是因为人学会了分工和使用武器。是智慧使得人们更加强大。　　这些说法都有道理，但是我觉得，人之所以会使用工具，会分工合作全是因为人类的学习能力和懒惰的本性。　　懒惰是深深地潜藏在人骨子里的一种属性，也许有的人表现得很勤快，但是他仍然是有惰性的。不劳而获永远是最最吸引我们的一种诱惑。所以我们拼命地学习可以减少我们劳动力的方法，制造机器，分工合作也只是其中的一小部分罢了。　　在原始社会中，有的人个体比较强大，就会胁迫比较弱小的个体成为自己的下属，最终形成部落，部落相互吞并形成大部落，最后是国家。这时候阶级就表现出他独特的优势来了。因为上位者可以不用干活，而享受到最好的物品。这个时候维持这个社会的也是武力，只有强大的武力可以威慑民众不敢反抗。而后过了几代几十代形成了一种惯性，民众们习惯了上面有统治者的管理，才让国家这个形式流传到现在。而惯性的形成也是因为懒，只有懒得去改变才会形成习惯。　　到了现代社会，人们变得越发的懒惰，所以开始发明各种解放我们的双手的机械。　　归结到底，人们有需要，但是又不想劳动，才会去想着发明各种东西来代替自己工作。这样也带动了社会的发展。人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最终傲立食物链之巅。经过了数千年的发展社会制度越来越完善，人们也通过摸索学会了制造与使用更多的工具。　　有的人认为是因为人学会了分工和使用武器。是智慧使得人们更加强大。　　这些说法都有道理，但是我觉得，人之所以会使用工具，会分工合作全是因为人类的学习能力和懒惰的本性。　　懒惰是深深地潜藏在人骨子里的一种属性，也许有的人表现得很勤快，但是他仍然是有惰性的。不劳而获永远是最最吸引我们的一种诱惑。所以我们拼命地学习可以减少我们劳动力的方法，制造机器，分工合作也只是其中的一小部分罢了。　　在原始社会中，有的人个体比较强大，就会胁迫比较弱小的个体成为自己的下属，最终形成部落，部落相互吞并形成大部落，最后是国家。这时候阶级就表现出他独特的优势来了。因为上位者可以不用干活，而享受到最好的物品。这个时候维持这个社会的也是武力，只有强大的武力可以威慑民众不敢反抗。而后过了几代几十代形成了一种惯性，民众们习惯了上面有统治者的管理，才让国家这个形式流传到现在。而惯性的形成也是因为懒，只有懒得去改变才会形成习惯。　　到了现代社会，人们变得越发的懒惰，所以开始发明各种解放我们的双手的机械。　　归结到底，人们有需要，但是又不想劳动，才会去想着发明各种东西来代替自己工作。这样也带动了社会的发展。人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最终傲立食物链之巅。经过了数千年的发展社会制度越来越完善，人们也通过摸索学会了制造与使用更多的工具。　　有的人认为是因为人学会了分工和使用武器。是智慧使得人们更加强大。　　这些说法都有道理，但是我觉得，人之所以会使用工具，会分工合作全是因为人类的学习能力和懒惰的本性。　　懒惰是深深地潜藏在人骨子里的一种属性，也许有的人表现得很勤快，但是他仍然是有惰性的。不劳而获永远是最最吸引我们的一种诱惑。所以我们拼命地学习可以减少我们劳动力的方法，制造机器，分工合作也只是其中的一小部分罢了。　　在原始社会中，有的人个体比较强大，就会胁迫比较弱小的个体成为自己的下属，最终形成部落，部落相互吞并形成大部落，最后是国家。这时候阶级就表现出他独特的优势来了。因为上位者可以不用干活，而享受到最好的物品。这个时候维持这个社会的也是武力，只有强大的武力可以威慑民众不敢反抗。而后过了几代几十代形成了一种惯性，民众们习惯了上面有统治者的管理，才让国家这个形式流传到现在。而惯性的形成也是因为懒，只有懒得去改变才会形成习惯。　　到了现代社会，人们变得越发的懒惰，所以开始发明各种解放我们的双手的机械。　　归结到底，人们有需要，但是又不想劳动，才会去想着发明各种东西来代替自己工作。这样也带动了社会的发展。人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最终傲立食物链之巅。经过了数千年的发展社会制度越来越完善，人们也通过摸索学会了制造与使用更多的工具。　　有的人认为是因为人学会了分工和使用武器。是智慧使得人们更加强大。　　这些说法都有道理，但是我觉得，人之所以会使用工具，会分工合作全是因为人类的学习能力和懒惰的本性。　　懒惰是深深地潜藏在人骨子里的一种属性，也许有的人表现得很勤快，但是他仍然是有惰性的。不劳而获永远是最最吸引我们的一种诱惑。所以我们拼命地学习可以减少我们劳动力的方法，制造机器，分工合作也只是其中的一小部分罢了。　　在原始社会中，有的人个体比较强大，就会胁迫比较弱小的个体成为自己的下属，最终形成部落，部落相互吞并形成大部落，最后是国家。这时候阶级就表现出他独特的优势来了。因为上位者可以不用干活，而享受到最好的物品。这个时候维持这个社会的也是武力，只有强大的武力可以威慑民众不敢反抗。而后过了几代几十代形成了一种惯性，民众们习惯了上面有统治者的管理，才让国家这个形式流传到现在。而惯性的形成也是因为懒，只有懒得去改变才会形成习惯。　　到了现代社会，人们变得越发的懒惰，所以开始发明各种解放我们的双手的机械。　　归结到底，人们有需要，但是又不想劳动，才会去想着发明各种东西来代替自己工作。这样也带动了社会的发展。人为什么会从无数的物种中脱颖而出成为站在食物链顶端的生物呢？有人认为是因为人学会了使用火等工具使得人类可以战胜其他物种最　到己工作。这样也带动了社会的发展。", "postTimestamp": "2016-10-20T07:55:22Z"}]';
                return angular.fromJson(json);
            });

        }

        function getSearchengineAll(params) {
            return $http.get(url + '/content/search/', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            }, function () {
                var json = '[{"usrIp": "192.168.11.12", "usrMac": "00:0c:29:e7:6e:4d", "searchName": "百度", "searchContent": "AngularJS 2.0", "searchTimestamp": "2016-10-20T07:55:22Z"}]';
                return angular.fromJson(json);
            });

        }

        function getAllByTime(params, startTime, endTime) {
            return $http.get(url + '/topology/' + topologyId.id + '/startTime/' + startTime + '/endTime/' + endTime + '/heads', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getAllReduction(params) {
            return $http.get(url + '/topology/' + topologyId.id + '/stream/heads', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getSep(type, params) {
            return $http.get(url + '/detailinfo/type/' + type, {
                params: encodeURL(params)
            }).then(function (data) {
                //console.log(data.data);
                return data.data;
            });
        }

        function getCount(params, type, hasAdvanceSearch) {
            var factory = (type === 'normal' || type === 'http' || type === 'ftp' || type === 'pop3' || type === 'smtp' || type === 'telnet') ? false : true;
            if (type && factory && hasAdvanceSearch) {
                return $http.get(url + '/detailinfo/type/' + type + '/count', {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            }

            return $http.get(url + '/heads/count', {
                params: encodeURL(params)
            }).then(function (data) {
                if (type === undefined) {
                    return 0;
                } else {
                    return data.data;
                }

            });
        }

        function getForumpostCount(params) {
            return $http.get(url + '/content/forumpost/count/', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            }, function () {
                return 10001;
            });
        }

        function getSearchengineCount(params) {
            return $http.get(url + '/content/search/count/', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            }, function () {
                return 999;
            });
        }

        function getReductionCount(params) {
            return $http.get(url + '/topology/' + topologyId.id + '/stream/heads/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCountByTime(params, startTime, endTime) {
            return $http.get(url + '/topology/' + topologyId.id + '/startTime/' + startTime + '/endTime/' + endTime + '/heads/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDeviceData(params) {
            return $http.get(url + '/topology/' + topologyId.id + '/iptraffic/devices', params).then(function (data) {
                //console.log(data);
                return data.data;
            });
        }

        function getFtpControlFlowData(ftpControlFlowdataId) {
            return $http.get(url + '/ftpcontrolflowdata/' + ftpControlFlowdataId).then(function (data) {
                return data.data;
            });
        }

        function getViewCommand(auditData) {
            return $http.post(url + '/flowdataheadid/' + auditData.flowdataHead.flowdataHeadId + '/' + auditData.flowdataHead.protocolSourceName + 'flowdata/view').then(function (data) {
                return data.data;
            });
        }

        function getDownloadCommand(auditData) {
            var curUrl = url + '/flowdataheadid/' + auditData.flowdataHead.flowdataHeadId + '/' + auditData.flowdataHead.protocolSourceName + 'flowdata/download';
            return $http({
                method: 'POST',
                url: curUrl,
                data: {password: auditData.cmdZipPsw},
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
            }).success(function (data) {
                return data.data;
            });
        }

        function getDownloadZipPath(auditData) {
            var curUrl = url + '/' + auditData.flowdataHead.protocolSourceName + 'flowdata/';
            if (auditData.flowdataHead.protocolSourceName === 'ftpcontrol') {
                curUrl += auditData.flowdataHead.flowdataHeadId + '/ftpflowdata';
            } else {
                curUrl += auditData.flowdataHead.flowdataHeadId + '/';
            }
            return $http({
                method: 'POST',
                url: curUrl,
                data: {password: auditData.zipPsw},
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
            }).success(function (data) {
                return data.data;
            });
        }

        function getDownloadFileZipPath(auditData, fileId) {
            var curUrl = url + '/' + auditData.flowdataHead.protocolSourceName + 'flowdata/';
            if (auditData.flowdataHead.protocolSourceName === 'ftpcontrol') {
                curUrl += auditData.flowdataHead.flowdataHeadId + '/ftpflowdata/' + fileId;
            } else {
                curUrl += auditData.flowdataHead.flowdataHeadId + '/' + fileId;
            }
            console.log(auditData);
            return $http({
                method: 'POST',
                url: curUrl,
                data: {password: auditData.fileZipPsw},
                responseType: "arraybuffer",
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
            }).success(function (data) {
                return data.data;
            });
        }


        function getAllExport(params, psw, type) {
            var pdata = psw ? {password: psw, clienttime: new Date().getTimezoneOffset() / 60} : null;
            return $http({
                method: 'POST',
                url: url + '/' + type.toLowerCase() + '/export',
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

        function getGrouped(type, freq, start, end, params) {    //type: http, ftp, telnet, smtp, pop3.   freq: daily, hourly
            return $http.get(url + "/flowdata/type/" + type + "/frequency/" + freq + "/starttime/" + start.toISOString() + "/endtime/" + end.toISOString(), {
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

        function getAuditProtocolExport(params, psw, type, headid) {
            var pdata = psw ? {password: psw, clienttime: new Date().getTimezoneOffset() / 60} : null;
            return $http({
                method: 'POST',
                url: url + '/' + type.toLowerCase() + '/' + headid + '/export',
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

        function getForumpostExport(params, psw) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: url + '/content/forumpost/export',
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

        function getSearchengineExport(params, psw) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: url + '/content/search/export',
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

        function getHttpActionByIp(starttime, endtime, ip) {
            var filter = "(visitTimestamp ge '" + starttime + "' and visitTimestamp le '" + endtime + "')";
            var payload = [];
            payload['$filter'] = filter;
            payload['$usrIp'] = ip;
            return $http.get(url + '/action/webvisit', {params: encodeURL(payload)}).then(function (data) {
                return data.data;
            }, function () {
                var json = '[{"id":1, "usrIp": "192.168.11.12", "usrMac": "00:0c:29:e7:6e:4d", "webTitle": "CSDN", "webUrl": "http://www.csdn.com", "visitTimestamp": "2016-08-10 08:55:22"}]';
                return angular.fromJson(json);
            });
        }

        function getSearchContentByIp(starttime, endtime, ip) {
            var filter = "(searchTimestamp ge '" + starttime + "' and searchTimestamp le '" + endtime + "')";
            var payload = [];
            payload['$filter'] = filter;
            payload['$usrIp'] = ip;
            return $http.get(url + '/content/search', {params: encodeURL(payload)}).then(function (data) {
                return data.data;
            }, function () {
                var json = '[{"id":2, "usrIp": "192.168.11.12", "usrMac": "00:0c:29:e7:6e:4d", "searchName": "百度", "searchContent": "AngularJS 2.0", "searchTimestamp": "2016-08-10 07:55:22"}]';
                return angular.fromJson(json);
            });
        }

        function getForumpostByIp(starttime, endtime, ip) {
            var filter = "(postTimestamp ge '" + starttime + "' and postTimestamp le '" + endtime + "')";
            var payload = [];
            payload['$filter'] = filter;
            payload['$usrIp'] = ip;
            return $http.get(url + '/content/forumpost', {params: encodeURL(payload)}).then(function (data) {
                return data.data;
            }, function () {
                var json = '[{"id":3, "usrIp": "192.168.11.12", "usrMac": "00:0c:29:e7:6e:4d", "forumName": "天涯", "title":"Hello World", "postContent": "AngularJS 2.0", "postTimestamp": "2016-08-10 06:55:22"}]';
                return angular.fromJson(json);
            });
        }
    }

    function mwdata($http, $q, $interval, URI, encodeURL, apiInfo, topologyId, trafficDataService) {
        var service = {
            getOverView: getOverView,
            getProtocolView: getProtocolView,
            getDeviceView: getDeviceView,
            getDevice: getDevice,
            getSelectedDevice: getSelectedDevice,
            updateSelectedDevice: updateSelectedDevice,
            lineChart: lineChart,
            totalLineChart: totalLineChart,
            pieChart: pieChart,
            deviceLineChart: deviceLineChart,
            formatDate: formatDate,
            getDevicedataStats: getDevicedataStats,
            getDevicedataList: getDevicedataList,
            getDevicedataCount: getDevicedataCount
        };
        return service;

        function getOverView(msecond) {
            /*var overViewData = [];
             for(var i=-360; i<0; i++)
             {
             var timeNow = (new Date());
             var startTime = timeNow - i*(-10000);
             var totalBytes = (Math.random()*500000+10000);
             overViewData.push({
             "dpiIp" : "1.1.1.1",
             "dpiPort" : "30",
             "trafficType" : "",
             "trafficName" : "TCP",
             "ipVersion" : true,
             "ipAddr" : "1.1.1.1",
             "macAddr" : "1-1-1-1-1-1",
             "startTime" : startTime,
             "endTime" : "",
             "endPackets" : 10,
             "recvPackets" : 20,
             "sendBytes" : 123456789,
             "recvBytes" : 234567890,
             "totalBytes" : Math.floor(totalBytes/1024),
             "deviceName" : "",
             "sendSpeed" : 123456,
             "recvSpeed" : 123456
             });
             }
             return overViewData;*/

            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (msecond);
                //  Make sure start time always include a full 20s cycle
                startSecond -= (startSecond % 20000);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                return $http.get(URI + '/auditlogs/traffic/totalstats/starttime/' + startTimeStr + '/endtime/' + endTimeStr).then(function (data) {
                    //console.log("overview data:");
                    //console.log(data.data);
                    // if the end time does not including a full 20s cycle, drop it since it has incomplete data
                    if (endSecond % 20000 !== 0 && data.data.length > 1) {
                        data.data.splice(data.data.length - 1, 1);
                    }
                    data.endTime = endTime;
                    return data;
                });
            });
        }

        function getProtocolView(msecond) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (msecond);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                //console.log("endTime:" + endTimeStr);
                //console.log("startTime:" + startTimeStr);
                return $http.get(URI + '/auditlogs/traffic/protocolstats/starttime/' + startTimeStr + '/endtime/' + endTimeStr).then(function (data) {
                    data.data.forEach(function (item) {
                        if (item.trafficName === "TRADITION") {
                            item.trafficName = "网络通用协议";
                        }
                        if (item.trafficName === "OTHER") {
                            item.trafficName = "其他";
                        }
                    });
                    return data.data;
                });
            });
            /*var protocolData=[{
             "dpiIp" : "1.1.1.1",
             "dpiPort" : "30",
             "trafficType" : "",
             "trafficName" : "TCP",
             "ipVersion" : true,
             "ipAddr" : "1.1.1.1",
             "macAddr" : "1-1-1-1-1-1",
             "startTime" : new Date(),
             "endTime" : "",
             "endPackets" : 10,
             "recvPackets" : 20,
             "sendBytes" : 123456789,
             "recvBytes" : 234567890,
             "totalBytes" : 358024679,
             "deviceName" : "",
             "sendSpeed" : 123456,
             "recvSpeed" : 123456
             },{
             "dpiIp" : "1.1.1.1",
             "dpiPort" : "30",
             "trafficType" : "",
             "trafficName" : "ICMP",
             "ipVersion" : true,
             "ipAddr" : "1.1.1.1",
             "macAddr" : "1-1-1-1-1-1",
             "startTime" : new Date(),
             "endTime" : "",
             "endPackets" : 10,
             "recvPackets" : 20,
             "sendBytes" : 123456789,
             "recvBytes" : 134567890,
             "totalBytes" : 258024679,
             "deviceName" : "",
             "sendSpeed" : 123456,
             "recvSpeed" : 123456
             },{
             "dpiIp" : "1.1.1.1",
             "dpiPort" : "30",
             "trafficType" : "",
             "trafficName" : "UDP",
             "ipVersion" : true,
             "ipAddr" : "1.1.1.1",
             "macAddr" : "1-1-1-1-1-1",
             "startTime" : new Date(),
             "endTime" : "",
             "endPackets" : 10,
             "recvPackets" : 20,
             "sendBytes" : 123456789,
             "recvBytes" : 134567890,
             "totalBytes" : 258024679,
             "deviceName" : "",
             "sendSpeed" : 123456,
             "recvSpeed" : 123456
             }];
             return protocolData;*/
        }

        function getDeviceView(deviceId, msecond) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (msecond);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                //console.log("endTime:" + endTimeStr);
                //console.log("startTime:" + startTimeStr);
                return $http.get(URI + '/auditlogs/iptraffic/devices/total/' + deviceId + '/' + startTimeStr + '/' + endTimeStr).then(function (data) {
                    //console.log("Device View Data:");
                    //console.log(data.data);
                    data.endTime = endTime;
                    return data;
                });
            });
            /*var deviceData = [];
             for(var i=-360; i<0; i++)
             {
             var timeNow = (new Date());
             var startTime = timeNow - i*(-10000);
             var totalBytes = (Math.random()*500000+10000);
             deviceData.push({
             "dpiIp" : "1.1.1.1",
             "dpiPort" : "30",
             "trafficType" : "",
             "trafficName" : "TCP",
             "ipVersion" : true,
             "ipAddr" : "1.1.1.1",
             "macAddr" : "1-1-1-1-1-1",
             "startTime" : startTime,
             "endTime" : "",
             "endPackets" : 10,
             "recvPackets" : 20,
             "sendBytes" : 123456789,
             "recvBytes" : 234567890,
             "totalBytes" : Math.floor(totalBytes/1024),
             "deviceName" : "",
             "sendSpeed" : 123456,
             "recvSpeed" : 123456
             });
             }
             return deviceData;*/
        }

        function getDevice(topologyId) {
            return $http.get(URI + '/devices/topology/' + topologyId + '?$filter=category%20eq%20FACTORY_DEVICE&$orderby=name').then(function (data) {
                return data.data;
            });
        }

        function getSelectedDevice(topologyId) {
            return $http.get(URI + '/devices/topology/' + topologyId + '?$filter=category%20eq%20FACTORY_DEVICE and selected eq 1&$orderby=name').then(function (data) {
                return data.data;
            });
        }

        function updateSelectedDevice(id, selected) {
            var s = (selected) ? 1 : 0;
            return $http.put(URI + '/devices/iptraffic/' + id + "/" + s).then(function (data) {
                return data.data;
            });
        }

        function lineChart($scope, stats, deviceId) {
            $scope.noPoint = stats.length < 1;
            var lineChartObj = {
                lang: {noData: "当前时间段内没有实时流量数据"},
                chart: {
                    type: 'line',
                    backgroundColor: '#212121',
                    color: 'white',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        load: function () {
                            // set up the updating of the chart each 24 second
                            var seriesInput = this.series[0];
                            var seriesOutput = this.series[1];
                            var loopPattern = $interval(function () {
                                getDevicedataStats(deviceId, 24000).then(function (data) {
                                    $scope.noPoint = false;
                                    var now = data.endTime.getTime();
                                    data = data.data;
                                    if (data.length === 0) {
                                        seriesInput.addPoint([now, 0], true, false);
                                        seriesOutput.addPoint([now, 0], true, false);
                                    } else {
                                        var i = 0 - data.length;
                                        //console.log(data);
                                        for (i; i < 0; i += 1) {
                                            var startTime = new Date(data[i + data.length].startTime).getTime();
                                            var recvBytes = Math.floor(data[i + data.length].recvBytes / 10.24) / 100;
                                            var sendBytes = Math.floor(data[i + data.length].sendBytes / 10.24) / 100;
                                            seriesInput.addPoint([startTime, recvBytes], true, false);
                                            seriesOutput.addPoint([startTime, sendBytes], true, false);
                                        }
                                    }
                                    for (var j = 0; j < seriesInput.data.length; j += 1) {
                                        if (seriesInput.data[j].x < now - (60 * 60 * 1000)) {
                                            seriesInput.removePoint(j, true);
                                        }
                                    }
                                    for (var k = 0; k < seriesOutput.data.length; k += 1) {
                                        if (seriesOutput.data[k].x < now - (60 * 60 * 1000)) {
                                            seriesOutput.removePoint(k, true);
                                        }
                                    }
                                });
                            }, 24000);
                            $scope.$on('$destroy', function () {
                                $interval.cancel(loopPattern);
                            });
                        }
                    }
                },
                colors: ['#EEEEEE', '#999999'],
                title: {
                    text: '',
                    style: {
                        color: '#eeeeee'
                    }
                },
                xAxis: {
                    title: {
                        text: '时间',
                        style: {"color": "#CCCCCC"}
                    },
                    type: 'datetime',
                    tickPixelInterval: 150,
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    title: {
                        text: '速率 (KB/s)',
                        style: {"color": "#CCCCCC"}
                    },
                    plotLines: [{
                        value: 0,
                        width: 100000,
                    }],
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    },
                    min: 0,
                    offset: 0
                },
                legend: {
                    enabled: true,
                    itemStyle: {
                        color: '#EEEEEE',
                        fontWeight: 'bold'
                    },
                    itemHiddenStyle: {
                        color: '#555555'
                    },
                    itemHoverStyle: {
                        color: '#45EE45'
                    }
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        lineWidth: 2,
                        turboThreshold: 10000
                    },
                    series: {marker: {symbol: 'circle', enabled: false}}
                },
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1分'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5分'
                    }, {
                        count: 30,
                        type: 'minute',
                        text: '30分'
                    }, {
                        type: 'all',
                        text: '全部'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                tooltip: {
                    formatter: function () {
                        return '<b>数据流量</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2) + ' KB/s';
                    }
                },
                series: [{
                    name: '设备输入流量',
                    color: '#76B900',
                    data: (function () {
                        var data = [],
                            i = 0 - stats.length;
                        for (i; i < 0; i += 1) {
                            data.push({
                                x: new Date(stats[i + stats.length].startTime).getTime(),
                                y: Math.floor(stats[i + stats.length].recvBytes / 10.24) / 100
                            });
                        }
                        return data;
                    }())
                }, {
                    name: '设备输出流量',
                    color: '#ffc52d',
                    data: (function () {
                        var data = [],
                            i = 0 - stats.length;
                        for (i; i < 0; i += 1) {
                            data.push({
                                x: new Date(stats[i + stats.length].startTime).getTime(),
                                y: Math.floor(stats[i + stats.length].sendBytes / 10.24) / 100
                            });
                        }
                        return data;
                    }())
                }]
            };
            return lineChartObj;
        }

        function totalLineChart(sourceData, config, $scope) {
            var lineChartObj = {
                lang: {noData: "当前时间段内没有实时流量数据"},
                chart: {
                    type: 'line',
                    backgroundColor: '#212121',
                    color: 'white',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        load: function () {
                            // set up the updating of the chart each 24 second
                            var series = this.series[0];
                            var totalLineInterval = $interval(function () {
                                getOverView(24000).then(function (data) {
                                    var now = data.endTime.getTime();
                                    data = data.data;
                                    if (data.length === 0) {
                                        series.addPoint([now, 0], true, false);
                                    } else {
                                        var i = 0 - data.length;
                                        for (i; i < 0; i += 1) {
                                            var startTime = new Date(data[i + data.length].timestamp).getTime();
                                            var totalBytes = Math.floor(data[i + data.length].totalBytes / 10.24) / 100;
                                            series.addPoint([startTime, totalBytes], true, false);
                                        }
                                    }
                                });
                            }, 24000);
                            $scope.$on('$destroy', function () {
                                $interval.cancel(totalLineInterval);
                            });
                        }
                    }
                },
                colors: ['#EEEEEE'],
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                xAxis: {
                    title: {
                        text: '时间',
                        style: {"color": "#CCCCCC"}
                    },
                    type: 'datetime',
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    title: {
                        text: '速率 (KB/s)',
                        style: {"color": "#CCCCCC"}
                    },
                    plotLines: [{
                        value: 0,
                        width: 100000,
                    }],
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    },
                    min: 0,
                    offset: 0
                },
                legend: {
                    enabled: config.legendEnable,
                    itemStyle: {
                        color: '#EEEEEE',
                        fontWeight: 'bold'
                    },
                    itemHiddenStyle: {
                        color: '#555555'
                    },
                    itemHoverStyle: {
                        color: '#45EE45'
                    }
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        lineWidth: 2,
                        turboThreshold: 10000
                    },
                    series: {
                        animation: {
                            duration: 1000 //数据加载完成为1秒
                        },
                        marker: {symbol: 'circle'}
                    }
                },
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1分'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5分'
                    }, {
                        count: 30,
                        type: 'minute',
                        text: '30分'
                    }, {
                        count: 60,
                        type: 'minute',
                        text: '60分'
                    }, {
                        type: 'all',
                        text: '全部'
                    }],
                    inputEnabled: false,
                    selected: 3
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + ':</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2) + ' KB/s';
                    }
                },
                series: sourceData
            };
            return lineChartObj;
        }

        function deviceLineChart(sourceData, config, $scope) {
            var DeviceLineInterval;
            var lineChartObj = {
                lang: {noData: "当前时间段内没有实时流量数据"},
                chart: {
                    type: 'line',
                    backgroundColor: '#212121',
                    color: 'white',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        load: function () {
                            // set up the updating of the chart each 24 second
                            var series = this.series;
                            DeviceLineInterval = $interval(function () {
                                if (series !== undefined && series.length > 0) {
                                    if (config.deviceIds.length) {
                                        var promises = [];
                                        for (var j = 0; j < config.deviceIds.length; j++) {
                                            promises.push(getDeviceView(config.deviceIds[j], 24000));
                                        }
                                        $q.all(promises).then(function (data) {
                                            for (var k = 0; k < config.deviceIds.length; k++) {
                                                var now = data[k].endTime.getTime();
                                                for (var i = 0; i < data[k].data.length; i++) {
                                                    var startTime = new Date(data[k].data[i].startTime).getTime();
                                                    var totalBytes = Math.floor(data[k].data[i].totalBytes / 10.24) / 100;
                                                    if (series[k] !== undefined) {
                                                        series[k].addPoint([startTime, totalBytes], true, false);
                                                    } else {
                                                        $interval.cancel(DeviceLineInterval);
                                                    }
                                                }
                                                console.log(data[k].endTime);
                                                if (data[k].data.length === 0) {
                                                    if (series[k]) {
                                                        series[k].addPoint([now, 0], true, false);
                                                    } else {
                                                        $interval.cancel(DeviceLineInterval);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            }, 24000);
                            $scope.$on('$destroy', function () {
                                $interval.cancel(DeviceLineInterval);
                            });
                        }
                    }
                },
                colors: ['#EEEEEE'],
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                xAxis: {
                    title: {
                        text: '时间',
                        style: {"color": "#CCCCCC"}
                    },
                    type: 'datetime',
                    tickPixelInterval: 150,
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    title: {
                        text: '速率 (KB/s)',
                        style: {"color": "#CCCCCC"}
                    },
                    plotLines: [{
                        value: 0,
                        width: 100000,
                    }],
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    },
                    min: 0,
                    offset: 0
                },
                legend: {
                    enabled: config.legendEnable,
                    itemStyle: {
                        color: '#EEEEEE',
                        fontWeight: 'bold'
                    },
                    itemHiddenStyle: {
                        color: '#555555'
                    },
                    itemHoverStyle: {
                        color: '#45EE45'
                    }
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        lineWidth: 2,
                        turboThreshold: 10000
                    },
                    series: {marker: {symbol: 'circle', enabled: false}}
                },
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1分'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5分'
                    }, {
                        count: 30,
                        type: 'minute',
                        text: '30分'
                    }, {
                        type: 'all',
                        text: '全部'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + ':</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2) + ' KB/s';
                    }
                },
                series: sourceData
            };
            return lineChartObj;
        }

        function pieChart(protocolAllData, config, unit) {
            //console.log("protocol data:");
            //console.log(protocolAllData);
            protocolAllData.map(function (m) {
                if (m.trafficName === "MODBUS_TCP") {
                    m.trafficName = "MODBUS-TCP";
                }
                if (m.trafficName === "MODBUS_UDP") {
                    m.trafficName = "MODBUS-UDP";
                }
            });
            var data = [];
            for (var i = 0; i < protocolAllData.length; i++) {
                var item = [];
                item.push(protocolAllData[i].trafficName);
                item.push(trafficDataService.formatTrafficDataWithoutUnit(protocolAllData[i].totalBytes, unit));

                data.push(item);
            }
            //console.log(data);
            var pieChartObj = {
                lang: {noData: "当前时间段没有汇总流量数据"},
                chart: {
                    backgroundColor: null,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    color: 'white',
                    plotShadow: false
                },
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                style: {
                    color: '#EEEEEE'
                },
                tooltip: {
                    pointFormat: '<b>{series.data.trafficName}</b>:{point.percentage:.1f}% <b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}' + unit + ' <b>',
                            shadow: false,
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'white',
                                textShadow: false
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: '协议流量',
                    data: data
                }]
            };
            return pieChartObj;
        }

        function formatDate(date) {
            return (date.getUTCFullYear() + "-" + (((date.getUTCMonth() + 1) > 9) ? date.getUTCMonth() + 1 : ("0" + (date.getUTCMonth() + 1))) + "-" + ((date.getUTCDate() > 9) ? date.getUTCDate() : ("0" + date.getUTCDate())) + "T" + ((date.getUTCHours() > 9) ? date.getUTCHours() : ("0" + date.getUTCHours())) + ":" + ((date.getUTCMinutes() > 9) ? date.getUTCMinutes() : ("0" + date.getUTCMinutes())) + ":" + ((date.getUTCSeconds() > 9) ? date.getUTCSeconds() : ("0" + date.getUTCSeconds())) + "Z");
        }

        function getDevicedataStats(deviceId, milliseconds) {
            // var deviceStats = [];
            // var startTime = (new Date()).getTime();
            // for(var i=-5; i<0; i++)
            // {
            //     var timeNow = (new Date());
            //     var startTime = timeNow - i*(-10000);
            //     var totalBytes = (Math.random()*500000+10000);
            //     var sendBytes = (Math.random()*500000+20000);
            //     var recvBytes = (Math.random()*500000+30000);
            //     deviceStats.push({
            //         "dpiIp" : "1.1.1.1",
            //         "dpiPort" : "30",
            //         "trafficType" : "",
            //         "trafficName" : "TCP",
            //         "ipVersion" : true,
            //         "ipAddr" : "130.195.69.88",
            //         "macAddr" : "10:23:45:67:11:ab",
            //         "startTime" : startTime,
            //         "endTime" : "",
            //         "sendPackets" : 10,
            //         "recvPackets" : 20,
            //         "sendBytes" : Math.floor(sendBytes/1024),
            //         "recvBytes" : Math.floor(recvBytes/1024),
            //         "totalBytes" : Math.floor(totalBytes/1024),
            //         "deviceName" : "",
            //         "sendSpeed" : 1234567,
            //         "recvSpeed" : 123456
            //     });
            // }
            // console.log(deviceStats);
            // return $q.when(deviceStats);
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (milliseconds);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                return $http.get(URI + '/auditlogs/iptraffic/devices/' + deviceId + '/' + startTimeStr + '/' + endTimeStr).then(function (data) {
                    //console.log(data.data);
                    data.endTime = endTime;
                    return $q.when(data);
                });
            });
        }

        function getDevicedataList(params) {
            return $http.get(URI + '/auditlogs' + '/topology/' + topologyId.id + '/iptraffic/devices', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });

            // var devicesList = [];
            // for(var i = 0; i < 20; i++)
            // {
            //     devicesList.push({
            //         "trafficInfo" : "",
            //         "deviceName" : "OPC 上位机 1",
            //         "ipAddr" : "30.195.69.88",
            //         "macAddr" : "10:23:45:67:11:ab",
            //         "sendSpeed" : 1234567,
            //         "recvSpeed" : 123456
            //     });
            // }
            // return $q.when(devicesList);
        }

        function getDevicedataCount(params) {
            return $http.get(URI + '/auditlogs' + '/topology/' + topologyId.id + '/iptraffic/devices/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });

            // params = 1;
            // var count = 11;
            // return $q.when(count);
        }

    }

    function dpidevicedata($http, $q, $interval, URI, encodeURL, apiInfo, trafficDataService) {
        var service = {
            getDpiTrafficRealTime: getDpiTrafficRealTime,
            deviceLineChart: deviceLineChart,
            getDpiTrafficTotal: getDpiTrafficTotal,
            devicePieChart: devicePieChart,
            getDpiDevices: getDpiDevices,
            getDpiTrafficList: getDpiTrafficList,
            getDpiTrafficCount: getDpiTrafficCount,
            getSelectedProtocols: getSelectedProtocols,
            getProtocolRealTime: getProtocolRealTime,
            protocolLineChart: protocolLineChart,
            getProtocolTotal: getProtocolTotal,
            protocolPieChar: protocolPieChar
        };
        return service;

        function getDpiTrafficRealTime(boxId, startTime, endTime) {
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/boxes/' + boxId + '/starttime/' + startTimeStr + '/endtime/' + endTimeStr).then(function (data) {
                data.endTime = endTime;
                return data;
            });
        }

        function deviceLineChart(sourceData, config, colors, $scope) {
            var DeviceLineInterval;
            var lineChartObj = {
                lang: {noData: "当前时间段内没有实时流量数据"},
                chart: {
                    type: 'line',
                    backgroundColor: '#212121',
                    color: 'white',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        addSeries: function () {
                            var label = this.renderer.label('A new device was added', 100, 120)
                                .attr({
                                    fill: Highcharts.getOptions().colors[0],
                                    padding: 10,
                                    r: 5,
                                    zIndex: 8
                                })
                                .css({
                                    color: '#FFFFFF'
                                })
                                .add();

                            setTimeout(function () {
                                label.fadeOut();
                            }, 2000);
                        },

                        load: function () {
                            // set up the updating of the chart each 24 second
                            var series = this.series;
                            var chart = this;
                            DeviceLineInterval = $interval(function () {
                                $scope.reloadDevices = true;
                                if (series !== undefined) {
                                    apiInfo.sysbaseinfo().then(function (data) {
                                        var currTime = new Date(data.data || "");
                                        var endSecond = currTime - 24000;
                                        var endTime = new Date(endSecond);
                                        var startSecond = endTime - (3600000);
                                        var startTime = new Date(startSecond);
                                        $scope.reloadDevices = false;
                                        getDpiDevices(startTime, endTime).then(function (data) {
                                            var dpiDevices = data;
                                            var oldDpiDevices = [];
                                            var newDpiDevices = [];
                                            for (var i = 0; i < dpiDevices.length; i++) {
                                                var isNew = true;
                                                var a1 = dpiDevices[i].boxId;
                                                for (var j = 0; j < series.length; j++) {
                                                    var a2 = series[j].options.boxId;
                                                    if (a1 === a2) {
                                                        oldDpiDevices.push(dpiDevices[i]);
                                                        isNew = false;
                                                        break;
                                                    }
                                                }
                                                if (isNew) {
                                                    newDpiDevices.push(dpiDevices[i]);
                                                }
                                                if ((oldDpiDevices.length + newDpiDevices.length) === 5) {
                                                    break;
                                                }
                                            }

                                            for (var l = 0; l < series.length; l++) {
                                                var isRemove = true;
                                                for (var m = 0; m < oldDpiDevices.length; m++) {
                                                    if (series[l].options.boxId === oldDpiDevices[m].boxId) {
                                                        isRemove = false;
                                                        break;
                                                    }
                                                }
                                                if (isRemove) {
                                                    colors.push(chart.series[l].color);
                                                    chart.series[l].remove(true);
                                                }
                                            }
                                            updateChartSize(chart);

                                            if (newDpiDevices.length > 0) {
                                                startSecond = endTime - (3600000);
                                                startTime = new Date(startSecond);

                                                var promises2 = [];
                                                for (var j2 = 0; j2 < newDpiDevices.length; j2++) {
                                                    promises2.push(getDpiTrafficRealTime(newDpiDevices[j2].boxId, startTime, endTime));
                                                }
                                                $q.all(promises2).then(function (data) {
                                                    for (var k2 = 0; k2 < newDpiDevices.length; k2++) {
                                                        var now2 = data[k2].endTime.getTime();
                                                        var pointDatas = [];
                                                        for (var i = 0; i < data[k2].data.length; i++) {
                                                            var timestamp = new Date(data[k2].data[i].timestamp).getTime();
                                                            var totalBytes = Math.floor(data[k2].data[i].totalBytes / 10.24) / 100;
                                                            pointDatas.push({
                                                                x: timestamp,
                                                                y: totalBytes
                                                            });
                                                        }
                                                        if (data[k2].data.length === 0) {
                                                            pointDatas.push({
                                                                x: now2,
                                                                y: 0
                                                            });
                                                        }

                                                        var inputItem = {
                                                            boxId: newDpiDevices[k2].boxId,
                                                            name: newDpiDevices[k2].deviceName,
                                                            color: colors.pop(),
                                                            data: pointDatas
                                                        };
                                                        chart.addSeries(inputItem);
                                                    }
                                                    updateChartSize(chart);
                                                });
                                            }

                                            if (oldDpiDevices.length > 0) {
                                                startSecond = endTime - (24000);
                                                startTime = new Date(startSecond);

                                                var promises1 = [];
                                                for (var j1 = 0; j1 < oldDpiDevices.length; j1++) {
                                                    promises1.push(getDpiTrafficRealTime(oldDpiDevices[j1].boxId, startTime, endTime));
                                                }
                                                $q.all(promises1).then(function (data) {
                                                    for (var k1 = 0; k1 < oldDpiDevices.length; k1++) {
                                                        var now1 = data[k1].endTime.getTime();
                                                        var index;
                                                        for (var n = 0; n < series.length; n++) {
                                                            if (series[n] !== undefined && series[n].options.boxId === oldDpiDevices[k1].boxId) {
                                                                index = n;
                                                                break;
                                                            }
                                                        }
                                                        if (index !== undefined) {
                                                            series[index].update({
                                                                name: oldDpiDevices[k1].deviceName
                                                            });
                                                            for (var i = 0; i < data[k1].data.length; i++) {
                                                                var timestamp = new Date(data[k1].data[i].timestamp).getTime();
                                                                var totalBytes = Math.floor(data[k1].data[i].totalBytes / 10.24) / 100;
                                                                series[index].addPoint([timestamp, totalBytes], false, false);
                                                            }
                                                            if (data[k1].data.length === 0) {
                                                                series[index].addPoint([now1, 0], false, false);
                                                            }
                                                        } else {
                                                            $interval.cancel(DeviceLineInterval);
                                                        }
                                                    }
                                                    updateChartSize(chart);
                                                });
                                            }
                                        });
                                    });
                                }
                            }, 24000);

                            $scope.$on('$destroy', function () {
                                $interval.cancel(DeviceLineInterval);
                            });
                        }
                    }
                },
                colors: ['#EEEEEE'],
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                xAxis: {
                    title: {
                        text: '时间',
                        style: {"color": "#CCCCCC"}
                    },
                    type: 'datetime',
                    tickPixelInterval: 150,
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    title: {
                        text: '速率 (KB/s)',
                        style: {"color": "#CCCCCC"}
                    },
                    plotLines: [{
                        value: 0,
                        width: 100000,
                    }],
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    },
                    min: 0,
                    offset: 0
                },
                legend: {
                    enabled: config.legendEnable,
                    itemStyle: {
                        color: '#EEEEEE',
                        fontWeight: 'bold'
                    },
                    itemHiddenStyle: {
                        color: '#555555'
                    },
                    itemHoverStyle: {
                        color: '#45EE45'
                    }
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        lineWidth: 2,
                        turboThreshold: 10000
                    },
                    series: {marker: {symbol: 'circle', enabled: false}}
                },
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1分'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5分'
                    }, {
                        count: 30,
                        type: 'minute',
                        text: '30分'
                    }, {
                        type: 'all',
                        text: '全部'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + '</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2) + ' KB/s';
                    }
                },
                series: sourceData
            };
            return lineChartObj;
        }

        function getDpiTrafficTotal(msecond) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (msecond);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/starttime/' + startTimeStr + '/endtime/' + endTimeStr).then(function (data) {
                    return data.data;
                });
            });
        }

        function devicePieChart(dpiTrafficStats, config, unit) {
            var data = [];
            for (var i = 0; i < dpiTrafficStats.length; i++) {
                var item = [];
                item.push(dpiTrafficStats[i].deviceName);
                item.push(trafficDataService.formatTrafficDataWithoutUnit(dpiTrafficStats[i].totalBytes, unit));

                data.push(item);
            }
            var pieChartObj = {
                lang: {noData: "当前时间段没有汇总流量数据"},
                chart: {
                    backgroundColor: null,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    color: 'white',
                    plotShadow: false
                },
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                style: {
                    color: '#EEEEEE'
                },
                tooltip: {
                    useHTML: true,
                    pointFormat: '{series.data.deviceName}: <b>{point.percentage:.1f}%</b>',
                    formatter: function () {
                        $("div.highcharts-tooltip span").css("white-space", "inherit");//允许换行
                        //重新生成
                        var percentage = !this.point.percentage ? this.point.percentage : this.point.percentage.toFixed(1);
                        var content = '<div style="font-size: 10px;width: 200px;display:block;word-break: break-all;word-wrap: break-word;">' + this.key + '<br/>' +
                            '<span style="font-size:10px">: <b>' + percentage + '%</b></span></div>';
                        return content;
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            useHTML: true,
                            enabled: true,
                            //format: '<b>{point.name}</b>: {point.y}' + unit,
                            formatter: function () {
                                return '<div style="white-space:pre"><p style="width: 200px; display:inline-block; white-space:pre-wrap;"><b>' + this.point.name + '</b>:' + this.point.y + unit + '</p></div>';
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: '安全设备汇总流量',
                    data: data
                }]
            };
            return pieChartObj;
        }

        function getDpiDevices(startTime, endTime) {
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/devices/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                params: encodeURL({$limit: 5})
            }).then(function (data) {
                return data.data;
            });
        }

        function getDpiTrafficList(params) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - 3600000;
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                params = params || {};
                params.$limit = params.$limit || 5;
                return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/devices/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            });
        }

        function getDpiTrafficCount(params) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - 3600000;
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/devices/count/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            });
        }

        function getSelectedProtocols(startTime, endTime) {
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            console.log(startTimeStr + ' ' + endTimeStr);
            return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/protocoltypes').then(function (data) {
                var protocols = [];
                data.data.forEach(function (item) {
                    if (item.trafficName === "TRADITION") {
                        item.trafficName = "网络通用协议";
                    }
                    if (item.trafficName === "OTHER") {
                        item.trafficName = "其他";
                    }
                    protocols.push({
                        protocolName: item.trafficName,
                        trafficId: "TRAFFIC_" + item.trafficName.toUpperCase()
                    });
                });
                return protocols;
            });
        }

        function getProtocolRealTime(trafficType, startTime, endTime) {
            if (trafficType === "TRAFFIC_网络通用协议") {
                trafficType = "TRAFFIC_TRADITION";
            }
            if (trafficType === "TRAFFIC_其他") {
                trafficType = "TRAFFIC_OTHER";
            }
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/protocoltype/' + trafficType + '/starttime/' + startTimeStr + '/endtime/' + endTimeStr).then(function (data) {
                data.endTime = endTime;
                return data;
            });
        }

        function protocolLineChart(sourceData, config, colors, $scope) {
            sourceData.map(function (m) {
                if (m.name === "MODBUS_TCP") {
                    m.name = "MODBUS-TCP";
                }
                if (m.name === "MODBUS_UDP") {
                    m.name = "MODBUS-UDP";
                }
            });
            var ProtocolLineInterval;
            var lineChartObj = {
                lang: {noData: "当前时间段内没有实时流量数据"},
                chart: {
                    type: 'line',
                    backgroundColor: '#212121',
                    color: 'white',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        addSeries: function () {
                            var label = this.renderer.label('A new protocol was added', 100, 120)
                                .attr({
                                    fill: Highcharts.getOptions().colors[0],
                                    padding: 10,
                                    r: 5,
                                    zIndex: 8
                                })
                                .css({
                                    color: '#FFFFFF'
                                })
                                .add();

                            setTimeout(function () {
                                label.fadeOut();
                            }, 2000);
                        },

                        load: function () {
                            // set up the updating of the chart each 24 second
                            var series = this.series;
                            var chart = this;
                            ProtocolLineInterval = $interval(function () {
                                if (series !== undefined) {
                                    apiInfo.sysbaseinfo().then(function (data) {
                                        var currTime = new Date(data.data || "");
                                        var endSecond = currTime - 24000;
                                        var endTime = new Date(endSecond);
                                        var startSecond = endTime - (3600000);
                                        var startTime = new Date(startSecond);
                                        getSelectedProtocols(startTime, endTime).then(function (data) {
                                            var protocols = data;
                                            var oldProtocols = [];
                                            var newProtocols = [];
                                            for (var i = 0; i < protocols.length; i++) {
                                                var isNew = true;
                                                var a1 = protocols[i].protocolName === "MODBUS_TCP" ? "MODBUS-TCP" : protocols[i].protocolName === "MODBUS_UDP" ? "MODBUS-UDP" : protocols[i].protocolName;
                                                for (var j = 0; j < series.length; j++) {
                                                    var a2 = series[j].name;
                                                    if (a1 === a2) {
                                                        oldProtocols.push(protocols[i]);
                                                        isNew = false;
                                                        break;
                                                    }
                                                }
                                                if (isNew) {
                                                    newProtocols.push(protocols[i]);
                                                }
                                            }

                                            for (var l = 0; l < series.length; l++) {
                                                var isRemove = true;
                                                for (var m = 0; m < oldProtocols.length; m++) {
                                                    if (series[l].name === (oldProtocols[m].protocolName === "MODBUS_TCP" ? "MODBUS-TCP" : oldProtocols[m].protocolName === "MODBUS_UDP" ? "MODBUS-UDP" : oldProtocols[m].protocolName)) {
                                                        isRemove = false;
                                                        break;
                                                    }
                                                }
                                                if (isRemove) {
                                                    colors.push(chart.series[l].color);
                                                    chart.series[l].remove(true);
                                                }
                                            }
                                            updateChartSize(chart);

                                            if (newProtocols.length > 0) {
                                                startSecond = endTime - (3600000);
                                                startTime = new Date(startSecond);

                                                var promises2 = [];
                                                for (var j2 = 0; j2 < newProtocols.length; j2++) {
                                                    promises2.push(getProtocolRealTime(newProtocols[j2].trafficId, startTime, endTime));
                                                }
                                                $q.all(promises2).then(function (data) {
                                                    for (var k2 = 0; k2 < newProtocols.length; k2++) {
                                                        var now2 = data[k2].endTime.getTime();
                                                        var pointDatas = [];
                                                        for (var i = 0; i < data[k2].data.length; i++) {
                                                            var timestamp = new Date(data[k2].data[i].timestamp).getTime();
                                                            var totalBytes = Math.floor(data[k2].data[i].totalBytes / 10.24) / 100;
                                                            pointDatas.push({
                                                                x: timestamp,
                                                                y: totalBytes
                                                            });
                                                        }

                                                        if (data[k2].data.length === 0) {
                                                            pointDatas.push({
                                                                x: now2,
                                                                y: 0
                                                            });
                                                        }

                                                        var inputItem = {
                                                            name: newProtocols[k2].protocolName === "MODBUS_TCP" ? "MODBUS-TCP" : newProtocols[k2].protocolName === "MODBUS_UDP" ? "MODBUS-UDP" : newProtocols[k2].protocolName,
                                                            color: colors.pop(),
                                                            data: pointDatas
                                                        };
                                                        chart.addSeries(inputItem);
                                                    }
                                                    updateChartSize(chart);
                                                });
                                            }

                                            if (oldProtocols.length > 0) {
                                                startSecond = endTime - (24000);
                                                startTime = new Date(startSecond);

                                                var promises1 = [];
                                                for (var j1 = 0; j1 < oldProtocols.length; j1++) {
                                                    promises1.push(getProtocolRealTime(oldProtocols[j1].trafficId, startTime, endTime));
                                                }
                                                $q.all(promises1).then(function (data) {
                                                    for (var k1 = 0; k1 < oldProtocols.length; k1++) {
                                                        var now1 = data[k1].endTime.getTime();
                                                        var index;
                                                        for (var n = 0; n < series.length; n++) {
                                                            if (series[n] !== undefined && series[n].name === oldProtocols[k1].protocolName) {
                                                                index = n;
                                                                break;
                                                            }
                                                        }
                                                        if (index !== undefined) {
                                                            for (var i = 0; i < data[k1].data.length; i++) {
                                                                var timestamp = new Date(data[k1].data[i].timestamp).getTime();
                                                                var totalBytes = Math.floor(data[k1].data[i].totalBytes / 10.24) / 100;
                                                                series[index].addPoint([timestamp, totalBytes], true, false);
                                                            }
                                                            if (data[k1].data.length === 0) {
                                                                series[index].addPoint([now1, 0], true, false);
                                                            }
                                                        } else {
                                                            $interval.cancel(ProtocolLineInterval);
                                                        }
                                                    }
                                                    updateChartSize(chart);
                                                });
                                            }
                                        });
                                    });
                                }
                                updateChartSize(chart);
                            }, 24000);
                            $scope.$on('$destroy', function () {
                                $interval.cancel(ProtocolLineInterval);
                            });
                        }
                    }
                },
                colors: ['#EEEEEE'],
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                xAxis: {
                    title: {
                        text: '时间',
                        style: {"color": "#CCCCCC"}
                    },
                    type: 'datetime',
                    //tickPixelInterval: 150,
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    title: {
                        text: '速率 (KB/s)',
                        style: {"color": "#CCCCCC"}
                    },
                    plotLines: [{
                        value: 0,
                        width: 100000,
                    }],
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    },
                    min: 0,
                    offset: 0
                },
                legend: {
                    enabled: config.legendEnable,
                    itemStyle: {
                        color: '#EEEEEE',
                        fontWeight: 'bold'
                    },
                    itemHiddenStyle: {
                        color: '#555555'
                    },
                    itemHoverStyle: {
                        color: '#45EE45'
                    }
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        lineWidth: 2,
                        turboThreshold: 10000
                    },
                    series: {marker: {symbol: 'circle', enabled: false}}
                },
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1分'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5分'
                    }, {
                        count: 30,
                        type: 'minute',
                        text: '30分'
                    }, {
                        type: 'all',
                        text: '全部'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + ':</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2) + ' KB/s';
                    }
                },
                series: sourceData
            };
            return lineChartObj;
        }

        function getProtocolTotal(boxId, msecond) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (msecond);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                return $http.get(URI + '/auditlogs/traffic/devicetype/dpi/protocolstats/boxes/' + boxId + '/starttime/' + startTimeStr + '/endtime/' + endTimeStr).then(function (data) {
                    data.data.forEach(function (item) {
                        if (item.trafficName === "TRADITION") {
                            item.trafficName = "网络通用协议";
                        }
                        if (item.trafficName === "OTHER") {
                            item.trafficName = "其他";
                        }
                    });
                    return data.data;
                });
            });
        }

        function protocolPieChar(dpiTrafficStats, config, unit) {
            var data = [];
            for (var i = 0; i < dpiTrafficStats.length; i++) {
                var item = [];
                item.push(dpiTrafficStats[i].trafficName);
                item.push(trafficDataService.formatTrafficDataWithoutUnit(dpiTrafficStats[i].totalBytes, unit));

                data.push(item);
            }
            var pieChartObj = {
                lang: {noData: "当前时间段没有汇总流量数据"},
                chart: {
                    backgroundColor: null,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    color: 'white',
                    plotShadow: false,
                },
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                style: {
                    color: '#EEEEEE'
                },
                tooltip: {
                    pointFormat: '{series.data.trafficName}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}' + unit + ' <b>',
                            shadow: false,
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'white',
                                textShadow: false
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: '工控协议汇总流量',
                    data: data
                }]
            };
            return pieChartObj;
        }

        function updateChartSize(chart) {
            var height = 400;
            if (chart) {
                var newHeight = chart.hasData() ? height : height / 2;
                if (newHeight !== chart.chartHeight) {
                    chart.setSize(chart.chartWidth, newHeight, false);
                }
            }
        }

        function formatDate(date) {
            return (date.getUTCFullYear() + "-" + (((date.getUTCMonth() + 1) > 9) ? date.getUTCMonth() + 1 : ("0" + (date.getUTCMonth() + 1))) + "-" + ((date.getUTCDate() > 9) ? date.getUTCDate() : ("0" + date.getUTCDate())) + "T" + ((date.getUTCHours() > 9) ? date.getUTCHours() : ("0" + date.getUTCHours())) + ":" + ((date.getUTCMinutes() > 9) ? date.getUTCMinutes() : ("0" + date.getUTCMinutes())) + ":" + ((date.getUTCSeconds() > 9) ? date.getUTCSeconds() : ("0" + date.getUTCSeconds())) + "Z");
        }
    }

    function icdevicedata($http, URI, encodeURL, trafficDataService, apiInfo) {
        var service = {
            getDeviceTrafficList: getDeviceTrafficList,
            getDeviceTrafficCount: getDeviceTrafficCount,
            getTopTrafficDevice: getTopTrafficDevice,
            getDeviceTraffic: getDeviceTraffic,
            getDeviceTrafficStatistics: getDeviceTrafficStatistics,

            getSelectedProtocols: getSelectedProtocols,
            getProtocolTraffic: getProtocolTraffic,
            getProtocolTrafficStatistics: getProtocolTrafficStatistics,

            deviceLineChart: deviceLineChart,
            devicePieChart: devicePieChart,

            protocolLineChart: protocolLineChart,
            protocolPieChart: protocolPieChart,

            formatDate: formatDate,
            getDeviceTrafficStats: getDeviceTrafficStats,
            getDeviceTrafficStatsCount: getDeviceTrafficStatsCount
        };
        return service;

        function getDeviceTraffic(device, startTime, endTime, params) {
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            // var addr = device.macAddr || device.ipAddr;
            var addr = device.ipAddr;
            return $http.get(URI + '/auditlogs/traffic/devicetype/ic/devices/' + addr + '/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                params: encodeURL(params)
            }).then(function (data) {
                data.data.map(function (item) {
                    item.sendSpeed = item.sendBytes;
                    item.recvSpeed = item.recvBytes;
                    item.totalBytes = item.sendBytes + item.recvBytes;
                });
                data.device = device;
                data.endTime = endTime;
                return data;
            });
        }

        function getProtocolTraffic(deviceId, protocol, startTime, endTime, params) {
            if (protocol === "TRAFFIC_网络通用协议") {
                protocol = "TRAFFIC_TRADITION";
            }
            if (protocol === "TRAFFIC_其他") {
                protocol = "TRAFFIC_OTHER";
            }
            if (protocol === "TRAFFIC_MODBUS-TCP") {
                protocol = "TRAFFIC_MODBUS_TCP";
            }
            if (protocol === "TRAFFIC_MODBUS-UDP") {
                protocol = "TRAFFIC_MODBUS_UDP";
            }
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            return $http.get(URI + '/auditlogs/traffic/devicetype/ic/devices/' + deviceId + '/protocoltype/' + protocol + '/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                params: encodeURL(params)
            }).then(function (data) {
                data.data.map(function (item) {
                    item.sendSpeed = item.sendBytes;
                    item.recvSpeed = item.recvBytes;
                    item.totalBytes = item.sendBytes + item.recvBytes;
                });
                data.endTime = endTime;
                return data;
            });
        }

        function getDeviceTrafficStatistics(millsecond) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (millsecond);
                //  Make sure start time always include a full 20s cycle
                startSecond -= (startSecond % 20000);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                return $http.get(URI + '/auditlogs/traffic/devicetype/ic/starttime/' + startTimeStr + '/endtime/' + endTimeStr).then(function (data) {
                    data.data.map(function (item) {
                        item.deviceId = item.iCDeviceMac || item.iCDeviceIp;
                    });
                    return data.data;
                });
            });
        }

        function getProtocolTrafficStatistics(deviceId, millsecond) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (millsecond);
                var startTime = new Date(startSecond);
                var endTimeStr = formatDate(endTime);
                var startTimeStr = formatDate(startTime);
                return $http.get(URI + '/auditlogs/traffic/devicetype/ic/protocolstats/devices/' + deviceId + '/starttime/' + startTimeStr + '/endtime/' + endTimeStr)
                    .then(function (data) {
                        data.data.forEach(function (item) {
                            if (item.trafficName === "TRADITION") {
                                item.trafficName = "网络通用协议";
                            }
                            if (item.trafficName === "OTHER") {
                                item.trafficName = "其他";
                            }
                        });
                        return data.data;
                    });
            });
        }

        function getDeviceTrafficList(startTime, endTime, params) {
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            params = params || {};
            params.$limit = params.$limit;

            return $http.get(URI + '/auditlogs/traffic/devicetype/ic/devices/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                params: encodeURL(params)
            }).then(function (data) {
                data.data.map(function (item) {
                    item.Id = item.deviceId;
                    // item.deviceAddr = item.iCDeviceMac || item.iCDeviceIp;
                    item.deviceAddr = item.iCDeviceIp || item.iCDeviceMac;
                    item.deviceId = item.deviceAddr;
                    item.macAddr = item.iCDeviceMac;
                    item.ipAddr = item.iCDeviceIp;
                    item.totalBytes = item.sendBytes + item.recvBytes;
                    item.deviceInfo = encodeURI((item.iCDeviceMac || " ") + "|" + (item.iCDeviceIp || " ") + "|" + (item.deviceName || " "));
                });
                return data.data;
            });
        }

        function getDeviceTrafficCount(startTime, endTime, params) {
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            return $http.get(URI + '/auditlogs/traffic/devicetype/ic/devices/count/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getTopTrafficDevice(startTime, endTime, top) {
            return getDeviceTrafficList(startTime, endTime, {$limit: top || 5});
        }

        function getSelectedProtocols(deviceId) {
            return $http.get(URI + '/auditlogs/traffic/devicetype/ic/protocoltypes', {
                params: encodeURL({$filter: "(iCDeviceIp eq '" + deviceId + "')"}),
            }).then(function (data) {
                var protocols = [];
                data.data.forEach(function (item) {
                    if (item.trafficName === "TRADITION") {
                        item.trafficName = "网络通用协议";
                    }
                    if (item.trafficName === "OTHER") {
                        item.trafficName = "其他";
                    }
                    if (item.trafficName === "MODBUS_TCP") {
                        item.trafficName = "MODBUS-TCP";
                    }
                    if (item.trafficName === "MODBUS_UDP") {
                        item.trafficName = "MODBUS-UDP";
                    }
                    protocols.push({
                        protocolName: item.trafficName,
                        trafficId: "TRAFFIC_" + item.trafficName.toUpperCase()
                    });
                });
                return protocols;
            });
        }

        function deviceLineChart(sourceData, config) {
            var lineChartObj = {
                lang: {noData: "当前时间段内没有实时流量数据"},
                chart: {
                    type: 'line',
                    backgroundColor: '#212121',
                    color: 'white',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                },
                colors: ['#EEEEEE'],
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                xAxis: {
                    title: {
                        text: '时间',
                        style: {"color": "#CCCCCC"}
                    },
                    type: 'datetime',
                    //tickPixelInterval: 150,
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    title: {
                        text: '速率 (KB/s)',
                        style: {"color": "#CCCCCC"}
                    },
                    plotLines: [{
                        value: 0,
                        width: 100000,
                    }],
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    },
                    min: 0,
                    offset: 0
                },
                legend: {
                    enabled: config.legendEnable,
                    itemStyle: {
                        color: '#EEEEEE',
                        fontWeight: 'bold'
                    },
                    itemHiddenStyle: {
                        color: '#555555'
                    },
                    itemHoverStyle: {
                        color: '#45EE45'
                    }
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        lineWidth: 2,
                        turboThreshold: 10000
                    },
                    series: {marker: {symbol: 'circle', enabled: false}}
                },
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1分'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5分'
                    }, {
                        count: 30,
                        type: 'minute',
                        text: '30分'
                    }, {
                        type: 'all',
                        text: '全部'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + ':</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2) + ' KB/s';
                    }
                },
                series: sourceData
            };
            return lineChartObj;
        }

        function protocolLineChart(sourceData, config) {
            var lineChartObj = {
                lang: {noData: "当前时间段内没有实时流量数据"},
                chart: {
                    type: 'line',
                    backgroundColor: '#212121',
                    color: 'white',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                },
                colors: ['#EEEEEE'],
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                xAxis: {
                    title: {
                        text: '时间',
                        style: {"color": "#CCCCCC"}
                    },
                    type: 'datetime',
                    //tickPixelInterval: 150,
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    title: {
                        text: '速率 (KB/s)',
                        style: {"color": "#CCCCCC"}
                    },
                    plotLines: [{
                        value: 0,
                        width: 100000,
                    }],
                    gridLineColor: '#535353',
                    labels: {
                        style: {"color": "#CCCCCC"}
                    },
                    min: 0,
                    offset: 0
                },
                legend: {
                    enabled: config.legendEnable,
                    itemStyle: {
                        color: '#EEEEEE',
                        fontWeight: 'bold'
                    },
                    itemHiddenStyle: {
                        color: '#555555'
                    },
                    itemHoverStyle: {
                        color: '#45EE45'
                    }
                },
                exporting: {
                    enabled: false
                },
                plotOptions: {
                    line: {
                        lineWidth: 2,
                        turboThreshold: 10000
                    },
                    series: {marker: {symbol: 'circle', enabled: false}}
                },
                rangeSelector: {
                    buttons: [{
                        count: 1,
                        type: 'minute',
                        text: '1分'
                    }, {
                        count: 5,
                        type: 'minute',
                        text: '5分'
                    }, {
                        count: 30,
                        type: 'minute',
                        text: '30分'
                    }, {
                        type: 'all',
                        text: '全部'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + ':</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2) + ' KB/s';
                    }
                },
                series: sourceData
            };
            return lineChartObj;
        }

        function devicePieChart(sourceData, config, unit) {
            var data = [];
            for (var i = 0; i < sourceData.length; i++) {
                var item = [];
                item.push(sourceData[i].deviceName + " (" + sourceData[i].iCDeviceIp + ")");
                item.push(trafficDataService.formatTrafficDataWithoutUnit(sourceData[i].totalBytes, unit));

                data.push(item);
            }
            var pieChartObj = {
                lang: {noData: "当前时间段没有汇总流量数据"},
                chart: {
                    backgroundColor: null,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    color: 'white',
                    plotShadow: false
                },
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                style: {
                    color: '#EEEEEE'
                },
                tooltip: {
                    pointFormat: '{series.data.trafficName}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}' + unit + ' <b>',
                            shadow: false,
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'white',
                                textShadow: false
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: '设备流量',
                    data: data
                }]
            };
            return pieChartObj;
        }

        function protocolPieChart(sourceData, config, unit) {
            sourceData.map(function (m) {
                if (m.trafficName === "MODBUS_TCP") {
                    m.trafficName = "MODBUS-TCP";
                }
                if (m.trafficName === "MODBUS_UDP") {
                    m.trafficName = "MODBUS-UDP";
                }
            });
            var data = [];
            for (var i = 0; i < sourceData.length; i++) {
                var item = [];
                item.push(sourceData[i].trafficName);
                item.push(trafficDataService.formatTrafficDataWithoutUnit(sourceData[i].totalBytes, unit));

                data.push(item);
            }
            var pieChartObj = {
                chart: {
                    lang: {noData: "当前时间段没有汇总流量数据"},
                    backgroundColor: null,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    color: 'white',
                    plotShadow: false
                },
                title: {
                    text: config.title,
                    style: {
                        color: '#eeeeee'
                    }
                },
                style: {
                    color: '#EEEEEE'
                },
                tooltip: {
                    pointFormat: '{series.data.trafficName}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y}' + unit + ' <b>',
                            shadow: false,
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'white',
                                textShadow: false
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: '协议流量',
                    data: data
                }]
            };
            return pieChartObj;
        }

        function formatDate(date) {
            return (date.getUTCFullYear() + "-" + (((date.getUTCMonth() + 1) > 9) ? date.getUTCMonth() + 1 : ("0" + (date.getUTCMonth() + 1))) + "-" + ((date.getUTCDate() > 9) ? date.getUTCDate() : ("0" + date.getUTCDate())) + "T" + ((date.getUTCHours() > 9) ? date.getUTCHours() : ("0" + date.getUTCHours())) + ":" + ((date.getUTCMinutes() > 9) ? date.getUTCMinutes() : ("0" + date.getUTCMinutes())) + ":" + ((date.getUTCSeconds() > 9) ? date.getUTCSeconds() : ("0" + date.getUTCSeconds())) + "Z");
        }

        function getDeviceTrafficStats(params) {
            return $http.get(URI + '/auditlogs/traffics', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDeviceTrafficStatsCount(params) {
            return $http.get(URI + '/auditlogs/traffics/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }
    }

    function behaviordata($http, URI, encodeURL) {
        var service = {
            getBehaviorDatas: getBehaviorDatas,
            behaviorBarChart: behaviorBarChart,
            behaviorRadarChart: behaviorRadarChart,
            getAllExport: getAllExport
        };
        return service;


        function getBehaviorDatas(startTimeStr, endTimeStr) {
            return $http.get(URI + '/auditlogs/action/web/starttime/' + startTimeStr + '/endtime/' + endTimeStr, {
                params: encodeURL({$limit: 10})
            }).then(function (data) {
                return data.data;
            });
        }

        function behaviorBarChart(behaviordatas) {
            var colors = ['#c14746', '#ed8956', '#fafd6d', '#5deb41', '#62fece', '#55bcfc', '#4970fe', '#5e43bf', '#9333ae', '#d65897'];
            var userIp = [];
            var data = [];
            for (var i = 0; i < behaviordatas.length && i < 10; i++) {
                userIp.push(behaviordatas[i].usrIp || "未知");
                data.push({
                    name: behaviordatas[i].usrIp,
                    color: colors[i],
                    y: behaviordatas[i].totalNum
                });
            }
            var barChart = {
                lang: {noData: "当前时间段没有用户网站访问统计数据"},
                chart: {
                    type: 'column',
                    backgroundColor: '#212121',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    color: 'white',
                    plotShadow: false
                },
                title: {
                    text: ''
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    categories: userIp,
                    labels: {
                        style: {"color": "#CCCCCC"}
                    }
                },
                yAxis: {
                    min: 0,
                    allowDecimals: false,
                    gridLineWidth: 0.5,
                    gridLineColor: 'rgb(238, 197, 102)',
                    title: {
                        text: '总数 (个)'
                    }
                },
                tooltip: {
                    headerFormat: '<span font-size:10px">{point.key} : <b>{point.y}</b>个</span>',
                    pointFormat: '',
                    footerFormat: '',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointWidth: 25,
                        pointPadding: 0.3,
                        borderWidth: 0
                    }
                },
                style: {
                    color: '#EEEEEE'
                },
                series: [{
                    data: data
                }]
            };
            return barChart;
        }

        function behaviorRadarChart(behaviordata) {
            var radarData = [behaviordata.shoppingNum, behaviordata.newsNum, behaviordata.videoNum, behaviordata.sportNum, behaviordata.entertainmentNum, behaviordata.financeNum, behaviordata.gamesNum, behaviordata.novelNum];
            var maxNum = Math.max(behaviordata.shoppingNum, behaviordata.newsNum, behaviordata.videoNum, behaviordata.sportNum, behaviordata.entertainmentNum, behaviordata.financeNum, behaviordata.gamesNum, behaviordata.novelNum) * 6 / 5;
            var indicator = [
                {name: '购物', max: maxNum},
                {name: '新闻', max: maxNum},
                {name: '视频', max: maxNum},
                {name: '体育', max: maxNum},
                {name: '娱乐', max: maxNum},
                {name: '财经', max: maxNum},
                {name: '游戏', max: maxNum},
                {name: '小说', max: maxNum}
            ];
            var lineStyle = {
                normal: {
                    width: 1,
                    color: '#30c919'
                }
            };
            var option = {
                tooltip: {},
                radar: {
                    shape: 'polygon',
                    indicator: indicator,
                    splitNumber: 4,
                    name: {
                        textStyle: {
                            color: '#E8E8E8'
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: [
                                'rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)',
                                'rgba(238, 197, 102, 0.4)',
                                'rgba(238, 197, 102, 0.8)', 'rgba(238, 197, 102, 1)'
                            ].reverse()
                        }
                    },
                    splitArea: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(238, 197, 102, 0.5)'
                        }
                    }
                },
                series: [{
                    name: behaviordata.usrIp,
                    type: 'radar',
                    lineStyle: lineStyle,
                    symbol: 'circle',
                    itemStyle: {
                        normal: {
                            color: '#e8e8e8'
                        }
                    },
                    areaStyle: {
                        normal: {
                            opacity: 0.05
                        }
                    },
                    data: [
                        {
                            value: radarData,
                            name: behaviordata.usrIp,
                            areaStyle: {
                                normal: {
                                    opacity: 0.9,
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                        offset: 0, color: '#3F9371'
                                    }, {
                                        offset: 1, color: '#97BB37'
                                    }], false)
                                }
                            }
                        }
                    ]
                }]
            };
            return option;
        }

        function getAllExport(startTimeStr, endTimeStr, psw) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: URI + '/auditlogs/action/web/starttime/' + startTimeStr + '/endtime/' + endTimeStr + '/export',
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

    }
})();
