///*
//
// report.protocol.controller
//
// */
//(function () {
//    'use strict';
//
//    angular
//        .module('southWest.report.protocol')
//        .controller('ReportProtocolCtrl', ReportProtocolCtrl);
//
//    function ReportProtocolCtrl($scope, $state, Audit, wPDF, $q, HCConfig, $rootScope) {
//        var vm = this;
//        vm.protocol = {};
//
//        vm.protocol.viewDetail = false;
//        vm.protocol.curPage = 0;
//        vm.protocol.numPerPage = 10;
//        vm.protocol.detail = {all: {}};
//
//        vm.protocol.editSetting = function () {
//            vm.protocol.editMode = true;
//            vm.protocol.tempSetting = angular.copy(vm.protocol.setting);
//        };
//        vm.protocol.confirmSetting = function () {
//            vm.protocol.editMode = false;
//            if (vm.protocol.tempSetting.frequency === 'daily') {
//                vm.protocol.settingData.schedulingJobMeta[0].dayOfMonth = "*";
//                vm.protocol.settingData.schedulingJobMeta[0].month = "*";
//                vm.protocol.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.protocol.settingData.schedulingJobMeta[0].year = "*";
//            } else if (vm.protocol.tempSetting.frequency === 'weekly') {
//                vm.protocol.settingData.schedulingJobMeta[0].dayOfMonth = "?";
//                vm.protocol.settingData.schedulingJobMeta[0].month = "*";
//                var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//                vm.protocol.settingData.schedulingJobMeta[0].dayOfWeek = weekdays.indexOf(vm.protocol.tempSetting.weekday).toString();
//                vm.protocol.settingData.schedulingJobMeta[0].year = "*";
//            } else {
//                vm.protocol.settingData.schedulingJobMeta[0].dayOfMonth = "1";
//                vm.protocol.settingData.schedulingJobMeta[0].month = "*";
//                vm.protocol.settingData.schedulingJobMeta[0].dayOfWeek = "?";
//                vm.protocol.settingData.schedulingJobMeta[0].year = "*";
//            }
//            Audit.setScheduleSetting(vm.protocol.settingData).then(function () {
//                vm.protocol.getData();
//                vm.protocol.curPage = 0;
//            });
//        };
//        vm.protocol.cancelSetting = function () {
//            vm.protocol.editMode = false;
//        };
//
//        vm.protocol.getData = function () {
//            //Get event_setting
//            //Mockup Data
//            var weekdays = ["", "星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
//            var frequency, weekday;
//            return Audit.getScheduleSetting('PROTOCOL_REPORT').then(function (setting) {
//                vm.protocol.settingData = setting;
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
//                vm.protocol.setting = {
//                    frequency: frequency,
//                    weekday: weekday
//                };
//
//                var payload = {
//                    $orderby: 'packetTimestamp',
//                    $limit: 1
//                };
//
//                return Audit.getAll(payload).then(function (data) {
//                    if (data[0]) {
//                        data[0].flowTimestamp = data[0].flowTimestamp ? data[0].flowTimestamp : data[0].packetTimestamp;
//                        // vm.protocol.Start = new Date(data[0].timestamp);
//                        // vm.protocol.Start.setHours(0,0,0,0);
//                        // vm.protocol.End = new Date();
//                        // vm.protocol.Data = [];
//                        // var itemEnd, item;
//                        // if(vm.protocol.setting.frequency === 'daily'){
//                        //     vm.protocol.End.setHours(0,0,0,0);
//                        //     vm.protocol.End = new Date(vm.protocol.End -1);
//                        // }
//                        // if(vm.protocol.setting.frequency === 'monthly'){
//                        //     vm.protocol.Start.setDate(1);
//                        //     vm.protocol.End.setDate(1);
//                        //     vm.protocol.End.setHours(0,0,0,0);
//                        //     vm.protocol.End = new Date(vm.protocol.End - 1);
//                        // }
//                        // if(vm.protocol.setting.frequency === 'weekly'){
//                        //     itemEnd = new Date(vm.protocol.Start);
//                        //     for(var i=0; i<7; i++){
//                        //         if(vm.protocol.End.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1)){
//                        //             break;
//                        //         }else{
//                        //             vm.protocol.End.setTime(vm.protocol.End.getTime()-86400000);
//                        //         }
//                        //     }
//                        //     vm.protocol.End.setHours(0,0,0,0);
//                        //     vm.protocol.End.setTime(vm.protocol.End.getTime()-1);
//                        //     for(var j=0; j<7; j++){
//                        //         if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.protocol.End){
//                        //             break;
//                        //         }else{
//                        //             itemEnd.setTime(itemEnd.getTime() + 86400000);
//                        //         }
//                        //     }
//                        //     if(itemEnd >= vm.protocol.End){
//                        //         vm.protocol.Start.setTime(vm.protocol.End.getTime());
//                        //     }else{
//                        //         item = {
//                        //             start: new Date(itemEnd - 7*86400000),
//                        //             end: new Date(itemEnd - 1)
//                        //         };
//                        //         vm.protocol.Data.push(item);
//                        //         vm.protocol.Start.setTime(itemEnd.getTime() + 1);
//                        //     }
//                        // }
//
//                        vm.protocol.Start = new Date(data[0].flowTimestamp);
//                        vm.protocol.Start.setHours(0, 0, 0, 0);
//                        //vm.protocol.End = new Date();
//                        vm.protocol.End = $scope.currentTime;
//                        vm.protocol.Data = [];
//                        var itemEnd, item;
//                        if (vm.protocol.setting.frequency === 'daily') {
//                            vm.protocol.End.setHours(23, 59, 59, 999);
//                        }
//                        if (vm.protocol.setting.frequency === 'monthly') {
//                            vm.protocol.Start.setDate(1);
//                        }
//                        if (vm.protocol.setting.frequency === 'weekly') {
//                            itemEnd = new Date(vm.protocol.Start);
//                            for (var j = 0; j < 7; j++) {
//                                // Common out to show empty data after today
//                                //if(itemEnd.getDay()===(setting.schedulingJobMeta[0].dayOfWeek-1) || itemEnd >= vm.protocol.End){
//                                if (itemEnd.getDay() === (setting.schedulingJobMeta[0].dayOfWeek - 1)) {
//                                    itemEnd.setHours(0, 0, 0, 0);
//                                    itemEnd.setTime(itemEnd.getTime() - 1);
//                                    break;
//                                } else {
//                                    itemEnd.setDate(itemEnd.getDate() + 1);
//                                }
//                            }
//                            if (itemEnd >= vm.protocol.End) {
//                                vm.protocol.End = new Date(itemEnd);
//                            }
//                            if (itemEnd > vm.protocol.Start) {
//                                var tempStart = new Date(itemEnd);
//                                tempStart.setDate(itemEnd.getDate() - 7);
//                                item = {
//                                    // Common out to show empty data before first record
//                                    // start: new Date(vm.protocol.Start),
//                                    start: new Date(tempStart.getTime() + 1),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.protocol.Data.push(item);
//                                vm.protocol.Start.setTime(itemEnd.getTime() + 1);
//                            }
//                        }
//
//                        while (vm.protocol.Start < vm.protocol.End) {
//                            if (vm.protocol.setting.frequency === 'daily') {
//                                itemEnd = new Date(vm.protocol.Start);
//                                itemEnd.setHours(23, 59, 59, 999);
//                                item = {
//                                    start: new Date(vm.protocol.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.protocol.Data.push(item);
//                                vm.protocol.Start.setTime(itemEnd.getTime() + 1);
//                            }
//                            if (vm.protocol.setting.frequency === 'weekly') {
//                                itemEnd = new Date(vm.protocol.Start);
//                                itemEnd.setDate(vm.protocol.Start.getDate() + 7);
//                                item = {
//                                    start: new Date(vm.protocol.Start),
//                                    end: new Date(itemEnd - 1)
//                                };
//                                vm.protocol.Data.push(item);
//                                vm.protocol.Start = new Date(itemEnd);
//                            }
//                            if (vm.protocol.setting.frequency === 'monthly') {
//                                itemEnd = new Date(vm.protocol.Start);
//                                itemEnd.setMonth((parseInt(vm.protocol.Start.getMonth()) + 1).toString());
//                                item = {
//                                    start: new Date(vm.protocol.Start),
//                                    end: new Date(itemEnd)
//                                };
//                                vm.protocol.Data.push(item);
//                                vm.protocol.Start.setMonth((parseInt(vm.protocol.Start.getMonth()) + 1).toString());
//                            }
//                        }
//                        if (vm.protocol.Data) {
//                            vm.protocol.Data.reverse();
//                            vm.protocol.pagenation(vm.protocol.curPage, vm.protocol.numPerPage);
//                        }
//                    } else {
//                        vm.protocol.eventStart = null;
//                        vm.protocol.curData = [];
//                        vm.protocol.maxPage = 1;
//                    }
//                });
//            });
//        };
//        vm.protocol.getData();
//
//        vm.protocol.pagenation = function (num, per) {
//            vm.protocol.maxPage = Math.ceil(vm.protocol.Data.length / per);
//            num = num < 0 ? 0 : num > vm.protocol.maxPage - 1 ? vm.protocol.maxPage - 1 : num;
//            vm.protocol.curData = vm.protocol.Data.slice(num * per, num * per + per);
//        };
//        vm.protocol.changePage = function (num) {
//            vm.protocol.curPage = vm.protocol.curPage + num < 0 ? 0 : vm.protocol.curPage + num > vm.protocol.maxPage - 1 ? vm.protocol.maxPage - 1 : vm.protocol.curPage + num;
//            vm.protocol.pagenation(vm.protocol.curPage, vm.protocol.numPerPage);
//        };
//        vm.protocol.gotoPageHead = function () {
//            vm.protocol.curPage = 0;
//            vm.protocol.curData = vm.protocol.Data.slice(0, vm.protocol.numPerPage);
//        };
//        vm.protocol.gotoPageEnd = function () {
//            vm.protocol.curPage = vm.protocol.maxPage - 1;
//            vm.protocol.curData = vm.protocol.Data.slice(vm.protocol.curPage * vm.protocol.numPerPage, vm.protocol.Data.length);
//        };
//
//        vm.protocol.showDetail = function (protocol) {
//            var version = $rootScope.VERSION_NUMBER.split('-');
//            var versionSuffix = version[version.length - 1];
//            $scope.protocoldata = {
//                filter: "(packetTimestamp ge '" + protocol.start.toISOString().slice(0, protocol.start.toISOString().length - 5) + "+00:00' and packetTimestamp le '" + protocol.end.toISOString().slice(0, protocol.end.toISOString().length - 5) + "+00:00')"
//            };
//            $scope.searchTime = {
//                start: protocol.start.toISOString().slice(0, protocol.start.toISOString().length - 5) + '+00:00',
//                end: protocol.end.toISOString().slice(0, protocol.end.toISOString().length - 5) + '+00:00'
//            };
//            var protocols = ["HTTP", "FTP", "Telnet", "SMTP", "POP3", "Modbus", "OPCDA", "S7", "DNP3", "IEC104", "MMS", "ProfinetIO", "Goose", "SV", "EnipTcp", "EnipUdp", "EnipIO", "OPCUA", "SNMP", "Pnrtdcp"];
//
//            if (versionSuffix === "X02") {
//                protocols.push("FOCAS");
//            }
//
//            vm.protocol.detail.title = (vm.protocol.setting.frequency === 'daily' ? '每日' : vm.protocol.setting.frequency === 'weekly' ? '每周' : '每月') + '协议审计报告_' + protocol.start.getFullYear() + '-' + (parseInt(protocol.start.getMonth()) + 1) + '-' + protocol.start.getDate();
//            vm.protocol.detail.all.title = (vm.protocol.setting.frequency === 'daily' ? '每日' : vm.protocol.setting.frequency === 'weekly' ? '每周' : '每月') + '协议审计报告_' + protocol.start.getFullYear() + '-' + (parseInt(protocol.start.getMonth()) + 1) + '-' + protocol.start.getDate();
//            var promise = [];
//            for (var p = 0; p < protocols.length; p++) {
//                promise.push(Audit.getGrouped(protocols[p].toLowerCase(), vm.protocol.setting.frequency === "daily" ? "hourly" : "daily", protocol.start, protocol.end));
//            }
//
//            //get the right groups
//
//            $q.all(promise).then(function (protocolDatas) {
//                var pointData = [];
//                var colors = ["#1D3D87", "#A1A1A1", "#521A88", "#4372A0", "#107F6D", "#522A58", "#40A191", "#6591BC", "#6C4072", "#35549A", "#CCCCCC", "#67329B", "#C0D54A", "#DFC948", "#9FB042", "#6AA13F", "#BE9C3E", "#AC9A5F", "#BA3B5F", "#DF35EC"];
//                if (versionSuffix === "X02") {
//                    colors.push("#F94E92");
//                }
//                for (var i = 0; i < protocolDatas.length; i++) {
//                    pointData.push(protocolDatas[i]);
//                }
//                $('#protocolBarChart').highcharts(HCConfig.createBarChartStdConfig(pointData, protocols, vm.protocol.detail.title, vm.protocol.setting.frequency === "daily" ? "hourly" : "daily", "数据包长度", colors, 100));
//            });
//
//
//            vm.viewDetail = true;
//        };
//
//        vm.protocol.genPDF = function (datapack, fileName, fileType) {
//            var data = angular.copy(datapack.data);
//            var title = fileName;
//            if (datapack.currPage && datapack.numPages && datapack.numPages > 1) {
//                title += ' (' + datapack.currPage + '/' + datapack.numPages + ')';
//            }
//            data.map(function (d) {
//                d.flowTimestamp = new Date(d.flowTimestamp);
//                var month = (d.flowTimestamp.getMonth() + 1).toString(),
//                    day = d.flowTimestamp.getDate().toString(),
//                    year = d.flowTimestamp.getFullYear().toString(),
//                    hour = d.flowTimestamp.getHours().toString(),
//                    min = d.flowTimestamp.getMinutes().toString(),
//                    sec = d.flowTimestamp.getSeconds().toString();
//                month = month.length < 2 ? ('0' + month) : month;
//                day = day.length < 2 ? ('0' + day) : day;
//                hour = hour.length < 2 ? ('0' + hour) : hour;
//                min = min.length < 2 ? ('0' + min) : min;
//                sec = sec.length < 2 ? ('0' + sec) : sec;
//                d.dateTime = [year, month, day].join('-') + " " + [hour, min, sec].join(':');
//            });
//            var protocolBarChart = $('#protocolBarChart');
//            var datauri = 'data:image/svg+xml;utf8,' + $('#protocolBarChart svg')[0].outerHTML;
//            var ratio = (protocolBarChart.height() / protocolBarChart.width());
//            var adjustedHeight = 810 * ratio;
//            var options = {
//                // MUST Have:
//                data: data,
//                fieldName: ["起始时间", "源IP地址", "源端口", "目标IP地址", "目标端口", "协议类型"],
//                fieldIndex: ["dateTime", "sourceIp", "sourcePort", "destinationIp", "destinationPort", "protocolSourceName"],
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
//                styles: "",
//                theme: "blueL"  //empty or default, blueL, blueD, greenL, greenD, redL, redD
//            };
//            wPDF.getPdf(options, fileType);
//        };
//    }
//})();
