/*

 report.logger.controller

 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.report_event')
        .controller('ReportEventCtrl', ReportEventCtrl);
    //Enum, apiInfo, $rootScope,HCConfig, Device,$q,Event
    function ReportEventCtrl($scope, $state, Incident, $q) {
        var vm = this;
        vm.incident = {};

        //====================Incident====================
        vm.incident.viewDetail = false;
        vm.incident.curPage = 0;
        vm.incident.numPerPage = 10;
        vm.incident.detail = {};

        vm.incident.isInputSrcIp = false;
        vm.incident.isInputDstIp = false;

        vm.incident.inputSrcIp = "";
        vm.incident.inputDstIp = "";

        //vm.incident.ips = [];

        vm.incident.selectType = "level";
        //vm.incident.selectedSourceIp = "";
        //vm.incident.selectedDestIp = "";

        vm.reportPromise = null;

        vm.incident.editSetting = function () {
            vm.incident.editMode = true;
            vm.incident.tempSetting = angular.copy(vm.incident.setting);
        };
        vm.incident.confirmSetting = function () {
            vm.incident.editMode = false;
            vm.incident.settingData.schedulingJob.jobData = vm.incident.tempSetting.level;
            if (vm.incident.tempSetting.frequency === 'daily') {
                vm.incident.settingData.schedulingJobMeta[0].dayOfMonth = "*";
                vm.incident.settingData.schedulingJobMeta[0].month = "*";
                vm.incident.settingData.schedulingJobMeta[0].dayOfWeek = "?";
                vm.incident.settingData.schedulingJobMeta[0].year = "*";
            } else if (vm.incident.tempSetting.frequency === 'weekly') {
                vm.incident.settingData.schedulingJobMeta[0].dayOfMonth = "?";
                vm.incident.settingData.schedulingJobMeta[0].month = "*";
                var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
                vm.incident.settingData.schedulingJobMeta[0].dayOfWeek = weekdays.indexOf(vm.incident.tempSetting.weekday).toString();
                vm.incident.settingData.schedulingJobMeta[0].year = "*";
            } else {
                vm.incident.settingData.schedulingJobMeta[0].dayOfMonth = "1";
                vm.incident.settingData.schedulingJobMeta[0].month = "*";
                vm.incident.settingData.schedulingJobMeta[0].dayOfWeek = "?";
                vm.incident.settingData.schedulingJobMeta[0].year = "*";
            }
            Incident.setScheduleSetting(vm.incident.settingData).then(function () {
                vm.incident.getData();
                vm.incident.curPage = 0;
            });
        };
        vm.incident.cancelSetting = function () {
            vm.incident.editMode = false;
        };

        vm.incident.getData = function () {
            var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var frequency, weekday;
            return Incident.getScheduleSetting('INCIDENT_REPORT').then(function (setting) {
                vm.incident.settingData = setting;
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
                vm.incident.setting = {
                    frequency: frequency,
                    weekday: weekday
                    //level: setting.schedulingJob.jobData
                };

                //var payload = {
                //    $orderby: 'timestamp',
                //    $limit: 1
                //};
                return Incident.getStartTime().then(function (data) {
                    if (data) {
                        vm.incident.Start = new Date(data.timestamp);
                        vm.incident.Start.setHours(0, 0, 0, 0);
                        //vm.incident.End = new Date();
                        //vm.incident.End = $rootScope.currentTime;
                        vm.incident.End = new Date();
                        vm.incident.Data = [];
                        var itemEnd, item;
                        //if (vm.incident.setting.frequency === 'daily') {
                        vm.incident.End.setHours(23, 59, 59, 999);
                        //}
                        if (vm.incident.setting.frequency === 'monthly') {
                            vm.incident.Start.setDate(1);
                        }
                        if (vm.incident.setting.frequency === 'weekly') {
                            itemEnd = new Date(vm.incident.Start);
                            for (var j = 0; j < 7; j++) {
                                // Common out to show empty data after today
                                //if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.incident.End){
                                if (itemEnd.getDay() === (setting.schedulingJobMeta[0].dayOfWeek - 1)) {
                                    itemEnd.setHours(0, 0, 0, 0);
                                    itemEnd.setTime(itemEnd.getTime() - 1);
                                    break;
                                } else {
                                    itemEnd.setDate(itemEnd.getDate() + 1);
                                }
                            }
                            if (itemEnd >= vm.incident.End) {
                                vm.incident.End = new Date(itemEnd);
                            }
                            if (itemEnd > vm.incident.Start) {
                                var tempStart = new Date(itemEnd);
                                tempStart.setDate(itemEnd.getDate() - 7);
                                item = {
                                    // Common out to show empty data before first record
                                    // start: new Date(vm.incident.Start),
                                    start: new Date(tempStart.getTime() + 1),
                                    end: new Date(itemEnd)
                                };
                                vm.incident.Data.push(item);
                                vm.incident.Start.setTime(itemEnd.getTime() + 1);
                            }
                        }

                        while (vm.incident.Start < vm.incident.End) {
                            if (vm.incident.setting.frequency === 'daily') {
                                itemEnd = new Date(vm.incident.Start);
                                itemEnd.setHours(23, 59, 59, 999);
                                item = {
                                    start: new Date(vm.incident.Start),
                                    end: new Date(itemEnd)
                                };
                                vm.incident.Data.push(item);
                                vm.incident.Start.setTime(itemEnd.getTime() + 1);
                            }
                            if (vm.incident.setting.frequency === 'weekly') {
                                itemEnd = new Date(vm.incident.Start);
                                itemEnd.setDate(vm.incident.Start.getDate() + 7);
                                item = {
                                    start: new Date(vm.incident.Start),
                                    end: new Date(itemEnd - 1)
                                };
                                vm.incident.Data.push(item);
                                vm.incident.Start = new Date(itemEnd);
                            }
                            if (vm.incident.setting.frequency === 'monthly') {
                                itemEnd = new Date(vm.incident.Start);
                                itemEnd.setMonth((parseInt(vm.incident.Start.getMonth()) + 1).toString());
                                item = {
                                    start: new Date(vm.incident.Start),
                                    end: new Date(itemEnd)
                                };
                                vm.incident.Data.push(item);
                                vm.incident.Start.setMonth((parseInt(vm.incident.Start.getMonth()) + 1).toString());
                            }
                        }
                        if (vm.incident.Data) {
                            vm.incident.Data.reverse();
                            vm.incident.pagenation(vm.incident.curPage, vm.incident.numPerPage);
                        }
                    } else {
                        vm.incident.eventStart = null;
                        vm.incident.curData = [];
                        vm.incident.maxPage = 1;
                    }
                });
            });
        };
        vm.incident.getData();

        vm.incident.pagenation = function (num, per) {
            vm.incident.maxPage = Math.ceil(vm.incident.Data.length / per);
            num = num < 0 ? 0 : num > vm.incident.maxPage - 1 ? vm.incident.maxPage - 1 : num;
            vm.incident.curData = vm.incident.Data.slice(num * per, num * per + per);
        };
        vm.incident.changePage = function (num) {
            vm.incident.curPage = vm.incident.curPage + num < 0 ? 0 : vm.incident.curPage + num > vm.incident.maxPage - 1 ? vm.incident.maxPage - 1 : vm.incident.curPage + num;
            vm.incident.pagenation(vm.incident.curPage, vm.incident.numPerPage);
        };
        vm.incident.gotoPageHead = function () {
            vm.incident.curPage = 0;
            vm.incident.curData = vm.incident.Data.slice(0, vm.incident.numPerPage);
        };
        vm.incident.gotoPageEnd = function () {
            vm.incident.curPage = vm.incident.maxPage - 1;
            vm.incident.curData = vm.incident.Data.slice(vm.incident.curPage * vm.incident.numPerPage, vm.incident.Data.length);
        };

        var chart_bar_line;
        var chart_pie;

        //vm.incident.getIpAndDevice = function () {
        //    DeviceAsset.getAll().then(function (data) {
        //        data.map(function (m) {
        //            vm.incident.ips.push({name: m.name, ip: m.ipAddress});
        //        });
        //    });
        //};
        //
        //vm.incident.getIpAndDevice();

        $scope.getReportIp = function (str, type) {
            var start = vm.incident.currentIncident.start.toISOString().slice(0, vm.incident.currentIncident.start.toISOString().length - 5) + "+00:00";
            var end = vm.incident.currentIncident.end.toISOString().slice(0, vm.incident.currentIncident.end.toISOString().length - 5) + "+00:00";
            return Incident.getReportIp(type, str, start, end).then(function (data) {
                var ips = [];
                data.map(function (m) {
                    ips.push({name: m, value: m});
                });
                return ips;
            });
        };


        //$scope.getReportDstIp = function (str) {
        //    var start = vm.incident.currentIncident.start.toISOString().slice(0, vm.incident.currentIncident.start.toISOString().length - 5) + "+00:00";
        //    var end = vm.incident.currentIncident.end.toISOString().slice(0, vm.incident.currentIncident.end.toISOString().length - 5) + "+00:00";
        //    return Incident.getReportIp("dst", str, start, end).then(function (data) {
        //        var ips = [];
        //        data.map(function (m) {
        //            ips.push({name: m, value: m});
        //        });
        //
        //        return ips;
        //    });
        //};

        vm.incident.ipSelectedChanged = function (from) {
            if (from === "src") {
                vm.incident.isInputSrcIp = true;
                vm.incident.isInputDstIp = false;
            }
            else if (from === "dst") {
                vm.incident.isInputSrcIp = false;
                vm.incident.isInputDstIp = true;
            }

            //if (vm.incident.currentIncident !== undefined && vm.incident.currentIncident !== null) {
            //    vm.incident.showDetail(vm.incident.currentIncident, selectedChanged);
            //}
        };

        vm.incident.typeSelectedChanged = function () {
            if (vm.incident.currentIncident !== undefined && vm.incident.currentIncident !== null) {
                vm.incident.showDetail(vm.incident.currentIncident, true);
            }
        };

        vm.incident.showDetail = function (incident, selectedChanged) {
            vm.viewDetail = true;

            vm.incident.currentIncident = incident;

            vm.incident.detail.title = '事件_' + (vm.incident.setting.frequency === 'daily' ? '每日' : vm.incident.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + incident.start.getFullYear() + '-' + (parseInt(incident.start.getMonth()) + 1) + '-' + incident.start.getDate();
            //var filter = "(timestamp ge '" + log.start.toISOString().slice(0, log.start.toISOString().length - 5) + "+00:00' and timestamp le '" + log.end.toISOString().slice(0, log.end.toISOString().length - 5) + "+00:00')";
            var start = incident.start.toISOString().slice(0, incident.start.toISOString().length - 5) + "+00:00";
            var end = incident.end.toISOString().slice(0, incident.end.toISOString().length - 5) + "+00:00";

            var schedule = vm.incident.setting.frequency === 'daily' ? 'd' : vm.incident.setting.frequency === 'weekly' ? 'w' : 'm';

            if (!selectedChanged) {
                vm.incident.selectType = "level";
                vm.incident.selectedSourceIp = "";
                vm.incident.selectedDestIp = "";

                vm.incident.inputSrcIp = "";
                vm.incident.inputDstIp = "";

                vm.incident.isInputSrcIp = false;
                vm.incident.isInputDstIp = false;
            }

            var selectSrcIp = !vm.incident.inputSrcIp || vm.incident.inputSrcIp.trim() === "" ? "0" : vm.incident.inputSrcIp.trim();
            var selectDstIp = !vm.incident.inputDstIp || vm.incident.inputDstIp.trim() === "" ? "0" : vm.incident.inputDstIp.trim();

            var deferred = $q.defer();
            vm.reportPromise = deferred.promise;

            Incident.getReport(vm.incident.selectType, selectSrcIp, selectDstIp, start, end, schedule).then(function (data) {
                deferred.resolve('success');
                var option = create_chart_option(data, vm.incident.selectType, schedule, incident.start, incident.end);

                chart_bar_line = echarts.init(document.getElementById("chart_bar_line"));

                chart_bar_line.setOption(option[0]);

                chart_pie = echarts.init(document.getElementById("chart_pie"));

                chart_pie.setOption(option[1]);
            }).then(function () {
                deferred.resolve('fail');
            });
        };

        vm.incident.confirmInputSrcIp = function () {
            vm.incident.isInputSrcIp = false;

            //resetToCurrent();

            if (vm.incident.currentIncident !== undefined && vm.incident.currentIncident !== null) {
                vm.incident.showDetail(vm.incident.currentIncident, true);
            }
        };

        vm.incident.confirmInputDstIp = function () {
            vm.incident.isInputDstIp = false;

            //resetToCurrent();

            if (vm.incident.currentIncident !== undefined && vm.incident.currentIncident !== null) {
                vm.incident.showDetail(vm.incident.currentIncident, true);
            }
        };

        //function resetToCurrent() {
        //    if (vm.incident.inputSrcIp === undefined || vm.incident.inputSrcIp === null || vm.incident.inputSrcIp.trim() === "") {
        //        vm.incident.inputSrcIp = vm.incident.selectedSourceIp;
        //    }
        //
        //    if (vm.incident.inputDstIp === undefined || vm.incident.inputDstIp === null || vm.incident.inputDstIp.trim() === "") {
        //        vm.incident.inputDstIp = vm.incident.selectedDestIp;
        //    }
        //}

        function create_chart_option(data, type, schedule, start, end) {
            var xAxis;
            // 1---alert  2---drop 3--deny
            var bar_level_alert_data;
            var bar_level_drop_data;
            var bar_level_deny_data;

            //risklevel 0--low,1---medium,2---high
            var bar_risk_low;
            var bar_risk_medium;
            var bar_risk_high;

            var line_data;
            var detail_pie_level_data = [0, 0, 0];
            var detail_pie_risk_data = [0, 0, 0];


            switch (type) {
                case "level":
                    switch (schedule) {
                        case "d":
                            xAxis = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
                                "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
                            bar_level_alert_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            bar_level_drop_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            bar_level_deny_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                            line_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            data.map(function (m1) {
                                switch (m1.subType) {
                                    case 1:
                                        bar_level_alert_data[m1.timeInterval] = bar_level_alert_data[m1.timeInterval] + m1.count;
                                        detail_pie_level_data[0] = detail_pie_level_data[0] + m1.count;
                                        break;
                                    case 2:
                                        bar_level_drop_data[m1.timeInterval] = bar_level_drop_data[m1.timeInterval] + m1.count;
                                        detail_pie_level_data[1] = detail_pie_level_data[1] + m1.count;
                                        break;
                                    case 3:
                                        bar_level_deny_data[m1.timeInterval] = bar_level_deny_data[m1.timeInterval] + m1.count;
                                        detail_pie_level_data[2] = detail_pie_level_data[2] + m1.count;
                                        break;
                                }
                                if (m1.subType !== 0) {
                                    line_data[m1.timeInterval] = line_data[m1.timeInterval] + m1.count;
                                }
                            });
                            break;
                        case "w":
                            xAxis = [];
                            var weekdays_action = [];
                            bar_level_alert_data = [0, 0, 0, 0, 0, 0, 0];
                            bar_level_drop_data = [0, 0, 0, 0, 0, 0, 0];
                            bar_level_deny_data = [0, 0, 0, 0, 0, 0, 0];
                            line_data = [0, 0, 0, 0, 0, 0, 0];
                            var date_action = new Date(start);
                            for (var i = 0; i < 7; i++) {
                                var year_action_w = date_action.getFullYear();
                                var month_action_w = date_action.getMonth();
                                var day_action_w = date_action.getDate();
                                xAxis.push(year_action_w + "-" + month_action_w + "-" + day_action_w);
                                weekdays_action.push(day_action_w);
                                date_action.setDate(date_action.getDate() + 1);
                            }
                            data.map(function (m2) {
                                for (var w = 0; w < weekdays_action.length; w++) {
                                    if (m2.timeInterval === weekdays_action[w]) {
                                        switch (m2.subType) {
                                            case 1:
                                                bar_level_alert_data[w] = bar_level_alert_data[w] + m2.count;
                                                detail_pie_level_data[0] = detail_pie_level_data[0] + m2.count;
                                                break;
                                            case 2:
                                                bar_level_drop_data[w] = bar_level_drop_data[w] + m2.count;
                                                detail_pie_level_data[1] = detail_pie_level_data[1] + m2.count;
                                                break;
                                            case 3:
                                                bar_level_deny_data[w] = bar_level_deny_data[w] + m2.count;
                                                detail_pie_level_data[2] = detail_pie_level_data[2] + m2.count;
                                                break;
                                        }
                                        if (m2.subType !== 0) {
                                            line_data[w] = line_data[w] + m2.count;
                                        }
                                    }
                                }
                            });
                            break;
                        case "m":
                            xAxis = [];
                            bar_level_alert_data = [];
                            bar_level_drop_data = [];
                            bar_level_deny_data = [];

                            line_data = [];
                            var isMaxDay_action = false;
                            var start_day_action = new Date(start);
                            var end_day_action = new Date(end);
                            while (!isMaxDay_action) {
                                var year_action_m = start_day_action.getFullYear();
                                var month_action_m = start_day_action.getMonth() + 1;
                                var day_action_m = start_day_action.getDate();
                                xAxis.push(year_action_m + "-" + month_action_m + "-" + day_action_m);
                                bar_level_alert_data.push(0);
                                bar_level_drop_data.push(0);
                                bar_level_deny_data.push(0);
                                line_data.push(0);
                                start_day_action.setDate(start_day_action.getDate() + 1);

                                if (start_day_action >= end_day_action) {
                                    isMaxDay_action = true;
                                }
                            }
                            data.map(function (m3) {
                                switch (m3.subType) {
                                    case 1:
                                        bar_level_alert_data[m3.timeInterval - 1] = bar_level_alert_data[m3.timeInterval - 1] + m3.count;
                                        detail_pie_level_data[0] = detail_pie_level_data[0] + m3.count;
                                        break;
                                    case 2:
                                        bar_level_drop_data[m3.timeInterval - 1] = bar_level_drop_data[m3.timeInterval - 1] + m3.count;
                                        detail_pie_level_data[1] = detail_pie_level_data[1] + m3.count;
                                        break;
                                    case 3:
                                        bar_level_deny_data[m3.timeInterval - 1] = bar_level_deny_data[m3.timeInterval - 1] + m3.count;
                                        detail_pie_level_data[2] = detail_pie_level_data[2] + m3.count;
                                        break;
                                }
                                if (m3.subType !== 0) {
                                    line_data[m3.timeInterval - 1] = line_data[m3.timeInterval - 1] + m3.count;
                                }

                            });
                            break;
                    }
                    break;
                case "risk":
                    switch (schedule) {
                        case "d":
                            xAxis = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
                                "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
                            bar_risk_low = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            bar_risk_medium = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            bar_risk_high = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            line_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                            data.map(function (m1) {
                                switch (m1.subType) {
                                    case 0:
                                        bar_risk_low[m1.timeInterval] = bar_risk_low[m1.timeInterval] + m1.count;
                                        detail_pie_risk_data[0] = detail_pie_risk_data[0] + m1.count;
                                        break;
                                    case 1:
                                        bar_risk_medium[m1.timeInterval] = bar_risk_medium[m1.timeInterval] + m1.count;
                                        detail_pie_risk_data[1] = detail_pie_risk_data[1] + m1.count;
                                        break;
                                    case 2:
                                        bar_risk_high[m1.timeInterval] = bar_risk_high[m1.timeInterval] + m1.count;
                                        detail_pie_risk_data[2] = detail_pie_risk_data[2] + m1.count;
                                        break;
                                }
                                if (m1.subType !== 3) {
                                    line_data[m1.timeInterval] = line_data[m1.timeInterval] + m1.count;
                                }
                            });
                            break;
                        case "w":
                            xAxis = [];
                            var weekdays_risk = [];
                            bar_risk_low = [0, 0, 0, 0, 0, 0, 0];
                            bar_risk_medium = [0, 0, 0, 0, 0, 0, 0];
                            bar_risk_high = [0, 0, 0, 0, 0, 0, 0];
                            line_data = [0, 0, 0, 0, 0, 0, 0];
                            var date_risk = new Date(start);
                            for (var j = 0; j < 7; j++) {
                                var year_risk_w = date_risk.getFullYear();
                                var month_risk_w = date_risk.getMonth() + 1;
                                var day_risk_w = date_risk.getDate();
                                xAxis.push(year_risk_w + "-" + month_risk_w + "-" + day_risk_w);
                                weekdays_risk.push(day_risk_w);
                                date_risk.setDate(date_risk.getDate() + 1);
                            }
                            data.map(function (m2) {
                                for (var w = 0; w < weekdays_risk.length; w++) {
                                    if (m2.timeInterval === weekdays_risk[w]) {
                                        switch (m2.subType) {
                                            case 0:
                                                bar_risk_low[w] = bar_risk_low[w] + m2.count;
                                                detail_pie_risk_data[0] = detail_pie_risk_data[0] + m2.count;
                                                break;
                                            case 1:
                                                bar_risk_medium[w] = bar_risk_medium[w] + m2.count;
                                                detail_pie_risk_data[1] = detail_pie_risk_data[1] + m2.count;
                                                break;
                                            case 2:
                                                bar_risk_high[w] = bar_risk_high[w] + m2.count;
                                                detail_pie_risk_data[2] = detail_pie_risk_data[2] + m2.count;
                                                break;
                                        }
                                        if (m2.subType !== 3) {
                                            line_data[w] = line_data[w] + m2.count;
                                        }
                                    }
                                }
                            });
                            break;
                        case "m":
                            xAxis = [];
                            bar_risk_low = [];
                            bar_risk_medium = [];
                            bar_risk_high = [];
                            line_data = [];
                            var isMaxDay_risk = false;
                            var start_day_risk = new Date(start);
                            var end_day_risk = new Date(end);
                            while (!isMaxDay_risk) {
                                var year_risk_m = start_day_risk.getFullYear();
                                var month_risk_m = start_day_risk.getMonth() + 1;
                                var day_risk_m = start_day_risk.getDate();
                                xAxis.push(year_risk_m + "-" + month_risk_m + "-" + day_risk_m);
                                bar_risk_low.push(0);
                                bar_risk_medium.push(0);
                                bar_risk_high.push(0);
                                line_data.push(0);
                                start_day_risk.setDate(start_day_risk.getDate() + 1);

                                if (start_day_risk >= end_day_risk) {
                                    isMaxDay_risk = true;
                                }
                            }
                            data.map(function (m3) {

                                switch (m3.subType) {
                                    case 0:
                                        bar_risk_low[m3.timeInterval - 1] = bar_risk_low[m3.timeInterval - 1] + m3.count;
                                        detail_pie_risk_data[0] = detail_pie_risk_data[0] + m3.count;
                                        break;
                                    case 1:
                                        bar_risk_medium[m3.timeInterval - 1] = bar_risk_medium[m3.timeInterval - 1] + m3.count;
                                        detail_pie_risk_data[1] = detail_pie_risk_data[1] + m3.count;
                                        break;
                                    case 2:
                                        bar_risk_high[m3.timeInterval - 1] = bar_risk_high[m3.timeInterval - 1] + m3.count;
                                        detail_pie_risk_data[2] = detail_pie_risk_data[2] + m3.count;
                                        break;
                                }
                                if (m3.subType !== 3) {
                                    line_data[m3.timeInterval - 1] = line_data[m3.timeInterval - 1] + m3.count;
                                }
                            });
                            break;
                    }
                    break;
            }

            var bar_line_title = type === "level" ? "事件等级信息" : "风险等级信息";

            var bar_line_legend = type === "level" ? ["警告","丢弃","阻断", "总计"] : ["低", "中", "高", "总计"];

            var bar_line_series = [];

            //var bar_action_alert_data_test = [];
            //
            //bar_action_alert_data.map(function (a) {
            //    bar_action_alert_data_test.push({
            //        value: a, label: {
            //            normal: {
            //                show: true, position: 'inside', textStyle: {color: 'red'}
            //            }
            //        }
            //    })
            //});

            switch (type) {
                case "level":
                    bar_line_series.push({
                        "name": "警告",
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": "#CCCC00",
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
                        "data": bar_level_alert_data
                    });

                    bar_line_series.push({
                        "name": "丢弃",
                        "type": "bar",
                        "stack": "总量",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "itemStyle": {
                            "normal": {
                                "color": "#3366CC",
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
                        "data": bar_level_drop_data
                    });

                    bar_line_series.push({
                        "name": "阻断",
                        "type": "bar",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "stack": "总量",
                        "itemStyle": {
                            "normal": {
                                "color": "#FF9933",
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
                        "data": bar_level_deny_data
                    });
                    break;
                case "risk":
                    bar_line_series.push({
                        "name": "低",
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
                        "data": bar_risk_low
                    });

                    bar_line_series.push({
                        "name": "中",
                        "type": "bar",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "stack": "总量",
                        "itemStyle": {
                            "normal": {
                                "color": "#FF9933",
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
                        "data": bar_risk_medium
                    });

                    bar_line_series.push({
                        "name": "高",
                        "type": "bar",
                        "barWidth": 30,
                        // "barMinHeight": 15,
                        "barGap": "10%",
                        "stack": "总量",
                        "itemStyle": {
                            "normal": {
                                "color": "#CC6699",
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
                        "data": bar_risk_high
                    });
                    break;
            }

            bar_line_series.push({
                "name": "总计",
                "type": "line",
                symbolSize: 5,
                symbol: 'circle',
                // "stack": "总量",
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
            });

            var option_bar_line = {
                backgroundColor: "rgba(52,71,88,0.3)",
                "title": {
                    "text": bar_line_title,
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
                    "data": bar_line_legend
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
                        "interval": 0

                    },
                    "splitArea": {
                        "show": false
                    }

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
                ],
                "series": bar_line_series
            };

            var pie_title = type === "level" ? "事件等级统计信息" : "风险等级统计信息";
            var pie_sub_title = type === "level" ? "事件等级" : "风险等级";
            var pie_legend = type === "level" ? ["警告","丢弃", "阻断"] : ["低", "中", "高"];

            var pie_data = type === "level" ? [
                {
                    value: detail_pie_level_data[0],
                    name: '警告',
                    label: {
                        normal: {
                            show: function () {
                                if (detail_pie_level_data[0] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_level_data[0] === 0.00) {
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
                                if (detail_pie_level_data[0] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_level_data[0] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        }
                    }, itemStyle: {normal: {"color": "#CCCC00"}}
                }, {
                    value: detail_pie_level_data[1],
                    name: '丢弃',
                    label: {
                        normal: {
                            show: function () {
                                if (detail_pie_level_data[1] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_level_data[1] === 0.00) {
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
                                if (detail_pie_level_data[1] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_level_data[1] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        }
                    }, itemStyle: {normal: {"color": "#3366CC"}}
                },
                {
                    value: detail_pie_level_data[2], name: '阻断',
                    label: {
                        normal: {
                            show: function () {
                                if (detail_pie_level_data[2] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_level_data[2] === 0.00) {
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
                                if (detail_pie_level_data[2] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_level_data[2] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        }
                    }, itemStyle: {normal: {"color": "#FF9933"}}
                }
            ] :
                [{
                    value: detail_pie_risk_data[0],
                    name: '低',
                    label: {
                        normal: {
                            show: function () {
                                if (detail_pie_risk_data[0] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_risk_data[0] === 0.00) {
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
                                if (detail_pie_risk_data[0] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_risk_data[0] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        }
                    }, itemStyle: {normal: {"color": "#99CC33"}}
                }, {
                    value: detail_pie_risk_data[1], name: '中',
                    label: {
                        normal: {
                            show: function () {
                                if (detail_pie_risk_data[1] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_risk_data[1] === 0.00) {
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
                                if (detail_pie_risk_data[1] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_risk_data[1] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        }
                    }, itemStyle: {normal: {"color": "#FF9933"}}
                }, {
                    value: detail_pie_risk_data[2],
                    name: '高', label: {
                        normal: {
                            show: function () {
                                if (detail_pie_risk_data[2] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_risk_data[2] === 0.00) {
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
                                if (detail_pie_risk_data[2] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        },
                        emphasis: {
                            show: function () {
                                if (detail_pie_risk_data[2] === 0.00) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                            }()
                        }
                    }, itemStyle: {normal: {"color": "#CC6699"}}
                }];

            var option_pie = {
                backgroundColor: "rgba(52,71,88,0.3)",
                title: {
                    text: pie_title,
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
                    data: pie_legend
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
                        name: pie_sub_title,
                        type: 'pie',
                        radius: [20, 110],
                        center: ['50%', '60%'],
                        roseType: 'radius',
                        data: pie_data
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
                            color: "#d3dee5"

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

        vm.incident.outPutReport = function () {
            reset_bar_zoom();
            //var title = fileName;
            //var incidentBarChart = $('#chart_bar_line');
            var chart_bar_line_string = chart_bar_line.getDataURL({
                type: 'jpeg',
                backgroundColor: 'rgba(52,71,88,1)'
            });

            var chart_total_bar_string = chart_pie.getDataURL({
                type: 'jpeg',
                backgroundColor: 'rgba(52,71,88,1)'
            });

            var start = vm.incident.currentIncident.start.toISOString().slice(0, vm.incident.currentIncident.start.toISOString().length - 5) + "+00:00";
            var end = vm.incident.currentIncident.end.toISOString().slice(0, vm.incident.currentIncident.end.toISOString().length - 5) + "+00:00";

            var selectSrcIp = !vm.incident.inputSrcIp || vm.incident.inputSrcIp.trim() === "" ? "0" : vm.incident.inputSrcIp.trim();
            var selectDstIp = !vm.incident.inputDstIp || vm.incident.inputDstIp.trim() === "" ? "0" : vm.incident.inputDstIp.trim();

            Incident.getOutPutReport(chart_bar_line_string, chart_total_bar_string,selectSrcIp,selectDstIp, start, end, 'incident').then(function (data) {
                window.open('./' + data, '_self');
            });
        };
    }
})
();
