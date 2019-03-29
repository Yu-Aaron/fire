/*********************************************************
 *    UI version Control Service
 *    --------------------------
 *    updates: 2015-10-01 (James)
 *    Combine other UI state transition code to this service
 *
 *********************************************************/
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('uiCtrl', uiCtrl);
    //.service('leftNavCustomMenu', leftNavCustomMenu);
    //, Topology, topologyId, Enum, Device, domain, $location,uiTree
    function uiCtrl(URI, $q, $http, $state, $rootScope) {
        var service = {
            getUI: getUI,
            //mainUI: mainUI,
            //subUI: subUI,
            //contentUI: contentUI,
            UIversion: UIversion,
            //isShow: isShow,
            //findLand: findLand,
            //isRemote: isRemote,
            //isAllinOne: isAllinOne,
            //isAllinOneOffLine: isAllinOneOffLine,
            teleport: teleport
        };
        return service;
        //function isRemote() {
        //    return ($rootScope.VERSION_NUMBER).toLowerCase().indexOf('x01') >= 0;
        //}

        //function isAllinOne() {
        //    return ($rootScope.VERSION_NUMBER).toLowerCase().indexOf('x00') >= 0;
        //}
        //
        //function isAllinOneOffLine() {
        //    return ($rootScope.VERSION_NUMBER).toLowerCase().indexOf('x02') >= 0 || ($rootScope.VERSION_NUMBER).toLowerCase().indexOf('x03') >= 0;
        //}

        //function getLevel(item) {
        //    var lst = item.customizedMenuId.split('-');
        //    return lst.length - 1;
        //}


        //function compareCustomizedMenuItem(a, b) {
        //    if (a.customizedMenuId <= b.customizedMenuId) {
        //        return -1;
        //    }
        //    return 1;
        //}

        //function parseCustomizedMenu(CustomizedMenu) {
        //    var targetAndState = [
        //        {name: 'MONITOR', value: 'monitor'}, {name: 'MONITOR_OVERVIEW', value: 'monitor.overview'},
        //
        //        {name: 'MONITOR_INCIDENT', value: 'monitor.incident'}, {
        //            name: 'MONITOR_LOGGER',
        //            value: 'monitor.logger'
        //        },
        //
        //        {name: 'MONITOR_REPORT', value: 'monitor.report'}, {
        //            name: 'MONITOR_REPORT_EVENT',
        //            value: 'monitor.report.event'
        //        },
        //
        //        {name: 'MONITOR_REPORT_LOG', value: 'monitor.report.log'}, {name: 'RULE', value: 'rule'},
        //
        //        {name: 'RULE_BLACKLIST', value: 'rule.blacklist'}, {name: 'RULE_WHITELIST', value: 'rule.whitelist'},
        //
        //        {name: 'RULE_WHITELIST_LEARNING', value: 'rule.whitelist.learning'}, {
        //            name: 'RULE_WHITELIST_MANAGER',
        //            value: 'rule.whitelist.manager'
        //        },
        //
        //        {name: 'RULE_IPMAC', value: 'rule.ipmac'}, {name: 'NETWORK', value: 'network'},
        //
        //        {name: 'NETWORK_INTERFACE', value: 'network.interface'}, {
        //            name: 'NETWORK_STATIC_ROUTER',
        //            value: 'network.static_router'
        //        },
        //
        //        {name: 'OBJECT', value: 'object'}, {name: 'OBJECT_NETWORK_ASSET', value: 'object.network_asset'},
        //
        //        {
        //            name: 'OBJECT_NETWORK_ASSET_ADDRESS',
        //            value: 'object.network_asset.security_area'
        //        }, {name: 'OBJECT_NETWORK_ASSET_SECURITY_AREA', value: 'object.network_asset.security_area'},
        //
        //        {
        //            name: 'OBJECT_NETWORK_ASSET_DEVICE_ASSET',
        //            value: 'object.network_asset.device_asset'
        //        }, {name: 'OBJECT_SERVICE', value: 'object.service'},
        //
        //        {
        //            name: 'OBJECT_SERVICE_PREDEFINED',
        //            value: 'object.service.predefined'
        //        }, {name: 'OBJECT_SERVICE_CUSTOMIZEDEFINED', value: 'object.service.customizedefined'},
        //
        //        {name: 'OBJECT_APPLY', value: 'object.apply'}, {
        //            name: 'OBJECT_APPLY_PREDEFINED',
        //            value: 'object.apply.predefined'
        //        },
        //
        //        {
        //            name: 'OBJECT_APPLY_CUSTOMIZEDEFINED',
        //            value: 'object.apply.customizedefined'
        //        }, {name: 'OBJECT_SCHEDULE', value: 'object.schedule'},
        //
        //        {name: 'STRATEGY', value: 'strategy'}, {name: 'STRATEGY_SECURITY', value: 'strategy.security'},
        //
        //        {name: 'STRATEGY_NAT', value: 'strategy.nat'}, {name: 'STRATEGY_NAT_SNAT', value: 'strategy.nat.snat'},
        //
        //        {name: 'STRATEGY_NAT_DNAT', value: 'strategy.nat.dnat'}, {
        //            name: 'STRATEGY_SESSION',
        //            value: 'strategy.session'
        //        },
        //
        //        {name: 'STRATEGY_ANTI_PENETRATION', value: 'strategy.anti_penetration'}, {
        //            name: 'SETTING',
        //            value: 'setting'
        //        },
        //
        //        {name: 'SETTING_BASIC', value: 'setting.basic'}, {name: 'SETTING_RELIABLE', value: 'setting.reliable'},
        //
        //        {name: 'SETTING_UPDATE', value: 'setting.update'}, {name: 'HELP', value: 'help'},
        //
        //        {name: 'HELP_MONITOR', value: 'help.monitor'}, {
        //            name: 'HELP_MONITOR_OVERVIEW',
        //            value: 'help.monitor.overview'
        //        },
        //
        //        {name: 'HELP_MONITOR_INCIDENT', value: 'help.monitor.incident'}, {
        //            name: 'HELP_MONITOR_LOGGER',
        //            value: 'help.monitor.logger'
        //        },
        //
        //        {name: 'HELP_MONITOR_REPORT', value: 'help.monitor.report'}, {name: 'HELP_RULE', value: 'help.rule'},
        //
        //        {name: 'HELP_RULE_BLACKLIST', value: 'help.rule.blacklist'}, {
        //            name: 'HELP_RULE_WHITELIST',
        //            value: 'help.rule.whitelist'
        //        },
        //
        //        {name: 'HELP_RULE_IPMAC', value: 'help.rule.ipmac'}, {name: 'HELP_NETWORK', value: 'help.network'},
        //
        //        {name: 'HELP_NETWORK_INTERFACE', value: 'help.network.interface'}, {
        //            name: 'HELP_NETWORK_STATIC_ROUTER',
        //            value: 'help.network.static_router'
        //        },
        //
        //        {name: 'HELP_OBJECT', value: 'help.object'}, {
        //            name: 'HELP_OBJECT_NETWORK_ASSET',
        //            value: 'help.object.network_asset'
        //        },
        //
        //        {name: 'HELP_OBJECT_SERVICE', value: 'help.object.service'}, {
        //            name: 'HELP_OBJECT_APPLY',
        //            value: 'help.object.apply'
        //        },
        //
        //        {name: 'HELP_OBJECT_SCHEDULE', value: 'help.object.schedule'}, {
        //            name: 'HELP_STRATEGY',
        //            value: 'help.strategy'
        //        },
        //
        //        {name: 'HELP_STRATEGY_SECURITY', value: 'help.strategy.security'}, {
        //            name: 'HELP_STRATEGY_NAT',
        //            value: 'help.strategy.nat'
        //        },
        //
        //        {
        //            name: 'HELP_STRATEGY_SESSION',
        //            value: 'help.strategy.session'
        //        }, {name: 'HELP_STRATEGY_ANTI_PENETRATION', value: 'help.strategy.anti_penetration'},
        //
        //        {name: 'HELP_SETTING', value: 'help.setting'}, {
        //            name: 'HELP_SETTING_BASIC',
        //            value: 'help.setting.basic'
        //        },
        //
        //        {name: 'HELP_SETTING_RELIABLE', value: 'help.setting.reliable'}, {
        //            name: 'HELP_SETTING_UPDATE',
        //            value: 'help.setting.update'
        //        }
        //
        //    ];
        //    var lst = [[], [], []];
        //    var i, tmp;
        //    for (i = 0; i < CustomizedMenu.length; i++) {
        //        tmp = CustomizedMenu[i];
        //        var lvl = getLevel(tmp);
        //
        //        var state = targetAndState.filter(function (t) {
        //            return t.name === tmp.target;
        //        });
        //
        //        tmp.state = state && state[0] ? state[0] : '';
        //
        //        //else {
        //        //    if (tmp.target.toLowerCase() === "audit" && $rootScope.isJAXX) {
        //        //        tmp.state = "audittable.dpidata";
        //        //    }
        //        //    else if (tmp.target.toLowerCase() === "behavior_audit" && $rootScope.isJAXX) {
        //        //        tmp.state = "audittable.behavioraudit";
        //        //    }
        //        //    else if (tmp.target.toLowerCase() === "content_audit" && $rootScope.isJAXX) {
        //        //        tmp.state = "audittable.forumpost";
        //        //    }
        //        //    else {
        //        //        tmp.state = tmp.target.toLowerCase();
        //        //    }
        //        //}
        //        //if ($rootScope.isJAXX && tmp.target === 'WHITE_LIST') {
        //        //    tmp.state = 'whitelist';
        //        //}
        //        lst[lvl].push(tmp);
        //    }
        //    var tree = [];
        //    angular.copy(lst[0], tree);
        //    for (i = 0; i < lst[1].length; i++) {
        //        tmp = lst[1][i];
        //        for (var j = 0; j < tree.length; j++) {
        //            var t = tree[j];
        //            if (tmp.customizedMenuId.split('-')[0] === t.customizedMenuId.split('-')[0]) {
        //                if (!tree[j].subArr) {
        //                    tree[j].subArr = [];
        //                }
        //                tree[j].subArr.push(tmp);
        //
        //            }
        //        }
        //    }
        //    for (i = 0; i < tree.length; i++) {
        //        if (tree[i].subArr) {
        //            tree[i].subArr.sort(compareCustomizedMenuItem);
        //        }
        //    }
        //    $rootScope.parsedMenu = lst;
        //    $rootScope.customMenuTree = tree;
        //}

        function getUI() {
            var promise = [];
            var localcm = JSON.parse(localStorage.getItem('customizedMenus'));
            //(!localcm)&&promise.push($http.get(URI + '/domains/customizedMenus'));
            (!localcm) && promise.push($http.get(URI + '/users/customizedMenus'));
            return $q.all(promise).then(function (cm) {
                (cm.length > 0 && cm[0].data && cm[0].data.length > 0 && !localcm) && localStorage.setItem('customizedMenus', JSON.stringify(cm[0].data));
                $rootScope.customizedMenus = localcm ? localcm : cm[0].data.filter(function (m) {
                    return m.active;
                });
                //if ($rootScope.customizedMenus) {
                //    parseCustomizedMenu($rootScope.customizedMenus);
                //}
                //else {
                //    return $.getJSON('js/customizedmenu.json').then(function (data) {
                //        $rootScope.customizedMenus = data;
                //        localStorage.setItem('customizedMenus', JSON.stringify(data));
                //        //parseCustomizedMenu(data);
                //        return data;
                //    });
                //}
            }, function () {
                return $.getJSON('js/customizedmenu.json').then(function (data) {
                    $rootScope.customizedMenus = data;
                    return data;
                });
            });
        }

        //function mainUI() {
        //    return $rootScope.rootMenu.getChilds();
        //}
        //
        //function subUI(p) {
        //    return $rootScope.rootMenu.getChild(p).getChilds();
        //}

        //function contentUI() {
        //    return $rootScope.rootMenu.content;
        //}

        function UIversion() {
            return $rootScope.VERSION_NUMBER.slice(-4);
        }

        //function isShow(target, lv) {        //lv=0/1/2 refer main/sub/content UI
        //    if (lv > 2) {
        //        return uiTree.getContentShow(target);
        //    } else {
        //        var node = uiTree.getNode(target);
        //        return node ? node.getEnable() : false;
        //    }
        //}

        //Find landing page for dashboard click. Designed just for 2nd level Menu
        //function findLand(target) {
        //    var node = uiTree.getNode(target);
        //
        //    if (node) {
        //        if (!node.getEnable) {
        //            var sibling = uiTree.getSiblingNodes(target);
        //            var land = "monitor.overview";
        //            if (sibling && sibling.length > 0) {
        //                for (var i = 0; i < sibling.length; i++) {
        //                    if (sibling[i].getEnable()) {
        //                        land = sibling[i].getState();
        //                        break;
        //                    }
        //                }
        //            }
        //            $state.transitionTo(land);
        //        } else if ('redirect' === $state.current.name) {
        //            $state.transitionTo("monitor.overview");
        //        }
        //    } else {
        //        console.log("wrong target: " + target);
        //        if ($rootScope.currentState === 'REAL_TIME_PROTECTION') {
        //            $state.transitionTo("monitor.overview");
        //        }
        //    }
        //}

        function teleport(params) {    // params: privilege, curState, state, isLogin
            // var targetState = params && params.state ? params.state : 'monitor.overview';
            var targetState = params && params.state ? params.state : 'myaccount';
            //var noDevice = false;
            var promise = [];
            // Use $rootScope.config to connect privilege with state
            // Find first landing state if login or invalid state
            // Pass null params.privilege when login or invalid state
            //if ((!params) || !params.state || params.isLogin || ['monitor.overview', 'monitor.event', 'monitor.logger', 'monitor.device', 'rule.blacklist', 'rule.whitelist', 'rule.ipmac', 'infsafety', 'attack', 'audit.dpidata', 'audit.devicedata', 'audit.audittable'].indexOf(targetState) > -1) {        // = if(login || invalidPage)
            //    //switch ($rootScope.VERSION_NUMBER.slice(-4)) {
            //    //    case '-C00':
            //    //        if (Enum.get('userType') === 1) {
            //    //            targetState = "domain";
            //    //        } else {
            //    //            // Find landing state based on topology state
            //    //            promise.push(checkTopoState('REAL_TIME_PROTECTION'));
            //    //        }
            //    //        break;
            //    //    case '-C05':
            //    //        if ($rootScope.userRoleTypeC05 === 0) {
            //    //            targetState = "setting.systemconsole";
            //    //        } else if ($rootScope.userRoleTypeC05 === 2) {
            //    //            targetState = "monitor.logger";
            //    //        } else {
            //    //            promise.push(checkTopoState('REAL_TIME_PROTECTION'));
            //    //        }
            //    //        break;
            //    //    case '-X00':
            //    //        if (Enum.get('userType') === 1) {
            //    //            targetState = "setting.systemconsole";
            //    //        } else {
            //    //            promise.push(checkTopoState('REAL_TIME_PROTECTION'));
            //    //        }
            //    //        break;
            //    //    case '-X01':
            //    //        if (Enum.get('userType') === 1) {
            //    //            targetState = "domain";
            //    //        } else {
            //    //            promise.push(checkTopoState('REAL_TIME_PROTECTION'));
            //    //        }
            //    //        break;
            //    //    case '-X02':
            //    //        if (Enum.get('userType') === 1) {
            //    //            targetState = "domain";
            //    //        } else {
            //    //            promise.push(checkTopoState('REAL_TIME_PROTECTION'));
            //    //        }
            //    //        break;
            //    //    case '-X03':
            //    //        if (Enum.get('userType') === 1) {
            //    //            targetState = "domain";
            //    //        } else {
            //    //            promise.push(checkTopoState('REAL_TIME_PROTECTION'));
            //    //        }
            //    //        break;
            //    //    default:
            //    //        if (Enum.get('userType') === 1) {
            //    //            targetState = "domain";
            //    //        } else {
            //    //            promise.push(checkTopoState('REAL_TIME_PROTECTION'));
            //    //        }
            //    //        break;
            //    //}
            //    if (params && params.isLogin) {
            //        //first time login setting
            //        domain.getDomain().then(function () {
            //            localStorage.setItem('topologyId', topologyId.id);
            //            localStorage.setItem('lockUser', '0');
            //            $rootScope.userlock = '0';
            //        });
            //    }
            //}
            $q.all(promise).then(function () {
                //If params is empty =============> redirect because of privilege
                //if (!params || !params.privilege) {
                //    targetState = checkForNextAvailablePage();
                //}
                //Only redirect if target state is different from current state
                //if (!params || (params && targetState !== params.curState))
                //if (!params || (params && targetState !== params.curState)) {
                //if ($rootScope.centraliztion) {
                //    targetState = "setting.systemconsole";
                //}
                promise.push($state.transitionTo(targetState));

                //}
                //if (params && params.isLogin && noDevice) {
                //    var msg = {
                //        'type': 'warning',
                //        'content': '目前系统没有找到任何匡恩安全设备，请确认设备连线正常并配置设备指向管理平台',
                //        'ip': $location.$$host
                //    };
                $q.all(promise).then(function () {
                    //$rootScope.stayAlert(msg);
                    //console.log(msg);
                });
                //}
            });

            //function getFirstItem(lst) {
            //    if (lst && lst.length) {
            //        return lst[0].actionValue;
            //    }
            //    return 1;
            //}

            //function checkForNextAvailablePage() {
            //    var level = getFirstItem(Enum.get('privilege').filter(function (a) {
            //        return a.name === 'DEVICE_MANAGEMENT';
            //    }));
            //
            //    //TODO: find out why redirection's first choice is topology.singleTopo page
            //    // if (level === 1) {
            //    level = Enum.get('privilege').filter(function (a) {
            //        return a.name === 'REAL_TIME_PROTECTION';
            //    });
            //    level = level && level[0] ? level[0].actionValue : 1;
            //
            //    if (level === 1) {
            //        level = Enum.get('privilege').filter(function (a) {
            //            return a.name === 'INCIDENT';
            //        });
            //        level = level && level[0] ? level[0].actionValue : 1;
            //
            //        if (level === 1) {
            //            level = Enum.get('privilege').filter(function (a) {
            //                return a.name === 'EVENT';
            //            });
            //            level = level && level[0] ? level[0].actionValue : 1;
            //
            //            if (level === 1) {
            //                level = Enum.get('privilege').filter(function (a) {
            //                    return a.name === 'LOG_MANAGEMENT';
            //                });
            //                level = level && level[0] ? level[0].actionValue : 1;
            //
            //                if (level === 1) {
            //                    level = Enum.get('privilege').filter(function (a) {
            //                        return a.name === 'DEVICE_MANAGEMENT';
            //                    });
            //                    level = level && level[0] ? level[0].actionValue : 1;
            //
            //                    if (level === 1) {
            //                        level = Enum.get('privilege').filter(function (a) {
            //                            return a.name === 'SETTINGS_POLICY';
            //                        });
            //                        level = level && level[0] ? level[0].actionValue : 1;
            //
            //                        if (level === 1) {
            //                            level = Enum.get('privilege').filter(function (a) {
            //                                return a.name === 'USER_MANAGEMENT';
            //                            });
            //                            level = level && level[0] ? level[0].actionValue : 1;
            //
            //                            if (level === 1) {
            //                                return 'myaccount';
            //                            } else {
            //                                if (Enum.get('userType') === 1) {
            //                                    return 'domain';
            //                                } else {
            //                                    return 'systemuser';
            //                                }
            //                            }
            //                        } else {
            //                            return 'setting.systemconsole';
            //                        }
            //                    } else {
            //                        return 'monitor.device';
            //                    }
            //                } else {
            //                    return 'monitor.logger';
            //                }
            //            } else {
            //                return 'monitor.event';
            //            }
            //        } else {
            //            return 'monitor.event';
            //        }
            //    } else {
            //        return 'monitor.overview';
            //    }
            //    // } else {
            //    //     return 'topology.singleTopo';
            //    // }
            //}
            //
            //function checkTopoState(currentstate) {
            //    return domain.getDomain().then(function (data) {
            //        if (data && data.length > 0 && data[0].domainInfo) {
            //            data[0].domainInfo.topologyId = data[0].domainInfo.currentTopologyId;
            //            localStorage.setItem('topologyId', data[0].domainInfo.topologyId);
            //            topologyId.id = localStorage.getItem('topologyId');
            //            return Topology.getNodes(topologyId.id).then(function (nodes) {
            //                var level;
            //                if (!nodes.data.length) {
            //                    if (!currentstate) {
            //                        currentstate = 'REAL_TIME_PROTECTION';
            //                    }
            //                    return Device.getDeviceDiscoverred().then(function (dpi) {
            //                        var sysSetting = getFirstItem(Enum.get('privilege').filter(function (a) {
            //                            return a.name === 'SETTINGS_POLICY';
            //                        }));
            //                        if (!dpi.data.length) {
            //                            noDevice = true;
            //                            level = getFirstItem(Enum.get('privilege').filter(function (a) {
            //                                return a.name === 'DEVICE_MANAGEMENT';
            //                            }));
            //                            if (level === 1) {
            //                                if (sysSetting > 1) {
            //                                    targetState = "setting.systemconsole";
            //                                } else {
            //                                    targetState = "myaccount";
            //                                }
            //                            } else {
            //                                targetState = "topology.singleTopo";
            //                            }
            //                        } else {
            //                            level = getFirstItem(Enum.get('privilege').filter(function (a) {
            //                                return a.name === 'DEVICE_MANAGEMENT';
            //                            }));
            //                            if (level === 1) {
            //                                if (sysSetting > 1) {
            //                                    targetState = "setting.systemconsole";
            //                                } else {
            //                                    targetState = "myaccount";
            //                                }
            //                            } else {
            //                                targetState = "asset.securitydevice";
            //                            }
            //                        }
            //                    });
            //                }
            //            });
            //        }
            //    });
            //}
        }
    }

    //function leftNavCustomMenu($rootScope) {
    //    var obj = {
    //        leftNavItemEnabled: leftNavItemEnabled,
    //        lv2MenuEnabledByTarget: lv2MenuEnabledByTarget
    //    };
    //    return obj;
    //
    //    function leftNavItemEnabled(item) {
    //        // console.log(item);
    //        if ($rootScope.parsedMenu && $rootScope.parsedMenu[1]) {
    //            for (var i = 0; i < $rootScope.parsedMenu[1].length; i++) {
    //                var tmp = $rootScope.parsedMenu[1][i];
    //                if (tmp.target === item.target && tmp.active) {
    //                    return true;
    //                }
    //            }
    //        }
    //        return false;
    //    }
    //
    //    function lv2MenuEnabledByTarget(target) {
    //        if ($rootScope.parsedMenu && $rootScope.parsedMenu[1]) {
    //            for (var i = 0; i < $rootScope.parsedMenu[1].length; i++) {
    //                var tmp = $rootScope.parsedMenu[1][i];
    //                // console.log(tmp);
    //                if (tmp.target === target && tmp.active) {
    //                    return true;
    //                }
    //            }
    //        }
    //        return false;
    //    }
    //}
})();
