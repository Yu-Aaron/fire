/**
 * help Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help')
        .controller('HelpCtrl', HelpCtrl);
//, uiCtrl, Enum, leftNavCustomMenu, $rootScope
    function HelpCtrl($state, localStorage,$rootScope) {
        var vm = this;

        vm.prefixId = "help";
        vm.subMenus = $rootScope.rootMenu.getChild("HELP");
        vm.expanded = localStorage.getItem('help:navbar:expanded') === 'true' ? true : false;

        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('help:navbar:expanded', vm.expanded);
        };

        vm.isActive = function (tab) {
            return $state.current.name.indexOf(tab.getState()) > -1;
        };

    }
})();
