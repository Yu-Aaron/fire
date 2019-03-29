///*
//
// report.event.controller
//
// */
//(function () {
//    'use strict';
//
//    angular
//        .module('southWest.report.event')
//        .controller('ReportEventCtrl', ReportEventCtrl);
//
//    function ReportEventCtrl($scope, $state, Incident, Event, wPDF, $q, HCConfig, Device, Enum, apiInfo, $rootScope) {
//        var vm = this;
//        vm.incident = {};
//        vm.event = {};
//
//        //====================Incident====================
//        vm.incident.viewDetail = false;
//        vm.incident.curPage = 0;
//        vm.incident.numPerPage = 10;
//        vm.incident.detail = {};
//
//        vm.event.noViewRight = (Enum.get('privilege').filter(function (a) {
//            return a.name === 'EVENT';
//        })[0].actionValue === 1);
//        vm.incident.noViewRight = (Enum.get('privilege').filter(function (a) {
//            return a.name === 'INCIDENT';
//        })[0].actionValue === 1);
//
//        vm.incident.editSetting = function () {
//            vm.incident.editMode = true;
//            vm.incident.tempSetting = angular.copy(vm.incident.setting);
//        };
//        vm.incident.confirmSetting = function () {
//            vm.incident.editMode = false;
//            vm.incident.settingData.schedulingJob.jobData = vm.incident.tempSetting.level;
//            if (vm.incident.tempSetting.frequency === 'daily') {
//                vm.incident.settingData.schedulingJobMeta[0].dayOfMonth = "*";
//                vm.incident.settingData.schedulingJobMeta[0].month = "*";
//                vm.incident.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.incident.settingData.schedulingJobMeta[0].year = "*";
//            } else if (vm.incident.tempSetting.frequency === 'weekly') {
//                vm.incident.settingData.schedulingJobMeta[0].dayOfMonth = "?";
//                vm.incident.settingData.schedulingJobMeta[0].month = "*";
//                var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//                vm.incident.settingData.schedulingJobMeta[0].dayOfWeek = weekdays.indexOf(vm.incident.tempSetting.weekday).toString();
//                vm.incident.settingData.schedulingJobMeta[0].year = "*";
//            } else {
//                vm.incident.settingData.schedulingJobMeta[0].dayOfMonth = "1";
//                vm.incident.settingData.schedulingJobMeta[0].month = "*";
//                vm.incident.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.incident.settingData.schedulingJobMeta[0].year = "*";
//            }
//            Incident.setScheduleSetting(vm.incident.settingData).then(function () {
//                vm.incident.getData();
//                vm.incident.curPage = 0;
//            });
//        };
//        vm.incident.cancelSetting = function () {
//            vm.incident.editMode = false;
//        };
//        vm.incident.getDeviceData = function () {
//            return Device.getAll({'$filter': '(category eq FACTORY_DEVICE)', '$orderby': 'name'}).then(function (data) {
//                vm.incident.devices = data;
//                return vm.incident.devices;
//            });
//        };
//
//        vm.incident.getData = function () {
//            var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//            var frequency, weekday;
//            return Incident.getScheduleSetting('INCIDENT_REPORT').then(function (setting) {
//                vm.incident.settingData = setting;
//                if (setting.schedulingJobMeta[0].dayOfMonth === "*") {
//                    frequency = 'daily';
//                    weekday = '星期一';
//                } else if (setting.schedulingJobMeta[0].dayOfMonth === "?") {
//                    frequency = 'weekly';
//                    weekday = weekdays[setting.schedulingJobMeta[0].dayOfWeek];
//                } else {
//                    frequency = 'monthly';
//                    weekday = '星期一';
//                }
//                vm.incident.setting = {
//                    frequency: frequency,
//                    weekday: weekday,
//                    level: setting.schedulingJob.jobData
//                };
//
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: 1
//                };
//                return Incident.getAll(payload).then(function (data) {
//                    if (data[0]) {
//                        // vm.incident.Start = new Date(data[0].timestamp);
//                        // vm.incident.Start.setHours(0,0,0,0);
//                        // vm.incident.End = new Date();
//                        // vm.incident.Data = [];
//                        // var itemEnd, item;
//                        // if(vm.incident.setting.frequency === 'daily'){
//                        //     vm.incident.End.setHours(0,0,0,0);
//                        //     vm.incident.End = new Date(vm.incident.End -1);
//                        // }
//                        // if(vm.incident.setting.frequency === 'monthly'){
//                        //     vm.incident.Start.setDate(1);
//                        //     vm.incident.End.setDate(1);
//                        //     vm.incident.End.setHours(0,0,0,0);
//                        //     vm.incident.End = new Date(vm.incident.End - 1);
//                        // }
//                        // if(vm.incident.setting.frequency === 'weekly'){
//                        //     itemEnd = new Date(vm.incident.Start);
//                        //     for(var i=0; i<7; i++){
//                        //         if(vm.incident.End.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1)){
//                        //             break;
//                        //         }else{
//                        //             vm.incident.End.setTime(vm.incident.End.getTime()-86400000);
//                        //         }
//                        //     }
//                        //     vm.incident.End.setHours(0,0,0,0);
//                        //     vm.incident.End.setTime(vm.incident.End.getTime()-1);
//                        //     for(var j=0; j<7; j++){
//                        //         if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.incident.End){
//                        //             break;
//                        //         }else{
//                        //             itemEnd.setTime(itemEnd.getTime() + 86400000);
//                        //         }
//                        //     }
//                        //     if(itemEnd >= vm.incident.End){
//                        //         vm.incident.Start.setTime(vm.incident.End.getTime());
//                        //     }else{
//                        //         item = {
//                        //             start: new Date(itemEnd - 7*86400000),
//                        //             end: new Date(itemEnd - 1)
//                        //         };
//                        //         vm.incident.Data.push(item);
//                        //         vm.incident.Start.setTime(itemEnd.getTime() + 1);
//                        //     }
//                        // }
//
//                        vm.incident.Start = new Date(data[0].timestamp);
//                        vm.incident.Start.setHours(0, 0, 0, 0);
//                        //vm.incident.End = new Date();
//                        vm.incident.End = $rootScope.currentTime;
//                        vm.incident.Data = [];
//                        var itemEnd, item;
//                        if (vm.incident.setting.frequency === 'daily') {
//                            vm.incident.End.setHours(23, 59, 59, 999);
//                        }
//                        if (vm.incident.setting.frequency === 'monthly') {
//                            vm.incident.Start.setDate(1);
//                        }
//                        if (vm.incident.setting.frequency === 'weekly') {
//                            itemEnd = new Date(vm.incident.Start);
//                            for (var j = 0; j < 7; j++) {
//                                // Common out to show empty data after today
//                                //if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.incident.End){
//                                if (itemEnd.getDay() === (setting.schedulingJobMeta[0].dayOfWeek - 1)) {
//                                    itemEnd.setHours(0, 0, 0, 0);
//                                    itemEnd.setTime(itemEnd.getTime() - 1);
//                                    break;
//                                } else {
//                                    itemEnd.setDate(itemEnd.getDate() + 1);
//                                }
//                            }
//                            if (itemEnd >= vm.incident.End) {
//                                vm.incident.End = new Date(itemEnd);
//                            }
//                            if (itemEnd > vm.incident.Start) {
//                                var tempStart = new Date(itemEnd);
//                                tempStart.setDate(itemEnd.getDate() - 7);
//                                item = {
//                                    // Common out to show empty data before first record
//                                    // start: new Date(vm.incident.Start),
//                                    start: new Date(tempStart.getTime() + 1),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.incident.Data.push(item);
//                                vm.incident.Start.setTime(itemEnd.getTime() + 1);
//                            }
//                        }
//
//                        while (vm.incident.Start < vm.incident.End) {
//                            if (vm.incident.setting.frequency === 'daily') {
//                                itemEnd = new Date(vm.incident.Start);
//                                itemEnd.setHours(23, 59, 59, 999);
//                                item = {
//                                    start: new Date(vm.incident.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.incident.Data.push(item);
//                                vm.incident.Start.setTime(itemEnd.getTime() + 1);
//                            }
//                            if (vm.incident.setting.frequency === 'weekly') {
//                                itemEnd = new Date(vm.incident.Start);
//                                itemEnd.setDate(vm.incident.Start.getDate() + 7);
//                                item = {
//                                    start: new Date(vm.incident.Start),
//                                    end: new Date(itemEnd - 1)
//                                };
//                                vm.incident.Data.push(item);
//                                vm.incident.Start = new Date(itemEnd);
//                            }
//                            if (vm.incident.setting.frequency === 'monthly') {
//                                itemEnd = new Date(vm.incident.Start);
//                                itemEnd.setMonth((parseInt(vm.incident.Start.getMonth()) + 1).toString());
//                                item = {
//                                    start: new Date(vm.incident.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.incident.Data.push(item);
//                                vm.incident.Start.setMonth((parseInt(vm.incident.Start.getMonth()) + 1).toString());
//                            }
//                        }
//                        if (vm.incident.Data) {
//                            vm.incident.Data.reverse();
//                            vm.incident.pagenation(vm.incident.curPage, vm.incident.numPerPage);
//                        }
//                    } else {
//                        vm.incident.eventStart = null;
//                        vm.incident.curData = [];
//                        vm.incident.maxPage = 1;
//                    }
//                });
//            });
//        };
//        vm.incident.getData();
//
//        vm.incident.pagenation = function (num, per) {
//            vm.incident.maxPage = Math.ceil(vm.incident.Data.length / per);
//            num = num < 0 ? 0 : num > vm.incident.maxPage - 1 ? vm.incident.maxPage - 1 : num;
//            vm.incident.curData = vm.incident.Data.slice(num * per, num * per + per);
//        };
//        vm.incident.changePage = function (num) {
//            vm.incident.curPage = vm.incident.curPage + num < 0 ? 0 : vm.incident.curPage + num > vm.incident.maxPage - 1 ? vm.incident.maxPage - 1 : vm.incident.curPage + num;
//            vm.incident.pagenation(vm.incident.curPage, vm.incident.numPerPage);
//        };
//        vm.incident.gotoPageHead = function () {
//            vm.incident.curPage = 0;
//            vm.incident.curData = vm.incident.Data.slice(0, vm.incident.numPerPage);
//        };
//        vm.incident.gotoPageEnd = function () {
//            vm.incident.curPage = vm.incident.maxPage - 1;
//            vm.incident.curData = vm.incident.Data.slice(vm.incident.curPage * vm.incident.numPerPage, vm.incident.Data.length);
//        };
//
//
//        vm.incident.getAllRuleData = function () {
//            var promise = [];
//            vm.incident.detail.ruleTitle = '安全事件_' + (vm.incident.setting.frequency === 'daily' ? '每日' : vm.incident.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + vm.incident.currentIncident.start.getFullYear() + '-' + (parseInt(vm.incident.currentIncident.start.getMonth()) + 1) + '-' + vm.incident.currentIncident.start.getDate();
//            $scope.incidentdata = {
//                filter: "((timestamp ge '" + vm.incident.currentIncident.start.toISOString().slice(0, vm.incident.currentIncident.start.toISOString().length - 5) + "+00:00' and timestamp le '" + vm.incident.currentIncident.end.toISOString().slice(0, vm.incident.currentIncident.end.toISOString().length - 5) + "+00:00')" + (vm.incident.settingData.schedulingJob.jobData === "阻断" ? " and (level eq ERROR))" : ")")
//            };
//            if (vm.incident.setting.level === "阻断和警告") {
//                promise.push(Incident.getGrouped("warn", "all", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//            }
//            promise.push(Incident.getGrouped("error", "all", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//            $q.all(promise).then(function (incidentDatas) {
//                var pointData = [];
//                var names = '';
//                var colors = [];
//                if (vm.incident.setting.level === "阻断和警告") {
//                    names = ["警告", "阻断"];
//                    colors = ['#D08515', '#D75623'];
//                }
//                else {
//                    names = ["阻断"];
//                    colors = ['#D75623'];
//                }
//                for (var i = 0; i < incidentDatas.length; i++) {
//                    pointData.push(incidentDatas[i]);
//                }
//                $('#incidentBarChart').highcharts(HCConfig.createBarChartStdConfig(pointData, names, vm.incident.detail.ruleTitle, vm.incident.setting.frequency === "daily" ? "hourly" : "daily", "事件总数", colors));
//                vm.viewDetail = true;
//            });
//        };
//
//        vm.incident.getAllRuleRiskLevelData = function () {
//            var promise = [];
//            vm.incident.detail.riskLevelTitle = '安全事件风险等级_' + (vm.incident.setting.frequency === 'daily' ? '每日' : vm.incident.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + vm.incident.currentIncident.start.getFullYear() + '-' + (parseInt(vm.incident.currentIncident.start.getMonth()) + 1) + '-' + vm.incident.currentIncident.start.getDate();
//            $scope.incidentdata = {
//                filter: "((timestamp ge '" + vm.incident.currentIncident.start.toISOString().slice(0, vm.incident.currentIncident.start.toISOString().length - 5) + "+00:00' and timestamp le '" + vm.incident.currentIncident.end.toISOString().slice(0, vm.incident.currentIncident.end.toISOString().length - 5) + "+00:00'))"
//            };
//            if (vm.incident.setting.level === "阻断和警告") {
//                promise.push(Incident.getGrouped("warnanderror", "low", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//                promise.push(Incident.getGrouped("warnanderror", "medium", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//                promise.push(Incident.getGrouped("warnanderror", "high", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//            } else {
//                promise.push(Incident.getGrouped("error", "low", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//                promise.push(Incident.getGrouped("error", "medium", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//                promise.push(Incident.getGrouped("error", "high", vm.incident.setting.frequency === "daily" ? "hourly" : "daily", vm.incident.currentIncident.start, vm.incident.currentIncident.end));
//            }
//            $q.all(promise).then(function (incidentDatas) {
//                var pointData = [];
//                var names = ["低危风险", "中危风险", "高危风险"];
//                var colors = ['#D08515', '#D75623', '#FF0600'];
//                for (var i = 0; i < incidentDatas.length; i++) {
//                    pointData.push(incidentDatas[i]);
//                }
//                $('#incidentRiskLevelBarChart').highcharts(HCConfig.createBarChartStdConfig(pointData, names, vm.incident.detail.riskLevelTitle, vm.incident.setting.frequency === "daily" ? "hourly" : "daily", "事件总数", colors));
//                vm.viewDetail = true;
//            });
//        };
//
//        vm.incident.getDeviceRuleData = function (deviceId) {
//            vm.incident.currentDeviceId = deviceId;
//            vm.level_code = "";
//            var selectedDevices = vm.incident.devices.filter(function (d) {
//                return d.deviceId === deviceId;
//            });
//            vm.incident.currentDevice = selectedDevices && selectedDevices[0] ? selectedDevices[0].name : "";
//            vm.incident.detail.deviceRuleTitle = '安全事件_' + vm.incident.currentDevice + '_' + (vm.incident.setting.frequency === 'daily' ? '每日' : vm.incident.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + vm.incident.currentIncident.start.getFullYear() + '-' + (parseInt(vm.incident.currentIncident.start.getMonth()) + 1) + '-' + vm.incident.currentIncident.start.getDate();
//            if (vm.incident.setting.level === "阻断和警告") {
//                vm.level_code = "warnorerror";
//            } else {
//                vm.level_code = "error";
//            }
//            Incident.getRuleCountOnDevice(deviceId, vm.incident.currentIncident.start, vm.incident.currentIncident.end, vm.level_code).then(function (deviceRuleCounts) {
//                var pointData = [];
//                var names = ["规则事件"];
//                for (var i = 0; i < deviceRuleCounts.length; i++) {
//                    pointData.push(deviceRuleCounts[i]);
//                }
//                $('#incidentRuleBarChart').highcharts(HCConfig.createRuleBarChartStdConfig(pointData, names, vm.incident.detail.deviceRuleTitle, "相关事件总数"));
//                vm.viewDetail = true;
//            });
//        };
//        vm.incident.showDetail = function (incident) {
//            vm.incident.currentIncident = incident;
//            vm.incident.getDeviceData().then(function () {
//                vm.incident.getAllRuleRiskLevelData();
//                vm.incident.getAllRuleData();
//                vm.incident.getDeviceRuleData(vm.incident.devices[0].deviceId);
//                vm.viewDetail = true;
//            });
//        };
//
//        vm.incident.genPDF = function (datapack, fileName, fileType) {
//            var data = angular.copy(datapack.data);
//            data.map(function (d) {
//                d.levelName = (d.level === "WARN" ? "警告" : (d.level === "ERROR" ? "阻断" : ""));
//                d.riskLevel = (d.riskLevel === "LOW" ? "低" : d.riskLevel === "MEDIUM" ? "中" : d.riskLevel === "HIGH" ? "高" : "");
//            });
//            var title = fileName;
//            if (datapack.currPage && datapack.numPages && datapack.numPages > 1) {
//                title += ' (' + datapack.currPage + '/' + datapack.numPages + ')';
//            }
//            data.map(function (d) {
//                d.timestamp = new Date(d.timestamp);
//                var month = (d.timestamp.getMonth() + 1).toString(),
//                    day = d.timestamp.getDate().toString(),
//                    year = d.timestamp.getFullYear().toString(),
//                    hour = d.timestamp.getHours().toString(),
//                    min = d.timestamp.getMinutes().toString(),
//                    sec = d.timestamp.getSeconds().toString();
//                month = month.length < 2 ? ('0' + month) : month;
//                day = day.length < 2 ? ('0' + day) : day;
//                hour = hour.length < 2 ? ('0' + hour) : hour;
//                min = min.length < 2 ? ('0' + min) : min;
//                sec = sec.length < 2 ? ('0' + sec) : sec;
//                d.dateTime = [year, month, day].join('-') + " " + [hour, min, sec].join(':');
//            });
//            var incidentBarChart = $('#incidentBarChart');
//            var datauri1 = 'data:image/svg+xml;utf8,' + $('#incidentBarChart svg')[0].outerHTML;
//            var datauri2 = 'data:image/svg+xml;utf8,' + $('#incidentRiskLevelBarChart svg')[0].outerHTML;
//            var datauri3 = 'data:image/svg+xml;utf8,' + $('#incidentRuleBarChart svg')[0].outerHTML;
//            var ratio = (incidentBarChart.height() / incidentBarChart.width());
//            var adjustedHeight = 810 * ratio;
//            var options = {
//                // MUST Have:
//                data: data,
//                fieldName: ["事件等级", "风险等级", "日期", "起源", "保护终端", "目标", "规则"],
//                fieldIndex: ["levelName", "riskLevel", "dateTime", "sourceName", "deviceName", "destinationName", "signatureName"],
//                // Optional:
//                img: [datauri1, datauri2, datauri3],
//                fileName: fileName ? fileName : "Report",
//                title: title,
//                chartW: 810,
//                chartH: adjustedHeight,
//                firstPageNum: fileType === 'html' ? 10000 : 0,
//                NumPerPage: fileType === 'html' ? 10000 : 31,
//                xOffset: 15,
//                yOffset: 25,
//                imgxOffset: 15,
//                imgyOffset: 25 + (540 / 2) - (adjustedHeight / 2),
//                lineH: 15,
//                fontSize: 15,
//                showPageNum: true,
//                options: {
//                    orientation: 'l',
//                    unit: 'pt',
//                    format: 'a4'
//                },
//                styles: "table, th, td { border-collapse: collapse; border: 0px solid black; text-align: left; } td: nth-child(1) { width: 65px; text-align: center; } td: nth-child(2) { width: 140px; text-align: left; } td: nth-child(3) { text-align: left; } td: nth-child(4) { text-align: left; } td: nth-child(5) { text-align: left; }",
//                theme: "empty"  //empty or default, blueL, blueD, greenL, greenD, redL, redD
//            };
//            wPDF.getPdf(options, fileType);
//        };
//
//
//        //=========================================================Event=============================================================
//        vm.event.viewDetail = false;
//        vm.event.curPage = 0;
//        vm.event.numPerPage = 10;
//        vm.event.detail = {};
//
//        vm.event.editSetting = function () {
//            vm.event.editMode = true;
//            vm.event.tempSetting = angular.copy(vm.event.setting);
//        };
//        vm.event.confirmSetting = function () {
//            vm.event.editMode = false;
//            vm.event.settingData.schedulingJob.jobData = vm.event.tempSetting.level;
//            if (vm.event.tempSetting.frequency === 'daily') {
//                vm.event.settingData.schedulingJobMeta[0].dayOfMonth = "*";
//                vm.event.settingData.schedulingJobMeta[0].month = "*";
//                vm.event.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.event.settingData.schedulingJobMeta[0].year = "*";
//            } else if (vm.event.tempSetting.frequency === 'weekly') {
//                vm.event.settingData.schedulingJobMeta[0].dayOfMonth = "?";
//                vm.event.settingData.schedulingJobMeta[0].month = "*";
//                var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//                vm.event.settingData.schedulingJobMeta[0].dayOfWeek = weekdays.indexOf(vm.event.tempSetting.weekday).toString();
//                vm.event.settingData.schedulingJobMeta[0].year = "*";
//            } else {
//                vm.event.settingData.schedulingJobMeta[0].dayOfMonth = "1";
//                vm.event.settingData.schedulingJobMeta[0].month = "*";
//                vm.event.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.event.settingData.schedulingJobMeta[0].year = "*";
//            }
//            Event.setScheduleSetting(vm.event.settingData).then(function () {
//                vm.event.getData();
//                vm.event.curPage = 0;
//            });
//        };
//        vm.event.cancelSetting = function () {
//            vm.event.editMode = false;
//        };
//
//        vm.event.getData = function () {
//            //Get event_setting
//            //Mockup Data
//            var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//            var frequency, weekday;
//            return Event.getScheduleSetting('EVENT_REPORT').then(function (setting) {
//                vm.event.settingData = setting;
//                if (setting.schedulingJobMeta[0].dayOfMonth === "*") {
//                    frequency = 'daily';
//                    weekday = '星期一';
//                } else if (setting.schedulingJobMeta[0].dayOfMonth === "?") {
//                    frequency = 'weekly';
//                    weekday = weekdays[setting.schedulingJobMeta[0].dayOfWeek];
//                } else {
//                    frequency = 'monthly';
//                    weekday = '星期一';
//                }
//                vm.event.setting = {
//                    frequency: frequency,
//                    weekday: weekday,
//                    level: setting.schedulingJob.jobData
//                };
//
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: 1
//                };
//                return Event.getAll(payload).then(function (data) {
//                    if (data[0]) {
//                        // vm.event.Start = new Date(data[0].timestamp);
//                        // vm.event.Start.setHours(0,0,0,0);
//                        // vm.event.End = new Date();
//                        // vm.event.Data = [];
//                        // var itemEnd, item;
//                        // if(vm.event.setting.frequency === 'daily'){
//                        //     vm.event.End.setHours(0,0,0,0);
//                        //     vm.event.End = new Date(vm.event.End -1);
//                        // }
//                        // if(vm.event.setting.frequency === 'monthly'){
//                        //     vm.event.Start.setDate(1);
//                        //     vm.event.End.setDate(1);
//                        //     vm.event.End.setHours(0,0,0,0);
//                        //     vm.event.End = new Date(vm.event.End - 1);
//                        // }
//                        // if(vm.event.setting.frequency === 'weekly'){
//                        //     itemEnd = new Date(vm.event.Start);
//                        //     for(var i=0; i<7; i++){
//                        //         if(vm.event.End.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1)){
//                        //             break;
//                        //         }else{
//                        //             vm.event.End.setTime(vm.event.End.getTime()-86400000);
//                        //         }
//                        //     }
//                        //     vm.event.End.setHours(0,0,0,0);
//                        //     vm.event.End.setTime(vm.event.End.getTime()-1);
//                        //     for(var j=0; j<7; j++){
//                        //         if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.event.End){
//                        //             break;
//                        //         }else{
//                        //             itemEnd.setTime(itemEnd.getTime() + 86400000);
//                        //         }
//                        //     }
//                        //     if(itemEnd >= vm.event.End){
//                        //         vm.event.Start.setTime(vm.event.End.getTime());
//                        //     }else{
//                        //         item = {
//                        //             start: new Date(itemEnd - 7*86400000),
//                        //             end: new Date(itemEnd - 1)
//                        //         };
//                        //         vm.event.Data.push(item);
//                        //         vm.event.Start.setTime(itemEnd.getTime() + 1);
//                        //     }
//                        // }
//
//                        vm.event.Start = new Date(data[0].timestamp);
//                        vm.event.Start.setHours(0, 0, 0, 0);
//                        //vm.event.End = new Date();
//                        vm.event.End = $rootScope.currentTime;
//                        vm.event.Data = [];
//                        var itemEnd, item;
//                        if (vm.event.setting.frequency === 'daily') {
//                            vm.event.End.setHours(23, 59, 59, 999);
//                        }
//                        if (vm.event.setting.frequency === 'monthly') {
//                            vm.event.Start.setDate(1);
//                        }
//                        if (vm.event.setting.frequency === 'weekly') {
//                            itemEnd = new Date(vm.event.Start);
//                            for (var j = 0; j < 7; j++) {
//                                // Common out to show empty data after today
//                                //if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.event.End){
//                                if (itemEnd.getDay() === (setting.schedulingJobMeta[0].dayOfWeek - 1)) {
//                                    itemEnd.setHours(0, 0, 0, 0);
//                                    itemEnd.setTime(itemEnd.getTime() - 1);
//                                    break;
//                                } else {
//                                    itemEnd.setDate(itemEnd.getDate() + 1);
//                                }
//                            }
//                            if (itemEnd >= vm.event.End) {
//                                vm.event.End = new Date(itemEnd);
//                            }
//                            if (itemEnd > vm.event.Start) {
//                                var tempStart = new Date(itemEnd);
//                                tempStart.setDate(itemEnd.getDate() - 7);
//                                item = {
//                                    // Common out to show empty data before first record
//                                    // start: new Date(vm.event.Start),
//                                    start: new Date(tempStart.getTime() + 1),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.event.Data.push(item);
//                                vm.event.Start.setTime(itemEnd.getTime() + 1);
//                            }
//                        }
//
//                        while (vm.event.Start < vm.event.End) {
//                            if (vm.event.setting.frequency === 'daily') {
//                                itemEnd = new Date(vm.event.Start);
//                                itemEnd.setHours(23, 59, 59, 999);
//                                item = {
//                                    start: new Date(vm.event.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.event.Data.push(item);
//                                vm.event.Start.setTime(itemEnd.getTime() + 1);
//                            }
//                            if (vm.event.setting.frequency === 'weekly') {
//                                itemEnd = new Date(vm.event.Start);
//                                itemEnd.setDate(vm.event.Start.getDate() + 7);
//                                item = {
//                                    start: new Date(vm.event.Start),
//                                    end: new Date(itemEnd - 1)
//                                };
//                                vm.event.Data.push(item);
//                                vm.event.Start = new Date(itemEnd);
//                            }
//                            if (vm.event.setting.frequency === 'monthly') {
//                                itemEnd = new Date(vm.event.Start);
//                                itemEnd.setMonth((parseInt(vm.event.Start.getMonth()) + 1).toString());
//                                item = {
//                                    start: new Date(vm.event.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.event.Data.push(item);
//                                vm.event.Start.setMonth((parseInt(vm.event.Start.getMonth()) + 1).toString());
//                            }
//                        }
//                        if (vm.event.Data) {
//                            vm.event.Data.reverse();
//                            vm.event.pagenation(vm.event.curPage, vm.event.numPerPage);
//                        }
//                    } else {
//                        vm.event.eventStart = null;
//                        vm.event.curData = [];
//                        vm.event.maxPage = 1;
//                    }
//                });
//            });
//        };
//        vm.event.getData();
//
//        vm.event.pagenation = function (num, per) {
//            vm.event.maxPage = Math.ceil(vm.event.Data.length / per);
//            num = num < 0 ? 0 : num > vm.event.maxPage - 1 ? vm.event.maxPage - 1 : num;
//            vm.event.curData = vm.event.Data.slice(num * per, num * per + per);
//        };
//        vm.event.changePage = function (num) {
//            vm.event.curPage = vm.event.curPage + num < 0 ? 0 : vm.event.curPage + num > vm.event.maxPage - 1 ? vm.event.maxPage - 1 : vm.event.curPage + num;
//            vm.event.pagenation(vm.event.curPage, vm.event.numPerPage);
//        };
//        vm.event.gotoPageHead = function () {
//            vm.event.curPage = 0;
//            vm.event.curData = vm.event.Data.slice(0, vm.event.numPerPage);
//        };
//        vm.event.gotoPageEnd = function () {
//            vm.event.curPage = vm.event.maxPage - 1;
//            vm.event.curData = vm.event.Data.slice(vm.event.curPage * vm.event.numPerPage, vm.event.Data.length);
//        };
//        vm.event.highchart = null;
//        vm.event.showDetail = function (event) {
//            var filter = '';
//            if (vm.event.setting.level === '警告') {
//                filter = " and level eq WARN";
//            }
//            $scope.eventdata = {
//                filter: "(timestamp ge '" + event.start.toISOString().slice(0, event.start.toISOString().length - 5) + "+00:00' and timestamp le '" + event.end.toISOString().slice(0, event.end.toISOString().length - 5) + "+00:00'" + filter + ")"
//            };
//            vm.event.detail.title = '系统事件' + (vm.event.setting.frequency === 'daily' ? '每日' : vm.event.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + event.start.getFullYear() + '-' + (parseInt(event.start.getMonth()) + 1) + '-' + event.start.getDate();
//
//            var promise = [];
//            var colors = [];
//            var names = [];
//            if (vm.event.setting.level === "信息和警告") {
//                promise.push(Event.getGrouped("info", "all", vm.event.setting.frequency === "daily" ? "hourly" : "daily", event.start, event.end));
//                colors.push('#7FB222');
//                names.push('信息');
//            }
//            promise.push(Event.getGrouped("warn", "all", vm.event.setting.frequency === "daily" ? "hourly" : "daily", event.start, event.end));
//            colors.push('#D08515');
//            names.push('警告');
//
//            $q.all(promise).then(function (eventDatas) {
//                var pointData = [];
//                for (var i = 0; i < eventDatas.length; i++) {
//                    pointData.push(eventDatas[i]);
//                }
//                vm.event.highchart = HCConfig.createBarChartStdConfig(pointData, names, vm.event.detail.title, vm.event.setting.frequency === "daily" ? "hourly" : "daily", "事件总数", colors);
//                $('#eventBarChart').highcharts(vm.event.highchart);
//            });
//            vm.viewDetail = true;
//        };
//
//        vm.event.genPDF = function (datapack, fileName, fileType) {
//            var data = angular.copy(datapack.data);
//            data.map(function (d) {
//                d.levelName = (d.level === "WARN" ? "警告" : (d.level === "INFO" ? "信息" : ""));
//            });
//            var title = fileName;
//            if (datapack.currPage && datapack.numPages && datapack.numPages > 1) {
//                title += ' (' + datapack.currPage + '/' + datapack.numPages + ')';
//            }
//            data.map(function (d) {
//                d.timestamp = new Date(d.timestamp);
//                var month = (d.timestamp.getMonth() + 1).toString(),
//                    day = d.timestamp.getDate().toString(),
//                    year = d.timestamp.getFullYear().toString(),
//                    hour = d.timestamp.getHours().toString(),
//                    min = d.timestamp.getMinutes().toString(),
//                    sec = d.timestamp.getSeconds().toString();
//                month = month.length < 2 ? ('0' + month) : month;
//                day = day.length < 2 ? ('0' + day) : day;
//                hour = hour.length < 2 ? ('0' + hour) : hour;
//                min = min.length < 2 ? ('0' + min) : min;
//                sec = sec.length < 2 ? ('0' + sec) : sec;
//                d.dateTime = [year, month, day].join('-') + " " + [hour, min, sec].join(':');
//            });
//            var eventBarChart = $('#eventBarChart');
//            var datauri = 'data:image/svg+xml;utf8,' + $('#eventBarChart svg')[0].outerHTML;
//            var ratio = (eventBarChart.height() / eventBarChart.width());
//            var adjustedHeight = 810 * ratio;
//            var options = {
//                // MUST Have:
//                data: data,
//                fieldName: ["事件等级", "日期", "设备", "事件"],
//                fieldIndex: ["levelName", "dateTime", "sourceName", "content"],
//                // Optional:
//                img: [datauri],
//                fileName: fileName ? fileName : "Report",
//                title: title,
//                chartW: 810,
//                chartH: adjustedHeight,
//                firstPageNum: fileType === 'html' ? 10000 : 0,
//                NumPerPage: fileType === 'html' ? 10000 : 31,
//                xOffset: 15,
//                yOffset: 25,
//                imgxOffset: 15,
//                imgyOffset: 25 + (540 / 2) - (adjustedHeight / 2),
//                lineH: 15,
//                fontSize: 15,
//                showPageNum: true,
//                options: {
//                    orientation: 'l',
//                    unit: 'pt',
//                    format: 'a4'
//                },
//                styles: "table, th, td { border-collapse: collapse; border: 0px solid black; text-align: left; } td: nth-child(1) { width: 65px; text-align: center; } td: nth-child(2) { width: 140px; text-align: left; } td: nth-child(3) { width: 150px; text-align: left; } td: nth-child(4) { text-align: left; }",
//                theme: "empty"  //empty or default, blueL, blueD, greenL, greenD, redL, redD
//            };
//            wPDF.getPdf(options, fileType);
//        };
//    }
//})();
