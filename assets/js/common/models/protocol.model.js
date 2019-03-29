(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('ProtocolReport', ProtocolReportModel);

    function ProtocolReportModel($http, URI) {
        var url = URI + '/auditlogs';

        var service = {
            getScheduleSetting: getScheduleSetting,
            setScheduleSetting: setScheduleSetting,
            getStartTime: getStartTime,
            getReport: getReport,
            getOutPutReport: getOutPutReport
        };
        return service;

        //////////

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
    }

})();
