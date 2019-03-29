/**
 * triStateCheckbox Directive
 *
 * Description: 定制checkbox的三态样式
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('triStateCheckbox', function () {
            return {
                restrict: 'A',
                replace: true,
                require: "?ngModel",
                link: function (scope, el, attrs, ngModel) {
                    if (!ngModel){
                        return; // do nothing if no ng-model
                    }

                    var truthy = true;
                    var falsy = false;
                    var nully = null;
                    ngModel.$formatters = [];
                    ngModel.$parsers = [];

                    ngModel.$render= function () {
                        var d = ngModel.$viewValue;
                        el.data("checked", d);
                        el.removeClass("tri-state-indeterminate");
                        switch (d) {
                            case truthy:
                                el.prop("indeterminate", false);
                                el.prop("checked", true);
                                break;
                            case falsy:
                                el.prop("indeterminate", false);
                                el.prop("checked", false);
                                break;
                            case nully:
                                el.prop("indeterminate", true);
                                el.addClass("tri-state-indeterminate");
                                break;
                        }
                    };

                    el.bind("click", function() {
                        var d;
                        switch(el.data("checked")){
                            case falsy:
                                d = truthy;
                                break;
                            case truthy:
                                d = falsy;
                                break;
                            case nully:
                                d = truthy;
                                break;
                            default:    //  same with unchecked.
                                d = truthy;
                                break;
                        }
                        ngModel.$setViewValue(d);
                        scope.$apply(ngModel.$render);
                    });
                }
            };
        });
})();
