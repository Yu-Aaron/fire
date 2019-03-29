/**
 * Created by Morgan on 15-02-13.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Detect', Detect);

    function Detect($http, $q, URI, $filter, encodeURL) {

        var service = {
            getId: getId,
            getStartTime: getStartTime,
            graph: graph,
            graph2: graph2,
            getPatternDetail: getPatternDetail,
            getPatternTable: getPatternTable,
            upload: upload,
            getFlowdata: getFlowdata,
            getIncidentdata: getIncidentdata,
            getPatternTableCount: getPatternTableCount,
            getIncidentDetail: getIncidentDetail,
            getPattern: getPattern,
            startAnalyze: startAnalyze,
            stopAnalyze: stopAnalyze,
            getVulnerabilityCount: getVulnerabilityCount,
            deletePcap: deletePcap,
            initialstate: initialstate,
            lowlevelactor: lowlevelactor
        };
        return service;

        //////////

        function getId(topologyId) {
            return $http.get(URI + '/intrusiondetection/topology/' + topologyId).then(function (data) {
                return data.data;
            });
        }

        function getStartTime(topologyId, intrusionDetectioinId) {
            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + "/" + intrusionDetectioinId).then(function (data) {
                return data.data;
            });
        }

        function getPatternDetail(topologyId, intrusionDetectionId, id) {
            //id= 100232;
            //var pattern = {"signatureMsg":"SCHWEITZER SEL2032-File Does Not Exist","appLayerProtocol":"modbus"};
            //return $q.when(pattern);

            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/' + intrusionDetectionId + '/' + id + '/patternmatching').then(function (data) {
                console.log(data.data);
                return data.data;
            });
        }

        function getPatternTable(topologyId, payload) {
            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/intrusionincidents', {
                params: encodeURL(payload)
            }).then(function (data) {
                return data.data;
            });

            //var patternTable = [{"intrusionIncidentId":2,"alertId":0,"timestamp":"2014-07-15T21:26:28Z","ipver":0,"srcip":"192.168.0.222","dstip":"192.168.0.211","protocol":"TCP","srcName":"PLC","dstName":"HMI","srcport":0,"dstport":0,"action":"Alert","level":1,"appLayerProtocol":"modbus","packetLen":78,"packet":"08 00 27 ff ee 23 08 00 27 67 05 3c 08 00 45 00 00 40 82 04 40 00 40 06 35 b2 c0 a8 00 de c0 a8 00 d3 01 f6 a3 1e 59 f6 42 a7 01 7f 61 ec 80 18 00 e3 b2 a2 00 00 01 01 08 0a 08 0a c0 b3 08 0a c7 2d 00 02 00 00 00 06 00 05 04 01 ff 00 ","matchedKey":"Function: Write Single Coil[5]","alertType":0,"isPolicy":0,"signatureId":100117,"payloadLen":12,"intrusionDetectionId":"135de29f-b703-491e-8329-67b8426b2d10","_severity":1}];
            //return $q.when(patternTable);
        }

        function getPatternTableCount(topologyId, payload) {
            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/intrusionincidents/count', {
                params: encodeURL(payload)
            }).then(function (data) {
                return data.data;
            });
        }

        function getFlowdata(topologyId, intrusionDetectionId) {
            // topologyId = 1;
            // intrusionDetectionId = 1;
            // var flowData = [
            //   [1408117170000, 14],
            //   [1408117171000, 4],
            //   [1408117172000, 3],
            //   [1408117173000, 3],
            //   [1408117174000, 2],
            //   [1408117175000, 2],
            //   [1408117176000, 2],
            //   [1408117177000, 1],
            //   [1408117178000, 1],
            //   [1408117179000, 1],
            //   [1408117180000, 9]
            // ];
            // return $q.when(flowData);

            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/' + intrusionDetectionId + '/flowdatastats')
                .then(function (data) {
                    return data.data;
                });
        }

        function getIncidentdata(topologyId, intrusionDetectionId) {

            // topologyId = 0;
            // intrusionDetectionId = 0;

            // var flags = [{
            //   x: 1408117172000,
            //   color: '#FF6600',
            //   fillColor: '#FF6600'
            // }, {
            //   x: 1408117177000,
            //   color: '#FF0000',
            //   fillColor: '#FF0000'
            // }];
            // return $q.when(flags);

            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/' + intrusionDetectionId + '/incidentstats')
                .then(function (data) {
                    return data.data;
                });
        }

        function getIncidentDetail(topologyId, intrusionIncidentId) {
            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/intrusionincidents/' + intrusionIncidentId).then(function (data) {
                return data.data;
            });
        }

        function getPattern(topologyId, intrusionDetectionId) {
            //var pattern = [{
            //     "severity": 2,
            //     "count": 1,
            //     "signatureId": 100009,
            //     "threadName": "Kingview HMI 堆溢出尝试"
            //}, {
            //     "severity": 2,
            //     "count": 1,
            //     "signatureId": 100017,
            //     "threadName": "NETBIOS DCERPC Messenger 服务缓冲区溢出尝试"
            //}, {
            //     "severity": 2,
            //     "count": 2,
            //     "signatureId": 100030,
            //     "threadName": "西门子SIMATIC WinCC flexible runtime 栈缓冲区溢出尝试3"
            //}, {
            //     "severity": 2,
            //     "count": 1,
            //     "signatureId": 100045,
            //     "threadName": "CitectSCADA ODBC 缓冲区溢出尝试"
            //}, {
            //     "severity": 2,
            //     "count": 1,
            //     "signatureId": 100050,
            //     "threadName": "IGSS SCADA 系统目录遍历和上传覆盖"
            //}, {
            //     "severity": 1,
            //     "count": 1,
            //     "signatureId": 100117,
            //     "threadName": "PcVue ActiveX 控件不安全的方法调用(DeletePage)"
            //}, {
            //     "severity": 1,
            //     "count": 1,
            //     "signatureId": 100118,
            //     "threadName": "PcVue ActiveX 控件不安全的方法调用(SaveObject)"
            //}, {
            //     "severity": 2,
            //     "count": 1,
            //     "signatureId": 100150,
            //     "threadName": "Sielco Sistemi Winlog DbiSetToRecordNo op 3c 代码执行"
            //}];
            //return $q.when(pattern);

            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/' + intrusionDetectionId + '/patterns')
                .then(function (data) {
                    return data.data;
                });
        }

        function graph2(mode, scope, startTime) {
            //console.log(startTime);
            if (!startTime) {
                startTime = "";
            }

            var graphObj = {
                options: {
                    plotOptions: {
                        area: {
                            lineColor: '#76B900',
                            fillOpacity: 0.7
                        }
                    },
                    chart: {
                        borderColor: '#000000',
                        borderWidth: 1,
                        backgroundColor: '#323232',
                        events: {
                            load: function () {
                                scope.chart = this;
                            }
                        }
                        // events: {
                        //   load: function () {
                        //     // set up the updating of the chart each second
                        //     var graph = this;
                        //     setInterval(function () {
                        //       var series = graph.series[0];
                        //       var x = (new Date()).getTime(), // current time
                        //         y = Math.round(Math.random() * 100);
                        //       series.addPoint([x, y], true, true);
                        //     }, 1000);
                        //   }
                        // }
                    },

                    yAxis: {
                        opposite: false,
                        gridLineColor: '#000000',
                        gridLineWidth: 1,
                        alternateGridColor: 'transparent'
                    },
                    xAxis: {
                        //min: (function(){
                        //  return (new Date()).getTime() - 60 * 1000;
                        //}()),
                        ordinal: false,
                        gridLineColor: '#000000',
                        gridLineWidth: 1,
                        alternateGridColor: 'transparent'
                    },
                    tooltip: {
                        formatter: function () {
                            if (this.series && this.series.name === 'Series 2') {
                                return '事件发生时间：' + $filter('date')(this.x, "yyyy-MM-dd HH:mm:ss");
                            } else {
                                return false;
                            }
                        }
                    },
                    rangeSelector: {
                        enabled: true,
                        selected: 3,
                        inputEnabled: false,
                        buttonTheme: { // styles for the buttons
                            fill: 'none',
                            stroke: 'none',
                            'stroke-width': 0,
                            r: 8,
                            style: {
                                color: 'white',
                                fontWeight: 'bold'
                            },
                            states: {
                                hover: {},
                                select: {
                                    fill: 'gray',
                                    style: {
                                        color: 'white'
                                    }
                                }
                            }
                        },
                        buttons: [{
                            type: 'second',
                            count: 30,
                            text: '30秒'
                        }, {
                            type: 'minute',
                            count: 1,
                            text: '1分'
                        }, {
                            type: 'minute',
                            count: 5,
                            text: '5分'
                        }, {
                            type: 'all',
                            text: '全部'
                        }]
                    },
                    navigator: {
                        enabled: true
                    }
                },
                series: [{
                    name: '事件数量',
                    id: 'dataseries',
                    type: 'area',
                    color: '#4D681E'
                    //marker: {
                    //  enabled: true,
                    //  fillColor :'#76B900',
                    //  radius : 6
                    //},
                }, {
                    type: 'flags',
                    id: 'incidentseries',
                    name: 'Incidents',
                    onSeries: 'dataseries',
                    title: ' ',
                    shape: 'circlepin',
                    y: -5,
                    stackDistance: 15,
                    enableMouseTracking: true,
                    width: 5,
                    height: 5,
                    useHTML: true
                }],
                title: {
                    align: 'left',
                    text: (mode === 'online' ? '当前数据检测' : '离线数据检测'),
                    useHTML: true,
                    style: {
                        color: "#888888"
                    }
                },
                subtitle: {
                    align: 'right',
                    text: (mode === 'online' ? '实时检测开始时间：' + startTime : ''),
                    useHTML: true,
                    style: {
                        color: "#cccccc"
                    }
                },
                useHighStocks: true,
                loading: false
            };
            return graphObj;
        }

        function upload(id, file) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: URI + '/files/topology/' + id + '/pcapupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function graph(data) {
            var graphObj = {
                options: {
                    rangeSelector: {
                        enabled: true,
                        selected: 1
                    },
                    navigator: {
                        enabled: true
                    }
                },
                series: [{
                    name: 'AAPL Stock Price',
                    data: data,
                    turboThreshold: 1,
                    type: 'area',
                    threshold: null,
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }],
                title: {
                    text: 'AAPL Stock Price'
                },
                useHighStocks: true,
                loading: false
            };
            return graphObj;
        }

        function startAnalyze(topologyId, payload) {
            return $http.post(URI + '/intrusiondetection/topology/' + topologyId, payload).then(function (data) {
                return data.data;
            });
        }

        function stopAnalyze(topologyId, payload) {
            return $http.put(URI + '/intrusiondetection/topology/' + topologyId, payload).then(function (data) {
                return data.data;
            });
        }

        function getVulnerabilityCount() {
            return $http.get(URI + '/vulnerabilities/count').then(function (data) {
                return data.data;
            });
        }

        function deletePcap(topologyId, intrusionDetectionId) {
            return $http.delete(URI + '/files/topology/' + topologyId + '/' + intrusionDetectionId + '/pcapdeletion').then(function (data) {
                return data.data;
            });
        }

        function initialstate(topologyId, intrusionDetectionId) {
            return $http.get(URI + '/intrusiondetection/topology/' + topologyId + '/' + intrusionDetectionId + '/initialstate').then(function (data) {
                return data.data;
            });
        }

        function lowlevelactor(topologyId, intrusionDetectionId, payload) {
            return $http.post(URI + '/intrusiondetection/topology/' + topologyId + '/' + intrusionDetectionId + '/lowlevelactor', payload).then(function (data) {
                return data.data;
            });
        }

    }

})();
