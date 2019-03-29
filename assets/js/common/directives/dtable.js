/**
 * DTable Directive
 *
 * Description
 */
(function () {
    'use strict';
    angular
        .module('southWest.directives')
        .directive('dtable', dtable)
        .directive('orderBy', orderBy)
        .directive('rangeSelector', rangeSelector)
        .directive('advancedSearch', advancedSearch)
        .directive('timePicker', timePicker)
        .directive('datePicker', datePicker);

    function dtable($compile, $window) {
        var dtableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: '/templates/common/dtable.html',
            controllerAs: 'dtable',
            controller: controller,
            link: link
        };

        return dtableObj;

        //////////
        function controller($scope, $q, $timeout, URI, sse, initializeData, $stateParams, $rootScope, serverTime) {
            "ngInject";
            var vm = this;
            var VALID_IP = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
            var order = {};
            var TableData, TableDataCount, SearchData, StreamURL, fields, timeRange, advancedSearch, TableExport;

            var linkDeferred = $q.defer();
            vm.linkPromise = linkDeferred.promise;
            vm.pagination = true;
            vm.totalCount = true;
            vm.scrollable = true;
            vm.currentPage = 1; //current page
            vm.numPerPage = 10; //max rows for data table
            vm.table = {};
            vm.query = '';
            vm.filter = 'normal';
            vm.validIp = VALID_IP;
            vm.advancedSearchQuery = '';
            vm.disabledTimeOptions = false;

            /**
             * config = {
             *     pagination: boolean
             *     totalCount: boolean
             *     scrollable: boolean
             *     get: function
             *     getCount: function
             *     search: function
             *     name: string
             * }
             */
            vm.setConfig = function (config) {
                var tempAdvance = vm.advancedSearch ? vm.advancedSearch.enable : false;
                vm.query = '';
                vm.advancedSearchQuery = '';
                TableData = config.getAll;
                TableDataCount = config.getCount;
                SearchData = config.search;
                TableExport = config.getAllExport;
                StreamURL = config.name;
                fields = config.fields;
                timeRange = config.dateTimeRange;
                advancedSearch = config.advancedSearch;
                order.predicate = config.predicate;
                order.reverse = config.reverse;
                if (config.numPerPage) {
                    vm.numPerPage = config.numPerPage;
                }
                vm.dateTimeRange = config.dateTimeRange && {
                        enable: false
                    };
                vm.advancedSearch = config.advancedSearch && {
                        enable: false
                    };
                vm.advancedSearchOptions = config.advancedSearch && config.advancedSearchOptions;

                vm.advancedSearchTimeRange = {};

                vm.advancedSearchOptions && vm.advancedSearchOptions.map(function (ob) {
                    if (ob.input === "timerange") {
                        vm.advancedSearchTimeRange = ob;
                    }
                });

                vm.name = config.name;
                vm.pagination = config.pagination;
                vm.totalCount = config.totalCount;
                vm.scrollable = config.scrollable;
                vm.disabledTimeOptions = config.disabledTimeOptions;
                linkDeferred.resolve(vm.scrollable);
                getTableData();
                // getTableDataCount();
                stream();
                if (vm.advancedSearch) {
                    vm.advancedSearch.enable = tempAdvance;
                }
            };

            vm.getTableData = getTableData;
            vm.getTableDataCount = getTableDataCount;
            vm.rangeSearch = rangeSearch;
            vm.highAdvancedSearch = highAdvancedSearch;
            vm.getTableExport = getTableExport;

            vm.advancedSearchApply = function () {
                var result = '';
                vm.advancedSearchOptions.forEach(function (data) {
                    if ((data.input === 'string' || (['ipAdress', 'macAdress', 'portNum'].indexOf(data.input) >= 0)) && data.value) {
                        result += result ? " and (" : "(";
                        var dataArr = data.value.split(' ');
                        if ((data.name === 'sourcePort' || data.name === 'destinationPort') && dataArr.length === 1) {
                            result += data.name + " eq '" + dataArr[0] + "')";
                        } else {
                            for (var l = 0; l < dataArr.length; l++) {
                                result += "contains(" + data.name + ",'" + dataArr[l] + "')";
                                result += (l < dataArr.length - 1) ? (" and ") : (")");
                            }
                        }
                    }
                    if (data.input === "checkbox" && parseInt(data.value) !== -1) {
                        if (result) {
                            result += ' and ' + data.name;
                            result += " eq " + (data.parser === 'string' ? "'" + data.value + "'" : data.value);
                        } else {
                            result += data.name;
                            result += " eq " + (data.parser === 'string' ? "'" + data.value + "'" : data.value);
                        }
                    }
                    if (data.input === "list_checkbox" && data.value !== []) {
                        var checklistNum = 0;
                        for (var i = 0; i < data.options.length; i++) {
                            if (data.options[i].value === true) {
                                var isDataType = vm.filter === 'profinetio' && data.name === 'dataType';
                                if (checklistNum === 0) {
                                    if (isDataType) {
                                        if (result) {
                                            result += ' and (contains(' + data.name;
                                            result += ",'" + data.options[i].name + "')";
                                        } else {
                                            result += '(contains(' + data.name;
                                            result += ",'" + data.options[i].name + "')";
                                        }
                                    } else {
                                        if (result) {
                                            result += ' and (' + data.name;
                                            result += " eq '" + data.options[i].name + "'";
                                        } else {
                                            result += '(' + data.name;
                                            result += " eq '" + data.options[i].name + "'";
                                        }
                                    }
                                } else {
                                    if (isDataType) {
                                        if (result) {
                                            result += ' or contains(' + data.name;
                                            result += ",'" + data.options[i].name + "')";
                                        } else {
                                            result += 'contains(' + data.name;
                                            result += ",'" + data.options[i].name + "')";
                                        }
                                    } else {
                                        if (result) {
                                            result += ' or ' + data.name;
                                            result += " eq '" + data.options[i].name + "'";
                                        } else {
                                            result += data.name;
                                            result += " eq '" + data.options[i].name + "'";
                                        }
                                    }
                                }
                                checklistNum++;
                            }
                        }
                        if (checklistNum) {
                            result += ')';
                        }
                    }
                    if (data.input === "timerange") {
                        if (vm.advancedSearchTimeRange.startDate) {
                            var genTimeRange = genDateFilter(vm.advancedSearchTimeRange);
                            result ? result + ' and ' : '';
                            result += "(" + data.name + " ge '" + genTimeRange.start + (genTimeRange.end ? ("' and " + data.name + " le '" + genTimeRange.end + "')") : "')");
                        }
                    }
                });
                vm.advancedSearchQuery = vm.isSearching = result;
                vm.currentPage = 1;
                getTableData();
            };

            vm.doAdvancedSearch = function (s) {
                serverTime.getTime().then(function (time) {
                    $rootScope.currentTime = new Date(time);
                    if (s !== 'r') {
                        vm.setAdvancedSearchTimeRange(s);
                    }
                    vm.query = '';
                    vm.advancedSearchApply();
                    vm.isSearching = vm.advancedSearchQuery;
                });
            };

            vm.getOrderConfig = function () {
                return order;
            };

            vm.getAdvancedSearchDateTimeRange = function () {
                if (vm.advancedSearchTimeRange) {
                    angular.extend(vm.advancedSearchTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(3, 'days').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(3, 'days').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                }
                return vm.advancedSearchTimeRange;
            };

            vm.setAdvancedSearchTimeRange = function (s) {
                delete vm.advancedSearchTimeRange.endDate;
                delete vm.advancedSearchTimeRange.endTime;
                if (s === 'n') {
                    delete vm.advancedSearchTimeRange.startDate;
                    delete vm.advancedSearchTimeRange.startTime;
                } else if (s === 'm') {
                    angular.extend(vm.advancedSearchTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(30, 'days').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(30, 'days').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                } else if (s === 'h') {
                    angular.extend(vm.advancedSearchTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(1, 'hours').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(1, 'hours').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                } else if (s === 'd') {
                    angular.extend(vm.advancedSearchTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(1, 'days').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(1, 'days').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                } else if (s === 'w') {
                    angular.extend(vm.advancedSearchTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(7, 'days').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(7, 'days').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                } else if (s === 'y') {
                    angular.extend(vm.advancedSearchTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(1, 'years').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(1, 'years').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                } else {
                    angular.extend(vm.advancedSearchTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(1, 'days').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(1, 'days').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                }
                return vm.advancedSearchTimeRange;
            };

            vm.getDateTimeRange = function () {
                if (vm.dateTimeRange) {
                    angular.extend(vm.dateTimeRange, {
                        startDate: moment($rootScope.currentTime).subtract(3, 'days').milliseconds(0).toDate(),
                        startTime: moment($rootScope.currentTime).subtract(3, 'days').milliseconds(0).toDate(),
                        endDate: moment($rootScope.currentTime).milliseconds(0).toDate(),
                        endTime: moment($rootScope.currentTime).milliseconds(0).toDate()
                    });
                }
                return vm.dateTimeRange;
            };

            vm.updateNumPerPage = vm.pageChanged = getTableData;

            vm.sort = function (predicate) {
                order.predicate = predicate;
                order.reverse = !order.reverse;
                getTableData();
            };

            vm.searchBar = function (query) {
                vm.query = query;
                vm.currentPage = 1;
                getTableData();
            };

            // vm.filterBar = function (filter) {
            //   vm.filter = filter;
            //   vm.currentPage = 1;
            //   vm.advancedSearchApply();
            //   getTableData();
            // };

            vm.refresh = function () {
                if (vm.advancedSearch && vm.advancedSearch.enable) {
                    vm.doAdvancedSearch(vm.s);
                } else {
                    vm.isSearching = vm.q;
                    vm.advancedSearchQuery = '';
                    vm.searchBar(vm.q);
                }
            };

            vm.getDataByCustomParameter = function (playload) {
                vm.advancedSearchQuery = playload;
                getTableData();
            };

            function genDateFilter(range) {
                var start, end;
                if (range && range.startDate && range.startTime) {
                    start = moment(range.startDate).format('YYYY-MM-DD') + 'T' + moment(range.startTime).format('HH:mm:ss');
                    start = moment(start).utc().format();
                }
                if (range && range.endDate && range.endTime) {
                    end = moment(range.endDate).format('YYYY-MM-DD') + 'T' + moment(range.endTime).format('HH:mm:ss');
                    end = moment(end).utc().format();
                }
                return {"start": start, "end": end};
            }

            function getTableExport() {
                var payload = {
                    '$limit': vm.totalNum
                };

                if (order.predicate) {
                    payload['$orderby'] = order.predicate + (order.reverse ? ' desc' : '');
                }
                if ((vm.query && vm.query.length) || (vm.dateTimeRange && vm.dateTimeRange.enable)) {
                    if (vm.query) {
                        payload['$filter'] = filterFunc(vm.query, fields);
                    }

                    if (vm.dateTimeRange && vm.dateTimeRange.enable) {
                        var genTimeRange = genDateFilter(vm.dateTimeRange);
                        payload['$filter'] = (payload['$filter'] ? payload['$filter'] + ' and ' : '') + "(" + timeRange + " ge '" + genTimeRange.start + "'" + (genTimeRange.end ? (" and " + timeRange + " le '" + genTimeRange.end + "')") : (")"));
                    }
                }

                TableExport(payload).then(function (data) {
                    window.open('./' + data, '_self');
                });
            }

            //////////
            function getTableData() {
                var payload;
                if (vm.pagination) {
                    payload = {
                        '$skip': (vm.currentPage - 1) * vm.numPerPage,
                        '$limit': vm.numPerPage
                    };
                } else {
                    payload = {
                        '$limit': undefined
                    };
                }

                if (order.predicate) {
                    payload['$orderby'] = order.predicate + (order.reverse ? ' desc' : '');
                }
                if (vm.searchDefer && vm.searchDefer.resolve) {
                    vm.searchDefer.resolve('success');
                }
                vm.searchDefer = $q.defer();
                if (vm.advancedSearchQuery) {
                    advancedSearching(payload);
                }

                if ((vm.query && vm.query.length) || (vm.dateTimeRange && vm.dateTimeRange.enable)) {
                    vm.searchPromise = vm.searchDefer.promise;
                    search(payload);
                } else {

                    if (vm.filter !== 'normal') {
                        if (payload['$filter']) {
                            payload['$filter'] += " and (contains(protocolSourceName,'" + vm.filter + "'))";
                        } else {
                            payload['$filter'] = "(contains(protocolSourceName,'" + vm.filter + "'))";

                        }
                    }

                    var all_payload = angular.copy(payload);
                    vm.searchPromise = vm.searchDefer.promise;
                    TableData(payload).then(function (data) {
                        if (vm.name === 'signature' || vm.name === 'custom' || vm.name === 'template') {
                            // var topologyId = $stateParams.topologyId;
                            var policyId = $stateParams.policyId;

                            delete all_payload['$skip'];
                            all_payload['$limit'] = vm.totalNum;
                            TableData(all_payload).then(function (alldata) {
                                initializeData(vm, policyId, vm.name, alldata, function (blocks) {
                                    var start = (vm.currentPage - 1) * vm.numPerPage;
                                    vm.table = blocks.slice(start, start + vm.numPerPage);
                                    vm.searchDefer.resolve('success');
                                });
                            });
                        } else {
                            vm.table = data;
                            vm.searchDefer.resolve('success');
                        }
                        $timeout(function () {
                            angular.element(window).trigger('resize');
                        }, 50);
                    }, function () {
                        vm.searchDefer.resolve('fail');
                    });
                    getTableDataCount(payload);
                }
            }

            function getTableDataCount(payload) {
                var _payload;
                if (payload && payload.$filter) {
                    _payload = {
                        $filter: payload.$filter
                    };
                }
                TableDataCount(_payload).then(function (count) {
                    vm.totalNum = count || 0;
                });
            }

            function search(payload) {
                if (vm.query) {
                    if (!payload['$filter']) {
                        payload['$filter'] = filterFunc(vm.query, fields);
                    } else {
                        payload['$filter'] = payload['$filter'] + ' and ' + filterFunc(vm.query, fields);
                    }
                }

                if (vm.dateTimeRange && vm.dateTimeRange.enable) {
                    var genTimeRange = genDateFilter(vm.dateTimeRange);
                    payload['$filter'] = (payload['$filter'] ? payload['$filter'] + ' and ' : '') + "(" + timeRange + " ge '" + genTimeRange.start + (genTimeRange.end ? ("' and " + timeRange + " le '" + genTimeRange.end + "')") : "')");
                }

                getTableDataCount(payload);
                SearchData(payload).then(function (data) {
                    vm.table = data;
                    vm.searchDefer.resolve('success');
                }, function () {
                    vm.searchDefer.resolve('fail');
                });
            }

            function advancedSearching(payload) {
                if (vm.advancedSearchQuery) {
                    payload['$filter'] = vm.advancedSearchQuery;
                }
            }

            function rangeSearch() {
                vm.dateTimeRange.enable = !vm.dateTimeRange.enable;

                if (!vm.dateTimeRange.enable) {
                    var payload = {
                        '$skip': (vm.currentPage - 1) * vm.numPerPage,
                        '$limit': vm.numPerPage
                    };
                    search(payload);
                }
            }

            function highAdvancedSearch() {
                vm.advancedSearchOptions.map(function (o) {
                    o.value = (o.input === "checkbox") ? o.options[0].value : "";
                    o.error = false;
                    o.invalidMsg = '';
                });
                vm.advancedSearchQuery = vm.isSearching = vm.query = vm.q = "";
                vm.advancedSearch.enable = !vm.advancedSearch.enable;
            }

            function stream() {
                if (!StreamURL) {
                    return;
                }

                var notification = $scope.$on(vm.name, function (evt, data) {
                    console.log(evt, data);
                    getTableData();
                });
                $scope.$on('$destroy', function () {
                    notification();
                });
            }
        }

        function link(scope, element, attr, ctrl) {
            // if scrollable is disable, skip the function
            ctrl.linkPromise.then(function (isScrollable) {
                if (!isScrollable) {
                    return;
                }

                var fixedHeaders = null;
                var container = element.find('.fixed-table-container');
                var header = container.find('.fixed-table-body thead');
                var window = angular.element($window);

                addFixedHeader();
                resizeHeader();

                window.on('resize', resizeHeader);
                scope.$on('$destroy', function () {
                    window.off('resize', resizeHeader);
                });

                //////////
                function addFixedHeader() {
                    var headerHeight = header.height();
                    var text = '<div class="fixed-table-header">';
                    text += '<table class="table table-striped table-bordered"><thead>' + header.html() + '</thead>';
                    text += '</table>';
                    text += '</div>';

                    var content = $compile(text)(scope);
                    container
                        .prepend(content)
                        .find('.fixed-table-body').css('height', 'calc(100% - ' + headerHeight + 'px)')
                        .find('table').css('margin-top', -(headerHeight));

                    fixedHeaders = container.find('.fixed-table-header th');
                }

                function resizeHeader() {
                    header.find('th').each(function (index, header) {
                        angular.element(fixedHeaders[index]).width(angular.element(header).width());
                    });
                }
            });
        }
    }

    function orderBy() {
        var orderByObj = {
            scope: {
                orderBy: '@'
            },
            require: '^dtable',
            restrict: 'A',
            transclude: true,
            templateUrl: '/templates/common/orderBy.html',
            link: link
        };

        return orderByObj;

        //////////
        function link(scope, element, attrs, ctrl) {
            scope.order = ctrl.getOrderConfig();

            scope.sort = function () {
                ctrl.sort(scope.orderBy);
            };
        }
    }

    function rangeSelector($rootScope) {
        var rangeSelectorObj = {
            scope: false,
            require: '^dtable',
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/common/dtable.rangeSelector.html',
            link: link
        };

        return rangeSelectorObj;

        //////////
        function link(scope, element, attrs, ctrl) {
            angular.extend(scope, {
                range: ctrl.getDateTimeRange(),
            });

            scope.validateTimePeriod = function (time, field) {
                var start = moment(time.startDate).format('YYYY-MM-DD') + 'T' + moment(time.startTime).format('HH:mm:ss');
                start = moment(start).utc().format();

                var end = moment(time.endDate).format('YYYY-MM-DD') + 'T' + moment(time.endTime).format('HH:mm:ss');
                end = moment(end).utc().format();

                var now = (moment($rootScope.currentTime)).utc().format();

                scope.invalidStartTime = '';
                scope.invalidEndTime = '';

                if (start === 'Invalid date') {
                    scope.invalidStartTime = '开始日期/时间不合法';
                }
                if (end === 'Invalid date') {
                    scope.invalidEndTime = '结束日期/时间不合法';
                }

                if (scope.invalidStartTime.length === 0 && scope.invalidEndTime.length === 0) {
                    if (field === 'startdate' || field === 'starttime') {
                        if (start > now) {
                            scope.invalidStartTime = '开始时间不可在当前时间之后';
                        } else if (start >= end) {
                            scope.invalidStartTime = '开始时间要在结束时间之前';
                        }
                    } else {
                        if (end > now) {
                            scope.invalidEndTime = '结束时间不可在当前时间之后';
                        } else if (start >= end) {
                            scope.invalidEndTime = '结束时间要在开始时间之后';
                        }
                    }
                }
            };
        }
    }


    function advancedSearch($document, $rootScope, formatVal) {
        var rangeSelectorObj = {
            scope: false,
            require: '^dtable',
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/common/dtable.advanced-search.html',
            link: link
        };

        return rangeSelectorObj;

        //////////
        function link(scope, element, attrs, ctrl) {
            angular.extend(scope, {
                range: ctrl.getAdvancedSearchDateTimeRange()
            });

            $document.on('click', function (e) {
                if (!$(e.target).is('div.multiselect-parent') && !$(e.target).closest('div.multiselect-parent').is('div.multiselect-parent')) {
                    for (var i = 0; i < ctrl.advancedSearchOptions.length; i++) {
                        var tmp = ctrl.advancedSearchOptions[i];
                        if (tmp.input === 'list_checkbox') {
                            tmp.open = false;
                        }
                    }
                    scope.$digest();
                }
            });

            scope.validateTimePeriod = function (time, field) {
                var startTime, endTime;
                if (typeof time.startTime === 'string') {
                    startTime = time.startTime;
                } else {
                    startTime = moment(time.startTime).format('HH:mm:ss');
                }
                if (typeof time.endTime === 'string') {
                    endTime = time.endTime;
                } else {
                    endTime = moment(time.endTime).format('HH:mm:ss');
                }
                var start = moment(time.startDate).format('YYYY-MM-DD') + 'T' + moment(time.startTime).format('HH:mm:ss');
                start = moment(start).utc().format();

                var end = moment(time.endDate).format('YYYY-MM-DD') + 'T' + moment(time.endTime).format('HH:mm:ss');
                end = moment(end).utc().format();

                var now = (moment($rootScope.currentTime)).utc().format();

                scope.invalidStartTime = '';
                scope.invalidEndTime = '';

                if (start === 'Invalid date') {
                    scope.invalidStartTime = '开始日期/时间不合法';
                }
                if (end === 'Invalid date') {
                    scope.invalidEndTime = '结束日期/时间不合法';
                }

                if (scope.invalidStartTime.length === 0 && scope.invalidEndTime.length === 0) {
                    if (field === 'startdate' || field === 'starttime') {
                        if (start > now) {
                            scope.invalidStartTime = '开始时间不可在当前时间之后';
                        } else if (start >= end) {
                            scope.invalidStartTime = '开始时间要在结束时间之前';
                        }
                    } else {
                        if (end > now) {
                            scope.invalidEndTime = '结束时间不可在当前时间之后';
                        } else if (start >= end) {
                            scope.invalidEndTime = '结束时间要在开始时间之后';
                        }
                    }
                }
            };

            scope.validate = function (item) {
                if (item.value === '') {
                    item.error = false;
                    item.invalidMsg = '';

                } else {
                    switch (item.input) {
                        case 'ipAdress':
                            item.error = formatVal.validateIp(item.value);
                            item.invalidMsg = item.error ? '请输入合法IP地址' : '';
                            break;
                        case 'macAdress':
                            item.error = formatVal.validateMac(item.value);
                            item.invalidMsg = item.error ? '请输入合法MAC地址' : '';
                            break;
                        case 'portNum':
                            item.error = !formatVal.checkPortInput(item.value);
                            item.invalidMsg = item.error ? '请输入合法端口列表' : '';
                            break;
                    }
                }
            };

            scope.getMultiselectItems = function (list) {
                var itemString = "";
                for (var i = 0; i < list.length; i++) {
                    if (list[i].value === true) {
                        if (itemString.length !== 0) {
                            itemString += ', ';
                        }
                        itemString += list[i].name === 'NONSTANDARD' ? '其他' : list[i].name;
                    }
                }
                return itemString || '请选择';
            };
        }
    }

    function timePicker($filter) {
        var obj = {
            restrict: 'E',
            require: 'ngModel',
            replace: true,
            templateUrl: '/templates/common/timePicker.html',
            scope: {
                value: '=ngModel',
                name: '@name',
                id: '@id',
                placeholder: '=placeholder',
                ngdisabled: '=ngDisabled',
                click: '&',
                control: '=',
                hide: '&',
                pickSeconds: '=?'
            },
            link: function (scope, element, attrs, ngModel) {
                scope.showWidget = function () {
                    if (scope.picker && scope.picker.show) {
                        scope.picker.show();
                    }
                };
                scope.setTime = function () {
                    if (scope.picker && scope.value) {
                        scope.picker.setLocalDate(scope.value);
                        scope.picker.notifyChange();
                    } else if (scope.picker && scope.placeholder) {
                        scope.picker.setLocalDate(scope.placeholder);
                        scope.picker.notifyChange();
                    }
                };
                scope.internalControl = scope.control || {};
                scope.internalControl.clearDate = function () {
                    if (scope.picker) {
                        scope.picker.setLocalDate(scope.placeholder);
                        element.find('input').val('');
                    }
                };
                $.fn.datetimepicker.Constructor.prototype.actions.showHours = function () {
                };
                $.fn.datetimepicker.Constructor.prototype.actions.showMinutes = function () {
                };
                $.fn.datetimepicker.Constructor.prototype.actions.showSeconds = function () {
                };
                element.datetimepicker({
                    pickDate: false,
                    pickSeconds: scope.pickSeconds !== false
                }).on('hide', function () {
                    _.isFunction(scope.hide) && scope.hide({time: ngModel.$modelValue});
                });
                scope.picker = element.data('datetimepicker');
                element.on('changeDate', function (e) {
                    // // get local time from input date
                    var tmp = new Date(e.date.getTime() + e.date.getTimezoneOffset() * 60000);
                    ngModel.$setViewValue(tmp);
                    element.find('input').blur();
                });

                ngModel.$render = function () {
                    var tmp = ngModel.$modelValue;
                    scope.time = $filter('date')(tmp, 'HH:mm:ss');
                };
                scope.$watch('value', function () {
                    ngModel.$render();
                }, true);

                ngModel.$viewChangeListeners.push(function () {
                    scope.$eval(attrs.ngChange);
                });
            }
        };
        return obj;
    }

    function datePicker($filter) {
        var obj = {
            restrict: 'E',
            require: 'ngModel',
            replace: true,
            templateUrl: '/templates/common/datePicker.html',
            scope: {
                value: '=ngModel',
                name: '@name',
                id: '@id',
                placeholder: '=placeholder',
                ngdisabled: '=ngDisabled',
                click: '&',
                control: '=',
                startDate: '@',
                endDate: '@'
            },
            link: function (scope, element, attrs, ngModel) {
                scope.showWidget = function () {
                    if (scope.picker && scope.picker.show) {
                        scope.picker.show();
                    }
                };
                scope.hideWidget = function () {
                    if (scope.picker && scope.picker.hide) {
                        scope.picker.hide();
                    }
                };
                scope.setTime = function () {
                    if (scope.picker && scope.value) {
                        scope.picker.setLocalDate(scope.value);
                        scope.picker.notifyChange();
                    } else if (scope.picker && scope.placeholder) {
                        scope.picker.setLocalDate(scope.placeholder);
                        scope.picker.notifyChange();
                    }
                };
                scope.internalControl = scope.control || {};
                scope.internalControl.clearDate = function () {
                    if (scope.picker) {
                        scope.picker.setDate(scope.placeholder);
                        element.find('input').val('');
                    }
                };
                element.datetimepicker({
                    pickTime: false,
                    startDate: new Date(scope.startDate),
                    endDate: new Date(scope.endDate)
                });
                scope.picker = element.data('datetimepicker');
                element.on('changeDate', function (e) {
                    var d = new Date();
                    // // get local time from input date
                    var tmp = new Date(e.date.getTime() + d.getTimezoneOffset() * 60000);
                    ngModel.$setViewValue(tmp);
                    element.find('input').blur();
                    scope.hideWidget();
                });

                ngModel.$render = function () {
                    var tmp = ngModel.$modelValue;
                    scope.time = $filter('date')(tmp, 'yyyy-MM-dd');
                };
                scope.$watch('value', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        ngModel.$render();
                    }
                }, true);

                ngModel.$viewChangeListeners.push(function () {
                    scope.$eval(attrs.ngChange);
                });
            }
        };
        return obj;
    }

    function filterFunc(q, fields) {
        return '((' + q.split(' ').map(function (qa) {
                return fields.map(function (field) {
                    return "contains(" + field + ",'" + qa + "')";
                }).join(' or ');
            }).join(') and (') + '))';
    }
})();
