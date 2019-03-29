/**
 * Auth Directive
 *
 * Directive for rotating UI
 */
(function (window, angular) {
    'use strict';
    angular
        .module('southWest.auth')
        .directive('loginSlide', loginSlide);

    function loginSlide($interval) {
        var loginSlideObj = {
            restrict: 'AE',
            scope: false,
            link: link
        };

        return loginSlideObj;

        function link(scope) {
            scope.currentIndex = 0; // Initially the index is at the first image
            scope.next = function () {
                scope.currentIndex < scope.slides.length - 1 ? scope.currentIndex++ : scope.currentIndex = 0;
            };
            scope.$watch('currentIndex', function () {
                scope.slides.forEach(function (image) {
                    image.visible = false; // make every image invisible
                });
                scope.slides[scope.currentIndex].visible = true; // make the current image visible
            });

            var sliderFunc = $interval(function () {
                scope.next();
            }, 3000);

            scope.$on('$destroy', function () {
                $interval.cancel(sliderFunc); // when the scope is getting destroyed, cancel the timer
            });
        }
    }
})(window, angular);
