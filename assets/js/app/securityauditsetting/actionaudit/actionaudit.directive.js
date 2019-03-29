(function () {
    'use strict';

    angular
        .module('southWest.securityauditsetting')
        .directive('actionAudit', actionAudit);


    function actionAudit() {
        var actionAuditObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/securityauditsetting/actionaudit/index.html',
            controller: actionAuditController,
            controllerAs: 'actionAuditCtrl'
        };

        return actionAuditObj;

        function actionAuditController($scope, $rootScope, formatVal, AuditSetting, $modal, Device, $q, $timeout, Task) {
            var vm = this;
            vm.allowConfirm = true;
            $scope.editMode = false;
            AuditSetting.getAuditSetting("action").then(function (data) {
                $scope.originalActionAuditListList = data;
                $scope.actionAuditList = [];
                if ($scope.originalActionAuditListList.length === 1 && $scope.originalActionAuditListList[0].srcIp === '0.0.0.0' && $scope.originalActionAuditListList[0].destIp === '0.0.0.0') {
                    $scope.originalActionAuditListList = [];
                } else {
                    angular.copy($scope.originalActionAuditListList, $scope.actionAuditList);
                }
            });

            //行为审计配置
            vm.edit = function () {
                if ($scope.actionAuditList.length === 0) {
                    $scope.actionAuditList.push({
                        srcIp: '0.0.0.0',
                        destIp: '0.0.0.0',
                        enabled: true,
                        srcIpError: false,
                        destIpError: false
                    });
                }
                $scope.editMode = true;
            };
            vm.cancel = function () {
                $scope.editMode = false;
                angular.copy($scope.originalActionAuditListList, $scope.actionAuditList);
            };

            vm.enableAll = function (lst) {
                for (var i = 0; i < lst.length; i++) {
                    var tmp = lst[i];
                    tmp.enabled = true;
                }
            };

            vm.disableAll = function (lst) {
                for (var i = 0; i < lst.length; i++) {
                    var tmp = lst[i];
                    tmp.enabled = false;
                }
            };

            function concatLists() {
                var tmp;
                if ($scope.actionAuditList.length === 0) {
                    $scope.retList.push({srcIp: '0.0.0.0', destIp: '0.0.0.0', enabled: true});
                } else {
                    for (var i = $scope.actionAuditList.length - 1; i >= 0; i--) {
                        tmp = $scope.actionAuditList[i];
                        delete tmp.srcIpError;
                        delete tmp.destIpError;
                        delete tmp.duplicateError;
                        $scope.retList.push($scope.actionAuditList[i]);
                    }
                }
            }

            vm.confirm = function () {
                $scope.retList = [];
                concatLists();
                var modalInstance = $modal.open({
                    templateUrl: 'templates/securityauditsetting/actionaudit/actionAudit-deviceOffline-confirm-panel.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });
                modalInstance.result.then(function () {
                    var deferred = $q.defer();
                    $rootScope.actionAuditTaskPromise = deferred.promise;
                    AuditSetting.setAuditSetting($scope.retList).then(function (taskInfo) {
                        var taskId = taskInfo.data.taskId;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '行为审计配置下发成功'
                                        });
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        $scope.editMode = false;
                                    } else if (data.data.state === 'FAILED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('行为审计配置下发失败：' + data.data.reason) : '行为审计配置下发失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (data.data.state === 'REJECTED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('行为审计配置下发失败：' + data.data.reason) : data.data.rejectReason ? ('行为审计配置下发失败：' + data.data.rejectReason) : '行为审计配置下发被拒绝')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                        if (counter > 0) {
                                            countdown(counter - 1);
                                        } else {
                                            deferred.resolve('timeout');
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: '协议开关下发超时'
                                            });
                                            $timeout.cancel(checkDeploy);
                                        }
                                    } else {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('行为审计配置下发失败：' + data.data.reason) : '行为审计配置下发失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    }
                                });
                            }, 1000);
                        })(30);
                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.reason ? ('行为审计配置下发失败：' + data.data.reason) : data.data.rejectReason ? ('行为审计配置下发失败：' + data.data.rejectReason) : '行为审计配置下发失败')
                        });
                        deferred.resolve('fail');
                    });
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.offlineDevices = [];
                    $scope.onlineDevices = [];
                    $scope.check = {
                        OfflineWarning: false
                    };
                    var payload = {
                        '$filter': '(category eq SECURITY_DEVICE)'
                    };
                    Device.getAll(payload).then(function (data) {
                        data.map(function (d) {
                            if (d.deviceOnline !== 1) {
                                $scope.offlineDevices.push(d);
                            } else {
                                $scope.onlineDevices.push(d);
                            }
                        });

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.ok = function () {
                            $modalInstance.close('done');
                        };
                    });
                }
            };

            $scope.validateAuditIp = function (obj) {
                obj.srcIpError = !formatVal.checkAuditIpFormat(obj.srcIp);
                obj.destIpError = !formatVal.checkAuditIpFormat(obj.destIp);
            };

            $scope.addActionAuditCfg = function () {
                $scope.actionAuditList.push({
                    srcIp: '',
                    destIp: '',
                    enabled: true,
                    srcIpError: true,
                    destIpError: true
                });
            };

            $scope.removeCfg = function (index) {
                $scope.actionAuditList.splice(index, 1);
            };

            $scope.removeAllCfg = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/securityauditsetting/actionaudit/actionAudit-setting-remove-all-modal.html',
                    size: 'sm',
                    controller: removeAllModalCtrl
                });

                modalInstance.result.then(function () {
                    $scope.actionAuditList = [];
                    $scope.validateAll();
                });

                function removeAllModalCtrl($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.ok = function () {
                        $modalInstance.close('done');
                    };
                }
            };
            $scope.validateDuplicate = function () {
                var unionKey = {};
                jQuery.each($scope.actionAuditList, function (i, n) {
                    if (unionKey[n.srcIp + "||" + n.destIp] !== undefined) {
                        n.duplicateError = true;
                        $scope.actionAuditList[unionKey[n.srcIp + "||" + n.destIp]].duplicateError = true;
                    } else {
                        unionKey[n.srcIp + "||" + n.destIp] = i;
                        n.duplicateError = false;
                    }
                });
            };

            $scope.validateAll = function () {
                var i, tmp;
                for (i = 0; i < $scope.actionAuditList.length; i++) {
                    tmp = $scope.actionAuditList[i];
                    if (tmp.srcIpError || tmp.destIpError || tmp.duplicateError) {
                        vm.allowConfirm = false;
                        return;
                    }
                }
                vm.allowConfirm = true;
            };
        }
    }

})();
