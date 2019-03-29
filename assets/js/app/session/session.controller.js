/**
 * Created by liuzhen on 16-12-2.
 */
/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.session')
        .controller('SessionCtrl', SessionCtrl);
//, uiCtrl, leftNavCustomMenu
    function SessionCtrl($scope, $state,$rootScope) {
        var vm = this;
        vm.prefixId = "session";
        vm.subMenus = $rootScope.rootMenu.getChild("SESSION");
        vm.expanded = localStorage.getItem('session:navbar:expanded') === 'true' ? true : false;

        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('session:navbar:expanded', vm.expanded);
        };

        vm.isActive = function (tab) {
            return $state.current.name.indexOf(tab.getState()) > -1;
        };
    }
})();
