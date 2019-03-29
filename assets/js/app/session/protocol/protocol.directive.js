/**
 * Created by duanrenjie on 16-12-2.
 */
/**
 * Session Directive
 *
 */

(function () {
    'use strict';

    angular.module("southWest.session.protocol")
        .directive("sessionPoolOverview", sessionPoolOverview);
    function sessionPoolOverview() {
        var obj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/session/protocol/sessionPooloverview.html',
            controller: ['$scope', '$rootScope', 'ProtocolModel', 'apiInfo', controller],
            controllerAs: 'sessionPoolOverviewCtrl'
        };
        return obj;

        function controller($scope, $rootScope, ProtocolModel, apiInfo) {
            var vm = this;
            vm.open = false;
            vm.active = false;
            vm.searchS = true;
            vm.selectedProto = "请选择";
            vm.searchTime = 'h';
            vm.srcIp = "";
            vm.dstIp = "";
            vm.sTime = "";
            vm.eTime = "";
            vm.protocol = [
                {name: 'modbus', selected: false},
                {name: 'opcda', selected: false},
                {name: 's7', selected: false},
                {name: 'dnp3', selected: false},
                {name: 'iec104', selected: false},
                {name: 'mms', selected: false},
                {name: 'profinetio', selected: false},
                {name: 'goose', selected: false},
                {name: 'sv', selected: false},
                {name: 'eniptcp', selected: false},
                {name: 'enipudp', selected: false},
                {name: 'enipio', selected: false},
                {name: 'http', selected: false},
                {name: 'ftp', selected: false},
                {name: 'telnet', selected: false},
                {name: 'pop3', selected: false},
                {name: 'smtp', selected: false},
                {name: 'opcua', selected: false},
                {name: 'pnrtdcp', selected: false},
                {name: 'snmp', selected: false}
                ];
            vm.setSelectItem = function (name, selected) {
                vm.selectedProto = "";
                vm.protocol[name] = selected;
                vm.protocol.forEach(function (oneProtocol) {
                    var protocolName = oneProtocol.name;//(oneProtocol.name==='modbus-tcp'?'modbus':oneProtocol.name);
                    if (oneProtocol.selected) {
                        if (!vm.selectedProto) {
                            vm.selectedProto = protocolName;
                        } else {
                            vm.selectedProto = vm.selectedProto + ',' + protocolName;
                        }
                    }
                });
                if (!vm.selectedProto) {
                    vm.selectedProto = "请选择";
                }
            };
            vm.activeSearch = function () {
                vm.active = !vm.active;
            };
            vm.convertData = function (iteam, average, cor) {
                var data = iteam.data;
                var res = [];
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    var fromCoord = vm.geoCoordMap[dataItem.srcPool];
                    var toCoord = vm.geoCoordMap[dataItem.dstPoolName];
                    if (fromCoord && toCoord) {
                        res.push({
                            fromName: dataItem.srcPool,
                            toName: dataItem.dstPoolName,
                            coords: [fromCoord, toCoord],
                            //lineValue: dataItem.srcPool + '->' + dataItem.dstPoolName + ':' + ((iteam.protocolName==='modbus')?'Modbus-TCP':iteam.protocolName) + '</br>共' + dataItem.value + '个数据包',
                            lineValue: dataItem.srcPool + '->' + dataItem.dstPoolName + ':' + iteam.protocolName + '</br>共' + dataItem.value + '个数据包',
                            lineStyle: {
                                normal: {
                                    width: getLineWidth(dataItem.value, average)
                                }
                            },
                            srcPoolId: dataItem.srcPoolId,
                            dstPoolId: dataItem.dstPoolId,
                            type: 'pool',
                            cor: cor
                        });
                    }
                }
                return res;
            };
            function getLineWidth(count, average) {
                if (count / average < 0.5) {
                    return 0.5;
                } else if (count / average > 4) {
                    return 4;
                } else {
                    return count / average;
                }
            }

            var sessionPoolOverviw;
            //绘制地图
            vm.defaultMap = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", "properties": {"name": "defaultMap"}, "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [[[0, 0.5], [25.0, 0.5], [25.0, 9.5], [0.0, 9.5]]]
                        ]
                    }
                    }
                ]
            };
            //注册自定义地图
            echarts.registerMap('defaultMap', vm.defaultMap);
            //*****************session_pool_overviw begin*********************
            vm.searchTime = 'h';
            vm.timeChange = function (t) {
                vm.searchTime = t;
            };
            vm.saveAsImage = function() {
                sessionPoolOverviw.dispatchAction({
                    type: 'saveAsImage',
                    context: _.find(sessionPoolOverviw._componentsViews, function (item) {
                        return item.__id.indexOf('toolbox') >= 0;
                    })._features.saveAsImage
                });
            };
            vm.restore = function () {
                sessionPoolOverviw.dispatchAction({
                    type: 'restore'
                });
            };
            vm.goBack = function() {
                vm.searchS = true;
                sessionPoolOverviw.clear();
                vm.search();
                sessionPoolOverviw.setOption(vm.option);
            };
            vm.search = function () {
                apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");

                    var fullYear = currTime.getFullYear();
                    var month = currTime.getMonth() + 1;
                    var day = currTime.getDate();
                    var hours = currTime.getHours();

                    var timeData = fullYear + '-' + month + '-' + day + ' ' + hours + ':' + '00' + ':' + '00';
                    var stimeDataSec = new Date(timeData || "");
                    var etimeDataSec = new Date(timeData || "");

                    var endTime = (new Date(stimeDataSec.setHours(stimeDataSec.getHours() + 1))).toISOString();
                    endTime = endTime.slice(0, endTime.length - 5) + "+00:00";

                    var startSecond;
                    if (vm.searchTime === 'h') {
                        startSecond = etimeDataSec;
                    } else if (vm.searchTime === 'd') {
                        startSecond = etimeDataSec.setMinutes(etimeDataSec.getMinutes() - 60 * 23, etimeDataSec.getSeconds(), 0);
                    } else if (vm.searchTime === 'w') {
                        startSecond = etimeDataSec.setMinutes(etimeDataSec.getMinutes() - 60 * 24 * 7 + 60, etimeDataSec.getSeconds(), 0);
                    }
                    var startTime = (new Date(startSecond)).toISOString();
                    startTime = startTime.slice(0, startTime.length - 5) + "+00:00";
                    var strProtos = "";
                    if (vm.selectedProto === "请选择") {
                        vm.selectedProto = "";
                    } else {
                        var protos = vm.selectedProto.split(",");
                        protos.forEach(function (proto, index) {
                            //proto = (proto==='Modbus-TCP'?'modbus':proto);
                            if (index === 0) {
                                strProtos = strProtos + "'" + proto + "'";
                            } else {
                                strProtos = strProtos + ",'" + proto + "'";
                            }
                        });
                    }
                    vm.sTime = startTime;
                    vm.eTime = endTime;
                    ProtocolModel.get(strProtos, vm.srcIp, vm.dstIp, startTime, endTime).then(function (data) {
                        if (data.length < 1) {
                            return;
                        }
                        var geoCoord = data[0];
                        var otherCoord = data[1];
                        var datas = data[2];
                        var average = data[3].average;
                        vm.init_sessionPoolOverviw(geoCoord, otherCoord, datas, average);
                    }).then(function () {
                        sessionPoolOverviw = echarts.init(document.getElementById("session_poolOverview"));
                        sessionPoolOverviw.setOption(vm.option);

                        sessionPoolOverviw.on('click', function (params) {
                            //查看地址池详情
                            if (params.seriesType === 'effectScatter' && params.name !== '防火墙外地址池' && params.data.type === 'pool') {
                                vm.searchS = false;
                                sessionPoolOverviw.clear();
                                vm.showAssetProtocol_pool(params.data.name, params.data.poolId);
                            }
                            //查看协议线详情
                            if (params.seriesType === 'lines' && params.data.type === 'pool') {
                                vm.searchS = false;
                                sessionPoolOverviw.clear();
                                vm.showAssetProtocol_line(params.seriesName, params.data.fromName, params.data.toName, params.data.srcPoolId, params.data.dstPoolId, params.data.cor);
                            }
                            if (params.seriesType === 'lines' && params.data.type === 'asset') {
                                /* var filter = "(packetTimestamp gt '"+vm.sTime+"' and packetTimestamp lt '"+vm.eTime+"') and (contains(sourceIp,'"+params.data.fromName+"')) and (contains(destinationIp,'"+params.data.toName+"')) and (contains(protocolSourceName,'"+params.data.protocolType+"'))";
                                 $rootScope.$broadcast('getPoolLinesDetail',{'$filter':filter,'$limit':10,'$skip':0},params.data.protocolType);*/
                                $rootScope.$broadcast('getPoolLinesDetail', vm.sTime, vm.eTime, params.data.fromName, params.data.toName, params.data.protocolType);
                            }
                            if (params.seriesType === 'graph' && params.dataType === 'edge') {
                                $rootScope.$broadcast('getPoolLinesDetail', vm.sTime, vm.eTime, params.data.source, params.data.target, params.data.protocolName);
                            }
                            $scope.$digest();
                        });
                    });
                });
            };

            vm.init_sessionPoolOverviw = function (geoCoord, otherCoord, datas, average) {
                //获取数据
                vm.geoCoord = geoCoord;
                vm.otherCoord = otherCoord;
                vm.datas = datas;

                vm.color = ['#36F7E7',
                    '#30FD85',
                    '#B1FB32',
                    '#FBD632',
                    '#FD7630',
                    '#FA61D2',
                    '#9F77E4',
                    '#DFDAAA',
                    '#CDECEF',
                    '#8BA6E4',
                    '#79F6DB',
                    '#CC9999',
                    '#CC6699',
                    '#CC3399',
                    '#CC0099',
                    '#996699',
                    '#669999',
                    '#339999',
                    '#006699',
                    '#0033CC'
                ];
                vm.series = [];
                vm.curveness = 0.1;//线的偏移量

                vm.pool_sourceAngle = vm.geoCoord.length === 1 ? 0 : 360 / (vm.geoCoord.length);
                vm.geoCoordMap = {};
                if (vm.geoCoord.length === 1) {
                    vm.geoCoordMap[vm.geoCoord[0].poolName] = [0, 5.25];
                } else if (vm.geoCoord.length === 2) {
                    vm.geoCoordMap[vm.geoCoord[0].poolName] = [0, 5.25];
                    vm.geoCoordMap[vm.geoCoord[1].poolName] = [20.5, 5.25];
                } else {
                    vm.geoCoord.forEach(function (node, index) {
                        var radian = (index * vm.pool_sourceAngle) * 2 * Math.PI / 360;
                        var x = 10.5 + 11.5 * Math.cos(radian);
                        var y = 5 + 3.5 * Math.sin(radian);
                        vm.geoCoordMap[node.poolName] = [x, y];
                    });
                }
                if (vm.otherCoord.length > 0) {
                    vm.geoCoordMap[vm.otherCoord[0].poolName] = [26, 9];
                }
                vm.legendData = [];
                //lines
                vm.datas.forEach(function (item, i) {
                    var legendName = item.protocolName;//(item.protocolName==='modbus'?'Modbus-TCP':item.protocolName);
                    //vm.legendData.push({"name": legendName});
                    vm.legendData.push({name: legendName});
                    vm.series.push(
                        {
                            name: legendName,
                            type: 'lines',
                            zlevel: 2,
                            effect: {
                                show: true,
                                period: 10,
                                trailLength: 0,
                                symbol: 'arrow',
                                symbolSize: 6
                            },
                            lineStyle: {
                                normal: {
                                    color: vm.color[i],
                                    opacity: 0.4,
                                    curveness: vm.curveness
                                }
                            },
                            data: vm.convertData(item, average, vm.color[i])
                        }
                    );
                    vm.curveness = vm.curveness + 0.05;
                });
                //effectScatter
                var secArea = 'NA';
                var secColor = 0;
                var oneSecArea = [];
                vm.geoCoord.forEach(function (node, index) {
                    if (secArea === 'NA') {
                        secArea = node.SecAreaName;
                        oneSecArea.push(node);
                    } else if (secArea !== node.SecAreaName) {
                        pushEffectScatter(oneSecArea, vm.color[secColor]);
                        oneSecArea = [];
                        oneSecArea.push(node);
                        secColor = secColor + 1;
                    } else {
                        oneSecArea.push(node);
                    }
                    if (index + 1 === vm.geoCoord.length) {
                        pushEffectScatter(oneSecArea, vm.color[secColor]);
                    }

                });
                function pushEffectScatter(data, color) {
                    vm.series.push({
                        name: '地址池',
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            scale: 2,
                            brushType: 'stroke'
                        },
                        symbol: 'image://images/network.png',
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: function (params) {
                                    return params.data.topLable;
                                }
                            }
                        },
                        symbolSize: 45,
                        itemStyle: {
                            normal: {
                                color: color
                            }
                        },
                        showEffectOn: 'emphasis',
                        data: data.map(function (dataItem) {
                            return {
                                name: dataItem.poolName,
                                value: vm.geoCoordMap[dataItem.poolName].concat(10),
                                lineValue: dataItem.ipRange,
                                topLable: '安全区域：'+dataItem.SecAreaName +'\n 地址池：' + dataItem.poolName,
                                poolId: dataItem.poolId,
                                type: 'pool'
                            };
                        })
                    });
                }

                //地址池外地址
                if (vm.otherCoord.length > 0) {
                    vm.series.push({
                        name: vm.otherCoord[0].poolName,
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            scale: 2,
                            brushType: 'stroke'
                        },
                        symbol: 'image://images/network1.png',
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        symbolSize: 50,
                        itemStyle: {
                            normal: {
                                color: '#DDDD00'
                            }
                        },
                        showEffectOn: 'emphasis',
                        data: vm.otherCoord.map(function (dataItem) {
                            return {
                                name: dataItem.poolName,
                                value: vm.geoCoordMap[dataItem.poolName].concat(10),
                                lineValue: "",
                                type: 'pool'
                            };
                        })
                    });
                }

                vm.option = {
                    backgroundColor: '#2a2d36',
                    animationDurationUpdate: 1500,
                    animationEasingUpdate: 'quinticInOut',
                    title: {
                        text: '地址池协议总览图',
                        subtext: '',
                        left: 'center',
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: function (params) {
                            if (params.data.lineValue === "") {
                                return params.name;
                            } else {
                                return params.data.lineValue;
                            }
                        }
                    },
                    geo: {
                        map: 'defaultMap',
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: '#2a2d36',
                                borderColor: '#2a2d36'
                            },
                            emphasis: {
                                areaColor: '#2a2d36'
                            }
                        }
                    },
                    toolbox: {
                        itemGap: 20,
                        itemSize: 20,
                        left: 30,
                        iconStyle: {
                            normal: {
                                color: '#ccc'
                            },
                            emphasis: {
                                color: '#fff',
                                borderColor: '#DDDDDD'
                            }
                        },
                        feature: {
                            saveAsImage: {
                                show: false,
                                type: 'png',
                                name: '会话协议图',
                                title: '保存为图片',
                                icon: 'path://M11.5 7l-4 4-4-4h2.5v-6h3v6zM7.5 11h-7.5v4h15v-4h-7.5zM14 13h-2v-1h2v1z'
                            },
                            restore: {
                                show: false,
                                icon: 'path://M376.35,112.755l16.879-84.86c1.842-9.259-2.076-18.717-9.925-23.961 c-7.85-5.246-18.087-5.246-25.937,0L243.036,80.328c-0.008,0.005-0.016,0.011-0.023,0.017c-0.528,0.355-1.032,0.741-1.528,1.134 c-0.101,0.081-0.213,0.151-0.313,0.233c-0.584,0.481-1.142,0.988-1.676,1.522c-0.163,0.163-0.307,0.345-0.467,0.514	c-0.359,0.383-0.724,0.762-1.058,1.169c-0.132,0.162-0.247,0.338-0.377,0.504c-0.339,0.434-0.677,0.868-0.983,1.327	c-0.078,0.115-0.14,0.24-0.216,0.356c-0.338,0.523-0.666,1.053-0.963,1.604c-0.033,0.064-0.058,0.129-0.092,0.193	c-0.322,0.612-0.622,1.234-0.89,1.877c-0.012,0.031-0.022,0.065-0.034,0.096c-0.275,0.671-0.524,1.355-0.738,2.057	c-0.02,0.064-0.033,0.129-0.05,0.195c-0.196,0.666-0.372,1.338-0.509,2.028c-0.003,0.011-0.006,0.02-0.008,0.031	c-0.042,0.213-0.059,0.429-0.096,0.644c-0.089,0.528-0.182,1.055-0.235,1.595c-0.068,0.685-0.096,1.371-0.104,2.056	c0,0.087-0.012,0.171-0.012,0.26c0,0.003,0,0.005,0,0.006c0,0.778,0.039,1.555,0.118,2.326c0.045,0.478,0.134,0.943,0.21,1.411	c0.045,0.28,0.073,0.563,0.128,0.843c0.121,0.604,0.28,1.192,0.445,1.777c0.039,0.142,0.067,0.286,0.109,0.426	c0.188,0.619,0.412,1.225,0.65,1.821c0.042,0.107,0.075,0.219,0.12,0.327c0.251,0.605,0.535,1.192,0.834,1.769	c0.051,0.1,0.093,0.204,0.146,0.302c0.321,0.598,0.674,1.175,1.041,1.74c0.048,0.072,0.086,0.148,0.132,0.219l0.02,0.03	c0.022,0.031,0.04,0.062,0.062,0.092l76.313,114.21c4.384,6.562,11.708,10.374,19.405,10.374c1.511,0,3.038-0.148,4.558-0.45	c9.259-1.842,16.498-9.08,18.339-18.34l10.974-55.171c37.191,31.415,60.857,78.365,60.857,130.748	c0,94.356-76.764,171.121-171.12,171.121c-94.357,0-171.123-76.765-171.123-171.121c0-62.522,34.094-120.058,88.976-150.156	c11.305-6.198,15.443-20.386,9.243-31.688c-6.198-11.303-20.382-15.441-31.69-9.243C81.579,141.408,38.199,214.628,38.199,294.201	c0,120.097,97.707,217.804,217.806,217.804c120.097,0,217.802-97.707,217.802-217.804	C473.807,218.561,435.044,151.816,376.35,112.755z'
                            }
                        }
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        top: 'bottom',
                        textStyle: {
                            color: '#fff'
                        },
                        data: vm.legendData
                    },
                    series: vm.series
                };
            };
            //构建资产协议关系图
            vm.pool_convertData = function (iteam, geoCoordMap) {
                var data = iteam.data;
                var res = [];
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];
                    var fromCoord = geoCoordMap[dataItem.srcIp];
                    var toCoord = geoCoordMap[dataItem.dstIp];
                    if (fromCoord && toCoord) {
                        res.push({
                            fromName: dataItem.srcIp,
                            toName: dataItem.dstIp,
                            coords: [fromCoord, toCoord],
                            lineValue: dataItem.srcIp + '->' + dataItem.dstIp + ':' + iteam.protocolName,
                            type: 'asset',
                            protocolType: iteam.protocolName
                        });
                    }
                }
                return res;
            };
            vm.showAssetProtocol_pool = function (poolName, poolId) {
                var legendData = [];
                var series = [];
                var geoasset = [];
                var otherasset = [];
                var linesData = [];
                var geoassetName = [];
                var otherassetName = [];
                var curveness = 0.1;
                ProtocolModel.getPoolDetails(poolId, vm.sTime, vm.eTime).then(function (subData) {
                    geoasset = subData[0];
                    otherasset = subData[1];
                    linesData = subData[2];
                    geoassetName = subData[3];
                    otherassetName = subData[4];
                    var geoCoordMap = {};
                    var rx = 12.5, lx = 12.5;
                    var y = 5;
                    geoasset.forEach(function (node, index) {
                        var l = 3;
                        if (index === 0 || index === 1) {
                            l = 1.5;
                        }
                        if (index % 2 === 0) {
                            rx = rx - l;
                            geoCoordMap[node] = [rx, y];
                        } else {
                            lx = lx + l;
                            geoCoordMap[node] = [lx, y];
                        }
                    });
                    var orx = 10.5, olx = 10.5;
                    var oy = 9;
                    otherasset.forEach(function (node, index) {
                        if (index % 2 === 0) {
                            oy = 9;
                            if ((index / 2) % 2 === 0) {
                                if (index === 0) {
                                    orx = orx + 1.5;
                                    geoCoordMap[node] = [orx, oy];
                                } else if (index === 4) {
                                    olx = olx - 1.5;
                                    geoCoordMap[node] = [olx, oy];
                                } else {
                                    olx = olx - 3;
                                    geoCoordMap[node] = [olx, oy];
                                }
                            } else {
                                orx = orx + 3;
                                geoCoordMap[node] = [orx, oy];
                            }
                        } else {
                            oy = 1;
                            if (index === 1) {
                                geoCoordMap[node] = [orx, oy];
                            } else {
                                if (((index - 1) / 2) % 2 === 1) {
                                    geoCoordMap[node] = [orx, oy];
                                } else {
                                    geoCoordMap[node] = [olx, oy];
                                }
                            }
                        }
                    });
                    var allAsset = geoasset.concat(otherasset);
                    var allAssetName = geoassetName.concat(otherassetName);
                    var allAssetAndName = [];
                    allAsset.forEach(function (node, index) {
                        allAssetAndName.push({"assetIp":node,"assetName":allAssetName[index]});
                    });
                    series.push({
                        name: '设备',
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        rippleEffect: {
                            scale: 0,
                            brushType: 'stroke'
                        },
                        symbol: 'image:///images/pc-2.png',
                        label: {
                            normal: {
                                show: true,
                                position: 'top',
                                formatter: function (params) {
                                    return params.data.labelText;
                                },
                                textStyle: {
                                    color: '#fff'
                                }
                            }
                        },
                        symbolSize: 30,
                        showEffectOn: 'emphasis',
                        data: allAssetAndName.map(function (dataItem) {
                            return {
                                name: dataItem.assetIp,
                                value: geoCoordMap[dataItem.assetIp].concat(10),
                                lineValue: "",
                                type: 'asset',
                                labelText:dataItem.assetName+":("+dataItem.assetIp+")"
                            };
                        })
                    });
                    //线
                    linesData.forEach(function (item, i) {
                        legendData.push({name: item.protocolName});
                        series.push(
                            {
                                name: item.protocolName,
                                type: 'lines',
                                zlevel: 1000,
                                effect: {
                                    show: true,
                                    period: 10,
                                    trailLength: 0,
                                    symbol: 'arrow',
                                    symbolSize: 6
                                },
                                lineStyle: {
                                    normal: {
                                        color: vm.color[i],
                                        opacity: 0.4,
                                        curveness: curveness
                                    }
                                },
                                data: vm.pool_convertData(item, geoCoordMap)
                            }
                        );
                        curveness = curveness + 0.05;
                    });
                }).then(function () {
                    var assetOption = {
                        backgroundColor: '#2a2d36',
                        animationDurationUpdate: 1500,
                        animationEasingUpdate: 'quinticInOut',
                        title: {
                            text: poolName + ' 资产设备协议图',
                            subtext: '',
                            left: 'center',
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                if (params.data.lineValue === "") {
                                    return params.name;
                                } else {
                                    return params.data.lineValue;
                                }
                            }
                        },
                        toolbox: {
                            itemGap: 30,
                            itemSize: 20,
                            left: 30,
                            iconStyle: {
                                normal: {
                                    color: '#ccc'
                                },
                                emphasis: {
                                    color: '#fff',
                                    borderColor: '#DDDDDD'
                                }
                            },
                            feature: {
                                saveAsImage: {
                                    type: 'png',
                                    show: false,
                                    name: poolName + ' 资产设备协议图',
                                    title: '保存为图片',
                                    icon: 'path://M11.5 7l-4 4-4-4h2.5v-6h3v6zM7.5 11h-7.5v4h15v-4h-7.5zM14 13h-2v-1h2v1z'
                                },
                                restore: {
                                    icon: 'path://M376.35,112.755l16.879-84.86c1.842-9.259-2.076-18.717-9.925-23.961 c-7.85-5.246-18.087-5.246-25.937,0L243.036,80.328c-0.008,0.005-0.016,0.011-0.023,0.017c-0.528,0.355-1.032,0.741-1.528,1.134 c-0.101,0.081-0.213,0.151-0.313,0.233c-0.584,0.481-1.142,0.988-1.676,1.522c-0.163,0.163-0.307,0.345-0.467,0.514	c-0.359,0.383-0.724,0.762-1.058,1.169c-0.132,0.162-0.247,0.338-0.377,0.504c-0.339,0.434-0.677,0.868-0.983,1.327	c-0.078,0.115-0.14,0.24-0.216,0.356c-0.338,0.523-0.666,1.053-0.963,1.604c-0.033,0.064-0.058,0.129-0.092,0.193	c-0.322,0.612-0.622,1.234-0.89,1.877c-0.012,0.031-0.022,0.065-0.034,0.096c-0.275,0.671-0.524,1.355-0.738,2.057	c-0.02,0.064-0.033,0.129-0.05,0.195c-0.196,0.666-0.372,1.338-0.509,2.028c-0.003,0.011-0.006,0.02-0.008,0.031	c-0.042,0.213-0.059,0.429-0.096,0.644c-0.089,0.528-0.182,1.055-0.235,1.595c-0.068,0.685-0.096,1.371-0.104,2.056	c0,0.087-0.012,0.171-0.012,0.26c0,0.003,0,0.005,0,0.006c0,0.778,0.039,1.555,0.118,2.326c0.045,0.478,0.134,0.943,0.21,1.411	c0.045,0.28,0.073,0.563,0.128,0.843c0.121,0.604,0.28,1.192,0.445,1.777c0.039,0.142,0.067,0.286,0.109,0.426	c0.188,0.619,0.412,1.225,0.65,1.821c0.042,0.107,0.075,0.219,0.12,0.327c0.251,0.605,0.535,1.192,0.834,1.769	c0.051,0.1,0.093,0.204,0.146,0.302c0.321,0.598,0.674,1.175,1.041,1.74c0.048,0.072,0.086,0.148,0.132,0.219l0.02,0.03	c0.022,0.031,0.04,0.062,0.062,0.092l76.313,114.21c4.384,6.562,11.708,10.374,19.405,10.374c1.511,0,3.038-0.148,4.558-0.45	c9.259-1.842,16.498-9.08,18.339-18.34l10.974-55.171c37.191,31.415,60.857,78.365,60.857,130.748	c0,94.356-76.764,171.121-171.12,171.121c-94.357,0-171.123-76.765-171.123-171.121c0-62.522,34.094-120.058,88.976-150.156	c11.305-6.198,15.443-20.386,9.243-31.688c-6.198-11.303-20.382-15.441-31.69-9.243C81.579,141.408,38.199,214.628,38.199,294.201	c0,120.097,97.707,217.804,217.806,217.804c120.097,0,217.802-97.707,217.802-217.804	C473.807,218.561,435.044,151.816,376.35,112.755z',
                                    show: false,
                                }
                            }
                        },
                        geo: {
                            map: 'defaultMap',
                            label: {
                                emphasis: {
                                    show: false
                                }
                            },
                            roam: true,
                            itemStyle: {
                                normal: {
                                    areaColor: '#2a2d36',
                                    borderColor: '#2a2d36'
                                },
                                emphasis: {
                                    areaColor: '#2a2d36'
                                }
                            }
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'left',
                            top: 'bottom',
                            textStyle: {
                                color: '#fff'
                            },
                            data: legendData
                        },
                        series: series
                    };
                    sessionPoolOverviw.setOption(assetOption);
                });
            };


            vm.showAssetProtocol_line = function (poolName, fromName, toName, srcPoolId, dstPoolId, col) {
                ProtocolModel.getLineDetails(poolName, srcPoolId, dstPoolId, vm.sTime, vm.eTime).then(function (subData) {
                    var assetXY = [];
                    var asset_sourceAngle = subData[0].length === 1 ? 0 : 360 / (subData[0].length);
                    var centerX = sessionPoolOverviw.getWidth() / 4;
                    var centerY = sessionPoolOverviw.getHeight() / 4;
                    var radius = Math.min(centerX, centerY);
                    subData[0].forEach(function (node, index) {
                        var radian = (index * asset_sourceAngle) * 2 * Math.PI / 360;
                        var x = centerX + radius * Math.cos(radian);
                        var y = centerY + radius * Math.sin(radian);
                        var xy = {
                            name: node, x: x, y: y, symbol: 'image:///images/pc-2.png', symbolSize: 30, label: {
                                normal: {
                                    position: 'bottom',
                                    show: true,
                                    formatter:function(){
                                        return subData[3][index]+":("+node+")";
                                    },
                                    textStyle: {
                                        color: '#fff'
                                    }
                                }
                            }
                        };
                        assetXY.push(xy);
                    });
                    var asset_destinationsAngle = subData[1].length === 1 ? 0 : 360 / (subData[1].length);
                    subData[1].forEach(function (node, index) {
                        var radian = (index * asset_destinationsAngle) * 2 * Math.PI / 360;
                        var x = (centerX * 3) + radius * Math.cos(radian);
                        var y = (centerY) + radius * Math.sin(radian);
                        var xy = {
                            name: node, x: x, y: y, symbol: 'image:///images/pc-2.png', symbolSize: 30, label: {
                                normal: {
                                    position: 'bottom',
                                    show: true,
                                    formatter:function(){
                                        return subData[4][index]+":("+node+")";
                                    },
                                    textStyle: {
                                        color: '#fff'
                                    }
                                }
                            }
                        };
                        assetXY.push(xy);
                    });
                    assetXY.push({
                        name: fromName,
                        x: centerX,
                        y: centerY,
                        symbol: 'image:///images/center.png',
                        symbolSize: 1,
                        label: {
                            normal: {
                                position: 'bottom',
                                show: true,
                                textStyle: {
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    color: '#fff'
                                }
                            }
                        }
                    });
                    assetXY.push({
                        name: toName,
                        x: centerX * 3,
                        y: centerY,
                        symbol: 'image:///images/center.png',
                        symbolSize: 1,
                        label: {
                            normal: {
                                position: 'bottom',
                                show: true,
                                textStyle: {
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    color: '#fff'
                                }
                            }
                        }
                    });
                    var assetSeries = [];
                    subData[2].forEach(function (node1) {
                        var assetLinks = [];
                        node1.data.forEach(function (link) {
                            var oneLink = {
                                source: link.srcIp,
                                target: link.dstIp,
                                symbolSize: [2, 10],
                                protocolName: node1.protocolName,
                                label: {
                                    normal: {
                                        show: true,
                                        formatter: function (par) {
                                            return par.name + ':' + node1.protocolName;
                                        }
                                    }
                                },
                                lineStyle: {
                                    normal: {
                                        width: 2,
                                        curveness: 0.2
                                    }
                                }
                            };
                            assetLinks.push(oneLink);
                        });
                        assetSeries.push({
                            name: node1.protocolName,
                            type: 'graph',
                            layout: 'none',
                            roam: true,
                            hoverAnimation: false,
                            //两端标记
                            edgeSymbol: ['circle', 'arrow'],
                            edgeSymbolSize: [10, 10],
                            edgeLabel: {
                                normal: {
                                    textStyle: {
                                        fontSize: 10,
                                        color: col
                                    }
                                }
                            },
                            data: assetXY,
                            links: assetLinks,
                            lineStyle: {
                                normal: {
                                    opacity: 0.9,
                                    width: 1,
                                    color: col
                                }
                            }
                        });
                    });
                    var assetOption = {
                        backgroundColor: '#2a2d36',
                        animationDurationUpdate: 1500,
                        animationEasingUpdate: 'circularInOut',
                        title: {
                            text: fromName + '<>' + toName + '（' + poolName + '） 协议图',
                            subtext: '',
                            left: 'center',
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                if (params.name) {
                                    return params.name;
                                }
                            }
                        },
                        toolbox: {
                            itemGap: 30,
                            itemSize: 20,
                            left: 30,
                            iconStyle: {
                                normal: {
                                    color: '#ccc'
                                },
                                emphasis: {
                                    color: '#fff',
                                    borderColor: '#DDDDDD'
                                }
                            },
                            feature: {
                                saveAsImage: {
                                    type: 'png',
                                    show: false,
                                    name: fromName + '<>' + toName + '（' + poolName + '） 协议图',
                                    title: '保存为图片',
                                    icon: 'path://M11.5 7l-4 4-4-4h2.5v-6h3v6zM7.5 11h-7.5v4h15v-4h-7.5zM14 13h-2v-1h2v1z'
                                },
                                restore: {
                                    icon: 'path://M376.35,112.755l16.879-84.86c1.842-9.259-2.076-18.717-9.925-23.961 c-7.85-5.246-18.087-5.246-25.937,0L243.036,80.328c-0.008,0.005-0.016,0.011-0.023,0.017c-0.528,0.355-1.032,0.741-1.528,1.134 c-0.101,0.081-0.213,0.151-0.313,0.233c-0.584,0.481-1.142,0.988-1.676,1.522c-0.163,0.163-0.307,0.345-0.467,0.514	c-0.359,0.383-0.724,0.762-1.058,1.169c-0.132,0.162-0.247,0.338-0.377,0.504c-0.339,0.434-0.677,0.868-0.983,1.327	c-0.078,0.115-0.14,0.24-0.216,0.356c-0.338,0.523-0.666,1.053-0.963,1.604c-0.033,0.064-0.058,0.129-0.092,0.193	c-0.322,0.612-0.622,1.234-0.89,1.877c-0.012,0.031-0.022,0.065-0.034,0.096c-0.275,0.671-0.524,1.355-0.738,2.057	c-0.02,0.064-0.033,0.129-0.05,0.195c-0.196,0.666-0.372,1.338-0.509,2.028c-0.003,0.011-0.006,0.02-0.008,0.031	c-0.042,0.213-0.059,0.429-0.096,0.644c-0.089,0.528-0.182,1.055-0.235,1.595c-0.068,0.685-0.096,1.371-0.104,2.056	c0,0.087-0.012,0.171-0.012,0.26c0,0.003,0,0.005,0,0.006c0,0.778,0.039,1.555,0.118,2.326c0.045,0.478,0.134,0.943,0.21,1.411	c0.045,0.28,0.073,0.563,0.128,0.843c0.121,0.604,0.28,1.192,0.445,1.777c0.039,0.142,0.067,0.286,0.109,0.426	c0.188,0.619,0.412,1.225,0.65,1.821c0.042,0.107,0.075,0.219,0.12,0.327c0.251,0.605,0.535,1.192,0.834,1.769	c0.051,0.1,0.093,0.204,0.146,0.302c0.321,0.598,0.674,1.175,1.041,1.74c0.048,0.072,0.086,0.148,0.132,0.219l0.02,0.03	c0.022,0.031,0.04,0.062,0.062,0.092l76.313,114.21c4.384,6.562,11.708,10.374,19.405,10.374c1.511,0,3.038-0.148,4.558-0.45	c9.259-1.842,16.498-9.08,18.339-18.34l10.974-55.171c37.191,31.415,60.857,78.365,60.857,130.748	c0,94.356-76.764,171.121-171.12,171.121c-94.357,0-171.123-76.765-171.123-171.121c0-62.522,34.094-120.058,88.976-150.156	c11.305-6.198,15.443-20.386,9.243-31.688c-6.198-11.303-20.382-15.441-31.69-9.243C81.579,141.408,38.199,214.628,38.199,294.201	c0,120.097,97.707,217.804,217.806,217.804c120.097,0,217.802-97.707,217.802-217.804	C473.807,218.561,435.044,151.816,376.35,112.755z',
                                    // show: false,
                                }
                            }
                        },
                        series: assetSeries
                    };
                    sessionPoolOverviw.setOption(assetOption);
                });
            };
        }
    }
})();
