/**
 * Autofocus Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('touchDown', touchDown);

    function touchDown(lclStorage, $timeout) {
        return {
            restrict: 'A',
            scope: {
                touchDown: '=ngModel',
                ngChange: '&'
            },
            link: function ($scope, element, attr) {
                if (attr.id === undefined) {
                    throw ('the element with touchDown attribute musts have an id to enable storing user\'s local config');
                }
                $timeout(function () {
                    if (element.attr('disabled') || element[0].disabled ) {
                        return;
                    }

                    var localValue = lclStorage.get(attr.id);

                    if (localValue !== undefined && localValue !== null) {
                        $scope.touchDown = localValue;
                        if ($scope.ngChange) {
                            $timeout(function () {
                                $scope.ngChange();
                            });
                        }

                    }
                    $scope.$watch('touchDown', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            lclStorage.set(attr.id, newValue);
                        }
                    });
                });

            }
        };
    }

})();
