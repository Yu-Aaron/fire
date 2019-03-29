(function () {
    'use strict';

    angular
        .module('southWest.session.flowdata_overview')
        .controller('DPIDataCtrl2', DPIDataCtrl2);

    function DPIDataCtrl2(mwdata, $modal, $rootScope, $q, $scope, uiCtrl, trafficDataService,dpidevicedata,apiInfo) {
        var vm = this;
        vm.protocolTime = "1h";


        getOverView();
        getProtocolView();
        getSelectedProtocols();

        vm.showTotalLineChart = function () {
            var inputData = [];
            var inputItem = {
                name: '数据流量',
                data: (function () {
                    var data = [];
                    if (!vm.overViewData) {
                        return data;
                    } else if (vm.overViewData.length < 1) {
                        data.push({
                            x: new Date().getTime(),
                            y: 0
                        });
                        return data;
                    }
                    var i = 0 - vm.overViewData.length;


                    for (i; i < 0; i += 1) {
                        var startTime = new Date(vm.overViewData[i + vm.overViewData.length].timestamp).getTime();
                        var totalBytes = Math.floor(vm.overViewData[i + vm.overViewData.length].totalBytes / 10.24) / 100;
                        data.push({
                            x: startTime,
                            y: totalBytes
                        });
                    }
                    return data;
                }())
            };
            inputData.push(inputItem);
            var config = {
                title: null,
                legendEnable: true
            };
            $('#dpi-overview-line-chart').highcharts(/*'StockChart', */mwdata.totalLineChart(inputData, config, $scope));
        };

        vm.showProtocolPieChart = function () {
            vm.protocolTotal = 0;
            vm.protocolNum = 0;
            vm.reportTime = new Date();
            var config_left = {title: null};
            for (var k = 0; k < vm.protocolViewData.length; k++) {
                vm.protocolNum++;
                vm.protocolTotal += vm.protocolViewData[k].totalBytes;
            }
            if (vm.protocolTotal > 0) {
                vm.protocolTotal = trafficDataService.formatTrafficDataWithUnit(vm.protocolTotal);
                var unit = vm.protocolTotal.substring(vm.protocolTotal.indexOf(" ") + 1);
                $('#dpi-protocol-pie-chart').highcharts(mwdata.pieChart(vm.protocolViewData, config_left, unit));
            } else {
                config_left = {title: null};
                $('#dpi-protocol-pie-chart').highcharts(mwdata.pieChart(vm.protocolViewData, config_left));
            }
            updateChartSize($('#dpi-protocol-pie-chart').highcharts());
        };

        vm.changeProtocolPieChart = function () {
            getProtocolView();
        };

        vm.showDeviceLine = function () {
            if (vm.selectedDevices) {
                var inputData = [];
                var inputColor = ['#7cb5ec', '#f45b5b', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#91e8e1'];
                if (vm.selectedDevices.length > 3) {
                    console.log("Error! selected devices are more than 3!");
                    return 0;
                }
                var deviceIds = [];
                var inputDeviceDatas = function (index) {
                    var data = [];
                    if (!vm.deviceData[index]) {
                        return data;
                    } else if (vm.deviceData[index].length < 1) {
                        data.push({
                            x: new Date().getTime(),
                            y: 0
                        });
                        return data;
                    }
                    var i = 0 - vm.deviceData[index].length;

                    for (i; i < 0; i += 1) {
                        var startTime = new Date(vm.deviceData[index][i + vm.deviceData[index].length].startTime).getTime();
                        var totalBytes = Math.floor(vm.deviceData[index][i + vm.deviceData[index].length].totalBytes / 10.24) / 100;
                        data.push({
                            x: startTime,
                            y: totalBytes
                        });
                    }
                    //console.log(data);
                    return data;
                };
                for (var j = 0; j < vm.selectedDevices.length; j++) {
                    deviceIds.push(vm.selectedDevices[j].deviceId);
                    var inputItem = {
                        name: vm.selectedDevices[j].name,
                        color: inputColor[j],
                        data: inputDeviceDatas(j)
                    };
                    inputData.push(inputItem);
                }
                var config = {
                    title: null,
                    legendEnable: true,
                    deviceIds: deviceIds
                };
                vm.deviceLineChart = mwdata.deviceLineChart(inputData, config, $scope);
                $('#dpi-deviceview-line-chart').highcharts(/*'StockChart', */vm.deviceLineChart);
            }
        };

        vm.showProtocolLine = function () {
            if (vm.protocols) {
                var inputData = [];
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
                    protocolIds: protocolIds
                };
                $('#dpidevice-protocol-line-chart').highcharts(dpidevicedata.protocolLineChart(inputData, config, colors, $scope));
                updateChartSize($('#dpidevice-protocol-line-chart').highcharts());
            }
        };

        function getOverView() {
            mwdata.getOverView(3600000).then(function (data) {
                vm.overViewData = data.data;
                vm.showTotalLineChart();
            });
        }

        function getProtocolView() {
            var time = 1;
            if (vm.protocolTime === "1h") {
                time = 3600000;
            } else if (vm.protocolTime === "24h") {
                time = 24 * 3600000;
            } else if (vm.protocolTime === "168h") {
                time = 168 * 3600000;
            }
            mwdata.getProtocolView(time).then(function (data) {
                vm.protocolViewData = data;
                vm.showProtocolPieChart();
            });
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

        function getSelectedProtocols() {
            return apiInfo.sysbaseinfo().then(function (data) {
                var currTime = new Date(data.data || "");
                var endSecond = currTime - 24000;
                var endTime = new Date(endSecond);
                var startSecond = endTime - (3600000);
                var startTime = new Date(startSecond);
                dpidevicedata.getSelectedProtocols(startTime, endTime).then(function (data) {
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
                        promises.push(dpidevicedata.getProtocolRealTime(vm.protocols[j].trafficId, startTime, endTime));
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
    }

})();
