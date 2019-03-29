/**
 * Created by gaohui on 16-11-1.
 */

(function () {
    'use strict';

    angular
        .module('southWest.setting.security_operation')
        .controller('SecurityOperationCtrl', SecurityOperationCtrl);

    function SecurityOperationCtrl($modal, FileUploader, $rootScope, URI, apiInfo, $window, $location, $timeout, Task, $q, System) {
        var vm = this;

        /** update start **/
        //Upgrade System serial number
        System.getSerialNumber().then(function (response) {
            if (response.data.serialNumber) {
                vm.serialNumber = response.data.serialNumber;
            }
        });

        vm.uploader = new FileUploader({
            url: URI + '/files/console/uploadimage',
            autoUpload: true,
            queueLimit: 1
        });
        var uploadImageVersion = "";
        var currentImageVersion = $rootScope.VERSION_NUMBER.substr(3);

        function compareVersion(current, upload) {
            var cmp = true;
            for(var i = 0; i<upload.length; i++){
                if(current[i]>upload[i]){
                    cmp = false;
                }
            }
            return cmp;
        }

        var uploadFailReason = {
            "invalid_content_size": "升级包长度不符合规格，请重新上传。", // the size of the image less than the required length
            "invalid_algorithm": "checksum算法未找到，请重试。", // checksum algorithm not found
            "invalid_checksum_size": "checksum数值不匹配，请重新上传。", // checksum field from the file less than the checksum length of the algorithm
            "invalid_checksum": "升级包的checksum数值与checksum算法结果不匹配，请重新上传。", // the checksum value from the image file doesn't match the calculated checksum
            "invalid_meta_info": "meta信息中升级包文件路径不是合法的json数据，请重新上传。",    // meta info path of the image file is not a valid json object
            "invalid_file_format": "升级包格式错误，请重新上传。", // the last two bytes of the image file doesn't match the spec value
            "disk_full": "磁盘空间不足，请清理磁盘空间后重试。", // disk space full
            "missing_version_info": "升级包版本信息缺失，请重新上传。", // the meta data doesn't have the required image version information
            "unable_to_read_file": "无法读取升级包文件，请重新上传。", // unable to read image
            "publish_error": "升级包文件下发出错，请重试。" // unable to publish image to the repository
        };
        vm.uploader.onSuccessItem = function (item, response) {
            if (response.error) {
                vm.uploadImageFail = uploadFailReason[response.reason] ? uploadFailReason[response.reason] : '服务无反应，请查看 LCD 屏幕报错信息。';
            }
            else if (vm.uploader.queue.length < 1) {
                vm.uploadImageFail = null;
                vm.uploadImageSuccess = false;
            }
            else {
                vm.uploadImageSuccess = true;
                vm.uploadedImage = vm.uploader.queue[0].file.name;
                uploadImageVersion = vm.uploadedImage.split("-")[1];

                if(currentImageVersion===""){
                    currentImageVersion = $rootScope.VERSION_NUMBER.substr(3);
                }

                if(currentImageVersion && uploadImageVersion){
                    var curVersion = currentImageVersion.split(".");
                    var upVersion = uploadImageVersion.split(".");
                    if(curVersion.length === upVersion.length){
                        vm.uploadImageSuccess = compareVersion(curVersion, upVersion);
                        if (!vm.uploadImageSuccess) {
                            vm.uploadImageFail = '升级包版本低于当前系统版本，请重新上传。';
                        }
                    }else{
                        vm.uploadImageFail = '升级包版本命名格式错误，请重新上传。';
                    }

                }else{
                    vm.uploadImageFail = uploadFailReason.missing_version_info;
                }
            }
        };

        vm.cancelUpload = function (item) {
            item.cancel();
            vm.uploader.queue.splice(0, 1);
        };

        vm.uploader.onProgressItem = function (item) {
            apiInfo.sysbaseinfo().then(function () {
                vm.uploadImageFail = '';
            }, function () {
                if (item.isUploading) {
                    vm.uploadImageFail = '网络异常，请确认网络连接。';
                }
            });
        };

        vm.uploader.onErrorItem = function (item, response) {
            if (response.error) {
                vm.uploadImageFail = uploadFailReason[response.reason] ? uploadFailReason[response.reason] : '升级包文档格式错误或上传时发生错误，请重新上传。';
            } else {
                vm.uploadImageFail = '服务无反应，无法上传文件。';
            }
            vm.uploadedImage = vm.uploader.queue > 0 ? vm.uploader.queue[0].file.name : null;
            vm.uploadImageSuccess = false;
        };
        vm.uploader.onBeforeUploadItem = vm.uploader.onabort = function () {
            vm.uploadImageFail = null;
            vm.uploadImageSuccess = false;
        };

        //  =============================================== upgrade system section ======================================================

        vm.showUpgradeConfirmationModal = function () {
            var upgradeConfirmationModal = $modal.open({
                templateUrl: 'templates/setting/security_operation/upgrade-modal.html',
                controller: upgradeConfirmationCtrl,
                windowClass: 'upgrade-modal-window'
            });

            // TODO: REMOVE SIMULATE UPGRADE START WHEN API WORKS


            upgradeConfirmationModal.result.then(function (msg) {
                if (msg === 'confirmed') {
                    vm.confirmSystemUpgrade();
                }
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function upgradeConfirmationCtrl($scope, $modalInstance) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    $scope.upgradeStarting = true;
                    $modalInstance.close('confirmed');
                };
            }
        };

        vm.confirmSystemUpgrade = function () {
            var upgradeConfirmationModal = $modal.open({
                templateUrl: 'templates/setting/security_operation/upgrade-progress-modal.html',
                controller: upgradeModalInstanceCtrl,
                windowClass: 'upgrade-progress-modal-window',
                keyboard: false
            });

            upgradeConfirmationModal.result.then(function (msg) {
                console.log(msg);
                vm.showUpgradeResponseModal(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function upgradeModalInstanceCtrl($modalInstance, System) {
                //if (vm.isUpgrading) {
                //    $rootScope.addAlert({
                //        type: 'danger',
                //        content: '系统正在升级, 请稍后再试。'
                //    });
                //    $modalInstance.dismiss('cancel');
                //} else {
                //    upgrade_getDpiData().then(function () {
                //        if (vm.onlineDPISN.length === 0) {
                //            $rootScope.addAlert({
                //                type: 'danger',
                //                content: '没有在线设备, 无法升级。'
                //            });
                //            $modalInstance.dismiss('cancel');
                //        } else {
                System.startUpgradeAllinOne(vm.serialNumber).then(function (response) {
                    //console.log(response);
                    $timeout(function () {
                        $modalInstance.close({complete: !response.error, taskId: response.data.taskId});
                    }, 5000);
                }, function () {
                    $timeout(function () {
                        $modalInstance.close({complete: false});
                    }, 5000);
                });
                //    }
                //});
                //}
            }

        };


        vm.showUpgradeResponseModal = function (response) {
            $modal.open({
                templateUrl: 'templates/setting/security_operation/upgrade-response.html',
                controller: upgradeResponseCtrl,
                windowClass: 'upgrade-progress-modal-window',
                keyboard: false,
                resolve: {
                    upgradeInformation: function () {
                        return response;
                    }
                }
            });

            function upgradeResponseCtrl($scope, $modalInstance, upgradeInformation) {
                $scope.upgradeInformation = upgradeInformation;
                //console.log(upgradeInformation);
                if (upgradeInformation.complete) {
                    // ping MW until response is received, then refresh ui.
                    // follow taskId to get upgrading info
                    var deferred = $q.defer();
                    $rootScope.timeoutPromise = deferred.promise;
                    var successHanddler = function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '部署成功,3秒钟后自动刷新页面'
                        });
                        deferred.resolve('success');
                        $timeout(function () {
                            window.location.href = '/';
                        }, 3000);
                    };
                    var pingTask = function () {
                        Task.getTask(upgradeInformation.taskId).then(function (data) {
                            //console.log(data.data);
                            if (data.data.state !== 'PROCESSING') {
                                console.log('部署任务状态：' + data.data.state);
                                // Success, start to restart. ping till mw come back online
                                $timeout(function () {
                                    var pingMW = setInterval(function () {
                                        apiInfo.sysbaseinfo().then(function (response) {
                                            if (response.status === 200) {
                                                successHanddler();
                                                clearInterval(pingMW);
                                            }
                                        });
                                    }, 5000);
                                }, 5000);
                            } else {
                                $timeout(pingTask, 2000);
                            }
                        }, function (response) {
                            if(response.status === 401) {
                                successHanddler();
                            } else {
                                $timeout(pingTask, 2000);
                            }
                        });
                    };
                    pingTask();
                }
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        };
        /** update end **/

        /** reset start **/
        var reset = vm.reset = {};
        vm.showDisconnectModal = function () {
            vm.isShowDisconnectModal = true;
            $modal.open({
                templateUrl: 'disconnectModal.html',
                controller: disconnectModalInstanceCtrl,
                size: 'sm',
                backdrop: 'static',
                keyboard: false
            });

            function disconnectModalInstanceCtrl($scope, $modalInstance) {
                vm.hideDisconnectModal = function () {
                    vm.isShowDisconnectModal = false;
                    $modalInstance.close('done');
                };
            }
        };
        reset.resetModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/basic/reset-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, System) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    $rootScope.timeoutPromise = System.resetSystem().then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '系统会在十秒后开始恢复原厂设置。需要大约2~5分钟恢复，请稍等。。。'
                        });
                        $timeout(function () {
                            reset.redirectToMainPage();
                        }, 10000);
                    }, function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '恢复原厂设置失败。'
                        });
                    });
                    $modalInstance.close('done');
                };
            }
        };

        reset.rebootModal = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/setting/basic/restart-panel.html',
                size: 'sm',
                controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

            function ModalInstanceCtrl($scope, $modalInstance, System) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.done = function () {
                    System.restartSystem("none").then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: '系统会在十秒后开始重启。需要大约2~5分钟恢复，请稍等。。。'
                        });
                        $timeout(function () {
                            reset.redirectToMainPage();
                        }, 10000);
                    }, function () {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '系统重启失败！'
                        });
                    });
                    $modalInstance.close('done');
                };
            }
        };
        reset.redirectToMainPage = function () {
            $timeout(function () {
                apiInfo.sysbaseinfo().then(function (data) {
                    var currentTime = new Date(data.data);
                    if (!isNaN(currentTime.getDate()) && !isNaN(currentTime.getTime())) {
                        vm.isShowDisconnectModal = false;
                        $location.path("/");
                        $window.location.reload();
                    } else {
                        if (!vm.isShowDisconnectModal) {
                            vm.showDisconnectModal();
                        }
                        reset.redirectToMainPage();
                    }
                }, function () {
                    if (!vm.isShowDisconnectModal) {
                        vm.showDisconnectModal();
                    }
                    reset.redirectToMainPage();
                });
            }, 5000);
        };
        /** reset end **/
    }
})();
