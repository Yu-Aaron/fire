/**
 * customRadio Directive
 *
 * Description: 定制radio的样式
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('customRadio', function () {
            return {
                restrict: 'A',
                compile: function compile(tElement, tAttrs) {
                    tElement.after('<label class="' + (tAttrs.class || 'custom-radio') + '"' + (tAttrs.ngHide ? (' ng-hide=' + tAttrs.ngHide) : '') + '></label>').parent().addClass('custom-radio-wrap');
                    return {
                        post: function postLink(scope, iElement, iAttrs) {
                            var id;
                            if(iAttrs.id) {
                                iElement.next('label').attr('for', iAttrs.id);
                            } else {
                                id = 'custom-radio-' + scope.$id + '-' + Math.ceil(Math.random() * 10000);
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
