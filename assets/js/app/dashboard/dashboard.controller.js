/**
 * Dashboard Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.dashboard')
        .controller('DashboardCtrl', DashboardCtrl);


    function DashboardCtrl($cookieStore, $state, $scope, $rootScope, $timeout, $q,  evtCnt, topologyId, $modal, auth,  sse, Alarm, apiInfo, debounce, Enum, domain, SystemUser) {
        var vm = this;
        vm.topoName = '';
        vm.policyName = '';
        vm.isRootUser = false;
        vm.alarms = {
            list: null,
            countNew: 0
        };

        vm.isMyAccountAvailable = false;

        var isSettingAvailable = $rootScope.rootMenu.getChild("SETTING");

        if (isSettingAvailable !== undefined && isSettingAvailable !== null) {
            isSettingAvailable = isSettingAvailable.getChilds();

            isSettingAvailable = isSettingAvailable.filter(function (m) {
                return m.state === "setting.myaccount";
            });

            vm.isMyAccountAvailable = isSettingAvailable !== undefined && isSettingAvailable !== null && isSettingAvailable.length > 0;
        }

        //vm.isdomain = $state.current.name.split('_')[0] === "domain";
        //
        //var firstMenusName = $state.current.name.split('_')[0];

        //vm.expanded = localStorage.getItem(firstMenusName + ':navbar:expanded') === 'true' ? true : false;
        //
        //vm.toggleExpand = function () {
        //    vm.expanded = !vm.expanded;
        //    localStorage.setItem(firstMenusName + ':navbar:expanded', vm.expanded);
        //};


        //vm.subMenus = $rootScope.rootMenu.getChildByState($state.current.name.split('_')[0]);

        vm.isActive = function (tab) {
            return $state.current.name.indexOf(tab.getState().split('_')[0]) === 0;
        };

        //vm.isSubActive = function (tab) {
        //    return $state.current.name.indexOf(tab.getState()) > -1;
        //};

        //System.getStrategyInfo().then(function (data) {
        //    var soundSetting = data.data.filter(function (d) {
        //        return d.strategyInfo.strategyCode === "NOTIFICATION_MANAGEMENT";
        //    });
        //    //console.log(soundSetting[0]);
        //    vm.soundIncidents = soundSetting[0].strategyRules[0].ruleData === "incident_event" || soundSetting[0].strategyRules[0].ruleData === "incident";
        //    vm.soundEvents = soundSetting[0].strategyRules[0].ruleData === "incident_event" || soundSetting[0].strategyRules[0].ruleData === "event";
        //    vm.soundMode = soundSetting[0].strategyActions[0].actionData === "visual_audio";
        //    Enum.set("soundMode", vm.soundMode === false);
        //    Enum.set("InciStatus", vm.soundIncidents);
        //    Enum.set("EveStatus", vm.soundEvents);
        //})

        //if (Enum.get('privilege')) {
        //    vm.isUserManager = Enum.get('privilege').filter(function (a) {
        //        return a.name === 'USER_MANAGEMENT';
        //    });
        //    if (vm.isUserManager && vm.isUserManager.length) {
        //        vm.isUserManager = vm.isUserManager[0].actionValue !== 1;
        //    }
        //}

        //var todolist_params = [];
        //todolist_params['$filter'] = "todoListStatus eq PENDING";
        //Dashboard.getTodoList(todolist_params).then(function (data) {
        //    vm.todolistNum = data.length;
        //});
        //
        //$rootScope.$on('todolist_reduce', function () {
        //    vm.todolistNum--;
        //});
        //$rootScope.$on('todolist_refresh', function (event, data) {
        //    vm.todolistNum = data;
        //});

        //vm.uiEnable = function (target, lv) {
        //    return uiCtrl.isShow(target, lv);
        //};
        //vm.contentEnable = function (target) {
        //    return uiTree.getContentShow(target);
        //};
        vm.showVersionModal = function () {
            var versionModalInstance = $modal.open({
                templateUrl: 'templates/dashboard/version-modal.html',
                controller: versionModalInstanceCtrl,
                backdropClass: 'version-modal-backdrop',
                backdrop:true,
                windowClass: 'version-modal-window'
            });

            versionModalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function versionModalInstanceCtrl($scope, $modalInstance) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    $modalInstance.close('done');
                };
            }
        };

        function updateTopoAndPolicyName() {
            getRedDot();
            getAlarms();
        }

        $rootScope.$$listeners['updateDashboardHeader'] = [];
        $rootScope.$on('updateDashboardHeader', function () {
            updateTopoAndPolicyName();
        });

        $rootScope.userlock = localStorage.getItem('lockUser');
        if ($rootScope.VERSION_NUMBER) {
            vm.lockShow = ($rootScope.VERSION_NUMBER.slice(-4) === '-C05');
        }

        //updateTopoAndPolicyName();

        //var curPrivilege = $rootScope.currentState ? $rootScope.currentState : uiTree.getPrivilegeByUIrouteState($state.current.name);
        //var page = {
        //    privilege: curPrivilege,
        //    curState: $state.current.name,
        //    state: $state.current.name,
        //    isLogin: false
        //};
        //var oldPrivilege = Enum.get('privilege').filter(function (a) {
        //    return a.name === 'SETTINGS_POLICY';
        //});
        //if (!($rootScope.customizedMenus.length && oldPrivilege && oldPrivilege.length)) {
        //    $rootScope.versionError = true;
        //    $state.transitionTo("myaccount");
        //} else {
        //    uiCtrl.teleport(page);
        //}

        vm.getClass = function () {
            var currentName = $state.current.name;
            return 'page-' + currentName.replace(/\./g, '-');
        };


        // Enable 1st lv menu based on itself or its children

        //vm.isGrant = function (state) {
        //    var level;
        //    if (state === 'REAL_TIME_PROTECTION') {
        //        level = Enum.get('privilege').filter(function (a) {
        //            return a.name === state;
        //        });
        //        level = (level && level[0]) ? level[0].actionValue : 2; //Set default action is "allow"
        //        return level > 1 || vm.isGrant('INCIDENT') || vm.isGrant('EVENT') || vm.isGrant('LOG_MANAGEMENT') || vm.isGrant('DEVICE_MANAGEMENT');
        //    } else if (state === 'POLICY') {
        //        level = Enum.get('privilege').filter(function (a) {
        //            return a.name === state;
        //        });
        //        level = (level && level[0]) ? level[0].actionValue : 2; //Set default action is "allow"
        //        return level > 1 || vm.isGrant('BLACKLIST') || vm.isGrant('WHITELIST') || vm.isGrant('IP_MAC');
        //    } else if (state === 'SETTINGS_POLICY') {
        //        level = Enum.get('privilege').filter(function (a) {
        //            return a.name === state;
        //        });
        //        level = (level && level[0]) ? level[0].actionValue : 2; //Set default action is "allow"
        //        return level > 1 || vm.isGrant('SETTINGS_IP_LOGIN') || vm.isGrant('SETTINGS_PROTOCOL') || vm.isGrant('SETTINGS_PLATFORM_REBOOT') || vm.isGrant('SETTINGS_PLATFORM_UPGRADE_RESET') || vm.isGrant('SETTINGS_DPI_REBOOT') || vm.isGrant('SETTINGS_DPI_UPGRADE_RESET');
        //    } else {
        //        level = Enum.get('privilege').filter(function (a) {
        //            return a.name === state;
        //        });
        //        level = (level && level[0]) ? level[0].actionValue : 2; //Set default action is "allow"
        //        return level > 1;
        //    }
        //};
        // Decide target page for 1st lv menu:
        //vm.targetUrl = function (tab) {
        //    if (tab.getPrivilege() === 'REAL_TIME_PROTECTION') {
        //        var level = Enum.get('privilege').filter(function (a) {
        //            return a.name === tab.getPrivilege();
        //        });
        //        level = (level && level[0]) ? level[0].actionValue : 2; //Set default action is "allow"
        //        if (level > 1) {
        //            return 'monitor.overview';
        //        } else if (vm.isGrant('INCIDENT') || vm.isGrant('EVENT')) {
        //            return 'monitor.event';
        //        } else if (vm.isGrant('LOG_MANAGEMENT')) {
        //            return 'monitor.logger';
        //        } else if (vm.isGrant('DEVICE_MANAGEMENT')) {
        //            return 'monitor.device';
        //        } else {
        //            return 'invalidUrl';
        //        }
        //    } else if (tab.getPrivilege() === 'POLICY') {
        //        if (vm.isGrant('BLACKLIST')) {
        //            return 'rule.blacklist';
        //        } else if (vm.isGrant('WHITELIST')) {
        //            return 'rule.whitelist';
        //        } else if (vm.isGrant('IP_MAC')) {
        //            return 'rule.ipmac';
        //        } else {
        //            return 'invalidUrl';
        //        }
        //    } else if (tab.getPrivilege() === 'REPORT') {
        //        if (vm.isGrant('INCIDENT') || vm.isGrant('EVENT')) {
        //            return 'report.event';
        //        } else if (vm.isGrant('LOG_MANAGEMENT')) {
        //            return 'report.logger';
        //        } else if (vm.isGrant('AUDIT_MANAGEMENT')) {
        //            return 'report.protocol';
        //        } else {
        //            return 'invalidUrl';
        //        }
        //    } else if (tab.getPrivilege() === 'SETTINGS_POLICY') {
        //        var system_management_enabled = Enum.get('privilege').filter(function (a) {
        //            return a.name === 'SETTINGS_POLICY';
        //        });
        //        system_management_enabled = (system_management_enabled && system_management_enabled[0]) ? system_management_enabled[0].actionValue : 2; //Set default action is "allow"
        //        if (system_management_enabled > 1 || vm.isGrant('SETTINGS_PLATFORM_REBOOT') || vm.isGrant('SETTINGS_PLATFORM_UPGRADE_RESET') || vm.isGrant('SETTINGS_IP_LOGIN') || vm.isGrant('SETTINGS_PROTOCOL')) {
        //            return 'setting.systemconsole';
        //        } else if (vm.isGrant('SETTINGS_DPI_REBOOT') || vm.isGrant('SETTINGS_DPI_UPGRADE_RESET')) {
        //            return 'setting.systemdevice';
        //        }
        //    } else {
        //        return tab.getOptions() && tab.getOptions().url_state ? tab.getOptions().url_state : tab.getState();
        //    }
        //};

        vm.getTargetUrl = function (tab) {
            // console.log($rootScope.customMenuTree);
            var menus = $rootScope.rootMenu.getChilds();
            for (var i = 0; i < menus.length; i++) {
                var tmp = menus[i];
                if (tmp.target === tab.target) {
                    var secondMenus = tmp.getChilds();
                    if (secondMenus && secondMenus !== [] && secondMenus.length > 0) {
                        var menuUrl = secondMenus[0];
                        if (!menuUrl.getChilds() || menuUrl.getChilds() === [] || menuUrl.getChilds().length === 0) {
                            return menuUrl.state;
                        }
                        else {
                            return menuUrl.getChilds()[0].state;
                        }
                    }
                    else {
                        return tmp.state;
                    }
                    //if (tmp.subArr && tmp.state !== 'detect') {
                    //    if (tmp.state === 'setting' && tmp.subArr[0].state === 'domain') {
                    //        return 'myaccount';
                    //    }
                    //    var subState = "";
                    //    for (var idx in tmp.subArr) {
                    //        if (tmp.subArr[idx].active) {
                    //            subState = tmp.subArr[idx].state;
                    //            break;
                    //        }
                    //    }
                    //    return tmp.state + '.' + subState;
                    //} else {
                    //    return vm.targetUrl(tab);
                    //}
                }
            }
            return 'myaccount';
        };

        // Decide target page for 1st lv menu:

        //vm.targetUrl = function (tab) {
        //    if (tab.getPrivilege() === 'REAL_TIME_PROTECTION') {
        //        var level = Enum.get('privilege').filter(function (a) {
        //            return a.name === tab.getPrivilege();
        //        });
        //        level = (level && level[0]) ? level[0].actionValue : 2; //Set default action is "allow"
        //        if (level > 1) {
        //            return 'monitor.overview';
        //        } else if (vm.isGrant('INCIDENT') || vm.isGrant('EVENT')) {
        //            return 'monitor.event';
        //        } else if (vm.isGrant('LOG_MANAGEMENT')) {
        //            return 'monitor.logger';
        //        } else if (vm.isGrant('DEVICE_MANAGEMENT')) {
        //            return 'monitor.device';
        //        } else {
        //            return 'invalidUrl';
        //        }
        //    } else if (tab.getPrivilege() === 'POLICY') {
        //        if (vm.isGrant('BLACKLIST')) {
        //            return 'rule.blacklist';
        //        } else if (vm.isGrant('WHITELIST')) {
        //            return 'rule.whitelist';
        //        } else if (vm.isGrant('IP_MAC')) {
        //            return 'rule.ipmac';
        //        } else {
        //            return 'invalidUrl';
        //        }
        //    } else if (tab.getPrivilege() === 'REPORT') {
        //        if (vm.isGrant('INCIDENT') || vm.isGrant('EVENT')) {
        //            return 'report.event';
        //        } else if (vm.isGrant('LOG_MANAGEMENT')) {
        //            return 'report.logger';
        //        } else if (vm.isGrant('AUDIT_MANAGEMENT')) {
        //            return 'report.protocol';
        //        } else {
        //            return 'invalidUrl';
        //        }
        //    } else if (tab.getPrivilege() === 'SETTINGS_POLICY') {
        //        var system_management_enabled = Enum.get('privilege').filter(function (a) {
        //            return a.name === 'SETTINGS_POLICY';
        //        });
        //        system_management_enabled = (system_management_enabled && system_management_enabled[0]) ? system_management_enabled[0].actionValue : 2; //Set default action is "allow"
        //        if (system_management_enabled > 1 || vm.isGrant('SETTINGS_PLATFORM_REBOOT') || vm.isGrant('SETTINGS_PLATFORM_UPGRADE_RESET') || vm.isGrant('SETTINGS_IP_LOGIN') || vm.isGrant('SETTINGS_PROTOCOL')) {
        //            return 'setting.systemconsole';
        //        } else if (vm.isGrant('SETTINGS_DPI_REBOOT') || vm.isGrant('SETTINGS_DPI_UPGRADE_RESET')) {
        //            return 'setting.systemdevice';
        //        }
        //    } else {
        //        return tab.getOptions() && tab.getOptions().url_state ? tab.getOptions().url_state : tab.getState();
        //    }
        //};


        vm.isBlurred = function (state) {
//          console.log(topologyId.hasNode);
//          console.log(state);
            return state === 'other' || (!topologyId.hasNode && state !== 'topology' && state !== 'detect' && state !== 'conduct' && state !== 'domain' && state !== 'setting' && state !== 'asset');
        };

        vm.menuEnabled = function (item) {
            //if (item.ifDisabledByVersion()) {
            //    return false;
            //} else if (item.isDisabledBySetting()) {
            //    return false;
            //} else
            if ($rootScope.rootMenu) {
                for (var i = 0; i < $rootScope.rootMenu.getChilds().length; i++) {
                    //var tmp = $rootScope.parsedMenu[0][i];
                    if (item.target === $rootScope.rootMenu.getChilds()[i].target) {
                        return true;
                    }
                }
            }
            return false;
        };
        vm.expanded = localStorage.getItem('navbar:expanded') === 'true' ? true : false;

        //
        //vm.uiEnable = function (target, lv) {
        //    return uiCtrl.isShow(target, lv);
        //};
        vm.closeOtherSecondLvMenu = function () {
            $rootScope.rootMenu.getChildByState($state.current.name.split('.')[0]).getChilds().forEach(function (item) {
                item.expanded = false;
            });
        };
        vm.toggleExpand = function (expand) {
            if (expand !== undefined) {
                vm.expanded = expand;
            } else {
                vm.expanded = !vm.expanded;
            }
            if (vm.expanded) {
                //    收起时收起所有二级菜单
                vm.closeOtherSecondLvMenu();
            } else if (expand !== false) {
                $rootScope.rootMenu.getChildByState($state.current.name.split('.')[0]).getChildByState($state.current.name.split('.')[0] + '.' + $state.current.url.split('/')[1]).expanded = true;
            }
            localStorage.setItem('navbar:expanded', vm.expanded);
        };

        $rootScope.displaySubMenus = function (tab, expand) {
            if (expand) {
                return false;
            }
            tab.getSiblings().forEach(function (item) {
                // 展开一个二级菜单时收起相邻的其他二级菜单
                item.expanded = false;
            });
            tab.expanded = !tab.expanded;
        };

        $rootScope.subMenusSelected = function (tab, expand) {
            if (expand) {
                return false;
            }
            if (tab.expanded) {
                return $rootScope.isSubMenusActive(tab);
            }
            return false;
        };

        $rootScope.isSubMenusActive = function (tab) {
            return _.some(tab.getChilds(), function (item) {
                return $state.current.name.indexOf(item.getState()) === 0 && item.getState().indexOf('.') > 0;
            });
        };

        vm.logout = auth.logout;

        vm.userRole = auth.getUserRole();

        vm.user = function () {
            if (auth.getUserName() === "admin") {
                return "管理员";
            }
            if (auth.getUserType() === 1) {
                vm.isRootUser = true;
            } else {
                vm.isRootUser = false;
            }
            return auth.getUserName();
        };

        vm.updateAlarms = function () {
            if (vm.alarms.countNew) {
                Alarm.update();
            }
        };

        $rootScope.openHelp = function () {
            //Get Help Id:
            /*var helpId = "";
            var url = document.URL;
            var pos = url.indexOf('/') + 2;
            url = url.slice(pos);
            pos = url.indexOf('/') + 1;
            url = url.slice(pos);

            pos = url.indexOf('/');
            if (pos > -1) {
                helpId = url.slice(0, pos);
                url = url.slice(pos + 1);
                if (url.length > 0) {
                    pos = url.indexOf('/');
                    if (pos > -1) {
                        helpId += "_";
                        helpId += url.slice(0, pos);
                    } else {
                        helpId += "_";
                        helpId += url;
                    }
                }
            } else {
                helpId = url;
            }
            window.open("/help/index.html?id=" + helpId, "_target");*/
            console.log('openHelp', $state.current.name);
            window.open('/help/index.html?' + $state.current.name.replace(/\./g, '_') + '.html');
        };

        vm.keepAlive = function () {
            SystemUser.keepAlive();
            if ($rootScope.userlock === '1') {
                $timeout(vm.keepAlive, 4 * 60000);
            }
        };

        vm.lockUsr = function () {
            localStorage.setItem('lockUser', '1');
            $rootScope.userlock = '1';
            vm.keepAlive();
        };

        vm.unKeyPress = function (code) {
            if (code) {
                vm.error = '';
            }
        };

        vm.pwKeyPress = function (code) {
            if (code === 13) {
                vm.unlockUsr();
            } else {
                vm.error = '';
            }
        };

        vm.unlockUsr = function () {
            vm.usr.username = auth.getUserName();
            auth.unlockUser(vm.usr).then(function () {
                localStorage.setItem('lockUser', '0');
                $rootScope.userlock = '0';
                vm.usr = {};
            }, function () {
                vm.error = '密码错误';
            });
        };

        var updateEvents = debounce(function (data) {
            $rootScope.redDot = true;
            $rootScope.$broadcast('incoming', data);
        }, 3000);


        $scope.$on('incoming', function (event, data) {
            incomingAlert(data);
        });

        vm.soundOptionCheck = function () {
            $rootScope.soundOff = Enum.get("soundMode");
            vm.receiveIncidents = Enum.get("InciStatus");
            vm.receiveEvents = Enum.get("EveStatus");
        };

        function incomingAlert() {
            if ((Date.now() - $rootScope.lastIncidentRecieved) >= 60000 || !$rootScope.lastIncidentRecieved) {
                vm.soundOptionCheck();
                if (!$rootScope.soundOff) {
                    var audio = new Audio('images/sound/alert.mp3');
                    audio.play();
                }
                $rootScope.lastIncidentRecieved = Date.now();
                vm.flashes = 1;
                setTimeout(function () {
                    delete vm.flashes;
                    $scope.$digest();
                }, 5000);
                $scope.$digest();
            }
        }

        //if ($rootScope.customizedMenusFailed) {
        //    var msg = {
        //        'type': 'error',
        //        'content': '自定义菜单出现错误, 请联系系统管理员',
        //        'ip': ''
        //    };
        //    $rootScope.stayAlert(msg);
        //}

        sse.listen('UPDATE', $scope, function (data) {
            if (data.sseType === 'INCIDENT') {
                $rootScope.$broadcast('newIncidentInsert', data.content);
                updateEvents(data.content);
                vm.newEventSSE = true;
            } else if (data.sseType === 'EVENT') {
                if (data.content.action === 'insert') {
                    $rootScope.$broadcast('newEventInsert', data.content);
                }
                updateEvents(data.content);
                vm.newEventSSE = true;
            } else if (data.sseType === 'ALL_IN_ONE_TOPOLOGY') {
                if (data.content.action === 'uploaded') {
                    $rootScope.$broadcast('allinOneTopologyUploaded', data);
                }
            } else if (data.sseType === 'ALARM') {
                getAlarms();
                $rootScope.$broadcast(data.content.name, data.content);
                $rootScope.$broadcast('incoming', data.content);
            } /*else if (data.sseType === 'TODOLIST') {
             if (data.content.action === 'insert') {
             $rootScope.$broadcast('newToDoListInsert', data.content);
             Dashboard.getTodoList(todolist_params).then(function (data) {
             vm.todolistNum = data.length;
             });
             }
             }*/ else if (data.sseType === 'PORT') {
                $rootScope.$broadcast('port', data.content);
            } else if (data.sseType === 'PORT_STATUS') {
                if ($rootScope.MW_SETTING === 'normal') {
                    $rootScope.redWarning = data.content === 'ERROR' ? data.content : data.content === 'DOWN' ? data.content : false;
                    $rootScope.$broadcast('portStatus', data.content);
                }
            } else if (data.sseType === 'INTRUSION_DETECTION') {
                $rootScope.$broadcast('intrusionDetection', data.content);
            } else if (data.sseType === 'LEARNING') {
                $rootScope.$broadcast('learning', data.content);
            } else if (data.sseType === 'LEARNED_IP_MAC') {
                $rootScope.$broadcast('learnedIpMac', data.content);
            } else if (data.sseType === 'LEARNING_RESULT') {
                $rootScope.$broadcast('learningResult', data.content);
            } else if (data.sseType === 'DEVICE_UPDATE') {
                $rootScope.$broadcast('device', data.content);
                if ($rootScope.MW_SETTING !== 'normal') {
                    $rootScope.redWarning = (data.content.deviceOnline === -1 ? 'ERROR' : false);
                    $rootScope.$broadcast('portStatus', (data.content.deviceOnline === -1 ? 'ERROR' : false));
                }
            } /*else if (data.sseType === 'NEW_FOUND_DEVICE') {
             if (data.content.action === 'foundviadpi') {
             $rootScope.addAlert({
             type: 'success',
             content: '发现新的安全设备'
             });
             $rootScope.newDeviceFounducd = true;
             if (topologyId.hasNode) {
             var deviceRight = Enum.get('privilege').filter(function (a) {
             return a.name === 'DEVICE_MANAGEMENT';
             });
             if (deviceRight && deviceRight[0] && deviceRight[0].actionValue === 30) {
             checkDiscoveredDevices();
             }
             }
             }
             $rootScope.$broadcast('device', data.content);
             }*/ else if (data.sseType === 'DPI_UPGRADE_STATE') {
                $rootScope.$broadcast('dpiUpgradeState', data.content);
            } else if (data.sseType === 'TOPOLOGY_DISCOVERY') {
                $rootScope.$broadcast('topologyDiscover', data.content);
            } else if (data.sseType === 'INFO_COLLECTION_DPI' || data.sseType === 'INFO_COLLECTION_MW' || data.sseType === 'INFO_COLLECTION_CONFIGURATION') {
                if (data.content.action === 'DEBUG') {
                    $rootScope.$broadcast('debuginfoCollect', data.content);
                } else if (data.content.action === 'CONF_BACKUP') {
                    $rootScope.$broadcast('confBakCollect', data.content);
                }
            } else if(data.sseType === 'INFO_RESTORE_CONFIGURATION' ){
                if(data.content.action === 'CONF_BACKUP'){
                    $rootScope.$broadcast('confBakRestore',data.content);
                }
            }else {
                $rootScope.$broadcast(data.content.name, data.content);
                $rootScope.$broadcast('incoming', data.content);
            }
        }, function () {
            $rootScope.sseUpdateConnected = true;
            $rootScope.$broadcast('sseUpdateConnected');
        });

        //$scope.$on('$destroy', function () {
        //    sse.unsubscribe('UPDATE');
        //    if (vm.eventTimer) {
        //        $interval.cancel(vm.eventTimer);
        //    }
        //    $rootScope.sseUpdateConnected = false;
        //});
        //
        //if ($rootScope.MW_SETTING !== 'normal') {
        //    Device.getAll({'$filter': 'category eq SECURITY_DEVICE'}).then(function (devices) {
        //        var result = 'ERROR';
        //        if (devices) {
        //            for (var i = 0; i < devices.length; i++) {
        //                if (devices[i].deviceOnline === 1) {
        //                    result = false;
        //                    break;
        //                }
        //            }
        //        }
        //        $rootScope.redWarning = result;
        //    });
        //}
        //
        //$rootScope.$$listeners['allinOneTopologyUploaded'] = [];
        //$rootScope.$on('allinOneTopologyUploaded', function () {
        //    $rootScope.addAlert({
        //        type: 'success',
        //        content: '拓扑图已发生改变，页面将在5秒后刷新'
        //    });
        //    $timeout(function () {
        //        location.reload();
        //    }, 5000);
        //});

        // sse.listen('portStatus', $scope, function (data) {
        //     $rootScope.redWarning = data === 'ERROR' ? data : data === 'DOWN' ? data : false;
        //     $rootScope.$broadcast('portStatus', data);
        // });

        //function updateEventCount(firstEntry) {
        //    if (firstEntry) {
        //        $q.all([evtCnt.init()]).then(function () {
        //            getRedDot();
        //            if (vm.eventTimer) {
        //                $interval.cancel(vm.eventTimer);
        //            }
        //            if (evtCnt.get('timeGap') > 0) {
        //                $rootScope.$broadcast('updateEvent');
        //                vm.eventTimer = $interval(function () {
        //                    updateEventCount(false);
        //                }, evtCnt.get('timeGap'));
        //            }
        //        });
        //    } else {
        //        if (evtCnt.get('timeGap') > 0) {
        //            if (vm.newEventSSE) {
        //                $rootScope.$broadcast('updateEvent');
        //                vm.newEventSSE = false;
        //            }
        //            if (vm.eventTimer) {
        //                $interval.cancel(vm.eventTimer);
        //            }
        //            vm.eventTimer = $interval(function () {
        //                updateEventCount(false);
        //            }, evtCnt.get('timeGap'));
        //        }
        //    }
        //}

        //updateEventCount(true);

        function getRedDot() {
            $rootScope.redDot = evtCnt.get('totalNew') > 0;
        }

        function getAlarms() {
            $q.all([
                Alarm.get({
                    '$filter': "timestamp ge '" + moment().hour(-24).utc().format() + "'"
                }),
                Alarm.getCount(),
                apiInfo.sysbaseinfo()
            ]).then(function (data) {
                vm.alarms.list = data[0];
                vm.alarms.countNew = data[1];
                vm.alarms.currentTime = data[2].data;
            });
        }

        //
        //getAlarms();

        //function checkDiscoveredDevices() {
        //    if ($scope.alreadyFoundNewDevice) {
        //        //Close previous confirm-panel if find new device again
        //        vm.confirmPanel.close();
        //        $scope.alreadyFoundNewDevice = false;
        //    }
        //    // If found new dicovered device with same serial number, confirm if should merge.
        //    $q.all([
        //        Device.getAll({'$filter': 'category eq SECURITY_DEVICE', '$orderby': 'name'}),
        //        Device.getNewDevices({'$orderby': 'name'})
        //    ]).then(function (data) {
        //        var existingSecurityDevices = data[0];
        //        var newSecurityDevices = data[1];
        //        var newDiscoveredDevices = [];
        //        var existingDiscoveredDevices = [];
        //        var index = 0;
        //
        //        for (var i in newSecurityDevices) {
        //            if (i) {
        //                for (var j in existingSecurityDevices) {
        //                    if (j) {
        //                        if (newSecurityDevices[i].serialNumber === existingSecurityDevices[j].serialNumber) {
        //                            newDiscoveredDevices[index] = newSecurityDevices[i];
        //                            existingDiscoveredDevices.push(existingSecurityDevices[j]);
        //                            index++;
        //                            break;
        //                        }
        //                    }
        //                }
        //            }
        //        }
        //        if (newDiscoveredDevices.length > 0) {
        //            $q.when(confirmation($modal, $q, newDiscoveredDevices, existingDiscoveredDevices)).then(function () {
        //                var deferred = $q.defer();
        //                var promises = [];
        //                //console.log(newDiscoveredDevices);
        //                for (var k in newDiscoveredDevices) {
        //                    if (k) {
        //                        promises.push(Device.addToCurrentTopology(newDiscoveredDevices[k].deviceId, ''));
        //                    }
        //                }
        //                $q.all(promises).then(function () {
        //                    deferred.resolve('success');
        //                    $rootScope.$broadcast('addedToCurrentTopology', '');
        //                    $rootScope.addAlert({
        //                        type: 'success',
        //                        content: '加入当前拓扑成功'
        //                    });
        //                }, function (data) {
        //                    deferred.resolve('加入当前拓扑失败');
        //                    $rootScope.addAlert({
        //                        type: 'danger',
        //                        content: '加入当前拓扑失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
        //                    });
        //                });
        //            });
        //        }
        //    });
        //}

        //function confirmation($modal, $q, newDiscoveredDevices, existingSecurityDevices) {
        //    var names = [];
        //    var enames = [];
        //    for (var i in newDiscoveredDevices) {
        //        if (i) {
        //            names[i] = newDiscoveredDevices[i].name;
        //        }
        //    }
        //    for (var j in existingSecurityDevices) {
        //        if (j) {
        //            enames[j] = existingSecurityDevices[j].name;
        //        }
        //    }
        //    var deferred = $q.defer();
        //    $scope.alreadyFoundNewDevice = true;
        //    vm.confirmPanel = $modal.open({
        //        size: 'sm',
        //        templateUrl: 'templates/asset/securitydevice/confirm-panel.html',
        //        controller: function ($scope, $modalInstance) {
        //            $scope.title = '发现相同序列号设备';
        //            $scope.content1 = '已安装设备中" ' + enames + ' "与自动发现的新设备＂' + names + '＂序列号相同（SN: ';
        //            existingSecurityDevices.map(function (d) {
        //                $scope.content1 += (d.serialNumber + ', ');
        //            });
        //            $scope.content1 = $scope.content1.substring(0, $scope.content1.length - 2);
        //            $scope.content1 += '）。';
        //            $scope.content2 = '请注意，此操作可能会导致"' + enames + '"的设备规格与MAC地址被覆盖。';
        //            $scope.confirm = function () {
        //                $modalInstance.close();
        //                deferred.resolve();
        //            };
        //            $scope.cancel = function () {
        //                $modalInstance.dismiss('cancel');
        //                deferred.reject();
        //            };
        //        }
        //    });
        //    return deferred.promise;
        //}

        vm.getEnableMenus = function () {
            var menus = $rootScope.rootMenu.getChilds();
            var enableMenus = [];
            for (var k = 0; k < menus.length; k++) {
                var item = menus[k];
                if ($rootScope.parsedMenu) {
                    for (var i = 0; i < $rootScope.parsedMenu[0].length; i++) {
                        var tmp = $rootScope.parsedMenu[0][i];
                        if (item.target === tmp.target && tmp.active) {
                            enableMenus.push(item);
                        }
                    }
                }
            }
            return enableMenus;
        };

        $scope.checkLast = function (last) {
            if (last) {
                var ulLeftWidth = $cookieStore.get("ulLeftWidth");
                var menus = vm.getEnableMenus();
                var topUl = $("#topUl");
                var allLi = topUl.find("li");
                var slideWidth = 0;
                var flag = false;
                if (menus.length > 0) {
                    for (var i = 0; i < menus.length; i++) {
                        if (menus[i].state) {
                            if (i > 8 && vm.isActive(menus[i].state)) {
                                flag = true;
                            }
                        }
                        slideWidth += allLi[i].offsetWidth;
                    }
                }
                if (flag) {
                    slideWidth += 20;
                    topUl[0].style.width = slideWidth + "px";
                    topUl[0].style.left = ulLeftWidth + 'px';
                }
            }
        };

        vm.slideTopBar = function (isLeft) {
            var topMenu = $("#topMenu");
            var topUl = $("#topUl");
            var allLi = topUl.find("li");
            var slideWidth = 0;
            if (allLi.length > 0) {
                for (var i = 0; i < allLi.length; i++) {
                    slideWidth += allLi[i].offsetWidth;
                }
            }
            slideWidth += 20;
            topUl[0].style.width = slideWidth + "px";
            var menuWidth = topMenu[0].offsetWidth;
            var ulWidth = topUl[0].offsetWidth;
            var leftWidth = topUl[0].offsetLeft;
            var maxLeft = ulWidth - menuWidth;
            var stepLeft = (maxLeft + leftWidth) / menuWidth >= 1 ? menuWidth : (maxLeft + leftWidth);
            var iLeft = 0;
            if (isLeft) {
                if (Math.abs(leftWidth) < maxLeft) {
                    iLeft = leftWidth - stepLeft;
                    iLeft >= 0 && (iLeft = 0);
                    $cookieStore.remove("ulLeftWidth");
                    $cookieStore.put("ulLeftWidth", iLeft);
                    topUl[0].style.left = iLeft + 'px';
                }
            } else {
                if (leftWidth < 0) {
                    if (maxLeft > menuWidth) {
                        if (Math.abs(leftWidth) % menuWidth === 0) {
                            iLeft = leftWidth + menuWidth;
                        } else {
                            iLeft = leftWidth + maxLeft % menuWidth;
                        }
                    } else {
                        iLeft = leftWidth + maxLeft;
                    }
                    $cookieStore.remove("ulLeftWidth");
                    $cookieStore.put("ulLeftWidth", iLeft);
                    topUl[0].style.left = iLeft + 'px';
                }
            }
        };
    }

})();
