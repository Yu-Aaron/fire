/**
 * timer service
 *
 * Description, get current time from ntp server, and update the time every second
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('timerService', constantService)
        .factory('serverTime', serverTime)
        .filter('fromToFilter', fromToFilter);

    function constantService(apiInfo) {
        var obj = {};
        obj.timeOffset = 0;
        obj.initialized = false;
        obj.init = function () {
            obj.localTime = new Date();
            apiInfo.sysbaseinfo().then(function (data) {
                obj.serverTime = new Date(data.data);
                if (!obj.initialized) {
                    obj.updateClock();
                    obj.initialized = true;
                }
            });
            return obj;
        };
        obj.updateClock = function () {
            obj.localTime.setTime(obj.localTime.getTime() + 1000);
            obj.serverTime.setTime(obj.serverTime.getTime() + 1000);
            setTimeout(obj.updateClock, 1000);
        };
        return obj;
    }

    function fromToFilter() {
        return function (items, begin, end) {
            if (items) {
                return items.slice(begin, end);
            }
            return null;
        };
    }

    function serverTime(apiInfo, $q) {
        var differ;
        return {
            getTime: function () {
                if(differ) {
                    return $q.resolve(new Date().getTime() + differ);
                } else {
                    return apiInfo.sysbaseinfo().then(function (data) {
                        var serverTime = new Date(data.data).getTime();
                        differ = serverTime - new Date().getTime();
                        return serverTime;
                    });
                }
            },
            clearCache: function () {
                differ = undefined;
            }
        };
    }
})();
