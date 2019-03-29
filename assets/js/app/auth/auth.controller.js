/**
 * Login Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.auth')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl($scope, $rootScope, auth, SystemUser, $log, $modal,  uiCtrl, $crypto, canvasBg, curTime) {
        var vm = this;
        vm.curYear = curTime ? curTime.split('-')[0] : new Date().getFullYear();
        vm.user = {};
        // Get browser type
        //get code image when init page
        var canvasObj = canvasBg.initializeEngine();
        $scope.$on("$destroy", function () {
            canvasObj.destroy();
        });
        getImage();
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
            (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
                (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
                    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
                        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
                            (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
        vm.isIE = Sys.ie;
        vm.hostname = window.document.location.host;

        vm.unKeyPress = function (code) {
            if (code) {
                vm.error = '';
            }
        };

        vm.pwKeyPress = function (code) {
            if (code === 13) {
                vm.login();
            } else {
                vm.error = '';
            }
        };

        vm.openInitializedModal = function (message) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'InitializedModal.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    items: function () {
                        var items = message;
                        return items;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

            $scope.toggleAnimation = function () {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };

            function ModalInstanceCtrl($scope, $modalInstance, items) {
                $scope.items = items;
                $scope.ok = function () {
                    $modalInstance.close($scope.items);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        };

        //vm.openInitializedModal();

        vm.login = function () {
            auth.getSecretKey().then(function (keyData) {
                var key = keyData.data;
                var info = {
                    "username": btoa($crypto.encrypt(vm.user.username, key)),
                    "password": btoa($crypto.encrypt(vm.user.password, key)),
                    "verifycode": btoa(vm.user.verifycode)
                };
                auth.login(info).then(function (data) {
                        if (!data.done) {
                            vm.error = data.msg;
                            vm.user.verifycode = "";

                            if ("验证码输入不匹配或者验证码登录超时" === data.msg) {
                                $("#login_text_verifycode").focus();
                            } else if ("登录失败，账户不存在或密码错误" === data.msg) {
                                vm.user.password = "";
                                $("#login_text_password").focus();
                            }


                            getImage();
                        } else {
                            var page = {};

                            var firstPage = $rootScope.rootMenu.getChilds();

                            if (firstPage && firstPage !== null && firstPage.length > 0) {
                                var secondpage = firstPage[0].getChilds();
                                if (secondpage && secondpage !== null && secondpage.length > 0) {
                                    var thirdPage = secondpage[0].getChilds();
                                    if (thirdPage && thirdPage !== null && thirdPage.length > 0) {
                                        page = {
                                            target: thirdPage[0].getTarget(),
                                            state: thirdPage[0].getState(),
                                            isLogin: true
                                        };
                                    }
                                    else {
                                        page = {
                                            target: secondpage[0].getTarget(),
                                            state: secondpage[0].getState(),
                                            isLogin: true
                                        };
                                    }
                                }
                                else {
                                    page = {
                                        target: firstPage[0].getTarget(),
                                        state: firstPage[0].getState(),
                                        isLogin: true
                                    };
                                }
                            }
                            else {
                                //page = {
                                //    target: "myaccount",
                                //    state: "myaccount",
                                //    isLogin: true
                                //};

                                page = {
                                    target: 'MONITOR_OVERVIEW',
                                    state: 'monitor.overview',
                                    isLogin: true
                                };
                            }

                            //if($rootScope.rootMenu.getChilds())

                            uiCtrl.teleport(page);

                            // heartbeat.start();
                            //console.log(auth.getUserType());
                            //if (auth.getUserType() === 1) {
                            //    $state.transitionTo('domain');
                            //} else if ($rootScope.centraliztion) {
                            //    $state.transitionTo('setting.systemconsole');
                            //} else {
                            //    domain.getDomain().then(function () {
                            //        localStorage.setItem('topologyId', topologyId.id);
                            //        localStorage.setItem('lockUser', '0');
                            //        var sysSetting = Enum.get('privilege').filter(function (a) {
                            //            return a.name === 'SYSTEM_MANAGEMENT';
                            //        })[0].actionValue;
                            //        $rootScope.userlock = '0';
                            //        Topology.getNodes(topologyId.id).then(function (nodes) {
                            //            //console.log(nodes);
                            //            var level;
                            //            if (!nodes.data.length) {
                            //                Device.getDeviceDiscoverred().then(function (dpi) {
                            //                    //console.log(dpi);
                            //                    if (!dpi.data.length) {
                            //                        //console.log('single topology');
                            //
                            //                        //vm.openInitializedModal(msg);
                            //
                            //                        level = Enum.get('privilege').filter(function (a) {
                            //                            return a.name === 'TOPOLOGY';
                            //                        })[0].actionValue;
                            //                        var promise = [];
                            //                        if (level === 1) {
                            //                            if (sysSetting > 1) {
                            //                                promise.push($state.transitionTo("setting.systemconsole"));
                            //                            } else {
                            //                                promise.push($state.transitionTo("myaccount"));
                            //                            }
                            //                        } else {
                            //                            promise.push($state.transitionTo("topology.singleTopo"));
                            //                        }
                            //
                            //                        var msg = {
                            //                            'type': 'warning',
                            //                            'content': '目前系统没有找到任何匡恩安全设备\n请确认设备连线正常并配置设备指向管理平台',
                            //                            'ip': $location.$$host
                            //                        };
                            //                        $q.all(promise).then(function () {
                            //                            //$rootScope.stayAlert(msg);
                            //                            console.log(msg);
                            //                        });
                            //                    } else {
                            //                        //console.log('device');
                            //                        //vm.openInitializedModal('device');
                            //                        level = Enum.get('privilege').filter(function (a) {
                            //                            return a.name === 'DEVICE_MANAGEMENT';
                            //                        })[0].actionValue;
                            //                        if (level === 1) {
                            //                            if (sysSetting > 1) {
                            //                                $state.transitionTo("setting.systemconsole");
                            //                            } else {
                            //                                $state.transitionTo("myaccount");
                            //                            }
                            //                        } else {
                            //                            $state.transitionTo("asset.securitydevice");
                            //                        }
                            //                    }
                            //                });
                            //            } else {
                            //                //console.log('overview');
                            //                //vm.openInitializedModal('overview');
                            //
                            //                level = Enum.get('privilege').filter(function (a) {
                            //                    return a.name === 'REAL_TIME_PROTECTION';
                            //                })[0].actionValue;
                            //                if (level === 1) {
                            //                    if (sysSetting > 1) {
                            //                        $state.transitionTo("setting.systemconsole");
                            //                    } else {
                            //                        $state.transitionTo("myaccount");
                            //                    }
                            //                } else {
                            //                    $state.transitionTo("monitor.overview");
                            //                }
                            //            }
                            //        });
                            //    });
                            //}
                        }

                    }
                );
            }, function () {
                vm.error = '登录服务超时，请重新登录！';
            });
        };

        vm.getVerifyCodeImage = function () {
            getImage();
        };
        function getImage() {
            auth.getVerifyCodeImage().then(function (imageData) {
                vm.imageData = imageData.data;
            });
        }

        SystemUser.userToken().then(function (data) {
            var page = {};
            if (data) {
                page = {
                    target: 'MONITOR_OVERVIEW',
                    state: 'monitor.overview',
                    isLogin: true
                };
                uiCtrl.teleport(page);
            }
        });
        $scope.slideInterval = 5000;

        $scope.slides = [{bg: 'images/auth/banner01.png'}, {bg: 'images/auth/banner02.png'}, {bg: 'images/auth/banner03.png'}];
    }

})();
