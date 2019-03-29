///**
// * report Controller
// *
// * Description
// */
//(function () {
//    'use strict';
//
//    angular
//        .module('southWest.report')
//        .controller('reportCtrl', reportCtrl);
//
//    function reportCtrl($state, uiCtrl, Enum, leftNavCustomMenu) {
//        var vm = this;
//        vm.uiEnable = function (privilege) {
//            var level = Enum.get('privilege').filter(function (a) {
//                return a.name === privilege;
//            });
//            if (privilege === "INCIDENT") {
//                level = level.concat(Enum.get('privilege').filter(function (a) {
//                    return a.name === 'EVENT';
//                }));
//            }
//            return level && level[0] && Math.max.apply(Math, level.map(function (l) {
//                    return l.actionValue;
//                })) > 1;
//        };
//
//        vm.leftNavItemEnabled = leftNavCustomMenu.leftNavItemEnabled;
//
//        vm.expanded = localStorage.getItem('report:navbar:expanded') === 'true' ? true : false;
//
//        vm.toggleExpand = function () {
//            vm.expanded = !vm.expanded;
//            localStorage.setItem('report:navbar:expanded', vm.expanded);
//        };
//
//        vm.isActive = function (state) {
//            return $state.current.name.indexOf(state) > -1;
//        };
//
//    }
//})();
