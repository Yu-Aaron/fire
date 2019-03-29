/**
 * Enum Services
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('Enum', function () {
            var _enum = {};

            return {
                set: function (key, value) {
                    _enum[key] = value;
                },

                get: function (key) {
                    return _enum[key];
                }
            };
        });
})();
