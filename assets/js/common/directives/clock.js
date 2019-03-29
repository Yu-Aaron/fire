/**
 * clock Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('clock', function () {
            return {
                restrict: 'E',
                scope: {
                    time: '=?',
                },
                templateUrl: '/templates/common/clock.html',
                link: function ($scope, element) {
                    var dialLines = element.find('.diallines');
                    dialLines.each(function (i, elem) {
                        $(elem).css('transform', 'rotate(' + 6 * i + 'deg)');
                    });
                    var differ,
                        interval;
                    $scope.$watch('time', function (time) {
                        init(time);
                    });
                    $scope.$on('$destroy', function () {
                        clearInterval(interval);
                    });
                    function init(time) {
                        differ = time ? (new Date(time).getTime() - new Date().getTime()) : 0;
                        clearInterval(interval);
                        tick();
                        interval = setInterval(tick, 100);
                    }
                    function tick() {
                        var date = new Date(new Date().getTime() + differ);
                        var seconds = date.getSeconds();
                        var minutes = date.getMinutes();
                        var hours = date.getHours();
                        var day = date.getDate();
                        var month = date.getMonth() + 1;
                        var year = date.getFullYear();

                        var secAngle = seconds * 6;
                        var minAngle = minutes * 6 + seconds * (360 / 3600);
                        var hourAngle = hours * 30 + minutes * (360 / 720);

                        element.find('.sec-hand').css('transform', 'rotate(' + secAngle + 'deg)');
                        element.find('.min-hand').css('transform', 'rotate(' + minAngle + 'deg)');
                        element.find('.hour-hand').css('transform', 'rotate(' + hourAngle + 'deg)');
                        element.find('.date').text(day);
                        element.find('.month').text(month);
                        element.find('.year').text(year);
                    }
                }
            };
        });
})();
