/**
 * toHex Filter
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter('resFilter', resFilter);


    function resFilter($rootScope) {
        return function (value, key) {
            var map = $rootScope.resource || {};
            return map[key] || value;
        };
    }
})();
