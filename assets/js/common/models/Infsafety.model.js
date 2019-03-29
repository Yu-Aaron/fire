/**
 * Created by Morgan on 15-02-13.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('infSafety', infSafety);

    function infSafety($http, $q, URI) {

        var analyzeTable = [
            //{
            //  "id": "useVulner",
            //  "method": "计算包含漏洞",
            //  "memo": "将包含设备漏洞信息进行机选"
            //},
            {
                "id": "vimp",
                "method": "显示最短攻击路径",
                "memo": "计算结果只针对最短路径"
            }
        ];


        var service = {
            getId: getId,
            source: getSoureTable,
            target: getTargetTable,
            analyze: getAnalyzeTable,
            calculate: calculate,
            pieChart: pieChart
        };
        return service;

        //////////

        function getId() {
            return $http.get(URI + '/structuresafeties/newid/').then(function (data) {
                return data.data;
            });
        }

        function getSoureTable(topologyId, infsafetyId) {
            return $http.get(URI + '/structuresafeties/topology/' + topologyId.id + '/structuresafety/' + infsafetyId + '/nodes').then(function (data) {
                return data.data;
            });
        }

        function getTargetTable(topologyId, infsafetyId) {
            return $http.get(URI + '/structuresafeties/topology/' + topologyId.id + '/structuresafety/' + infsafetyId + '/nodes').then(function (data) {
                return data.data;
            });
        }

        function getAnalyzeTable() {
            return $q.when(analyzeTable);
        }

        function calculate(topologyId, infsafetyId, params) {
            return $http.post(URI + '/structuresafeties/topology/' + topologyId.id + '/structuresafety/' + infsafetyId + '/calculatesafety', params).then(function (data) {
                return data.data;
            });
        }

        function pieChart(pathSafetyData, filterPathSafety, score) {

            var pieChartObj = {
                options: {
                    chart: {
                        plotBackgroundColor: '#212121',
                        plotBorderWidth: null,
                        plotShadow: false,
                        margin: [0, 0, 0, 0]
                    },
                    tooltip: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            shadow: false,
                            center: ['50%', '50%']
                        }
                    },
                    legend: {
                        enabled: true,
                        itemDistance: 40,
                        symbolWidth: 9,
                        symbolHeight: 9,
                        symbolPadding: 5,
                        itemStyle: {
                            color: '#CCCCCC',
                            fontSize: '13px'
                        },
                        itemHoverStyle: {
                            color: '#CCCCCC'
                        }
                    }
                },
                series: [
                    {
                        ignoreHiddenPoint: true,
                        type: 'pie',
                        name: 'Browser share',
                        data: pathSafetyData,
                        allowPointSelect: false,
                        cursor: 'pointer',
                        innerSize: 80,
                        minSize: 100,
                        showInLegend: true,
                        size: 130,
                        borderWidth: 0,
                        point: {
                            events: {
                                legendItemClick: function () {
                                    return false;
                                },
                                click: function () {
                                    //filterPathSafety(this);
                                }
                            }
                        },
                        dataLabels: {
                            enabled: true,
                            distance: 10,
                            useHTML: true,
                            format: '<b style="color : {point.color}; font-size: 12px;">{point.y}</b><b style="font-size: 12px;"> 条路径</b>',
                            style: {
                                color: '#CCCCCC'
                            }
                        }
                    },
                    {
                        name: 'score',
                        allowOverlap: true,
                        allowPointSelect: false,
                        type: 'pie',
                        data: [{color: '#4C4D4C', y: score}],
                        size: 80,
                        borderWidth: 0,
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        dataLabels: {
                            softConnector: false,
                            useHTML: true,
                            format: '<br><b style="font-size: 35px; line-height: 25px;">{point.y}</b><br style="line-height: 13px;"><b style="margin-left:30px;">总分</b>',
                            color: '#CCCCCC',
                            distance: -60
                        }
                    }
                ],
                title: {
                    text: null
                },

                loading: false,
                size: {
                    width: 269,
                    height: 270
                }

            };
            return pieChartObj;
        }

    }

})();
