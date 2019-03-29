/**
 * custom network rule Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('customNetworkRule', customNetworkRule);

    function customNetworkRule() {
        var Obj = {
            scope: false,
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: '/templates/common/customNetworkRule.html',
            controllerAs: 'networkRule',
            controller: controller,
        };

        return Obj;
    }

    function controller($scope) {

        $scope.optionSelected = function (event, ipObj) {
            if (ipObj.option) {
                ipObj.placeHolder = '';
            } else {
                ipObj.placeHolder = '任意';
            }
        };

    }
})();
