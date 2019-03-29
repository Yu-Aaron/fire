/**
 * Network Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.network')
        .controller('NetworkCtrl', NetworkCtrl);
//, uiCtrl, Enum, leftNavCustomMenu, $rootScope
    function NetworkCtrl($state, localStorage, $rootScope) {
        var vm = this;

        vm.prefixId = "network";
        vm.subMenus = $rootScope.rootMenu.getChild("NETWORK");

        vm.expanded = localStorage.getItem('network:navbar:expanded') === 'true' ? true : false;

        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('network:navbar:expanded', vm.expanded);
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
