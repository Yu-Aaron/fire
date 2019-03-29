/**
 * Session Directive
 *
 */

(function () {
    'use strict';

    angular.module("southWest.strategy.session")
        .directive("sessionControlTable", sessionControlTable);

    function sessionControlTable($rootScope, $q, $modal, $log, SessionControlModel) {
        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/strategy/session/sessionControlTable.html',
            link: link
        };
        return obj;

        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'item',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount
            });

            function getAll(params) {
                scope.params = params;
                return SessionControlModel.getAll(params);
            }

            function getCount(params) {
                return SessionControlModel.getCount(params);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (data) {
                    ctrl.selectedItems[data.sessionControlId] = ctrl.selectAllValue;
                });
            };

            ctrl.selectChanged = function () {
                var hasSelected = false;
                var selectedAll = true;
                ctrl.table.forEach(function (data) {
                    var itemSelected = ctrl.selectedItems[data.sessionControlId] !== undefined && ctrl.selectedItems[data.sessionControlId] !== false;
                    hasSelected = hasSelected || itemSelected;
                    selectedAll = selectedAll && itemSelected;
                });
                ctrl.selectAllValue = selectedAll ? true : (hasSelected ? null : false);
            };

            ctrl.openConfigWin = function (isEdit, sc) {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/strategy/session/sessionControl.html',
                    size: 'sm',
                    backdrop: 'static',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, SessionControlModel, formatVal) {
                    $scope.sessionTypeOptions = [{
                        name: '',
                        value: -1
                    }, {
                        name: '服务',
                        value: 0
                    }, {
                        name: '应用',
                        value: 1
                    }];
                    $scope.sessionControlData = {'sessionType': -1, 'serviceApp': 'any'};
                    $scope.isEdit = isEdit;
                    $scope.valid = {
                        "sourceIp": false,
                        "targetIp": false,
                        "serviceApp": false,
                        "frequency": true,
                        //"frequencyNull": true,
                        "duplicate": false,
                        "error": false,
                        "enableSave": false
                    };
                    $scope.searchService = SessionControlModel.searchService;
                    $scope.searchApp = SessionControlModel.searchApp;

                    //校验设备ip true:校验通过 false：校验失败
                    $scope.validateIp = function (ip, type) {
                        if (type === "SOURCE") {
                            $scope.valid.sourceIp = (ip.toLowerCase() === "any" || !formatVal.validateIp(ip));
                        } else if (type === "TARGET") {
                            $scope.valid.targetIp = (ip.toLowerCase() === "any" || !formatVal.validateIp(ip));
                        }
                        validate();
                    };

                    $scope.changeSessionType = function () {
                        if ($scope.sessionControlData.sessionType === -1) {
                            $scope.sessionControlData.serviceApp = "any";
                        } else {
                            $scope.sessionControlData.serviceApp = "";
                        }
                    };

                    $scope.$watch('sessionControlData.serviceApp', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            validate();
                        }
                    });

                    //校验频率上限 true:校验通过 false：校验失败
                    $scope.validateFrequency = function (frequency) {
                        if (frequency) {
                            $scope.valid.frequency = (!isNaN(frequency) && (frequency >= 10 && frequency <= 1000));
                        } else {
                            $scope.valid.frequency = true;
                        }
                        validate();
                    };

                    $scope.validateTotalUpperLimit = function (totalUpperLimit) {
                        if (totalUpperLimit) {
                            if (isNaN($scope.sessionControlData.totalUpperLimit) ||
                                $scope.sessionControlData.totalUpperLimit < 1) {
                                $scope.sessionControlData.totalUpperLimit = "";
                            }
                        }
                        validate();
                    };

                    //保存的校验规则，源ip、目标ip、服务应用3选1,并且频率上限、会话总数上限2选1
                    function validate() {
                        if ((($scope.sessionControlData.sourceIp !== "any" && $scope.sessionControlData.sourceIp !== "") ||
                            ($scope.sessionControlData.targetIp !== "any" && $scope.sessionControlData.targetIp !== "") ||
                            ($scope.sessionControlData.sessionType !== "-1" && ($scope.sessionControlData.serviceApp && $scope.sessionControlData.serviceApp !== "any"))) &&
                            (($scope.sessionControlData.frequencyUpperLimit) || ($scope.sessionControlData.totalUpperLimit)) &&
                            $scope.valid.sourceIp && $scope.valid.targetIp && $scope.valid.frequency) {
                            $scope.valid.enableSave = true;
                        } else {
                            $scope.valid.enableSave = false;
                        }
                    }

                    if (isEdit) {
                        $scope.sessionControlData = angular.copy(sc);
                        $scope.validateIp(sc.sourceIp, "SOURCE");
                        $scope.validateIp(sc.targetIp, "TARGET");
                        $scope.validateFrequency(sc.frequencyUpperLimit);
                        $scope.validateTotalUpperLimit(sc.totalUpperLimit);

                        $scope.valid.enableSave = true;
                    }

                    $scope.ok = function () {
                        $scope.valid.error = false;
                        var deferred = $q.defer();
                        $scope.configPromise = deferred.promise;
                        var params = angular.copy($scope.sessionControlData);
                        params.sourceIp = params.sourceIp.toLowerCase(); //将Any转换给小写
                        if (isEdit) {
                            SessionControlModel.editSessionControl(params).then(function () {
                                $modalInstance.close('done');
                                deferred.resolve('success');
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '会话控制修改成功'
                                });
                                ctrl.refresh();
                            }, function () {
                                deferred.resolve('fail');
                                $scope.valid.error = true;
                            });
                        } else {
                            SessionControlModel.validateSessionControl(params).then(function (data) {
                                if (data && data.code === "0") {
                                    $scope.valid.duplicate = false;
                                    SessionControlModel.addSessionControl(params).then(function () {
                                        $modalInstance.close('done');
                                        deferred.resolve('success');
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '会话控制添加成功'
                                        });
                                        ctrl.refresh();
                                    }, function () {
                                        deferred.resolve('fail');
                                        $scope.valid.error = true;
                                    });

                                } else if (data && data.code === "1") {
                                    $scope.valid.duplicate = true;
                                    deferred.resolve('fail');
                                }
                            }, function () {
                                $scope.valid.error = true;
                                deferred.resolve('fail');
                            });
                        }
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
            ctrl.add = function () {
                ctrl.openConfigWin(false);
            };
            ctrl.edit = function (sc) {
                ctrl.openConfigWin(true, sc);
            };

            ctrl.delete = function () {
                var selectedItems = ctrl.selectedItems;
                var sessionControls = [];
                ctrl.table.forEach(function (data) {
                    if (selectedItems[data.sessionControlId]) {
                        sessionControls.push(data);
                    }
                });

                if (sessionControls.length !== 0) {
                    var delConfirmModal = $modal.open({
                        templateUrl: '/templates/strategy/session/sessionControlDelModal.html',
                        size: 'sm',
                        controller: function ($scope, $modalInstance) {
                            $scope.cancel = function () {
                                $modalInstance.dismiss('cancel');
                            };
                            $scope.confirm = function () {
                                $modalInstance.close();
                            };
                        }
                    });
                    delConfirmModal.result.then(function () {
                        var deferred = $q.defer();
                        ctrl.deletePromise = deferred.promise;
                        SessionControlModel.delSessionControl(sessionControls).then(function () {
                            deferred.resolve('success');
                            $rootScope.addAlert({
                                type: 'success',
                                content: '会话控制删除成功'
                            });
                            //reload();
                            //ctrl.selectAllValue=false;
                            ctrl.selectedItems = {};
                            ctrl.selectChanged();
                            ctrl.refresh();
                        }, function (err) {
                            deferred.resolve('fail');
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('会话控制删除失败：' + err.data) : '会话控制删除失败')
                            });
                        });
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条会话控制'
                    });
                }
            };

            ctrl.changeSwitch = function (sessionControlData, switchType) {
                var deferred = $q.defer();
                $rootScope.timeoutPromise = deferred.promise;
                var switchTypeName = '';
                if (switchType === "LOG") {
                    switchTypeName = "日志开关";
                } else if (switchType === "UPPERLIMITWARN") {
                    switchTypeName = "超出上限警告开关";
                }
                SessionControlModel.changeSwitch(sessionControlData).then(function () {
                    deferred.resolve('success');
                    $rootScope.addAlert({
                        type: 'success',
                        content: switchTypeName + '配置成功'
                    });
                    ctrl.refresh();
                }, function (err) {
                    deferred.resolve('fail');
                    $rootScope.addAlert({
                        type: 'danger',
                        content: (err.data ? (switchTypeName + '配置失败：' + err.data) : switchTypeName + '配置失败')
                    });
                    ctrl.refresh();
                });
            };
        }

    }

})();
