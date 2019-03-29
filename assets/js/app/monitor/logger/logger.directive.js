/**
 * logger Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.logger')
        .directive('logTab', logTab)
        .directive('logplTab', logplTab)
        .directive('logpfTab', logpfTab)
        .directive('logdlTab', logdlTab)
        .directive('logdcTab', logdcTab)
        .directive('logdfTab', logdfTab)
        .directive('bookmarkTab', bookmarkTab)
        .directive('screenshotTab', screenshotTab)
        .directive('eventTable', eventTable);

    function logTab($q, Logger, $modal, $log, formatVal) {
        var logTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/logger/logTab.html',
            link: link
        };
        return logTabObj;

        ////////

        function link(scope, element, attr, ctrl) {
            var fields = ['user', 'user_ip', 'operationName'];
            ctrl.setConfig({
                name: 'log',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                //                    dateTimeRange: 'timestamp',
                advancedSearch: 'logs',
                advancedSearchOptions: [

                    {
                        'name': 'timestamp',
                        'display': '时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'user_ip', 'display': 'IP', 'input': 'string', 'option': false, value: ""},
                    {'name': 'user', 'display': '用户', 'input': 'string', 'option': false, value: ""},
                    {'name': 'operationName', 'display': '内容', 'input': 'string', 'option': false, value: ""},
                ]
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'operationLogId desc';
                } else {
                    params['$orderby'] += ', operationLogId desc';
                }
                scope.params = params;
                return Logger.getAll(params).then(function (listData) {
                    return listData.length ? $q.all(listData).then(function () {
                        var set = listData.map(function (d, i) {
                            listData[i].timestamp = new Date(listData[i].timestamp);
                            if (listData[i].subServiceType === 'DpiUserCmdLog' ||
                                listData[i].subServiceType === 'DpifwPacketAccounting' ||
                                listData[i].subServiceType === 'DpiUserLogin') {
                                return Logger.get(listData[i].operationLogId, listData[i].subServiceType).then(function (detail) {
                                    d.detail = detail;
                                });
                            } else {
                                return;
                            }
                        });
                        return $q.all(set).then(function () {
                            return listData;
                        });
                    }) : [];
                });
            }

            function getCount(params) {
                var payload = params || {};
                return Logger.getCount(payload);
            }

            function search(params) {
                return getAll(params);
            }

            scope.openExportPanel = function (flag) {
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        return formatVal.validatePsw(psw);
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$orderby'] = "operationLogId desc";
                        Logger.getAllExport(p, psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }
    }

    function logplTab(Logger, $modal, $log, FileUploader, URI, $rootScope, $state, $timeout, $q, formatVal) {
        var logplTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/logger/logplTab.html',
            link: link
        };
        return logplTabObj;

        function link(scope, element, attr, ctrl) {
            var fields = ['user', 'user_ip', 'operationName'];
            ctrl.setConfig({
                name: 'log',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                advancedSearch: 'logs',
                advancedSearchOptions: [

                    {
                        'name': 'timestamp',
                        'display': '时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'user_ip', 'display': 'IP', 'input': 'string', 'option': false, value: ""},
                    {'name': 'user', 'display': '用户', 'input': 'string', 'option': false, value: ""},
                    {'name': 'operationName', 'display': '内容', 'input': 'string', 'option': false, value: ""},
                ]
            });

            function getAll(params) {
                if (ctrl.selectAllValue !== undefined || ctrl.selectAllValue !== null) {
                    ctrl.selectAllValue = false;
                    ctrl.selectedItems = {};
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'operationLogId desc';
                } else {
                    params['$orderby'] += ', operationLogId desc';
                }
                scope.params = params;
                params['$filter'] = (params['$filter'] ? params['$filter'] + ' and ' : '') + '(serviceType eq MW_LOGIN_LOGOUT)';
                return Logger.getAll(params).then(function (listData) {
                    return listData;
                });
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = (payload['$filter'] ? payload['$filter'] + ' and ' : '') + '(serviceType eq MW_LOGIN_LOGOUT)';
                return Logger.getCount(payload);
            }

            function search(params) {
                return getAll(params);
            }

            scope.openImportPanel = function (extension) {

                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve: {
                        extension: function () {
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
                        url: URI + '/operationlogs/all/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    $scope.uploader.onErrorItem = function (item, response) {
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入日志失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function () {
                        $timeout(function () {
                            $state.reload();
                        }, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入日志成功！'
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
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        return formatVal.validatePsw(psw);
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$filter'] = (p['$filter'] ? p['$filter'] + ' and ' : '') + '(serviceType eq MW_LOGIN_LOGOUT)';
                        p['$orderby'] = "operationLogId desc";
                        Logger.getAllExport(p, psw, "MW_LOGIN").then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (logData) {
                    ctrl.selectedItems[logData.operationLogId] = ctrl.selectAllValue;
                });
            };
            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (logData) {
                    if (ctrl.selectedItems[logData.operationLogId]) {
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
            scope.deleteSelected = function () {
                var selectedItems = ctrl.selectedItems;
                var logIds = [];
                if (selectedItems) {
                    for (var operationLogId in selectedItems) {
                        if (selectedItems[operationLogId]) {
                            logIds.push(operationLogId);
                        }
                    }
                }
                if (logIds.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.deleteLogPl(logIds).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志删除成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志删除失败：' + err.data) : '日志删除失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条日志'
                    });
                }
            };
            scope.markAllDeleted = function () {
                if (ctrl.table.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.clearLogPl().then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志清空成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志清空失败：' + err.data) : '日志清空失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                }
            };
        }
    }

    function logpfTab(Logger, $modal, $log, FileUploader, URI, $rootScope, $state, $timeout, $q, formatVal) {
        var logpfTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/logger/logpfTab.html',
            link: link
        };
        return logpfTabObj;

        ////////

        function link(scope, element, attr, ctrl) {
            var fields = ['user', 'user_ip', 'operationName'];
            ctrl.setConfig({
                name: 'log',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                //getAllExport: getAllExport,
                getCount: getCount,
                search: search,
                fields: fields,
//                    dateTimeRange: 'timestamp',
                advancedSearch: 'logs',
                advancedSearchOptions: [

                    {
                        'name': 'timestamp',
                        'display': '时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'user_ip', 'display': 'IP', 'input': 'string', 'option': false, value: ""},
                    {'name': 'user', 'display': '用户', 'input': 'string', 'option': false, value: ""},
                    {'name': 'operationName', 'display': '内容', 'input': 'string', 'option': false, value: ""},
                ]
            });

            function getAll(params) {
                if (ctrl.selectAllValue !== undefined || ctrl.selectAllValue !== null) {
                    ctrl.selectAllValue = false;
                    ctrl.selectedItems = {};
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'operationLogId desc';
                } else {
                    params['$orderby'] += ', operationLogId desc';
                }
                scope.params = params;
                params['$filter'] = (params['$filter'] ? params['$filter'] + ' and ' : '') + '(serviceType eq MW)';
                return Logger.getAll(params).then(function (listData) {
                    return listData;
                });
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = (payload['$filter'] ? payload['$filter'] + ' and ' : '') + '(serviceType eq MW)';
                return Logger.getCount(payload);
            }

            function search(params) {
                return getAll(params);
            }

            scope.openImportPanel = function (extension) {

                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve: {
                        extension: function () {
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
                        url: URI + '/operationlogs/all/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    //console.log($scope.uploader);
                    $scope.uploader.onErrorItem = function (item, response) {
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入日志失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function () {
                        $timeout(function () {
                            $state.reload();
                        }, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入日志成功！'
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
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        return formatVal.validatePsw(psw);
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$filter'] = (p['$filter'] ? p['$filter'] + ' and ' : '') + '((serviceType eq MW) or (serviceType eq DPILOG))';
                        p['$orderby'] = "operationLogId desc";
                        Logger.getAllExport(p, psw, "MW_OPER").then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            // function getAllExport(params) {
            //     if (!params['$orderby'] || params['$orderby'] === '') {
            //         params['$orderby'] = 'timestamp desc';
            //     }
            //     params['$filter'] = (params['$filter'] ? params['$filter'] + ' and ' : '') + '((serviceType eq MW) or (serviceType eq DPILOG))';
            //     return Logger.getAllExport(params);
            // }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (logData) {
                    ctrl.selectedItems[logData.operationLogId] = ctrl.selectAllValue;
                });
            };
            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (logData) {
                    if (ctrl.selectedItems[logData.operationLogId]) {
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
            scope.deleteSelected = function () {
                var selectedItems = ctrl.selectedItems;
                var logIds = [];
                if (selectedItems) {
                    for (var operationLogId in selectedItems) {
                        if (selectedItems[operationLogId]) {
                            logIds.push(operationLogId);
                        }
                    }
                }
                if (logIds.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.deleteLogPl(logIds).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志删除成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志删除失败：' + err.data) : '日志删除失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条日志'
                    });
                }
            };
            scope.markAllDeleted = function () {
                if (ctrl.table.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.clearLogPf().then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志清空成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志清空失败：' + err.data) : '日志清空失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                }
            };
        }
    }

    function logdlTab(Logger, $modal, $log, FileUploader, URI, $rootScope, $state, $timeout, $q, formatVal) {
        var logdlTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/logger/logdlTab.html',
            link: link
        };
        return logdlTabObj;

        ////////

        function link(scope, element, attr, ctrl) {
            var fields = ['user', 'user_ip', 'login_result', 'reason', 'boxId'];
            ctrl.setConfig({
                name: 'log',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                //getAllExport: getAllExport,
                getCount: getCount,
                search: search,
                fields: fields,
                //                    dateTimeRange: 'timestamp',
                advancedSearch: 'DpiUserCmd',
                advancedSearchOptions: [

                    {
                        'name': 'timestamp',
                        'display': '时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'user_ip', 'display': 'IP', 'input': 'string', 'option': false, value: ""},
                    {'name': 'user', 'display': '用户', 'input': 'string', 'option': false, value: ""},
                    {'name': 'login_result', 'display': '登录状态', 'input': 'string', 'option': false, value: ""},
                    {'name': 'reason', 'display': '原因', 'input': 'string', 'option': false, value: ""},
                    {'name': 'boxId', 'display': '序列号', 'input': 'string', 'option': false, value: ""},
                ]
            });

            function getAll(params) {
                if (ctrl.selectAllValue !== undefined || ctrl.selectAllValue !== null) {
                    ctrl.selectAllValue = false;
                    ctrl.selectedItems = {};
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'timestamp desc, user';
                } else {
                    params['$orderby'] += ', timestamp desc, user';
                }
                scope.params = params;
                return Logger.getDPILogs(params, 'DpiUserLogin').then(function (listData) {
                    return listData;
                });
            }

            function getCount(params) {
                var payload = params || {};
                return Logger.getDPILogCount(payload, 'DpiUserLogin');
            }

            function search(params) {
                return getAll(params);
            }

            scope.openImportPanel = function (extension) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve: {
                        extension: function () {
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
                        url: URI + '/operationlogs/type/DpiUserLogin/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    //console.log($scope.uploader);
                    $scope.uploader.onErrorItem = function (item, response) {
                        console.log(response);
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入日志失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function () {
                        $timeout(function () {
                            $state.reload();
                        }, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入日志成功！'
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
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        return formatVal.validatePsw(psw);
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$orderby'] = "dpiUserLoginId desc";
                        Logger.getDPILogsExport(p, 'DpiUserLogin', psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
            // function getAllExport(params) {
            //     if (!params['$orderby'] || params['$orderby'] === '') {
            //         params['$orderby'] = 'timestamp desc';
            //     }
            //     return Logger.getDPILogsExport(params, 'DpiUserLogin').then(function (data) {
            //         return data;
            //     });
            // }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (logData) {
                    ctrl.selectedItems[logData.dpiUserLoginId] = ctrl.selectAllValue;
                });
            };
            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (logData) {
                    if (ctrl.selectedItems[logData.dpiUserLoginId]) {
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
            scope.deleteSelected = function () {
                var selectedItems = ctrl.selectedItems;
                var logIds = [];
                if (selectedItems) {
                    for (var dpiUserLoginId in selectedItems) {
                        if (selectedItems[dpiUserLoginId]) {
                            logIds.push(dpiUserLoginId);
                        }
                    }
                }
                if (logIds.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.deleteLogDl(logIds).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志删除成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志删除失败：' + err.data) : '日志删除失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条日志'
                    });
                }
            };
            scope.markAllDeleted = function () {
                if (ctrl.table.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.clearLogDl().then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志清空成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志清空失败：' + err.data) : '日志清空失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                }
            };

        }
    }

    function logdcTab(Logger, $modal, $log, FileUploader, URI, $rootScope, $state, $timeout, $q, formatVal) {
        var logdcTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/logger/logdcTab.html',
            link: link
        };
        return logdcTabObj;

        ////////

        function link(scope, element, attr, ctrl) {
            var fields = ['user', 'user_ip', 'cmd', 'cmd_result', 'boxId'];
            ctrl.setConfig({
                name: 'log',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                //getAllExport: getAllExport,
                getCount: getCount,
                search: search,
                fields: fields,
                //                    dateTimeRange: 'timestamp',
                advancedSearch: 'DpiUserCmd',
                advancedSearchOptions: [

                    {
                        'name': 'timestamp',
                        'display': '时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'user_ip', 'display': 'IP', 'input': 'string', 'option': false, value: ""},
                    {'name': 'user', 'display': '用户', 'input': 'string', 'option': false, value: ""},
                    {'name': 'cmd', 'display': '输入命令', 'input': 'string', 'option': false, value: ""},
                    {'name': 'cmd_result', 'display': '执行结果', 'input': 'string', 'option': false, value: ""},
                    {'name': 'boxId', 'display': '序列号', 'input': 'string', 'option': false, value: ""},
                ]
            });

            function getAll(params) {
                if (ctrl.selectAllValue !== undefined || ctrl.selectAllValue !== null) {
                    ctrl.selectAllValue = false;
                    ctrl.selectedItems = {};
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'timestamp desc, cmd, boxId';
                } else {
                    params['$orderby'] += ', timestamp desc, cmd, boxId';
                }
                scope.params = params;
                return Logger.getDPILogs(params, 'DpiUserCmdLog').then(function (listData) {
                    return listData;
                });
            }

            function getCount(params) {
                var payload = params || {};
                return Logger.getDPILogCount(payload, 'DpiUserCmdLog');
            }

            function search(params) {
                return getAll(params);
            }

            scope.openImportPanel = function (extension) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve: {
                        extension: function () {
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
                        url: URI + '/operationlogs/type/DpiUserCmdLog/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    //console.log($scope.uploader);
                    $scope.uploader.onErrorItem = function (item, response) {
                        console.log(response);
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入日志失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function () {
                        $timeout(function () {
                            $state.reload();
                        }, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入日志成功！'
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
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        return formatVal.validatePsw(psw);
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$orderby'] = "dpiUserCmdLogId desc";
                        Logger.getDPILogsExport(p, 'DpiUserCmdLog', psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            // function getAllExport(params) {
            //     if (!params['$orderby'] || params['$orderby'] === '') {
            //         params['$orderby'] = 'timestamp desc';
            //     }
            //     return Logger.getDPILogsExport(params, 'DpiUserCmdLog').then(function (data) {
            //         return data;
            //     });
            // }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (logData) {
                    ctrl.selectedItems[logData.dpiUserCmdLogId] = ctrl.selectAllValue;
                });
            };
            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (logData) {
                    if (ctrl.selectedItems[logData.dpiUserCmdLogId]) {
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
            scope.deleteSelected = function () {
                var selectedItems = ctrl.selectedItems;
                var logIds = [];
                if (selectedItems) {
                    for (var dpiUserCmdLogId in selectedItems) {
                        if (selectedItems[dpiUserCmdLogId]) {
                            logIds.push(dpiUserCmdLogId);
                        }
                    }
                }
                if (logIds.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.deleteLogDc(logIds).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志删除成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志删除失败：' + err.data) : '日志删除失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条日志'
                    });
                }
            };

            scope.markAllDeleted = function () {
                if (ctrl.table.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.clearLogDc().then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志清空成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志清空失败：' + err.data) : '日志清空失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                }
            };
        }
    }

    function logdfTab(Logger, $modal, $log, FileUploader, URI, $rootScope, $state, $timeout, $q, formatVal) {
        var logdfTabObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/logger/logdfTab.html',
            link: link
        };
        return logdfTabObj;

        ////////

        function link(scope, element, attr, ctrl) {
            var fields = ['sourceIp', 'sourceMac', 'sourcePort', 'destinationIp', 'destinationMac', 'destinationPort', 'ipVersion', 'protocolTypeName', 'result', 'policyName'];
            ctrl.setConfig({
                name: 'log',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                //getAllExport: getAllExport,
                getCount: getCount,
                search: search,
                fields: fields,
//                    dateTimeRange: 'timestamp',
                advancedSearch: 'DpiUserCmd',
                advancedSearchOptions: [

                    {
                        'name': 'packetTimestamp',
                        'display': '时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'sourceIp', 'display': '源IP地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'sourceMac', 'display': '源MAC地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'sourcePort', 'display': '源端口', 'input': 'string', 'option': false, value: ""},
                    {'name': 'destinationIp', 'display': '目标IP地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'destinationMac', 'display': '目标MAC地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'destinationPort', 'display': '目标端口', 'input': 'string', 'option': false, value: ""},
                    {'name': 'ipVersion', 'display': 'IP版本', 'input': 'string', 'option': false, value: ""},
                    {'name': 'protocolTypeName', 'display': '协议类型', 'input': 'string', 'option': false, value: ""},
                    {'name': 'result', 'display': '动作', 'input': 'string', 'option': false, value: ""},
                    {'name': 'policyName', 'display': '策略', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function getAll(params) {
                if (ctrl.selectAllValue !== undefined || ctrl.selectAllValue !== null) {
                    ctrl.selectAllValue = false;
                    ctrl.selectedItems = {};
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'fwFlowdataId desc';
                }
                scope.params = params;
                return Logger.getDPILogs(params, 'DpifwPacketAccounting').then(function (listData) {
                    return listData;
                });
            }

            function getCount(params) {
                var payload = params || {};
                return Logger.getDPILogCount(payload, 'DpifwPacketAccounting');
            }

            function search(params) {
                return getAll(params);
            }

            scope.openImportPanel = function (extension) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve: {
                        extension: function () {
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
                        url: URI + '/operationlogs/type/DpifwPacketAccounting/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    $scope.uploader.onErrorItem = function (item, response) {
                        console.log(response);
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入日志失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function () {
                        $timeout(function () {
                            $state.reload();
                        }, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入日志成功！'
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
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        return formatVal.validatePsw(psw);
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        p['$orderby'] = "fwFlowdataId desc";
                        Logger.getDPILogsExport(p, 'DpifwPacketAccounting', psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            // function getAllExport(params) {
            //     if (!params['$orderby'] || params['$orderby'] === '') {
            //         params['$orderby'] = 'packetTimestamp desc';
            //     }
            //     return Logger.getDPILogsExport(params, 'DpifwPacketAccounting').then(function (data) {
            //         return data;
            //     });
            // }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (logData) {
                    ctrl.selectedItems[logData.fwFlowdataId] = ctrl.selectAllValue;
                });
            };
            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (logData) {
                    if (ctrl.selectedItems[logData.fwFlowdataId]) {
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
            scope.deleteSelected = function () {
                var selectedItems = ctrl.selectedItems;
                var logIds = [];
                if (selectedItems) {
                    for (var fwFlowdataId in selectedItems) {
                        if (selectedItems[fwFlowdataId]) {
                            logIds.push(fwFlowdataId);
                        }
                    }
                }
                if (logIds.length !== 0) {
                    var deferred = $q.defer();
                    ctrl.deletePromise = deferred.promise;
                    Logger.deleteLogDf(logIds).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志删除成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志删除失败：' + err.data) : '日志删除失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条日志'
                    });
                }
            };
            scope.markAllDeleted = function () {
                if (ctrl.table.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.clearLogDf().then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志清空成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志清空失败：' + err.data) : '日志清空失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                }
            };
        }
    }

    function eventTable($modal, Event, Logger, $log, FileUploader, URI, $rootScope, $state, $timeout, $q, formatVal) {
        var eventTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/monitor/event/eventTable.html',
            link: link
        };

        return eventTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var selectArr = [];
            var fields = ['sourceName', 'content'];
            var eventTypes = [
                {text: '所有日志类型', value: '-1'},
                {text: '设备状态', value: 'DPI_ON_OFF'},
                {text: '接口状态', value: 'IF_UP_DOWN'},
                //{text: '内存警告', value: 'MEM_WARNING'},
                //{text: '磁盘警告', value: 'DISK_WARNING'},
                //{text: '温度警告', value: 'TEMPERATURE_WARNING'},
                //{text: 'NTP同步', value: 'NTP_SYNC'},
                {text: 'BYPASS', value: 'DPI_BYPASS'},
                //{text: '流量警告', value: 'TRAFFIC_UP_DOWN'},
                {text: 'RAID状态', value: 'RAID_STATUS'},
                {text: '系统自检测', value: 'SYSTEM_CHECK'},
                {text: '开机自检', value: 'SELFTEST_RESULT'},
                {text: '分区告警', value: 'PARTITION_WARNING'},
                {text: '关键进程', value: 'SYS_EVENT'},
                {text: '平台系统事件', value: 'MW_EVENT'}
            ];

            ctrl.searchBar = function (query) {
                ctrl.query = query;
                ctrl.currentPage = 1;
                ctrl.getTableData();
            };

            ctrl.doAdvancedSearch = function () {
                ctrl.query = '';
                ctrl.advancedSearchApply();
                ctrl.isSearching = ctrl.advancedSearchQuery;
            };

            ctrl.setConfig({
                name: 'log',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                predicate: 'eventId',
                reverse: true,
//                    dateTimeRange: 'timestamp',
                advancedSearch: 'events',
                advancedSearchOptions: [
                    {
                        'name': 'timestamp',
                        'display': '时间',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {
                        'name': 'level',
                        'display': '日志等级',
                        'input': 'checkbox',
                        'option': true,
                        value: -1,
                        'options': [{'value': '-1', 'text': '信息和警告'}, {'value': 'WARN', 'text': '警告'}, {
                            'value': 'INFO',
                            'text': '信息'
                        }]
                    },
                    {
                        'name': 'sysEventType',
                        'display': '日志类型',
                        'input': 'checkbox',
                        'option': true,
                        value: -1,
                        'options': eventTypes
                    },
                    {'name': 'sourceName', 'display': '设备', 'input': 'string', 'option': false, value: ""},
                    {'name': 'content', 'display': '内容', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function getAll(params) {
                if (ctrl.selectAllValue !== undefined || ctrl.selectAllValue !== null) {
                    ctrl.selectAllValue = false;
                    ctrl.selectedItems = {};
                }
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'eventId desc';
                }
                scope.params = params;
                var payload = params || {};
                payload['$filter'] = (payload['$filter'] ? payload['$filter'] + ' and ' : '') + 'level ne INFO';
                return Event.getAll(payload).then(function (data) {
                    if (selectArr.length === 0) {
                        return data;
                    }
                    var copyArr = selectArr.slice();

                    return data.map(function (ev) {
                        for (var i = 0; i < copyArr.length; i++) {
                            if (copyArr[i] === ev.eventId) {
                                ev.checkbox = true;
                                copyArr.splice(i, 1);
                                return ev;
                            }
                        }
                        return ev;
                    });
                });
            }

            function addWarnErrorToFilter(p) {
                return Event.search().then(function (data) {
                    if (data && data.length) {
                        p['$filter'] = '(' + p['$filter'];
                        for (var i = 0; i < data.length; i++) {
                            var pos = data[i].typeName.lastIndexOf('.');
                            p['$filter'] += ' or ' + data[i].typeName.slice(++pos, ++pos).toLowerCase() + data[i].typeName.slice(pos) + ' eq ' + data[i].stringValue;
                        }
                        p['$filter'] += ')';
                    }
                });
            }

            function getCount(params) {
                return addWarnErrorToFilter(params).then(function () {
                    return Event.getCount(params);
                });
            }

            function search(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'eventId desc';
                }
                return addWarnErrorToFilter(params).then(function () {
                    scope.params = params;
                    return Event.getAll(params);
                });
            }

            scope.openImportPanel = function (extension) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve: {
                        extension: function () {
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
                        url: URI + '/events/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    $scope.uploader.onErrorItem = function (item, response) {
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入系统日志失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function () {
                        $timeout(function () {
                            $state.reload();
                        }, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入系统日志成功！'
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
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';

                    $scope.validatePsw = function (psw) {
                        return formatVal.validatePsw(psw);
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        Event.getAllExport(p, psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (logData) {
                    ctrl.selectedItems[logData.eventId] = ctrl.selectAllValue;
                });
            };
            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (logData) {
                    if (ctrl.selectedItems[logData.eventId]) {
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
            scope.deleteSelected = function () {
                var selectedItems = ctrl.selectedItems;
                var logIds = [];
                if (selectedItems) {
                    for (var eventId in selectedItems) {
                        if (selectedItems[eventId]) {
                            logIds.push(eventId);
                        }
                    }
                }
                if (logIds.length !== 0) {
                    var deferred = $q.defer();
                    ctrl.deletePromise = deferred.promise;
                    Logger.deleteEvent(logIds).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志删除成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志删除失败：' + err.data) : '日志删除失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条日志'
                    });
                }
            };
            scope.markAllDeleted = function () {
                if (ctrl.table.length !== 0) {
                    var deferred = $q.defer();
                    scope.deletePromise = deferred.promise;
                    Logger.clearEvents().then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: '日志清空成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('日志清空失败：' + err.data) : '日志清空失败')
                        });
                    }).finally(function () {
                        ctrl.selectAllValue = false;
                        scope.$parent.dtable.refresh();
                    });
                }
            };
        }
    }

    function bookmarkTab() {
        var bookmarkTabObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/logger/bookmarkTab.html',
            link: link
        };
        console.log("Bookmark Directive");
        return bookmarkTabObj;

        ////////

        function link() {
            console.log("log link");
        }
    }

    function screenshotTab() {
        var screenshotTabObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/monitor/logger/screenshotTab.html',
            link: link
        };
        console.log("Screenshot Directive");
        return screenshotTabObj;

        ////////

        function link(scope, element) {
            if (typeof (scope.screenshotCanvas) !== 'undefined') {
                console.log("replacing canvas");
                var scData = scope.screenshotCanvas.toDataURL();
                //var ctx = canvas.getContext('2d');
                //ctx.scale(0.25, 0.25);
                var canvas = element.find("#sc-canvas");
                var ctx = canvas[0].getContext('2d');
                var img = new Image();
                img.onload = function () {
                    //img.style.width = "50%";
                    //img.style.height = "auto";
                    //console.log("Image here "+JSON.stringify(img.style));
                    ctx.drawImage(img, 0, 0, canvas[0].width, canvas[0].height);
                };
                img.src = scData;
            }
        }
    }
})();
