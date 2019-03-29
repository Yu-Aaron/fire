/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.basic')
        .controller('BasicCtrl', BasicCtrl);

    function BasicCtrl($modal, Basic, $rootScope, timerService, $scope, $interval, apiInfo, formatVal, $window, $timeout, Task, $q, System, Device, Enum, serverTime, $location) {
        var vm = this;

        //系统基本设置模块类型
        vm.SettingType = {
            "WMODE": "0",
            "TIME": "1",
            "SAFTY": "2",
            "HOST": "3",
            "BAK": "4",
            "LOG": "5",
            "RESET": "6"
        };
        vm.editMode = {
            workingModeSetting: false, //工作模式
            timeSync: false, //时间同步
            security: false, //安全管理
            ipaddress: false,//网络端口配置
            backup: false, //备份与恢复
            syslogStorage: false, //日志存储
            scheduleDelete: false, //定期删除信息
            login: false
        };

        Basic.getBasicSetting().then(function (data) {
            vm.initWorkingModeSetting(data);
            vm.initTimeSync(data);
            vm.initSyslogStorage(data);
        });

        //初始化工作模式配置
        vm.initWorkingModeSetting = function (data) {
            //get workingMode setting
            var wmsData = data.data.workingModeSetting;
            if (wmsData) {
                vm.modeType = wmsData.modeType;
                vm.enableSwitch = wmsData.enableSwitch ? wmsData.enableSwitch : false;
                vm.switchTime = wmsData.switchTime ? new Date(wmsData.switchTime) : '';
                vm.switchModeType = wmsData.switchModeType;
            }
        };

        //初始化时间同步配置
        vm.initTimeSync = function (data) {
            //get timeSync settting
            var tsData = data.data.timeSync;
            if (tsData) {
                vm.ntpIp = tsData.ntpIp ? tsData.ntpIp : "";
                vm.activateNtp = tsData.activateNtp ? (tsData.activateNtp ? '1' : '0') : '0';
                vm.setActivateNtp = tsData.activateNtp ? tsData.activateNtp : false;
            }
        };

        //获取MW网络信息

        //Basic.getMWNetwork().then(function (data) {
        //    vm.hostName = data.data.hostName;
        //    vm.ipAddress = (data.data.mwIp && data.data.mwIp.length > 0 ? data.data.mwIp.substring(0, data.data.mwIp.length) : '0.0.0.0');
        //    vm.netMask = (data.data.netMask && data.data.netMask.length > 0 ? data.data.netMask.substring(0, data.data.netMask.length) : '255.255.255.0');
        //    vm.gateWay = (data.data.gateWay && data.data.gateWay.length > 0 ? data.data.gateWay.substring(0, data.data.gateWay.length) : '0.0.0.0');
        //    vm.preferDns = data.data.preferDns;
        //    vm.spareDns = data.data.spareDns;
        //    vm.originalIpAddress = vm.ipAddress;
        //    vm.originalNetMask = vm.netMask;
        //    vm.originalGateWay = vm.gateWay;
        //    vm.originHostName = vm.hostName;
        //    vm.originPreferDns = vm.preferDns;
        //    vm.originSpareDns = vm.spareDns;
        //});


        /******************* WorkingMode setting begin *******************/
        vm.ModeTypes = {"TEST": 0, "NORMAL": 1, "ALL": 2};
        vm.modeTypeOptions = [
            {"value": vm.ModeTypes.TEST, "text": "测试模式"},
            {"value": vm.ModeTypes.NORMAL, "text": "正常模式"},
            {"value": vm.ModeTypes.ALL, "text": "全通模式"}
        ];
        $scope.$watch("basic.switchModeType", function (value) {
            vm.switchMode = _.find(vm.modeTypeOptions, {value: value});
        });
        //“自动转入”下拉框过滤“测试模式”
        vm.filterTestMode = function (e) {
            return e.value > vm.ModeTypes.TEST;
        };
        //校验转换时间是否大于当前时间
        vm.validSwitchTime = true;
        vm.validateSwitchTime = function () {
            vm.validSwitchTime = vm.switchTime.getTime() > new Date().getTime();
        };
        //启用测试模式自动转换时，触发时间校验
        vm.clickEnableSwitch = function () {
            if (vm.enableSwitch) {
                vm.validateSwitchTime();
            }
        };
        vm.clickModeType = function () {
            //选择非测试模式时，禁用测试模式转其他模式配置
            if (vm.modeType !== vm.ModeTypes.TEST) {
                vm.enableSwitch = false;
                vm.validSwitchTime = true;
            }
        };
        vm.editWorkingMode = function () {
            vm.editMode.workingModeSetting = !vm.editMode.workingModeSetting;
        };
        vm.changeWorkingMode = function () {
            var params = {
                "modeType": vm.modeType,
                "enableSwitch": vm.enableSwitch,
                "switchTime": moment(vm.switchTime).utc().format('YYYY-MM-DD HH:mm:ss'),
                "switchModeType": vm.switchModeType
            };
            //当工作模式选择非测试模式时，清除测试模式转其他模式参数
            if (vm.modeType !== vm.ModeTypes.TEST) {
                params.enableSwitch = "";
                params.switchTime = "";
                params.switchModeType = "";
            }
            var deferred = $q.defer();
            $rootScope.timeoutPromise = deferred.promise;
            Basic.setWorkingModeSetting(params).then(function () {
                deferred.resolve('success');
                $rootScope.addAlert({
                    type: 'success',
                    content: '工作模式下发成功'
                });
                vm.editMode.workingModeSetting = false;
            }, function (data) {
                deferred.resolve('fail');
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.reason ? ('工作模式下发失败：' + data.data.reason) :
                        data.data.rejectReason ? ('工作模式下发失败：' + data.data.rejectReason) : '工作模式下发失败')
                });
            });
        };
        vm.cancelWorkingMode = function () {
            Basic.getBasicSetting().then(function (data) {
                vm.initWorkingModeSetting(data);
            });
            vm.editMode.workingModeSetting = !vm.editMode.workingModeSetting;
        };
        /********************* WorkingMode setting end *******************/

        /********************* TimeSync setting begin *******************/
        vm.validSystemTime = false;
        vm.systemDateInput = "";
        vm.systemTimeInput = "";
        vm.datePickerCtrl = {};
        vm.timePickerCtrl = {};
        vm.redirectWaitTime = 5;

        vm.loadSystemTime = $interval(function () {
            serverTime.getTime().then(function (data) {
                vm.serverTime = new Date(data);
            });
        }, 1000);

        //校验手动时间
        vm.validateSystemTime = function () {
            vm.validSystemTime = false;
            if (typeof vm.systemTimeInput === 'object' && typeof vm.systemDateInput === 'object') {
                vm.validSystemTime = true;
            }
        };

        //校验NTP服务器IP
        vm.validateNtpIP = function (ip) {
            vm.validNtpIP = ip && !formatVal.validateIp(ip) && ip !== "0.0.0.0" && ip !== "255.255.255.255";
        };

        //获取手动选择的时间，如果手动选择时间为空，则取serverTime赋值
        vm.getInputDateTime = function () {
            var dt = vm.systemDateInput ? vm.systemDateInput : new Date(vm.serverTime.getTime());
            if (vm.systemTimeInput) {
                dt.setHours(vm.systemTimeInput.getHours());
                dt.setMinutes(vm.systemTimeInput.getMinutes());
                dt.setSeconds(vm.systemTimeInput.getSeconds());
            } else {
                dt.setHours(vm.serverTime.getHours());
                dt.setMinutes(vm.serverTime.getMinutes());
                dt.setSeconds(vm.serverTime.getSeconds());
            }
            dt = dt.toISOString().substring(0, 19) + "Z";
            return dt;
        };
        vm.editTimeSync = function () {
            vm.validSystemTime = false;
            vm.setActivateNtp = vm.activateNtp === '1';
            vm.editMode.timeSync = !vm.editMode.timeSync;
            vm.ntpIpEnter = vm.ntpIp;
            vm.validateNtpIP(vm.ntpIpEnter);
        };
        vm.changeTimeSync = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/basic/systemTimeSetModal.html',
                size: 'sm',
                controller: function ($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.close(false);
                    };
                    $scope.confirm = function () {
                        $modalInstance.close(true);
                    };
                }
            });

            modalInstance.result.then(function (ret) {
                if (ret) {
                    var deferred = $q.defer();
                    $rootScope.timeoutPromise = deferred.promise;
                    if (vm.setActivateNtp) {
                        Basic.updateNtpSync(vm.ntpIpEnter, vm.setActivateNtp).then(function (data) {
                            if (data && data.code) {
                                deferred.resolve('success');
                                $timeout(function () {
                                    window.location.reload();
                                }, 200);
                            } else {
                                deferred.resolve('fail');
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: 'NTP服务器IP无效！'
                                });
                            }
                        }, function (error) {
                            deferred.resolve('fail');
                            $rootScope.addAlert({
                                type: 'danger',
                                content: error.data.error ? error.data.error : 'NTP时钟设置失败，请稍后重试！'// + error.data.error
                            });
                        });
                    } else {
                        var time = vm.getInputDateTime();
                        if (time) {
                            Basic.setSystemTime(time).then(function () {
                                $timeout(function () {
                                    deferred.resolve('success');
                                    window.location.reload();
                                }, 2000);
                            }, function () {
                                deferred.resolve('fail');
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '时钟同步设置失败！'// + error.data.error
                                });
                            });
                        }
                    }
                }
            });
        };
        vm.cancelTimeSync = function () {
            vm.setActivateNtp = vm.activateNtp === '1';
            vm.datePickerCtrl.clearDate();
            vm.timePickerCtrl.clearDate();
            vm.systemDateInput = "";
            vm.systemTimeInput = "";
            vm.editMode.timeSync = !vm.editMode.timeSync;
        };
        /******************* TimeSync setting end *******************/

        /** Security setting begin **/

        vm.isShowDisconnectModal = false;
        vm.showDisconnectModal = function () {
            vm.isShowDisconnectModal = true;
            $modal.open({
                templateUrl: 'disconnectModal.html',
                controller: disconnectModalInstanceCtrl,
                size: 'sm',
                backdrop: 'static',
                keyboard: false
            });

            function disconnectModalInstanceCtrl($scope, $modalInstance) {
                vm.hideDisconnectModal = function () {
                    vm.isShowDisconnectModal = false;
                    $modalInstance.close('done');
                };
            }
        };

        vm.redirectToMainPage = function () {
            vm.isShowDisconnectModal = true;
            vm.showDisconnectModal();
            $timeout(function () {
                apiInfo.sysbaseinfo().then(function (data) {
                    var currentTime = new Date(data.data);
                    if (!isNaN(currentTime.getDate()) && !isNaN(currentTime.getTime())) {
                        vm.isShowDisconnectModal = false;
                        $location.path("/");
                        $window.location.reload();
                    } else {
                        if (!vm.isShowDisconnectModal) {
                            vm.showDisconnectModal();
                        }
                        vm.redirectToMainPage();
                    }
                }, function () {
                    if (!vm.isShowDisconnectModal) {
                        vm.showDisconnectModal();
                    }
                    vm.redirectToMainPage();
                });
            }, 5000);
        };

        initStrategyInfo_security();

        function initStrategyInfo_security() {
            System.getStrategyInfo().then(function (data) {
                var strategyArr = data.data;
                strategyArr.forEach(function (el) {
                    if (el.strategyInfo.strategyCode === "REMOTE_ACCESS_PROTOCOL") {
                        getRemoteAccessProtocol(el);
                    }

                });
            });
        }

        vm.remoteProtocol = {
            'setting': {}
        };
        vm.validSSHPort = false;
        vm.validHttpsPort = false;

        function getRemoteAccessProtocol(strategyBuilder) {
            vm.remoteProtocol.setting.strategyInfo = strategyBuilder.strategyInfo;
            vm.remoteProtocol.setting.strategyRules = strategyBuilder.strategyRules;
            vm.remoteProtocol.setting.strategyActions = strategyBuilder.strategyActions;
            vm.remoteProtocol.setting.strategyRuleSetId = vm.remoteProtocol.setting.strategyInfo.strategyRuleSetId;
            prepareRemoteProtocolList(vm.remoteProtocol.setting.strategyRules);
        }

        function prepareRemoteProtocolList(strategyRules) {
            for (var i = 0; i < strategyRules.length; i++) {
                if (strategyRules[i].strategyRuleName === "SSH") {
                    vm.remoteProtocol.setting.SSHDisabled = strategyRules[i].disabled;
                    vm.remoteProtocol.setting.SSHPort = strategyRules[i].ruleData;
                } else if (strategyRules[i].strategyRuleName === "https") {
                    vm.remoteProtocol.setting.httpsDisabled = strategyRules[i].disabled;
                    vm.remoteProtocol.setting.httpsPort = strategyRules[i].ruleData;
                }
            }
        }

        vm.editSecurity = function () {
            vm.editMode.security = !vm.editMode.security;
            vm.validateSSHPort(vm.remoteProtocol.setting.SSHPort);
            vm.validateHttpsPort(vm.remoteProtocol.setting.httpsPort);
        };


        var security = vm.security = {};

        vm.changeSecurity = function () {
            if (
                (!vm.remoteProtocol.setting.SSHDisabled && vm.validSSHPort || vm.remoteProtocol.setting.SSHDisabled) &&
                (!vm.remoteProtocol.setting.httpsDisabled && vm.validHttpsPort || vm.remoteProtocol.setting.httpsDisabled) &&
                ($("#error_span_timeout").css("display") === "none") &&
                ($("#error_span_loginTry").css("display") === "none") &&
                ($("#error_span_loginLockingTime").css("display") === "none")
            ) {
                if (vm.remoteProtocol.setting.SSHDisabled || vm.remoteProtocol.setting.httpsDisabled) {
                    var modalInstance = $modal.open({
                        templateUrl: 'templates/setting/basic/remote-protocol-panel.html',
                        size: 'sm',
                        controller: ModalInstanceCtrl,
                        resolve: {
                            data: function () {
                                return [vm.remoteProtocol.setting.SSHDisabled, vm.remoteProtocol.setting.httpsDisabled];
                            }
                        }
                    });
                    modalInstance.result.then(function (msg) {
                        console.log(msg);
                    }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                    });
                } else {
                    security.changeRemoteProtocol();
                }

            }
            function ModalInstanceCtrl(data, $scope, $modalInstance) {
                $scope.data = data;
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    //System.resetSystem().then(function () {
                    //    $rootScope.addAlert({
                    //        type: 'success',
                    //        content: '系统会在十秒后开始恢复原厂设置。请稍等。。。'
                    //    });
                    //    $timeout(function () {
                    //        reset.redirectToMainPage();
                    //    }, 5000);
                    //}, function () {
                    //    $rootScope.addAlert({
                    //        type: 'danger',
                    //        content: '恢复原厂设置没有成功。'
                    //    });
                    //});
                    security.changeRemoteProtocol();
                    $modalInstance.close('done');
                };
            }
        };

        security.changeRemoteProtocol = function () {
            function beforeChangeRemoteProtocol() {
                var promises = [];
                if (!vm.remoteProtocol.setting.SSHDisabled) {
                    promises.push(validatePortState('sshd', vm.remoteProtocol.setting.SSHPort));
                }
                if (!vm.remoteProtocol.setting.httpsDisabled) {
                    promises.push(validatePortState('nginx', vm.remoteProtocol.setting.httpsPort));
                }
                return $q.all(promises).then(function (data) {
                    return _.every(data, function (item) {
                        return item === true;
                    });
                });
            }

            beforeChangeRemoteProtocol().then(function (data) {
                if (data) {
                    for (var i = 0; i < vm.remoteProtocol.setting.strategyRules.length; i++) {
                        if (vm.remoteProtocol.setting.strategyRules[i].strategyRuleName === "SSH") {
                            vm.remoteProtocol.setting.strategyRules[i].ruleData = vm.remoteProtocol.setting.SSHPort;
                            vm.remoteProtocol.setting.strategyRules[i].disabled = vm.remoteProtocol.setting.SSHDisabled;
                        } else if (vm.remoteProtocol.setting.strategyRules[i].strategyRuleName === "https") {
                            vm.remoteProtocol.setting.strategyRules[i].ruleData = vm.remoteProtocol.setting.httpsPort;
                            vm.remoteProtocol.setting.strategyRules[i].disabled = vm.remoteProtocol.setting.httpsDisabled;
                        }
                    }

                    var deferred = $q.defer();
                    $rootScope.timeoutPromise = deferred.promise;
                    Basic.updateRemoteProtocol(vm.remoteProtocol.setting.strategyRules).then(function () {
                        deferred.resolve('success');
                        if (vm.remoteProtocol.setting.httpsDisabled) {
                            $rootScope.addAlert({
                                type: 'success',
                                content: '安全管理配置成功，' + vm.redirectWaitTime + '秒后系统将无法通过Web控制页面访问。。。'
                            });
                            $timeout(function () {
                                vm.redirectToMainPage();
                            }, vm.redirectWaitTime * 1000);
                        } else {
                            $rootScope.addAlert({
                                type: 'success',
                                content: '安全管理配置成功，稍后请重新登录系统。'
                            });
                            Basic.restartNginx();
                            $timeout(function () {
                                window.location.href = "https://" + window.location.hostname + ":" + vm.remoteProtocol.setting.httpsPort;
                            }, 2000);
                            /*
                                //.then(function (data) {
                                //if (data.data.success === true) {

                                    $timeout(function () {
                                        vm.showDisconnectModal();
                                    }, 100);

                                    $timeout(function () {
                                        window.location.href = "https://" + window.location.hostname + ":" + vm.remoteProtocol.setting.httpsPort + window.location.pathname;
                                    }, vm.redirectWaitTime * 1000);
                            //    }else{
                            //        $rootScope.addAlert({
                            //            type: 'danger',
                            //            content: '重启nginx服务失败，请联系管理员，errorCause:[' + data.data.errorCause + ']'
                            //        });
                            //    }
                            //}, function (error) {
                            //    console.log(error);
                            //    $rootScope.addAlert({
                            //        type: 'danger',
                            //        content: '重启nginx服务失败，请联系管理员'
                            //    });
                            //});*/
                        }
                        vm.editMode.security = false;
                    }, function (error) {
                        console.log(error);
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '配置失败：设定授权远程访问服务出错！'
                        });
                    });
                }
            });
            //-------------

        };

        vm.cancelSecurity = function () {
            initStrategyInfo_security();
            vm.editMode.security = !vm.editMode.security;
        };

        vm.validateSSHPort = function (port) {
            vm.validSSHPort = port && !formatVal.validatePort(port);
        };

        vm.validateHttpsPort = function (port) {
            vm.validHttpsPort = port && !formatVal.validatePort(port);
        };

        function validatePortState(service, port) {
            return Basic.protocolPortOccupied(port).then(function (data) {
                if (data.data.service !== '' && data.data.service.indexOf(service) === -1) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '端口：' + port + '已被其他服务占用'
                    });
                    return false;
                }
                console.log('port:' + port + ' is not occupied');
                return true;
            }, function (error) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: error.data
                });
                return false;
            });
        }

        /** Security setting end **/

        /** Login setting begin **/
        function initStrategyInfo_login() {
            $q.all([System.getStrategyInfo(), System.getJobStrategyInfo('LOG_DELETION'), Basic.getMWNetwork()]).then(function (data) {
                var strategyArr = data[0].data;
                strategyArr.forEach(function (el) {
                    //if (el.strategyInfo.strategyCode === "STORAGE_MANAGEMENT") {
                    //    vm.storageStrategy = el;
                    //} else
                    if (el.strategyInfo.strategyCode === "MAX_LOGIN_TRY_MANAGEMENT") {

                        vm.maxLoginTimesStrategy = el;
                        //} else if (el.strategyInfo.strategyCode === "ENCRYPTION_MANAGEMENT") {
                        //    vm.encryptionStrategy = el;
                        //    vm.encryptionStrategy.encryptionStrategyVal = vm.encryptionStrategy.strategyRules[0].ruleData;
                        //} else if (el.strategyInfo.strategyCode === "PASSWORD_COMPLEXITY_MANAGEMENT") {
                        //    //vm.passwordComplexityStrategy = el;
                        //    vm.changePasswordComplexityStrategyArray(el.strategyRules[0].ruleData);
                    } else if (el.strategyInfo.strategyCode === "LOGIN_LOCKING_TIME") {
                        vm.loginLockingTimeStrategy = el;
                    } else if (el.strategyInfo.strategyCode === "TIMEOUT_MANAGEMENT") {
                        vm.timeoutStrategy = el;
                    } else if (el.strategyInfo.strategyCode === "IP_LOGIN_MANAGEMENT") {
                        getAllRemoteIps(el);
                    } else if (el.strategyInfo.strategyCode === "LOG_DELETION_MANAGEMENT") {
                        vm.logDeletionManagement = el;
                        vm.logDeletionManagementTmp = el.strategyRules[0].ruleData;
                    } else if (el.strategyInfo.strategyCode === "LOG_DELETION_TIME") {
                        vm.logDeletionTime = el;
                        var t = el.strategyRules[0].ruleData.split(":");
                        var d = new Date();
                        d.setHours(t[0]);
                        d.setMinutes(t[1]);
                        d.setSeconds(t[2]);
                        d.setMilliseconds(0);
                        vm.logDeletionTimeTmp = d;
                    }

                });
                if (data[1].data) {
                    vm.logDeletionManagement = data[1].data;
                    vm.logDeletionManagementTmp = data[1].data.schedulingJob.jobData;
                    var d = moment.utc();
                    d.set('second', data[1].data.schedulingJobMeta[0].second);
                    d.set('minute', data[1].data.schedulingJobMeta[0].minute);
                    d.set('hour', data[1].data.schedulingJobMeta[0].hour);
                    vm.logDeletionTimeTmp = new Date(moment(d.format()).format());
                }
                if (data[2] && data[2].data){
                    vm.mwIp = data[2].data.mwIp;
                }
            });
        }

        initStrategyInfo_login();

        vm.editLogin = function () {
            vm.editMode.login = !vm.editMode.login;
        };

        vm.changeLogin = function () {
            function beforeConfirmRemoteIps() {
                var promise = true;
                var i, tmp;
                for (i = 0; i < vm.remoteIps.length; i++) {
                    tmp = vm.remoteIps[i];
                    if (tmp.ruleData === '0.0.0.0/0' && vm.remoteIps.length !== 1) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '设置全网段(0.0.0.0/0)可访问时，不能添加其他访问IP规则'
                        });
                        promise = false;
                    }
                }
                return $q.resolve(promise);
            }

            beforeConfirmRemoteIps().then(function (data) {
                if (data) {
                    $q.all([
                        System.updateStrategyInfo(vm.maxLoginTimesStrategy.strategyRules[0]),
                        System.updateStrategyInfo(vm.loginLockingTimeStrategy.strategyRules[0]),
                        System.updateStrategyInfo(vm.timeoutStrategy.strategyRules[0]),
                        vm.confirmRemoteIps()
                    ]).then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '登陆管理配置成功'
                        });
                        initStrategyInfo_login();
                        vm.editLogin();
                    }, function (error) {
                        console.log(error);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '登陆管理配置失败'
                        });
                    });
                }
            });
        };

        vm.cancelLogin = function () {
            initStrategyInfo_login();
            refreshAllRemoteIps();
            vm.editMode.login = !vm.editMode.login;
        };
        /** Login setting end **/

        /** Login remoteIp start **/
        vm.login = {};
        vm.login.maxRemoteIpNo = 5;

        vm.remoteIpData = {
            'setting': {}
        };
        vm.ipDataToRemove = [];
        // refreshAllRemoteIps();
        function refreshAllRemoteIps() {
            return System.getRemoteIp().then(function (data) {
                getAllRemoteIps(data.data);
                vm.ipDataToRemove = [];
            });
        }

        function getAllRemoteIps(strategyBuilder) {
            vm.remoteIpData.setting.strategyInfo = strategyBuilder.strategyInfo;
            vm.remoteIpData.setting.strategyRules = strategyBuilder.strategyRules;
            vm.remoteIpData.setting.strategyActions = strategyBuilder.strategyActions;
            vm.remoteIpData.setting.strategyRuleSetId = vm.remoteIpData.setting.strategyInfo.strategyRuleSetId;
            prepareIpList(vm.remoteIpData.setting.strategyRules);
        }


        function prepareIpList(data) {
            vm.remoteIpsSource = data;
            vm.remoteIps = angular.copy(vm.remoteIpsSource);
            for (var i = 0; i < vm.remoteIps.length; i++) {
                var tmp = vm.remoteIps[i];
                if (!tmp.strategyRuleName && tmp.ruleData === '0.0.0.0/0') {
                    tmp.strategyRuleName = "允许所有IP地址访问";
                }
                tmp.errors = false;
            }
            vm.validIp = true;
            vm.remoteIpsEnable = ((vm.remoteIps.length === 1) && (vm.remoteIps[0].ruleData === "0.0.0.0/0")) ? false : true;
        }

        vm.addRemoteIp = function () {
            if (vm.remoteIps.length < vm.login.maxRemoteIpNo) {
                vm.remoteIps.unshift({ruleData: "", strategyRuleName: "", errors: true});
                vm.validIp = false;
            } else {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '最多只能设置' + vm.login.maxRemoteIpNo + '个远程地址'
                });
            }
        };
        vm.removeRemoteIp = function (index, id) {
            if (id === undefined) {
                vm.remoteIps.splice(index, 1);
                checkAllIp();
                return;
            }
            vm.ipDataToRemove.push(id);
            vm.remoteIps.splice(index, 1);
        };
        vm.refreshRemoteIp = function () {
            refreshAllRemoteIps();
        };

        vm.checkIp = function (ip) {
            if (ip.ruleData === '0.0.0.0' || ip.ruleData === '0.0.0.0/0') {
                vm.validIp = true;
                ip.isMwIp = false;
            } else if(ip.ruleData === vm.mwIp || (ip.ruleData.lastIndexOf('/32') > 0 && ip.ruleData.split('/')[0] === vm.mwIp)){
                vm.validIp = false;
                ip.isMwIp = true;
            } else {
                vm.validIp = ip.ruleData && ip.ruleData.length > 0 && !formatVal.validateIpRange(ip.ruleData);
                ip.isMwIp = false;
            }
            ip.errors = !vm.validIp;
            if (vm.validIp) {
                checkAllIp();
            }
        };

        function checkAllIp() {
            for (var i = 0; i < vm.remoteIps.length; i++) {
                var tmp = vm.remoteIps[i];
                if (tmp.errors) {
                    vm.validIp = false;
                    return;
                }
            }
            vm.validIp = true;
        }

        vm.confirmRemoteIps = function () {

            var i, tmp;
            var promises = [];
            for (i = 0; i < vm.remoteIps.length; i++) {
                tmp = vm.remoteIps[i];
                delete tmp.isMwIp;
                if (tmp.strategyRuleId) {
                    delete tmp.errors;
                    promises.push(System.updateRemoteIp(tmp));
                } else {
                    var data = {
                        "strategyRuleSetId": vm.remoteIpData.setting.strategyInfo.strategyRuleSetId,
                        "strategyRuleCode": "EQ",
                        "ruleData": tmp.ruleData,
                        "strategyRuleName": tmp.strategyRuleName,
                        "rulePriority": 0,
                        "disabled": false,
                        "strategyRuleIdentifier": "VALID_IP"
                    };
                    promises.push(System.createRemoteIp(data));
                }
            }
            for (i = 0; i < vm.ipDataToRemove.length; i++) {
                promises.push(System.deleteRemoteIp(vm.ipDataToRemove[i]));
            }
            $q.all(promises).then(function () {
                vm.refreshRemoteIp();
            });

        };

        /** Login remoteIp end **/

        /** Network setting begin **/

        vm.editIPAddress = function () {
            vm.editMode.ipaddress = !vm.editMode.ipaddress;
            vm.validateHostName(vm.hostName);
            vm.validatePlatformIP(vm.ipAddress);
            vm.validatePlatformNetMask(vm.netMask);
            vm.validatePlatformPreferDns(vm.preferDns);
            vm.validatePlatformSpareDns(vm.spareDns);
            //vm.validatePlatformGateWay(vm.gateWay);
        };

        vm.changeIPAddress = function () {
            var ip_num = ipv4_to_num(vm.ipAddress);
            var subnet = ( (ipv4_to_num(vm.ipAddress)) & (ipv4_to_num(vm.netMask)) ) >>> 0;
            var broadcast = (subnet | (~ipv4_to_num(vm.netMask))) >>> 0;
            vm.validPlatformIP = (subnet < ip_num && ip_num < broadcast);
            if (vm.validPlatformIP && vm.validPlatformNetMask && vm.validPlatformGateWay && vm.validPreferDns && vm.validSpareDns && vm.validPlatformHostName) {

                vm.disableEditIPButton = true;
                Basic.updateIPAddress(vm.hostName, vm.ipAddress, vm.netMask, vm.gateWay, vm.preferDns, vm.spareDns).then(function () {
                    console.log("done");
                    vm.originalIpAddress = vm.ipAddress;
                    vm.originalNetMask = vm.netMask;
                    vm.originalGateWay = vm.gateWay;
                    vm.originHostName = vm.hostName;
                    vm.originPreferDns = vm.preferDns;
                    vm.originSpareDns = vm.spareDns;

                    //  Redirect to the new IP after a timeout
                    $rootScope.addAlert({
                        type: 'success',
                        content: '系统会在十秒后自动网址重定向。请稍等。。。'
                    });
                    setTimeout(function () {
                        $window.location.href = "https://" + vm.ipAddress;
                    }, 10000);
                }, function (error) {
                    console.log(error);
                    vm.ipAddress = vm.originalIpAddress;
                    vm.netMask = vm.originalNetMask;
                    vm.gateWay = vm.originalGateWay;
                    vm.hostName = vm.originHostName;
                    vm.preferDns = vm.originPreferDns;
                    vm.spareDns = vm.originSpareDns;
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '网络端口配置失败！'
                    });
                });

                //  Turn off edit mode
                vm.editIPAddress();
            } else {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '请确认IP地址与网关在同一有效网段！'
                });
            }

        };

        vm.cancelIPAddress = function () {
            vm.editIPAddress();
            vm.ipAddress = vm.originalIpAddress;
            vm.netMask = vm.originalNetMask;
            vm.gateWay = vm.originalGateWay;
            vm.hostName = vm.originHostName;
            vm.preferDns = vm.originPreferDns;
            vm.spareDns = vm.originSpareDns;
        };

        vm.validatePlatformIP = function (ip) {
            vm.validPlatformIP = ip && !formatVal.validateIp(ip);
            vm.validatePlatformGateWay(vm.gateWay);
        };
        vm.validatePlatformNetMask = function (netMask) {
            vm.validPlatformNetMask = netMask && netMask.match(formatVal.getIPReg()) && !formatVal.validateNetMask(netMask);
            vm.validatePlatformGateWay(vm.gateWay);
        };
        vm.validateHostName = function (hostName) {
            vm.validPlatformHostName = hostName && formatVal.checkProtocolName(vm.hostName);
        };
        vm.validatePlatformPreferDns = function (prefer) {
            vm.validPreferDns = prefer && !formatVal.validateIp(prefer);
        };
        vm.validatePlatformSpareDns = function (spare) {
            vm.validSpareDns = undefined === spare ? true : spare && !formatVal.validateIp(spare);
        };
        vm.validatePlatformGateWay = function (gateWay) {
            if (vm.validPlatformIP && vm.validPlatformNetMask && gateWay && !formatVal.validateIp(gateWay)) {
                var ip_num = ipv4_to_num(gateWay);
                var subnet = ( (ipv4_to_num(vm.ipAddress)) & (ipv4_to_num(vm.netMask)) ) >>> 0;
                var broadcast = (subnet | (~ipv4_to_num(vm.netMask))) >>> 0;
                vm.validPlatformGateWay = (subnet < ip_num && ip_num < broadcast);
            } else {
                vm.validPlatformGateWay = false;
            }
        };

        function ipv4_to_num(ip) {
            var arr = ip.split(".");
            return ((Number(arr[0]) << 24) | (Number(arr[1]) << 16) | (Number(arr[2]) << 8) | (Number(arr[3]) << 0)) >>> 0;
        }

        /** Network setting end **/

        /** backup setting begin **/

        var filter = 'infoType eq MW';

        getAllBackupInfo();

        function getAllBackupInfo(params) {
            var payload = params || {};
            payload['$filter'] = filter;
            Device.getConfBackUpInfos(payload).then(function (data) {
                vm.backupInfos = data;
                //console.log(vm.backupInfos);
            });
        }

        vm.editBackup = function () {
            vm.editMode.backup = !vm.editMode.backup;
        };
        vm.changeBackup = function () {
            vm.editMode.backup = !vm.editMode.backup;
        };
        vm.cancelBackup = function () {
            vm.editMode.backup = !vm.editMode.backup;
        };
        vm.backup = function () {

        };
        vm.restore = function () {

        };
        /** backup setting end **/

        /** SyslogStorage setting begin **/
            //获取日志存储 基本设置

        vm.reduplicateSyslogs = false;
        vm.initSyslogStorage = function (data) {
            vm.syslog.setting.type = data.data.syslogStorage.syslogStorageType;
            //vm.syslog.setting.type = data.data.syslogStorage.syslogStorageType === "SYSLOG" ? 1 : 0;


            vm.syslog.setting.localEnabled = false;
            vm.syslog.setting.syslogEnabled = false;
            if (vm.syslog.setting.type === 'LOCAL') {
                vm.syslog.setting.localEnabled = true;
            } else if (vm.syslog.setting.type === 'SYSLOG') {
                vm.syslog.setting.syslogEnabled = true;
            } else if (vm.syslog.setting.type === 'DUAL') {
                vm.syslog.setting.localEnabled = true;
                vm.syslog.setting.syslogEnabled = true;
            }

            vm.syslog.setting.syslogs = data.data.syslogStorage.syslogs;
        };

        vm.syslog = {
            'setting': {}
        };
        vm.syslog.setting.maxNo = 3; //最大存储3个syslogs
        vm.syslog.setting.syslogs = [];

        //vm.validSyslogIp = false;
        //vm.validSyslogPort = false;
        vm.syslog.setting.syslogToRemove = [];
        vm.editSyslog = function () {
            vm.editMode.syslogStorage = !vm.editMode.syslogStorage;
            //vm.validateSyslogIp(vm.syslog.setting.syslogs[0].syslogIp);
            //vm.validateSyslogPort(vm.syslog.setting.syslogs[0].syslogPort);
            checkAllSyslog();
        };

        vm.changeSyslog = function () {
            //{"storageType":0,"syslogSettings":[{"seq":1,"syslogPort":0},{"seq":2,"syslogPort":0}]}
            //console.log(vm.validSyslogIp);
            //console.log(vm.validSyslogPort);
            //if (vm.validSyslog && vm.syslog.setting.syslogs.length > 0) {
            vm.syslog.setting.type = 'NONE';
            if (vm.syslog.setting.localEnabled) {
                vm.syslog.setting.type = 'LOCAL';
            }
            if (vm.syslog.setting.syslogEnabled) {
                vm.syslog.setting.type = 'SYSLOG';
            }
            if (vm.syslog.setting.localEnabled && vm.syslog.setting.syslogEnabled) {
                vm.syslog.setting.type = 'DUAL';
            }
            var params = {
                "syslogStorageType": vm.syslog.setting.type
            };
            params.syslogs = [];
            if (params.syslogStorageType === 'SYSLOG' || params.syslogStorageType === 'DUAL') {
                for (var i = 0; i < vm.syslog.setting.syslogs.length; i++) {
                    params.syslogs[i] = {};
                    if (params.syslogs[i].syslogId === undefined) {
                        params.syslogs[i].syslogId = i + 1;
                    }
                    params.syslogs[i].seq = i + 1;
                    params.syslogs[i].syslogIp = vm.syslog.setting.syslogs[i].syslogIp;
                    params.syslogs[i].syslogPort = vm.syslog.setting.syslogs[i].syslogPort;
                    params.syslogs[i].syslogProtocol = vm.syslog.setting.syslogs[i].syslogProtocol;
                }
            }
            //$rootScope.timeoutPromise = Basic.updateSyslog(params).then(function () {
            //    Basic.getBasicSetting().then(function (data) {
            //        vm.initSyslogStorage(data);
            //        vm.editSyslog();
            //    });
            //
            //}, function (error) {
            //    console.log(error.data.error);
            //    $rootScope.addAlert({
            //        type: 'danger',
            //        content: '日志存储设置失败！'// + error.data.error
            //    });
            //});

            var deferred = $q.defer();
            $rootScope.basicSettingDeployTaskPromise = deferred.promise;
            $rootScope.timeoutPromise = Basic.updateSyslog(params).then(function () {

                deferred.resolve('success');
                $rootScope.addAlert({
                    type: 'success',
                    content: '日志存储配置成功'
                });
                vm.editSyslog();
            }, function (data) {
                deferred.resolve('fail');
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.reason ? ('日志存储配置失败：' + data.data.reason) :
                        data.data.rejectReason ? ('日志存储配置失败：' + data.data.rejectReason) : '日志存储配置失败')
                });
            });
            //}
        };

        vm.cancelSyslog = function () {
            Basic.getBasicSetting().then(function (data) {
                vm.initSyslogStorage(data);
            });
            vm.editSyslog();
            vm.reduplicateSyslogs = false;
        };


        vm.addSyslog = function () {
            if (vm.syslog.setting.syslogs.length < vm.syslog.setting.maxNo) {
                vm.syslog.setting.syslogs.unshift({syslogIp: "", syslogProtocol: "", syslogPort: "", errors: true});
                vm.validSyslog = false;
                vm.validateSyslog(vm.syslog.setting.syslogs[0]);
            } else {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '最多只能设置' + vm.syslog.setting.maxNo + '个远程地址'
                });
            }
        };


        vm.removeSyslog = function (index, id) {
            if (id === undefined) {
                vm.syslog.setting.syslogs.splice(index, 1);
                checkAllSyslog();
                checkReduplicate();
                return;
            }
            vm.syslog.setting.syslogToRemove.push(id);
            vm.syslog.setting.syslogs.splice(index, 1);
            checkReduplicate();
        };


        vm.validateSyslog = function (syslog) {
            //syslog.validIp = syslog.syslogIp && syslog.syslogIp.length > 0 && !formatVal.validateIp(syslog.syslogIp);
            //syslog.validProtocol = syslog.syslogProtocol && syslog.syslogProtocol.length > 0;
            //syslog.validPort = syslog.syslogPort && syslog.syslogPort.length > 0 && !formatVal.validatePort(syslog.syslogPort)
            checkReduplicate();
            vm.validateSyslogIp(syslog);
            vm.validateSyslogProtocol(syslog);
            vm.validateSyslogPort(syslog);
            syslog.errors = syslog.ipErrors || syslog.protocolErrors || syslog.portErrors;
            vm.validSyslog = !syslog.errors && !vm.reduplicateSyslogs;
            if (vm.validSyslog) {
                checkAllSyslog();
            }
        };

        function checkReduplicate() {
            var len = vm.syslog.setting.syslogs.length;
            for (var i = 0; i < len; i++) {
                var tmp = vm.syslog.setting.syslogs[i];
                for (var j = i + 1; j < len; j++) {
                    var nxt = vm.syslog.setting.syslogs[j];
                    if (!nxt.errors) {
                        if (tmp.syslogIp + tmp.syslogPort + tmp.syslogProtocol ===
                            nxt.syslogIp + nxt.syslogPort + nxt.syslogProtocol) {
                            vm.reduplicateSyslogs = true;
                            vm.validSyslog = false;
                            return;
                        }
                    }
                }
            }
            vm.reduplicateSyslogs = false;
        }

        function checkAllSyslog() {
            var len = vm.syslog.setting.syslogs.length;
            for (var i = 0; i < len; i++) {
                var tmp = vm.syslog.setting.syslogs[i];
                if (tmp.errors) {
                    vm.validSyslog = false;
                    return;
                }
            }
            vm.validSyslog = true;
        }

        vm.validateSyslogIp = function (syslog) {
            syslog.ipErrors = !(syslog.syslogIp && syslog.syslogIp.length > 0 && !formatVal.validateIp(syslog.syslogIp));
        };

        vm.validateSyslogProtocol = function (syslog) {
            syslog.protocolErrors = !syslog.syslogProtocol || syslog.syslogProtocol === '' || syslog.syslogProtocol.length < 0;
        };

        vm.validateSyslogPort = function (syslog) {
            syslog.portErrors = !(syslog.syslogPort && !formatVal.validatePort(syslog.syslogPort));
        };

        ///** validate all value repeat among the syslogs settings **/
        //vm.validateSyslogRepeat = function () {
        //    for (var i = 0; i < vm.syslog.setting.syslogs.length; i++) {
        //        if (i < vm.syslog.setting.syslogs.length - 1) {
        //            for(var j=i+1; j < vm.vm.syslog.setting.syslogs.length; j++){
        //                var cur = vm.vm.syslog.setting.syslogs[i];
        //                var nxt = vm.vm.syslog.setting.syslogs[j];
        //                if(cur.syslogIp === nxt.syslogIp && cur.syslogProtocol === nxt.syslogProtocol && cur.syslogPort === nxt.syslogPort){
        //                    vm.validSyslog = false;
        //                    return;
        //                }
        //            }
        //        }
        //    }
        //    vm.validSyslog = true;
        //}

        /** SyslogStorage setting end **/

        /** log deletion setting start **/
        vm.editScheduleDelete = function () {
            vm.editMode.scheduleDelete = !vm.editMode.scheduleDelete;
        };

        vm.changeScheduleDelete = function () {
            vm.logDeletionManagement.schedulingJob.jobData = vm.logDeletionManagementTmp;
            vm.logDeletionTimeTmp.setHours(vm.logDeletionTimeTmp.getHours() + Math.round(vm.logDeletionTimeTmp.getTimezoneOffset() / 60));
            vm.logDeletionManagement.schedulingJobMeta[0].hour = vm.logDeletionTimeTmp.getHours().toString();
            vm.logDeletionManagement.schedulingJobMeta[0].minute = vm.logDeletionTimeTmp.getMinutes().toString();
            vm.logDeletionManagement.schedulingJobMeta[0].second = vm.logDeletionTimeTmp.getSeconds().toString();
            $q.all([
                System.updateStradegyJobBuilder(vm.logDeletionManagement)
            ]).then(function () {
                $rootScope.addAlert({
                    type: 'success',
                    content: '定期删除信息配置成功'
                });
                initStrategyInfo_login();
                vm.editScheduleDelete();
            });
        };

        vm.cancelScheduleDelete = function () {
            initStrategyInfo_login();
            vm.editScheduleDelete();
        };

        vm.hasPrivilege = function (p, v) {
            var priv = Enum.get('privilege');
            var t = priv.filter(function (a) {
                return a.name === p;
            });
            //console.log(p + " " + v);
            return v && t && t.length ? (t[0].actionValue >= v) : false;
        };

        $scope.$on('$destroy', function () {
            $interval.cancel(vm.loadSystemTime);
        });
    }
})
();
