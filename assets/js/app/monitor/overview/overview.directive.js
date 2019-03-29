/**
 * Overview Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.overview')
        .directive('ovHeader', ovHeader)
        .directive('ovEvent', ovEvent)
        .directive('ovIncidence', ovIncidence)
        .directive('circleMeter', circleMeter)
        .directive('manualFetch', manualFetch)
        .directive('systemTime', systemTime)
        .directive('errorIncident', errorIncident);

    function ovHeader() {
        var ovHeaderObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/overview/ovHeader.html',
            controller: function ($timeout, $window, $scope, $state, mOverview, Incident) {
                "ngInject";
                var incidentChart;
                $scope.$on('newIncidentInsert', function () {
                    $scope.shouldFlashTodayCount = true;
                });
                $scope.getTodayCount = function () {
                    Incident.getTodayIncidentCount().then(function (todayCount) {
                        $scope.todayCount = todayCount;
                    });
                };
                $scope.getTodayCount();
                $scope.initIncidentChart = function() {
                    mOverview.getIncidentData(moment().startOf('day').utc().format()).then(function (data) {
                        if(data && data.length && document.getElementById('incident-chart')) {
                            incidentChart = echarts.init(document.getElementById('incident-chart'));
                            incidentChart.setOption({
                                /*title: {
                                 subtext: 'Feature Sample: Gradient Color, Shadow, Click Zoom'
                                 },*/
                                grid: {
                                    left: '5%',
                                    right: '5%',
                                    bottom: '5%',
                                    top: '5%',
                                    containLabel: true
                                },
                                tooltip : {
                                    trigger: 'axis',
                                    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                                        type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                                    },
                                },
                                xAxis: {
                                    axisLabel: {
                                        textStyle: {
                                            color: '#999'
                                        }
                                    },
                                    axisTick: {
                                        show: false
                                    },
                                    axisLine: {
                                        show: false
                                    },
                                    type: 'value',
                                    z: 10
                                },
                                yAxis: {

                                    axisLabel: {
                                        textStyle: {
                                            color: '#999'
                                        }
                                    },
                                    type: 'category',
                                    data: _.map(data, function (item) {
                                        return item.name;
                                    }),

                                },
                                series: [
                                    {
                                        name: '事件数',
                                        type: 'bar',
                                        itemStyle: {
                                            normal: {
                                                color: function (obj) {
                                                    return ['#2c97de', '#2dbda8', '#84b547', '#e76d3b', '#cc3e4a'].reverse()[obj.dataIndex];
                                                }
                                            },
                                        },
                                        data: _.map(data, function (item) {
                                            return item.num;
                                        }),
                                        animationDelay: function (idx) {
                                            return idx * 200;
                                        }
                                    }
                                ],
                                animationEasing: 'ease',
                                animationDelayUpdate: function (idx) {
                                    return idx * 100;
                                }
                            });
                        } else {
                            $('#incident-chart').html('没有数据');
                        }
                    });
                };
                $scope.refreshIncidentBoard = function () {
                    $scope.getTodayCount();
                    $scope.initIncidentChart();
                };

                function create3dPieOption(series, actionMap) {
                    return {
                        chart: {
                            type: 'pie',
                            backgroundColor: 'transparent',
                            options3d: {
                                enabled: true,
                                alpha: 45
                            },
                            marginTop: -10,
                            spacingTop: 0
                        },
                        title: {
                            text: ''
                        },
                        subtitle: {
                            text: ''
                        },
                        plotOptions: {
                            pie: {
                                innerSize: 50,
                                size: 105,
                                depth: 30,
                                colors: ['#2c97de', '#2dbda8', '#84b547', '#e76d3b', '#cc3e4a'],
                                dataLabels: {
                                    color: '#aaa',
                                    connectorColor: '#aaa',
                                    style: {"fontSize": "11px", "fontWeight": "bold", "textShadow": "none" },
                                    format: "{point.name}<br>{y}条",
                                    distance: 5,
                                    connectorPadding: 5
                                },
                                tooltip: {
                                    // headerFormat: '<span>{series.name}</span><br/>',
                                    headerFormat: '',
                                    pointFormatter: function () {
                                        return '<span style="color:' + this.color + '">\u25CF</span>' + this.name + ': <b>' + this.y + '条</b><br/><span>占比：<b>' + (this.y / this.total * 100).toFixed(2) +'%</b></span>';
                                    }
                                },
                                events: {
                                    click: function (e) {
                                        $state.go(actionMap[e.point.name]);
                                    }
                                }
                            }
                        },
                        series: series
                    };
                }

                $scope.initRuleChart = function() {
                    mOverview.getRuleData()
                        .then(function (data) {
                            $scope.overview.ruleCount = _(data).map(function (item) {
                                return item.num;
                            }).reduce(function (pre, cur) {
                                return pre + cur;
                            }, 0);

                            var ruleChartOption = create3dPieOption([{
                                name: '规则类别',
                                data: _.map(data, function (item) {
                                    return [item.name, item.num];
                                })
                            }], {
                                '白名单规则': 'rule.whitelist_manager',
                                '黑名单规则': 'rule.blacklist',
                                'IPMAC规则': 'rule.ipmac'
                            });
                            $('#rule-chart').highcharts(ruleChartOption);

                        });

                };


                $scope.initStrategyChart = function() {
                    mOverview.getStrategyData()
                        .then(function (data) {
                            $scope.overview.strategyDeployCount = _(data).map(function (item) {
                                return item.num;
                            }).reduce(function (pre, cur) {
                                return pre + cur;
                            }, 0);

                            var strategyChartOption = create3dPieOption([{
                                name: '策略类别',
                                data: _.map(data, function (item) {
                                    return [item.name, item.num];
                                })
                            }], {
                                '安全策略': 'strategy.security',
                                'SNAT策略': 'strategy.nat_snat',
                                'DNAT策略': 'strategy.nat_dnat',
                                '会话策略': 'strategy.session'
                            });
                            $('#strategy-chart').highcharts(strategyChartOption);

                        });

                };
                angular.element($window).bind('resize', function () {
                    incidentChart && incidentChart.resize();
                    // ruleChart.resize();
                    // strategyChart.resize();
                });
                $scope.$on('$destroy', function () {
                    angular.element($window).unbind('resize');
                });
            }
        };

        return ovHeaderObj;
    }


    function ovIncidence() {
        var ovIncidenceObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/overview/ovIncidence.html',
            controller: function ($timeout, $window, $scope, $state, SessionStateModel, apiInfo, $interval) {
                "ngInject";
                var vm = $scope.overview;
                var sessionTrendOption = {
                    tooltip: {
                        trigger: 'axis',
                        position: 'right',
                        formatter: function (params) {
                            if(params.length && params[0].value) {
                                return '时间：' + moment(params[0].value[0]).format('YYYY-MM-DD HH:mm:ss') + '<br>会话数量：' + params[0].value[1];
                            }
                            return '';
                        },
                        padding: 10,
                        backgroundColor: '#000',
                        textStyle: {
                            color: '#fff'
                        }


                    },
                    color: ['#64f035'],
                    grid: {
                        left: '1%',
                        right: '1%',
                        bottom: '1%',
                        top: '1%',
                        containLabel: false
                    },
                    xAxis: [
                        {
                            type: 'time',
                            boundaryGap: false,
                            interval: 1000,
                            axisLine: {
                                show: true,
                                lineStyle: {color: '#283754', opacity: 1, width: 2}

                            },
                            axisTick:false,
                            splitLine: {
                                show: true,
                                lineStyle: {color: '#144d94', opacity: 0.1}
                            }
                        }
                    ],
                    yAxis: [{
                        type: 'value',
                        interval: 1000,
                        axisLine: {
                            show: true,
                            lineStyle: {color: '#283754', opacity: 1, width: 2}
                        },
                        axisTick:false,
                        splitLine: {
                            show: true,
                            lineStyle: {color: '#144d94', opacity: 0.1}
                        }
                    }],
                    series: [
                        {
                            type: 'line',
                            animation: false,
                            lineStyle: {color: '#64f035'},
                            areaStyle: {normal: {color: '#64f035', opacity: 0.2}},
                            data: []
                        }
                    ]
                };
                $scope.initSessionTrend = function () {
                    getSessionCount();
                    var sessionInterval = 5000;
                    vm.sessionInterval = $interval(getSessionCount, sessionInterval);
                };

                //  会话状态面板
                vm.navigate = function (path) {
                    $state.go(path);
                };

                function getSessionCount() {
                    apiInfo.sysbaseinfo().then(function (time) {
                        if(!$scope.sessionTrend) {
                            $scope.sessionTrend = echarts.init(document.getElementById('session_trend'));
                            $scope.sessionTrend.setOption(sessionTrendOption);
                        }
                        var sessionTrend = $scope.sessionTrend;
                        var option = sessionTrend.getOption();

                        var currTime = new Date(time.data || "");
                        var maxCount = 60;
                        var data = option.series[0].data;
                        var lastTime = data.length < 1 ? new Date(currTime.getTime() - maxCount * 1000) : new Date(new Date(data[data.length - 1][0]).getTime() + 1000);
                        currTime = (currTime.getTime() - lastTime.getTime() > maxCount * 1000) ?
                            new Date((lastTime.getTime() + maxCount * 1000)) : currTime;
                        SessionStateModel.getSessionCount(lastTime, currTime).then(function (sessionCount) {
                            if (sessionCount && sessionCount.length > 0) {
                                $scope.noSessionData = false;
                                if (data.length + sessionCount.length >= maxCount) {
                                    data.splice(0, data.length + sessionCount.length - maxCount);
                                }
                                sessionCount.forEach(function (count) {
                                    data.push(count);
                                });
                                //  set the x axis to display latest one minutes data;
                                var maxTime = data[data.length - 1][0];
                                var minTime = data[0][0];
                                sessionTrend.setOption({
                                    xAxis: {max: maxTime, min: minTime},
                                    series: [{data: data}]
                                });
                                vm.sessionCount = sessionCount[sessionCount.length - 1][1];
                            } else {
                                $scope.noSessionData = true;
                                vm.sessionCount = 0;
                            }
                        });
                    });

                }

                angular.element($window).bind('resize', function () {
                    $scope.sessionTrend.resize();
                });
                $scope.$on('$destroy', function () {
                    angular.element($window).unbind('resize');
                    if (angular.isDefined(vm.sessionInterval)) {
                        $interval.cancel(vm.sessionInterval);
                    }
                });
            }
        };
        return ovIncidenceObj;
    }

    function ovEvent() {
        var ovEventObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/overview/ovEvent.html',
            link: link
        };

        return ovEventObj;
        ////////


        function link() {
        }
    }


    function circleMeter($interval) {
        return {
            scope: {
                percent: '=',
                name: '@',
                surplus: '=?'
            },
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/overview/circleMeter.html',
            link: function (scope) {
                var startAngle = 270;
                var cx = 66;
                var cy = 66;
                var r = 66;
                var x2 = cx + r * Math.cos(startAngle * Math.PI / 180);
                var y2 = cy - r * Math.sin(startAngle * Math.PI / 180);
                calc(scope.percent || 0);
                scope.$watch('percent', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        oldValue = oldValue || 0;
                        newValue = newValue || 0;
                        animate(oldValue, newValue, 300);
                    }
                });
                function animate(oldValue, newValue, duration) {
                    var start = new Date().getTime();
                    var interval = $interval(function () {
                        var piece = new Date().getTime() - start;
                        if (piece > duration) {
                            calc(newValue);
                            $interval.cancel(interval);
                        } else {
                            calc(Math.round(piece / duration * (newValue - oldValue) + oldValue));
                        }
                    }, 33.3);
                }

                function calc(percent) {
                    scope.displayPercent = percent;
                    scope.deg = percent / 100 * 360;
                    var deg1 = startAngle - scope.deg;
                    var x1 = cx + r * Math.cos(deg1 * Math.PI / 180);
                    var y1 = cy - r * Math.sin(deg1 * Math.PI / 180);

                    if (percent < 100) {
                        scope.d = "M " + cx + "," + cy + " L " + x1 + "," + y1 + " A " + r + "," + r + " 0 1,0 " + x2 + "," + y2 + " Z";
                    } else {
                        scope.d = 'M0 0 H 140 V 140 H 0 L 0 0';
                    }
                }
            }
        };
    }

    function manualFetch() {
        return {
            restrict: 'A',
            scope: {
                manualFetch: '=',
                fetchAction: '&',
                blink: '@'
            },
            link: function (scope, iElement) {
                scope.$watch('manualFetch', function (newValue) {
                    iElement[{true: 'addClass', false: 'removeClass'}[!!newValue]](scope.blink || 'blink');
                });
                iElement.on('click', function () {
                    if (scope.manualFetch === true) {
                        scope.manualFetch = false;
                    }
                    scope.fetchAction();
                });
            }
        };
    }

    function systemTime($interval) {
        return {
            restrict: 'E',
            scope: {
                time: '=', //系统时间
                uptime: '=', //运行时长
                size: '@'
            },
            replace: true,
            templateUrl: '/templates/monitor/overview/systemTime.html',
            link: function ($scope, element) {
                $scope.size = parseInt($scope.size || 500);
                var canvas = element.find('canvas');
                canvas.attr('width', $scope.size).attr('height', $scope.size);
                var ctx = canvas[0].getContext("2d");
                var gradient;
                var color = '#3bace7';
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                // ctx.shadowBlur = 5;
                ctx.shadowColor = '#484d66';

                var timeDiffer, uptimeDiffer, interval;
                $scope.$watch('[time, uptime]', function (arr) {
                    init.apply(null, arr);
                });
                $scope.$on('$destroy', function () {
                    $interval.cancel(interval);
                });
                function init(time, uptime) {
                    timeDiffer = time ? (new Date(time).getTime() - new Date().getTime()) : 0;
                    uptimeDiffer = new Date(uptime || 0).getTime() - new Date().getTime();
                    $interval.cancel(interval);
                    renderTime();
                    interval = $interval(renderTime, 40);
                }

                function degToRad(degree) {
                    var factor = Math.PI / 180;
                    return degree * factor;
                }

                function renderTime() {
                    var time = new Date(new Date().getTime() + timeDiffer);
                    var uptime = moment.duration(new Date().getTime() + uptimeDiffer);
                    $scope.timeString = moment(time).format('YYYY年MM月DD日<br>HH:mm:ss');
                    $scope.uptimeString = Math.floor(uptime.asDays()) + '天' + uptime.hours() + '小时' + uptime.minutes() + '分';
                    var hrs = time.getHours();
                    var min = time.getMinutes();
                    var sec = time.getSeconds();
                    var mil = time.getMilliseconds();
                    var smoothsec = sec + (mil / 1000);
                    var smoothmin = min + (smoothsec / 60);

                    //Background
                    gradient = ctx.createRadialGradient($scope.size / 2, $scope.size / 2, 5, $scope.size / 2, $scope.size / 2, $scope.size * 0.6);
                    gradient.addColorStop(0, "#21232e");
                    gradient.addColorStop(1, "#0f1015");
                    ctx.fillStyle = gradient;
                    //ctx.fillStyle = 'rgba(00 ,00 , 00, 1)';
                    ctx.fillRect(0, 0, $scope.size, $scope.size);
                    //Hours
                    ctx.beginPath();
                    ctx.arc($scope.size / 2, $scope.size / 2, $scope.size * 0.44, degToRad(270), degToRad((hrs * 30) - 90));
                    ctx.stroke();
                    //Minutes
                    ctx.beginPath();
                    ctx.arc($scope.size / 2, $scope.size / 2, $scope.size * 0.41, degToRad(270), degToRad((smoothmin * 6) - 90));
                    ctx.stroke();
                    //Seconds
                    ctx.beginPath();
                    ctx.arc($scope.size / 2, $scope.size / 2, $scope.size * 0.38, degToRad(270), degToRad((smoothsec * 6) - 90));
                    ctx.stroke();

                    /*//系统时间
                     ctx.font = $scope.size * 0.06 + "px Helvetica";
                     ctx.fillStyle = '#7c94ac'
                     ctx.fillText('系统时间', $scope.size * 0.21, $scope.size * 0.4);
                     ctx.font = $scope.size * 0.08 + "px Helvetica Bold";
                     ctx.fillStyle = color;
                     ctx.fillText(dateString, $scope.size * 0.21, $scope.size * 0.46);
                     ctx.fillText(timeString, $scope.size * 0.21, $scope.size * 0.54);

                     //运行时长
                     ctx.font = $scope.size * 0.06 + "px Helvetica";
                     ctx.fillStyle = '#7c94ac'
                     ctx.fillText('系统已运行', $scope.size * 0.21, $scope.size * 0.56);
                     ctx.font = $scope.size * 0.07 + "px Helvetica Bold";
                     ctx.fillStyle = color;
                     ctx.fillText(uptimeString, $scope.size * 0.21, $scope.size * 0.62);*/

                }
            }
        };
    }

    function errorIncident() {
        return {
            scope: true,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/overview/errorIncident.html',
            link: function ($scope) {
                $scope.addIncident = function (data) {
                    $scope.incidentList.unshift(data);
                    if($scope.incidentList.length > 4) {
                        $scope.incidentList.pop();
                    }
                };
            },
            controller: function ($scope, mOverview, $state) {
                "ngInject";
                $scope.incidentList = [];
                $scope.goToIncidentState = function () {
                    $state.go('monitor.incident');
                };
                $scope.$on('newIncidentInsert', function (event, data) {
                    $scope.addIncident(data);
                });
                mOverview.getErrorIncidents(4).then(function (incidentList) {
                    incidentList.forEach(function (incident) {
                        $scope.addIncident(incident);
                    });
                });
            }
        };
    }
})();
