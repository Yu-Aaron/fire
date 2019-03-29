///**
// * Privilege Directive
// *
// * Description
// */
//(function () {
//    'use strict';
//    angular
//        .module('southWest.directives')
//        .directive('privilege', privilege);
//
//    function privilege($rootScope, Enum, uiCtrl) {
//        var privilegeObj = {
//            scope: {
//                privilege: '@',
//                disable: '@',
//                redirect: '@'
//            },
//            restrict: 'A',
//            link: link
//        };
//
//        return privilegeObj;
//
//        function link(scope, el) {
//            var names = scope.privilege || $rootScope.currentState;
//            names = names.split(" ");
//            var level = 0;
//            names.forEach(function (name) {
//                var templevel;
//                if (name === 'MY_ACCOUNT') {
//                    templevel = 30;
//                } else {
//                    templevel = Enum.get('privilege').filter(function (a) {
//                        return a.name === name;
//                    });
//                    templevel = templevel && templevel[0] ? templevel[0].actionValue : 1;
//                }
//                level = Math.max(level, templevel);
//            });
//            if (level === 2) {
//                switch (scope.disable) {
//                    case 'self':
//                        el.prop('disabled', true);
//                        break;
//                    case 'true':
//                        var inputs;
//                        (inputs = el.find('input, button')).length && inputs.prop('disabled', true);
//                        break;
//                    default:
//                        el.css('visibility', 'hidden');
//                }
//            } else if (level === 1) {
//                if (scope.redirect) {
//                    console.log("DETECT BY PRIVILEGE");
//                    //  If user does not have permission to access current state, loop through and find a landing page
//                    uiCtrl.teleport();
//                } else {
//                    el.hide();
//                }
//            }
//        }
//    }
//})();
