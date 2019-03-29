/**
 * Monitor Event Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.incident')
        .directive('incidentTable', ['$modal', 'Incident', '$log', 'FileUploader', 'URI',  'topologyId', '$rootScope', '$state', '$timeout','$q',incidentTable])
        .directive('timeline', ['$timeout', '$window', '$modal', '$compile', 'Incident', 'mOverview',timeline])
        .directive('delayRemoveClass', ['$timeout',delayRemoveClass])
        .directive('timelineIncidentTable', ['$q', 'Incident',timelineIncidentTable]);

    function incidentTable($modal, Incident, $log, FileUploader, URI,  topologyId, $rootScope, $state, $timeout, $q) {
        var incidentTableObj = {
            scope: false,
            restrict: 'E',
            require: '^?dtable',
            replace: true,
            templateUrl: '/templates/monitor/incident/incidentTable.html',
            link: link
        };

        return incidentTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var selectArr = [];
            scope.checkToSelect = false;


            scope.markAllRead = function () {
                confirmation($modal, Incident, 'read', scope, $rootScope);
            };

            scope.markAllDeleted = function () {
                confirmation($modal, Incident, 'delete', scope, $rootScope, $q.defer());
            };

            if (ctrl) {
                var fields = ['sourceIp', 'destinationIp','sourcePort', 'destinationPort', 'matchedKey','enumString'];
                ctrl.setConfig({
                    name: 'incident',
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    fields: fields,
                    predicate: 'incidentId',
                    reverse: true,
//                    dateTimeRange: 'timestamp',
                    advancedSearch: 'incidents',
                    advancedSearchOptions: [
                    {'name': 'timestamp', 'display': '时间', 'input': 'timerange', 'option': true, value: [],  'options': []},
                    {'name': 'level', 'display': '事件等级', 'input': 'checkbox', 'option': true, value: '-1', 'options': [{'value': '-1', 'text': '全部'},{'value': 'WARN', 'text': '警告'},{'value': 'DROP', 'text': '丢弃'},{'value': 'REJECTBOTH', 'text': '阻断'}]},
                    {'name': 'sourceIp', 'display': '起源IP地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'destinationIp', 'display': '目标IP地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'sourcePort', 'display': '起源端口', 'input': 'string', 'option': false, value: ""},
                    {'name': 'destinationPort', 'display': '目标端口', 'input': 'string', 'option': false, value: ""},
                    {'name': 'matchedKey', 'display': '规则', 'input': 'string', 'option': false, value: ""}
                    ]
                });
            } else {
                var dtable = scope.dtable = {};
                Incident.getAll().then(function (data) {
                    dtable.table = data;
                });
            }

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'incidentId desc';
                }
                scope.params = params;
                return Incident.getIncidents(params).then(function (data) {

                    if (selectArr.length === 0) {
                        return data;
                    }
                    var copyArr = selectArr.slice();

                    return data.map(function (inc) {
                        for (var i = 0; i < copyArr.length; i++) {
                            if (copyArr[i] === inc.incidentId) {
                                inc.checkbox = true;
                                copyArr.splice(i, 1);
                                return inc;
                            }
                        }
                        return inc;
                    });
                });
            }

            function getCount(params) {
              return Incident.getIncidentCount(params);
            }

            function search(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'incidentId desc';
                }
                scope.params = params;
                return Incident.getIncidents(params);
            }

            scope.openImportPanel = function (extension) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve:{
                      extension: function(){
                        return extension;
                      }
                    }
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, extension) {
                    $scope.extension = extension;
                    $scope.addPsw = '1';
                    $scope.uploader = new FileUploader({
                        url: URI + '/incidents/topology/' + topologyId.id + '/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    $scope.uploader.onErrorItem = function(item, response) {
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入安全事件失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function() {
                        $timeout(function(){$state.reload();}, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入安全事件成功！'
                        });
                    };

                    $scope.upload = function () {
                        $modalInstance.close();
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
            scope.openExportPanel = function (flag) {
                var p = flag?scope.params:{};
                p.$limit = 100000;
                p.$skip = 0;
                if (!p.$orderby || p.$orderby === '') {
                  p.$orderby = 'incidentId desc';
                }
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ['$scope', '$modalInstance',ModalInstanceCtrl],
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        var regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*(_|[^\w])).+$/g;
                        return psw && psw.match(regex) && psw.length >= 8 && psw.length < 25;
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        Incident.getAllExport(p, psw).then(function (data) {
                            window.open('./' + data, '_self');
                        }, function () {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '导出数据失败，请稍后重试'
                            });
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }
    }




    function confirmation($modal, Incident, type, scope,$rootScope,deferred) {
        var modalInstance = $modal.open({
            size: 'sm',
            templateUrl: 'templates/monitor/incident/confirmation.html',
            controller:[ '$scope', '$modalInstance',function ($scope, $modalInstance) {
                $scope.content = type === 'delete' ? '清除所有事件' : '标记所有未读成已读';
                $scope.confirm = function () {
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

            }]
        });

        modalInstance.result.then(function () {
            if(type === 'delete'){
                $rootScope.deleteAllIncidentsPromise = deferred.promise;
                Incident.deletedAll("incident").then(function(data){
                    deferred.resolve('success');
                    if(data === 0){
                        scope.incident.unReadIncidentCount = 0 ;
                        scope.incident.todayCount = 0 ;
                        scope.incident.errorIncidentCount = 0 ;
                        scope.dtable.table = [];
                        scope.dtable.totalNum = 0;
                    }else{
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '删除安全事件失败： 错误码' + data
                        });
                    }
                });
            }else if(type === 'read'){
                Incident.markAllRead("incident").then(function(){
                    scope.incident.unReadIncidentCount = 0 ;
                    angular.forEach(scope.dtable.table, function (inc){
                        inc.status = 'READ';
                    });
                });
            }
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }


    function timeline($timeout, $window, $modal, $compile, Incident, mOverview) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/incident/timeline.html',
            controller: function () {},
            controllerAs: 'timeline',
            link: function ($scope, $element) {
                var vm = $scope.timeline;
                var serverTimeSubtract;
                vm.getServerTime = function () {
                    return moment().subtract(serverTimeSubtract || 0);
                };
                mOverview.getCurtime().then(function (data) {
                    serverTimeSubtract = moment().valueOf() - moment(data).valueOf();
                    vm.init();

                });
                vm.init = function (options) {
                    vm.destroy();

                    vm.initOptions(options);
                    vm.setup();
                };
                vm.initOptions = function(options) {
                    vm.defaultOptions = {
                        timeRulerDuration: 60 * 60 * 1000,
                        zoom: 5,
                        updateDuration: 20*1000,
                        showFilter: true,
                        pausing: false,
                        realtime: true
                    };
                    options = _.assign(vm.defaultOptions, options);
                    var zoomMap = _.zipObject(_.range(1,11).map(function (item, index) {
                        return [item, 27 + 6 * index];
                    }));

                    vm.pausing = options.pausing;
                    vm.scrolling = true;
                    vm.$wrap = $element.find('.wrap');
                    vm.title = '实时事件时间线';
                    vm.widthPerMinute = zoomMap[options.zoom];
                    vm.timeRulerDuration = options.timeRulerDuration;
                    vm.updateDuration = options.updateDuration;
                    // vm.maxDisplayIncidents = 15;
                    vm.templateUrl = 'incidentPopoverTemplate';
                    vm.showFilter = options.showFilter;
                    vm.types = ['WARN', 'DROP', 'REJECTBOTH'];
                    vm.typeMap = {
                        WARN: {
                            icon: 'fa-warning',
                            color: '#fb9700',
                            filter: true,
                            name: '警告'
                        },
                        DROP: {
                            icon: 'fa-trash',
                            color: '#fe540f',
                            filter: true,
                            name: '丢弃'
                        },
                        REJECTBOTH: {
                            icon: 'fa-ban',
                            color: '#c9420c',
                            filter: true,
                            name: '阻断'
                        }
                    };
                };

                vm.setup = function () {
                    vm.bindEvent();
                    vm.calcTime();
                    vm.initSize();
                    vm.calcTimeRuler();
                    vm.render();
                    vm.initIncidents();
                };

                vm.openConfigModal = function (toggleMode) {
                    $modal.open({
                        templateUrl: 'configTemplate',
                        scope: $scope,
                        controller: function ($scope, $modalInstance, $rootScope) {
                            "ngInject";
                            $scope.config = _.clone(vm.defaultOptions);
                            $scope.config.dateInput = $scope.config.dateInput || vm.timeRulerEnd._d;
                            $scope.config.timeInput = $scope.config.timeInput || vm.timeRulerEnd._d;
                            if(toggleMode) {
                                $scope.config.realtime = !$scope.config.realtime;
                            }
                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };
                            $scope.setConfig = function () {
                                // vm.initOptions($scope.config);
                                if(!$scope.config.realtime) {
                                    if($scope.config.dateInput && $scope.config.timeInput) {
                                        $scope.time = moment($scope.config.dateInput).format('YYYY-MM-DD') + ' ' + moment($scope.config.timeInput).format('HH:mm:ss');
                                    } else {
                                        return $rootScope.addAlert({
                                            type: 'danger',
                                            content: '请选择结束时间'
                                        });
                                    }
                                }
                                var options = {
                                    realtime: $scope.config.realtime,
                                    dateInput: $scope.config.dateInput,
                                    timeInput: $scope.config.timeInput,
                                    pausing: !$scope.config.realtime,
                                    subtractTime: $scope.time ? vm.getServerTime().valueOf() - moment($scope.time).valueOf() : 0,
                                    showFilter: $scope.config.showFilter,
                                    zoom: $scope.config.zoom
                                };
                                vm.init(options);
                                $modalInstance.close('done');
                            };
                        },
                        size: 'sm'
                    });
                };

                vm.groupIncidentsData = function (data) {
                    var res = _.groupBy(data, function (item) {
                        return moment(item.time).unix();
                    });
                    return res;
                };

                vm.initIncidents = function () {
                    vm.needUpdate = false; //需要在render函數中調用update
                    Incident.getTimelineIncidents({
                        start: vm.timeRulerStart.utc().format(),
                        end: vm.timeRulerEnd.utc().format()
                    }).then(function (data) {
                        return data.filter(function (item) {
                            return item.total > 0;
                        });
                    }).then(function (data) {
                        vm.incidents = vm.filterIncidents(vm.groupIncidentsData(data));
                        vm.maxCountPerSecond = Math.max.apply(null, data.map(function(item) {
                            return item.total;
                        }));
                    });
                };

                vm.updateIncidents = function () {
                    Incident.getTimelineIncidents({
                        start: vm.timeRulerEnd.utc().format(),
                        end: vm.timeRulerEnd.add(vm.updateDuration).utc().format()
                    }).then(function (data) {
                        return data.filter(function (item) {
                            return item.total > 0;
                        });
                    }).then(function (data) {
                        vm.incidents = _.omit(_.assign(vm.incidents, vm.filterIncidents(vm.groupIncidentsData(data))), function (value, key) {
                            return parseInt(key) < vm.timeRulerStart.unix();
                        });
                        vm.maxCountPerSecond = Math.max(Math.max.apply(null, data.map(function(item) {
                            return item.total;
                        })), vm.maxCountPerSecond);

                    });
                };

                $scope.$watch('timeline.typeMap', function () {
                    vm.incidents = vm.filterIncidents(vm.incidents);
                }, true);

                vm.filterIncidents = function (incidents) {
                    return _.mapValues(incidents, function (item) {
                        return item.map(function (incident) {
                            return {
                                time: moment(incident.time).unix(),
                                data: _.mapValues(incident.data, function (value, key) {
                                    return _.assign(value, {
                                        filter: vm.typeMap ? vm.typeMap[key].filter : true
                                    });
                                }),
                                total: _.values(incident.data)
                                    .filter(function (item) {
                                        return item.filter;
                                    })
                                    .map(function (item) {
                                        return item.count;
                                    }).reduce(function (pre, cur) {
                                        return pre + cur;
                                    }, 0)
                            };
                        });
                    });
                };

                $scope.$watch('timeline.maxCountPerSecond', function () {
                    vm.calcYAxis();
                });
                vm.calcYAxis = function () {
                    if(vm.maxCountPerSecond && vm.maxCountPerSecond > 0) {
                        var divisor = vm.maxCountPerSecond < 10 ? 10 : Math.pow(10, Math.floor(Math.log10(vm.maxCountPerSecond)));
                        vm.maxYAxis = Math.ceil((vm.maxCountPerSecond + 1) / divisor) * divisor;

                        var len = vm.maxYAxis < 9 ? vm.maxYAxis : 10;
                        vm.YAxis = _.range(vm.maxYAxis / len, vm.maxYAxis + 1, vm.maxYAxis / len);
                    }
                };

                vm.initSize = function () {
                    vm.elementWidth = $element.width();
                    vm.elementHeight = $element.height();
                };
                vm.clickDocumentListener = function () {
                    vm.activePopover && vm.activePopover.popover('hide').parent().removeClass('active');
                    delete vm.activePopover;
                    vm.mouseleave();
                };
                vm.bindEvent = function () {
                    $(window).on('resize', _.throttle(function () {
                        $timeout.cancel(vm.resumeTimer);
                        vm.pausing = true;
                        vm.resumeTimer = $timeout(function() {
                            vm.pausing = false;
                        }, 500);
                        vm.initSize();
                        vm.$wrap.stop().css({
                            left: '',
                            right: parseInt(vm.$wrap.css('right'))
                        });
                        $scope.$digest();
                    }, 100));

                    $(window).on('click', vm.clickDocumentListener);
                    $(window).on('keydown', _.throttle(function (e) {
                        switch (e.keyCode) {
                            case 37:
                                vm.prev();
                                $(window).trigger('click');
                                break;
                            case 39:
                                vm.next();
                                $(window).trigger('click');
                                break;
                            default:
                                break;
                        }
                    }, 200));
                };

                vm.floorTime = function (time, floor) {
                    return time.subtract((time.unix() % floor) * 1000);
                };

                vm.calcTime = function() {
                    vm.timeRulerEnd = vm.floorTime(vm.getServerTime().subtract(vm.defaultOptions.subtractTime || 0), 20);
                    vm.timeRulerStart = vm.floorTime(vm.getServerTime().subtract(vm.defaultOptions.subtractTime || 0).subtract(vm.timeRulerDuration), 20);
                    vm.subTitle = vm.timeRulerStart.format('HH:mm:ss') + '至' + vm.timeRulerEnd.format('HH:mm:ss');
                };

                vm.calcTimeRuler = function () {
                    var time,className,originLeft;
                    vm.calcTime();
                    vm.timeRulerList = _.range(Math.ceil(vm.timeRulerDuration / vm.updateDuration) + 10)
                        .map(function (item, index) {
                            time = moment(vm.timeRulerStart.unix() * 1000 + index * vm.updateDuration);
                            className = time.unix() % 300 === 0 ? 'lg' : (
                                time.unix() % 60 === 0 ? 'md' :
                                    time.unix() % 20 === 0 ? 'sm' : 'xs'
                            );
                            return {
                                className: className,
                                unix: time.unix(),
                                format: (time.unix() % 300 === 0) ? time.format('HH:mm\'') :
                                    ((time.unix() % 60 === 0) ? time.format('mm\'') : ''),
                                full: time.format('HH:mm:ss'),
                                start: time.utc().format(),
                                end: time.add(vm.updateDuration).utc().format()
                            };
                        });
                    vm.wrapWidth = vm.widthPerMinute / 3 * vm.timeRulerList.length;
                    if(vm.scrolling) {
                        vm.$wrap.css({
                            left: '',
                            right: vm.offset - vm.widthPerMinute / 3,
                        });
                    } else {
                        originLeft = parseInt(vm.$wrap.css('left'));
                        vm.$wrap.css({
                            right: '',
                            left: originLeft + vm.widthPerMinute / 3
                        });

                    }
                    vm.lastOffset = vm.offset || 0;
                    vm.offset = (vm.timeRulerEnd.unix() + 5 * 20 + vm.timeRulerEnd.millisecond() / 1000 - vm.timeRulerList[vm.timeRulerList.length - 1].unix) * vm.widthPerMinute / 60;

                    if(vm.scrolling) {
                        vm.$wrap.stop().animate({
                            right: vm.offset
                        }, 500);
                    } else {
                        vm.$wrap.animate({
                            left: originLeft
                        }, 500);
                    }
                };


                vm.render = function () {
                    vm.nowDate = vm.getServerTime().format('YYYY-MM-DD');
                    vm.nowTime = vm.getServerTime().format('hh:mm:ss');

                    if(vm.defaultOptions.realtime) {
                        vm.renderTimer = $timeout(function () {
                            vm.needUpdate = true;
                            vm.render();
                        }, vm.updateDuration);
                        if(!vm.pausing && vm.needUpdate) {
                            vm.defaultOptions.realtime && vm.updateIncidents();
                            vm.calcTimeRuler();
                        }
                    }

                };


                //drag

                vm.pause = function () {
                    $timeout.cancel(vm.resumeTimer);
                    vm.pausing = true;
                };
                vm.resume = function () {
                    vm.pausing = false;
                };
                vm.resumeScrolling = function () {
                    vm.scrolling = true;
                    $timeout(function () {
                        vm.$wrap.css({
                            left: '',
                            right: parseInt(vm.$wrap.css('right'))
                        });
                    });
                };

                vm.initDragOptions = function () {
                    vm.dragOptions = {
                        // revert: 'invalid',
                        axis: 'x',
                        refreshPositions: true,
                        cancel: ""
                        // cursor: 'col-resize'
                    };
                    vm.dragSettings = {
                        animate: true,
                        onStart: 'timeline.startDrag',
                        onStop: 'timeline.stopDrag',
                        onDrag: 'timeline.dragging'
                    };
                };
                vm.initDragOptions();

                vm.startDrag = function () {
                    vm.activePopover && vm.activePopover.popover('hide');
                    delete vm.activePopover;
                    $timeout.cancel(vm.resumeTimer);
                    vm.$wrap.stop();
                    vm.isDragging = true;
                    vm.scrolling = false;
                    vm.pausing = true;
                };
                vm.stopDrag = function () {
                    vm.isDragging = false;
                    $timeout.cancel(vm.resumeTimer);
                    vm.resumeTimer = $timeout(function() {
                        vm.pausing = false;
                    }, 500);
                };

                vm.dragging = function (event, ui) {
                    ui.position.left = vm.limitRange(ui.position.left, vm.elementWidth - vm.wrapWidth - vm.offset, 0);
                };
                vm.limitRange = function (value, min, max) {
                    if(value < min) {
                        // vm.resumeScrolling();
                        return min;
                    }
                    if(value > max) {
                        return max;
                    }
                    return value;
                };

                vm.mouseenter = function () {
                    vm.pause();
                };
                vm.mouseleave = function () {
                    if(!(vm.isDragging || vm.activePopover)) {
                        vm.resumeTimer = $timeout(function () {
                            vm.resume();
                        }, 200);
                    }
                };

                vm.popover = function (e, scope) {
                    if(vm.isDragging) {
                        return;
                    }
                    if(vm.activePopover && vm.activePopover.is(e.currentTarget)) {
                        return;
                    }
                    $(e.currentTarget).popover('show');
                    $(e.currentTarget).data('bs.popover').$tip.find('.popover-content').html($('#incidentPopoverTemplate').html());
                    $compile($(e.currentTarget).data('bs.popover').$tip)(scope);
                };
                vm.popoverHide = function (e) {
                    if(vm.activePopover && vm.activePopover.is(e.currentTarget)) {
                        return;
                    }
                    $(e.currentTarget).popover('hide');
                };


                vm.clickIncidentItem = function (e, scope) {

                    if(vm.activePopover && vm.activePopover.is(e.currentTarget)) {
                        return;
                    }
                    $timeout(function () {
                        vm.pause();
                        $(e.currentTarget).popover('show').parent().addClass('active');
                        $('.popover-timeline .popover-content').html($('#incidentClickPopoverTemplate').html());
                        $compile($('.popover-timeline .popover-content'))(scope);
                        vm.activePopover = $(e.currentTarget);
                    });
                };

                vm.clickProtocolItem = function (protocol, time, level) {
                    $timeout(function () {
                        vm.pause();
                    });
                    var modalInstance = $modal.open({
                        templateUrl: 'protocolIncidentsTemplate',
                        controller: function ($scope, protocol, time, level) {
                            "ngInject";
                            $scope.protocol = protocol;
                            $scope.time = time;
                            $scope.level = level;
                            $scope.cancel = function () {
                                modalInstance.dismiss('cancel');
                            };
                        },
                        resolve: {
                            protocol: function () {
                                return protocol;
                            },
                            time: function () {
                                return time;
                            },
                            level: function () {
                                return level;
                            }
                        },
                        size: 'lg',
                    });
                    // Incident.getProtocolIncidents({
                    //     start: time.unix,
                    //     end: time.unix + vm.defaultOptions.updateDuration / 1000,
                    //     protocol: protocol.name,
                    //     count: protocol.count
                    // }).then(function (data) {
                    //
                    //
                    //     modalInstance.result.catch(function () {
                    //
                    //     });
                    // });
                };

                /*ft action*/
                vm.moveLeft = function () {
                    vm.pause();
                    vm.scrolling = false;
                    vm.$wrap.stop()
                        .css({
                            right: '',
                            left: parseInt(vm.$wrap.css('left'))
                        })
                        .animate({
                            left: 0
                        }, 500, function () {
                            vm.resume();
                        });
                };

                vm.moveRight = function () {
                    vm.pause();
                    vm.scrolling = true;
                    vm.$wrap.stop()
                        .css({
                            left: '',
                            right: parseInt(vm.$wrap.css('right'))
                        })
                        .animate({
                            right: vm.offset
                        }, 500, function () {
                            vm.resume();
                        });
                };

                vm.noPrev = true;
                vm.noNext = true;
                $scope.$watch('timeline.activePopover', function () {
                    vm.hasSelected = !!vm.activePopover;
                    vm.noPrev = !(vm.activePopover && vm.activePopover.parents('.group').prev().length > 0);
                    vm.noNext = !(vm.activePopover && vm.activePopover.parents('.group').next().length > 0);
                });


                vm.prev = function () {
                    if(vm.noPrev || !vm.activePopover) {
                        return;
                    }
                    var prevElem = vm.activePopover.parents('.group').prev().find('.bar').eq(vm.activePopover.index());
                    vm.$wrap.stop()
                        .css({
                            right: '',
                            left: parseInt(vm.$wrap.css('left'))
                        })
                        .animate({
                            left: parseInt(vm.$wrap.css('left')) + vm.widthPerMinute / 3
                        }, 200, function () {
                            prevElem.triggerHandler('click');
                        });
                };

                vm.next = function () {
                    if(vm.noNext || !vm.activePopover) {
                        return;
                    }
                    var nextElem = vm.activePopover.parents('.group').next().find('.bar').eq(vm.activePopover.index());
                    if(parseInt(vm.$wrap.css('left')) < vm.elementWidth - vm.wrapWidth - vm.offset) {
                        $timeout(function () {
                            nextElem.triggerHandler('click');
                        });
                    } else{
                        vm.$wrap.stop()
                            .css({
                                left: '',
                                right: parseInt(vm.$wrap.css('right'))
                            })
                            .animate({
                                right: parseInt(vm.$wrap.css('right')) + vm.widthPerMinute / 3
                            }, 200, function () {
                                nextElem.triggerHandler('click');
                            });
                    }
                };

                vm.canPrev = function () {
                    vm.activePopover.parent().prev();

                };

                vm.toggleTimeMode = function () {
                    vm.openConfigModal(true);
                };

                vm.destroy = function() {
                    vm.activePopover && vm.activePopover.popover('hide');
                    $timeout.cancel(vm.renderTimer);
                    $(window).off('resize');
                    $(window).off('click');
                    $(window).off('keydown');
                    _.each(_.keys(vm), function (key) {
                        if(typeof vm[key] !== 'function'){
                            delete vm[key];
                        }
                    });
                };
                $scope.$on("$destroy", vm.destroy);

            }
        };
    }

    function delayRemoveClass($timeout) {
        return {
            restrict: 'A',
            scope: {
                delayRemoveClass: '@'
            },
            link: function ($scope, $elem) {
                if($elem.hasClass($scope.delayRemoveClass)){
                    $timeout(function () {
                        $elem.removeClass($scope.delayRemoveClass);
                    });
                }
            }
        };
    }

    function timelineIncidentTable($q, Incident) {
        return {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/incident/timelineIncidentTable.html',
            link: link
        };

        function link(scope, element, attr, ctrl) {
            ctrl.setConfig({
                name: 'incident',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
            });
            ctrl.disableSearch = true;
            function getAll(params) {
                params.$filter = "(appLayerProtocol eq '" + scope.$parent.protocol.name + "') and (level eq " + scope.$parent.level + ") and (timestamp ge '" + scope.$parent.time.start + "' and timestamp le '" + scope.$parent.time.end + "')";
                return Incident.getIncidents(params);
            }

            function getCount() {
                return $q.resolve(scope.protocol.count);
            }


        }
    }
})();
