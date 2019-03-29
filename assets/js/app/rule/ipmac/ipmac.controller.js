/**
 * rule Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.ipmac')
        .controller('IPMACCtrl', IPMACCtrl);

    function IPMACCtrl($scope, $log, $modal, Device, System, Signature, $rootScope, Task, $q, $state, DeviceAsset) {
        var vm = this;
        vm.binding = 'on';
        vm.rule = 'alert';
        vm.log = 'on';
        vm.show = {
            ip: [],
            mac: []
        };
        vm.validIP = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
        vm.validMAC = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;
        vm.isEditing = false;

        vm.ipmac = {};
        vm.unknownDeviceAction = "DROP";
        vm.array = [];
        vm.isDPIUpgrading = System.isDPIUpgrading();

        $rootScope.$on('dpiUpgradeState', function () {
            vm.isDPIUpgrading = System.isDPIUpgrading();
        });
        $rootScope.$on('refreshRuleCurrentIp', function () {
            $state.reload();
        });

        $scope.$watch(function () {
            vm.switchStatus = ($scope.dtable ? $scope.dtable.enableIpmac : false) || vm.enabledUnknowDeviceMonite || vm.enableArpAntiDeception;
        });

/*        vm.editRight = Enum.get('privilege').filter(function (a) {
            return a.name === 'IP_MAC';
        });*/
        vm.editRight = vm.editRight && vm.editRight[0] && vm.editRight[0].actionValue === 30;

        vm.getIPMACStatus = function () {
            Signature.getIPMACPolicy().then(function (data) {
                vm.ipmac = data.data;
            });
        };

        vm.getIPMACSwitch = function () {
            Signature.getIPMACSwitch().then(function (data) {
                data.data.map(function (d) {
                    if (d.subscriptionType === "IP_MAC" && d.operationStatus === 0) {
                        if(d.subscriptionName === "unknow_device_monite"){
                            vm.enabledUnknowDeviceMonite = d.subscriptionStatus !== "OFF";
                            switch(d.subscriptionStatus){
                                case "ON_REJECTBOTH":
                                    vm.unknownDeviceAction = "REJECTBOTH";
                                    break;
                                case "ON_DROP":
                                    vm.unknownDeviceAction = "DROP";
                                    break;
                                default:
                                    vm.unknownDeviceAction = "ALERT";
                                    break;
                            }
                        }
                    }else if(d.subscriptionType === "ARP_ANTIDECEPTION" && d.operationStatus === 0){
                        if(d.subscriptionName === "arp_antideception"){
                            vm.enableArpAntiDeception = d.subscriptionStatus !== "OFF";
                        }
                    }
                });
            });
        };

        vm.reload = function () {
            $rootScope.$broadcast('ipmacTableRefresh', function () {
                vm.getIPMACStatus();
                vm.getIPMACSwitch();
            });
        };

        vm.deploy = function (table) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/templates/rule/ipmac/confirmIPMAC.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    ipmac: function () {
                        return vm.ipmac;
                    },
                    table: function () {
                        return table;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        function ModalInstanceCtrl($scope, $rootScope, $modalInstance, $timeout, ipmac, table) {
            // var isUpgrading;
            // System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
            //     isUpgrading = (dpiUpgradeData.data.filter(function (a) {
            //         return (a.state !== 'NONE' || (a.state === 'NONE' && a.percentage !== 0 && a.percentage !== 100)) && !a.error;
            //     })[0]) ? true : false;
            //     $scope.check = {
            //         checkIDS: true,
            //         checkDisconnect: true
            //     };
                $scope.msg = {
                    'text': '部署新规则将会覆盖原部署规则，这个步骤无法还原。',
                    'qus': '确定部署新规则？',
                    'buttonText': '部署规则',
                    'fontAwesomeText': 'fa-cloud-download',
                    'isShowDeviceDisconnectedMsg': false,
                    'isShowDeviceDisconnectedText': '规则将无法部署以下未连线设备：',
                    'hasIDSText': '以下监测审计设备上的阻断规则会被智能替换为告警。'
                };
                /*$scope.IDSPool = [];
                $scope.deviceDisconnetedPool = [];

                $scope.securityDevicePool = Ddata.data;
                var promises = [];
                var links = [];
                promises.push(Topology.getLinks(topologyId.id, $rootScope.currentIp));
                for (var k = 0; k < Ddata.data.length; k++) {
                    if (Ddata.data[k].category === "SECURITY_DEVICE") {
                        if (Ddata.data[k].deviceOnline !== 1) {
                            $scope.msg.isShowDeviceDisconnectedMsg = true;
                            $scope.check.checkDisconnect = false;
                            $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                        } else {
                            $scope.msg.isShowDeviceConnectedCnt++;
                            promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId, $rootScope.currentIp));
                        }
                    }
                }

                $q.all(promises).then(function (results) {
                    for (var l = 0; l < results[0].data.length; l++) {
                        links.push(results[0].data[l].nodeID);
                        links.push(results[0].data[l].destinationNodeID);
                    }
                    for (var m = 1; m < results.length; m++) {
                        for (var n = 0; n < results[m].length; n++) {
                            if (results[m][n].type === 'IDS') {
                                $scope.msg.hasIDS = true;
                                $scope.check.checkIDS = false;
                                $scope.IDSPool.push(CommonService.mapDeviceAndNode($scope.securityDevicePool, results[m][n].deviceId) + results[m][n].ports.toString().replace(/,/g, "_"));
                            }
                            if ($scope.msg.hasIDS && $scope.msg.noProtocolWarning) {
                                break;
                            }
                        }
                        if ($scope.msg.hasIDS && $scope.msg.noProtocolWarning) {
                            break;
                        }
                    }
                    if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                        $scope.msg.text = "没有设备在线，无法部署规则。";
                        $scope.msg.qus = "";
                        $scope.msg.buttonText = '关闭';
                        $scope.msg.fontAwesomeText = '';
                    }
                    if ($scope.msg.isShowDeviceUpgradingMsg) {
                        $scope.msg.text = "安全设备升级中，请稍后再试。";
                        $scope.msg.qus = "";
                        $scope.msg.buttonText = '关闭';
                        $scope.msg.fontAwesomeText = '';
                    }
                    $scope.IDSPool = _.uniq($scope.IDSPool);
                });*/
            // });

           /* $scope.deploy = function () {
                // If vm.updateIP or vm.changeIPMACAction failed, just show error msg. Else, start to deploy and changeIPMACSwitch.
                var promise = [];
                // promise.push(vm.updateIP(ipmaclist));
                promise.push(vm.changeIPMACAction(table));
                $q.all(promise).then(function (boolArray) {
                    if (boolArray[0]) {
                        promise = [];
                        promise.push(Signature.deploy(ipmac.policyId));
                        var param = {};
                        param['ipMac'] = (!vm.enabledUnknowDeviceMonite) ? 'OFF' : vm.unknownDeviceAction === 'REJECT' ? 'ON_REJECTBOTH' :
                        vm.unknownDeviceAction === 'DROP'? 'ON_DROP':'ON_ALARM' ;
                        param['arpAntiDeception'] = (vm.enableArpAntiDeception) ? true:false;
                        promise.push(Signature.changeIPMACSwitch(param));
                        $q.all(promise).then(function (data) {
                            vm.isEditing = false;
                            var defer = $q.defer();
                            $rootScope.deployTaskPromise = defer.promise;
                            var taskIds = [];
                            var taskStates = [];
                            data.map(function (d) {
                                d && d.data && d.data.taskId && taskIds.push(d.data.taskId);
                                taskStates.push('pending');
                            });
                            (function countdown(counter) {
                                var checkDeploy = $timeout(function () {
                                    var taskPromise = [];
                                    for (var i = 0; i < taskIds.length; i++) {
                                        taskPromise.push(Task.getTask(taskIds[i]));
                                    }
                                    $q.all(taskPromise).then(function (data) {
                                        console.log(data);
                                        for (var j = 0; j < data.length; j++) {
                                            if (data[j].data.state === 'SUCCESS') {
                                                taskStates[j] = "success";
                                                for (var k = 0; k < taskIds.length; k++) {
                                                    taskIds[k] === data[j].data.taskId && taskIds.splice(k, 1);
                                                }
                                                if (!taskIds.length) {
                                                    // $rootScope.$broadcast('updateDashboardHeader');
                                                    $timeout.cancel(checkDeploy);
                                                    vm.ipmac.lockedType = 'DEPLOYED';
                                                    var anyFailure = taskStates.filter(function (s) {
                                                        return s !== "success";
                                                    });
                                                    if(anyFailure&&anyFailure.length===0){
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '部署成功'
                                                        });
                                                        defer.resolve('success');
                                                    }
                                                }
                                            } else if (data[j].data.state === 'FAILED') {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: (data[j].data.reason ? ('部署失败：' + data[j].data.reason) : '部署失败')
                                                });
                                                taskStates[j] = "fail";
                                                defer.resolve('fail');
                                                $timeout.cancel(checkDeploy);
                                                vm.reload();
                                            } else if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                taskStates[j] = "timeout";
                                                defer.resolve('timeout');
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '部署超时'
                                                });
                                                vm.reload();
                                            }
                                        }
                                    });
                                }, 4000);
                            })(10);
                        }, function (data) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '部署失败' + (data && data.data && data.data.rejectReason ? ('：' + data.data.rejectReason ) : '')
                            });
                            vm.isEditing = false;
                            vm.reload();
                        });
                    } else {
                        vm.isEditing = false;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: ('IP/MAC绑定处理规则部署失败')
                        });
                        vm.reload();
                    }
                });
            };*/

            $scope.deploy = function () {
                var promise = [];

                promise.push(vm.changeIPMACAction(table));
                promise.push(vm.changeIPMACSwitch());
                var defer = $q.defer();
                $rootScope.deployTaskPromise = defer.promise;
                $q.all(promise).then(function (boolArray) {
                    if (boolArray[0] && boolArray[1]) {
                        Signature.deploy(ipmac.policyId).then(function (data) {
                            vm.isEditing = false;
                            var taskId = data.data.taskId;
                            (function countdown(counter) {
                                var checkDeploy = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        console.log(data);
                                        if (data.data.state  === 'SUCCESS') {
                                            $rootScope.$broadcast('updateDashboardHeader');
                                            $timeout.cancel(checkDeploy);
                                            vm.ipmac.lockedType = 'DEPLOYED';
                                            $rootScope.addAlert({
                                                type: 'success',
                                                content: '部署成功'
                                            });
                                            defer.resolve('success');
                                        } else if (data.data.state  === 'FAILED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.reason ? ('部署失败：' + data.reason) : '部署失败')
                                            });
                                            defer.resolve('fail');
                                            $timeout.cancel(checkDeploy);
                                        } else if (counter > 0) {
                                            countdown(counter - 1);
                                        } else {
                                            defer.resolve('timeout');
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: '部署超时'
                                            });
                                            vm.reload();
                                        }
                                    });
                                }, 4000);
                            })(120);

                        }, function (data) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (data.data.rejectReason ? ('部署失败：' + data.data.rejectReason) : '部署失败')
                            });
                        });
                    }else{
                        vm.isEditing = false;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: ('IP/MAC绑定处理规则部署失败')
                        });
                        defer.resolve('fail');
                        vm.reload();
                    }
                });
            };

            $scope.ok = function () {
                // if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                //     $modalInstance.dismiss('cancel');
                // } else {
                    $scope.deploy();
                    $modalInstance.close();
                // }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }

        /*vm.editIP = function (device, index) {
            vm.show.ip[index] = true;
        };

        vm.updateIP = function (table) {
            vm.requests = [];
            for (var i = 0; i < table.length; i++) {
                vm.confirmIP(table[i], table[i].index);
            }
            return $q.all(vm.requests).then(function () {
                return true;
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '编辑MAC地址失败' + (data && data.data && data.data.error ? '：' + data.data.error : '')
                });
                return false;
            });
        };

        vm.confirmIP = function (device, index) {
            for (var i = 0; i < device.devicePorts.length; i++) {
                var IPMAC = {};
                if (device.devicePorts[i].isMgmtPort) {
                    IPMAC.mac = device.devicePorts[i].mac ? device.devicePorts[i].mac.toUpperCase() : '';
                    IPMAC.portIp = device.devicePorts[i].portIp;
                    IPMAC.portId = device.devicePorts[i].portId;
                    vm.requests.push(Device.updateMgmIpMac(device.topologyId, device.deviceId, IPMAC, 'mac'));
                }
            }
            vm.cancelIP(index);
        };

        vm.cancelIP = function (index) {
            vm.show.ip[index] = false;
        };*/

        /*vm.checkAllMacFilled = function (table) {
            for (var i = 0; i < table.length; i++) {
                var tmp = table[i];
                if (tmp.iconType === 'subnet') {
                    continue;
                }
                for (var j = 0; j < tmp.devicePorts.length; j++) {
                    var t2 = tmp.devicePorts[j];
                    if (!t2.mac) {
                        t2.invalidMac = tmp._ipmacBoolean;
                    }
                }
            }
        };*/

        vm.editIPMAC = function (table) {
            vm.isEditing = true;
            vm.tableBindingIsNotEmptyBool = false;
            for (var i = 0; i < table.length; i++) {
                if (table[i]._ipmacBoolean) {
                    vm.tableBindingIsNotEmptyBool = true;
                    break;
                }
            }
            vm.IPMACTableTmp = [];
            vm.errorPool = {
                pool: [],
                errorIndex: [],
                errorDup: [],
                bool: true
            };
            vm.oldIpmacData = angular.copy(table);
            vm.validateBindingTable(table);
        };

        vm.areaSelect = function (area) {
            if (area._ipmacBoolean) {
                for (var j = 0; j < area.assetInfos.length; j++) {
                    area.assetInfos[j]._ipmacBoolean = true;
                }
            } else {
                for (var z = 0; z < area.assetInfos.length; z++) {
                    area.assetInfos[z]._ipmacBoolean = false;
                }
            }
        };

        vm.assetSelect = function (table) {
            var count = 0;
            for (var i = 0; i < table.length; i++) {
                for(var j = 0; j< table[i].assetInfos.length; j++){
                    if(table[i].assetInfos[j]._ipmacBoolean){
                        count ++;
                    }
                }
                if(table[i].assetInfos.length>0 && table[i].assetInfos.length === count){
                    table[i]._ipmacBoolean = table[i].assetInfos[0]._ipmacBoolean;
                    count = 0;
                }
            }
        };

        vm.validateBindingTable = function (table) {
            var i;
            var count = 0;
            for (i = 0; i < table.length; i++) {
                for(var j = 0; j< table[i].assetInfos.length; j++){
                    if (!table[i].assetInfos[j]._ipmacBoolean) {
                        vm.enabledUnknowDeviceMonite = false;
                        vm.enableArpAntiDeception = false;
                        count ++;
                    }
                }
                if(table[i].assetInfos.length === count){
                    table[i]._ipmacBoolean = false;
                }
                count = 0;
            }
        };

        vm.selectAll = function (dtableCtrl, flag) {
            if (flag) {
                dtableCtrl.selectAll = true;
                for (var i = 0; i < dtableCtrl.table.length; i++) {
                    for (var j = 0; j < dtableCtrl.table[i].assetInfos.length; j++) {
                        dtableCtrl.table[i].assetInfos[j]._ipmacBoolean = true;
                        dtableCtrl.table[i].assetInfos[j]._ipmac = 1;
                    }
                    dtableCtrl.table[i]._ipmacBoolean = true;
                    dtableCtrl.table[i]._ipmac = 1;
                }
            }
        };
        vm.selectNone = function (dtableCtrl, flag) {
            if (flag) {
                dtableCtrl.selectAll = true;
                for (var i = 0; i < dtableCtrl.table.length; i++) {
                    for(var j=0; j<dtableCtrl.table[i].assetInfos.length; j++){
                        dtableCtrl.table[i].assetInfos[j]._ipmacBoolean = true;
                    }
                    dtableCtrl.table[i]._ipmacBoolean = true;
                }
            }else{
                dtableCtrl.selectAll = false;
                for (var k = 0; k < dtableCtrl.table.length; k++) {
                    for(var x=0; x<dtableCtrl.table[k].assetInfos.length; x++){
                        dtableCtrl.table[k].assetInfos[x]._ipmacBoolean = false;
                    }
                    dtableCtrl.table[k]._ipmacBoolean = false;
                }
            }
            vm.switchStatus = ! vm.switchStatus;
            dtableCtrl.enableIpmac = vm.switchStatus ? true : false;
        };


        vm.confirmEdit = function (table) {
            console.log(table);
            vm.deploy(table);
        };

        vm.cancelEdit = function () {
            vm.isEditing = false;
            vm.reload();
        };

        vm.changeIPMACSwitch = function () {
            var param = {};
            param['ipMac'] = (!vm.enabledUnknowDeviceMonite) ? 'OFF' : vm.unknownDeviceAction === 'REJECTBOTH' ? 'ON_REJECTBOTH' :
                vm.unknownDeviceAction === 'DROP'? 'ON_DROP':'ON_ALARM' ;
            param['arpAntiDeception'] = (vm.enableArpAntiDeception) ? true:false;
            return Signature.changeIPMACSwitch(param).then(function () {
                return true;
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '编辑未知设备接入监控失败' + (data && data.data && data.data.rejectReason ? '：' + data.data.rejectReason : '')
                });
                return false;
            });
        };

        vm.changeIPMACAction = function (table) {
            var param = {};
            param['ipMacAction'] = vm.ipmac.ipMacAction;
            return Signature.changeIPMACAction(param).then(function () {
                var curIpMacData = angular.copy(table);
                vm.array = [];
                for (var i = 0; i < curIpMacData.length; i++) {
                    for(var j=0; j< curIpMacData[i].assetInfos.length; j++){
                        if (curIpMacData[i].assetInfos[j]._ipmacBoolean) {
                            curIpMacData[i].assetInfos[j]._ipmac = 1;
                        } else {
                            curIpMacData[i].assetInfos[j]._ipmac = 0;
                        }
                        delete curIpMacData[i].assetInfos[j]._ipmacBoolean;
                        vm.array.push(curIpMacData[i].assetInfos[j]);
                    }
                }

                if (vm.array.length > 0) {
                    DeviceAsset.createIPMACBinding(vm.array).then(function (data) {
                        console.log(data);
                    });
                } else {
                    DeviceAsset.deleteIPMACBinding().then(function (data) {
                        console.log(data);
                    });
                    vm.tableBindingIsNotEmptyBool = false;
                }
                return true;
            });
        };

        vm.getIPMACStatus();
        vm.getIPMACSwitch();
    }
})();
