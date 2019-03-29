/*

 report.logger.controller

 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_log')
        .controller('ReportLoggerCtrl', ReportLoggerCtrl);

    function ReportLoggerCtrl($scope, $state, Logger, $filter, $q) {
        var vm = this;
        vm.logger = {};

        vm.viewDetail = false;
        vm.logger.curPage = 0;
        vm.logger.numPerPage = 10;
        vm.logger.detail = {login: {}, operation: {}, system: {}};

        vm.reportPromise = null;

        vm.logger.editSetting = function () {
            vm.logger.editMode = true;
            vm.logger.tempSetting = angular.copy(vm.logger.setting);
        };
        vm.logger.confirmSetting = function () {
            vm.logger.editMode = false;
            if (vm.logger.tempSetting.frequency === 'daily') {
                vm.logger.settingData.schedulingJobMeta[0].dayOfMonth = "*";
                vm.logger.settingData.schedulingJobMeta[0].month = "*";
                vm.logger.settingData.schedulingJobMeta[0].dayOfWeek = "?";
                vm.logger.settingData.schedulingJobMeta[0].year = "*";
            } else if (vm.logger.tempSetting.frequency === 'weekly') {
                vm.logger.settingData.schedulingJobMeta[0].dayOfMonth = "?";
                vm.logger.settingData.schedulingJobMeta[0].month = "*";
                var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
                vm.logger.settingData.schedulingJobMeta[0].dayOfWeek = weekdays.indexOf(vm.logger.tempSetting.weekday).toString();
                vm.logger.settingData.schedulingJobMeta[0].year = "*";
            } else {
                vm.logger.settingData.schedulingJobMeta[0].dayOfMonth = "1";
                vm.logger.settingData.schedulingJobMeta[0].month = "*";
                vm.logger.settingData.schedulingJobMeta[0].dayOfWeek = "?";
                vm.logger.settingData.schedulingJobMeta[0].year = "*";
            }
            Logger.setScheduleSetting(vm.logger.settingData).then(function () {
                vm.logger.getData();
                vm.logger.curPage = 0;
            });
        };
        vm.logger.cancelSetting = function () {
            vm.logger.editMode = false;
        };

        vm.logger.getData = function () {
            var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var frequency, weekday;
            return Logger.getScheduleSetting('LOG_REPORT').then(function (setting) {
                vm.logger.settingData = setting;
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
                vm.logger.setting = {
                    frequency: frequency,
                    weekday: weekday
                };

                //var payload = {
                //    $orderby: 'timestamp',
                //    $limit: 1
                //};
                return Logger.getStartTime().then(function (data) {
                    if (data) {
                        vm.logger.Start = new Date(data.timestamp);
                        vm.logger.Start.setHours(0, 0, 0, 0);
                        //vm.logger.End = new Date();
                        //vm.logger.End = $scope.currentTime;
                        vm.logger.End = new Date();
                        vm.logger.Data = [];
                        var itemEnd, item;
                        //if (vm.logger.setting.frequency === 'daily') {
                        vm.logger.End.setHours(23, 59, 59, 999);
                        //}
                        if (vm.logger.setting.frequency === 'monthly') {
                            vm.logger.Start.setDate(1);
                        }
                        if (vm.logger.setting.frequency === 'weekly') {
                            itemEnd = new Date(vm.logger.Start);
                            for (var j = 0; j < 7; j++) {
                                // Common out to show empty data after today
                                //if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.logger.End){
                                if (itemEnd.getDay() === (setting.schedulingJobMeta[0].dayOfWeek - 1)) {
                                    itemEnd.setHours(0, 0, 0, 0);
                                    itemEnd.setTime(itemEnd.getTime() - 1);
                                    break;
                                } else {
                                    itemEnd.setDate(itemEnd.getDate() + 1);
                                }
                            }
                            if (itemEnd >= vm.logger.End) {
                                vm.logger.End = new Date(itemEnd);
                            }
                            if (itemEnd > vm.logger.Start) {
                                var tempStart = new Date(itemEnd);
                                tempStart.setDate(itemEnd.getDate() - 7);
                                item = {
                                    // Common out to show empty data before first record
                                    // start: new Date(vm.logger.Start),
                                    start: new Date(tempStart.getTime() + 1),
                                    end: new Date(itemEnd)
                                };
                                vm.logger.Data.push(item);
                                vm.logger.Start.setTime(itemEnd.getTime() + 1);
                            }
                        }

                        while (vm.logger.Start < vm.logger.End) {
                            if (vm.logger.setting.frequency === 'daily') {
                                itemEnd = new Date(vm.logger.Start);
                                itemEnd.setHours(23, 59, 59, 999);
                                item = {
                                    start: new Date(vm.logger.Start),
                                    end: new Date(itemEnd)
                                };
                                vm.logger.Data.push(item);
                                //vm.logger.Start.setTime(vm.logger.Start.getTime() + 86400000);
                                vm.logger.Start.setDate(vm.logger.Start.getDate() + 1);
                            }
                            if (vm.logger.setting.frequency === 'weekly') {
                                itemEnd = new Date(vm.logger.Start);
                                //itemEnd.setTime(itemEnd.getTime() + 7*86400000);
                                itemEnd.setDate(vm.logger.Start.getDate() + 7);
                                item = {
                                    start: new Date(vm.logger.Start),
                                    end: new Date(itemEnd - 1)
                                };
                                vm.logger.Data.push(item);
                                vm.logger.Start = new Date(itemEnd);
                            }
                            if (vm.logger.setting.frequency === 'monthly') {
                                itemEnd = new Date(vm.logger.Start);
                                itemEnd.setMonth((parseInt(vm.logger.Start.getMonth()) + 1).toString());
                                item = {
                                    start: new Date(vm.logger.Start),
                                    end: new Date(itemEnd)
                                };
                                vm.logger.Data.push(item);
                                vm.logger.Start.setMonth((parseInt(vm.logger.Start.getMonth()) + 1).toString());
                            }
                        }
                        if (vm.logger.Data) {
                            vm.logger.Data.reverse();
                            vm.logger.pagenation(vm.logger.curPage, vm.logger.numPerPage);
                        }
                    } else {
                        vm.logger.eventStart = null;
                        vm.logger.curData = [];
                        vm.logger.maxPage = 1;
                    }
                });
            });
        };
        vm.logger.getData();

        vm.logger.pagenation = function (num, per) {
            vm.logger.maxPage = Math.ceil(vm.logger.Data.length / per);
            num = num < 0 ? 0 : num > vm.logger.maxPage - 1 ? vm.logger.maxPage - 1 : num;
            vm.logger.curData = vm.logger.Data.slice(num * per, num * per + per);
        };
        vm.logger.changePage = function (num) {
            vm.logger.curPage = vm.logger.curPage + num < 0 ? 0 : vm.logger.curPage + num > vm.logger.maxPage - 1 ? vm.logger.maxPage - 1 : vm.logger.curPage + num;
            vm.logger.pagenation(vm.logger.curPage, vm.logger.numPerPage);
        };
        vm.logger.gotoPageHead = function () {
            vm.logger.curPage = 0;
            vm.logger.curData = vm.logger.Data.slice(0, vm.logger.numPerPage);
        };
        vm.logger.gotoPageEnd = function () {
            vm.logger.curPage = vm.logger.maxPage - 1;
            vm.logger.curData = vm.logger.Data.slice(vm.logger.curPage * vm.logger.numPerPage, vm.logger.Data.length);
        };

        var chart_bar_line, chart_pie;
        vm.logger.showDetail = function (log) {
            vm.logger.detail.title = '日志_' + (vm.logger.setting.frequency === 'daily' ? '每日' : vm.logger.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + log.start.getFullYear() + '-' + (parseInt(log.start.getMonth()) + 1) + '-' + log.start.getDate();

            vm.logger.currentLogger = log;
            //var filter = "(timestamp ge '" + log.start.toISOString().slice(0, log.start.toISOString().length - 5) + "+00:00' and timestamp le '" + log.end.toISOString().slice(0, log.end.toISOString().length - 5) + "+00:00')";
            var start = log.start.toISOString().slice(0, log.start.toISOString().length - 5) + "+00:00";
            var end = log.end.toISOString().slice(0, log.end.toISOString().length - 5) + "+00:00";

            var schedule = vm.logger.setting.frequency === 'daily' ? 'd' : vm.logger.setting.frequency === 'weekly' ? 'w' : 'm';
            vm.viewDetail = true;

            var deferred = $q.defer();
            vm.reportPromise = deferred.promise;
            //0-MW 操作, 1-DPI 登陆, 2-DPI 操作,　3-MW 操作,4-系统 序号　　　界面定义
            Logger.getReport(start, end, schedule).then(function (data) {
                deferred.resolve('success');
                var options = create_chart_option(data, schedule, log.start, log.end);

                chart_bar_line = echarts.init(document.getElementById("chart_bar_line"));

                chart_bar_line.setOption(options[0]);

                chart_pie = echarts.init(document.getElementById("chart_pie"));
                chart_pie.setOption(options[1]);
            }).then(function () {
                deferred.resolve('fail');
            });
        };

        function create_chart_option(data, schedule, start, end) {
            var xAxis;
            var bar_mwOperation_data;//0 MW操作
            var bar_mwLogin_data;//1 MW登录
            var bar_dpiOperation_data;//2 DPI 操作
            var bar_dpiLogin_data;//3  DPI登录
            var bar_system_data;//4 系统
            var bar_strategy_data;//5 策略

            var line_data;
            var pie_data = [0, 0, 0, 0, 0, 0];

            switch (schedule) {
                case "d":
                    xAxis = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
                        "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
                    bar_mwOperation_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    bar_mwLogin_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    bar_dpiOperation_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    bar_dpiLogin_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    bar_system_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    bar_strategy_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    line_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    data.map(function (m1) {
                        switch (m1.type) {
                            case 0:
                                bar_mwOperation_data[m1.timeInterval] = bar_mwOperation_data[m1.timeInterval] + m1.count;
                                pie_data[0] = pie_data[0] + m1.count;
                                break;
                            case 1:
                                bar_mwLogin_data[m1.timeInterval] = bar_mwLogin_data[m1.timeInterval] + m1.count;
                                pie_data[1] = pie_data[1] + m1.count;
                                break;
                            case 2:
                                bar_dpiOperation_data[m1.timeInterval] = bar_dpiOperation_data[m1.timeInterval] + m1.count;
                                pie_data[2] = pie_data[2] + m1.count;
                                break;
                            case 3:
                                bar_dpiLogin_data[m1.timeInterval] = bar_dpiLogin_data[m1.timeInterval] + m1.count;
                                pie_data[3] = pie_data[3] + m1.count;
                                break;
                            case 4:
                                bar_system_data[m1.timeInterval] = bar_system_data[m1.timeInterval] + m1.count;
                                pie_data[4] = pie_data[4] + m1.count;
                                break;
                            case 5:
                                bar_strategy_data[m1.timeInterval] = bar_strategy_data[m1.timeInterval] + m1.count;
                                pie_data[5] = pie_data[5] + m1.count;
                                break;
                        }
                        line_data[m1.timeInterval] = line_data[m1.timeInterval] + m1.count;
                    });
                    break;
                case "w":
                    xAxis = [];
                    var weekdays = [];
                    bar_mwOperation_data = [0, 0, 0, 0, 0, 0, 0];
                    bar_mwLogin_data = [0, 0, 0, 0, 0, 0, 0];
                    bar_dpiOperation_data = [0, 0, 0, 0, 0, 0, 0];
                    bar_dpiLogin_data = [0, 0, 0, 0, 0, 0, 0];
                    bar_system_data = [0, 0, 0, 0, 0, 0, 0];
                    bar_strategy_data = [0, 0, 0, 0, 0, 0, 0];

                    line_data = [0, 0, 0, 0, 0, 0, 0];
                    var date = new Date(start);
                    for (var j = 0; j < 7; j++) {
                        var year = date.getFullYear();
                        var month = date.getMonth() + 1;
                        var day = date.getDate();
                        xAxis.push(year + "-" + month + "-" + day);
                        weekdays.push(day);
                        date.setDate(date.getDate() + 1);
                    }
                    data.map(function (m2) {
                        for (var w = 0; w < weekdays.length; w++) {
                            if (m2.timeInterval === weekdays[w]) {
                                switch (m2.type) {
                                    case 0:
                                        bar_mwOperation_data[w] = bar_mwOperation_data[w] + m2.count;
                                        pie_data[0] = pie_data[0] + m2.count;
                                        break;
                                    case 1:
                                        bar_mwLogin_data[w] = bar_mwLogin_data[w] + m2.count;
                                        pie_data[1] = pie_data[1] + m2.count;
                                        break;
                                    case 2:
                                        bar_dpiOperation_data[w] = bar_dpiOperation_data[w] + m2.count;
                                        pie_data[2] = pie_data[2] + m2.count;
                                        break;
                                    case 3:
                                        bar_dpiLogin_data[w] = bar_dpiLogin_data[w] + m2.count;
                                        pie_data[3] = pie_data[3] + m2.count;
                                        break;
                                    case 4:
                                        bar_system_data[w] = bar_system_data[w] + m2.count;
                                        pie_data[4] = pie_data[4] + m2.count;
                                        break;
                                    case 5:
                                        bar_strategy_data[w] = bar_strategy_data[w] + m2.count;
                                        pie_data[5] = pie_data[5] + m2.count;
                                        break;
                                }
                                line_data[w] = line_data[w] + m2.count;
                            }
                        }
                    });
                    break;
                case "m":
                    xAxis = [];
                    bar_mwOperation_data = [];
                    bar_mwLogin_data = [];
                    bar_dpiOperation_data = [];
                    bar_dpiLogin_data = [];
                    bar_system_data = [];
                    bar_strategy_data = [];
                    line_data = [];
                    var isMaxDay = false;
                    var start_day = new Date(start);
                    var end_day = new Date(end);
                    while (!isMaxDay) {
                        var year_m = start_day.getFullYear();
                        var month_m = start_day.getMonth() + 1;
                        var day_m = start_day.getDate();
                        xAxis.push(year_m + "-" + month_m + "-" + day_m);
                        bar_mwOperation_data.push(0);
                        bar_dpiLogin_data.push(0);
                        bar_dpiOperation_data.push(0);
                        bar_mwLogin_data.push(0);
                        bar_system_data.push(0);
                        bar_strategy_data.push(0);

                        line_data.push(0);
                        start_day.setDate(start_day.getDate() + 1);

                        if (start_day >= end_day) {
                            isMaxDay = true;
                        }
                    }

                    data.map(function (m3) {
                        switch (m3.type) {
                            case 0:
                                bar_mwOperation_data[m3.timeInterval - 1] = bar_mwOperation_data[m3.timeInterval - 1] + m3.count;
                                pie_data[0] = pie_data[0] + m3.count;
                                break;
                            case 1:
                                bar_mwLogin_data[m3.timeInterval - 1] = bar_mwLogin_data[m3.timeInterval - 1] + m3.count;
                                pie_data[1] = pie_data[1] + m3.count;
                                break;
                            case 2:
                                bar_dpiOperation_data[m3.timeInterval - 1] = bar_dpiOperation_data[m3.timeInterval - 1] + m3.count;
                                pie_data[2] = pie_data[2] + m3.count;
                                break;
                            case 3:
                                bar_dpiLogin_data[m3.timeInterval - 1] = bar_dpiLogin_data[m3.timeInterval - 1] + m3.count;
                                pie_data[3] = pie_data[3] + m3.count;
                                break;
                            case 4:
                                bar_system_data[m3.timeInterval - 1] = bar_system_data[m3.timeInterval - 1] + m3.count;
                                pie_data[4] = pie_data[4] + m3.count;
                                break;
                            case 5:
                                bar_strategy_data[m3.timeInterval - 1] = bar_strategy_data[m3.timeInterval - 1] + m3.count;
                                pie_data[5] = pie_data[5] + m3.count;
                                break;
                        }
                        line_data[m3.timeInterval - 1] = line_data[m3.timeInterval - 1] + m3.count;
                    });
                    break;
            }

            var option_bar_line = {
                backgroundColor: "rgba(52,71,88,0.3)",
                "title": {
                    "text": "日志分类信息",
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
                    "top": 80,
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
                    "data": ['MW操作', 'MW登录', 'DPI操作', 'DPI登录', '系统日志', '策略日志', '总计']
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
                    "data": xAxis,
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


                }
                    //,
                    //{
                    //    "type": "inside",
                    //    "show": true,
                    //    "height": 15,
                    //    "start": 1,
                    //    "end": 35
                    //}
                ],
                "series": [
                    {
                        "name": "MW操作",
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": "#336699",
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
                        "data": bar_mwOperation_data
                    },
                    {
                        "name": "MW登录",
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": "#99CC33",
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
                        "data": bar_mwLogin_data
                    },
                    {
                        "name": "DPI操作",
                        "type": "bar",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "stack": "总量",
                        "itemStyle": {
                            "normal": {
                                "color": "#FF9900",
                                "barBorderRadius": 0,
                                "label": {
                                    "show": false,
                                    "position": "inside",
                                    formatter: function (p) {
                                        return p.value > 0 ? (p.value) : '';
                                    }
                                }
                            }
                        },
                        "data": bar_dpiOperation_data
                    },
                    {
                        "name": "DPI登录",
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": "#FFCC00",
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
                        "data": bar_dpiLogin_data
                    },
                    {
                        "name": "系统日志",
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": "#CC6600",
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
                        "data": bar_system_data
                    },
                    {
                        "name": "策略日志",
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": "#996600",
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
                        "data": bar_strategy_data
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
                        "data": line_data
                    }
                ]
            };

            var pie_data_add_style = [{
                value: pie_data[0], name: 'MW操作', label: {
                    normal: {
                        show: function () {
                            if (pie_data[0] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[0] === 0.00) {
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
                            if (pie_data[0] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[0] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": "#336699"}}
            }, {
                value: pie_data[1], name: 'MW登录', label: {
                    normal: {
                        show: function () {
                            if (pie_data[1] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[1] === 0.00) {
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
                            if (pie_data[1] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[1] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": "#99CC33"}}
            }, {
                value: pie_data[2],
                name: 'DPI操作', label: {
                    normal: {
                        show: function () {
                            if (pie_data[2] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[2] === 0.00) {
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
                            if (pie_data[2] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[2] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": "#FF9900"}}
            }, {
                value: pie_data[3], name: 'DPI登录', label: {
                    normal: {
                        show: function () {
                            if (pie_data[3] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[3] === 0.00) {
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
                            if (pie_data[3] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[3] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": "#FFCC00"}}
            }, {
                value: pie_data[4],
                name: '系统日志', label: {
                    normal: {
                        show: function () {
                            if (pie_data[4] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[4] === 0.00) {
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
                            if (pie_data[4] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[4] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": "#CC6600"}}
            }, {
                value: pie_data[5],
                name: '策略日志', label: {
                    normal: {
                        show: function () {
                            if (pie_data[5] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[5] === 0.00) {
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
                            if (pie_data[5] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    },
                    emphasis: {
                        show: function () {
                            if (pie_data[5] === 0.00) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }()
                    }
                }, itemStyle: {normal: {"color": "#996600"}}
            }];

            var option_pie = {
                backgroundColor: "rgba(52,71,88,0.3)",
                title: {
                    text: '日志统计信息',
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
                    data: ['MW操作', 'MW登录', 'DPI操作', 'DPI登录', '系统日志', '策略日志']
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
                        name: '日志统计',
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

        vm.logger.outPutReport = function () {
            reset_bar_zoom();
            //var title = fileName;
            //var incidentBarChart = $('#chart_bar_line');
            var bar_line_string = chart_bar_line.getDataURL({
                type: 'jpeg',
                backgroundColor: 'rgba(52,71,88,1)'
            });

            var pie_string = chart_pie.getDataURL({
                type: 'jpeg',
                backgroundColor: 'rgba(52,71,88,1)'
            });


            var start = vm.logger.currentLogger.start.toISOString().slice(0, vm.logger.currentLogger.start.toISOString().length - 5) + "+00:00";
            var end = vm.logger.currentLogger.end.toISOString().slice(0, vm.logger.currentLogger.end.toISOString().length - 5) + "+00:00";

            Logger.getOutPutReport(bar_line_string, pie_string, start, end, 'log').then(function (data) {
                window.open('./' + data, '_self');
            });
        };
    }
})();
