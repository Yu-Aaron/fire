/**
 * Monitor Overview Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.overview')
        .controller('OverviewCtrl', OverviewCtrl);


    function OverviewCtrl($scope, $timeout, mOverview, HCConfig, $q, Incident, Dashboard, rx, observeOnScope) {
        var vm = this;
        //==========利用率面板==========
        vm.getETHList$ = rx.Observable.fromPromise(mOverview.getETHList());

        vm.systemUsage$$ = rx.Observable
            .timer(0,5000)
            .flatMap(function () {
                return rx.Observable.fromPromise(mOverview.getSystemUsage());
            })
            .multicast(new rx.Subject());
        vm.systemUsage__ = vm.systemUsage$$.connect();
        vm.systemUsage_ = vm.systemUsage$$
            .subscribe(function (data) {
                vm.CPU = parseInt(data.cpu.toFixed(0));
                vm.memory = parseInt(data.memory.toFixed(0));
                vm.storage = parseInt(data.storage.toFixed(0));
                vm.memoryFree = data.memoryFree;
                vm.partitionFree = data.partitionFree;
                if (vm.uptime === undefined && data.uptime) {
                    vm.uptime = calcUptime(data.uptime);
                }
                vm.ETHList && vm.ETHList.forEach(function (item) {
                    item.status = data.ethernet && data.ethernet[item.name];
                });
            });
        mOverview.getCurtime().then(function (data) {
            vm.time = new Date(data);
        });
        function calcUptime(uptime) {
            return parseInt(uptime.days) * 24 * 3600 * 1000 + parseInt(uptime.hours) * 3600 * 1000 + parseInt(uptime.minutes) * 60 * 1000;
        }

        //======事件数量统计面板===========
        vm.manualRefreshOfUnreadCount = false;
        vm.shouldFlashUnreadCount = false;
        vm.shouldFlash = false;
        vm.getUnreadCount = function () {
            $q.all([Incident.getUnreadIncidentCount(), Incident.getUnreadStrategyCount()]).then(function (d) {
                vm.unreadCount = d[0] + d[1];
                if (vm.unreadCount > 1000000) {
                    vm.manualRefreshOfUnreadCount = true;
                } else {
                    vm.manualRefreshOfUnreadCount = false;
                }
            });
        };
        vm.getUnreadCount();

        Incident.getHistoryIncidentCount().then(function (historyCount) {
            vm.historyCount = historyCount;
        });
        Dashboard.getSignatureDeployedCount().then(function (signatureCount) {
            vm.signatureCount = signatureCount.data.statsValue;
        });
        /*Dashboard.getRuleDeployedCount().then(function (ruleCount) {
            vm.ruleCount = ruleCount.data.statsValue;
        });
        Dashboard.getStrategyDeployCount().then(function (strategyDeployCount) {
            vm.strategyDeployCount = strategyDeployCount;
        });*/
        $scope.$on('newIncidentInsert', function () {
            vm.shouldFlashUnreadCount = vm.manualRefreshOfUnreadCount;
        });


        //=========流量监控面板==============
        vm.chartAreaConfig = {};

        vm.ETHList_ = rx.Observable.combineLatest(vm.getETHList$, vm.systemUsage$$, function (ETHList, systemUsage) {
            return [ETHList, systemUsage];
        }).subscribe(function (data) {
            var count = 2;
            if(!vm.ETHList) {
                vm.ETHList = _.map(data[0], function (item) {
                    return {
                        name: item,
                        checked: (data[1].ethernet && data[1].ethernet[item] !== 'down') && (count-- > 0),
                        status: data[1].ethernet && data[1].ethernet[item]
                    };
                });
            } else {
                _.each(vm.ETHList, function (item) {
                    item.status = data[1].ethernet && data[1].ethernet[item.name];
                });
            }
        });

        $scope.$watch('overview.ETHFrequency', _.debounce(function (value) {
            vm.ETHFrequencyObj = _.find(vm.ETHFrequencyList, {value: value});
        }, 200));

        vm.ETHFrequencyObj$ = observeOnScope($scope, 'overview.ETHFrequencyObj', true)
            .filter(function (res) {
                return res.newValue;
            })
            .map(function (res) {
                return res.newValue;
            });

        vm.ETHList$ = observeOnScope($scope, 'overview.ETHList', true)
            .filter(function (res) {
                function getList(arr) {
                    return arr.filter(function (item) {
                        return item.checked;
                    }).map(function (item) {
                        return item.name;
                    });
                }
                var newList = getList(res.newValue || []);
                var oldList = getList(res.oldValue || []);
                var isAdded = newList.some(function (item) {
                    return oldList.indexOf(item) < 0;
                });
                return res.newValue && isAdded;
            })
            .debounce(200)
            .map(function (res) {
                return res.newValue;
            });

        function calcUnit(value) {
            var index = 0,
                unitList =  ["Kbps", "Mbps", "Gbps", "Tbps"];
            while (value >= 1024) {
                value = value / 1024;
                index++;
            }
            return unitList[index];
        }
        function transformFlowListByUnit(flowList, unit) {
            return flowList.map(function (item) {
                return _.extend({}, item, {
                    flowIn: transformFlowByUnit(item.flowIn, unit),
                    flowOut: transformFlowByUnit(item.flowOut, unit)
                });
            });
        }
        function transformFlowByUnit(flow, unit) {
            var unitList =  ["Kbps", "Mbps", "Gbps", "Tbps"];
            var index = unitList.indexOf(unit);
            return parseFloat((flow / Math.pow(1024, index)).toFixed(2));
        }
        vm.ETHData$ = vm.ETHFrequencyObj$
            .combineLatest(vm.ETHList$, function(ETHFrequencyObj, ETHList) {
                return [ETHList, ETHFrequencyObj];
            })
            .filter(function (res) {
                return res[0] && res[1];
            })
            // .distinctUntilChanged(function (res) {
            //     return res[1];
            // })
            .flatMap(function (res) {
                vm.loadingDefer && vm.loadingDefer.resolve();
                vm.loadingDefer = $q.defer();
                vm.loadingPromise = vm.loadingDefer.promise;
                vm.pauser$$ && vm.pauser$$.onNext(true);
                vm.pauser$$ = new rx.Subject();
                var interval$;
                if(res[1].value !== 'mon') {
                    interval$ = rx.Observable.interval(res[1].time)
                        .flatMap(function () {
                            return rx.Observable.fromPromise(mOverview.getETHData(res[0], 1, res[1]).catch(function () {
                                return [];
                            }));
                        })
                        .takeUntil(vm.pauser$$);
                }
                return rx.Observable.fromPromise(mOverview.getETHData(res[0], 30, res[1]).catch(function () {
                    return {};
                }))
                    .merge(interval$ || rx.Observable.empty())
                    .filter(function (res) {
                        vm.loadingDefer && vm.loadingDefer.resolve();
                        return !_.isEmpty(res);
                    })
                    .map(function (ETHData, index) {
                        if(index === 0) {
                            vm.chartAreaConfig = _.mapValues(ETHData, function (item) {
                                var unit = calcUnit(_.max(_.flatten(item.map(function(innerItem){
                                    return [innerItem.flowIn, innerItem.flowOut];
                                }))));
                                var chart = HCConfig.createAreaChartConfig(transformFlowListByUnit(item, unit), vm.ETHFrequencyObj.title, unit);
                                chart.categories = item.map(function (innerItem) {
                                    return innerItem.originTime;
                                });
                                chart.unit = unit;
                                return chart;
                            });
                        } else {
                            _.forIn(vm.chartAreaConfig, function (chart, key) {
                                var datas = ETHData[key].filter(function (item) {
                                    return moment(item.originTime) - moment(_.last(chart.categories)) > 2 * 1000;
                                });
                                datas = transformFlowListByUnit(datas, chart.unit);
                                if(!datas.length) {
                                    return;
                                }
                                if(chart.getHighcharts && chart.getHighcharts().options) {
                                    datas.forEach(function (data) {
                                        $timeout(function () {
                                            chart.newPoint = [[data.x, data.flowIn], [data.x, data.flowOut]];
                                            chart.categories.shift();
                                            chart.categories.push(data.originTime);
                                        });
                                    });
                                }
                            });
                        }
                    });
            });
        vm.ETHData_ = vm.ETHData$
            .subscribe();

        vm.ETHFrequencyList = [{
            name: '5秒钟',
            value: 'sec',
            time: 5000,
            title: '过去150秒流量统计',
            unit: 'Kbps',
            format: 'mm:ss'
        }, {
            name: '1分钟',
            value: 'min',
            time: 60 * 1000,
            title: '过去30分钟流量统计',
            unit: 'Kbps',
            format: 'HH:mm'
        }, {
            name: '1天',
            value: 'day',
            time: 24 * 3600 * 1000,
            title: '过去30天流量统计',
            unit: 'Mbps',
            format: 'MM-DD'
        }, {
            name: '1月',
            value: 'mon',
            time: 30 * 24 * 3600 * 1000,
            title: '过去30个月流量统计',
            unit: 'Gbps',
            format: 'YY-MM'
        }];
        vm.ETHFrequency = 'sec';

        $scope.$on("$destroy", function () {
            vm.systemUsage$$.observers && vm.systemUsage$$.observers.forEach(function (item) {
                item.dispose();
            });
            vm.ETHList_.dispose();
            vm.systemUsage_.dispose();
            vm.systemUsage__.dispose();
            vm.ETHData_.dispose();
            vm.pauser$$ && vm.pauser$$.onNext(true);
        });
    }
})();
