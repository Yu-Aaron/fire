/**
 * Created by tuhuijie on 16-11-08.
 */
/**
 * Session Controller
 */
(function () {
    'use strict';

    angular.module('southWest.session.state')
        .controller('SessionStateCtrl', SessionStateCtrl);

    function SessionStateCtrl($scope, $rootScope) {
        var vm = this;

        vm.sessionsState = [];
        var sessionGraph;
        vm.initSessionState = function () {
            $scope.sessionStateLoaded = function (sessionStates) {
                vm.sessionsState = sessionStates;
                vm.loadSessionState(sessionStates);
            };

            //  create session Graph
            var option = {
                tooltip: {
                    formatter:function (params) {
                        if (params.dataType === 'edge') {
                            return params.data.source + '-->' + params.data.target + ': ' + params.data.services.join(', ');
                        }
                        return params.name;
                    }
                },
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                series: [
                    {
                        type: 'graph',
                        layout: 'none',
                        symbolSize: 50,
                        label: {
                            normal: {
                                show: true,
                                position: 'bottom',
                                textStyle: {color: '#FFFFFF', fontWeight: 'bold'}
                            }
                        },
                        edgeSymbol: ['circle', 'arrow'],
                        edgeSymbolSize: [2, 10],
                        edgeLabel: {
                            normal: {
                                show: true,
                                textStyle: {
                                    fontSize: 11
                                }
                            },
                            emphasis: {
                                textStyle: {fontSize: 14, fontWeight: 'bold'}
                            }
                        },
                    }
                ]
            };

            sessionGraph = echarts.init(document.getElementById("session_graph"));
            sessionGraph.setOption(option);

            sessionGraph.on('click', function (params) {
                if (params && params.dataType === 'node') {
                    //  click current node to return circular mode; click other mode to view the other session.
                    var sessions = [];
                    if (vm.sessionName === params.data.name) {
                        sessions = vm.sessionsState;
                    } else {
                        sessions = vm.sessionsState.filter(function (session) {
                            return params.data.name === session.sourceName || params.data.name === session.targetName;
                        });
                    }
                    if (sessions.length > 0) {
                        vm.loadSessionState(sessions, params.data.name);
                    }
                }
            });
        };

        vm.loadSessionState = function (sessions,sessionName) {
            var option = sessionGraph.getOption();
            if(!sessions || sessions.length === 0){
                //  binding data and links.
                if(option && option !== null){
                    option.series[0].data = [];
                    option.series[0].links = [];
                    sessionGraph.setOption(option);
                }
                return;
            }
            sessionName = sessionName || '';
            //  if has more than one source and more than on target,use 'circular' layout mode,otherwise use 'none';
            sessions = sessions || [];
            var sources = new Dictionary(), targets = new Dictionary();
            sessions.forEach(function (session) {
                if (!sources.contains(session.sourceName)) {
                    sources.put(session.sourceName, session);
                }
                if (!targets.contains(session.targetName)) {
                    targets.put(session.targetName, session);
                }
            });
            var centerNodeMode = sources.length() <= 1 || targets.length() <= 1;
            var layout = centerNodeMode ? 'none' : 'circular';
            //var option = sessionGraph.getOption();
            if (option && option !== null && sessions) {
                var series = option.series[0];
                series.layout = layout;

                var centerX = sessionGraph.getWidth() / 2;
                var centerY = sessionGraph.getHeight() / 2;
                var radius = Math.min(centerX, centerY);

                var addNode = function (session, radian, source, r) {
                    r = r === undefined ? radius : r;
                    var x = centerX + r * Math.cos(radian);
                    var y = centerY + r * Math.sin(radian);
                    {
                        if (source) {
                            if (names.indexOf(session.sourceName) < 0) {
                                data.push({
                                    name: session.sourceName, x: x, y: y,
                                    symbol: getIconSymbolPath(session.sourceType)
                                });
                                names.push(session.sourceName);
                                return true;
                            }
                        } else {
                            if (names.indexOf(session.targetName) < 0) {
                                data.push({
                                    name: session.targetName, x: x, y: y,
                                    symbol: getIconSymbolPath(session.targetType)
                                });
                                names.push(session.targetName);
                                return true;
                            }
                        }
                    }
                    return false;
                };

                var addLink = function (session, isFromCenterNode) {
                    var exist = links.filter(function (link) {
                        return link.source === session.sourceName && link.target === session.targetName;
                    });
                    if (exist.length < 1) {
                        links.push({
                            source: session.sourceName,
                            target: session.targetName,
                            services: [session.sessionProtocol],
                            lineStyle: {
                                normal: {
                                    opacity: 0.9,
                                    type: 'dotted',
                                    color: isFromCenterNode ? '#aa474f' : '#21aa28',
                                    width: 1
                                }
                            },
                            label: {
                                normal: {
                                    formatter: function (params) {
                                        return params.data.services.join(', ');
                                    }
                                },
                                emphasis: {
                                    formatter: function (params) {
                                        return params.data.services.join(', ');
                                    }
                                }
                            }
                        });
                    } else {
                        exist.forEach(function (link) {
                            if (link.services.indexOf(session.sessionProtocol) < 0) {
                                link.services.push(session.sessionProtocol);
                            }
                        });
                    }
                };

                var data = [], links = [], names = [];
                if (centerNodeMode) {
                    var fromSource = sources.length() === 1;
                    var centerNode = fromSource ? sources.getAt(0) : targets.getAt(0);
                    fromSource && sources.remove(centerNode.sourceName);
                    !fromSource && targets.remove(centerNode.targetName);
                    //  add center node
                    addNode(centerNode, 0, fromSource, 0);
                    addLink(centerNode, fromSource);
                    //  add source nodes
                    var sourceAngle = sources.length() <= 1 ? 0 : 180 / (sources.length() - 1);
                    sources.forEach(function (session, index) {
                        var radian = (270 - index * sourceAngle) * 2 * Math.PI / 360;
                        addNode(session, radian, true);
                        addLink(session, session.sourceName === centerNode.sourceName);
                    });
                    //  add target nodes
                    var targetAngle = targets.length() === 1 ? 90 : 180 / (targets.length() - 1 + 2);// skip top and bottom.
                    targets.forEach(function (session, index) {
                        var radian = (-90 + (index + 1) * targetAngle) * 2 * Math.PI / 360;
                        addNode(session, radian, false);
                        addLink(session, session.sourceName === centerNode.sourceName);
                    });
                } else {
                    var angle = sessions.length <= 1 ? 0 : 360 / sources.intersect(targets).length();
                    var index = 0;
                    sessions.forEach(function (session) {
                        var radian = index * angle * Math.PI / 360;
                        if (addNode(session, radian, true)) {
                            index++;
                        }    //  source
                        if (addNode(session, radian, false)) {
                            index++;
                        }    //  target
                        addLink(session);
                    });
                }

                vm.sessionName = sessionName;
                //  binding data and links.
                series.data = data;
                series.links = links;
                sessionGraph.setOption(option);
            }
        };

        function getIconSymbolPath(deviceType) {
            var path = 'image://' + '/images/' + deviceType + '.png';
            if($rootScope.revManifest) {
                _.keys($rootScope.revManifest).some(function (key) {
                    if(path.indexOf(key) > 0) {
                        path = path.replace(key, $rootScope.revManifest[key]);
                        return true;
                    }
                });
            }
            return path;
        }
    }

    function Dictionary() {
        var keys = [];

        this.length = function length() {
            return keys.length;
        };

        this.contains = function (key) {
            return keys.indexOf(key) > -1;
        };

        this.put = function (key, value) {
            if (!this.contains(key)) {
                keys.push(key);
            }
            this[key] = value;
        };

        this.remove = function (key) {
            var index = keys.indexOf(key);
            if (index >= 0) {
                keys.splice(index, 1);
                delete this[key];
            }
        };

        this.getAt = function (index) {
            if (index >= 0 && index < keys.length) {
                var key = keys[index];
                return this[key];
            }
        };

        this.forEachKey = function (callback) {
            keys.forEach(function (key, index) {
                callback(key, index);
            });
        };

        this.forEach = function (callback) {
            var host = this;
            keys.forEach(function (key, index) {
                if (host.contains(key)) {
                    callback(host[key], index);
                }
            });
        };

        this.intersect = function (target) {
            if (target instanceof Dictionary) {
                var result = new Dictionary();
                this.forEachKey(function (key) {
                    if (!result.contains(key)) {
                        result.put(key, target[key]);
                    }
                });
                target.forEachKey(function (key) {
                    if (!result.contains(key)) {
                        result.put(key, target[key]);
                    }
                });
                return result;
            }
        };
    }
})();
