(function () {
    'use strict';
    var libs = [
        // Third party
        'ui.router',
        'ui.bootstrap',
        'ui.sortable',
        'ngSanitize',
        'ngCookies',
        'ngResource',
        'ngAnimate',
        'cgBusy',
        'angularFileUpload',
        "highcharts-ng",
        "ngCrypto",
        'angucomplete',
        'inputmask4angular',
        'ui.tree',
        'ngDragDrop',
        '720kb.tooltips',
        'angular-loading-bar',
        'rx',

        // Utilities
        'southWest.filters',
        'southWest.models',
        'southWest.directives',
        'southWest.services'
    ];

    var modules = [
        "southWest.asset",
        "southWest.attack",
        "southWest.protocolaudit",
        "southWest.securityaudit",
        "southWest.audit",
        "southWest.audit.behavior",
        "southWest.audit.dpidata",
        "southWest.audit.dpidevicedata",
        "southWest.audit.icdevicedata",
        "southWest.audit.forumpostdata",
        "southWest.audit.searchenginedata",
        "southWest.auth",
        "southWest.dashboard",
        "southWest.todolist",
        "southWest.detect",
        "southWest.domain",
        "southWest.monitor",
        "southWest.postlog",
        //"southWest.report",
        "southWest.infsafety",
        "southWest.reduction",
        "southWest.rule",
        "southWest.rule.blacklist",
        "southWest.rule.ipmac",
        "southWest.rule.maliciousdomain",
        "southWest.rule.whitelist",
        "southWest.rule.networklist",
        "southWest.rule.learning",
        "southWest.rule.sync",
        "southWest.rule.ipmacsync",
        //"southWest.report",
        //"southWest.report.event",
        //"southWest.report.logger",
        //"southWest.report.protocol",
        "southWest.securityauditsetting",
        "southWest.setting",
        "southWest.setting.systemconsole",
        "southWest.setting.systemdevice",
        "southWest.systemuser",
        "southWest.myaccount",
        "southWest.privateprotocol",
        "southWest.record",
        "southWest.topology",
        "southWest.topology.singleTopo",
        "southWest.asset.securitydevice",
        "southWest.asset.factorydevice",
        "southWest.asset.networkdevice",
        "southWest.asset.ucddevice",
        "southWest.monitor.device",
        "southWest.monitor.incident",
        "southWest.monitor.logger",
        "southWest.monitor.overview",
        "southWest.redirect",
        "southWest.ai",
        "southWest.unknown",
        "southWest.ntpsync",
        "southWest.vul",
        //"southWest.monitor.report",
        "southWest.monitor.report_event",
        "southWest.monitor.report_log",
        "southWest.monitor.report_protocol",
        "southWest.network",
        "southWest.network.interface",
        "southWest.network.static_router",
        "southWest.object",
        "southWest.object.network_asset",
        "southWest.object.service",
        "southWest.object.apply",
        "southWest.object.schedule",
        "southWest.strategy",
        "southWest.strategy.security",
        "southWest.strategy.nat",
        "southWest.strategy.session",
        "southWest.strategy.anti_penetration",
        "southWest.setting.basic",
        "southWest.setting.reliable",
        "southWest.setting.security_operation",
        "southWest.setting.switch",
        "southWest.session",
        "southWest.session.state",
        "southWest.session.flowdata_overview",
        "southWest.session.flowdata_industry",
        "southWest.session.protocol"
    ];

    $.getJSON('/api/v2.0/systemsetting/configuration/item/buildVersion').then(doneCallback, failCallback);


    //////////
    function doneCallback() {
        var URI = '/api/v2.0';
        var MOCK = 'js/mock/models/';

        angular
            .module('southWest', libs.concat(modules))
            .config(config)
            .run(run)
            .controller('AppCtrl', AppCtrl)
            .constant('URI', URI)
            .constant('MOCK', MOCK);

        angular.element(document).ready(function () {
            angular.bootstrap(document, ['southWest']);
        });
    }

    function failCallback() {
        $.getJSON('js/mock/models/uni/api.json').then(doneCallback, mockFailCallBack);
    }

    function mockFailCallBack() {
        console.error("Unable to load AngularJS Modules or URI!");
    }

    function config($urlRouterProvider, $locationProvider, $httpProvider, $animateProvider, $stateProvider,
                    $modalProvider) {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);

        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common["Accept"] = "*/*";
        $httpProvider.defaults.headers.common["Content-Type"] = "application/json, charset=UTF-8";
        $httpProvider.interceptors.push('unauthorized');

        $animateProvider.classNameFilter(/angular-animate/);

        var init = false;
        $stateProvider.state('root', {
            abstract: true,
            url: '',
            resolve: {
                init: function (auth) {
                    if (!init) {
                        init = true;
                        return auth.whoAmI();
                    }
                },
                secretKey: function (auth, $rootScope) {
                    if(!$rootScope.secretKey) {
                        return auth.getSecretKey();
                    }
                }
            }
        });

        $modalProvider.options = {
            backdrop: 'static'
        };
    }

    function run(logo, auth, $rootScope, $state, $q) {
        // ServiceWorker.init();
        // ServiceWorker.on('loginSuccess', function () {
        //     if($state.current.name === 'auth') {
        //         location.reload();
        //     }
        // });
        logo.getLogo().then(function () {
        }, function () {
            console.error('loading logo configuration fail');
            $rootScope.logo = {
                "loginLogo": "acorn-logo",
                "logo": "logo",
                "logo2": "logo2",
                "text": "2016 匡恩网络 版权所有"
            };
        });
        if(window.env === 'production') {
            $.getJSON('/js/rev-manifest.json').then(function (data) {
                $rootScope.revManifest = data;
            });
        }

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            toState.resolve.pauseStateChange = [
                function () {
                    var state = toState.name;
                    //  convert the state to new state which not defined in conf.json
                    if (_.isFunction(toState.resolve.menuState)) {
                        state = toState.resolve.menuState();
                    }
                    if (state === 'redirect') {
                        return $q.resolve();
                    }
                    else {
                        return auth.validateState(state).then(function (canAccess) {
                            //  console.log("can access %s: %s", state, canAccess);
                            if (!canAccess) {
                                console.log("do not has privilege to access %s, go to 'redirect' instead", state);
                                event.preventDefault();
                                $state.go("redirect");
                            }
                            return $q.resolve();
                        });
                    }
                }
            ];
        });
    }

    function AppCtrl($location, $anchorScroll, $rootScope, $timeout, auth, $state) {
        var vm = this;
        window.addEventListener('storage', function(e) {
            if(e.key === 'loginSuccess' && e.newValue === '1' && $state.current.name === 'auth') {
                location.reload();
            }
            if(e.key === 'secretKey') {
                $rootScope.secretKey = e.newValue;
            }
        });
        /*auth.whoAmI().then(function (status) {
            status && heartbeat.start();
        });*/
        document.onkeydown=function (e) {
            e = window.event || e || e.which;
            if(e.keyCode === 112 ){
                // window.open('/help/index.html');
                $rootScope.openHelp();
                return false;
            }
        };
        vm.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        };

        //CS-10224 move alert message handler from DashboardCtrl to AppCtrl
        vm.messages = [];
        vm.stayMessage = [];
        $rootScope.addAlert = function (msg) {
            //console.log(msg);
            if (msg && msg.content === '学习任务完成') {
                for (var a = 0; a < vm.messages.length; a++) {
                    if (vm.messages[a].content === '学习任务完成') {
                        return;
                    }
                }
            }

            vm.messages.push(msg);

            $timeout(function () {
                var index = vm.messages.indexOf(msg);
                if (index >= 0) {
                    vm.closeAlert(msg);
                }
            }, 6000);
        };

        vm.closeAlert = function (msg) {
            var index = vm.messages.indexOf(msg);
            if (index >= 0) {
                vm.messages.splice(index, 1);
            }
        };

        $rootScope.stayAlert = function (msg) {
            vm.stayMessage.push(msg);
            $timeout(function () {
                var index = vm.stayMessage.indexOf(msg);
                if (index >= 0) {
                    vm.closeStayAlert(msg);
                }
            }, 10000);
        };

        vm.closeStayAlert = function (msg) {
            var index = vm.stayMessage.indexOf(msg);
            if (index >= 0) {
                vm.stayMessage.splice(index, 1);
            }
        };
        vm.stopEventPropagation = function ($event) { //阻止事件冒泡
            $event.stopPropagation();
            return false;
        };
    }

})();
