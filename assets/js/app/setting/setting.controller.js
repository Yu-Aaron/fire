/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting')
        .controller('SettingCtrl', SettingCtrl);
//, uiCtrl, leftNavCustomMenu
    function SettingCtrl($scope, $state,$rootScope) {
        var vm = this;
        vm.prefixId = "setting";
        vm.subMenus = $rootScope.rootMenu.getChild("SETTING");
        vm.expanded = localStorage.getItem('object:navbar:expanded') === 'true' ? true : false;

        //
        //vm.uiEnable = function (target, lv) {
        //    return uiCtrl.isShow(target, lv);
        //};
        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('object:navbar:expanded', vm.expanded);
        };
        //
        //vm.leftNavItemEnabled = leftNavCustomMenu.leftNavItemEnabled;
        //
        vm.isActive = function (tab) {
            return $state.current.name.indexOf(tab.getState()) > -1;
        };
        //
        //vm.isGranted = function (target) {
        //    var level = Enum.get('privilege').filter(function (a) {
        //        return a.name === target;
        //    });
        //    if (target === "INCIDENT") {
        //        level = level.concat(Enum.get('privilege').filter(function (a) {
        //            return a.name === 'EVENT';
        //        }));
        //    }
        //    return level && level[0] && Math.max.apply(Math, level.map(function (l) {
        //            return l.actionValue;
        //        })) > 1;
        //};
    }
})();
