/**
 * SystemUser Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.systemuser')
        .controller('SystemUserCtrl', SystemUserCtrl)
        .controller('RootUserCtrl', RootUserCtrl);

    function SystemUserCtrl(SystemUser, System, $rootScope, $scope, $modal, users, roles, user, auth, $q, $log, Enum, Device, autofocusCtrl, uiCtrl, strategyInfo, constantService, passwordValidationService, $state) {
        var vm = this;
        if (roles.status === 412) {
            $rootScope.addAlert({
                type: 'danger',
                content: '没有用户或用户组管理权限， 请联系系统管理员'
            });
            $state.transitionTo('monitor.overview');
            return;
        }

        //vm.isRootUser = user.user._type === 1;

        vm.table = users.users;
        vm.currentRole = roles.currentRole;
        vm.subRoles = roles.subRoles;
        vm.currentUser = user;
        vm.requestError = "";
        vm.createdError = {};

        vm.currentUserdisabledEditUserGroup = false;
        vm.currentUserdisabledEditUser = false;

        vm.showCreateUserGroup = false;
        vm.showEditUserGroup = false;
        vm.showCreateUser = false;
        vm.showEditUser = false;

        vm.privilegesToBan = [];

        function buildPrivileges() {
            //  字典 保存权限,权限对应菜单名称,权限中文名称. 在创建用户组\编辑用户组时用到.
            var dict = [];
            dict.push({privilege: "EVENT", menu: "MONITOR_INCIDENT", description: "事件"});
            dict.push({privilege: "LOG_MANAGEMENT", menu: "MONITOR_LOGGER", description: "日志"});
            dict.push({privilege: "REPORT", menu: "MONITOR_REPORT", description: "报告"});
            dict.push({privilege: "SESSION_MANAGEMENT", menu: "SESSION", description: "会话"});
            dict.push({privilege: "RULE_BLACKLIST", menu: "RULE_BLACKLIST", description: "黑名单"});
            dict.push({privilege: "RULE_WHITELIST", menu: "RULE_WHITELIST", description: "白名单"});
            dict.push({privilege: "RULE_IP_MAC", menu: "RULE_IPMAC", description: "IP/MAC"});
            dict.push({privilege: "NETWORK_INTERFACE", menu: "NETWORK_INTERFACE", description: "接口"});
            dict.push({privilege: "NETWORK_ROUTE", menu: "NETWORK_STATIC_ROUTER", description: "路由"});
            dict.push({privilege: "OBJECT_ASSET", menu: "OBJECT_NETWORK_ASSET", description: "网络资产"});
            dict.push({privilege: "OBJECT_SERVICE", menu: "OBJECT_SERVICE", description: "服务"});
            dict.push({privilege: "OBJECT_APPLICATION", menu: "OBJECT_APPLY", description: "应用"});
            dict.push({privilege: "OBJECT_SCHEDULE", menu: "OBJECT_SCHEDULE", description: "时间表"});
            dict.push({privilege: "STRATEGY_SECURITY", menu: "STRATEGY_SECURITY", description: "安全策略"});
            dict.push({privilege: "STRATEGY_NAT", menu: "STRATEGY_NAT", description: "NAT策略"});
            dict.push({privilege: "STRATEGY_SESSION", menu: "STRATEGY_SESSION", description: "会话策略"});
            dict.push({privilege: "STRATEGY_ANTI_ATTACK", menu: "STRATEGY_ANTI_PENETRATION", description: "抗渗透"});
            dict.push({privilege: "SETTING_BASIC", menu: "SETTING_BASIC", description: "基本设置"});
            dict.push({privilege: "SETTING_SWITCH", menu: "SETTING_SWITCH", description: "开关设置"});
            dict.push({privilege: "SETTING_RELIABLITY", menu: "SETTING_RELIABLE", description: "可靠性"});
            dict.push({privilege: "OPERATION_UPGRADE", menu: "SETTING_SECURITY_OPERATION", description: "升级"});
            dict.push({privilege: "OPERATION_REBOOT", menu: "SETTING_SECURITY_OPERATION", description: "重启"});
            dict.push({privilege: "OPERATION_RESET", menu: "SETTING_SECURITY_OPERATION", description: "重置"});
            dict.push({privilege: "OPERATION_BACKUP", menu: "SETTING_SECURITY_OPERATION", description: "备份"});
            dict.push({privilege: "USER_MANAGEMENT", menu: "SETTING_USERCONTROL", description: "用户管理"});
            var privilegeDict = {};
            dict.forEach(function (item) {
                privilegeDict[item.privilege] = item;
            });
            vm.privilegeDict = privilegeDict;

            //  权限分组,用于批量操作权限.操作组时,对应权限会受影响
            var group1 = ["EVENT", "LOG_MANAGEMENT", "REPORT",
                "SESSION_MANAGEMENT",
                "RULE_BLACKLIST", "RULE_WHITELIST", "RULE_IP_MAC",
                "NETWORK_INTERFACE", "NETWORK_ROUTE",
                "OBJECT_SERVICE", "OBJECT_SCHEDULE", "OBJECT_ASSET", "OBJECT_APPLICATION",
                "STRATEGY_SECURITY", "STRATEGY_NAT", "STRATEGY_SESSION", "STRATEGY_ANTI_ATTACK"];

            var group2 = ["SETTING_BASIC", "SETTING_SWITCH", "SETTING_RELIABLITY", "USER_MANAGEMENT",
                "OPERATION_UPGRADE", "OPERATION_REBOOT", "OPERATION_RESET", "OPERATION_BACKUP"];
            vm.privilegeGroups = {"MonitorMgt": group1, "SystemMgt": group2};
        }
        buildPrivileges();

        //设置当前用户是否具有用户权限
        vm.setCurrentUserEnabledEditUserAndGroup = function (privilege) {
            var userprivilege = privilege.filter(function (p) {
                return p.name === "USER_MANAGEMENT";
            });

            var usergroupprivilege = privilege.filter(function (p) {
                return p.name === "USER_GROUP_MANAGEMENT";
            });

            userprivilege = userprivilege !== undefined && userprivilege !== null && userprivilege.length > 0 ? userprivilege[0] : null;

            usergroupprivilege = usergroupprivilege !== undefined && usergroupprivilege !== null && usergroupprivilege.length > 0 ? usergroupprivilege[0] : null;
            if (userprivilege === null || userprivilege.actionValue !== 30) {
                vm.currentUserdisabledEditUser = true;
                vm.currentUserdisabledEditUserGroup = true;
            }

            if (usergroupprivilege === null || usergroupprivilege.actionValue !== 30) {
                vm.currentUserdisabledEditUserGroup = true;
            }
        };

        vm.setCurrentUserEnabledEditUserAndGroup(user.targetAndActionValueFormList);

        //锁定解锁用户
        vm.userLockedChanged = function (user) {
            SystemUser.lockUser(user.locked ? "lock" : "unlock", user.userId).then(function (data) {
                if (data.data) {
                    $rootScope.addAlert({
                        type: 'success',
                        content: user.locked ? '锁定成功！': "解锁成功!"
                    });
                }
                else {
                    user.locked = !user.locked;
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '修改失败！'
                    });
                }
            });
        };

        //点击用户组获取该户
        vm.getUserByUserGroupId = function (role) {
            SystemUser.getUsersByRoleId(role.roleId).then(function (data) {
                vm.table = data.users;
            });
        };

        // get password complexity strategy
        vm.passwordComplexityStrategy = passwordValidationService.getPassComplexity(strategyInfo.data);
        vm.passwordComplexityMessage = passwordValidationService.getPassComplexityMessage(vm.passwordComplexityStrategy.strategyRules[0].ruleData);
        vm.passwordErrormessages = passwordValidationService.errorMessages;

        //重新加载用户组树和用户
        function loadRoleTree() {
            var promise = [];

            promise.push(SystemUser.getUsers());

            promise.push(SystemUser.getRoles());

            $q.all(promise).then(function (data) {
                vm.table = data[0].users;
                vm.currentRole = data[1].currentRole;
                vm.subRoles = data[1].subRoles;
                roles = data[1];
                roles.subRoles.map(function (r) {
                    r.groupLevel = 1;
                });
                vm.userGroupTree = [{
                    name: roles.currentRole.name,
                    roleId: roles.currentRole.roleId,
                    subRoles: roles.subRoles,
                    showSubRoles: true,
                    subRolesLoaded: true,
                    groupLevel: 0
                }];
            });
        }

        vm.getCurrentUserName = function () {
            return auth.getUserName();
        };

        vm.getCurrentUserRole = function () {
            return auth.getUserRole();
        };

        //回到用户管理界面-返回到用户组和用户界面（初始界面）在新增或保存用户之后
        vm.goToUserManagerPage = function () {
            vm.groupEditState = 'groupInfo';
            vm.privilegesToBan = [];
            vm.showCreateUserGroup = false;
            vm.showEditUserGroup = false;
            vm.showCreateUser = false;
            vm.showEditUser = false;

            if (vm.parentGroup) {
                delete vm.parentGroup;
            }

            if (vm.selfGroup) {
                delete vm.selfGroup;
            }

            if (vm.editedUserGroup) {
                delete vm.editedUserGroup;
            }
            if (vm.createdError) {
                delete vm.createdError;
            }

            if (vm.newUser) {
                delete vm.newUser;
            }

        };

        vm.cleanErrorMsg = function () {
            vm.newPassValid = 0;
            vm.confirmPassValid = 0;
            if (vm.createdError) {
                delete vm.createdError;
            }
            vm.cleanForms();
        };

        //清空界面属性
        vm.cleanForms = function () {
            vm.showCreateUser = false;
            vm.showEditUser = false;
            vm.showUserTable = true;
            vm.showEditUserGroup = false;
            vm.showUserGroup = true;
            vm.showCreateUserGroup = false;
            if (vm.editedUser) {
                delete vm.editedUser;
            }
            if (vm.newUser) {
                delete vm.newUser;
            }
            if (vm.editedUserGroup) {
                delete vm.editedUserGroup;
            }
            if (vm.createdError) {
                delete vm.createdError;
            }

            if (vm.parentGroup) {
                delete vm.parentGroup;
            }

            if (vm.selfGroup) {
                delete vm.selfGroup;
            }
        };

        //判断是否包含权限
        vm.hasPrivilege = function (p, v) {
            var priv = (vm.editedUserParentGroup && vm.editedUserParentGroup.targetAndActionValueFormList) ? vm.editedUserParentGroup.targetAndActionValueFormList : Enum.get('privilege');
            var t = priv.filter(function (a) {
                return a.name === p;
            });
            //console.log(p + " " + v);
            return v && t && t.length ? (t[0].actionValue >= v) : false;
        };

        //菜单树选择和反选
        vm.changeCM = function (checked, menu) {
            //后台调用时，menu需要赋值
            if (!menu.menuDisabled_infinte && !menu.menuDisabled_temp && (menu.checked !== checked)) {
                menu.checked = checked;
            }
            tunnelDownCheck(menu, checked);
            bubbleUpCheck(menu);
        };

        function tunnelDownCheck(menu, checked) {
            if (menu && menu.subMenus && menu.subMenus.length) {
                menu.subMenus.map(function (subMenu) {
                    if (!subMenu.menuDisabled_infinte && !subMenu.menuDisabled_temp && (subMenu.checked !== checked)) {
                        subMenu.checked = checked;
                    }
                    tunnelDownCheck(subMenu, checked);
                });
            }
        }

        function bubbleUpCheck(menu) {
            if (menu && menu.parentMenu && menu.parentMenu.subMenus) {
                var parentMenu = menu.parentMenu;
                var checked = [], unchecked = [];
                parentMenu.subMenus.forEach(function (m) {
                    switch (m.checked) {
                        case true:
                            checked.push(m);
                            break;
                        case false:
                            unchecked.push(m);
                            break;
                        default://  partial checked
                            break;
                    }
                });
                var allChecked = checked.length === parentMenu.subMenus.length;
                var hasChecked = unchecked.length < parentMenu.subMenus.length;
                parentMenu.checked = hasChecked ? (allChecked ? true : null) : false;

                bubbleUpCheck(parentMenu);
            }
        }

        //禁止菜单可选
        vm.disabledMenusChain = function (disabled, menu, parentMenu, grandparentMenu, greatGrandparentMenu) {
            menu.menuDisabled_temp = disabled;
            if (menu.subMenus && menu.subMenus.length) {
                menu.subMenus.map(function (s) {
                    s.menuDisabled_temp = disabled;
                    vm.disabledMenusChain(disabled, s);
                });
            }
            var submenuDisabled;
            if (parentMenu) {
                submenuDisabled = parentMenu.subMenus.filter(function (m) {
                    return !m.menuDisabled_temp && !m.menuDisabled_infinte;
                });
                parentMenu.menuDisabled_temp = submenuDisabled === null || submenuDisabled.length === 0;
            }
            if (grandparentMenu) {
                submenuDisabled = grandparentMenu.subMenus.filter(function (m) {
                    return !m.menuDisabled_temp && !m.menuDisabled_infinte;
                });
                grandparentMenu.menuDisabled_temp = submenuDisabled === null || submenuDisabled.length === 0;
            }
            if (greatGrandparentMenu) {
                submenuDisabled = greatGrandparentMenu.subMenus.filter(function (m) {
                    return !m.menuDisabled_temp && !m.menuDisabled_infinte;
                });
                greatGrandparentMenu.menuDisabled_temp = submenuDisabled === null || submenuDisabled.length === 0;
            }
        };

        vm.groupPrivilegeEnabled = function (privilegeGroupName, value) {
            var privileges = vm.privilegeGroups[privilegeGroupName];
            if (privileges) {
                var enabled = false;
                privileges.forEach(function (privilegeName) {
                    if (vm.hasPrivilege(privilegeName, value)) {
                        enabled |= true;
                    }
                });
                return enabled;
            }
            return false;
        };

        vm.groupPrivilegeChanged = function (privilegeGroupName, value) {
            var privileges = vm.privilegeGroups[privilegeGroupName];
            if (privileges) {
                privileges.forEach(function (privilegeName) {
                    if (vm.hasPrivilege(privilegeName, value)) {
                        vm.userGroupPrivilege[privilegeName] = value;
                        vm.privilegeChanged(privilegeName, value);
                    }
                });
            }
        };

        //权限对菜单的控制
        vm.privilegeChanged = function (privilege, value) {
            var p = vm.privilegeDict[privilege];
            if (!p) {
                console.log("can not find privilege: " + privilege);
                return;
            }
            var targetMenu = p.menu;
            var name = p.description;

            var isInitial = false;
            switch (targetMenu) {
                case "SETTING_SECURITY_OPERATION":
                    var pri_upgrade = vm.userGroupPrivilege["OPERATION_UPGRADE"];
                    var pri_reboot = vm.userGroupPrivilege["OPERATION_REBOOT"];
                    var pri_reset = vm.userGroupPrivilege["OPERATION_RESET"];
                    var pri_backup = vm.userGroupPrivilege["OPERATION_BACKUP"];

                    //  获取三个权限值并集，取得最大可拥有权限值。
                    var unionPrivilege = pri_upgrade | pri_reboot | pri_reset | pri_backup;
                    var target = "SETTING_SECURITY_OPERATION";
                    menusStatusChanged(isInitial, target, unionPrivilege);
                    break;
                case "USER_MANAGEMENT":
                    if (!isInitial) {
                        vm.userGroupPrivilege["USER_GROUP_MANAGEMENT"] = vm.userGroupPrivilege[privilege];
                    }
                    menusStatusChanged(isInitial, targetMenu, value);
                    break;
                default:
                    menusStatusChanged(isInitial, targetMenu, value);
                    break;
            }

            if (name !== undefined && name !== null && name !== "") {
                var privilegeName = vm.privilegesToBan.filter(function (n) {
                    return n.name === name;
                });

                privilegeName = privilegeName !== undefined && privilegeName !== null && privilegeName.length > 0 ? privilegeName[0] : null;

                switch (value) {
                    case 1:
                        if (privilegeName === null) {
                            vm.privilegesToBan.push({'name': name, 'banStatus': true});
                        }
                        else {
                            privilegeName.banStatus = true;
                        }
                        break;
                    default:
                        if (privilegeName !== null) {
                            privilegeName.banStatus = false;
                        }
                        break;
                }
            }
        };

        //更改菜单是否选中的状态
        vm.menusCheckedChanged = function (target, checked) {
            function findMenuRecursive(menus, target) {
                var targetMenu;
                menus.some(function (value) {
                    //console.log("find '%s' in menu '%s'", target, value.target);
                    if (value.target === target) {
                        targetMenu = value;
                        return true;
                    }
                    //  when target menu started with menu, maybe can find it in this fork(see conf.json)
                    if (value.subMenus && target.indexOf(value.target) === 0) {
                        targetMenu = findMenuRecursive(value.subMenus, target);
                        return !!targetMenu;
                    }
                    return false;
                });
                return targetMenu;
            }

            var menu = findMenuRecursive(vm.editedUserGroup.customizedMenu_parent, target);
            if (menu) {
                vm.changeCM(checked, menu);
            }
        };

        vm.menusDisabledChanged = function (target, disabled) {
            vm.editedUserGroup.customizedMenu_parent.map(function (m1) {
                if (m1.target === target) {
                    vm.disabledMenusChain(disabled, m1);
                }
                else {
                    m1.subMenus.map(function (m2) {
                        if (m2.target === target) {
                            vm.disabledMenusChain(disabled, m2, m1);
                        }
                        else {
                            m2.subMenus.map(function (m3) {
                                if (m3.target === target) {
                                    vm.disabledMenusChain(disabled, m3, m2, m1);
                                }
                            });
                        }
                    });
                }
            });
        };

        function menusStatusChanged(isInitial, target, privilegeValue) {
            if (privilegeValue === 1) {
                //  disable menu temporary, and un-check the disabled menu automatically
                if (!isInitial) {
                    vm.menusCheckedChanged(target, false);
                }
                vm.menusDisabledChanged(target, true);
            }
            else {
                if (!isInitial) {
                    vm.menusDisabledChanged(target, false);
                    vm.menusCheckedChanged(target, true);
                }
            }
        }

        //检查菜单等级
        vm.checkMenuLevel = function (menu) {
            // find lv1, lv2, lv3 menu
            return (menu.split("-").length);
        };

        //通过custonemenusId找到菜单
        vm.findMenuById = function (id, menu) {
            return menu.filter(function (m) {
                return m.customizedMenuId === id;
            });
        };

        //获取菜单icon
        vm.findIconByTarget = function (target) {
            var menu = $rootScope.menuslist.filter(function (data) {
                return data.target === target;
            });

            if (menu !== undefined && menu !== null && menu.length > 0) {
                return menu[0].icon;
            }

            return "";
        };

        //排序
        vm.sortMenus = function (menu) {
            return menu && menu.length && menu.sort(function (m1, m2) {
                    var a = m1.customizedMenuId.split('-');
                    var b = m2.customizedMenuId.split('-');
                    if (a.length !== b.length) {
                        return a.length > b.length ? 1 : -1;
                    }
                    for (var i = 0; i < a.length; i++) {
                        if (a[i] !== b[i]) {
                            return parseInt(a[i]) > parseInt(b[i]) ? 1 : -1;
                        }
                    }
                });
        };

        //创建树
        vm.createMenuTree = function (customizedMenus) {
            var CM = [[], [], [], []];
            var result = [];
            for (var k = 0; k < customizedMenus.length; k++) {
                customizedMenus[k].menuDisabled_infinte = false;
                customizedMenus[k].menuDisabled_temp = false;
                customizedMenus[k].childMenuShow = true;
                customizedMenus[k].checked = customizedMenus[k].active;
                CM[vm.checkMenuLevel(customizedMenus[k].customizedMenuId) - 1].push(customizedMenus[k]);
            }
            var parentLevelId, targetParentMenu;
            for (var i = 0; i < CM.length; i++) {
                vm.sortMenus(CM[i]);
                for (var j = 0; j < CM[i].length; j++) {
                    CM[i][j].subMenus = [];
                    CM[i][j].icon = vm.findIconByTarget(CM[i][j].target);
                    switch (i) {
                        case 0:
                            result.push(CM[i][j]);
                            break;
                        case 1:
                            parentLevelId = CM[i][j].customizedMenuId.split('-')[0];
                            targetParentMenu = vm.findMenuById(parentLevelId, result);
                            targetParentMenu && targetParentMenu.length && targetParentMenu[0].subMenus.push(CM[i][j]) && (CM[i][j].parentMenu = targetParentMenu[0]);
                            bubbleUpCheck(CM[i][j]);
                            break;
                        case 2:
                            parentLevelId = CM[i][j].customizedMenuId.split('-')[0];
                            targetParentMenu = vm.findMenuById(parentLevelId, result);
                            parentLevelId = CM[i][j].customizedMenuId.split('-')[0] + '-' + CM[i][j].customizedMenuId.split('-')[1];
                            targetParentMenu && targetParentMenu.length && (targetParentMenu = vm.findMenuById(parentLevelId, targetParentMenu[0].subMenus));
                            targetParentMenu && targetParentMenu.length && targetParentMenu[0].subMenus.push(CM[i][j]) && (CM[i][j].parentMenu = targetParentMenu[0]);
                            bubbleUpCheck(CM[i][j]);
                            break;
                        case 3:
                            parentLevelId = CM[i][j].customizedMenuId.split('-')[0];
                            targetParentMenu = vm.findMenuById(parentLevelId, result);
                            parentLevelId = CM[i][j].customizedMenuId.split('-')[0] + '-' + CM[i][j].customizedMenuId.split('-')[1];
                            targetParentMenu && targetParentMenu.length && (targetParentMenu = vm.findMenuById(parentLevelId, targetParentMenu[0].subMenus));
                            parentLevelId = CM[i][j].customizedMenuId.split('-')[0] + '-' + CM[i][j].customizedMenuId.split('-')[1] + '-' + CM[i][j].customizedMenuId.split('-')[2];
                            targetParentMenu && targetParentMenu.length && (targetParentMenu = vm.findMenuById(parentLevelId, targetParentMenu[0].subMenus));
                            targetParentMenu && targetParentMenu.length && targetParentMenu[0].subMenus.push(CM[i][j]) && (CM[i][j].parentMenu = targetParentMenu[0]);
                            bubbleUpCheck(CM[i][j]);
                            break;
                        default:
                            break;
                    }
                }
            }
            return result;
        };

        //设置不可更改的disabled属性
        vm.initialInfiniteDisabled = function (menus, parentMenus) {
            menus.map(function (m1) {
                var parentGroup_menus_1 = vm.findMenuById(m1.customizedMenuId, parentMenus);
                if (parentGroup_menus_1 && parentGroup_menus_1.length > 0 && (!parentGroup_menus_1[0].active)) {
                    m1.menuDisabled_infinte = true;
                }

                m1.subMenus.map(function (m2) {
                    var parentGroup_menus_2 = vm.findMenuById(m2.customizedMenuId, parentMenus);
                    if (parentGroup_menus_2 && parentGroup_menus_2.length > 0 && (!parentGroup_menus_2[0].active)) {
                        m2.menuDisabled_infinte = true;
                    }
                    m2.subMenus.map(function (m3) {
                        var parentGroup_menus_3 = vm.findMenuById(m3.customizedMenuId, parentMenus);
                        if (parentGroup_menus_3 && parentGroup_menus_3.length > 0 && (!parentGroup_menus_3[0].active)) {
                            m3.menuDisabled_infinte = true;
                        }
                    });
                });
            });
            return menus;
        };

        //设置暂时的disabled属性 仅在修改权限是需要调用
        vm.initialTempDisabled = function () {
            for (var name in vm.privilegeDict) {
                if (vm.privilegeDict.hasOwnProperty(name)) {
                    var privilege = vm.privilegeDict[name];
                    if (privilege) {
                        menusStatusChanged(true, privilege.menu, vm.userGroupPrivilege[privilege.privilege]);
                    }
                }
            }
        };

        //不允许取消总览菜单和隐藏帮助子集菜单
        vm.disabledOverViewMenuAndHiddenHelpChildren = function (menus) {
            var monitorMenus = menus.filter(function (m) {
                return m.target === "MONITOR";
            })[0];
            monitorMenus.menuDisabled_infinte = true;
            monitorMenus.menuDisabled_temp = true;
            var overView = monitorMenus.subMenus.filter(function (n) {
                return n.target === "MONITOR_OVERVIEW";
            })[0];
            overView.menuDisabled_infinte = true;
            overView.menuDisabled_temp = true;

            //var helpMenus = menus.filter(function (o) {
            //    return o.target === "HELP";
            //})[0];
            //helpMenus.childMenuShow = false;
            //helpMenus.subMenus.map(function (m2) {
            //    m2.childMenuShow = false;
            //    m2.subMenus.map(function (m3) {
            //        m3.childMenuShow = false;
            //    });
            //});
            return menus;
        };

        //获取树保存
        vm.readMenuTree = function (menus) {
            var result = [];
            for (var i = 0; i < menus.length; i++) {
                //if (menu[i].checked) {
                result.push({
                    "customizedMenuId": menus[i].customizedMenuId,
                    "description": menus[i].description,
                    "target": menus[i].target,
                    "active": menus[i].checked !== false
                });
                if (menus[i].subMenus && menus[i].subMenus.length) {
                    result = result.concat(vm.readMenuTree(menus[i].subMenus));
                }
                //}
            }
            return result;
        };

        //创建用户组
        vm.goToCreateUserGroup = function (role) {
            vm.userPrivilegeDisabled = false;

            vm.editedUserGroup = {};
            vm.editedUserGroup.role = {
                name: "",
                comment: "",
                roleLevel: ""
            };
            SystemUser.getUserGroup(role.roleId).then(function (data) {
                vm.parentGroup = angular.copy(data);
                vm.selfGroup = angular.copy(data);

                vm.editedUserGroup.customizedMenu_parent = vm.disabledOverViewMenuAndHiddenHelpChildren(vm.initialInfiniteDisabled(vm.createMenuTree(vm.selfGroup.customizedMenus), vm.parentGroup.customizedMenus));

                //vm.editedUserParentGroup = data;
                vm.editedUserParentGroup = vm.parentGroup;
                vm.editedUserGroup.parentRoleId = role.roleId;
                vm.editedUserGroup.role.roleLevel = role.roleLevel === "ADMIN" || role.roleLevel === "ROOT" ? "NORMAL" : role.roleLevel;
                vm.editedUserGroup.targetAndActionValueFormList = [];
                vm.userGroupPrivilege = [];

                var targetAndActionValueFormList = data.targetAndActionValueFormList ? data.targetAndActionValueFormList : vm.currentUser.targetAndActionValueFormList;
                for (var count = 0; count < targetAndActionValueFormList.length; count++) {

                    //var config = vm.currentUser.targetAndActionValueFormList[count];
                    var config = targetAndActionValueFormList[count];
                    vm.editedUserGroup.targetAndActionValueFormList.push({
                        name: config.name,
                        actionValue: config.actionValue,
                        description: config.description
                    });
                    vm.userGroupPrivilege[config.name] = config.actionValue;
                }

                vm.showCreateUserGroup = true;
                vm.showEditUserGroup = false;
                vm.showCreateUser = false;
                vm.showEditUser = false;
                vm.groupEditState = 'groupInfo';
                vm.groupFormValid = false;
                autofocusCtrl.focusById('systemUserGroupEditInput');
            }, function () {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '网络不通，获取用户组信息失败，请重试！'
                });
                return;

            });
        };

        //编辑用户界面
        vm.goToEditUserGroup = function () {
            vm.groupEditState = 'groupInfo';
            vm.showCreateUserGroup = false;
            vm.showEditUserGroup = true;
            vm.showCreateUser = false;
            vm.showEditUser = false;

            vm.createdError = {
                nameVoid: false,
                nameOversize: false,
                commentVoid: false,
                commentOversize: false,
                errorNumber: 0
            };
        };

        //前往编辑用户组界面
        vm.editUserGroup = function (role) {
            vm.groupFormValid = true;
            //vm.currentCM = role.rootMenu;
            SystemUser.getUserGroup(role.roleId).then(function (data) {
                SystemUser.getUserGroup(role.parentRoleId ? role.parentRoleId : role.roleId).then(function (data_parent) {
                    vm.parentGroup = angular.copy(data_parent);
                    vm.selfGroup = angular.copy(data);

                    vm.editedUserGroup = vm.selfGroup;
                    vm.editedUserParentGroup = vm.parentGroup;

                    vm.userPrivilegeDisabled = vm.currentUserdisabledEditUserGroup || vm.editedUserGroup.role.defaultRole || vm.getCurrentUserRole()[0].roleId === vm.editedUserGroup.role.roleId;

                    vm.editedUserGroup.customizedMenu_parent = vm.disabledOverViewMenuAndHiddenHelpChildren(vm.initialInfiniteDisabled(vm.createMenuTree(vm.selfGroup.customizedMenus), vm.parentGroup.customizedMenus));

                    vm.userGroupPrivilege = [];
                    for (var j = 0; j < vm.editedUserGroup.targetAndActionValueFormList.length; j++) {
                        vm.userGroupPrivilege[vm.editedUserGroup.targetAndActionValueFormList[j].name] = vm.editedUserGroup.targetAndActionValueFormList[j].actionValue;
                    }

                    if (vm.editedUserGroup.locked) {
                        vm.editedUserGroup.locked = 'on';
                    } else {
                        vm.editedUserGroup.locked = 'off';
                    }

                    vm.initialTempDisabled();
                    vm.goToEditUserGroup();
                });
            }, function () {
                //$rootScope.addAlert({
                //    type: 'danger',
                //    content: error.data.error
                //});
                $rootScope.addAlert({
                    type: 'danger',
                    content: '网络不通，获取用户组信息失败，请重试！'
                });
                return;
            });
        };

        vm.validationGroupForm = function () {
            if (vm.editedUserGroup.role.name) {
                vm.groupFormValid = true;
            } else {
                vm.groupFormValid = false;
            }
        };

        //保存新用户组或更改的用户组
        vm.saveEditUserGroup = function (tempGroup) {
            var promise = [];
            vm.updateUserGroupPromise = SystemUser.updateUserGroup(tempGroup).then(function () {
                //if (!tempGroup.role.defaultRole) {
                //    SystemUser.assignDevice(tempGroup.role.roleId, tempGroup.deviceIds).then(function () {
                //        if (vm.userEdit_currentRole) {
                //            promise.push(SystemUser.getUsersByRoleId(vm.userEdit_currentRole.roleId));
                //        } else {
                //            promise.push(SystemUser.getUsers());
                //        }
                //        promise.push(SystemUser.getRoles());
                //        promise.push(SystemUser.getCurrentUser());
                //
                //        $q.all(promise).then(function (data) {
                //            vm.table = data[0].users;
                //            (!vm.userEdit_currentRole) && (vm.table = vm.table.concat(data[0].subUsers));
                //            vm.currentRole = data[1].currentRole;
                //            vm.subRoles = data[1].subRoles;
                //            vm.currentUser = data[2];
                //            loadRoleTree();
                //            vm.goToUserGroup();
                //            //if (uiCtrl.isRemote()) {
                //            //    System.syncDataToAllInOne().then(function () {
                //            //    }, function (error) {
                //            //        console.log(error.data.error);
                //            //        $rootScope.addAlert({
                //            //            type: 'danger',
                //            //            content: '用户信息同步失败！'
                //            //        });
                //            //    });
                //            //}
                //            $rootScope.addAlert({
                //                type: 'success',
                //                content: '用户组信息修改成功！'
                //            });
                //        });
                //    }, function (data) {
                //        console.log(data.data.error);
                //        $rootScope.addAlert({
                //            type: 'danger',
                //            content: '安全设备管理权限修改失败！' + data.data.error
                //        });
                //    });
                //} else {
                //    if (vm.userEdit_currentRole) {
                //        promise.push(SystemUser.getUsersByRoleId(vm.userEdit_currentRole.roleId));
                //    } else {
                promise.push(SystemUser.getUsers());
                //}
                promise.push(SystemUser.getRoles());
                promise.push(SystemUser.getCurrentUser());
                $q.all(promise).then(function (data) {
                    vm.table = data[0].users;
                    vm.currentRole = data[1].currentRole;
                    vm.subRoles = data[1].subRoles;
                    vm.currentUser = data[2];
                    loadRoleTree();
                    vm.goToUserManagerPage();
                    $rootScope.addAlert({
                        type: 'success',
                        content: '用户组信息修改成功！'
                    });
                });
                //}
            }, function (data) {
                vm.createdError.passwordInvalid = true;
                vm.createdError.message = data.data.error;
                console.log(data.data.error);
                $rootScope.addAlert({
                    type: 'danger',
                    content: '用户组信息修改失败！' + data.data.error
                });
            });
        };

        vm.saveNewUserGroup = function (tempGroup) {
            vm.updateUserGroupPromise = SystemUser.createGroup(tempGroup).then(
                function () {
                    //promise.push(SystemUser.getUsers());
                    //promise.push(SystemUser.getRoles());
                    //promise.push(SystemUser.getCurrentUser());
                    //
                    //$q.all(promise).then(function (data) {
                    //vm.table = data[0].users;
                    //vm.currentRole = data[1].currentRole;
                    //vm.subRoles = data[1].subRoles;
                    //vm.currentUser = data[2];
                    delete vm.createdError;
                    delete vm.editedUserGroup;
                    loadRoleTree();
                    vm.goToUserManagerPage();
                    $rootScope.addAlert({
                        type: 'success',
                        content: '用户组创建成功！'
                    });

                    //});
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '用户组创建失败！' + data.data.error
                    });
                }
            );
        };

        vm.saveUserGroup = function () {
            vm.createdError = {
                nameVoid: false,
                nameOversize: false,
                commentVoid: false,
                commentOversize: false,
                errorNumber: 0
            };

            if (!vm.editedUserGroup.role.name) {
                vm.createdError.nameVoid = true;
                vm.createdError.errorNumber++;
            } else if (vm.editedUserGroup.role.name.length > 64) {
                vm.createdError.nameOversize = true;
                vm.createdError.errorNumber++;
            }

            if (vm.editedUserGroup.role.comment && vm.editedUserGroup.role.comment.length > 64) {
                vm.createdError.commentOversize = true;
                vm.createdError.errorNumber++;
            }

            if (vm.createdError.errorNumber === 0) {

                vm.editedUserGroup.targetAndActionValueFormList.map(function (t) {
                    t.actionValue = vm.userGroupPrivilege[t.name];
                });

                var tempGroup = angular.copy(vm.editedUserGroup);
                //console.log(tempGroup);
                tempGroup.customizedMenus = vm.readMenuTree(tempGroup.customizedMenu_parent);
                delete tempGroup.customizedMenu_parent;

                //var promise = [];
                if (tempGroup.role.roleId) {

                    var banPrivileges = vm.getPrivilegeChangedToBan();

                    if (banPrivileges !== "") {
                        vm.groupPrivilegeChangedWarningConfirmPopup(banPrivileges, tempGroup);
                    } else {
                        vm.saveEditUserGroup(tempGroup);
                    }
                } else {
                    vm.saveNewUserGroup(tempGroup);
                }
            }
        };

        //获取所有更改为禁止的权限
        vm.getPrivilegeChangedToBan = function () {
            var banPrivileges = vm.privilegesToBan.filter(function (m) {
                return m.banStatus;
            });

            var privileges = "";
            banPrivileges = banPrivileges && banPrivileges.length > 0 ? banPrivileges : [];
            for (var i = 0; i < banPrivileges.length; i++) {
                privileges += banPrivileges[i].name + ",";
            }
            if (privileges.length > 0) {
                privileges = privileges.substring(0, privileges.length - 1);
            }
            return privileges;
        };

        vm.groupPrivilegeChangedWarningConfirmPopup = function (privileges, tempgroup) {
            var modalInstance = $modal.open({
                templateUrl: 'changePrivilegeToForbidWarning.html',
                controller: groupPrivilegeChangedModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    privileges: function () {
                        return privileges;
                    },
                    tempgroup: function () {
                        return tempgroup;
                    }
                }
            });

            function groupPrivilegeChangedModalInstanceCtrl($scope, $modalInstance, privileges, tempgroup) {
                $scope.privileges = privileges;
                $scope.tempgroup = tempgroup;
                $scope.ok = function () {
                    vm.saveEditUserGroup(tempgroup);
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        vm.deleteGroup = function (roleId) {
            SystemUser.deleteGroup(roleId).then(function (data) {
                if (data.data) {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '用户组删除成功！'
                    });
                    loadRoleTree();
                }
            }, function () {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '用户组删除失败！'
                });
            });
        };

        vm.deleteGroupConfirmPopup = function (roleId, roleName) {
            var modalInstance = $modal.open({
                templateUrl: 'deleteUserGroup-popup.html',
                controller: GroupModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    roleId: function () {
                        return roleId;
                    },
                    roleName: function () {
                        return roleName;
                    }
                }
            });

            function GroupModalInstanceCtrl($scope, $modalInstance, roleId, roleName) {
                $scope.name = roleName;
                $scope.ok = function () {
                    vm.deleteGroup(roleId);
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        //前往编辑用户
        vm.goToEditUser = function () {
            //vm.showCreateUserGroup = false;
            //vm.showEditUserGroup = false;
            vm.newPassValid = 0;
            vm.confirmPassValid = 0;
            vm.requestError = "";
            vm.formValid = false;
            vm.groupFormValid = false;
            //vm.showUserTable = false;
            //vm.showCreateUser = false;
            //vm.showEditUser = true;

            vm.showCreateUserGroup = false;
            vm.showEditUserGroup = false;
            vm.showCreateUser = false;
            vm.showEditUser = true;
        };

        //新增用户
        vm.goToCreateUser = function (role) {
            vm.showCreateUserGroup = false;
            vm.showEditUserGroup = false;
            vm.showCreateUser = true;
            vm.showEditUser = false;
            //vm.showCreateUserGroup = false;
            //vm.showEditUserGroup = false;
            vm.newPassValid = 0;
            vm.confirmPassValid = 0;
            vm.requestError = "";
            vm.formValid = false;
            autofocusCtrl.focusById('input-username');
            //vm.showUserTable = false;
            //vm.showEditUser = false;
            //vm.showCreateUser = true;
            vm.createdError = {};
            vm.selectedUserGroup = role;
        };

        //编辑用户
        vm.editUser = function (index) {
            vm.goToEditUser();
            vm.formValid = true;
            vm.editedUser = angular.copy(vm.table[index]);
            vm.editedUser._roleId = vm.editedUser._roles[0].roleId;
            if (vm.editedUser.locked) {
                vm.editedUser.locked = true;
            } else {
                vm.editedUser.locked = false;
            }

            vm.createdError = {
                nameVoid: false,
                nameOversize: false,
                commentVoid: false,
                commentOversize: false,
                errorNumber: 0
            };
        };

        vm.delete = function (userId, roleId) {
            SystemUser.deleteUser(userId).then(function (data) {
                if (data.data) {
                    var promise = [];
                    promise.push(SystemUser.getUsersByRoleId(roleId));
                    $q.all(promise).then(function (data) {
                        vm.table = data[0].users;
                    });
                    $rootScope.addAlert({
                        type: 'success',
                        content: '用户删除成功！'
                    });
                    loadRoleTree();
                }
            }, function () {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '用户删除失败！'
                });
            });
        };

        vm.deleteConfirmPopup = function (user) {
            var modalInstance = $modal.open({
                templateUrl: 'delete-popup.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    userId: function () {
                        return user.userId;
                    },
                    userName: function () {
                        return user.name;
                    },
                    roleId: function () {
                        return user._roles[0].roleId;
                    }
                }
            });

            function ModalInstanceCtrl($scope, $modalInstance, userId, userName, roleId) {
                $scope.name = userName;
                $scope.ok = function () {
                    vm.delete(userId, roleId);
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        vm.validatePassword = function (newPassword, confirmNewPassword) {
            var ret = passwordValidationService.validator(newPassword, confirmNewPassword, vm.passwordComplexityStrategy.strategyRules[0].ruleData);
            vm.newPassValid = ret.newPassValid;
            vm.confirmPassValid = ret.confirmPassValid;
            vm.allValid = ret.allValid;
            return ret.allValid;
        };

        vm.validateNewUserForm = function () {
            vm.requestError = "";
            vm.formValid = true;
            if (vm.newUser === undefined) {
                vm.formValid = false;
                return;
            }
            if (!vm.newUser.name) {
                vm.formValid = false;
            } else {
                var matchStr = /^[a-zA-Z0-9_]{0,20}$/;
                if (!vm.newUser.name.match(matchStr)) {
                    vm.requestError = "用户名不符合规则";
                    vm.formValid = false;
                }
            }
            if (!vm.newUser.stuffName) {
                vm.formValid = false;
            }
            if (!vm.allValid) {
                vm.formValid = false;
            }
        };

        vm.validateEditUserForm = function () {
            vm.requestError = "";
            vm.formValid = true;
            if (vm.editedUser === undefined) {
                vm.formValid = false;
                return;
            }
            if (!vm.editedUser.name) {
                vm.formValid = false;
            } else {
                var matchStr = /^[a-zA-Z0-9!@#$%^&*_]{0,64}$/;
                if (!vm.editedUser.name.match(matchStr)) {
                    vm.requestError = "用户名不符合规则";
                    vm.formValid = false;
                }
            }
            if (!vm.editedUser.stuffName) {
                vm.formValid = false;
            }
            if (!vm.allValid && (vm.editedUser.newPassword || vm.editedUser.confirmNewPassword)) {
                vm.formValid = false;
            }
            if (!vm.editedUser._roleId) {
                vm.formValid = false;
            }
        };

        //保存新用户
        vm.saveNewUser = function () {
            //remove password validation signals
            vm.newPassValid = 0;
            vm.confirmPassValid = 0;
            vm.newUser.passwordHash = vm.newUser.newPassword;
            vm.newUser._roles = [{
                roleId: vm.selectedUserGroup.roleId
            }];
            delete vm.newUser._roleId;
            delete vm.newUser.newPassword;
            delete vm.newUser.confirmNewPassword;
            vm.updateUserGroupPromise = SystemUser.createUser(vm.newUser).then(function (data) {
                if (data) {
                    vm.requestError = "";
                    //var promise = [];
                    //promise.push(SystemUser.getUsersByRoleId(vm.newUser._roles[0].roleId));
                    //
                    //$q.all(promise).then(function (data) {
                    //vm.table = data[0].users;
                    vm.goToUserManagerPage();
                    //(!vm.userEdit_currentRole) && (vm.table = vm.table.concat(data[0].subUsers));
                    //vm.currentRole = data[1].currentRole;
                    //vm.subRoles = data[1].subRoles;
                    delete vm.createdError;
                    delete vm.newUser;
                    $rootScope.addAlert({
                        type: 'success',
                        content: '创建用户成功！'
                    });
                    loadRoleTree();
                    //});
                } else {
                    vm.requestError = data.message;
                }
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '创建用户失败！'
                });
                if (data.data.error === '用户名已经存在。') {
                    vm.requestError = data.data.error;
                    vm.formValid = false;
                    vm.allValid = false;
                }
            });
        };

        //保存编辑用户
        vm.saveEditedUser = function () {
            vm.newPassValid = 0;
            vm.confirmPassValid = 0;
            if (vm.editedUser.newPassword) {
                vm.editedUser.passwordHash = vm.editedUser.newPassword;
            }
            vm.editedUser._roles = [{
                roleId: vm.editedUser._roleId
            }];
            delete vm.editedUser._roleId;
            delete vm.editedUser.newPassword;
            delete vm.editedUser.confirmNewPassword;
            var pro = [SystemUser.lockUser(vm.editedUser.locked ? "lock" : "unlock", vm.editedUser.userId)];
            if (vm.editedUser.locked === 'on') {
                vm.editedUser.locked = true;
            } else {
                vm.editedUser.locked = false;
            }
            pro.push(SystemUser.editUser(vm.editedUser));
            $q.all(pro).then(function () {
                var promise = [];

                promise.push(SystemUser.getUsersByRoleId(vm.editedUser._roles[0].roleId));

                $q.all(promise).then(function (data) {
                    vm.table = data[0].users;
                    //(!vm.userEdit_currentRole) && (vm.table = vm.table.concat(data[0].subUsers));
                    //vm.currentRole = data[1].currentRole;
                    //vm.subRoles = data[1].subRoles;
                    //roles = data[1];
                    //roles.subRoles.map(function (r) {
                    //    r.groupLevel = 1;
                    //});
                    //vm.userGroupTree = [{
                    //    name: roles.currentRole.name,
                    //    roleId: roles.currentRole.roleId,
                    //    subRoles: roles.subRoles,
                    //    showSubRoles: false,
                    //    subRolesLoaded: true,
                    //    groupLevel: 0
                    //}];
                    delete vm.createdError;
                    delete vm.editedUser;
                    vm.goToUserManagerPage();
                });
            }, function (error) {
                console.log(error);
                if (error.data.error === "用户名已经存在。") {
                    vm.editedUser.locked = vm.editedUser.locked ? "on" : "off";
                    vm.requestError = error.data.error;
                    vm.formValid = false;
                    vm.allValid = false;
                }
            });
        };

        //=============================================== User Group Tree ===============================================
        // Initial:
        roles.subRoles.map(function (r) {
            r.groupLevel = 1;
        });
        vm.userGroupTree = [{
            name: roles.currentRole.name,
            roleId: roles.currentRole.roleId,
            subRoles: roles.subRoles,
            showSubRoles: true,
            subRolesLoaded: true,
            groupLevel: 0
        }];

        //vm.refreshRoleLists = loadRoleTree;

        vm.showSubRoles = function (role) {
            if (role.showSubRoles && !role.subRolesLoaded) {
                var promise = [];
                promise.push(SystemUser.getUserGroup(role.roleId));
                //promise.push(SystemUser.getUsersByRoleId(role.roleId));
                $q.all(promise).then(function (data) {
                    role.subRoles = data[0].subRoles;
                    //role.user = data[1];
                    role.showSubRoles = true;
                    role.subRolesLoaded = true;
                    role.subRoles.map(function (r) {
                        r.showSubRoles = false;
                        r.subRolesLoaded = false;
                        r.groupLevel = role.groupLevel + 1;
                    });
                });
            }
        };
    }

    function RootUserCtrl(SystemUser, users, user, auth, $q, strategyInfo, passwordValidationService, $rootScope) {
        var vm = this;
        vm.table = users.subUsers;

        vm.showEditUser = false;
        vm.showUserTable = true;
        vm.currentUser = user;
        vm.requestError = "";
        vm.createdError = {};

        vm.userLockedChanged = function (user) {
            SystemUser.lockUser(user.locked ? "lock" : "unlock", user.userId).then(function (data) {
                if (data.data) {
                    $rootScope.addAlert({
                        type: 'success',
                        content: user.locked ? '锁定成功！' : "解锁成功!"
                    });
                }
                else {
                    user.locked = !user.locked;
                    $rootScope.addAlert({
                        type: 'danger',
                        content: user.locked ? '锁定失败！' : "解锁失败!"
                    });
                }
            });
        };

        vm.passwordComplexityStrategy = passwordValidationService.getPassComplexity(strategyInfo.data);
        vm.passwordComplexityMessage = passwordValidationService.getPassComplexityMessage(vm.passwordComplexityStrategy.strategyRules[0].ruleData);
        vm.passwordErrormessages = passwordValidationService.errorMessages;

        vm.getCurrentUserName = function () {
            return auth.getUserName();
        };

        vm.getCurrentUserRole = function () {
            return auth.getUserRole();
        };

        vm.goToUserManagerPage = function () {
            vm.showEditUser = false;
            vm.showUserTable = true;

            if (vm.editedUser) {
                delete vm.editedUser;
            }
        };

        vm.goToEditUser = function () {
            vm.newPassValid = 0;
            vm.confirmPassValid = 0;
            vm.requestError = "";
            vm.formValid = false;
            vm.groupFormValid = false;
            vm.showUserTable = false;
            vm.showEditUser = true;
        };

        vm.editUser = function (index) {
            vm.formValid = true;
            vm.editedUser = angular.copy(vm.table[index]);
            vm.goToEditUser();
            vm.editedUser._roleId = vm.editedUser._roles[0].roleId;
            if (vm.editedUser.locked) {
                vm.editedUser.locked = true;
            } else {
                vm.editedUser.locked = false;
            }

            vm.createdError = {
                nameVoid: false,
                nameOversize: false,
                commentVoid: false,
                commentOversize: false,
                errorNumber: 0
            };
        };

        vm.validatePassword = function (newPassword, confirmNewPassword) {
            var ret = passwordValidationService.validator(newPassword, confirmNewPassword, vm.passwordComplexityStrategy.strategyRules[0].ruleData);
            vm.newPassValid = ret.newPassValid;
            vm.confirmPassValid = ret.confirmPassValid;
            vm.allValid = ret.allValid;
            return ret.allValid;
        };

        vm.validateEditUserForm = function () {
            vm.requestError = "";
            vm.formValid = true;
            if (vm.editedUser === undefined) {
                vm.formValid = false;
                return;
            }
            if (!vm.editedUser.name) {
                vm.formValid = false;
            } else {
                var matchStr = /^[a-zA-Z0-9!@#$%^&*_]{0,64}$/;
                if (!vm.editedUser.name.match(matchStr)) {
                    vm.requestError = "用户名不符合规则";
                    vm.formValid = false;
                }
            }
            if (!vm.editedUser.stuffName) {
                vm.formValid = false;
            }
            if (!vm.allValid && (vm.editedUser.newPassword || vm.editedUser.confirmNewPassword)) {
                vm.formValid = false;
            }
            if (!vm.editedUser._roleId) {
                vm.formValid = false;
            }

            vm.formValid = vm.validatePassword(vm.editedUser.newPassword, vm.editedUser.confirmNewPassword);
        };

        vm.saveEditedUser = function () {
            vm.newPassValid = 0;
            vm.confirmPassValid = 0;
            if (vm.editedUser.newPassword) {
                vm.editedUser.passwordHash = vm.editedUser.newPassword;
            }
            vm.editedUser._roles = [{
                roleId: vm.editedUser._roleId
            }];
            delete vm.editedUser._roleId;
            delete vm.editedUser.newPassword;
            delete vm.editedUser.confirmNewPassword;
            var pro = [SystemUser.lockUser(vm.editedUser.locked ? "lock" : "unlock", vm.editedUser.userId)];
            if (vm.editedUser.locked === 'on') {
                vm.editedUser.locked = true;
            } else {
                vm.editedUser.locked = false;
            }
            pro.push(SystemUser.editUser(vm.editedUser));
            $q.all(pro).then(function () {
                var promise = [];

                promise.push(SystemUser.getDefaultUser());

                $q.all(promise).then(function (data) {
                    vm.table = data[0].subUsers;
                    //(!vm.userEdit_currentRole) && (vm.table = vm.table.concat(data[0].subUsers));
                    delete vm.createdError;
                    delete vm.editedUser;
                    vm.goToUserManagerPage();
                });
            }, function (error) {
                console.log(error);
                if (error.data.error === "用户名已经存在。") {
                    vm.editedUser.locked = vm.editedUser.locked ? "on" : "off";
                    vm.requestError = error.data.error;
                    vm.formValid = false;
                    vm.allValid = false;
                }
            });
        };
    }
})();
