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
        .factory('dpidata', dpidata);

    function auditModel($q, $http, URI, encodeURL, topologyId) {
        var url = URI + '/auditlogs';

        var service = {
            get: get,
            getAll: getAll,
            getCount: getCount,
            getDeviceData: getDeviceData,
            getAllExport: getAllExport,
            getGrouped: getGrouped,
            getScheduleSetting: getScheduleSetting,
            setScheduleSetting: setScheduleSetting
        };

        return service;

        //////////
        function get(id, type) {
            return $http.get(url + '/head/' + id + '/type/' + type).then(function (data) {
                return data.data;
            });
        }

        function getAll(params, type) {
            var factory = (type === 'normal' || type === 'http' || type === 'ftp' || type === 'pop3' || type === 'smtp' || type === 'telnet') ? false : true;
            if (type && factory) {
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

        function getCount(params, type) {
            var factory = (type === 'normal' || type === 'http' || type === 'ftp' || type === 'pop3' || type === 'smtp' || type === 'telnet') ? false : true;
            if (type && factory) {
                return $http.get(url + '/detailinfo/type/' + type + '/count', {
                    params: encodeURL(params)
                }).then(function (data) {
                    return data.data;
                });
            }
            return $http.get(url + '/heads/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getDeviceData(params) {
            return $http.get(url + '/topology/' + topologyId.id + '/iptraffic/devices', params).then(function (data) {
                console.log(data);
                return data.data;
            });
        }

        function getAllExport(params, psw, type) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: url + '/topology/' + topologyId.id + '/' + type + '/export',
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

    }

    function dpidata($http, $q, $interval, URI, encodeURL, apiInfo, topologyId) {
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
                return $http.get(URI + '/auditlogs' + '/topology/' + topologyId.id + '/iptraffic/totalstats/' + startTimeStr + '/' + endTimeStr).then(function (data) {
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
                return $http.get(URI + '/auditlogs' + '/topology/' + topologyId.id + '/iptraffic/protocolstats/' + startTimeStr + '/' + endTimeStr).then(function (data) {
                    //console.log("ProtocolView data:");
                    //console.log(data.data);
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
            return $http.get(URI + '/devices/topology/' + topologyId + '?$filter=category%20eq%20FACTORY_DEVICE').then(function (data) {
                return data.data;
            });
        }

        function getSelectedDevice(topologyId) {
            return $http.get(URI + '/devices/topology/' + topologyId + '?$filter=category%20eq%20FACTORY_DEVICE and selected eq 1').then(function (data) {
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
                        text: '数据大小 (KB/s)',
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
                                            var startTime = new Date(data[i + data.length].startTime).getTime();
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
                        text: '数据大小 (KB/s)',
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
                        }
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
                        return '<b>数据流量</b><br/>' +
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
                        text: '数据大小 (KB/s)',
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
                series: sourceData
            };
            return lineChartObj;
        }

        function pieChart(protocolAllData, config) {
            //console.log("protocol data:");
            //console.log(protocolAllData);
            var data = [];
            for (var i = 0; i < protocolAllData.length; i++) {
                var item = [];
                item.push(protocolAllData[i].trafficName);
                item.push(protocolAllData[i].totalBytes);

                data.push(item);
            }
            //console.log(data);
            var pieChartObj = {
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
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'white'
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
})();
