(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('heartbeat', function ($interval, $http, URI) {
            var isBeating = false;
            var interval;
            function sendRequest() {
                $http.get(URI + '/heartbeat', {
                    ignoreLoadingBar: true
                });
            }
            function start() {
                if(isBeating) {
                    return;
                }
                isBeating = true;
                sendRequest();
                interval = $interval(function () {
                    sendRequest();
                }, 5000);
            }
            function end() {
                $interval.cancel(interval);
                isBeating = false;
            }
            return {
                start: start,
                end: end
            };
        });
})();
