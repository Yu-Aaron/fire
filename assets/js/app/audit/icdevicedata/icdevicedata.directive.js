/**
 * Audit devicedata Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.icdevicedata')
        .directive('icdevicedataTable', ICDevicedataTable);

    function ICDevicedataTable($q, apiInfo, icdevicedata) {
        var devicedataTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/audit/icdevicedata/icdevicedataTable.html',
            link: link
        };

        return devicedataTableObj;

        function link(scope, element, attr, ctrl) {
            var fields = ['totalBytes', 'deviceName', 'ipAddr', 'macAddr', 'recvBytes', 'sendBytes', "percent", "createdAt"];
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'devicedata',
                pagination: true,
                numPerPage: 5,
                scrollable: false,
                totalCount: true,
                fields: fields,
                getAll: getAll,
                getCount: getCount,
            });

            function getCount(params) {
                return apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var endTime = new Date(endSecond);
                    var startSecond = endTime - (3600000);
                    var startTime = new Date(startSecond);
                    return icdevicedata.getDeviceTrafficCount(startTime, endTime, params);
                });
            }

            function getAll(params) {
                return apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var endTime = new Date(endSecond);
                    var startSecond = endTime - (3600000);
                    var startTime = new Date(startSecond);
                    return icdevicedata.getDeviceTrafficList(startTime, endTime, params).then(function (detail) {
                        return detail.length ? $q.all(detail).then(function () {
                            detail.map(function (d, i) {
                                detail[i].avgRecvSpeed = Math.floor(detail[i].avgRecvSpeed / 10.24) / 100 + ' KB/s';
                                detail[i].avgSendSpeed = Math.floor(detail[i].avgSendSpeed / 10.24) / 100 + ' KB/s';
                                detail[i].timestamp = new Date(detail[i].timestamp).getTime();
                            });
                            return detail;
                        }) : [];
                    });
                });
            }

            scope.$watch(function () {
                return scope.reloadDevices;
            }, function () {
                if (scope.reloadDevices === true) {
                    scope.$parent.dtable.getTableData();
                }
            });
        }
    }
})();
