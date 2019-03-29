/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.systemconsole')
        .controller('SystemConsoleCtrl', SystemConsoleCtrl);

    function SystemConsoleCtrl($modal, System, FileUploader, Enum, topologyId, URI, Task, auth, $rootScope, $timeout, $window, $location, $q, uiCtrl, uiTree, timerService, $scope, $interval, apiInfo, Device, formatVal, $stateParams) {
        var vm = this;
        uiCtrl.findLand('SYSTEM_CONSOLE', 1);
        var syslog = vm.syslog = {
            'setting': {}
        };

        upgrade_getDpiData().then(function () {
            vm.hasDpiData = vm.dpiData.length > 0;
        });

        // Init landing tab for system_console
        var system_console_child_nodes = uiTree.getNode("SYSTEM_CONSOLE").getChilds();
        var system_console_tabs = ["SYSTEM_SETTING", "SYSTEM_RESET", "SYSTEM_UPGRADE", "IP_CONFIG", "PROTOCOL_SETTING"];
        for (var i = 0; i < system_console_child_nodes.length; i++) {
            if (system_console_child_nodes[i].getPrivilegeValue() > 1) {
                var tabName = i > 0 ? system_console_tabs[i - 1] : system_console_tabs[i];  //As the first two privilege both point to SYSTEM_SETTING
                if (tabEnabled(tabName)) {
                    vm.system_console_init_tab = tabName;
                    break;
                }
            }
        }
        if (!vm.system_console_init_tab) {
            vm.system_console_init_tab = "PROTOCOL_SETTING";
        }
        if ($stateParams.tab !== null) {
            vm.system_console_init_tab = $stateParams.tab;
        }
        if ($rootScope.centraliztion) {
            vm.system_console_init_tab = "RUNNING_MODE";
        }

        vm.editRight = Enum.get('privilege').filter(function (a) {
            return a.name === 'SETTINGS_POLICY';
        });
        vm.editRight = vm.editRight && vm.editRight.length && vm.editRight[0].actionValue === 30;
        vm.noViewRight = Enum.get('privilege').filter(function (a) {
            return a.name === 'SETTINGS_POLICY';
        });
        vm.noViewRight = vm.noViewRight && vm.noViewRight.length && vm.noViewRight[0].actionValue === 1;

        vm.isRemote = uiCtrl.isRemote();
        vm.isAllinOne = uiCtrl.isAllinOne();

        //Upgrade System:
        System.getSerialNumber().then(function (response) {
            if (response.data.serialNumber) {
                vm.serialNumber = response.data.serialNumber;
            }
        });
        System.getLastUpgrade().then(function (response) {
            vm.lastupgrade = (response.data && response.data.updatedAt) ? (new Date(response.data.updatedAt)) : null;
        });
        vm.uploader = new FileUploader({
            url: URI + '/files/console/uploadimage',
            autoUpload: true,
            queueLimit: 1
        });
        var uploadImageVersion = "";
        var currentImageVersion = $rootScope.VERSION_NUMBER.substr(3, 3);

        function compareVersion(current, upload) {
            return current && upload && current[0] <= upload[0] && current[2] <= upload[2];
        }

        var uploadFailReason = {
            "invalid_content_size": "升级包长度不符合规格，请重新上传。", // the size of the image less than the required length
            "invalid_algorithm": "checksum算法未找到，请重试。", // checksum algorithm not found
            "invalid_checksum_size": "checksum数值不匹配，请重新上传。", // checksum field from the file less than the checksum length of the algorithm
            "invalid_checksum": "升级包的checksum数值与checksum算法结果不匹配，请重新上传。", // the checksum value from the image file doesn't match the calculated checksum
            "invalid_meta_info": "meta信息中升级包文件路径不是合法的json数据，请重新上传。",    // meta info path of the image file is not a valid json object
            "invalid_file_format": "升级包格式错误，请重新上传。", // the last two bytes of the image file doesn't match the spec value
            "disk_full": "磁盘空间不足，请清理磁盘空间后重试。", // disk space full
            "missing_version_info": "升级包版本信息缺失，请重新上传。", // the meta data doesn't have the required image version information
            "unable_to_read_file": "无法读取升级包文件，请重新上传。", // unable to read image
            "publish_error": "升级包文件下发出错，请重试。" // unable to publish image to the repository
        };
        vm.uploader.onSuccessItem = function (item, response) {
            if (response.error) {
                vm.uploadImageFail = uploadFailReason[response.reason] ? uploadFailReason[response.reason] : '服务无反应，请查看 LCD 屏幕报错信息。';
            }
            else if (vm.uploader.queue.length < 1) {
                vm.uploadImageFail = null;
                vm.uploadImageSuccess = false;
            }
            else {
                vm.uploadImageSuccess = true;
                vm.uploadedImage = vm.uploader.queue[0].file.name;
                uploadImageVersion = vm.uploadedImage.substr(3, 3);
                vm.uploadImageSuccess = compareVersion(currentImageVersion, uploadImageVersion);
                if (!vm.uploadImageSuccess) {
                    vm.uploadImageFail = '升级包版本低于当前系统版本，请重新上传。';
                }
            }
        };

        vm.cancelUpload = function (item) {
            item.cancel();
            vm.uploader.queue.splice(0, 1);
        };

        vm.uploader.onProgressItem = function (item) {
            apiInfo.getCurDate().then(function () {
                vm.uploadImageFail = '';
            }, function () {
                if (item.isUploading) {
                    vm.uploadImageFail = '网络异常，请确认网络连接。';
                }
            });
        };

        vm.uploader.onErrorItem = function (item, response) {
            if (response.error) {
                vm.uploadImageFail = uploadFailReason[response.reason] ? uploadFailReason[response.reason] : '升级包文档格式错误或上传时发生错误，请重新上传。';
            } else {
                vm.uploadImageFail = '服务无反应，无法上传文件。';
            }
            vm.uploadedImage = vm.uploader.queue > 0 ? vm.uploader.queue[0].file.name : null;
            vm.uploadImageSuccess = false;
        };
        vm.uploader.onBeforeUploadItem = vm.uploader.onabort = function () {
            vm.uploadImageFail = null;
            vm.uploadImageSuccess = false;
        };

        ////// get localTime and serverTime
        timerService.init();
        vm.updateTimer = function () {
            setTimeout(function () {
                vm.timerService = timerService;
                $scope.$apply(function () {
                    vm.serverTime = timerService.serverTime;
                    vm.localTime = timerService.localTime;
                });
                vm.updateTimer();
            }, 100);
        };
        vm.updateTimer();

        vm.updateTimeInput = function () {
            if (typeof vm.timeoutFn === 'undefined') {
                vm.timeoutFn = $interval(function () {
                    vm.systemDateInput = new Date(vm.localTime.getTime());
                    vm.systemTimeInput = new Date(vm.localTime.getTime());
                }, 100);
            }
        };

        vm.stopTimeout = function () {
            if (typeof vm.timeoutFn === 'object') {
                $interval.cancel(vm.timeoutFn);
                delete vm.timeoutFn;
            }
        };

        vm.validSystemTime = false;
        vm.systemDateInput = "";
        vm.systemTimeInput = "";
        vm.datePickerCtrl = {};
        vm.timePickerCtrl = {};
        vm.importLocalTime = function () {
            vm.systemDateInput = new Date(vm.localTime.getTime());
            vm.systemTimeInput = new Date(vm.localTime.getTime());
            vm.updateTimeInput();
        };
        vm.validateSystemTime = function () {
            vm.validSystemTime = false;
            if (typeof vm.systemTimeInput === 'object' && typeof vm.systemDateInput === 'object') {
                vm.validSystemTime = true;
            }
        };
        vm.disableNtpSubmit = false;
        if (vm.setActivateNtp) {
            vm.disableNtpSubmit = true;
        }
        $scope.$watchCollection('[sysconsole.setActivateNtp, sysconsole.validNtpIP]', function (newNames) {
            vm.disableNtpSubmit = true;
            if (newNames[0] && newNames[1]) {
                vm.disableNtpSubmit = false;
            }
            if (!vm.setActivateNtp) {
                vm.disableNtpSubmit = false;
            }
        });


        var mode = vm.mode = {};
        var ipMacBinding = vm.ipMacBinding = {};
        vm.validateIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        vm.editMode = {
            storage: false,
            security: false,
            ipaddress: false,
            ntpSync: false,
            encryption: false,
            iptraffic: false,
            maliciousdomainConf: false,
            scheduleDelete: false
        };
        vm.passwordComplexityStrategyArray = ["低", "中", "高"];

        System.getSystemStatus().then(function (data) {
            syslog.setting.ip = data.data.syslogIp;
            syslog.setting.port = data.data.syslogPort;
            syslog.setting.protocol = data.data.protocol;
            ipMacBinding.status = data.data.ipmacMode;
            ipMacBinding.action = data.data.action;
            mode.status = data.data.maintenanceMode;
            vm.compareVar = data.data;
            vm.hostName = data.data.hostName;
            vm.ipAddress = (data.data.mwIp && data.data.mwIp.length > 0 ? data.data.mwIp.substring(0, data.data.mwIp.length) : '0.0.0.0');
            vm.netMask = (data.data.netMask && data.data.netMask.length > 0 ? data.data.netMask.substring(0, data.data.netMask.length) : '255.255.255.0');
            vm.gateWay = (data.data.gateWay && data.data.gateWay.length > 0 ? data.data.gateWay.substring(0, data.data.gateWay.length) : '0.0.0.0');
            vm.preferDns = data.data.preferDns;
            vm.spareDns = data.data.spareDns;
            vm.originalIpAddress = vm.ipAddress;
            vm.originalNetMask = vm.netMask;
            vm.originalGateWay = vm.gateWay;
            vm.originHostName = vm.hostName;
            vm.originPreferDns = vm.preferDns;
            vm.originSpareDns = vm.spareDns;
            vm.ntpIp = data.data.ntpIp;
            vm.activateNtp = data.data.activateNtp ? '1' : '0';
            vm.setActivateNtp = data.data.activateNtp;
            vm.soundIncidents = vm.soundIncidents = data.data.soundIncidents;
            vm.soundEvents = vm.soundEvents = data.data.soundEvents;
            vm.soundMode = vm.soundMode = data.data.soundIncidents;
        });

        syslog.isEdited = false;
        syslog.errMsg = '';

        syslog.edit = function () {
            syslog.isEdited = true;
            syslog.editedSetting = angular.copy(syslog.setting);
        };

        syslog.done = function () {
            syslog.isEdited = false;
            syslog.setting.ip = syslog.editedSetting.ip;
            syslog.setting.port = syslog.editedSetting.port;
            syslog.setting.protocol = syslog.editedSetting.protocol;

            System.updateSyslog({
                syslogIp: syslog.setting.ip,
                syslogPort: syslog.setting.port,
                protocol: syslog.setting.protocol
            }).then(function (data) {
                console.log("syslog");
                console.log(data);
            });
        };

        syslog.cancel = function () {
            syslog.isEdited = false;
        };

        ipMacBinding.bind = function () {
            // ipMacBinding.status = !ipMacBinding.status;
            System.ipMac({
                systemSettingType: 'IPMAC',
                flag: ipMacBinding.status,
                action: ipMacBinding.action
            }).then(function (data) {
                vm.compareVar = data;
            });
            vm.showSuccessMessage = true;
            $timeout(function () {
                vm.showSuccessMessage = false;
            }, 3000);
        };

        var reset = vm.reset = {};
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

        reset.redirectToMainPage = function () {
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
                        reset.redirectToMainPage();
                    }
                }, function () {
                    if (!vm.isShowDisconnectModal) {
                        vm.showDisconnectModal();
                    }
                    reset.redirectToMainPage();
                });
            }, 5000);
        };

        reset.resetModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/systemconsole/reset-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, System) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    System.resetSystem().then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '系统会在十秒后开始恢复原厂设置。请稍等。。。'
                        });
                        $timeout(function () {
                            reset.redirectToMainPage();
                        }, 5000);
                    }, function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '恢复原厂设置失败。'
                        });
                    });
                    $modalInstance.close('done');
                };
            }
        };

        reset.restartModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/systemconsole/restart-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, System) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    System.restartSystem(topologyId.id).then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '系统会在十秒后开始重启。请稍等。。。'
                        });
                        $timeout(function () {
                            reset.redirectToMainPage();
                        }, 10000);
                    }, function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '系统重启失败！'
                        });
                    });
                    $modalInstance.close('done');
                };
            }
        };
        reset.shutdownModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/systemconsole/shutdown-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, System) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    System.shutdownSystem('0').then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '安全监管平台会在5秒后关机。'
                        });
                    }, function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '系统关机失败！'
                        });
                    });
                    $modalInstance.close('done');
                };
            }
        };

        mode.changeMode = function () {
            mode.status = !mode.status;
            System.updateMaintenance({
                systemSettingType: 'MAINTENANCE_MODE',
                flag: mode.status
            }).then(function (data) {
                console.log(data);
            });
        };

        function getStrategyInfo() {
            $q.all([System.getStrategyInfo(), System.getJobStrategyInfo('LOG_DELETION'), System.getJobStrategyInfo('MALICIOUS_DOMAIN_SCAN')]).then(function (data) {
                var strategyArr = data[0].data;
                strategyArr.forEach(function (el) {
                    if (el.strategyInfo.strategyCode === "STORAGE_MANAGEMENT") {
                        vm.storageStrategy = el;
                    } else if (el.strategyInfo.strategyCode === "MAX_LOGIN_TRY_MANAGEMENT") {
                        vm.maxLoginTimesStrategy = el;
                    } else if (el.strategyInfo.strategyCode === "ENCRYPTION_MANAGEMENT") {
                        vm.encryptionStrategy = el;
                        vm.encryptionStrategy.encryptionStrategyVal = vm.encryptionStrategy.strategyRules[0].ruleData;
                    } else if (el.strategyInfo.strategyCode === "PASSWORD_COMPLEXITY_MANAGEMENT") {
                        vm.passwordComplexityStrategy = el;
                        vm.changePasswordComplexityStrategyArray(el.strategyRules[0].ruleData);
                    } else if (el.strategyInfo.strategyCode === "TIMEOUT_MANAGEMENT") {
                        vm.timeoutStrategy = el;
                    } else if (el.strategyInfo.strategyCode === "IP_TRAFFIC_MANAGEMENT") {
                        vm.IPTrafficManagement = el;
                    } else if (el.strategyInfo.strategyCode === "IP_TRAFFIC_TOGGLE") {
                        vm.iptrafficConfSwitch = el;
                        vm.iptrafficConfSwitch.iptrafficConfSwitchVal = vm.iptrafficConfSwitch.strategyRules[0].ruleData === '1';
                    } else if (el.strategyInfo.strategyCode === "LOG_DELETION_MANAGEMENT") {
                        vm.logDeletionManagement = el;
                        vm.logDeletionManagementTmp = el.strategyRules[0].ruleData;
                    } else if (el.strategyInfo.strategyCode === "LOG_DELETION_TIME") {
                        vm.logDeletionTime = el;
                        var t = el.strategyRules[0].ruleData.split(":");
                        var d = new Date();
                        d.setHours(t[0]);
                        d.setMinutes(t[1]);
                        d.setSeconds(0);
                        d.setMilliseconds(0);
                        vm.logDeletionTimeTmp = d;
                    } else if (el.strategyInfo.strategyCode === "NOTIFICATION_MANAGEMENT") {
                        vm.notificationManagement = el;
                        vm.notificationManagementTmp = el.strategyRules[0].ruleData;
                        vm.setSoundModeTmp = el.strategyActions[0].actionData;
                        vm.notificationDropDown = true;

                        if (el.strategyRules[0].ruleData === "incident") {
                            vm.setSoundIncidents = true;
                            vm.setSoundEvents = false;
                        } else if (el.strategyRules[0].ruleData === "event") {
                            vm.setSoundIncidents = false;
                            vm.setSoundEvents = true;
                        } else if (el.strategyRules[0].ruleData === "incident_event") {
                            vm.setSoundEvents = true;
                            vm.setSoundIncidents = true;
                        } else {
                            vm.setSoundEvents = false;
                            vm.setSoundIncidents = false;
                            vm.setSoundModeTmp = "";
                            vm.notificationDropDown = false;
                        }
                    }
                });
                if (data[1].data) {
                    vm.logDeletionManagement = data[1].data;
                    vm.logDeletionManagementTmp = data[1].data.schedulingJob.jobData;
                    var d = moment.utc();
                    d.set('second', 0);
                    d.set('minute', data[1].data.schedulingJobMeta[0].minute);
                    d.set('hour', data[1].data.schedulingJobMeta[0].hour);
                    vm.logDeletionTimeTmp = new Date(moment(d.format()).format());
                }
                if (data[2].data) {
                    vm.maliciousdomainConf = data[2].data;
                    vm.maliciousdomainConfSwitchVal = vm.maliciousdomainConf.schedulingJob.jobData === 'true' ? true : false;
                    vm.maliciousdomainConfScanInterval = vm.maliciousdomainConf.schedulingJobMeta[0].minute.split('/')[1];
                }
            });
        }

        vm.validateNotificationDropDown = function () {
            if ((vm.setSoundEvents !== false || vm.setSoundIncidents !== false) && vm.setSoundModeTmp === '') {
                vm.notificationDropDown = true;
                vm.setSoundModeTmp = "visual";
            } else if (vm.setSoundEvents === false && vm.setSoundIncidents === false && vm.setSoundModeTmp !== '') {
                vm.setSoundModeTmp = "";
                vm.notificationDropDown = false;
            }
        };

        vm.editStorage = function () {
            vm.editMode.storage = !vm.editMode.storage;
        };

        vm.editSecurity = function () {
            vm.editMode.security = !vm.editMode.security;
        };

        vm.editIPAddress = function () {
            vm.editMode.ipaddress = !vm.editMode.ipaddress;
            vm.validateHostName(vm.hostName);
            vm.validatePlatformIP(vm.ipAddress);
            vm.validatePlatformNetMask(vm.netMask);
            vm.validatePlatformPreferDns(vm.preferDns);
            vm.validatePlatformSpareDns(vm.spareDns);
            //vm.validatePlatformGateWay(vm.gateWay);
        };
        vm.editNtpSync = function () {
            timerService.init();
            vm.serverTime = timerService.serverTime;
            // vm.systemDateInput = new Date(vm.serverTime.getTime());
            vm.updateTimer();
            vm.validSystemTime = false;
            vm.setActivateNtp = vm.activateNtp === '1';
            vm.editMode.ntpSync = !vm.editMode.ntpSync;
            vm.ntpIpEnter = vm.ntpIp;
            vm.validateNtpIP(vm.ntpIpEnter);
        };
        vm.editEncryption = function () {
            vm.editMode.encryption = !vm.editMode.encryption;
        };
        vm.editSoundOption = function () {
            vm.editMode.soundOption = !vm.editMode.soundOption;
        };
        vm.editIPTraffic = function () {
            vm.editMode.IPTraffic = !vm.editMode.IPTraffic;
        };
        vm.editMaliciousDomainConf = function () {
            vm.editMode.maliciousdomainConf = !vm.editMode.maliciousdomainConf;
        };
        vm.editScheduleDelete = function () {
            vm.editMode.scheduleDelete = !vm.editMode.scheduleDelete;
        };

        vm.changeIPTrafficStatus = function () {
            if (vm.iptrafficConfSwitch.iptrafficConfSwitchVal) {
                vm.iptrafficConfSwitch.strategyRules[0].ruleData = '1';
            } else {
                vm.iptrafficConfSwitch.strategyRules[0].ruleData = '0';
            }

            $q.all([
                System.updateIPTrafficInfo(vm.IPTrafficManagement.strategyRules[0]),
                System.updateIPTrafficInfo(vm.iptrafficConfSwitch.strategyRules[0])
            ]).then(function () {
                getStrategyInfo();
                vm.editIPTraffic();
            });
        };

        vm.changeMaliciousDomainConf = function () {
            vm.maliciousdomainConf.schedulingJob.jobData = vm.maliciousdomainConfSwitchVal;
            vm.maliciousdomainConf.schedulingJobMeta[0].minute = '0/' + vm.maliciousdomainConfScanInterval;
            System.updateStradegyJobBuilder(vm.maliciousdomainConf).then(function () {
                getStrategyInfo();
                vm.editMaliciousDomainConf();
            });
        };

        vm.changeStorageStatus = function () {
            System.updateStorageInfo(vm.storageStrategy.strategyRules[0]).then(function () {
                getStrategyInfo();
                vm.editStorage();
            }, function (error) {
                console.log(error);
            });
        };

        vm.changeIPAddress = function () {
            var ip_num = ipv4_to_num(vm.ipAddress);
            var subnet = ( (ipv4_to_num(vm.ipAddress)) & (ipv4_to_num(vm.netMask)) ) >>> 0;
            var broadcast = (subnet | (~ipv4_to_num(vm.netMask))) >>> 0;
            vm.validPlatformIP = (subnet < ip_num && ip_num < broadcast);
            if (vm.validPlatformIP && vm.validPlatformNetMask && vm.validPlatformGateWay && vm.validPreferDns && vm.validSpareDns && vm.validPlatformHostName) {

                vm.disableEditIPButton = true;
                System.updateIPAddress(vm.hostName, vm.ipAddress, vm.netMask, vm.gateWay, vm.preferDns, vm.spareDns).then(function () {
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

        vm.getInputDateTime = function () {
            var ret = "";
            if (typeof vm.systemDateInput === 'object' && typeof vm.systemTimeInput === 'object') {
                vm.systemDateInput.setHours(vm.systemTimeInput.getHours());
                vm.systemDateInput.setMinutes(vm.systemTimeInput.getMinutes());
                vm.systemDateInput.setSeconds(vm.systemTimeInput.getSeconds());
                ret = vm.systemDateInput.toISOString();
            } else if (typeof vm.systemDateInput === 'object') {
                vm.systemDateInput.setHours(vm.serverTime.getHours());
                vm.systemDateInput.setMinutes(vm.serverTime.getMinutes());
                vm.systemDateInput.setSeconds(vm.serverTime.getSeconds());
                ret = vm.systemDateInput.toISOString();
            } else if (typeof vm.systemTimeInput === 'object') {
                var temp = new Date(vm.serverTime.getTime());
                temp.setHours(vm.systemTimeInput.getHours());
                temp.setMinutes(vm.systemTimeInput.getMinutes());
                temp.setSeconds(vm.systemTimeInput.getSeconds());
                ret = temp.toISOString();
            } else {
                ret = timerService.serverTime.toISOString();
            }
            ret = ret.substring(0, 19) + "Z";
            return ret;
        };

        vm.systemTimeModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/systemconsole/systemTimeSetModal.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });
            modalInstance.result.then(function (ret) {
                if (ret) {
                    var time = vm.getInputDateTime();
                    if (time) {
                        System.setSystemTime(time).then(function () {
                            System.updateNtpSync(vm.ntpIp, false);
                            $rootScope.timeoutPromise = $interval(function () {
                                apiInfo.sysbaseinfo().then(function () {
                                    $interval.cancel($rootScope.timeoutPromise);
                                    window.location.reload();
                                });
                            }, 10000, 12);
                        }, function (error) {
                            console.log(error.data.error);
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '时钟同步设置失败！'// + error.data.error
                            });
                        });
                    }
                }
            });

            function ModalInstanceCtrl($scope, $modalInstance) {
                $scope.cancel = function () {
                    $modalInstance.close(false);
                };
                $scope.confirm = function () {
                    $modalInstance.close(true);
                };
            }
        };


        vm.changeNtpSync = function () {
            if (vm.setActivateNtp) {
                $rootScope.timeoutPromise = System.updateNtpSync(vm.ntpIpEnter, vm.setActivateNtp).then(function () {
                    System.getSystemStatus().then(function (data) {
                        vm.ntpIp = data.data.ntpIp;
                        vm.activateNtp = data.data.activateNtp ? '1' : '0';
                        vm.setActivateNtp = true;
                        vm.editMode.ntpSync = !vm.editMode.ntpSync;
                    });

                }, function (error) {
                    console.log(error.data.error);
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '时钟同步设置失败！'// + error.data.error
                    });
                });
            } else {
                //set system time manually
                vm.systemTimeModal();
            }
        };
        vm.changeEncryption = function () {
            System.updateStrategyInfo(vm.encryptionStrategy.strategyRules[0]).then(function () {
                getStrategyInfo();
                vm.editEncryption();
            }, function (error) {
                console.log(error);
            });
        };
        /*
         * Map: Store possible values for vm.notificationManagementTmp.
         * to translate vm.notificationManagementTmp to Chinese to display in ui.
         * (Shawn)
         */
        vm.soundSettingsMap = {
            incident: '安全事件',
            incident_event: '安全和系统事件'
        };
        vm.changeSoundOption = function () {
            /*
             *  SET DIRECTLY IN THE UI, MODEL = notificationManagementTmp (Shawn)
             */

            //if(vm.setSoundEvents && vm.setSoundIncidents){
            //  vm.notificationManagementTmp = "incident_event";
            //} else if (vm.setSoundEvents && !vm.setSoundIncidents) {
            //  vm.notificationManagementTmp = "event";
            //} else if (!vm.setSoundEvents && vm.setSoundIncidents) {
            //  vm.notificationManagementTmp = "incident";
            //} else if (!vm.setSoundEvents && !vm.setSoundIncidents) {
            //  vm.notificationManagementTmp = "";
            //}

            vm.notificationManagement.strategyRules[0].ruleData = vm.notificationManagementTmp;
            vm.notificationManagement.strategyActions[0].actionData = vm.setSoundModeTmp;

            $q.all([System.updateSystemConsoleAction(vm.notificationManagement.strategyActions[0]), System.updateSystemConsoleInfo(vm.notificationManagement.strategyRules[0])]).then(function () {
                vm.editSoundOption();
                getStrategyInfo();
            });


            //Call proper API
//          System.updateNtpSync(vm.ntpIpEnter, vm.setActivateNtp).then(function(){
//            System.getSystemStatus().then(function (data) {
//              vm.soundIncidents = data.data.soundIncidents;
//              vm.soundEvents = data.data.soundEvents;
//              vm.soundMode = data.data.soundIncidents;
//              Enum.set("soundMode", vm.soundMode==="true");
//              Enum.set("InciStatus", vm.soundIncidents);
//              Enum.set("EveStatus", vm.soundEvents);
//              vm.editSoundOption();
//            });
//          }, function() {
//            $rootScope.addAlert({
//              type: 'danger',
//              content: '事件通知设置失败！'// + error.data.error
//            });
//          });

            console.log(vm.notificationManagement);
        };

        vm.changeScheduleDelete = function () {
            vm.logDeletionManagement.schedulingJob.jobData = vm.logDeletionManagementTmp;
            vm.logDeletionTimeTmp.setHours(vm.logDeletionTimeTmp.getHours() + Math.round(vm.logDeletionTimeTmp.getTimezoneOffset() / 60));
            vm.logDeletionManagement.schedulingJobMeta[0].hour = vm.logDeletionTimeTmp.getHours().toString();
            vm.logDeletionManagement.schedulingJobMeta[0].minute = vm.logDeletionTimeTmp.getMinutes().toString();
            $q.all([
                System.updateStradegyJobBuilder(vm.logDeletionManagement)
            ]).then(function () {
                getStrategyInfo();
                vm.editScheduleDelete();
            });
        };

        vm.changeSecurityStatus = function () {
            $q.all([
                System.updateStorageInfo(vm.maxLoginTimesStrategy.strategyRules[0]),
                System.updateStorageInfo(vm.passwordComplexityStrategy.strategyRules[0]),
                System.updateStorageInfo(vm.timeoutStrategy.strategyRules[0])
            ]).then(function () {
                getStrategyInfo();
                vm.editSecurity();
            });
        };

        vm.cancelIPTrafficStatus = function () {
            getStrategyInfo();
            vm.editIPTraffic();
        };

        vm.cancelMaliciousDomainConf = function () {
            getStrategyInfo();
            vm.editMaliciousDomainConf();
        };

        vm.cancelStorageStatus = function () {
            getStrategyInfo();
            vm.editStorage();
        };

        vm.cancelSecurityStatus = function () {
            getStrategyInfo();
            vm.editSecurity();
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

        vm.validateNtpIP = function (ip) {
            vm.validNtpIP = ip && !formatVal.validateIp(ip) && ip !== "0.0.0.0" && ip !== "255.255.255.255";
        };


        vm.cancelNtpSync = function () {
            vm.setActivateNtp = vm.activateNtp === '1';
            vm.datePickerCtrl.clearDate();
            vm.timePickerCtrl.clearDate();
            vm.stopTimeout();
            vm.systemDateInput = "";
            vm.systemTimeInput = "";
            vm.editMode.ntpSync = !vm.editMode.ntpSync;
            // vm.editNtpSync();
        };

        vm.cancelEncryption = function () {
            vm.editEncryption();
            getStrategyInfo();
        };

        vm.cancelSoundOption = function () {
            vm.editSoundOption();
            getStrategyInfo();
        };

        vm.cancelScheduleDelete = function () {
            getStrategyInfo();
            vm.editScheduleDelete();
        };

        vm.changePasswordComplexityStrategyArray = function (data) {
            var passwordCom = [
                {
                    'name': '低',
                    'message': '任意字母、数字或字符，8位或以上，25位以下'
                }, {
                    'name': '中',
                    'message': '必须是字母加数字和符号，8位或以上，25位以下'
                }, {
                    'name': '高',
                    'message': '必须是字母加数字和符号，12位或以上，25位以下'
                }
            ];

            //console.log(data);

            passwordCom.forEach(function (el) {
                if (el.name === data) {
                    vm.passwordComplexityStrategyMessage = el.message;
                }
            });
        };

        vm.syncDataToAllInOne = function () {
            System.syncDataToAllInOne().then(function () {
                $rootScope.addAlert({
                    type: 'success',
                    content: '用户信息同步请求已经成功发送给一体机，请稍后在一体机上确认。'
                });
            }, function (error) {
                console.log(error);
                $rootScope.addAlert({
                    type: 'danger',
                    content: '用户信息同步失败！'
                });
            });
        };

        getStrategyInfo();

//  =============================================== upgrade system section ======================================================

        vm.showUpgradeConfirmationModal = function () {
            var upgradeConfirmationModal = $modal.open({
                templateUrl: 'templates/setting/systemconsole/upgrade-modal.html',
                controller: upgradeConfirmationCtrl,
                windowClass: 'upgrade-modal-window'
            });

            // TODO: REMOVE SIMULATE UPGRADE START WHEN API WORKS


            upgradeConfirmationModal.result.then(function (msg) {
                if (msg === 'confirmed') {
                    vm.confirmSystemUpgrade();
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function upgradeConfirmationCtrl($scope, $modalInstance) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    $scope.upgradeStarting = true;
                    $modalInstance.close('confirmed');
                };
            }
        };

        vm.confirmSystemUpgrade = function () {
            var upgradeConfirmationModal = $modal.open({
                templateUrl: 'templates/setting/systemconsole/upgrade-progress-modal.html',
                controller: upgradeModalInstanceCtrl,
                windowClass: 'upgrade-progress-modal-window',
                keyboard: false
            });

            upgradeConfirmationModal.result.then(function (msg) {
                console.log(msg);
                vm.showUpgradeResponseModal(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function upgradeModalInstanceCtrl($modalInstance, System) {
                if (vm.isUpgrading) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '系统正在升级, 请稍后再试。'
                    });
                    $modalInstance.dismiss('cancel');
                } else {
                    // upgrade_getDpiData().then(function () {
                    //     if (vm.onlineDPISN.length === 0) {
                    //         $rootScope.addAlert({
                    //             type: 'danger',
                    //             content: '没有在线设备, 无法升级。'
                    //         });
                    //         $modalInstance.dismiss('cancel');
                    //     } else {
                        System.getSerialNumber().then(function(response) {
                            var serialNumber = response.data.serialNumber;
                            System.startUpgradeAllinOne(serialNumber).then(function (response) {
                                //console.log(response);
                                $timeout(function () {
                                    $modalInstance.close({complete: !response.error, taskId: response.data.taskId});
                                }, 5000);
                            }, function () {
                                $timeout(function () {
                                    $modalInstance.close({complete: false});
                                }, 5000);
                            });
                    //     }
                    });
                }
            }

        };


        vm.showUpgradeResponseModal = function (response) {
            $modal.open({
                templateUrl: 'templates/setting/systemconsole/upgrade-response.html',
                controller: upgradeResponseCtrl,
                windowClass: 'upgrade-progress-modal-window',
                keyboard: false,
                resolve: {
                    upgradeInformation: function () {
                        return response;
                    }
                }
            });

            function upgradeResponseCtrl($scope, $modalInstance, upgradeInformation) {
                $scope.upgradeInformation = upgradeInformation;
                //console.log(upgradeInformation);
                if (upgradeInformation.complete) {
                    // ping MW until response is received, then refresh ui.
                    // follow taskId to get upgrading info
                    var deferred = $q.defer();
                    $rootScope.deployTaskPromise = deferred.promise;

                    $rootScope.$on('dpiUpgradeState', function () {
                        Task.getTask(upgradeInformation.taskId).then(function (data) {
                            //console.log(data.data);
                            if (data.data.state === 'SUCCESS') {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '部署成功'
                                });
                                deferred.resolve('success');

                                // Success, start to restart. ping till mw come back online
                                $timeout(function () {
                                    var pingMW = setInterval(function () {
                                        apiInfo.sysbaseinfo().then(function (response) {
                                            if (response.status === 200) {
                                                window.location.href = '/';
                                                clearInterval(pingMW);
                                            }
                                        });
                                    }, 5000);
                                }, 5000);
                            } else if (data.data.state === 'FAILED') {
                                deferred.resolve('fail');
                            }
                        });
                    });
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        };


        vm.upgradeInfo = function () {
            var filterString = "";
            for (var n = 0; n < vm.onlineDPISN.length; n++) {
                filterString += 'serialNumber=' + vm.onlineDPISN[n] + '&';
            }
            filterString = filterString ? filterString.substring(0, filterString.length - 1) : "";
            filterString += '&$orderby=deviceId';
            //console.log(filterString);
            if (filterString) {
                return System.getDPIUpgradeInfo(filterString).then(function (data) {
                    vm.upgradingDPIinfo = data.data;
                    if (vm.upgradingDPIinfo) {
                        vm.isUpgrading = (vm.upgradingDPIinfo.filter(function (a) {
                            return (a.state !== 'NONE' || (a.state === 'NONE' && a.percentage !== 0 && a.percentage !== 100)) && !a.error;
                        })[0]) ? true : false;
                    } else {
                        vm.upgradingDPIinfo = [];
                        vm.isUpgrading = false;
                    }
                    return vm.isUpgrading;
                });
            } else {
                vm.upgradingDPIinfo = [];
                vm.isUpgrading = false;
                return vm.isUpgrading;
            }
        };

        function tabEnabled(tabName) {
            if (auth.getUserType() !== 1 && $rootScope.centraliztion) {
                return tabName === "RUNNING_MODE";
            }
            return true;
        }

        vm.tabEnabled = tabEnabled;

        function upgrade_getDpiData() {
            var params = {};
            var filter = 'category eq SECURITY_DEVICE';
            var fullDeviceAccess = Enum.get('Role');
            if (!fullDeviceAccess[0].defaultRole) {
                var visibleDevice = Enum.get('deviceAccess');
                if (visibleDevice.length) {
                    filter += " and (";
                    filter += visibleDevice.map(function (field) {
                        return "contains(deviceId, '" + field + "')";
                    }).join(' or ');
                    filter += ")";
                } else {
                    filter += " and (contains(deviceId, 'null'))";
                }
            }

            params['$filter'] = filter;
            params['$orderby'] = 'deviceId';

            return Device.getAll(params).then(function (data) {
                vm.dpiData = data;
                vm.onlineDPISN = [];
                for (var i = 0; i < vm.dpiData.length; i++) {
                    vm.dpiData[i].deviceOnline === 1 && vm.dpiData[i].deviceSource === 'DISCOVERY' && vm.onlineDPISN.push(vm.dpiData[i].serialNumber);
                }
                return vm.upgradeInfo().then(function () {
                    for (var i = 0; i < vm.dpiData.length; i++) {
                        var deviceUpgradeInfo;
                        for (var j = 0; j < vm.upgradingDPIinfo.length; j++) {
                            if (vm.dpiData[i].deviceId === vm.upgradingDPIinfo[j].deviceId) {
                                deviceUpgradeInfo = vm.upgradingDPIinfo[j];
                                break;
                            }
                        }
                        vm.dpiData[i].isUpgrading = (!deviceUpgradeInfo) || !((deviceUpgradeInfo.state === "NONE" && (deviceUpgradeInfo.percentage === 0 || deviceUpgradeInfo.percentage === 100)) || deviceUpgradeInfo.error);
                    }
                });
            });
        }


    }
})();
