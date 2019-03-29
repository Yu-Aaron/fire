/**
 * countAnimation Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('countAnimation', countAnimation);

    function countAnimation() {
        return {
            restrict: 'A',
            link: function ($scope, element, attr) {
                $scope.$watch(attr.ngBind, function (newValue, oldValue) {
                    if(!newValue) {
                        return element.text(0);
                    }
                    if(oldValue === newValue) {
                        oldValue = 0;
                    }
                    animate(oldValue, newValue);
                });
                function animate(from, to) {
                    jQuery({ Counter: from }).animate({
                        Counter: to //get total
                    }, {
                        duration: 1000,
                        easing: 'swing',
                        step: function () {
                            element.text(Math.round(this.Counter));
                        },
                    });
                }
            }
        };
    }
})();
