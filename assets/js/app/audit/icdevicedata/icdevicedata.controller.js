/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.icdevicedata')
        .controller('ICDeviceDataCtrl', ICDeviceDataCtrl)
        .controller('ICDeviceProtocolTrafficDataCtrl', ICDeviceProtocolTrafficDataCtrl);

    function ICDeviceDataCtrl(icdevicedata, apiInfo, $scope, $q, $interval, trafficDataService) {

        var deviceLineColors = ['#7cb5ec', '#f45b5b', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#91e8e1'];
        var vm = this;

        vm.showDeviceLine = function () {
            var config = {
                title: null,
                legendEnable: true,
                deviceIds: []
            };
            $('#icdevice-device-line-chart').highcharts(icdevicedata.deviceLineChart([], config));
        };

        vm.showDeviceTrafficPieChart = function () {
            var config = {title: null};
            var totalTraffics = 0;
            vm.trafficsStaticsData.forEach(function (item) {
                totalTraffics += item.totalBytes;
            });
            vm.totalDevices = vm.trafficsStaticsData.length;
            vm.totalTraffics = trafficDataService.formatTrafficDataWithUnit(totalTraffics);
            vm.reportTime = new Date();
            var unit = vm.totalTraffics.substring(vm.totalTraffics.indexOf(" ") + 1);
            $('#icdevice-traffic-statistics-pie-chart').highcharts(icdevicedata.devicePieChart(vm.trafficsStaticsData, config, unit));
            updateChartSize($('#icdevice-traffic-statistics-pie-chart').highcharts());
        };

        vm.changeDeviceLineChart = function () {
            //  note: 'apiInfo.sysbaseinfo()' need to invoke while switch the tab control back.
            $q.all([apiInfo.sysbaseinfo()]).then(function () {
                vm.showDeviceLine();
                loadDevicesAndPoints();
            });
        };

        vm.changeDeviceTrafficPieChartTimeSpan = function () {
            getTrafficStatistics();
        };

        init();

        function loadDevicePointsInterval() {
            loadDevicesAndPoints();
            var deviceLineInterval = $interval(function () {
                loadDevicesAndPoints();
            }, 24000);
            $scope.$on('$destroy', function () {
                $interval.cancel(deviceLineInterval);
            });
        }

        function loadDevicesAndPoints() {
            $scope.reloadDevices = true;
            apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (3600000);
                var startTime = new Date(startSecond);
                icdevicedata.getTopTrafficDevice(startTime, endTime, 5).then(function (data) {
                    loadDevicePoints(data).then(function () {
                        updateChartSize($('#icdevice-device-line-chart').highcharts());
                        $scope.reloadDevices = false;
                    });
                });
            });
        }

        function loadDevicePoints(devices) {
            var maxLineCount = 5;
            var chart = $('#icdevice-device-line-chart').highcharts();
            var series = chart ? (chart.series || [] ) : [];
            if (chart && series) {
                var getSeries = function (d, s) {
                    for (var k = 0; k < s.length; k++) {
                        if (s[k].options.id === d.deviceId) {
                            return s[k];
                        }
                    }
                    return undefined;
                };
                var getFirstAvailableColor = function () {
                    var colors = [];
                    series.forEach(function (item) {
                        colors.push(item.color);
                    });
                    for (var i = 0; i < deviceLineColors.length; i++) {
                        if ($.inArray(deviceLineColors[i], colors) < 0) {
                            return deviceLineColors[i];
                        }
                    }
                    return deviceLineColors[deviceLineColors.length - 1];
                };
                return apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var seriesToRemove = [];
                    series.forEach(function (serie) {
                        for (var i = 0; i < devices.length; i++) {
                            if (serie !== undefined && serie.options.id === devices[i].deviceId) {
                                return;
                            }
                        }
                        seriesToRemove.push(serie);
                    });
                    seriesToRemove.forEach(function (s) {
                        s.remove(false);
                    });
                    var promises = [];
                    for (var j = 0; j < devices.length && j <= maxLineCount; j++) {
                        var device = devices[j];
                        var deviceSeries = getSeries(device, series);
                        var isNewSeries = deviceSeries === undefined;
                        var endTime = new Date(endSecond);
                        var milliseconds = isNewSeries ? 60 * 60 * 1000 : 24 * 1000;
                        var startSecond = endTime - (milliseconds);
                        var startTime = new Date(startSecond);
                        //  create new series for new device, and get all of the data;
                        if (isNewSeries) {
                            chart.addSeries({
                                id: device.deviceId,
                                name: (device.Id === undefined || device.Id === null) ? device.deviceName + " (" + device.deviceId + ")" : device.deviceName,
                                color: getFirstAvailableColor()
                            });
                        } else {
                            deviceSeries.update({name: (device.Id === undefined || device.Id === null) ? device.deviceName + " (" + device.deviceId + ")" : device.deviceName});
                        }
                        promises.push(icdevicedata.getDeviceTraffic(device, startTime, endTime));
                    }
                    return $q.all(promises).then(function (data) {
                        for (var k = 0; k < devices.length && k <= maxLineCount; k++) {
                            var serie = getSeries(data[k].device, series);
                            var now = data[k].endTime.getTime();
                            for (var i = 0; i < data[k].data.length; i++) {
                                var startTime = new Date(data[k].data[i].timestamp).getTime();
                                var totalBytes = Math.floor(data[k].data[i].totalBytes / 10.24) / 100;
                                if (serie) {
                                    serie.addPoint([startTime, totalBytes], false, false);
                                }
                            }
                            if (data[k].data.length === 0) {
                                if (series[k]) {
                                    series[k].addPoint([now, 0], false, false);
                                }
                            }
                            chart.redraw(); //  redraw after add all points for each series;
                        }
                    });
                });
            }
            return $q.when(false);
        }

        function init() {
            $q.all([apiInfo.sysbaseinfo()]).then(function () {
                $scope.reloadDevices = false;
                vm.showDeviceLine();
                loadDevicePointsInterval();
            });
        }

        function getTrafficStatistics() {
            var time = 1;
            vm.timeSpan = vm.timeSpan || '1h';
            if (vm.timeSpan === "1h") {
                time = 3600 * 1000;
            } else if (vm.timeSpan === "24h") {
                time = 24 * 3600 * 1000;
            } else if (vm.timeSpan === "168h") {
                time = 168 * 3600 * 1000;
            }
            icdevicedata.getDeviceTrafficStatistics(time).then(function (data) {
                vm.trafficsStaticsData = data;
                vm.showDeviceTrafficPieChart();
            });
        }
    }

    function ICDeviceProtocolTrafficDataCtrl(deviceId, deviceInfo, icdevicedata, apiInfo, $scope, $q, $interval, trafficDataService) {
        var protocolLineColors = ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"];
        var vm = this;
        vm.deviceId = deviceId;
        var detailInfo = decodeURI(deviceInfo).split("|");
        vm.device = {deviceName: detailInfo[2], ipAddr: detailInfo[1], macAddr: detailInfo[0]};

        vm.showProtocolLine = function () {
            var config = {
                title: null,
                legendEnable: true,
            };
            $('#icdevice-device-protocol-line-chart').highcharts(icdevicedata.protocolLineChart([], config));
        };

        vm.showProtocolTrafficPieChart = function () {
            var config = {title: null};
            var totalTraffics = 0;
            vm.trafficsStaticsData.forEach(function (item) {
                totalTraffics += item.totalBytes;
            });
            vm.protocolReportTime = new Date();
            vm.totalTraffics = trafficDataService.formatTrafficDataWithUnit(totalTraffics);
            var unit = vm.totalTraffics.substring(vm.totalTraffics.indexOf(" ") + 1);
            $('#icdevice-traffic-statistics-pie-chart').highcharts(icdevicedata.protocolPieChart(vm.trafficsStaticsData, config, unit));
            updateChartSize($('#icdevice-traffic-statistics-pie-chart').highcharts());
        };

        vm.changeProtocolLineChart = function () {
            $q.all([apiInfo.sysbaseinfo()]).then(function () {
                vm.showProtocolLine();
                loadProtocolPointsInterval();
            });
        };

        vm.changeDeviceTrafficPieChartTimeSpan = function () {
            getProtocolTrafficStatistics();
        };

        init();

        function loadProtocolPointsInterval() {
            loadProtocolsAndPoints();
            var lineInterval = $interval(function () {
                loadProtocolsAndPoints();
            }, 24000);
            $scope.$on('$destroy', function () {
                $interval.cancel(lineInterval);
            });
        }

        function loadProtocolsAndPoints() {
            icdevicedata.getSelectedProtocols(vm.deviceId).then(function (data) {
                loadProtocolPoints(data).then(function () {
                    updateChartSize($('#icdevice-traffic-statistics-pie-chart').highcharts());
                });
            });
        }

        function loadProtocolPoints(protocols) {
            var chart = $('#icdevice-device-protocol-line-chart').highcharts();
            var series = chart ? (chart.series || [] ) : [];
            var deviceId = vm.deviceId;
            if (chart && series && protocols.length) {
                var inSeries = function (item, s) {
                    for (var k = 0; k < s.length; k++) {
                        if (s[k].name === item.protocolName) {
                            return true;
                        }
                    }
                    return false;
                };
                var getFirstAvailableColor = function () {
                    var colors = [];
                    series.forEach(function (item) {
                        colors.push(item.color);
                    });
                    for (var i = 0; i < protocolLineColors.length; i++) {
                        if ($.inArray(protocolLineColors[i], colors) < 0) {
                            return protocolLineColors[i];
                        }
                    }
                    return protocolLineColors[protocolLineColors.length - 1];
                };
                return apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var seriesToRemove = [];
                    series.forEach(function (serie) {
                        for (var i = 0; i < protocols.length; i++) {
                            if (serie && serie.name === protocols[i].protocolName) {
                                return;
                            }
                        }
                        seriesToRemove.push(serie);
                    });
                    seriesToRemove.forEach(function (s) {
                        s.remove(false);
                    });

                    var promises = [];
                    for (var j = 0; j < protocols.length; j++) {
                        var protocol = protocols[j];
                        var isNewSeries = inSeries(protocol, series) === false;
                        var endTime = new Date(endSecond);
                        var milliseconds = isNewSeries ? 60 * 60 * 1000 : 24 * 1000;
                        var startSecond = endTime - (milliseconds);
                        var startTime = new Date(startSecond);
                        //  create new series for new protocol, and get all of the data;
                        if (isNewSeries) {
                            chart.addSeries({
                                name: protocol.protocolName,
                                color: getFirstAvailableColor()
                            });
                        }
                        promises.push(icdevicedata.getProtocolTraffic(deviceId, protocol.trafficId, startTime, endTime));
                    }
                    return $q.all(promises).then(function (data) {
                        for (var k = 0; k < protocols.length; k++) {
                            var now = data[k].endTime.getTime();
                            for (var i = 0; i < data[k].data.length; i++) {
                                var startTime = new Date(data[k].data[i].timestamp).getTime();
                                var totalBytes = Math.floor(data[k].data[i].totalBytes / 10.24) / 100;
                                if (series[k]) {
                                    series[k].addPoint([startTime, totalBytes], false, false);
                                }
                            }
                            if (data[k].data.length === 0) {
                                if (series[k]) {
                                    series[k].addPoint([now, 0], false, false);
                                }
                            }
                            chart.redraw(); //  redraw after add all points for each series;
                        }
                    });
                });
            }
            return $q.when(false);
        }

        function init() {
            $q.all([apiInfo.sysbaseinfo()]).then(function (datas) {
                console.log(datas, 'comment out unused code here');
                // var data = (datas && datas.length > 0) ? datas[0]: undefined;
                // var currTime = new Date(data.data || "");
                // var endSecond = currTime - 24000;
                // var endTime = new Date(endSecond);
                // var startSecond = endTime - (3600000);
                // var startTime = new Date(startSecond);
                vm.showProtocolLine();
                loadProtocolPointsInterval();
            });
        }

        function getProtocolTrafficStatistics() {
            var time = 1;
            vm.timeSpan = vm.timeSpan || '1h';
            if (vm.timeSpan === "1h") {
                time = 3600 * 1000;
            } else if (vm.timeSpan === "24h") {
                time = 24 * 3600 * 1000;
            } else if (vm.timeSpan === "168h") {
                time = 168 * 3600 * 1000;
            }
            icdevicedata.getProtocolTrafficStatistics(vm.deviceId, time).then(function (data) {
                vm.trafficsStaticsData = data;
                vm.showProtocolTrafficPieChart();
            });
        }
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
})();
