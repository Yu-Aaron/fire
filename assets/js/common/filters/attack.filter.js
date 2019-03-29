/**
 * toHex Filter
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter('selectConvert', selectConvert)
        .filter('selectConvertHTML', selectConvertHTML)
        .filter('selectConvertBack', selectConvertBack);

    function selectConvert() {
        return function (value) {
            // console.log(value);
            var map = {
                eq: '=',
                gt: '>',
                lt: '<',
                co: '包含'
            };

            // console.log(value);

            var result = [value].map(function (v) {
                return map[v];
            });

            // console.log(result);
            return result || value;
        };
    }

    function selectConvertHTML() {
        return function (value) {
            //console.log(value);
            var map = {
                eq: '=',
                gt: '>',
                lt: '<',
                co: '包含'
            };

            //console.log(value);

            var result = value.map(function (v) {
                return map[v];
            });

            // console.log(result);
            return result || value;
        };
    }

    function selectConvertBack() {
        return function (value) {
            // console.log(value);
            var map = {
                '=': 'eq',
                '>': 'gt',
                '<': 'lt',
                '包含': 'co'
            };
            // console.log(map[value]);
            return map[value] || value;
        };
    }
})();
