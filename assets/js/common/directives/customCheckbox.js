/**
 * customCheckbox Directive
 *
 * Description: 定制checkbox的样式
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('customCheckbox', function () {
            return {
                restrict: 'A',
                compile: function compile(tElement, tAttrs) {
                    tElement.after('<label class="' + (tAttrs.class || 'custom-checkbox') + '"' + (tAttrs.ngHide ? (' ng-hide=' + tAttrs.ngHide) : '') + '></label>').parent().addClass('custom-checkbox-wrap');
                    return {
                        post: function postLink(scope, iElement, iAttrs) {
                            var id;
                            if(iAttrs.id) {
                                iElement.next('label').attr('for', iAttrs.id);
                            } else {
                                id = 'custom-checkbox-' + scope.$id + '-' + Math.ceil(Math.random() * 10000);
                                iElement.attr('id', id);
                                iElement.next('label').attr('for', id);
                            }
                            if(iAttrs.ngDisabled) {
                                scope.$watch(iAttrs.ngDisabled, function (newValue) {
                                    if(newValue) {
                                        iElement.parent().addClass('disabled');
                                    } else {
                                        iElement.parent().removeClass('disabled');
                                    }
                                });
                            }
                        }
                    };

                }
            };
        });
})();
