/**
 * Created by Morgan on 15-02-13.
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.security_operation')
        .directive('confBackup', confBackup)
        .directive('confBackupTable', confBackupTable);

    function confBackup() {
        var obj = {
            scope: {
                target: '@'
            },
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/setting/security_operation/conf-backup.html',
            controller: controller,
            controllerAs: 'backup'
        };

        return obj;

        //////////
        function controller($state, $scope, $modal, $log, $timeout, $q, Task, FileUploader, URI, $rootScope, Device, $crypto,System) {
            "ngInject";
            var vm = this;
            vm.target = $scope.target;
            vm.disabled = 1;
            vm.handling = false;

            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };
            //
            //vm.confBackupPopup = function () {
            //    var modalInstance = $modal.open({
            //        templateUrl: 'conf-backup-collection-popup.html',
            //        size: 'sm',
            //        controller: ModalInstanceCtrl
            //    });
            //
            //    modalInstance.result.then(function () {
            //        //do nothing.
            //    }, function () {
            //        $log.info('Modal dismissed at: ' + new Date());
            //    });
            //
            //    function ModalInstanceCtrl($rootScope, $scope, $modalInstance, Device) {
            //        $scope.ok = function () {
            //            if ($scope.backupPassword != undefined && $scope.backupPassword != '') {
            //                vm.doConfBackUp($scope.backupPassword);
            //            } else {
            //                $rootScope.addAlert({
            //                    type: 'danger',
            //                    content: '请输入备份密码'
            //                });
            //            }
            //        };
            //
            //        $scope.cancel = function () {
            //            $modalInstance.dismiss('cancel');
            //        };
            //    }
            //
            //};

            vm.doConfBackUp = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'conf-backup-collection-confirmation.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($rootScope, $scope, $modalInstance, Device) {
                    $scope.validBackupPassword = false;
                    var backupPasswordPattern = /^[\w.]{8,20}$/;
                    $scope.ok = function () {
                        if ($scope.backupPassword !== undefined && $scope.backupPassword !== '') {
                            vm.handling = true;
                            var tabNm = "CONFIGURATION_BACKUP";

                            var deferred = $q.defer();
                            $rootScope.timeoutPromise = deferred.promise;

                            var removeListener = $rootScope.$on('confBakCollect', function (event, msg) {
                                if (msg.name === 'conf') {
                                    (function countdown(counter) {
                                        var checkConfBackup = $timeout(function () {
                                            Task.getTask(msg.taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    reload({tab: tabNm}).then(function () {
                                                        deferred.resolve('success');
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: (data.data.reason ? ('配置备份成功：' + data.data.reason) : '配置备份成功')
                                                        });
                                                    });
                                                    $timeout.cancel(checkConfBackup);
                                                    removeListener();
                                                } else if (data.data.state === 'FAILED') {
                                                    reload({tab: tabNm}).then(function () {
                                                        deferred.resolve('fail');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: (data.data.reason ? ('配置备份失败：' + data.data.reason) : '配置备份失败')
                                                        });
                                                    });
                                                    $timeout.cancel(checkConfBackup);
                                                    removeListener();
                                                } else if (counter > 0) {
                                                    countdown(counter - 1);
                                                } else {
                                                    $log.info('Task state was invalid.');
                                                    deferred.resolve('fail');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: ('无法获取配置备份任务结果，请联系管理员。')
                                                    });
                                                }
                                            });
                                        }, 1000);
                                    })(5);
                                }
                            });

                            var payload = {};
                            payload['infoType'] = vm.target;
                            payload['infoCollectionType'] = 'CONF_BACKUP';
                            payload['tag'] = vm.tag;
                            payload['hasPassword'] = true;
                            Device.getSecretKey().then(function (keyData) {
                                var key = keyData.data;
                                payload['password'] = btoa($crypto.encrypt($scope.backupPassword, key));
                                Device.doConfBackUp(payload, function (data, err) {
                                    $modalInstance.close();
                                    if (err) {
                                        deferred.resolve('fail');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (err ? ('配置备份失败：' + err.rejectReason) : '配置备份失败')
                                        });
                                    }
                                });
                            });



                        } else {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '请输入备份密码'
                            });
                        }


                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.validateBackupPassword = function (password) {
                        $scope.validBackupPassword = password && password.match(backupPasswordPattern);
                    };
                }
            };

            vm.openUploadPanel = function (extension) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/setting/security_operation/confirmUploadPanel.html',
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
                        url: URI + '/devices/confrestoration',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    $scope.uploader.onErrorItem = function (item, response) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '配置文件导入失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function (/*item,response*/) {
                        //$rootScope.addAlert({
                        //    type: 'success',
                        //    content: response ? response : '配置文件导入成功'
                        //});
                    };

                    $scope.ok = function () {
                        var deferred = $q.defer();
                        $rootScope.timeoutPromise = deferred.promise;

                        var removeListener = $rootScope.$on('confBakRestore', function (event, msg) {
                            if (msg.name === 'conf') {
                                (function countdown(counter) {
                                    var checkConfRestore = $timeout(function () {
                                        Task.getTask(msg.taskId).then(function (data) {
                                            if (data.data.state === 'SUCCESS') {
                                                deferred.resolve('success');
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: (data.data.reason ? ( data.data.reason) : '配置恢复成功') + ', 系统会在十秒后开始重启。请稍等。。。'
                                                });
                                                $timeout(function () {
                                                    System.restartSystem("none").then(function () {
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '系统正在重启。。。稍候请重新登陆'
                                                        });
                                                    }, function () {
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '系统重启失败！'
                                                        });
                                                    });
                                                }, 5000);
                                                $timeout.cancel(checkConfRestore);
                                                removeListener();
                                            } else if (data.data.state === 'FAILED') {
                                                deferred.resolve('fail');
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: (data.data.reason ? (data.data.reason) : '配置恢复失败')
                                                });
                                                $timeout.cancel(checkConfRestore);
                                                removeListener();
                                            } else if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $log.info('Task state was invalid.');
                                                deferred.resolve('fail');
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: ('无法获取配置恢复任务结果，请联系管理员。')
                                                });
                                            }
                                        });
                                    }, 1000);
                                })(5);
                            }
                        });

                        Device.getSecretKey().then(function (keyData) {
                            var key = keyData.data;
                            $scope.uploader.queue[0].url = URI + '/devices/confrestoration/' + btoa($crypto.encrypt($scope.backupPassword, key));
                            $scope.uploader.queue[0].upload();
                            $modalInstance.close();
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
        }
    }

    function confBackupTable($rootScope, $modal, $timeout, $log, $q, Device, Task, $crypto) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/setting/security_operation/conf-backup-table.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {
            var filter = 'infoType eq CONFIGURATION';

            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'file',
                pagination: false,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getConfBackUpFileInfos(payload);
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getConfBackUpFileInfoCount(payload);
            }

            function search(params) {
                var payload = params || {};
                payload['$filter'] = payload['$filter'] + ' and ' + filter;
                return Device.getConfBackUpFileInfos(payload);
            }

            //ctrl.selectAll = function () {
            //    ctrl.selectedItems = {};
            //    ctrl.table.map(function (file) {
            //        ctrl.selectedItems[file.backupFileInfoId] = ctrl.selectAllValue;
            //    });
            //};

            ctrl.downloadConfBackUpFiles = function (path) {
                window.open("./" + path, "_self");
            };

            ctrl.deleteConfBackUpFiles = function (selectedItems) {
                var fileIds = [];
                if (!Array.isArray(selectedItems)) {
                    for (var fileId in selectedItems) {
                        if (selectedItems[fileId]) {
                            fileIds.push(fileId);
                        }
                    }
                } else {
                    fileIds = selectedItems;
                }

                var modalInstance = $modal.open({
                    templateUrl: 'conf-backup-delete-confirmation.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl,
                    scope: scope
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, Device) {

                    $scope.ok = function () {

                        if (fileIds.length !== 0) {
                            Device.deleteConfBackUpFiles(fileIds, function (err) {
                                $modalInstance.close();
                                if (err) {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err ? ('文件删除失败：' + err) : '文件删除失败')
                                    });
                                } else {
                                    $rootScope.addAlert({
                                        type: 'success',
                                        content: '文件删除成功'
                                    });
                                    $scope.dtable.getTableData();
                                }
                            });
                        } else {
                            $rootScope.addAlert({
                                type: 'info',
                                content: '请至少选中一个文件'
                            });
                            $modalInstance.close();
                        }
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                }
            };

            ctrl.restoreConfBackUpFiles = function (confBackupFileInfoId) {

                var modalInstance = $modal.open({
                    templateUrl: 'conf-backup-restore-confirmation.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl(System, $scope, $modalInstance, Device) {

                    $scope.ok = function () {
                        if ($scope.backupPassword !== undefined && $scope.backupPassword !== '') {
                            var deferred = $q.defer();
                            $rootScope.timeoutPromise = deferred.promise;

                            var removeListener = $rootScope.$on('confBakRestore', function (event, msg) {
                                if (msg.name === 'conf') {
                                    (function countdown(counter) {
                                        var checkConfRestore = $timeout(function () {
                                            Task.getTask(msg.taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    deferred.resolve('success');
                                                    $rootScope.addAlert({
                                                        type: 'success',
                                                        content: (data.data.reason ? (data.data.reason) : '配置恢复成功') + ', 系统会在十秒后开始重启。请稍等。。。'
                                                    });
                                                    $timeout(function () {
                                                        System.restartSystem("none").then(function () {
                                                            $rootScope.addAlert({
                                                                type: 'success',
                                                                content: '系统正在重启。。。稍候请重新登陆'
                                                            });
                                                        }, function () {
                                                            $rootScope.addAlert({
                                                                type: 'danger',
                                                                content: '系统重启失败！'
                                                            });
                                                        });
                                                    }, 5000);
                                                    $timeout.cancel(checkConfRestore);
                                                    removeListener();
                                                } else if (data.data.state === 'FAILED') {
                                                    deferred.resolve('fail');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? (data.data.reason) : '配置恢复失败')
                                                    });
                                                    $timeout.cancel(checkConfRestore);
                                                    removeListener();
                                                } else if (counter > 0) {
                                                    countdown(counter - 1);
                                                } else {
                                                    $log.info('Task state was invalid.');
                                                    deferred.resolve('fail');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: ('无法获取配置恢复任务结果，请联系管理员。')
                                                    });
                                                }
                                            });
                                        }, 1000);
                                    })(5);
                                }
                            });

                            var payload = {};
                            payload['infoCollectionType'] = 'CONF_BACKUP';
                            payload['confBackupFileInfoId'] = confBackupFileInfoId;
                            payload['hasPassword'] = true;
                            Device.getSecretKey().then(function (keyData) {
                                var key = keyData.data;
                                payload['password'] = btoa($crypto.encrypt($scope.backupPassword, key));
                                Device.restoreConfBackUpFiles(payload).success(function (/*data*/) {
                                    $modalInstance.close();
                                    //$rootScope.addAlert({
                                    //    type: 'success',
                                    //    content: (data ? data : '配置恢复成功')
                                    //});
                                }).error(function (err) {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err ? (err) : '配置恢复失败')
                                    });
                                });
                            });

                        } else {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '请输入备份时设置的密码'
                            });
                        }
                    };


                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    //$scope.redirectToMainPage = function () {
                    //    $timeout(function () {
                    //        apiInfo.sysbaseinfo().then(function (data) {
                    //            var currentTime = new Date(data.data);
                    //            if (!isNaN(currentTime.getDate()) && !isNaN(currentTime.getTime())) {
                    //                vm.isShowDisconnectModal = false;
                    //                $location.path("/");
                    //                $window.location.reload();
                    //            } else {
                    //                if (!vm.isShowDisconnectModal) {
                    //                    vm.showDisconnectModal();
                    //                }
                    //                $scope.redirectToMainPage();
                    //            }
                    //        }, function () {
                    //            if (!vm.isShowDisconnectModal) {
                    //                vm.showDisconnectModal();
                    //            }
                    //            $scope.redirectToMainPage();
                    //        });
                    //    }, 5000);
                    //};
                }
            };
        }
    }


})();
