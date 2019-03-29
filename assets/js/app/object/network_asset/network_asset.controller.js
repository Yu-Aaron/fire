/**
 * Object Network assets Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.object.network_asset')
        .controller('IpPoolCtrl', IpPoolCtrl)
        .controller('SecurityAreaCtrl', SecurityAreaCtrl)
        .controller('DeviceAssetCtrl', DeviceAssetCtrl);

    function IpPoolCtrl() {
        //nothing to do
    }

    function SecurityAreaCtrl(){
        //nothing to do
    }

    function DeviceAssetCtrl($rootScope, $q, $timeout, Task, DeviceAsset) {
        var vm = this;
//        vm.ippool = null;
        vm.securityarea = null;

        vm.quickTransferTo = function(selectedItems, dtable){
            var itemNames = [];
            var secNames = [];
            var assetIds = [];
            if (selectedItems) {
                for (var name in selectedItems) {
                    if (selectedItems[name]) {
                        // dtable.table.forEach(function (asset) {
                        for (var i = 0; i < dtable.table.length; i++) {
                            if (dtable.table[i].name === name) {
                                secNames.push(dtable.table[i].securityAreaName);
                                assetIds.push(dtable.table[i].assetId);
                            }
                        }
                        // });
                        itemNames.push(name);
                    }
                }
            }

            if (itemNames.length !== 0) {
                if(!vm.securityarea){
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请指定想要转至的安全区域'
                    });
                    return;
                }

                var params = {
                    assetNames: itemNames.join(','),
                    secNames:secNames.join(','),
                    assetIds:assetIds.join(','),
//                    ippool: vm.ippool,
                    securityarea: vm.securityarea
                };

                var deferred = $q.defer();
                $rootScope.dvcAssetTask.promise = deferred.promise;
                $rootScope.dvcAssetTask.message = '设备资产转换中，请稍侯...';
                DeviceAsset.quickTransferTo(params).then(function(taskInfo, err) {
                    if (err) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('设备资产转换失败：' + err.data) : '设备资产转换失败')
                        });
                        deferred.resolve('fail');
                    } else {
                        var taskId = taskInfo.taskId;
                        (function countdown(counter) {
                            var checkTimeout = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        dtable.getTableData();
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '设备资产转换成功'
                                        });
                                        deferred.resolve('success');
                                        $timeout.cancel(checkTimeout);
                                    } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('设备资产转换失败：' + data.data.reason) : '设备资产转换失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkTimeout);
                                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                        if (counter > 0) {
                                            countdown(counter - 1);
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: '设备资产转换超时'
                                            });
                                            deferred.resolve('timeout');
                                            $timeout.cancel(checkTimeout);
                                        }
                                    } else {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('设备资产转换失败：' + data.data.reason) : '设备资产转换失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkTimeout);
                                    }
                                });
                            }, 1000);
                        })(30);
                    }
                });
            } else {
                $rootScope.addAlert({
                    type: 'info',
                    content: '请至少选中一条设备资产'
                });
            }

        };
    }
})();
