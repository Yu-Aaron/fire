/*

 report.protocol.controller

 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_protocol')
        .controller('ReportProtocolCtrl', ReportProtocolCtrl);

    function ReportProtocolCtrl($scope, $state, $timeout, ProtocolReport, $filter, $q, Audit) {
        var vm = this;
        vm.protocol = {};

        vm.viewDetail = false;
        vm.protocol.curPage = 0;
        vm.protocol.numPerPage = 10;
        vm.protocol.detail = {login: {}, operation: {}, system: {}};

        vm.reportPromise = null;

        vm.protocol.editSetting = function () {
            vm.protocol.editMode = true;
            vm.protocol.tempSetting = angular.copy(vm.protocol.setting);
        };
        vm.protocol.confirmSetting = function () {
            vm.protocol.editMode = false;
            if (vm.protocol.tempSetting.frequency === 'daily') {
                vm.protocol.settingData.schedulingJobMeta[0].dayOfMonth = "*";
                vm.protocol.settingData.schedulingJobMeta[0].month = "*";
                vm.protocol.settingData.schedulingJobMeta[0].dayOfWeek = "?";
                vm.protocol.settingData.schedulingJobMeta[0].year = "*";
            } else if (vm.protocol.tempSetting.frequency === 'weekly') {
                vm.protocol.settingData.schedulingJobMeta[0].dayOfMonth = "?";
                vm.protocol.settingData.schedulingJobMeta[0].month = "*";
                var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
                vm.protocol.settingData.schedulingJobMeta[0].dayOfWeek = weekdays.indexOf(vm.protocol.tempSetting.weekday).toString();
                vm.protocol.settingData.schedulingJobMeta[0].year = "*";
            } else {
                vm.protocol.settingData.schedulingJobMeta[0].dayOfMonth = "1";
                vm.protocol.settingData.schedulingJobMeta[0].month = "*";
                vm.protocol.settingData.schedulingJobMeta[0].dayOfWeek = "?";
                vm.protocol.settingData.schedulingJobMeta[0].year = "*";
            }
            ProtocolReport.setScheduleSetting(vm.protocol.settingData).then(function () {
                vm.protocol.getData();
                vm.protocol.curPage = 0;
            });
        };
        vm.protocol.cancelSetting = function () {
            vm.protocol.editMode = false;
        };

        vm.protocol.getData = function () {
            var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var frequency, weekday;
            return ProtocolReport.getScheduleSetting('PROTOCOL_REPORT').then(function (setting) {
                vm.protocol.settingData = setting;
                if (setting.schedulingJobMeta[0].dayOfMonth === "*") {
                    frequency = 'daily';
                    weekday = '星期一';
                } else if (setting.schedulingJobMeta[0].dayOfMonth === "?") {
                    frequency = 'weekly';
                    weekday = weekdays[setting.schedulingJobMeta[0].dayOfWeek];
                } else {
                    frequency = 'monthly';
                    weekday = '星期一';
                }
                vm.protocol.setting = {
                    frequency: frequency,
                    weekday: weekday
                };

                //var payload = {
                //    $orderby: 'timestamp',
                //    $limit: 1
                //};
                return ProtocolReport.getStartTime().then(function (data) {
                    if (data) {
                        vm.protocol.Start = new Date(data.flowTimestamp = data.flowTimestamp ? data.flowTimestamp : data.packetTimestamp);
                        vm.protocol.Start.setHours(0, 0, 0, 0);
                        //vm.protocol.End = new Date();
                        //vm.protocol.End = $scope.currentTime;
                        vm.protocol.End = new Date();
                        vm.protocol.Data = [];
                        var itemEnd, item;
                        //if (vm.protocol.setting.frequency === 'daily') {
                        vm.protocol.End.setHours(23, 59, 59, 999);
                        //}
                        if (vm.protocol.setting.frequency === 'monthly') {
                            vm.protocol.Start.setDate(1);
                        }
                        if (vm.protocol.setting.frequency === 'weekly') {
                            itemEnd = new Date(vm.protocol.Start);
                            for (var j = 0; j < 7; j++) {
                                // Common out to show empty data after today
                                //if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.protocol.End){
                                if (itemEnd.getDay() === (setting.schedulingJobMeta[0].dayOfWeek - 1)) {
                                    itemEnd.setHours(0, 0, 0, 0);
                                    itemEnd.setTime(itemEnd.getTime() - 1);
                                    break;
                                } else {
                                    itemEnd.setDate(itemEnd.getDate() + 1);
                                }
                            }
                            if (itemEnd >= vm.protocol.End) {
                                vm.protocol.End = new Date(itemEnd);
                            }
                            if (itemEnd > vm.protocol.Start) {
                                var tempStart = new Date(itemEnd);
                                tempStart.setDate(itemEnd.getDate() - 7);
                                item = {
                                    // Common out to show empty data before first record
                                    // start: new Date(vm.protocol.Start),
                                    start: new Date(tempStart.getTime() + 1),
                                    end: new Date(itemEnd)
                                };
                                vm.protocol.Data.push(item);
                                vm.protocol.Start.setTime(itemEnd.getTime() + 1);
                            }
                        }

                        while (vm.protocol.Start < vm.protocol.End) {
                            if (vm.protocol.setting.frequency === 'daily') {
                                itemEnd = new Date(vm.protocol.Start);
                                itemEnd.setHours(23, 59, 59, 999);
                                item = {
                                    start: new Date(vm.protocol.Start),
                                    end: new Date(itemEnd)
                                };
                                vm.protocol.Data.push(item);
                                //vm.protocol.Start.setTime(vm.protocol.Start.getTime() + 86400000);
                                vm.protocol.Start.setDate(vm.protocol.Start.getDate() + 1);
                            }
                            if (vm.protocol.setting.frequency === 'weekly') {
                                itemEnd = new Date(vm.protocol.Start);
                                //itemEnd.setTime(itemEnd.getTime() + 7*86400000);
                                itemEnd.setDate(vm.protocol.Start.getDate() + 7);
                                item = {
                                    start: new Date(vm.protocol.Start),
                                    end: new Date(itemEnd - 1)
                                };
                                vm.protocol.Data.push(item);
                                vm.protocol.Start = new Date(itemEnd);
                            }
                            if (vm.protocol.setting.frequency === 'monthly') {
                                itemEnd = new Date(vm.protocol.Start);
                                itemEnd.setMonth((parseInt(vm.protocol.Start.getMonth()) + 1).toString());
                                item = {
                                    start: new Date(vm.protocol.Start),
                                    end: new Date(itemEnd)
                                };
                                vm.protocol.Data.push(item);
                                vm.protocol.Start.setMonth((parseInt(vm.protocol.Start.getMonth()) + 1).toString());
                            }
                        }
                        if (vm.protocol.Data) {
                            vm.protocol.Data.reverse();
                            vm.protocol.pagenation(vm.protocol.curPage, vm.protocol.numPerPage);
                        }
                    } else {
                        vm.protocol.eventStart = null;
                        vm.protocol.curData = [];
                        vm.protocol.maxPage = 1;
                    }
                });
            });
        };
        vm.protocol.getData();

        vm.protocol.pagenation = function (num, per) {
            vm.protocol.maxPage = Math.ceil(vm.protocol.Data.length / per);
            num = num < 0 ? 0 : num > vm.protocol.maxPage - 1 ? vm.protocol.maxPage - 1 : num;
            vm.protocol.curData = vm.protocol.Data.slice(num * per, num * per + per);
        };
        vm.protocol.changePage = function (num) {
            vm.protocol.curPage = vm.protocol.curPage + num < 0 ? 0 : vm.protocol.curPage + num > vm.protocol.maxPage - 1 ? vm.protocol.maxPage - 1 : vm.protocol.curPage + num;
            vm.protocol.pagenation(vm.protocol.curPage, vm.protocol.numPerPage);
        };
        vm.protocol.gotoPageHead = function () {
            vm.protocol.curPage = 0;
            vm.protocol.curData = vm.protocol.Data.slice(0, vm.protocol.numPerPage);
        };
        vm.protocol.gotoPageEnd = function () {
            vm.protocol.curPage = vm.protocol.maxPage - 1;
            vm.protocol.curData = vm.protocol.Data.slice(vm.protocol.curPage * vm.protocol.numPerPage, vm.protocol.Data.length);
        };

        var chart_bar_line, chart_pie;
        vm.protocol.showDetail = function (protocol) {
            vm.protocol.detail.title = '协议_' + (vm.protocol.setting.frequency === 'daily' ? '每日' : vm.protocol.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + protocol.start.getFullYear() + '-' + (parseInt(protocol.start.getMonth()) + 1) + '-' + protocol.start.getDate();

            vm.protocol.currentProtocol = protocol;
            var start = protocol.start.toISOString().slice(0, protocol.start.toISOString().length - 5) + "+00:00";
            var end = protocol.end.toISOString().slice(0, protocol.end.toISOString().length - 5) + "+00:00";

            var schedule = vm.protocol.setting.frequency === 'daily' ? 'd' : vm.protocol.setting.frequency === 'weekly' ? 'w' : 'm';
            vm.viewDetail = true;

            var deferred = $q.defer();
            vm.reportPromise = deferred.promise;
            var frequency = vm.protocol.setting.frequency === "daily" ? "hourly" : "daily";
            var colors = ["#1D3D87", "#521A88", "#4372A0", "#107F6D", "#522A58", "#40A191", "#6591BC", "#6C4072", "#35549A", "#CCCCCC", "#67329B", "#C0D54A", "#DFC948", "#9FB042", "#6AA13F", "#BE9C3E", "#AC9A5F", "#BA3B5F", "#DF35EC", "#F94E92", "#A1A3A5"];
            var protocols = ["HTTP", "FTP", "Telnet", "SMTP", "POP3", "Modbus", "OPCDA", "S7", "DNP3", "IEC104", "MMS", "ProfinetIO", "EnipTcp", "EnipUdp", "EnipIO", "OPCUA", "SNMP", "FOCAS"];
            Audit.getGrouped(protocols[0].toLowerCase(), frequency, protocol.start, protocol.end).then(function (data) {
                var datas = reCreateData(data, schedule, start, end);
                var options = create_chart_option(protocols[0], colors[0], datas);
                deferred.resolve('success');

                chart_bar_line = echarts.init(document.getElementById("chart_bar_line"));

                chart_bar_line.setOption(options[0]);

                chart_pie = echarts.init(document.getElementById("chart_pie"));
                chart_pie.setOption(options[1]);

                colors.splice(0, 1);
                protocols.splice(0, 1);

                $timeout(function () {
                    if (vm.viewDetail && protocols.length > 0) {
                        getProtocolData([chart_bar_line, chart_pie], options, protocols, colors, frequency, protocol);
                    }
                }, 500);
            });
        };

        function reCreateData(data, schedule, start, end) {
            var xAxis;
            var bar_data;
            var line_data;
            var pie_data;
            switch (schedule) {
                case "d":
                    xAxis = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
                        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
                    bar_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    line_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    pie_data = 0;
                    data.map(function (m1, index1) {
                        bar_data[index1] = bar_data[index1] + Number(m1.value);
                        line_data[index1] = line_data[index1] + Number(m1.value);
                        pie_data = pie_data + Number(m1.value);
                    });
                    break;
                case "w":
                    xAxis = [];
                    var weekdays = [];
                    bar_data = [0, 0, 0, 0, 0, 0, 0];
                    line_data = [0, 0, 0, 0, 0, 0, 0];
                    pie_data = 0;

                    var date = new Date(start);
                    for (var j = 0; j < 7; j++) {
                        var year = date.getFullYear();
                        var month = date.getMonth() + 1;
                        var day = date.getDate();
                        xAxis.push(year + "-" + month + "-" + day);
                        weekdays.push(day);
                        date.setDate(date.getDate() + 1);
                    }
                    data.map(function (m2, index2) {
                        bar_data[index2] = bar_data[index2] + Number(m2.value);
                        line_data[index2] = line_data[index2] + Number(m2.value);
                        pie_data = pie_data + Number(m2.value);
                    });
                    break;
                case "m":
                    xAxis = [];
                    bar_data = [];
                    line_data = [];
                    pie_data = 0;
                    var isMaxDay = false;
                    var start_day = new Date(start);
                    var end_day = new Date(end);
                    while (!isMaxDay) {
                        var year_m = start_day.getFullYear();
                        var month_m = start_day.getMonth() + 1;
                        var day_m = start_day.getDate();
                        xAxis.push(year_m + "-" + month_m + "-" + day_m);
                        bar_data.push(0);

                        line_data.push(0);
                        start_day.setDate(start_day.getDate() + 1);

                        if (start_day >= end_day) {
                            isMaxDay = true;
                        }
                    }

                    data.map(function (m3, index3) {
                        bar_data[index3] = bar_data[index3] + Number(m3.value);
                        line_data[index3] = line_data[index3] + Number(m3.value);
                        pie_data = pie_data + Number(m3.value);
                    });
                    break;
            }

            return [xAxis, bar_data, line_data, pie_data];
        }

        function create_chart_option(protocolName, color, data) {
            var option_bar_line = {
                backgroundColor: "rgba(52,71,88,0.3)",
                "title": {
                    "text": "协议统计",
                    "subtext": "",
                    x: "center",

                    textStyle: {
                        color: '#fff',
                        fontSize: '22'
                    },
                    subtextStyle: {
                        color: '#90979c',
                        fontSize: '16'

                    }
                },
                "tooltip": {
                    "trigger": "axis",
                    "axisPointer": {
                        "type": "shadow",
                        textStyle: {
                            color: "#fff"
                        }
                    }
                },
                "grid": {
                    "borderWidth": 0,
                    "top": 100,
                    "bottom": 95,
                    textStyle: {
                        color: "#fff"
                    }
                },
                "legend": {
                    x: 'center',
                    top: '8%',
                    textStyle: {
                        color: '#90979c'
                    },
                    "data": [protocolName, '总计']
                },
                "calculable": true,
                "xAxis": [{
                    "type": "category",
                    "axisLine": {
                        lineStyle: {
                            color: '#90979c'
                        }
                    },
                    "splitLine": {
                        "show": false
                    },
                    "axisTick": {
                        "show": false
                    },
                    "splitArea": {
                        "show": false
                    },
                    "axisLabel": {
                        "interval": 0,
                        "rotate": 45

                    },
                    "data": data[0],
                }],
                "yAxis": [{
                    "type": "value",
                    "splitLine": {
                        "show": true
                    },
                    "axisLine": {
                        lineStyle: {
                            color: '#90979c'
                        }
                    },
                    "axisTick": {
                        "show": false
                    },
                    "axisLabel": {
                        "interval": 0,

                    },
                    "splitArea": {
                        "show": false
                    },

                }],
                "dataZoom": [{
                    "show": true,
                    "height": 30,
                    "xAxisIndex": [
                        0
                    ],
                    bottom: 30,
                    "start": 0,
                    "end": 100,
                    handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                    handleSize: '110%',
                    handleStyle: {
                        color: "#d3dee5",

                    },
                    textStyle: {
                        color: "#fff"
                    },
                    borderColor: "#90979c"


                }],
                "series": [
                    {
                        "name": protocolName,
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": color,
                                "label": {
                                    "show": false,
                                    "textStyle": {
                                        "color": "#fff"
                                    },
                                    "position": "inside",
                                    formatter: function (p) {
                                        return p.value > 0 ? (p.value) : '';
                                    }
                                }
                            }
                        },
                        "data": data[1]
                    },
                    {
                        "name": "总计",
                        "type": "line",
                        // "stack": "总量",
                        symbolSize: 10,
                        symbol: 'circle',
                        "itemStyle": {
                            "normal": {
                                "color": "#009999",
                                "barBorderRadius": 0,
                                "label": {
                                    "show": true,
                                    "position": "top",
                                    formatter: function (p) {
                                        return p.value > 0 ? (p.value) : '';
                                    }
                                }
                            }
                        },
                        "data": data[2]
                    }
                ]
            };

            var pie_data_add_style = [{
                value: data[3], name: protocolName, label: {
                    normal: {
                        show: function () {
                            if (data[3] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (data[3] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                },
                labelLine: {
                    normal: {
                        show: function () {
                            if (data[3] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (data[3] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": color}}
            }];

            var option_pie = {
                backgroundColor: "rgba(52,71,88,0.3)",
                title: {
                    text: '协议统计',
                    x: 'center',
                    textStyle: {
                        color: '#fff',
                        fontSize: '22'
                    },
                    subtextStyle: {
                        color: '#90979c',
                        fontSize: '16'

                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    x: 'center',
                    y: '11%',
                    textStyle: {
                        color: '#90979c'
                    },
                    data: [protocolName]
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        magicType: {
                            show: true,
                            type: ['pie', 'funnel']
                        }
                    }
                },
                calculable: true,
                series: [
                    {
                        name: '协议统计',
                        type: 'pie',
                        radius: [20, 110],
                        center: ['50%', '60%'],
                        roseType: 'radius',
                        data: pie_data_add_style
                    }
                ]
            };

            return [option_bar_line, option_pie];
        }

        function getProtocolData(chart, options, protocols, colors, frequency, protocol) {
            Audit.getGrouped(protocols[0].toLowerCase(), frequency, protocol.start, protocol.end).then(function (data) {
                var datas = reCreatePendingData(data);
                pending_bar_chart(chart[0], options[0], protocols[0], colors[0], datas);
                pending_pie_chart(chart[1], options[1], protocols[0], colors[0], datas);
                colors.splice(0, 1);
                protocols.splice(0, 1);
                $timeout(function () {
                    if (vm.viewDetail && protocols.length > 0) {
                        getProtocolData([chart_bar_line, chart_pie], options, protocols, colors, frequency, protocol);
                    }
                }, 500);
            },function () {
                if (vm.viewDetail && protocols.length > 0) {
                    getProtocolData([chart_bar_line, chart_pie], options, protocols, colors, frequency, protocol);
                }
            });
        }

        function reCreatePendingData(data) {
            var bar_data = [];
            var line_data = [];
            var pie_data = 0;

            data.map(function (m) {
                bar_data.push(Number(m.value));
                line_data.push(Number(m.value));
                pie_data = pie_data + Number(m.value);
            });

            return [bar_data, line_data, pie_data];
        }

        function pending_bar_chart(chart, option, protocolName, color, data) {
            var dataLength = option.legend.data.length;
            option.legend.data.splice(dataLength - 1, 1, protocolName);

            var deleteSeries = option.series.splice(dataLength - 1, 1);

            deleteSeries[0].data.map(function (m, index) {
                data[1][index] = data[1][index] + m;
            });

            var series_pending = {
                "name": protocolName,
                "type": "bar",
                "stack": "总量",
                "barWidth": 30,
                // "barMinHeight": 15,
                "barGap": "10%",
                "itemStyle": {
                    "normal": {
                        "color": color,
                        "label": {
                            "show": false,
                            "textStyle": {
                                "color": "#fff"
                            },
                            "position": "inside",
                            formatter: function (p) {
                                return p.value > 0 ? (p.value) : '';
                            }
                        }
                    }
                },
                "data": data[0]
            };

            var series_total = {
                "name": "总计",
                "type": "line",
                // "stack": "总量",
                symbolSize: 10,
                symbol: 'circle',
                "itemStyle": {
                    "normal": {
                        "color": "#009999",
                        "barBorderRadius": 0,
                        "label": {
                            "show": true,
                            "position": "top",
                            formatter: function (p) {
                                return p.value > 0 ? (p.value) : '';
                            }
                        }
                    }
                },
                "data": data[1]
            };

            option.series.push(series_pending);

            chart.setOption(option);

            option.legend.data.push('总计');
            option.series.push(series_total);
            chart.setOption(option);
        }

        function pending_pie_chart(chart, option, protocolName, color, data) {
            var series_pending = {
                value: data[2], name: protocolName, label: {
                    normal: {
                        show: function () {
                            if (data[2] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (data[2] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                },
                labelLine: {
                    normal: {
                        show: function () {
                            if (data[2] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (data[2] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": color}}
            };
            option.legend.data.push(protocolName);
            option.series[0].data.push(series_pending);
            chart.setOption(option);
        }

        function reset_bar_zoom() {
            if (chart_bar_line) {
                chart_bar_line.setOption({
                    "dataZoom": [{
                        "show": true,
                        "height": 30,
                        "xAxisIndex": [
                            0
                        ],
                        bottom: 30,
                        "start": 0,
                        "end": 100,
                        handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                        handleSize: '110%',
                        handleStyle: {
                            color: "#d3dee5",

                        },
                        textStyle: {
                            color: "#fff"
                        },
                        borderColor: "#90979c"


                    }
                        //,
                        //{
                        //    "type": "inside",
                        //    "show": true,
                        //    "height": 15,
                        //    "start": 1,
                        //    "end": 35
                        //}
                    ]
                });
            }
        }

        vm.protocol.outPutReport = function () {
            reset_bar_zoom();
            var bar_line_string = chart_bar_line.getDataURL({
                type: 'jpeg',
                backgroundColor: 'rgba(52,71,88,1)'
            });

            var pie_string = chart_pie.getDataURL({
                type: 'jpeg',
                backgroundColor: 'rgba(52,71,88,1)'
            });

            var start = vm.protocol.currentProtocol.start.toISOString().slice(0, vm.protocol.currentProtocol.start.toISOString().length - 5) + "+00:00";
            var end = vm.protocol.currentProtocol.end.toISOString().slice(0, vm.protocol.currentProtocol.end.toISOString().length - 5) + "+00:00";

            ProtocolReport.getOutPutReport(bar_line_string, pie_string, start, end, 'protocol').then(function (data) {
                window.open('./' + data, '_self');
            });
        };
    }
})();
