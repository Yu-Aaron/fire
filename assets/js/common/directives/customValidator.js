/**
 * Cus Directive
 *
 * Description
 */
(function () {
    'use strict';
    angular
        .module('southWest.directives')
        .directive('customVal', customVal);

    function customVal() {
        return {
            require: '?ngModel',
            scope:{
                customVal: '@',
                validator: '&',
                valArgs: '=?'
            },
            link: function(scope, elm, attrs, ctrl) {
                // only apply the validator if ngModel is present and Angular has added the validator
                if (ctrl && ctrl.$validators) {
                    // this will add new Angular validator
                    ctrl.$validators[scope.customVal] = function(modelVal) {
                        return scope.validator()(modelVal, scope.valArgs);
                    };
                }
            }
        };
    }
})();