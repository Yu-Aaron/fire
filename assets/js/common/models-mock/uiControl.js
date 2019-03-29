/*****************************
 *    UI version Control Service
 *****************************/
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('uiCtrl', uiCtrl);

    function uiCtrl(URI, $q, $http, $state, $rootScope, MOCK) {
        var _ui = [];
        var service = {
            getUI: getUI,
            mainUI: mainUI,
            subUI: subUI,
            UIversion: UIversion,
            contentUI: contentUI,
            isShow: isShow,
            findLand: findLand
        };
        return service;

        function getUI() {
            return $q.all([
                $http.get(MOCK + 'domain/customizedMenus/1.json'),
                $http.get(MOCK + 'domain/customizedMenus/2.json'),
                $http.get(MOCK + 'domain/customizedMenus/3.json')]).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    _ui.push(data[i].data);
                }
            });
        }

        function mainUI() {
            return _ui[0];
        }

        function subUI() {
            return _ui[1];
        }

        function contentUI() {
            return _ui[2];
        }

        function UIversion() {
            return _ui[0][0].versionCode;
        }

        function isShow(target, lv) {		//lv=0/1/2 refer main/sub/content UI
            var show = _ui[lv].filter(function (a) {
                return a.target === target;
            });
            return (show[0]) ? show[0].active : true;
        }

        //Find landing page for dashboard click. Designed just for 2nd level Menu
        function findLand(target) {
            var uiObj = _ui[1].filter(function (a) {
                return a.target === target;
            })[0];
            //console.log(uiObj);
            //Check if target exist and active is 1
            if (uiObj) {
                if (!uiObj.active) {
                    var parent = uiObj.parentTarget;
                    var uiGroup = _ui[1].filter(function (a) {
                        return a.parentTarget === parent;
                    });
                    //console.log(uiGroup);
                    //console.log(parent);
                    var parentState = $rootScope.config['dashboard'].filter(function (a) {
                        return a.target === parent;
                    })[0].state;
                    //console.log(parentState);
                    var land = $rootScope.config[parentState][0].state;
                    var uiTargetGroup = {};
                    for (var i = 0; i < uiGroup.length; i++) {
                        if (uiGroup[i].active) {
                            uiTargetGroup = uiGroup[i].target;
                            break;
                        }
                    }
                    land = $rootScope.config[parentState].filter(function (a) {
                        return a.target === uiTargetGroup;
                    })[0].state;
                    //console.log(parentState + '.' + land);
                    $state.transitionTo(parentState + '.' + land);
                    //$state.transitionTo("monitor.overview");
                } else if ('redirect' === $state.current.name) {
                    $state.transitionTo("monitor.overview");
                }
            } else {
                console.log("wrong target: " + target);
                if (target === 'OVERVIEW') {
                    $state.transitionTo("monitor.overview");
                }
            }
        }
    }
})();
