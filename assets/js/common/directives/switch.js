/**
 * switch Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('switchToggle', function ($timeout) {
            return {
                restrict: 'E',
                scope: {
                    status: '=',
                    onLabel: '@',
                    offLabel: '@',
                    change: '&',
                    disabled: '=?',
                    invert: '=?'
                },
                templateUrl: '/templates/common/switch.html',
                link: function ($scope) {
                    $scope.innerStatus = $scope.invert ? !!!$scope.status : !!$scope.status;
                    $scope.$watch('status', function (status) {
                        $scope.innerStatus = $scope.invert ? !!!status : !!status;
                    });
                    $scope.$watch('innerStatus', function (innerStatus) {
                        $scope.status = $scope.invert ? !innerStatus : innerStatus;
                    });
                    $scope.onLabel = $scope.onLabel || '启动';
                    $scope.offLabel = $scope.offLabel || '关闭';
                    $scope.changeAction = function () {
                        if($scope.change) {
                            $timeout($scope.change);
                        }
                    };
                }
            };
        });
})();
