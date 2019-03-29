/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.securityauditsetting')
        .controller('SecurityauditSettingCtrl', SecurityauditSettingCtrl);

    function SecurityauditSettingCtrl($rootScope) {
        var vm = this;

        vm.tabEnabled = function (target) {
            var tempMenu = $rootScope.customizedMenus.filter(function (m) {
                return m.target === target;
            });

            if (tempMenu && tempMenu.length > 0) {
                return true;
            }
            return false;
        };
        if (vm.tabEnabled("PROTOCOL_SETTING")) {
            vm.securityauditsetting_init_tab = "PROTOCOL_SETTING";
        }
        else if (vm.tabEnabled("BEHAVIOR_SETTING")) {
            vm.securityauditsetting_init_tab = "BEHAVIOR_SETTING";
        }
        else {
            vm.securityauditsetting_init_tab = "CONTENT_SETTING";
        }
    }
})();
