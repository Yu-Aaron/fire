/************************************
 *    Event Count Date Share Service
 ************************************/
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('evtCnt', evtCnt);

    function evtCnt(Incident, Event, apiInfo) {
        var eventCounter = {
            timeGap: 5000,
            totalIncident: 0,
            // eventTotal: 0,
            // totalCount: 0,
            newIncident: 0,         //未读安全事件
            newStrategy: 0,         //未读策略事件
            totalNew: 0,            //总未读事件
            todayIncident: 0,       //今日安全事件
            todayStrategy: 0,       //今日策略事件
            totalToday: 0,          //今日总数
            errorIncident: 0,       //总阻断事件
            newWarnIncident: 0,     //未读警告事件
            newErrorIncident: 0,    //未读阻断事件
                                    //部署漏洞数
                                    //部署规则数
            peakHour: {},           //高峰时段
            countLimitNum: [1000, 5000, 10000],
            countTimeNum: [5000, 10000, 20000],
            isInit: false,
            totalTodayPromise: null
        };

        var service = {
            init: init,
            get: get,
            set: set,
            change: change,
        };
        return service;

        function init() {
            //If eventCounter has not been Init and totalTodayPromise is null, then call API.
            //If eventCounter has been Init, just return the finined promise, which means the data in eventCounter is ready to be used.
            //If totalTodayPromise is not null, then APIs have already been called. return promise and just wait till APIs return data.
            if ((!eventCounter.isInit) && (!eventCounter.totalTodayPromise)) {
                eventCounter.totalTodayPromise = apiInfo.sysbaseinfo().then(function (data) {
                    var now = new Date(data.data || "");
                    var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    return Incident.getCount({'$filter': 'status eq NEW'}, true).then(function (newIncident) {
                        return Event.getCount({'$filter': 'status eq NEW'}).then(function (newEvent) {
                            return Incident.getCount({'$filter': "timestamp ge '" + moment(startOfDay).utc().format() + "'"}, true).then(function (todayIncident) {
                                return Event.getCount({'$filter': "timestamp ge '" + moment(startOfDay).utc().format() + "'"}).then(function (todayEvent) {
                                    eventCounter.newIncident = newIncident;
                                    eventCounter.newEvent = newEvent;
                                    eventCounter.totalNew = newIncident + newEvent;
                                    eventCounter.todayIncident = todayIncident;
                                    eventCounter.todayEvent = todayEvent;
                                    eventCounter.totalToday = todayIncident + todayEvent;
                                    eventCounter.timeGap = eventCounter.totalToday > eventCounter.countLimitNum[2] ? -1 : (eventCounter.totalToday > eventCounter.countLimitNum[1] ? eventCounter.countTimeNum[2] : (eventCounter.totalToday > eventCounter.countLimitNum[0] ? eventCounter.countTimeNum[1] : eventCounter.countTimeNum[0]));
                                    eventCounter.isInit = true;
                                });
                            });
                        });
                    });
                });
            }
            // return promise anyway
            return eventCounter.totalTodayPromise;
        }

        function get(key) {
            return eventCounter[key];
        }

        function set(key, value) {
            eventCounter[key] = value;
            if (key === 'totalToday') {
                eventCounter.timeGap = eventCounter.totalToday > eventCounter.countLimitNum[2] ? -1 : (eventCounter.totalToday > eventCounter.countLimitNum[1] ? eventCounter.countTimeNum[2] : (eventCounter.totalToday > eventCounter.countLimitNum[0] ? eventCounter.countTimeNum[1] : eventCounter.countTimeNum[0]));
            }
        }

        function change(key, value) {
            eventCounter[key] += value;
            if (key === 'totalToday') {
                eventCounter.timeGap = eventCounter.totalToday > eventCounter.countLimitNum[2] ? -1 : (eventCounter.totalToday > eventCounter.countLimitNum[1] ? eventCounter.countTimeNum[2] : (eventCounter.totalToday > eventCounter.countLimitNum[0] ? eventCounter.countTimeNum[1] : eventCounter.countTimeNum[0]));
            }
        }
    }
})();

