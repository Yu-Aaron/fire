(function () {
    'use strict';
    angular
        .module('southWest.directives')
        .directive('fadeInList', fadeInList);

    function fadeInList($timeout) {
        return {
            restrict: 'A',
            compile: function (element) {
                element.addClass('fadeListItem');
                return function (scope, element) {
                    $timeout(function () {
                        element.addClass('in');
                    }, scope.$index * 40);
                };
            }
        };
    }
})();
