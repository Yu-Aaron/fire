/**
 * Monitor Signatrue left side 4 tab: signatureTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        .directive('whitelistAllDpiTable', whitelistAllDpiTable);

    var DEFAULT_INTERVAL = {'days': 0, 'hours': 0, 'minutes': 2};
    var MAX_DATE = "2199-12-31";

    function whitelistAllDpiTable(Device, Template, Learning) {
        var AllDpiTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/whitelist/signature-all-dpi-table.html',
            controller: controller,
            controllerAs: 'whitelistAllDpi',
            link: function () {
            }
        };

        return AllDpiTableObj;

        //////////

        function controller($state, $scope, $modal, Signature, Template, $rootScope, Topology, $q, auth, uiCtrl) {
            var vm = this;
            vm.dpiSelectAll = false;
            vm.selectDPI = [];
            var filter = 'category eq SECURITY_DEVICE';
            vm.setInterval = true;
            vm.interval = angular.copy(DEFAULT_INTERVAL);

            vm.selectAllDPI = function () {
                for (var i = 0; i < vm.dpiData.length; i++) {
                    //Only select online device
                    vm.selectDPI[i] = ((!vm.dpiData[i].learning[0]) || vm.dpiData[i].learning[0].state === 'SUCCESS') ? vm.dpiSelectAll : false;
                }
            };
            vm.initTimePicker = function (detailPanelItem) {
                Learning.getCurrentTime().then(function (data) {
                    //console.log(data.data[0].currentTime);
                    vm.now = new Date(data.data[0].currentTime);
                    vm.now.setSeconds(0);
                    vm.now.setMilliseconds(0);
                    //console.log(now);

                    vm.startdt = vm.now;
                    var year = vm.startdt.getFullYear();
                    var month = vm.startdt.getMonth() + 1;
                    if (month < 10) {
                        month = '0' + month;
                    }
                    var date = vm.startdt.getDate();
                    if (date < 10) {
                        date = '0' + date;
                    }
                    var result = year + '-' + month + '-' + date;
                    vm.minDate = result;
                    vm.maxDate = angular.copy(MAX_DATE);

                    vm.enddt = moment(vm.now).add(2, 'minutes').toDate();

                    if (detailPanelItem) {
                        vm.startdt = new Date(detailPanelItem.startDatetime);
                        vm.enddt = new Date(detailPanelItem.endDatetime);
                    }
                });
            };
            vm.calculateValues = function () {
                if (vm.interval.minutes >= 60) {
                    var increaseHours = Math.floor(vm.interval.minutes / 60);
                    vm.interval.hours = +(vm.interval.hours ? vm.interval.hours : 0) + increaseHours;
                    vm.interval.minutes = vm.interval.minutes % 60;
                }
                if (vm.interval.hours >= 24) {
                    var increaseDays = Math.floor(vm.interval.hours / 24);
                    vm.interval.days = +(vm.interval.days ? vm.interval.days : 0) + increaseDays;
                    vm.interval.hours = vm.interval.hours % 24;
                }
            };
            vm.changeInterval = function () {
                vm.intervalError = false;
                vm.intervalErrorMessage = '';
                if ((!vm.interval.days || vm.interval.days.toString() === '0') &&
                    (!vm.interval.hours || vm.interval.hours.toString() === '0') &&
                    (!vm.interval.minutes || vm.interval.minutes.toString() === '0')) {
                    vm.intervalError = true;
                    vm.intervalErrorMessage = '请输入学习时间';
                    return;
                }
                if (vm.interval.days) {
                    if (isNaN(vm.interval.days)) {
                        vm.intervalError = true;
                        vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请在天数区域输入数字';
                    } else if (vm.interval.days < 0) {
                        vm.intervalError = true;
                        vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请输入大于0的天数';
                    }
                }
                if (vm.interval.hours) {
                    if (isNaN(vm.interval.hours)) {
                        vm.intervalError = true;
                        vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请在小时数区域输入数字';
                    } else if (vm.interval.hours < 0) {
                        vm.intervalError = true;
                        vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请输入大于0的小时数';
                    }
                    if (vm.interval.minutes) {
                        if (isNaN(vm.interval.minutes)) {
                            vm.intervalError = true;
                            vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请在分钟数区域输入数字';
                        } else if (vm.interval.minutes < 0) {
                            vm.intervalError = true;
                            vm.intervalErrorMessage = vm.intervalErrorMessage + ' 请输入大于0的分钟数';
                        }
                    }
                    if (vm.intervalError) {
                        return;
                    }

                    var one_day = 1000 * 60 * 60 * 24;
                    var one_hour = 1000 * 60 * 60;
                    var one_minute = 1000 * 60;
                    var maxdate = new Date(vm.maxDate + ' 23:59:59');
                    var nowTZ = vm.now.getTimezoneOffset();
                    var lclTZ = maxdate.getTimezoneOffset();
                    var maxtime = maxdate.getTime();
                    var mintime = vm.now.getTime() +
                        (vm.interval.days ? vm.interval.days * one_day : 0) +
                        (vm.interval.hours ? vm.interval.hours * one_hour : 0) +
                        (vm.interval.minutes ? vm.interval.minutes * one_minute : 0) +
                        ((lclTZ - nowTZ) * one_minute);
                    var difference_ms = maxtime - mintime;
                    if (Math.round(difference_ms / one_minute) < 1) {
                        vm.intervalError = true;
                        vm.intervalErrorMessage = '请输入少于' + Math.floor((maxtime - vm.now.getTime()) / one_day) + '天的学习时间';
                        return;
                    }
                }
            };

            vm.setTimeInterval = function (setInterval) {
                Learning.getCurrentTime().then(function (data) {
                    vm.now = new Date(data.data[0].currentTime);
                    vm.now.setMilliseconds(0);
                    if (setInterval) {
                        vm.now = new Date(data.data[0].currentTime);
                        vm.now.setMilliseconds(0);
                        vm.startdt = vm.now;
                        vm.enddt = moment(vm.startdt).add(vm.interval).toDate();
                        vm.setTime();
                    } else {
                        var timeDiff = vm.now.getTime() - vm.startdt.getTime();
                        if (timeDiff <= 0) {
                            vm.setTime();
                        } else if (timeDiff < 60000) {
                            vm.startdt = vm.now;
                            vm.setTime();
                        } else {
                            return;
                        }
                    }
                });
            };

            vm.setTime = function () {
                //console.log(vm.startdt);
                //console.log(vm.enddt);
                var DpiList = [];
                var isEmpty = true;
                for (var i = 0; i < vm.selectDPI.length; i++) {
                    if (vm.selectDPI[i]) {
                        DpiList.push(vm.dpiData[i].serialNumber);
                        isEmpty = false;
                    }
                }
                if (isEmpty) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '请先选择需要部署规则的设备！'
                    });
                    return;
                }

                function pad(number, length) {
                    var str = "" + number;
                    while (str.length < length) {
                        str = '0' + str;
                    }
                    return str;
                }

                var offset = new Date().getTimezoneOffset();
                offset = ((offset < 0 ? '+' : '-') + pad(parseInt(Math.abs(offset / 60)), 2) + pad(Math.abs(offset % 60), 2));
                //console.log(offset);

                var schedule = {
                    'startTime': vm.startdt.toISOString(),
                    'endTime': vm.enddt.toISOString(),
                    'taskName': vm.startdt.toLocaleString(navigator.language, {hour12: false}) + '至' + vm.enddt.toLocaleString(navigator.language, {hour12: false}) + '规则学习',
                    'timeZoneOffset': offset,
                    'boxIds': DpiList
                };
                //console.log(schedule);

                Learning.createLearningTaskAll(schedule).then(function (data) {
                    //console.log(data.data);
                    if (data.data.state === 'REJECT') {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '创建学习任务失败'
                        });
                    } else {
                        setTimeout(function () {
                            $rootScope.addAlert({
                                type: 'success',
                                content: '创建学习任务成功'
                            });
                            vm.showEdit = false;
                            vm.refreshPage();
                        }, 500);
                    }
                }, function (data) {
                    if (data && data.data && data.data.rejectReason) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: data.data.rejectReason
                        });
                    }
                });
            };
            function getDpiData() {
                var payload = {'$filter': filter};
                Device.getAll(payload).then(function (data) {
                    var arr = data.map(function (d) {
                        vm.selectDPI.push(false);
                        d.deployRulesNum = 0;
                        for (var j = 0; j < d.devicePorts.length; j++) {
                            d.deployRulesNum += d.devicePorts[j].deployedRulesNumber;
                            if (d.devicePorts[j].isMgmtPort) {
                                d.mgmtIp = d.devicePorts[j].portIp;
                            }
                        }
                        if ($rootScope.domainLogin[d.mgmtIp] || !uiCtrl.isRemote()) {
                            return Topology.getDeviceNodes(d.deviceId);
                        } else {
                            return auth.autoLogin(d.mgmtIp).then(function () {
                                return Topology.getDeviceNodes(d.deviceId);
                            });
                        }
                    });
                    return arr.length ? $q.all(arr).then(function (nodes) {
                        var set = data.map(function (d, i) {
                            data[i].nodes = nodes[i];
                            return Device.getNodeRules(data[i].nodes).then(function (nodes) {
                                d.nodes = nodes;
                                //console.log(d.topologyId + ", " + d.mgmtIp);
                                if (uiCtrl.isRemote()) {
                                    return Learning.getLearningTasks(d.mgmtIp).then(function (data) {
                                        d.learning = data.data;
                                    });
                                } else {
                                    return Learning.getLearningTasks().then(function (data) {
                                        d.learning = data.data;
                                    });
                                }
                            });
                        });
                        return $q.all(set).then(function () {
                            vm.dpiData = data;
                        });
                    }) : [];
                });
            }

            getDpiData();

            vm.refreshPage = function () {
                getDpiData();
            };
        }
    }
})();
