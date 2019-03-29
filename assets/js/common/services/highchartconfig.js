/**
 * HighchartConfig Service
 *
 * Description

 An example of the most basic chart config obj:

 {
         options: {
             chart: {
                 type: 'bar'
             }
         },
         series: [{
             data: [10, 15, 12, 8, 7]
         }],
         title: {
             text: 'Title'
         },

         loading: false
 }



 */
(function () {
    'use strict';

    angular.module('southWest.services')
        .factory('HCConfig', HCConfig);

    function HCConfig() {


        var service = {
            createAreaChartConfig: createAreaChartConfig,
            createVulPieChartConfig: createVulPieChartConfig,
            createItgPieChartConfig: createItgPieChartConfig,
            getAtkPieChartConfig: getAtkPieChartConfig,
            createBarChartStdConfig: createBarChartStdConfig,
            createRuleBarChartStdConfig: createRuleBarChartStdConfig
        };
        return service;

        function createAreaChartConfig(dataArray, title, unit) {
            var flowInData = [];
            var flowOutData = [];
            var timeCategory = [];

            //Data in the middleware is from latest to more recent
            var dataLen = dataArray.length;
            for (var i = 0; i < dataLen; i++) {
                // flowInData.push({x:dataArray[i].x, y:dataArray[i].flowIn});
                flowInData.push(dataArray[i].flowIn);
                // flowOutData.push({x:dataArray[i].x, y:dataArray[i].flowOut});
                flowOutData.push(dataArray[i].flowOut);
                timeCategory.push(dataArray[i].x);
            }

            var areaChartConfigObj = {
                options: {
                    credits: {
                        enabled: false
                    },
                    legend: {
                        itemHoverStyle: {
                            color: '#76B900',
                            fontWeight: 'bold'
                        },
                        itemStyle: {
                            color: '#AAAAAA'
                        },
                        x: 0,
                        y: 10
                    },
                    chart: {
                        spacingRight: 20,
                        spacingLeft: 20,
                        style: {
                            width: 'auto',
                            fontFamily: 'SourceHanSansCN-Regular, Helvetica, Arial, sans-serif'
                        },
                        backgroundColor: '#272930',
                        // type: 'area',
                        height: 240,
                        type: 'spline',
                        animation: Highcharts.svg,

                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        borderWidth: 0,
                        style: {
                            color: '#E4E4E4'
                        },
                        shared: true,
                        formatter: function () {
                            var text = '时间：<b>' + this.points[0].key + '</b><br/>';
                            return this.points.reduce(function (pre, item) {
                                return pre + item.series.name + '：' + '<b>' + item.y + unit + '</b><br/>';
                            }, text);
                        }
                    },
                    plotOptions: {},
                    yAxis: {
                        allowDecimals: false,
                        // min: 0,
                        minRange: 1,
                        title: {
                            text: '流量',
                            align: 'high',
                            offset: 0,
                            rotation: 0,
                            y: -20,
                            style: {
                                fontSize: '14px'
                            }
                        },
                        gridLineWidth: 0,
                        labels: {
                            style: {
                                color: '#999999'
                            },
                            formatter: function () {
                                return this.value + unit;
                            }
                        },
                        lineColor: '#283754',
                        lineWidth: 2,
                        // minorGridLineColor: '#1f2c3f',
                        // minorTickInterval: 2
                    },
                    xAxis: {
                        lineColor: '#283754',
                        lineWidth: 2,
                        // min: 0,
                        tickPixelInterval: 1,
                        minRange: 0.5,
                        gridLineWidth: 0,
                        minorGridLineColor: '#1f2c3f',
                        minorTickInterval: 1,
                        startOnTick: true,
                        labels: {
                            style: {
                                color: '#999999'
                            }
                        },
                        tickmarkPlacement: 'on',
                        tickColor: '#ccd6eb',
                        tickLength: 10,
                        tickInterval: 1,
                        categories: timeCategory,
                        nameToX: false,
                        crosshair: {
                            enabled: true,
                        }
                    }
                },
                series: [{
                    type: 'area',
                    name: '输入流量',
                    color: '#4c76e4',
                    fillOpacity: 0.2,
                    data: flowInData
                }, {
                    type: 'area',
                    name: '输出流量 ',
                    color: '#64f035',
                    fillOpacity: 0.2,
                    data: flowOutData
                }],
                title: {
                    style: {
                        "color": "#E4E4E4",
                        "fontSize": "14px"
                    },
                    text: title
                },

                loading: false
            };
            return areaChartConfigObj;
        }

        function createVulPieChartConfig(progressObj) {
            //explanation of how the vul/itg charts work
            //there are two graphs
            //inner graph has smaller size, and it appears under the bigger one

            //to increase the inner graph's 'width', increase the size and/or reduce
            //the inner size

            //to increase the outer graph's width, reduce its inner

            //if you change a graph's size, remember to also change the other one
            //to match it up
            var progress = !jQuery.isEmptyObject(progressObj) ? progressObj.COVERAGE : 0;

            //progress=.75;
            var vulPieChartObj = {
                options: {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: 'pie',
                        backgroundColor: '#262626',
                        margin: 0
                    },
                    title: {
                        text: null
                    },
                    tooltip: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: false,
                            borderWidth: 0,
                            borderColor: '#262626',
                            dataLabels: {
                                enabled: false,
                            },
                            states: {
                                hover: {
                                    enabled: false
                                }
                            },
                        }
                    }
                },
                series: [{
                    animation: false,
                    name: 'InnerCircle',
                    data: [{
                        y: 1,
                        color: "#AAA"
                    }],
                    innerSize: '70%',
                    size: '62%'
                }, {
                    animation: true,
                    name: 'MainGraph',
                    data: [{
                        y: progress,
                        color: "rgba(245,166,35, 1.0)"
                    }, {
                        y: 1 - progress,
                        color: "rgba(245,166,35,0.15)"
                    }],
                    innerSize: '80%'
                }]
            };
            return vulPieChartObj;
        }

        function createItgPieChartConfig(progressObj) {
            var progress = !jQuery.isEmptyObject(progressObj) ? progressObj.statsValue : 0;
            var itgPieChartObj = {
                options: {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: 'pie',
                        backgroundColor: '#262626',
                        margin: 0
                    },
                    title: {
                        text: null
                    },
                    tooltip: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: false,
                            borderWidth: 0,
                            borderColor: '#262626',
                            dataLabels: {
                                enabled: false,
                            },
                            states: {
                                hover: {
                                    enabled: false
                                }
                            },
                        }
                    }
                },
                series: [{
                    animation: false,
                    name: 'Run1',
                    data: [{
                        name: "Run1",
                        y: 1,
                        color: "#AAA"
                    }],
                    innerSize: '70%',
                    size: '62%'
                }, {
                    animation: true,
                    name: 'Run2',
                    data: [{
                        name: "Run2",
                        y: progress,
                        color: "#76B900"
                    }, {
                        name: "",
                        y: 1 - progress,
                        color: "rgba(118,185,0,0.15)"
                    }],
                    innerSize: '80%'
                }]
            };
            return itgPieChartObj;
        }

        function getAtkPieChartConfig() {
            var atkPieChartObj = {
                options: {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        backgroundColor: '#262626',
                        margin: 0,
                        type: 'pie'
                    },
                    tooltip: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            data: [{
                                name: '安全',
                                color: '#4A90E2',
                                y: 17
                            }, {
                                name: '未验证',
                                color: '#AAA',
                                y: 50
                            }, {
                                name: '危险',
                                color: '#D8711A',
                                y: 33
                            }],
                            borderWidth: 0,
                            innerSize: '30%',
                            slicedOffset: 0,

                            size: '75%'

                        }
                    }
                },
                series: [{
                    name: 'percentage',
                    type: 'pie',
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return Math.round(this.percentage * 100) / 100 + ' %';
                        },
                        distance: -20,
                        style: {
                            fontWeight: 'bold'
                        },
                        color: 'white'
                    }

                }, {
                    name: 'outerLabels',
                    type: 'pie',
                    dataLabels: {
                        softConnector: false,
                        connectorWidth: 0,
                        useHTML: true,
                        verticalAlign: 'top',
                        distance: 20,
                        style: {
                            fontSize: '14px',
                            fontWeight: 'bold'
                        },
                        formatter: function () {
                            if (this.percentage !== 0) {
                                return '<span style="color:' + this.point.color + '">' + this.point.name + '</span>';
                            }
                        }
                    }
                }],
                title: {
                    text: null
                },

                loading: false
            };
            return atkPieChartObj;
        }

        // For Bar chart of Monitor/Report: Event, Logger, Protocol -top one
        function createBarChartStdConfig(datas, names, title, frequence, yTitle, colors) {
            var yData = [], xData = [];
            var colormap = {
                orange: '#ffc521',  //orange
                red: '#fe540f',  //red
                blue: '#4284f3',  //blue
                green: '#76B900',  //green
                purple: '#6000C0'   //purple
            };

            if (!colors) {
                colors = [];
                for (var ci = 0; ci < 360; ci += (360 / names.length)) {
                    var color = {};
                    color.hue = ci;
                    color.saturation = 90 + Math.random() * 10;
                    color.lightness = 50 + Math.random() * 10;
                    colors.push('hsl(' + color.hue + ',' + color.saturation + '%,' + color.lightness + '%)');
                }
            }

            else {
                for (var c = 0; c < colors.length; c++) {
                    colors[c] = colormap[colors[c]] || colors[c];
                }
            }

            for (var i = 0; i < datas.length; i++) {
                yData.push({name: names[i], data: []});
                for (var j = 0; j < datas[i].length; j++) {
                    var item = new Date(datas[i][j].flowTimestamp || datas[i][j].timestamp);
                    if (frequence === 'hourly') {
                        //subTitle = subTitle?subTitle:(item.getFullYear().toString() + "-" + ((item.getMonth()>9)?item.getMonth().toString():('0' + item.getMonth().toString())) + "-" + ((item.getDate()>9)?item.getDate().toString():('0' + item.getDate().toString())));
                        item = ((item.getHours() > 9) ? item.getHours().toString() : ('0' + item.getHours().toString())) + ":" + ((item.getMinutes() > 9) ? item.getMinutes().toString() : ('0' + item.getMinutes().toString()));
                    } else if (frequence === 'daily') {
                        item = item.getFullYear().toString() + "-" + ((item.getMonth() > 9) ? (item.getMonth() + 1).toString() : ('0' + (item.getMonth() + 1).toString())) + "-" + ((item.getDate() > 9) ? item.getDate().toString() : ('0' + item.getDate().toString()));
                    }
                    if (i === 0) {
                        xData.push(item);
                    }
                    yData[i].data.push(parseInt(datas[i][j].value));
                }
            }

            var barChartObj = {
                chart: {
                    backgroundColor: '#292d38',
                    type: 'column',
                    style: {
                        fontFamily: 'SourceHanSansCN-Regular, Helvetica, Arial, sans-serif'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    borderWidth: 0,
                    style: {
                        color: '#E4E4E4'
                    },
                    pointFormatter: function () {
                        if (this.y > 0) {
                            return '<span style="color:' + this.series.color + '">' +
                                this.series.name + '</span>: <b>' + this.y + '</b><br/>';
                        }
                    },
                    shared: true,
                    hideDelay: 0
                },
                title: {
                    text: title,
                    style: {
                        color: '#E4E4E4'
                    }
                },
                colors: colors,
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: '#E4E4E4',
                            style: {
                                textShadow: '0 0 3px black',
                                opacity: 100
                            }
                        }
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                if (this.y > 0 && this.point.shapeArgs.height > 10) {
                                    return this.y;
                                }
                            }
                        }
                    }
                },
                xAxis: {
                    categories: xData,
                    labels: {
                        style: {
                            color: '#999999'
                        }
                    },
                    lineColor: '#434343',
                    lineWidth: 1,
                    tickLength: 0
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    gridLineColor: '#3E3E3E',
                    labels: {
                        style: {
                            color: '#999999'
                        }
                    },
                    lineColor: '#434343',
                    lineWidth: 1,
                    title: {
                        text: yTitle,
                        style: {
                            color: '#A0A0A3'
                        }
                    }
                },
                legend: {
                    itemStyle: {
                        color: '#CCCCCC'
                    },
                    itemHoverStyle: {
                        color: '#FFF'
                    },
                    itemHiddenStyle: {
                        color: '#606063'
                    }
                },
                series: yData
            };
            return barChartObj;
        }

        // For Bar chart of Monitor/Report: Event, Logger, Protocol -bottom one
        function createRuleBarChartStdConfig(datas, names, title, yTitle, colors) {
            var yData = [], xData = [];
            names = names ? names : "规则事件";
            var colormap = {
                orange: '#ffc521',  //orange
                red: '#fe540f',  //red
                blue: '#4284f3',  //blue
                green: '#76B900',  //green
                purple: '#6000C0'   //purple
            };

            if (!colors) {
                colors = [];
                for (var ci = 0; ci < 360; ci += (360 / names.length)) {
                    var color = {};
                    color.hue = ci;
                    color.saturation = 90 + Math.random() * 10;
                    color.lightness = 50 + Math.random() * 10;
                    colors.push('hsl(' + color.hue + ',' + color.saturation + '%,' + color.lightness + '%)');
                }
            }

            else {
                for (var c = 0; c < colors.length; c++) {
                    colors[c] = colormap[colors[c]] || colors[c];
                }
            }

            yData.push({name: names[0], data: []});
            for (var i = 0; i < datas.length; i++) {
                xData.push(datas[i].signatureName);
                yData[0].data.push(parseInt(datas[i].signatureCount));

            }
            var barChartObj = {
                chart: {
                    backgroundColor: '#292d38',
                    type: 'column',
                    style: {
                        fontFamily: 'SourceHanSansCN-Regular, Helvetica, Arial, sans-serif'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    borderWidth: 0,
                    style: {
                        color: '#E4E4E4'
                    },
                    shared: true,
                    hideDelay: 0
                },
                title: {
                    text: title,
                    style: {
                        color: '#E4E4E4'
                    }
                },
                colors: colors,
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            color: '#E4E4E4',
                            style: {
                                textShadow: '0 0 3px black'
                            }
                        }
                    },
                    series: {
                        color: '#D08515',
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                if (this.y > 0) {
                                    return this.y;
                                }
                            }
                        }
                    }
                },
                scrollbar: {
                    enabled: true
                },
                xAxis: {
                    categories: xData,
                    labels: {
                        style: {
                            color: '#999999'
                        },
                        formatter: function () {
                            return Number.isInteger(this.value) ? "" : this.value;
                        }
                    },
                    lineColor: '#434343',
                    lineWidth: 1,
                    tickLength: 0,
                    min: 0,
                    max: 10
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    gridLineColor: '#3E3E3E',
                    labels: {
                        style: {
                            color: '#999999'
                        }
                    },
                    lineColor: '#434343',
                    lineWidth: 1,
                    title: {
                        text: yTitle,
                        style: {
                            color: '#A0A0A3'
                        }
                    }
                },
                legend: {
                    itemStyle: {
                        color: '#CCCCCC'
                    },
                    itemHoverStyle: {
                        color: '#FFF'
                    },
                    itemHiddenStyle: {
                        color: '#606063'
                    }
                },
                series: yData
            };
            return barChartObj;
        }
    }
})();
