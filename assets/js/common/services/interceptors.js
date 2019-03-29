/**
 * Interceptors Service
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('unauthorized', unauthorizedResponse);

    function unauthorizedResponse($q, $injector, $crypto, $rootScope) {
        return {
            'request': function (config) {
                var encryptKeys = ['$top', '$skip', '$select', '$from', '$filter', '$groupby', '$orderby', '$limit'];
                var encryptArr = [];
                if (config.params || config.url.indexOf('?') > 0) {
                    var paramsStr = config.url.split('?')[1];
                    config.params = config.params || {};
                    if(paramsStr) {
                        _.extend(config.params, _.object(paramsStr.split('&').map(function (str) {
                            return str.split('=');
                        })));
                    }
                    config.params = _.omit(config.params, function (value, key) {
                        if(encryptKeys.indexOf(key) >= 0) {
                            encryptArr.push([key, value].join('='));
                            return true;
                        }
                    });
                    if(encryptArr.length) {
                        _.extend(config.params, {
                            encrypt: btoa($crypto.encrypt(encryptArr.join('&'), $rootScope.secretKey))
                        });
                    }
                    config.url = config.url.split('?')[0];
                }
                // if(config.data && config.headers['Content-Type'] === 'application/json;charset=utf-8') {
                //   config.data = {
                //     encryptData: btoa($crypto.encrypt(JSON.stringify(config.data), $rootScope.secretKey))
                //   }
                // }
                return $q(function (resolve) {
                    resolve(config);
                });
            },
            responseError: function (response) {
                var auth = $injector.get('auth');
                if (response.status === 401 || response.status === 403) {
                    console.log(response);
                    auth.clear();
                }
                return $q.reject(response);
            }
        };
    }
})();
