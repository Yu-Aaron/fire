/**
 * statusLamp Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('statusLamp', statusLamp);

    function statusLamp() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                status: '='
            },
            template: '<div class="status-lamp"><ul><li></li><li></li><li></li></ul></div>',
            link: function ($scope, element) {
                $scope.$watch('status', function (status) {
                    status = status || 'down';
                    element.find('li').attr('class', status);
                });
            }
        };
    }
})();
