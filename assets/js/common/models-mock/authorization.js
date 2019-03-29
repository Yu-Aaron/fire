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

    function authorization($q, $rootScope, $http, $state, $modalStack, URI, Enum, SystemUser, apiInfo, uiCtrl, MOCK) {
        var _identity = {
            name: ''
        };

        var service = {
            login: login,
            unlockUser: unlockUser,
            logout: logout,
            whoAmI: whoAmI,
            getLevel: getLevel,
            getUserName: getUserName,
            getUserType: getUserType,
            getUserRole: getUserRole,
            clear: clear
        };
        return service;

        function login(credentials) {
            var userJson = "uni/login/" + (credentials.username === "root" ? "root_login.json" : (credentials.username === "admin" ? "admin_login.json" : "admin_login_fail.json"));
            return $q.all([
                $http.get(MOCK + userJson), $http.get('js/conf.json'), $http.get('js/logo.json'), apiInfo.getFullApi()]).then(function (data) {
                var user = data[0].data;
                var result = {
                    msg: '',
                    done: false
                };

                var basicInfo = data[3].data[0].buildNumber;
                if (basicInfo) {
                    var versionNumberArray = basicInfo.split(' ')[1].split('-');
                    versionNumberArray.pop();
                    $rootScope.VERSION_NUMBER = versionNumberArray.join('-');
                } else {
                    $rootScope.VERSION_NUMBER = "非正式版本";
                }
                var customerID = $rootScope.VERSION_NUMBER.slice(-4);
                if (customerID === '-C05' && credentials.username === 'root') {
                    result.msg = '登录失败，账户不存在或密码错误';
                    service.logout();
                    return result;
                }

                if (!user.success) {
                    result.msg = user.message;
                    return result;
                } else {
                    return service.whoAmI().then(function () {
                        result.done = true;
                        return result;
                    });
                }
            });
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

        function whoAmI() {
            return $q.all([
                $http.get(MOCK + 'uni/login/admin_whoami.json'),
                $http.get('js/conf.json'),
                $http.get('js/logo.json'),
                apiInfo.getFullApi()]).then(function (data) {
                return uiCtrl.getUI().then(function () {
                    _identity = data[0].data.user;
                    Enum.set('privilege', data[0].data.targetAndActionValueFormList);
                    Enum.set('deviceAccess', data[0].data.deviceIds);
                    Enum.set('Role', data[0].data.user._roles);
                    Enum.set('Widget', data[0].data.userWidgetOptionSettings);
                    $rootScope.$broadcast('privilege', 0);
                    $rootScope.config = data[1].data;
                    $rootScope.logo = data[2].data;

                    setVersionData(data[3].data[0].buildNumber);

                    $rootScope.$broadcast('username', _identity);
                    SystemUser.userToken();
                    return true;
                });
            }, function (data) {
                if (data.status === 401) {
                    apiInfo.getFullApi().then(function (data) {
                        setVersionData(data.data[0].buildNumber);
                    });
                }
            });
        }

        function setVersionData(build) {
            var platformName = '安全监管平台';
            var loginLogo = '/images/product-logo.png';
            var headerLogo = '/images/logo/logo2.png';

            if (build) {
                var versionNumberArray = build.split(' ')[1].split('-');
                versionNumberArray.pop();
                $rootScope.VERSION_NUMBER = versionNumberArray.join('-');
                $rootScope.isC02 = $rootScope.VERSION_NUMBER.slice(-4) === '-C02';
                $rootScope.isC05 = $rootScope.VERSION_NUMBER.slice(-4) === '-C05';
                $rootScope.isC06 = $rootScope.VERSION_NUMBER.slice(-4) === '-C06';
                if ($rootScope.isC06) {
                    platformName = '威胁管理平台';
                    loginLogo = '/images/product-logo-C06.png';
                    headerLogo = '/images/logo/logo2-C06.png';
                }
                $rootScope.userRoleTypeC05 = $rootScope.isC05 ? (Enum.get('Role')[0].name === "高级系统管理员" ? 0 : (Enum.get('Role')[0].name === "高级安全保密管理员" ? 1 : (Enum.get('Role')[0].name === "高级安全审计员" ? 2 : -1))) : -1;
            } else {
                $rootScope.VERSION_NUMBER = "非正式版本";
            }

            $rootScope.LOGIN_LOGO = loginLogo;
            $rootScope.HEADER_LOGO = headerLogo;
            $rootScope.PLATFORM_NAME = platformName;

            var tabTitle = document.getElementById("tabTitle");
            if (tabTitle) {
                tabTitle.innerHTML = platformName;
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

        function clear() {
            _identity = {
                name: ''
            };
            $modalStack.dismissAll();
            if (!$state.is('auth')) {
                $state.transitionTo('auth');
            }
        }
    }

})();
