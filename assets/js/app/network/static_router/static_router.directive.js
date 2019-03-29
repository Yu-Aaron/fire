/**
 * NetInterface StaticRouter Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.network.static_router')
        .directive('staticRouterTable', staticRouterTable);

    function staticRouterTable($rootScope, $q, $modal, $log, $state, staticRouterModel) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/network/static_router/staticRouterTable.html',
            link: link
        };

        return obj;

        function link(scope, element, attr, ctrl) {
            var fields = ['destIpMask', 'outInterfaceName', 'gateWayNextJump', 'manageScope'];
            staticRouterModel.getOutInterfaceNames(/*{$filter: "(interfaceType eq 'ETH')"}*/).then(function (interfaces) {
                var optionNames = [{text: '所有出接口', value: '-1'}];
                interfaces.forEach(function (interfaceName) {
                    if (interfaceName === 'any') {
                        optionNames.push({text: '任意', value: 'any'});
                    } else {
                        optionNames.push({text: interfaceName, value: "'" + interfaceName + "'"});
                    }
                });
                ctrl.setConfig({
                    name: 'item',
                    numPerPage: 10,
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    fields: fields,
                    advancedSearch: 'item',
                    advancedSearchOptions: [
                        {'name': 'destIpMask', 'display': '目的IP掩码', 'input': 'string', 'option': false, value: ""},
                        {
                            'name': 'outInterfaceName',
                            'display': '出接口',
                            'input': 'checkbox',
                            'option': true,
                            value: '-1',
                            'options': optionNames
                        },
                        {'name': 'gateWayNextJump', 'display': '网关', 'input': 'string', 'option': false, value: ""},
                        {'name': 'manageScope', 'display': '管理距离', 'input': 'string', 'option': false, value: ""}
                    ]
                });
            });

            function search(params) {
                return getAll(params);
            }

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return staticRouterModel.getStaticRouterDatas(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return staticRouterModel.getStaticRouterDatasCount(payload);
            }

            //带参数传递的state reload
            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (staticRouterData) {
                    ctrl.selectedItems[staticRouterData.routeId] = ctrl.selectAllValue;
                });
            };
            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (staticRouterData) {
                    if (ctrl.selectedItems[staticRouterData.routeId]) {
                        hasChecked = true;
                    } else {
                        allChecked = false;
                    }
                });
                if (hasChecked === true && allChecked === false) {
                    ctrl.selectAllValue = null;
                } else if (hasChecked === true && allChecked === true) {
                    ctrl.selectAllValue = true;
                } else {
                    ctrl.selectAllValue = false;
                }
            };

            ctrl.addNew = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/network/static_router/staticRouter.html',
                    size: 'sm',
                    backdrop: 'static',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, formatVal) {
                    $scope.routerData = {};
                    $scope.isEditing = true;
                    //获取接口列表内容
                    staticRouterModel.getOutInterfaceNames({$filter: "(interfaceType ne 'SUB')"}).then(function (interfaces) {
                        $scope.routerData.outInterfaceName = interfaces[0];
                        $scope.interfaces = interfaces;
                    });

                    $scope.error = {
                        'destIpMask': true,
                        'gateWayNextJump': true
                    };

                    $scope.validateDestIpMask = function (destIpMask) {
                        if (destIpMask === "0.0.0.0/0") {
                            $scope.error.destIpMask = false;
                        } else {
                            $scope.error.destIpMask = formatVal.validateIpSegment(destIpMask);
                        }
                    };

                    $scope.validateGateWayNextJump = function (ip) {
                        $scope.error.gateWayNextJump = formatVal.validateIp(ip);
                    };

                    $scope.changeInterface = function (type) {
                        $scope.routerData.outInterfaceName = type;
                        if ($scope.routerData.outInterfaceName !== 'any') {
                            $scope.error.gateWayNextJump = false;
                        } else {
                            $scope.error.gateWayNextJump = !$scope.routerData.gateWayNextJump || formatVal.validateIp($scope.routerData.gateWayNextJump);
                        }
                    };

                    // var PRIORITY_REG = /^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
                    // $scope.validatePriority = function (priority) {
                    //     $scope.error.priority = priority !== '' && !priority.match(PRIORITY_REG);
                    // };

                    var MANAGE_SCOPE_REG = /^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
                    $scope.validateManageScope = function (manageScope) {
                        $scope.error.manageScope = manageScope !== '' && !manageScope.match(MANAGE_SCOPE_REG);
                    };

                    $scope.ok = function () {
                        var deferred = $q.defer();
                        $scope.configPromise = deferred.promise;
                        $scope.routerData.destIpMask = formatVal.ipLongMaskToIpShortNum($scope.routerData.destIpMask);
                        if ($scope.routerData.outInterfaceName !== 'any') {
                            $scope.routerData.gateWayNextJump = '';
                        }
                        staticRouterModel.addStaticRouterData($scope.routerData).then(function () {
                            reload().then(function () {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '静态路由添加成功'
                                });
                            });
                        }, function (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('静态路由添加失败：' + err.data) : '静态路由添加失败')
                            });
                        }).finally(function () {
                            $scope.configPromise = null;
                            $modalInstance.close('done');
                        });
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.edit = function (routerData) {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/network/static_router/staticRouter.html',
                    size: 'sm',
                    backdrop: 'static',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, formatVal) {
                    $scope.routerData = angular.copy(routerData);
                    $scope.isEditing = true;
                    //获取接口列表内容
                    staticRouterModel.getOutInterfaceNames({$filter: "(interfaceType ne 'SUB')"}).then(function (interfaces) {
                        $scope.interfaces = interfaces;
                    });

                    $scope.error = {
                        'destIpMask': $scope.routerData.destIpMask === "0.0.0.0/0" ? false : formatVal.validateIpMask($scope.routerData.destIpMask),
                        'gateWayNextJump': $scope.routerData.outInterfaceName === 'any' ? formatVal.validateIp($scope.routerData.gateWayNextJump) : false
                    };

                    $scope.validateDestIpMask = function (destIpMask) {
                        if (destIpMask === "0.0.0.0/0") {
                            $scope.error.destIpMask = false;
                        } else {
                            $scope.error.destIpMask = formatVal.validateIpSegment(destIpMask);
                        }
                    };

                    $scope.validateGateWayNextJump = function (ip) {
                        $scope.error.gateWayNextJump = formatVal.validateIp(ip);
                    };

                    $scope.changeInterface = function (type) {
                        $scope.routerData.outInterfaceName = type;
                        if ($scope.routerData.outInterfaceName !== 'any') {
                            $scope.error.gateWayNextJump = false;
                        } else {
                            $scope.error.gateWayNextJump = !$scope.routerData.gateWayNextJump || formatVal.validateIp($scope.routerData.gateWayNextJump);
                        }
                    };

                    // var PRIORITY_REG = /^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
                    // $scope.validatePriority = function (priority) {
                    //     $scope.error.priority = priority !== '' && !priority.match(PRIORITY_REG);
                    // };

                    var MANAGE_SCOPE_REG = /^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
                    $scope.validateManageScope = function (manageScope) {
                        $scope.error.manageScope = manageScope !== '' && !manageScope.match(MANAGE_SCOPE_REG);
                    };

                    $scope.ok = function () {
                        staticRouterModel.isIpRangeDuplicate($scope.routerData).then(function (data) {
                            if (data.data === true) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '静态路由添加失败，其他静态路由有相同的网段目的IP掩码。'
                                });
                            } else {
                                var deferred = $q.defer();
                                $scope.configPromise = deferred.promise;
                                delete $scope.routerData.priority;   //暂时屏蔽优先级
                                staticRouterModel.editStaticRouterData($scope.routerData).then(function () {
                                    if (routerData.routeId === $scope.routerData.routeId) {
                                        routerData.destIpMask = $scope.routerData.destIpMask;
                                        routerData.gateWayNextJump = $scope.routerData.gateWayNextJump;
                                        routerData.outInterfaceName = $scope.routerData.outInterfaceName;
                                        // routerData.priority = $scope.routerData.priority;
                                        routerData.manageScope = $scope.routerData.manageScope;
                                    }
                                    $rootScope.addAlert({
                                        type: 'success',
                                        content: '静态路由修改成功'
                                    });
                                }, function (err) {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('静态路由修改失败：' + err.data) : '静态路由修改失败')
                                    });
                                }).finally(function () {
                                    $scope.configPromise = null;
                                    $modalInstance.close('done');
                                });
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.delete = function () {
                var selectedItems = ctrl.selectedItems;
                var routeDatas = [];
                if (selectedItems) {
                    for (var routeId in selectedItems) {
                        if (selectedItems[routeId]) {
                            for (var i = 0; i < ctrl.table.length; i++) {
                                if (ctrl.table[i].routeId + '' === routeId) {
                                    routeDatas.push({
                                        "destIpMask": ctrl.table[i].destIpMask,
                                        "gateWayNextJump": ctrl.table[i].gateWayNextJump,
                                        "outInterfaceName": ctrl.table[i].outInterfaceName,
                                        "routeId": ctrl.table[i].routeId
                                    });
                                }
                            }
                        }
                    }
                }
                if (routeDatas.length !== 0) {
                    var deferred = $q.defer();
                    ctrl.deletePromise = deferred.promise;
                    //staticRouterModel.deleteStaticRouterData(routeDatas, function (taskInfo, err) {
                    //    if (err) {
                    //        $rootScope.addAlert({
                    //            type: 'danger',
                    //            content: (err.data ? ('静态路由删除失败：' + err.data) : '静态路由删除失败')
                    //        });
                    //    } else {
                    //        var taskId = taskInfo.taskId;
                    //        (function countdown(counter) {
                    //            var checkStaticRouterDeletion = $timeout(function () {
                    //                Task.getTask(taskId).then(function (data) {
                    //                    if (data.data.state === 'SUCCESS') {
                    //                        reload().then(function () {
                    //                            $rootScope.addAlert({
                    //                                type: 'success',
                    //                                content: '静态路由删除成功'
                    //                            });
                    //                        });
                    //                        deferred.resolve('success');
                    //                        $timeout.cancel(checkStaticRouterDeletion);
                    //                    } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                    //                        $rootScope.addAlert({
                    //                            type: 'danger',
                    //                            content: (data.data.reason ? ('静态路由删除失败：' + data.data.reason) : '静态路由删除失败')
                    //                        });
                    //                        deferred.resolve('fail');
                    //                        $timeout.cancel(checkStaticRouterDeletion);
                    //                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                    //                        if (counter > 0) {
                    //                            countdown(counter - 1);
                    //                        } else {
                    //                            $rootScope.addAlert({
                    //                                type: 'danger',
                    //                                content: '静态路由删除超时'
                    //                            });
                    //                            deferred.resolve('timeout');
                    //                            $timeout.cancel(checkStaticRouterDeletion);
                    //                        }
                    //                    } else {
                    //                        $rootScope.addAlert({
                    //                            type: 'danger',
                    //                            content: (data.data.reason ? ('静态路由删除失败：' + data.data.reason) : '静态路由删除失败')
                    //                        });
                    //                        deferred.resolve('fail');
                    //                        $timeout.cancel(checkStaticRouterDeletion);
                    //                    }
                    //                });
                    //            }, 1000);
                    //        })(10);
                    //    }
                    //});
                    staticRouterModel.deleteStaticRouterData(routeDatas).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '静态路由删除成功'
                        });
                        reload();
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('静态路由删除失败：' + err.data) : '静态路由删除失败')
                        });
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条静态路由'
                    });
                }
            };
        }

    }

})();
