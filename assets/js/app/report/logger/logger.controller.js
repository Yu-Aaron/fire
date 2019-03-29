///*
//
// report.logger.controller
//
// */
//(function () {
//    'use strict';
//
//    angular
//        .module('southWest.report.logger')
//        .controller('ReportLoggerCtrl', ReportLoggerCtrl);
//
//    function ReportLoggerCtrl($scope, $state, Logger, wPDF, $filter) {
//        var vm = this;
//        vm.logger = {};
//
//        vm.viewDetail = false;
//        vm.logger.curPage = 0;
//        vm.logger.numPerPage = 10;
//        vm.logger.detail = {all: {}, console: {}, login: {}, cmd: {}, firewall: {}};
//
//        vm.logger.editSetting = function () {
//            vm.logger.editMode = true;
//            vm.logger.tempSetting = angular.copy(vm.logger.setting);
//        };
//        vm.logger.confirmSetting = function () {
//            vm.logger.editMode = false;
//            if (vm.logger.tempSetting.frequency === 'daily') {
//                vm.logger.settingData.schedulingJobMeta[0].dayOfMonth = "*";
//                vm.logger.settingData.schedulingJobMeta[0].month = "*";
//                vm.logger.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.logger.settingData.schedulingJobMeta[0].year = "*";
//            } else if (vm.logger.tempSetting.frequency === 'weekly') {
//                vm.logger.settingData.schedulingJobMeta[0].dayOfMonth = "?";
//                vm.logger.settingData.schedulingJobMeta[0].month = "*";
//                var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//                vm.logger.settingData.schedulingJobMeta[0].dayOfWeek = weekdays.indexOf(vm.logger.tempSetting.weekday).toString();
//                vm.logger.settingData.schedulingJobMeta[0].year = "*";
//            } else {
//                vm.logger.settingData.schedulingJobMeta[0].dayOfMonth = "1";
//                vm.logger.settingData.schedulingJobMeta[0].month = "*";
//                vm.logger.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.logger.settingData.schedulingJobMeta[0].year = "*";
//            }
//            Logger.setScheduleSetting(vm.logger.settingData).then(function () {
//                vm.logger.getData();
//                vm.logger.curPage = 0;
//            });
//        };
//        vm.logger.cancelSetting = function () {
//            vm.logger.editMode = false;
//        };
//
//        vm.logger.getData = function () {
//            //Get event_setting
//            //Mockup Data
//            var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//            var frequency, weekday;
//            return Logger.getScheduleSetting('LOG_REPORT').then(function (setting) {
//                vm.logger.settingData = setting;
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
//                vm.logger.setting = {
//                    frequency: frequency,
//                    weekday: weekday
//                };
//
//                var payload = {
//                    $orderby: 'timestamp',
//                    $limit: 1
//                };
//                return Logger.getAll(payload).then(function (data) {
//                    if (data[0]) {
//                        // vm.logger.Start = new Date(data[0].timestamp);
//                        // vm.logger.Start.setHours(0,0,0,0);
//                        // vm.logger.End = new Date();
//                        // vm.logger.Data = [];
//                        // var itemEnd, item;
//                        // if(vm.logger.setting.frequency === 'daily'){
//                        //     vm.logger.End.setHours(0,0,0,0);
//                        //     vm.logger.End = new Date(vm.logger.End -1);
//                        // }
//                        // if(vm.logger.setting.frequency === 'monthly'){
//                        //     vm.logger.Start.setDate(1);
//                        //     vm.logger.End.setDate(1);
//                        //     vm.logger.End.setHours(0,0,0,0);
//                        //     vm.logger.End = new Date(vm.logger.End - 1);
//                        // }
//                        // if(vm.logger.setting.frequency === 'weekly'){
//                        //     itemEnd = new Date(vm.logger.Start);
//                        //     for(var i=0; i<7; i++){
//                        //         if(vm.logger.End.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1)){
//                        //             break;
//                        //         }else{
//                        //             vm.logger.End.setTime(vm.logger.End.getTime()-86400000);
//                        //         }
//                        //     }
//                        //     vm.logger.End.setHours(0,0,0,0);
//                        //     vm.logger.End.setTime(vm.logger.End.getTime()-1);
//                        //     for(var j=0; j<7; j++){
//                        //         if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.logger.End){
//                        //             break;
//                        //         }else{
//                        //             itemEnd.setTime(itemEnd.getTime() + 86400000);
//                        //         }
//                        //     }
//                        //     if(itemEnd >= vm.logger.End){
//                        //         vm.logger.Start.setTime(vm.logger.End.getTime());
//                        //     }else{
//                        //         item = {
//                        //             start: new Date(itemEnd - 7*86400000),
//                        //             end: new Date(itemEnd - 1)
//                        //         };
//                        //         vm.logger.Data.push(item);
//                        //         vm.logger.Start.setTime(itemEnd.getTime() + 1);
//                        //     }
//                        // }
//
//                        vm.logger.Start = new Date(data[0].timestamp);
//                        vm.logger.Start.setHours(0, 0, 0, 0);
//                        //vm.logger.End = new Date();
//                        vm.logger.End = $scope.currentTime;
//                        vm.logger.Data = [];
//                        var itemEnd, item;
//                        if (vm.logger.setting.frequency === 'daily') {
//                            vm.logger.End.setHours(23, 59, 59, 999);
//                        }
//                        if (vm.logger.setting.frequency === 'monthly') {
//                            vm.logger.Start.setDate(1);
//                        }
//                        if (vm.logger.setting.frequency === 'weekly') {
//                            itemEnd = new Date(vm.logger.Start);
//                            for (var j = 0; j < 7; j++) {
//                                // Common out to show empty data after today
//                                //if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.logger.End){
//                                if (itemEnd.getDay() === (setting.schedulingJobMeta[0].dayOfWeek - 1)) {
//                                    itemEnd.setHours(0, 0, 0, 0);
//                                    itemEnd.setTime(itemEnd.getTime() - 1);
//                                    break;
//                                } else {
//                                    itemEnd.setDate(itemEnd.getDate() + 1);
//                                }
//                            }
//                            if (itemEnd >= vm.logger.End) {
//                                vm.logger.End = new Date(itemEnd);
//                            }
//                            if (itemEnd > vm.logger.Start) {
//                                var tempStart = new Date(itemEnd);
//                                tempStart.setDate(itemEnd.getDate() - 7);
//                                item = {
//                                    // Common out to show empty data before first record
//                                    // start: new Date(vm.logger.Start),
//                                    start: new Date(tempStart.getTime() + 1),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.logger.Data.push(item);
//                                vm.logger.Start.setTime(itemEnd.getTime() + 1);
//                            }
//                        }
//
//                        while (vm.logger.Start < vm.logger.End) {
//                            if (vm.logger.setting.frequency === 'daily') {
//                                itemEnd = new Date(vm.logger.Start);
//                                itemEnd.setHours(23, 59, 59, 999);
//                                item = {
//                                    start: new Date(vm.logger.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.logger.Data.push(item);
//                                //vm.logger.Start.setTime(vm.logger.Start.getTime() + 86400000);
//                                vm.logger.Start.setDate(vm.logger.Start.getDate() + 1);
//                            }
//                            if (vm.logger.setting.frequency === 'weekly') {
//                                itemEnd = new Date(vm.logger.Start);
//                                //itemEnd.setTime(itemEnd.getTime() + 7*86400000);
//                                itemEnd.setDate(vm.logger.Start.getDate() + 7);
//                                item = {
//                                    start: new Date(vm.logger.Start),
//                                    end: new Date(itemEnd - 1)
//                                };
//                                vm.logger.Data.push(item);
//                                vm.logger.Start = new Date(itemEnd);
//                            }
//                            if (vm.logger.setting.frequency === 'monthly') {
//                                itemEnd = new Date(vm.logger.Start);
//                                itemEnd.setMonth((parseInt(vm.logger.Start.getMonth()) + 1).toString());
//                                item = {
//                                    start: new Date(vm.logger.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.logger.Data.push(item);
//                                vm.logger.Start.setMonth((parseInt(vm.logger.Start.getMonth()) + 1).toString());
//                            }
//                        }
//                        if (vm.logger.Data) {
//                            vm.logger.Data.reverse();
//                            vm.logger.pagenation(vm.logger.curPage, vm.logger.numPerPage);
//                        }
//                    } else {
//                        vm.logger.eventStart = null;
//                        vm.logger.curData = [];
//                        vm.logger.maxPage = 1;
//                    }
//                });
//            });
//        };
//        vm.logger.getData();
//
//        vm.logger.pagenation = function (num, per) {
//            vm.logger.maxPage = Math.ceil(vm.logger.Data.length / per);
//            num = num < 0 ? 0 : num > vm.logger.maxPage - 1 ? vm.logger.maxPage - 1 : num;
//            vm.logger.curData = vm.logger.Data.slice(num * per, num * per + per);
//        };
//        vm.logger.changePage = function (num) {
//            vm.logger.curPage = vm.logger.curPage + num < 0 ? 0 : vm.logger.curPage + num > vm.logger.maxPage - 1 ? vm.logger.maxPage - 1 : vm.logger.curPage + num;
//            vm.logger.pagenation(vm.logger.curPage, vm.logger.numPerPage);
//        };
//        vm.logger.gotoPageHead = function () {
//            vm.logger.curPage = 0;
//            vm.logger.curData = vm.logger.Data.slice(0, vm.logger.numPerPage);
//        };
//        vm.logger.gotoPageEnd = function () {
//            vm.logger.curPage = vm.logger.maxPage - 1;
//            vm.logger.curData = vm.logger.Data.slice(vm.logger.curPage * vm.logger.numPerPage, vm.logger.Data.length);
//        };
//
//        vm.logger.showDetail = function (log) {
//
//            var filter = "(timestamp ge '" + log.start.toISOString().slice(0, log.start.toISOString().length - 5) + "+00:00' and timestamp le '" + log.end.toISOString().slice(0, log.end.toISOString().length - 5) + "+00:00')";
//
//            $scope.alldata = {log: log, filter: filter};
//            $scope.consolelogindata = {log: log, filter: filter + ' and (serviceType eq MW_LOGIN_LOGOUT)'};
//            $scope.consoledata = {log: log, filter: filter + ' and ((serviceType eq MW) or (serviceType eq DPILOG))'};
//            $scope.logindata = {log: log, filter: filter};
//            $scope.cmddata = {log: log, filter: filter};
//
//            $scope.alldata.title = '全部日志' + (vm.logger.setting.frequency === 'daily' ? '每日' : vm.logger.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + log.start.getFullYear() + '-' + (parseInt(log.start.getMonth()) + 1) + '-' + log.start.getDate();
//            $scope.consolelogindata.title = $filter('resFilter')('监管平台', 'slideAuditTitle') + '登录日志' + (vm.logger.setting.frequency === 'daily' ? '每日' : vm.logger.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + log.start.getFullYear() + '-' + (parseInt(log.start.getMonth()) + 1) + '-' + log.start.getDate();
//            $scope.consoledata.title = $filter('resFilter')('监管平台', 'slideAuditTitle') + '操作日志' + (vm.logger.setting.frequency === 'daily' ? '每日' : vm.logger.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + log.start.getFullYear() + '-' + (parseInt(log.start.getMonth()) + 1) + '-' + log.start.getDate();
//            $scope.logindata.title = '终端用户登录日志' + (vm.logger.setting.frequency === 'daily' ? '每日' : vm.logger.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + log.start.getFullYear() + '-' + (parseInt(log.start.getMonth()) + 1) + '-' + log.start.getDate();
//            $scope.cmddata.title = '终端用户操作日志' + (vm.logger.setting.frequency === 'daily' ? '每日' : vm.logger.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + log.start.getFullYear() + '-' + (parseInt(log.start.getMonth()) + 1) + '-' + log.start.getDate();
//
//            //vm.logger.detail = {all:{}, console:{}, login:{}, cmd:{}, firewall:{}};
//            vm.logger.detail.title = (vm.logger.setting.frequency === 'daily' ? '每日' : vm.logger.setting.frequency === 'weekly' ? '每周' : '每月') + '报告_' + log.start.getFullYear() + '-' + (parseInt(log.start.getMonth()) + 1) + '-' + log.start.getDate();
//            vm.viewDetail = true;
//        };
//
//        vm.logger.genPDF = function (datapack, fieldName, fieldIndex, fileName, fileType) {
//            var data = datapack.data;
//            data.map(function (d) {
//                d.timeFormated = d.timestamp.getFullYear().toString() + '-' + ((d.timestamp.getMonth() + 1 > 9) ? (d.timestamp.getMonth() + 1) : ('0' + (d.timestamp.getMonth() + 1))).toString() + '-' + ((d.timestamp.getDate() > 9) ? d.timestamp.getDate() : ('0' + d.timestamp.getDate())).toString() + ' ' + ((d.timestamp.getHours() > 9) ? d.timestamp.getHours() : ('0' + d.timestamp.getHours())).toString() + ':' + ((d.timestamp.getMinutes() > 9) ? d.timestamp.getMinutes() : ('0' + d.timestamp.getMinutes())).toString() + ':' + ((d.timestamp.getSeconds() > 9) ? d.timestamp.getSeconds() : ('0' + d.timestamp.getSeconds())).toString();
//            });
//            var title = fileName;
//            if (datapack.currPage && datapack.numPages && datapack.numPages > 1) {
//                title += ' (' + datapack.currPage + '/' + datapack.numPages + ')';
//            }
//            var options = {
//                // MUST Have:
//                data: data,
//                fieldName: fieldName,
//                fieldIndex: fieldIndex,
//                // Optional:
//                //img: img,
//                fileName: fileName ? fileName : "Report",
//                chartW: 810,
//                chartH: 350,
//                firstPageNum: fileType === 'html' ? 10000 : 27,
//                NumPerPage: fileType === 'html' ? 10000 : 31,
//                xOffset: 15,
//                yOffset: 25,
//                lineH: 15,
//                fontSize: 15,
//                showPageNum: true,
//                title: title,
//                options: {
//                    orientation: 'l',
//                    unit: 'pt',
//                    format: 'a4'
//                },
//                styles: "table, th, td { border-collapse: collapse; border: 0px solid black; text-align: left; } td: nth-child(1) { width: 140px; text-align: left; } td: nth-child(2) { width: 100px; text-align: left; } td: nth-child(3) { width: 100px; text-align: left; } td: nth-child(4) { text-align: left; }",
//                theme: "empty"  //empty or default, blueL, blueD, greenL, greenD, redL, redD
//            };
//            wPDF.getPdf(options, fileType);
//        };
//    }
//})();
