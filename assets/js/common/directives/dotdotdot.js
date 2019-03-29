/**
 * dotdotdot Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('dotdotdot', dotdotdot);

    function dotdotdot($timeout){
        return {
            restrict: 'A',
            link: function(scope, element) {
                $timeout(function () {
                    element.dotdotdot({
                        wrap: 'letter',
                        watch: true
                    });
                });
            }
        };
    }
})();
