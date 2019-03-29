/**
 * Audit devicedata Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.devicedata')
        .directive('devicedataTable', DevicedataTable);

    function DevicedataTable($modal, $q, dpidata, trafficDataService) {
        var devicedataTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/audit/devicedata/devicedataTable.html',
            link: link
        };

        return devicedataTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var fields = ['totalBytes', 'deviceName', 'ipAddr', 'macAddr', 'recvSpeed', 'sendSpeed'];
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'devicedata',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                dateTimeRange: 'flowTimestamp'
            });

            function getCount(params) {
                return dpidata.getDevicedataCount(params);
            }

            function search(params) {
                return getAll(params);
            }

            function getAll(params) {
                return dpidata.getDevicedataList(params).then(function (detail) {
                    return detail.length ? $q.all(detail).then(function () {
                        detail.map(function (d, i) {
                            detail[i].recvBytes = trafficDataService.formatTrafficDataWithUnit(detail[i].recvBytes);
                            detail[i].sendBytes = trafficDataService.formatTrafficDataWithUnit(detail[i].sendBytes);
                        });
                        return detail;
                    }) : [];
                });
            }

            //function formatTrafficData(data) {
            //  var unit = " Byte";
            //  if (data > 0) {
            //    if (data > 1024) {
            //      data = Math.floor(data / 10.24) / 100;
            //      unit = " KB";
            //    }
            //    if (data > 1024) {
            //      data = Math.floor(data / 10.24) / 100;
            //      unit = " MB";
            //    }
            //    if (data > 1024) {
            //      data = Math.floor(data / 10.24) / 100;
            //      unit = " GB";
            //    }
            //    if (data > 1024) {
            //      data = Math.floor(data / 10.24) / 100;
            //      unit = " TB";
            //    }
            //  }
            //  data += unit;
            //  return data;
            //}

            scope.showStats = function (devicedata) {
                showStats($modal, devicedata, dpidata, scope);
            };
        }
    }

    function showStats($modal, devicedata, dpidata) {
        var modalInstance = $modal.open({
            size: 'lg',
            templateUrl: '/templates/audit/devicedata/devicedataStats.html',
            controller: function ($scope, $modalInstance) {
                $scope.deviceName = devicedata.deviceName;
                dpidata.getDevicedataStats(devicedata.deviceId, 60 * 60 * 1000).then(function (data) {
                    $('#devicedata-stats-line-chart').highcharts(dpidata.lineChart($scope, data.data, devicedata.deviceId));
                });
                $scope.confirm = function () {
                    $modalInstance.close();
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        });
        modalInstance.result;
    }
})();
