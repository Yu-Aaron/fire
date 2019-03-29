/**
 * rightClickPrevent Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('rightClickPrevent', rightClickPrevent);

    function rightClickPrevent($rootScope) {
        return {
            restrict: 'A',
            link: function ($scope, $ele) {
                $ele.bind("contextmenu", function (e) {
                    e.preventDefault();
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '右键功能被禁用'
                    });
                });
            }
        };
    }
})();
