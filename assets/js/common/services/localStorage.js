/**
 * LocalStorage Service
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .constant('localStorage', window.localStorage)
        .factory('lclStorage', lclStorage);

    function lclStorage($window, auth) {
        var service = {
            set: set,
            get: get,
            clear: clear
        };
        return service;

        function set(id, value) {
            var userName = 'capstone_' + auth.getUserName();
            if (userName) {
                var userData = JSON.parse($window.localStorage[userName] || '{}');
                userData[id] = value;
                $window.localStorage[userName] = JSON.stringify(userData);
            }
        }

        function get(id) {
            var userName = 'capstone_' + auth.getUserName();
            if (userName) {
                var userData = JSON.parse($window.localStorage[userName] || '{}');
                return userData[id];
            }
        }

        function clear() {
            var userName = 'capstone_' + auth.getUserName();
            if (userName) {
                $window.localStorage[userName] = JSON.stringify({});
            }
        }
    }
})
();
