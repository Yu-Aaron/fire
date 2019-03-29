/**
 * Authorization Service
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('auth', authorization);

    function authorization($q, $rootScope, $http, $state, localStorage, $modalStack, URI, Enum, topologyId, $timeout, SystemUser, Device, uiCtrl, uiTree, System) {
        $rootScope.domainLogin = (sessionStorage.getItem('domainLogin')) ? JSON.parse(sessionStorage.getItem('domainLogin')) : {};
        var _identity = {
            name: ''
        };

        var service = {
            login: login,
            autoLogin: autoLogin,
            autoLoginAll: autoLoginAll,
            unlockUser: unlockUser,
            logout: logout,
            whoAmI: whoAmI,
            getLevel: getLevel,
            getUserName: getUserName,
            getUserType: getUserType,
            getUserRole: getUserRole,
            getVerifyCodeImage: getVerifyCodeImage,
            getSecretKey: getSecretKey,
            validateState: validateState,
            clear: clear
        };
        return service;

        function login(credentials) {
            //, $http.get('js/conf.json'), $http.get('js/logo.json')
            return $q.all([$http({
                method: 'POST',
                url: URI + '/login',
                data: credentials,
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join("&");
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })]).then(function (data) {
                var user = data[0].data;
                var result = {
                    msg: '',
                    done: false
                };

                //var basicInfo = BUILD;
                //if (basicInfo) {
                //    $rootScope.VERSION_NUMBER = basicInfo;
                //} else {
                //    $rootScope.VERSION_NUMBER = "非正式版本";
                //}
                //var customerID = $rootScope.VERSION_NUMBER.slice(-4);
                //if (customerID === '-C05' && credentials.username === btoa('root')) {
                //    result.msg = '登录失败，账户不存在或密码错误';
                //    service.logout();
                //    return result;
                //}

                if (!user.success) {
                    result.msg = user.message;
                    return result;
                } else {
                    localStorage.removeItem('customizedMenus');
                    //localStorage.removeItem('domain_getDomain');

                    return service.whoAmI().then(function () {
                        // ServiceWorker.broadcast('loginSuccess');
                        //$rootScope.userRoleTypeC05 = ($rootScope.isC05 && Enum.get('Role')) ? (Enum.get('Role')[0].name === "高级系统管理员" ? 0 : (Enum.get('Role')[0].name === "高级安全保密管理员" ? 1 : (Enum.get('Role')[0].name === "高级安全审计员" ? 2 : -1))) : -1;
                        localStorage.setItem('loginSuccess', '1');
                        result.done = true;
                        return result;
                    });
                }
            });
        }

        function autoLogin(ip, port) {
            if (!ip || $rootScope.domainLogin[ip] || $rootScope.MW_SETTING === 'allInOne') {
                return;
            }
            var head;
            if ($rootScope.isProduction) {
                head = "https://";
                port = "";
            } else {
                head = "http://";
                port = port ? port : ":3000";
            }

            return $http({
                method: 'POST',
                url: head + ip + (port ? port : '') + URI + "/autologin",
                data: {username: 'admin', securitykey: localStorage.getItem('securityKey')},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join("&");
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(function () {
                $rootScope.domainLogin[ip] = ip;
                sessionStorage.setItem('domainLogin', JSON.stringify($rootScope.domainLogin));
                //console.log(JSON.stringify($rootScope.domainLogin));
            });
        }

        function autoLoginAll() {
            if (!$rootScope.autoLoginAll) {
                var filter = 'category eq SECURITY_DEVICE';
                (function getDpiData() {
                    var payload = {'$filter': filter};
                    return Device.getAll(payload, localStorage.getItem('topologyId')).then(function (data) {
                        var arr = data.map(function (d) {
                            for (var j = 0; j < d.devicePorts.length; j++) {
                                if (d.devicePorts[j].isMgmtPort) {
                                    d.mgmtIp = d.devicePorts[j].portIp;
                                }
                            }
                            return autoLogin(d.mgmtIp);
                        });
                        return arr.length ? $q.all(arr).then(function () {
                            $rootScope.autoLoginAll = true;
                        }) : [];
                    });
                })();
            }
        }

        function unlockUser(credentials) {
            return $http({
                method: 'POST',
                url: URI + '/users/unlock',
                data: credentials,
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join("&");
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }

        function logout() {
            return $http.post(URI + '/logout').then(function (data) {
                if (data.data) {
                    service.clear();
                }
            });
        }

        var getSecretKeyPending = false;
        function getSecretKey(fromCache) {
            if(fromCache && $rootScope.secretKey) {
                return $q(function (resolve) {
                    resolve($rootScope.secretKey);
                });
            }
            if(getSecretKeyPending) {
                return $q(function (resolve) {
                    $timeout(function () {
                        resolve(getSecretKey(true));
                    }, 200);
                });
            }
            getSecretKeyPending = true;
            return $http.get(URI + '/users/getSecretKey').then(function (data) {
                getSecretKeyPending = false;
                localStorage.setItem('secretKey', data.data);
                $rootScope.secretKey = data.data;
                return data;
            });
        }

        function getVerifyCodeImage() {
            return $http.get(URI + '/users/getImage').then(function (data) {
                return data;
            });
        }

        function whoAmI() {
            return $q.all([
                $http.get(URI + '/users/whoami'),
                $http.get('js/conf.json'),
                $http.get('js/logo.json')
                //$http.get('js/rootPrivilege.json'),
                //$http.get('js/globalConf.json'),
                //System.loadRunningMode()
            ]).then(function (data) {
                // set root user privilege on UI side
                $rootScope.isRootUser = false;
                if (data[0].data.user.name === 'root' && data[0].data.user._roles[0].roleId === "0") {
                    //data[0].data.targetAndActionValueFormList = data[3].data.targetAndActionValueFormList;
                    $rootScope.isRootUser = true;
                }
                // Set whitelist/blacklist/ipmac privilege on UI side
                //var policyValue = data[0].data.targetAndActionValueFormList.filter(function (t) {
                //    return t.name === "POLICY";
                //});
                //var policyActionValueFormList = [{
                //    "name": "BLACKLIST",
                //    "actionValue": policyValue && policyValue.length ? policyValue[0].actionValue : 1,
                //    "description": "黑名单"
                //}, {
                //    "name": "WHITELIST",
                //    "actionValue": policyValue && policyValue.length ? policyValue[0].actionValue : 1,
                //    "description": "白名单"
                //}, {
                //    "name": "IP_MAC",
                //    "actionValue": policyValue && policyValue.length ? policyValue[0].actionValue : 1,
                //    "description": "IP/MAC"
                //}, {
                //    "name": "MALICIOUS_DOMAIN",
                //    "actionValue": policyValue && policyValue.length ? policyValue[0].actionValue : 1,
                //    "description": "域名规则"
                //}];
                //data[0].data.targetAndActionValueFormList = data[0].data.targetAndActionValueFormList.concat(policyActionValueFormList);

                setVersionData();

                return uiCtrl.getUI().then(function () {
                    _identity = data[0].data.user;
                    Enum.set('privilege', data[0].data.targetAndActionValueFormList);
                    //Enum.set('deviceAccess', data[0].data.deviceIds);
                    Enum.set('Role', data[0].data.user._roles);
                    Enum.set('userType', data[0].data.user._type);
                    //var userWidgetOptionSettings = data[0].data.userWidgetOptionSettings;
                    //for (var i = 0; i < userWidgetOptionSettings.length; i++) {
                    //    userWidgetOptionSettings[i]._widgetCNName = $filter('resFilter')(userWidgetOptionSettings[i]._widgetCNName, userWidgetOptionSettings[i]._widgetName);
                    //}
                    //Enum.set('Widget', userWidgetOptionSettings);
                    //$rootScope.$broadcast('privilege', 0);
                    $rootScope.config = data[1].data;
                    $rootScope.logo = data[2].data;

                    $rootScope.menuslist = MenusTreetoList($rootScope.config.dashboard);
                    //$rootScope.simplifyModelName = data[4].data.simplifyModelName;

                    // Use default customized menus if it's root user and failed to get customized menu
                    //if (!($rootScope.customizedMenus && $rootScope.customizedMenus.length)) {
                    //    if (data[0].data.user.name === 'root' || data[0].data.user.name === 'sysadmin') {
                    //        $http.get('js/customizedmenu.json').then(function (cdata) {
                    //            $rootScope.customizedMenus = cdata.data;
                    //            $rootScope.customizedMenusFailed = true;
                    //            uiTree.init();
                    //            uiTree.initPrivilegeValue();
                    //        });
                    //    } else {
                    //        console.log("Customized Menu Error!");
                    //        console.log($rootScope.customizedMenus);
                    //        $http.post(URI + '/logout');
                    //        window.location.replace("index-error.html");
                    //        return;
                    //    }
                    //} else {
                    uiTree.init(_identity._type);
                    //uiTree.initPrivilegeValue();
                    //}

                    //$rootScope.isProduction = true;
                    //$http.get('js/local.json').then(function (data) {
                    //    $rootScope.isProduction = data.data.isProduction;
                    //});

                    var promise = [];
                    //if ($rootScope.MW_SETTING === 'remote') {
                    //    ////Init DPI Devices when not init or new device has been found
                    //    if (!$rootScope.ucdInfo || $rootScope.newDeviceFound) {
                    //        $rootScope.newDeviceFounducd = false;
                    //        $rootScope.ucdInfo = [];
                    //        var filter = 'category eq SECURITY_DEVICE';
                    //        var payload = {'$filter': filter};
                    //        promise.push(Device.getAll(payload).then(function (data) {
                    //            var arr = data.map(function (d) {
                    //                var tmp;
                    //                for (var j = 0; j < d.devicePorts.length; j++) {
                    //                    if (d.devicePorts[j].isMgmtPort) {
                    //                        d.mgmtIp = d.devicePorts[j].portIp;
                    //                        tmp = {
                    //                            ip: d.mgmtIp,
                    //                            deviceId: d.deviceId,
                    //                            topoId: ''
                    //                        };
                    //                    }
                    //                }
                    //                $rootScope.ucdInfo.push(tmp);
                    //                return Device.getSubTopo(d.deviceId).then(function (data) {
                    //                    for (var i = 0; i < $rootScope.ucdInfo.length; i++) {
                    //                        if ($rootScope.ucdInfo[i].deviceId === data.deviceId) {
                    //                            $rootScope.ucdInfo[i].topoId = data.topologyId;
                    //                            delete $rootScope.ucdInfo[i].deviceId;
                    //                            break;
                    //                        }
                    //                    }
                    //                });
                    //            });
                    //            return arr.length ? $q.all(arr).then(function () {
                    //                console.log("Init DPI");
                    //            }) : [];
                    //        }));
                    //    }
                    //}
                    $q.all(promise).then(function () {
                        //$rootScope.isC05 = $rootScope.VERSION_NUMBER.slice(-4) === '-C05';
                        //$rootScope.isC00 = $rootScope.VERSION_NUMBER.slice(-4) === '-C00';
                        //$rootScope.isC02 = $rootScope.VERSION_NUMBER.slice(-4) === '-C02';
                        //$rootScope.isC06 = $rootScope.VERSION_NUMBER.slice(-4) === '-C06';
                        //$rootScope.userRoleTypeC05 = $rootScope.isC05 ? (Enum.get('Role')[0].name === "高级系统管理员" ? 0 : (Enum.get('Role')[0].name === "高级安全保密管理员" ? 1 : (Enum.get('Role')[0].name === "高级安全审计员" ? 2 : -1))) : -1;
                        $rootScope.$broadcast('username', _identity);
                        //if ($state.is('auth')) {
                        //    $state.transitionTo('monitor.overview');
                        //}
                        SystemUser.userToken();
                        return true;
                    });
                    return $q.all([promise]).then(function () {
                        $rootScope.$broadcast('username', _identity);
                        SystemUser.userToken();
                        return true;
                    });

                });
            }, function (data) {
                if (data.status === 401) {
                    setVersionData();
                }
                if (data.status === 400) {
                    logout();
                }
            });
        }

        function MenusTreetoList(dashboard) {
            var list = [];
            for (var i = 0; i < dashboard.length; i++) {
                var firstMenus = dashboard[i];
                var firstIcon = {"target": firstMenus.target, "icon": firstMenus.icon};
                list.push(firstIcon);

                if (firstMenus.children !== undefined && firstMenus.children !== null) {
                    for (var j = 0; j < firstMenus.children.length; j++) {
                        var secondMenus = firstMenus.children[j];
                        var secondIcon = {
                            "target": secondMenus.target,
                            "icon": secondMenus.icon
                        };
                        list.push(secondIcon);

                        if (secondMenus.children !== undefined && secondMenus.children !== null) {
                            for (var k = 0; k < secondMenus.children.length; k++) {
                                var thirdMenus = secondMenus.children[k];
                                var thirdIcon = {
                                    "target": thirdMenus.target,
                                    "icon": thirdMenus.icon
                                };

                                list.push(thirdIcon);
                            }
                        }
                    }
                }
            }

            return list;
        }

        function setVersionData() {
            $rootScope.MW_SETTING = 'normal';
            var tabName = '工业防火墙';
            var platformName, platformShortName = '工业防火墙';
            var loginLogo = '/images/product-logo.png';
            var headerLogo = '/images/logo/logo2.png';
            var versionLogo = '/images/logo/logo-capstone.png';
            platformName = "工业防火墙";
            $rootScope.LOGIN_LOGO = loginLogo;
            $rootScope.HEADER_LOGO = headerLogo;
            $rootScope.VERSION_LOGO = versionLogo;
            $rootScope.PLATFORM_NAME = platformName;
            $rootScope.PLATFORM_SHORT_NAME = platformShortName;
            $rootScope.certification = {
                name: '匡恩网络工业防火墙系统',
                version: 'V3.0',
                type: 'KEV-U1008E',
            };
            $rootScope.VERSION_NUMBER = '';
            $.getJSON('/api/v2.0/systemsetting/configuration/item/buildVersion').then(function (data) {
                $rootScope.VERSION_NUMBER = data;
            });
            System.getSerialNumber().then(function (response) {
                if (response && response.data && response.data.serialNumber) {
                    $rootScope.serialNumber = response.data.serialNumber;
                }
            });
            var tabTitle = document.getElementById("tabTitle");
            if (tabTitle) {
                tabTitle.innerHTML = tabName;
            }
        }

        function getLevel(currentState) {
            return Enum.get('privilege').filter(function (a) {
                return a.name === currentState;
            })[0].actionValue;
        }

        function getUserName() {
            return _identity.name;
        }

        function getUserType() {
            return _identity._type;
        }

        function getUserRole() {
            return _identity._roles;
        }

        function validateState(state) {
            return validate(state);

            function getRootMenu(retryTimes) {
                if (retryTimes !== undefined && retryTimes === 0) {
                    return $q.reject();
                }
                return $q(function (resolve) {
                    if ($rootScope.rootMenu) {
                        resolve($rootScope.rootMenu);
                    } else {
                        $timeout(function () {
                            resolve(getRootMenu(--retryTimes));
                        }, 20);
                    }
                });
            }

            function validate(state) {
                if (!state || state === "" || state === 'auth') {
                    return $q.resolve(true);
                }
                return getRootMenu(200).then(function (rootMenu) {
                    return menuHasState(rootMenu, state);
                });
            }

            function menuHasState(menu, stateName) {
                //  console.log("find state '%s' in menu '%s'", stateName, menu.state);
                if (menu) {
                    if (menu.state === stateName) {
                        return true;
                    }
                    //  state was split with '.' to mark the level.
                    if (menu.child && menu.child.length > 0 && stateName.indexOf(menu.state) === 0) {
                        return menu.child.some(function (childMenu) {
                            return menuHasState(childMenu, stateName);
                        });
                    }
                }
                return false;
            }
        }

        function clear() {
            _identity = {
                name: ''
            };
            $rootScope.autoLoginAll = false;
            $rootScope.domainLogin = {};
            $modalStack.dismissAll();
            if (!$state.is('auth')) {
                $state.transitionTo('auth');
            }
            // heartbeat.end();
            localStorage.removeItem('loginSuccess');
            localStorage.removeItem('secretKey');
        }
    }

})();
