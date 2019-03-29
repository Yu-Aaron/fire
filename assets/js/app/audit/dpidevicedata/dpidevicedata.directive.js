/**
 * Audit dpidevicedata Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.dpidevicedata')
        .directive('dpidevicedataTable', DPIDevicedataTable);

    function DPIDevicedataTable($q, dpidevicedata) {
        var devicedataTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/audit/dpidevicedata/dpidevicedataTable.html',
            link: link
        };

        return devicedataTableObj;

        function link(scope, element, attr, ctrl) {
            var fields = ['deviceName', 'dpiIp', 'dpiPort', 'maxSpeed', 'minSpeed', 'avgSpeed', "percent", "timestamp"];
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

            function getAll(params) {
                return dpidevicedata.getDpiTrafficList(params).then(function (detail) {
                    return detail.length ? $q.all(detail).then(function () {
                        detail.map(function (d, i) {
                            detail[i].maxSpeed = Math.floor(detail[i].maxSpeed / 10.24) / 100 + ' KB/s';
                            detail[i].minSpeed = Math.floor(detail[i].minSpeed / 10.24) / 100 + ' KB/s';
                            detail[i].avgSpeed = Math.floor(detail[i].avgSpeed / 10.24) / 100 + ' KB/s';
                        });
                        return detail;
                    }) : [];
                });
            }

            function getCount(params) {
                return dpidevicedata.getDpiTrafficCount(params);
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
