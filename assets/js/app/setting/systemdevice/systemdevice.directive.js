/**
 * Created by JinYong on 16-04-08.
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.systemdevice')
        .directive('confBackupDeviceTable', confBackupDeviceTable)
        .directive('confBackupFileTable', confBackupFileTable);

    function confBackupDeviceTable($rootScope, $q, $modal, $log, $state, $timeout, Device, Topology, Enum, Task) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/setting/systemdevice/configuration-backup-device-table.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            var filter = '(category eq SECURITY_DEVICE)';
            var fullDeviceAccess = Enum.get('Role');
            if (!fullDeviceAccess[0].defaultRole) {
                var visibleDevice = Enum.get('deviceAccess');
                if (visibleDevice.length) {
                    filter += " and (";
                    filter += visibleDevice.map(function (field) {
                        return "contains(deviceId, '" + field + "')";
                    }).join(' or ');
                    filter += ")";
                } else {
                    filter += " and (contains(deviceId, 'null'))";
                }
            }

            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'device',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAll(payload).then(function (data) {
                    var arr = data.map(function (d) {
                        return Topology.getDeviceNodes(d.deviceId);
                    });
                    return arr.length ? $q.all(arr).then(function (nodes) {
                        data.map(function (d, i) {
                            var parray = [];
                            for (var nd = 0; nd < nodes[i][0].ports.length; nd++) {
                                parray.push(+nodes[i][0].ports[nd].substr(1));
                            }
                            var p = parray.sort();
                            nodes[i][0].portRange = 'p' + p[0] + '-p' + p[p.length - 1];
                            data[i].nodes = nodes[i];
                        });
                        return setNodeConnectionStatus(data);
                    }) : [];

                });
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getCount(payload);
            }

            function search(q) {
                return Device.search('SECURITY_DEVICE', q);
            }

            function setNodeConnectionStatus(data) {
                for (var i in data) {
                    if (i && data[i].nodes) {
                        for (var j in data[i].nodes) {
                            if (j && data[i].nodes[j].ports && data[i].nodes[j].type === 'IPS' && data[i].nodes[j].online === 1) {
                                for (var k in data[i].nodes[j].ports) {
                                    if (data[i].nodes[j].online !== 1) {
                                        break;
                                    } else {
                                        if (k && data[i].nodes[j].ports[k]) {
                                            for (var l in data[i].devicePorts) {
                                                if (l && data[i].devicePorts[l].portName === data[i].nodes[j].ports[k]) {
                                                    if (data[i].devicePorts[l].linkState !== 1) {
                                                        data[i].nodes[j].online = data[i].devicePorts[l].linkState;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return data;
            }

            ctrl.isDeviceOffline = function (device) {
                return !(device.deviceOnline === 1 && device.deviceSource === 'DISCOVERY');
            };

            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.map(function (device) {
                    if (!ctrl.isDeviceOffline(device)) {
                        ctrl.selectedItems[device.deviceId] = ctrl.selectAllValue;
                    }
                });
            };

            ctrl.doConfBackUps = function (selectedItems) {
                var deviceIds = [];
                if (!Array.isArray(selectedItems)) {
                    for (var deviceId in selectedItems) {
                        if (selectedItems[deviceId]) {
                            deviceIds.push(deviceId);
                        }
                    }
                } else {
                    deviceIds = selectedItems;
                }

                var modalInstance = $modal.open({
                    templateUrl: 'configuration-backup-device-confirmation.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, Device) {

                    $scope.ok = function () {
                        if ($rootScope.dpiBackingUp !== undefined) {
                            for (var nameValue in $rootScope.dpiBackingUp) {
                                if ($rootScope.dpiBackingUp[nameValue] === true) {
                                    $modalInstance.close();
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '配置备份失败：另外一个任务还没有完成,请稍后再部署'
                                    });
                                    return;
                                }
                            }
                        }
                        $rootScope.dpiBackingUp = {};
                        $rootScope.dpiBackingUpError = {};
                        $rootScope.dpiBackingUpMessage = {};
                        deviceIds.map(function (deviceId) {
                            $rootScope.dpiBackingUp[deviceId] = true;
                            $rootScope.dpiBackingUpError[deviceId] = false;
                            $rootScope.dpiBackingUpMessage[deviceId] = '';
                        });

                        var removeListener = $rootScope.$on('confBakCollect', function (event, msg) {
                            if (msg.name !== 'mw') {
                                (function countdown(counter) {
                                    var checkConfBackup = $timeout(function () {
                                        Task.getTask(msg.taskId).then(function (data) {
                                            var deviceId = msg.name;
                                            if (data.data.state === 'PROCESSING') {
                                                $rootScope.dpiBackingUp[deviceId] = false;
                                                if (msg.exception) {
                                                    $rootScope.dpiBackingUpError[deviceId] = true;
                                                    $rootScope.dpiBackingUpMessage[deviceId] = msg.exception;
                                                } else {
                                                    $rootScope.dpiBackingUpMessage[deviceId] = '配置备份完成';
                                                }
                                                $timeout.cancel(checkConfBackup);
                                            } else if (data.data.state === 'SUCCESS') {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: (data.data.reason ? ('配置备份完成：' + data.data.reason) : '配置备份完成')
                                                });
                                                if (msg.exception) {
                                                    $rootScope.dpiBackingUpError[deviceId] = true;
                                                    $rootScope.dpiBackingUpMessage[deviceId] = msg.exception;
                                                } else {
                                                    $rootScope.dpiBackingUpMessage[deviceId] = '配置备份完成';
                                                }
                                                $rootScope.dpiBackingUp = {};
                                                $timeout.cancel(checkConfBackup);
                                                removeListener();
                                            } else if (data.data.state === 'FAILED') {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: (data.data.reason ? ('配置备份完成：' + data.data.reason) : '配置备份失败')
                                                });
                                                if (msg.exception) {
                                                    $rootScope.dpiBackingUpError[deviceId] = true;
                                                    $rootScope.dpiBackingUpMessage[deviceId] = msg.exception;
                                                } else {
                                                    $rootScope.dpiBackingUpMessage[deviceId] = '配置备份完成';
                                                }
                                                $rootScope.dpiBackingUp = {};
                                                $timeout.cancel(checkConfBackup);
                                                removeListener();
                                            } else if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $log.info('Task state was invalid.');
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: ('无法获取信息收集任务结果，请联系管理员。')
                                                });
                                                $rootScope.dpiBackingUp = {};
                                                $rootScope.dpiBackingUpError = {};
                                            }
                                        });
                                    }, 1000);
                                })(5);
                            }
                        });

                        if (deviceIds.length !== 0) {
                            var payload = {};
                            payload['infoType'] = 'DEVICE';
                            payload['deviceIds'] = deviceIds;
                            payload['infoCollectionType'] = 'CONF_BACKUP';
                            Device.collectDebuginfo(payload, function (data, err) {
                                $modalInstance.close();
                                if (err) {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.rejectReason ? ('配置备份失败：' + err.rejectReason) : '配置备份失败')
                                    });
                                    $rootScope.dpiBackingUp = {};
                                }
                            });
                        } else {
                            $rootScope.addAlert({
                                type: 'info',
                                content: '请至少选中一台设备'
                            });
                            $modalInstance.close();
                        }
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }
    }

    function confBackupFileTable($rootScope, $modal, $log, $state, Device) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/setting/systemdevice/configuration-backup-file-table.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            var filter = '(infoType eq DEVICE)';
            filter = filter.concat(" and (deviceId eq '" + attr.deviceid + "')");

            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'file',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getConfBackUpInfos(payload);
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getConfBackUpInfoCount(payload);
            }

            function search(params) {
                var payload = params || {};
                payload['$filter'] += ' and ' + filter;
                return Device.getConfBackUpInfos(payload);
            }

            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.map(function (file) {
                    ctrl.selectedItems[file.backupFileInfoId] = ctrl.selectAllValue;
                });
            };

            ctrl.deleteBackUpFiles = function (selectedItems) {
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
                    templateUrl: 'conf-backup-device-delete-confirmation.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, Device) {

                    $scope.ok = function () {

                        if (fileIds.length !== 0) {
                            Device.deleteBackUpFiles(fileIds, function (err) {
                                $modalInstance.close();
                                if (err) {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('文件删除失败：' + err.data) : '文件删除失败')
                                    });
                                } else {
                                    $state.reload().then(function () {
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '文件删除成功'
                                        });
                                    });
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
        }
    }
})();
