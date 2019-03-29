/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.dpidevicedata')
        .controller('DPIDeviceDataCtrl', DPIDeviceDataCtrl)
        .controller('DPIDeviceTrafficDataCtrl', DPIDeviceTrafficDataCtrl);

    function DPIDeviceDataCtrl(dpidevicedata, apiInfo, $q, $scope, trafficDataService) {
        var vm = this;
        $scope.reloadDevices = false;
        init();

        vm.showDeviceLineChart = function () {
            if (vm.dpidevices) {
                var inputData = [];
                var colors = ['#91e8e1', '#2b908f', '#e4d354', '#f15c80', '#8085e9', '#f7a35c', '#90ed7d', '#f45b5b', '#7cb5ec'];
                var boxIds = [];
                var inputDeviceDatas = function (index) {
                    var data = [];
                    if (!vm.dpiTraffics[index]) {
                        return data;
                    } else if (vm.dpiTraffics[index].length < 1) {
                        data.push({
                            x: new Date().getTime(),
                            y: 0
                        });
                        return data;
                    }
                    var i = 0 - vm.dpiTraffics[index].length;

                    for (i; i < 0; i += 1) {
                        var timestamp = new Date(vm.dpiTraffics[index][i + vm.dpiTraffics[index].length].timestamp).getTime();
                        var totalBytes = Math.floor(vm.dpiTraffics[index][i + vm.dpiTraffics[index].length].totalBytes / 10.24) / 100;
                        data.push({
                            x: timestamp,
                            y: totalBytes
                        });
                    }
                    return data;
                };
                for (var j = 0; j < vm.dpidevices.length; j++) {
                    boxIds.push(vm.dpidevices[j].boxId);
                    var inputItem = {
                        boxId: vm.dpidevices[j].boxId,
                        name: vm.dpidevices[j].deviceName,
                        color: colors.pop(),
                        data: inputDeviceDatas(j)
                    };
                    inputData.push(inputItem);
                    //最多显示五台设备
                    if (j === 4) {
                        break;
                    }
                }
                var config = {
                    title: null,
                    legendEnable: true,
                    boxIds: boxIds
                };
                $('#dpidevice-realtime-line-chart').highcharts(dpidevicedata.deviceLineChart(inputData, config, colors, $scope));
                updateChartSize($('#dpidevice-realtime-line-chart').highcharts());
            }
        };

        vm.showDevicePieChart = function () {
            vm.totalDevices = vm.dpiTrafficStats.length;
            vm.totalBytes = 0;
            vm.reportTime = new Date();
            var config = {title: null};
            for (var k = 0; k < vm.dpiTrafficStats.length; k++) {
                vm.totalBytes += vm.dpiTrafficStats[k].totalBytes;
            }

            if (vm.totalBytes > 0) {
                vm.totalBytes = trafficDataService.formatTrafficDataWithUnit(vm.totalBytes);
                var unit = vm.totalBytes.substring(vm.totalBytes.indexOf(" ") + 1);
                $('#dpidevice-total-pie-chart').highcharts(dpidevicedata.devicePieChart(vm.dpiTrafficStats, config, unit));
            } else {
                config = {title: null};
                $('#dpidevice-total-pie-chart').highcharts(dpidevicedata.devicePieChart(vm.dpiTrafficStats, config, 'KB'));
            }
            updateChartSize($('#dpidevice-total-pie-chart').highcharts());
        };

        vm.changeLineChart = function () {
            init();
        };

        vm.changePieChart = function () {
            getDpiDevices().then(function () {
                getDpiTrafficTotal();
            });
        };

        function init() {
            getDpiDevices().then(function () {
                getDpiTrafficRealTime();
            });
        }

        function getDpiDevices() {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (3600000);
                var startTime = new Date(startSecond);
                return dpidevicedata.getDpiDevices(startTime, endTime).then(function (data) {
                    vm.dpidevices = data;
                });
            });
        }

        function getDpiTrafficRealTime() {
            vm.dpiTraffics = [];
            if (vm.dpidevices) {
                return apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var endTime = new Date(endSecond);
                    var startSecond = endTime - (3600000);
                    var startTime = new Date(startSecond);

                    var promises = [];
                    for (var j = 0; j < vm.dpidevices.length; j++) {
                        promises.push(dpidevicedata.getDpiTrafficRealTime(vm.dpidevices[j].boxId, startTime, endTime));
                    }
                    $q.all(promises).then(function (data) {
                        for (var i = 0; i < vm.dpidevices.length; i++) {
                            if (data[i].data.length > 0) {
                                vm.dpiTraffics.push(data[i].data);
                            } else {
                                vm.dpiTraffics.push({
                                    "timestamp": data[i].endTime,
                                    "totalBytes": 0
                                });
                            }
                        }
                        vm.showDeviceLineChart();
                    });
                });
            }
        }

        function getDpiTrafficTotal() {
            var time = 1;
            if (vm.totalTime === "1h") {
                time = 3600000;
            } else if (vm.totalTime === "24h") {
                time = 24 * 3600000;
            } else if (vm.totalTime === "168h") {
                time = 168 * 3600000;
            }
            dpidevicedata.getDpiTrafficTotal(time).then(function (data) {
                vm.dpiTrafficStats = data;
                vm.showDevicePieChart();
            });
        }

    }

    function DPIDeviceTrafficDataCtrl(dpidevicedata, apiInfo, device, boxID, dpiIp, $scope, $q, trafficDataService, deviceTypeService) {
        var vm = this;

        vm.simplifyModelName = deviceTypeService.simplifyModelName;
        vm.device = device;
        vm.boxID = boxID;
        vm.dpiIp = dpiIp;
        getSelectedProtocols();

        vm.showProtocolLine = function () {
            if (vm.protocols) {
                var inputData = [];
                //var inputColor = ['#7cb5ec','#f45b5b','#90ed7d','#f7a35c','#8085e9','#f15c80','#e4d354','#2b908f','#91e8e1'];
                var colors = ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
                    "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"].reverse();
                var protocolIds = [];
                var inputProtocolDatas = function (index) {
                    var data = [];
                    if (!vm.protocolRealTimeData[index]) {
                        return data;
                    } else if (vm.protocolRealTimeData[index].length < 1) {
                        data.push({
                            x: new Date().getTime(),
                            y: 0
                        });
                        return data;
                    }
                    var i = 0 - vm.protocolRealTimeData[index].length;

                    for (i; i < 0; i += 1) {
                        var timestamp = new Date(vm.protocolRealTimeData[index][i + vm.protocolRealTimeData[index].length].timestamp).getTime();
                        var totalBytes = Math.floor(vm.protocolRealTimeData[index][i + vm.protocolRealTimeData[index].length].totalBytes / 10.24) / 100;
                        data.push({
                            x: timestamp,
                            y: totalBytes
                        });
                    }
                    return data;
                };
                for (var j = 0; j < vm.protocols.length; j++) {
                    protocolIds.push(vm.protocols[j].trafficId);
                    var inputItem = {
                        name: vm.protocols[j].protocolName,
                        color: colors.pop(),
                        data: inputProtocolDatas(j)
                    };
                    inputData.push(inputItem);
                }
                var config = {
                    title: null,
                    legendEnable: true,
                    protocolIds: protocolIds,
                    boxID: boxID
                };
                $('#dpidevice-protocol-line-chart').highcharts(dpidevicedata.protocolLineChart(inputData, config, colors, $scope));
                updateChartSize($('#dpidevice-protocol-line-chart').highcharts());
            }
        };

        vm.showProtocolPieChart = function () {
            vm.protocolTotal = 0;
            vm.protocolNum = vm.protocolTotalData.length;
            vm.protocolReportTime = new Date();
            var config = {title: null};
            for (var k = 0; k < vm.protocolTotalData.length; k++) {
                vm.protocolTotal += vm.protocolTotalData[k].totalBytes;
            }
            if (vm.protocolTotal > 0) {
                vm.protocolTotal = trafficDataService.formatTrafficDataWithUnit(vm.protocolTotal);
                var unit = vm.protocolTotal.substring(vm.protocolTotal.indexOf(" ") + 1);
                $('#dpidevice-protocol-pie-chart').highcharts(dpidevicedata.protocolPieChar(vm.protocolTotalData, config, unit));
            } else {
                config = {title: null};
                $('#dpidevice-protocol-pie-chart').highcharts(dpidevicedata.protocolPieChar(vm.protocolTotalData, config, 'KB'));
            }
            updateChartSize($('#dpidevice-protocol-pie-chart').highcharts());
        };

        vm.changeLineChart = function () {
            getSelectedProtocols();
        };

        vm.changePieChart = function () {
            getProtocolTotal();
        };

        function getSelectedProtocols() {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (3600000);
                var startTime = new Date(startSecond);
                dpidevicedata.getSelectedProtocols(boxID, startTime, endTime).then(function (data) {
                    vm.protocols = data;
                    getProtocolRealTime();
                });
            });
        }

        function getProtocolRealTime() {
            vm.protocolRealTimeData = [];
            if (vm.protocols) {
                apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var endTime = new Date(endSecond);
                    var startSecond = endTime - (3600000);
                    var startTime = new Date(startSecond);

                    var promises = [];
                    for (var j = 0; j < vm.protocols.length; j++) {
                        promises.push(dpidevicedata.getProtocolRealTime(boxID, vm.protocols[j].trafficId, startTime, endTime));
                    }
                    $q.all(promises).then(function (data) {
                        for (var i = 0; i < vm.protocols.length; i++) {
                            if (data[i].data.length > 0) {
                                vm.protocolRealTimeData.push(data[i].data);
                            } else {
                                vm.protocolRealTimeData.push({
                                    "timestamp": data[i].endTime,
                                    "totalBytes": 0
                                });
                            }
                        }
                        vm.showProtocolLine();
                    });
                });
            }
        }

        function getProtocolTotal() {
            var time = 3600000;
            if (vm.protocolTime && vm.protocolTime !== "1h") {
                if (vm.protocolTime === "24h") {
                    time = 24 * 3600000;
                } else if (vm.protocolTime === "168h") {
                    time = 168 * 3600000;
                }
            }
            dpidevicedata.getProtocolTotal(boxID, time).then(function (data) {
                vm.protocolTotalData = data;
                vm.showProtocolPieChart();
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
