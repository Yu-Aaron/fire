/**
 * EncodeURL Services
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .value('encodeURL', function (urlObj) {
            if (urlObj) {
                Object.keys(urlObj).forEach(function (key) {
                    // urlObj[key] = encodeURI(urlObj[key]);
                    if (angular.isString(urlObj[key])) {
                        urlObj[key] = urlObj[key].replace(/\s/g, '%20');
                    }
                });
            }

            return urlObj;
        });
})();
