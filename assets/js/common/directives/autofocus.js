/**
 * Autofocus Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular.module('southWest.directives')
        .directive('autofocus', autofocus)
        .factory('autofocusCtrl', autofocusCtrl);

    function autofocusCtrl($timeout) {
        var service = {
            focusById: focusById
        };
        return service;

        function focusById(Id) {
            $timeout(function () {
                document.getElementById(Id).focus();
            },1000);
        }
    }

    function autofocus($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element) {
                $timeout(function () {
                    $element[0].focus();
                });
            }
        };
    }
})();
