/*

 safety.controller

 */
(function () {
    'use strict';

    angular
        .module('southWest.redirect')
        .controller('RedirectCtrl', RedirectCtrl);

    function RedirectCtrl($rootScope, uiCtrl) {
        var page = {
            privilege: 'REAL_TIME_PROTECTION',
            curState: 'redirect',
            state: 'monitor.overview',
            isLogin: false
        };
        if ($rootScope.centraliztion) {
            page = {
                privilege: 'SYSTEM_MANAGEMENT',
                curState: 'redirect',
                state: 'setting.systemconsole',
                isLogin: false
            };
        }
        uiCtrl.teleport(page);
        //$state.transitionTo("monitor.overview");
        //$state.go("monitor.overview");
        //$state.go("topology.singleTopo");
    }
})();
