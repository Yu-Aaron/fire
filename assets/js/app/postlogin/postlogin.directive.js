/**
 * Postlog Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.postlog')
        .directive('plSidebar', plSidebar)
        .directive('plContainer', plContainer);

    function plSidebar() {
        var plSidebarObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/postlogin/sidebar.html',
            link: link
        };

        return plSidebarObj;

        ////////////////////
        function link(scope) {
            var vm = scope;
            if (typeof(scope.plSidebarSwitch) === 'undefined') {
                scope.plSidebarSwitch = 0;
            }

            if (typeof(scope.plCurrentTab) === 'undefined') {
                scope.plCurrentTab = 0;
            }
            vm.selectSideItem = function (sideItem) {
                scope.plSidebarSwitch = sideItem;
                scope.plCurrentTab = 0;
                switch (sideItem) {
                    case 0:
                        scope.topVal = '35px';
                        break;
                    case 1:
                        scope.topVal = '176px';
                        break;
                    case 2:
                        scope.topVal = '318px';
                        break;
                    default:
                        scope.topVal = '35px';
                        break;
                }
            };

            vm.selectTab = function (tabNum) {
                scope.plCurrentTab = tabNum;
            };
        }
    }

    function plContainer(auth) {
        var plContainerObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/postlogin/container.html',
            link: link
        };

        return plContainerObj;

        //////////////////////

        function link(scope) {
            var vm = scope;
            vm.logout = auth.logout;
        }
    }

    /*function plContainer() {
     var plSidebar = {
     scope: false,
     restrict: 'E',
     replace: true,
     templateUrl: '/templates/topology/table.html',
     };
     }*/

})();
