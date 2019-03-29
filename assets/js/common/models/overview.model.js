/**
 * Created by Morgan on 51-15-92.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('mOverview', mOverview);

    function mOverview($http, URI, encodeURL, $q) {
        var service = {
            getDashboardUserProfile: getDashboardUserProfile,
            setDashboardUserProfile: setDashboardUserProfile,
            setUserWidgetOption: setUserWidgetOption,
            getSystemUsage: getSystemUsage,
            getCurtime: getCurtime,
            getETHList: getETHList,
            getETHData: getETHData,
            getErrorIncidentList: getErrorIncidentList,
            getRuleData: getRuleData,
            getStrategyData: getStrategyData,
            getIncidentData: getIncidentData,
            getErrorIncidents: getErrorIncidents
        };
        return service;

        //////////

        function getDashboardUserProfile() {
            return $http.get(URI + '/dashboarduserprofile');
        }

        function setDashboardUserProfile(data) {
            return $http({
                url: URI + '/dashboarduserprofile',
                method: 'POST',
                data: JSON.stringify(data),
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function setUserWidgetOption(data) {
            return $http.put(URI + '/users/userWidgetOptionSettings', data);
        }

        function getSystemUsage() {
            return $http.get(URI + '/devices/mw/systemstat').then(function (data) {
                return _.extend(data.data || {}, {
                    cpu: data.data.cpuUsage || 0,
                    memory: data.data.memoryUsage || 0,
                    storage: data.data.partitionUsage || 0,
                    memoryFree: data.data.memoryFree || 0,
                    partitionFree: data.data.partitionFree || 0
                });
            });
        }

        function getCurtime() {
            return $http.get(URI + '/sysbaseinfo/curtime')
                .then(function (data) {
                    return data.data;
                });
        }

        function getETHList() {
            var params = {"$filter": "interfaceType eq 'ETH'"};
            return $http.get(URI + "/netinterfaces/queryInterfacesByConditions", {
                params: encodeURL(params)
            }).then(function (data) {
                // return new Array(11).join('0').split('').map((val,i)=>'eth' + i);
                return data.data;
            });
        }

        var getETHDataDefer;
        function getETHData(ETHList, length, frequency) {
            getETHDataDefer && getETHDataDefer.resolve();
            getETHDataDefer = $q.defer();
            return $http.get(URI + '/devices/realTimeTraffics/' + frequency.value + '/' + length, {timeout: getETHDataDefer.promise}).then(function (data) {
                return data.data;
            })
                .then(function (data) {
                    if (_.isEmpty(data) && length > 1) {
                        var res = {};
                        _.each(ETHList, function (item) {
                            res[item.name] = _.range(length).map(function (item, index) {
                                return {
                                    "flowIn": 0,
                                    "flowOut": 0,
                                    "x": moment((new Date().getTime() - index * frequency.time))
                                };
                            }).reverse();
                        });
                        return res;
                    }
                    return data;
                }).then(function (data) {
                    if(_.isEmpty(data)){
                        return {};
                    }
                    var emptyData;
                    var obj = _.mapValues(data, function (item) {
                        if (!emptyData) {
                            emptyData = _.map(item, function (innerItem) {
                                return {
                                    x: moment.utc(innerItem.x).local().format(frequency.format),
                                    flowIn: 0,
                                    flowOut: 0,
                                    originTime: innerItem.x
                                };
                            });
                        }
                        return _.map(item, function (innerItem) {
                            return {
                                x: moment.utc(innerItem.x).local().format(frequency.format),
                                flowIn: parseFloat(innerItem.flowIn),
                                flowOut: parseFloat(innerItem.flowOut),
                                originTime: innerItem.x
                            };
                        });
                    });
                    _.each(ETHList, function (item) {
                        if (!obj[item.name]) {
                            obj[item.name] = emptyData;
                        }
                    });
                    return obj;
                });

            /*
             // mock data
             var data = {};
             _.each(ETHList, function (item) {
             data[item.name] = new Array(length + 1).join('0').split('').map(function (item, index) {
             return {
             "flowIn":Math.ceil(Math.random() * 30),
             "flowOut":Math.ceil(Math.random() * 30),
             "x": moment((new Date().getTime() - index * frequency.time)).format(frequency.time > 60 * 1000 ? 'MM-DD' : 'h:mm:ss')};
             });
             });
             return $q(function (resolve) {
             resolve(data);
             });*/
        }

        function getErrorIncidentList(count) { //获取最新的几条阻断事件
            return $q.resolve(new Array(count + 1).join('0').split('').map(function (val, i) {
                return {
                    time: new Date().getTime() - (count - i) * 1000,
                    msg: 'NTP时间从2016-11-30 16:32:03到:2016-11-30 16:32:03同步成功 偏移量:0.00秒'
                };
            }));
        }

        function getRuleData() { //获取规则饼图数据
            return $http.get(URI + '/dashboards/policycount')
                .then(function (data) {
                    return data.data;
                })
                .then(function (data) {
                    return _(data).map(function (item) {
                        item.num = parseInt(item.num);
                        return item;
                    }).reject(function (item) {
                        return item.num === 0;
                    }).value();
                });
        }

        function getStrategyData() { //获取策略饼图数据
            return $http.get(URI + '/natSetting/allStrategy')
                .then(function (data) {
                    return data.data;
                })
                .then(function (data) {
                    return _(data).map(function (item) {
                        item.num = parseInt(item.num);
                        return item;
                    }).reject(function (item) {
                        return item.num === 0;
                    }).value();
                });
        }

        function getIncidentData(startTime) { //获取事件柱图数据
            return $http.get(URI + '/incidents/incidentTopFive/startTime/' + startTime)
                .then(function (data) {
                    return data.data;
                })
                //    mock data start
                // .then(function (data) {
                //     return _(_.range(5)).map(function (item, i) {
                //         return {
                //             name: ['modbus', 'DNP3', 'IEC104', 'opc', 'focas'][i],
                //             num: _.random(100)
                //         }
                //     }).value();
                // })
                //    mock data end
                .then(function (data) {
                    return data.length ? data.concat(_(_.range(5)).map(function () {
                        return {
                            name: '',
                            num: 0
                        };
                    }).value()).slice(0, 5) : [];
                })
                .then(function (data) {
                    return _(data).map(function (item) {
                        item.num = parseInt(item.num);
                        return item;
                    }).sortBy('num').value();
                });
        }

        function getErrorIncidents(num) {
            var params = {"$filter": "(level eq DROP) or (level eq REJECTBOTH)"};
            params['$limit'] = num;
            params['$orderby'] = 'incidentId desc';
            return $http.get(URI + "/incidents/incidents", {
                params: encodeURL(params)
            }).then(function (data) {
                return _.sortBy(data.data, 'timestamp');
            });
        }
    }

})();
