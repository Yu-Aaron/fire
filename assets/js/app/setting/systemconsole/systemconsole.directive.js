/**
 * Created by Morgan on 15-02-13.
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.systemconsole')
        .directive('remoteIp', remoteIp)
        .directive('protocolSetting', protocolSetting)
        .directive('protocolPortSetting', protocolPortSetting)
        // .directive('dpiAutoDiscovery', dpiAutoDiscovery)
        .directive('debugInfoCollection', debugInfoCollection)
        .directive('debugInfoDpiTable', debugInfoDpiTable)
        .directive('configurationBackup', configurationBackup)
        .directive('confBackupMwTable', confBackupMwTable)
        .directive("runningModeSetting", runningModeSetting);

    function remoteIp(System, formatVal, $q) {
        var remoteIpObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/remote-ip.html',
            link: link
        };

        return remoteIpObj;

        function link(scope) {
            var vm = scope;
            vm.remoteIpData = {
                'setting': {}
            };
            getAll();
            vm.toRemove = [];
            function prepareIpList(data) {
                vm.remoteIpsSource = data;
                vm.remoteIps = angular.copy(vm.remoteIpsSource);
                for (var i = 0; i < vm.remoteIps.length; i++) {
                    var tmp = vm.remoteIps[i];
                    if (!tmp.strategyRuleName && tmp.ruleData === '0.0.0.0/0') {
                        tmp.strategyRuleName = "允许所有IP地址访问";
                    }
                    tmp.errors = false;
                }
                vm.validIp = true;
                vm.remoteIpsEnable = ((vm.remoteIps.length === 1) && (vm.remoteIps[0].ruleData === "0.0.0.0/0")) ? false : true;
            }

            function getAll() {
                return System.getRemoteIp().then(function (data) {
                    vm.remoteIpData.setting.strategyInfo = data.data.strategyInfo;
                    vm.remoteIpData.setting.strategyRules = data.data.strategyRules;
                    vm.remoteIpData.setting.strategyActions = data.data.strategyActions;
                    vm.strategyRuleSetId = vm.remoteIpData.setting.strategyInfo.strategyRuleSetId;
                    prepareIpList(vm.remoteIpData.setting.strategyRules);
                });
            }

            vm.isEditing = false;

            vm.edit = function () {
                getAll();
                vm.isEditing = true;
            };
            vm.add = function () {
                vm.remoteIps.unshift({ruleData: "", strategyRuleName: "", errors: true});
                vm.validIp = false;
            };
            vm.initialAdd = function () {
                vm.isEditing = true;
                vm.add();
            };
            vm.remove = function (index, id) {
                if (id === undefined) {
                    vm.remoteIps.splice(index, 1);
                    checkAllIp();
                    return;
                }
                vm.toRemove.push(id);
                vm.remoteIps.splice(index, 1);
                vm.isEditing = true;
            };
            vm.refresh = function () {
                vm.isEditing = false;
                getAll();
            };
            vm.closeAll = function () {
                var i;
                for (i = 0; i < vm.remoteIps.length; i++) {
                    System.deleteRemoteIp(vm.remoteIps[i].strategyRuleId);
                }
                for (i = 0; i < vm.toRemove.length; i++) {
                    System.deleteRemoteIp(vm.toRemove[i]);
                }
                var data = {
                    "strategyRuleSetId": vm.remoteIpData.setting.strategyInfo.strategyRuleSetId,
                    "strategyRuleCode": "EQ",
                    "ruleData": "0.0.0.0/0",
                    "strategyRuleName": "允许所有IP地址访问",
                    "rulePriority": 0,
                    "disabled": false,
                    "strategyRuleIdentifier": "VALID_IP"
                };
                System.createRemoteIp(data).then(function () {
                    vm.remoteIpsEnable = false;
                    vm.refresh();
                });
            };
            vm.confirm = function () {
                var promises = [];
                var i, tmp;
                for (i = 0; i < vm.remoteIps.length; i++) {
                    tmp = vm.remoteIps[i];
                    if (tmp.strategyRuleId) {
                        delete tmp.errors;
                        promises.push(System.updateRemoteIp(tmp));
                    } else {
                        var data = {
                            "strategyRuleSetId": vm.remoteIpData.setting.strategyInfo.strategyRuleSetId,
                            "strategyRuleCode": "EQ",
                            "ruleData": tmp.ruleData,
                            "strategyRuleName": tmp.strategyRuleName,
                            "rulePriority": 0,
                            "disabled": false,
                            "strategyRuleIdentifier": "VALID_IP"
                        };
                        promises.push(System.createRemoteIp(data));
                    }
                }
                for (i = 0; i < vm.toRemove.length; i++) {
                    promises.push(System.deleteRemoteIp(vm.toRemove[i]));
                }
                $q.all(promises).then(function () {
                    vm.refresh();
                });
            };
            vm.checkIp = function (ip) {
                /*var reg = ipValidation(ip.ruleData);
                 ip.errors = !reg;
                 if (!reg){
                 vm.validIp = false;
                 }else{
                 checkAllIp();
                 }*/
                vm.validIp = ip.ruleData && ip.ruleData.length > 0 && !formatVal.validateIpRange(ip.ruleData);
                ip.errors = !vm.validIp;
                if (vm.validIp) {
                    checkAllIp();
                }
            };
            /*function ipValidation(ip){
             var exp=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
             return exp.test(ip);
             }*/
            function checkAllIp() {
                for (var i = 0; i < vm.remoteIps.length; i++) {
                    var tmp = vm.remoteIps[i];
                    if (tmp.errors) {
                        vm.validIp = false;
                        return;
                    }
                }
                vm.validIp = true;
            }
        }
    }

    function protocolSetting() {
        var remoteIpObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/protocol-setting.html',
            controller: controller,
            controllerAs: 'protocolsetting'
        };

        return remoteIpObj;

        function controller($scope, $state, $rootScope, PrivateProtocol, $modal, Device, $q, $timeout, Task) {
            $scope.refresh = function () {
                $state.reload();
            };
            var vm = this;
            vm.reload = function () {
                var dataType = '';
                if ($rootScope.isC02) {
                    dataType = 'BAOXIN';
                }
                PrivateProtocol.getProtocols(dataType).then(function (data) {
                    vm.protocols = data;
                });
                PrivateProtocol.getHiddenPorts().then(function (data) {
                    vm.hiddenPorts = data;
                });
                PrivateProtocol.getProtocolSwitch().then(function (data) {
                    vm.DPprotocols = data;
                });
                PrivateProtocol.getFTPProtocols().then(function (data) {
                    vm.FTPprotocols = data;
                });
            };
            vm.reload();
            var payload = {
                '$filter': '(category eq SECURITY_DEVICE)'
            };
            Device.getAll(payload).then(function (data) {
                vm.devices = data;
            });

            vm.noErrors = true;

            //FTP 协议配置
            vm.editFTP = function () {
                vm.oldFTPprotocols = angular.copy(vm.FTPprotocols);
                vm.isEditingFTP = true;
            };
            vm.cancelFTP = function () {
                vm.FTPprotocols = vm.oldFTPprotocols;
                vm.isEditingFTP = false;
            };
            vm.confirmFTP = function () {
                PrivateProtocol.updateAllDP(vm.FTPprotocols.strategyRules[0]).then(function () {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '协议部署成功'
                    });
                    vm.isEditingFTP = false;
                });
            };
            vm.switchFTP = function (status) {
                vm.FTPprotocols.strategyRules[0].ruleData = status;
            };

            //数控审计保护协议配置
            vm.enableAllDP = function () {
                vm.DPprotocols.map(function (dpp) {
                    dpp.status = true;
                });
            };
            vm.disableAllDP = function () {
                vm.DPprotocols.map(function (dpp) {
                    dpp.status = false;
                });
            };
            vm.editDP = function () {
                vm.oldDPprotocols = angular.copy(vm.DPprotocols);
                vm.isEditingDP = true;
            };
            vm.cancelDP = function () {
                vm.DPprotocols = vm.oldDPprotocols;
                vm.isEditingDP = false;
            };
            vm.showOfflineDeviceConfirmUI = function (type) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/setting/systemconsole/protocol-deviceOffline-confirm-panel.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });
                modalInstance.result.then(function () {
                }, function () {
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.offlineDevices = [];
                    $scope.onlineDevices = [];
                    $scope.check = {
                        OfflineWarning: false
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
                            if (type === "DP") {
                                vm.cancelDP();
                            } else if (type === "PP") {
                                vm.cancelPP();
                            }
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.ok = function () {
                            if (type === "DP") {
                                vm.confirmDP();
                            } else if (type === "PP") {
                                vm.showConfirmUIPP();
                            }
                            $modalInstance.close('done');
                        };
                    });
                }
            };

            vm.confirmDP = function () {
                var i64Value = "0";
                for (var i = vm.DPprotocols.length - 1; i >= 0; i--) {
                    i64Value += (vm.DPprotocols[i].status ? 1 : 0);
                }
                i64Value = parseInt(i64Value, 2);
                var datas = {
                    icAccountingReport1: i64Value
                };

                var deferred = $q.defer();
                $rootScope.protocolDeployTaskPromise = deferred.promise;
                PrivateProtocol.setProtocolSwitch(datas).then(function (taskInfo) {
                    var taskId = taskInfo.taskId;

                    (function countdown(counter) {
                        var checkDeploy = $timeout(function () {
                            Task.getTask(taskId).then(function (data) {
                                if (data.data.state === 'SUCCESS') {
                                    $rootScope.addAlert({
                                        type: 'success',
                                        content: '协议开关下发成功'
                                    });
                                    deferred.resolve('success');
                                    $timeout.cancel(checkDeploy);
                                    vm.isEditingDP = false;
                                    vm.reload();
                                } else if (data.data.state === 'FAILED') {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (data.data.reason ? ('协议开关下发失败：' + data.data.reason) : '协议开关下发失败')
                                    });
                                    deferred.resolve('fail');
                                    $timeout.cancel(checkDeploy);
                                    vm.isEditingDP = false;
                                    vm.reload();
                                } else if (data.data.state === 'REJECTED') {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (data.data.reason ? ('协议开关下发失败：' + data.data.reason) : data.data.rejectReason ? ('协议开关下发失败：' + data.data.rejectReason) : '协议开关下发被拒绝')
                                    });
                                    deferred.resolve('fail');
                                    $timeout.cancel(checkDeploy);
                                    vm.isEditingDP = false;
                                    vm.reload();
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
                                        vm.isEditingDP = false;
                                        vm.reload();
                                    }
                                } else {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (data.data.reason ? ('协议开关下发失败：' + data.data.reason) : '协议开关下发失败')
                                    });
                                    deferred.resolve('fail');
                                    $timeout.cancel(checkDeploy);
                                    vm.isEditingDP = false;
                                    vm.reload();
                                }
                            });
                        }, 1000);
                    })(30);
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: (data.data.reason ? ('协议开关下发失败：' + data.data.reason) : data.data.rejectReason ? ('协议开关下发失败：' + data.data.rejectReason) : '协议开关下发失败')
                    });
                    deferred.resolve('fail');
                    vm.isEditingDP = false;
                    vm.reload();
                });
            };
            vm.switchDP = function (protocol, status) {
                protocol.status = status;
            };
            //设置私有协议
            vm.editPP = function () {
                vm.oldprotocols = angular.copy(vm.protocols);
                vm.isEditingPP = true;
            };

            vm.cancelPP = function () {
                vm.protocols = vm.oldprotocols;
                vm.isEditingPP = false;
            };

            vm.confirmPP = function () {
                PrivateProtocol.updateAll(vm.protocols).then(function () {
                    vm.isEditingPP = false;
                }, function (error) {
                    for (var i in vm.protocols) {
                        if (vm.protocols[i]) {
                            if (vm.protocols[i].privateProtocolId === error.privateProtocolId) {
                                if (error.info) {
                                    vm.protocols[i].message = error.info;
                                    break;
                                }
                            }
                        }
                    }
                });
            };

            vm.showConfirmUIPP = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/privateprotocol/confirm-panel.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                }, function () {
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.msg = {
                        'text': '',
                        'list': '',
                        'qus': '确定所有修改？'
                    };

                    for (var i = 0; i < vm.protocols.length; i++) {
                        if (vm.oldprotocols[i].disabled === 0 && vm.protocols[i].disabled === 1) {
                            $scope.msg.text += ($scope.msg.text) ? ('') : ('请注意，关闭已经启用的私有协议会影响到引用过此私有协议的内容，包括：学习到的与此私有协议相关行为规则；引用此私有协议的手写规则；将来此事件的处理方式等。');
                            $scope.msg.list += ($scope.msg.list) ? (vm.oldprotocols[i].protocolName + '， ') : ('以下私有协议将被关闭: ' + vm.oldprotocols[i].protocolName + '， ');
                        }
                    }

                    $scope.cancel = function () {
                        vm.cancelPP();
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.done = function () {
                        vm.confirmPP();
                        $modalInstance.close('done');
                    };
                }
            };

            vm.switchPP = function (protocol, status) {
                if (status === 0) {
                    if (protocol.protocolPort && protocol.protocolPort.toString() === "-1") {
                        protocol.protocolPort = "";
                    }
                }
                protocol.disabled = status;
                this.checkAllPorts();
            };

            vm.enableAllCustomProtocol = function (status) {
                for (var i = 0; i < vm.protocols.length; i++) {
                    var tmp = vm.protocols[i];
                    vm.switchPP(tmp, status);
                }
            };

            vm.checkAllPorts = function () {
                clearErrors();
                var hasInvalid = checkInvalidPort();
                var hasDuplicates = checkDuplicatePort();
                var hasInUse = checkInUsePort();
                vm.noErrors = hasInvalid && hasDuplicates && hasInUse;
            };

            function clearErrors() {
                for (var i in vm.protocols) {
                    if (vm.protocols[i]) {
                        vm.protocols[i].message = "";
                    }
                }
            }

            function validatePort(port) {
                var num = +port;
                return num >= 1 && num <= 65535 && port === num.toString();
            }

            function checkInvalidPort() {
                var hasInvalid = false;
                for (var i in vm.protocols) {
                    if (vm.protocols[i] && !vm.protocols[i].disabled) {
                        if (!vm.protocols[i].protocolPort || vm.protocols[i].protocolPort.length === 0) {
                            vm.protocols[i].message = "请输入端口码";
                            hasInvalid = true;
                        } else {
                            if (!validatePort(vm.protocols[i].protocolPort.toString())) {
                                vm.protocols[i].message = "请输入合法的端口码";
                                hasInvalid = true;
                            }
                        }
                    }
                }
                return !hasInvalid;
            }

            function checkDuplicatePort() {
                var hasDuplicates = false;
                var i, j, n;
                n = vm.protocols.length;
                for (i = 0; i < n; i++) {
                    if (vm.protocols[i].disabled || !vm.protocols[i].protocolPort || vm.protocols[i].protocolPort.length === 0) {
                        continue;
                    }
                    for (j = i + 1; j < n; j++) {
                        if (vm.protocols[j].disabled || !vm.protocols[j].protocolPort || vm.protocols[j].protocolPort.length === 0) {
                            continue;
                        }
                        if (vm.protocols[i].protocolPort.toString() === vm.protocols[j].protocolPort.toString()) {
                            vm.protocols[i].message = "重复";
                            vm.protocols[j].message = "重复";
                            hasDuplicates = true;
                        }
                    }
                }
                return !hasDuplicates;
            }

            function checkInUsePort() {
                var hasInUse = false;
                for (var i in vm.protocols) {
                    if (vm.protocols[i] && !vm.protocols[i].disabled) {
                        if (!vm.protocols[i].protocolPort || vm.protocols[i].protocolPort.length === 0) {
                            continue;
                        }
                        for (var j in vm.hiddenPorts) {
                            if (vm.hiddenPorts[j].toString() === vm.protocols[i].protocolPort.toString()) {
                                vm.protocols[i].message = vm.hiddenPorts[j] + "为网络端口，请输入其他端口码";
                                hasInUse = true;
                                break;
                            }
                        }
                    }
                }
                return !hasInUse;
            }

        }
    }

    function protocolPortSetting(formatVal, PrivateProtocol, $modal, Device, $rootScope, $q, $timeout, Task) {
        var obj = {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/protocol-port-setting.html',
            link: link
        };

        function link(scope) {
            scope.editMode = false;
            scope.allowConfirm = true;
            PrivateProtocol.getPrivateProtocols('DEFAULT').then(function (data) {
                scope.originalProtocolList = data;
                scope.protocolList = [];
                angular.copy(data, scope.protocolList);
            });
            PrivateProtocol.getPrivateProtocols('CUSTOM').then(function (data) {
                scope.orininalCustomProtocolList = data;
                scope.customProtocolList = [];
                angular.copy(data, scope.customProtocolList);
            });

            function checkAllEnabled(lst) {
                if (!lst) {
                    return true;
                }
                for (var i = 0; i < lst.length; i++) {
                    var tmp = lst[i];
                    if (tmp.disabled) {
                        return true;
                    }
                }
                return false;
            }

            scope.enableAll = function (lst) {
                for (var i = 0; i < lst.length; i++) {
                    var tmp = lst[i];
                    tmp.disabled = false;
                }
            };

            scope.disableAll = function (lst) {
                for (var i = 0; i < lst.length; i++) {
                    var tmp = lst[i];
                    tmp.disabled = true;
                }
            };

            scope.checkEnableAll = function (type, disabled) {
                if (disabled) {
                    if (type === 'default') {
                        scope.enableAllDefault = true;
                    } else {
                        scope.enableAllCustom = true;
                    }
                }
            };

            scope.removeAllCustom = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/setting/systemconsole/protocol-port-setting-remove-all-modal.html',
                    size: 'sm',
                    controller: removeAllModalCtrl,
                });

                modalInstance.result.then(function () {
                    scope.customProtocolList = [];
                    scope.validateAll();
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

            scope.editPorts = function () {
                scope.editMode = true;
                scope.validateAll();
                scope.enableAllDefault = checkAllEnabled(scope.protocolList);
                scope.enableAllCustom = checkAllEnabled(scope.enableAllCustom);
                angular.copy(scope.protocolList, scope.originalProtocolList);
                angular.copy(scope.customProtocolList, scope.orininalCustomProtocolList);
            };
            scope.cancel = function () {
                scope.editMode = false;
                angular.copy(scope.originalProtocolList, scope.protocolList);
                angular.copy(scope.orininalCustomProtocolList, scope.customProtocolList);
            };

            scope.validateDefaultProtocol = function (obj) {
                if (!obj.protocolPort || !formatVal.checkPortInput(obj.protocolPort)) {
                    obj.error = true;
                } else {
                    obj.error = false;
                }
            };

            scope.validateCustomProtocol = function (obj) {
                obj.nameError = !obj.protocolName || obj.protocolName === '' || !formatVal.checkProtocolName(obj.protocolName);
                obj.error = !obj.protocolPort || !formatVal.checkPortInput(obj.protocolPort);
            };

            scope.validateAll = function () {
                var i, tmp;
                for (i = 0; i < scope.protocolList.length; i++) {
                    tmp = scope.protocolList[i];
                    if (tmp.error) {
                        scope.allowConfirm = false;
                        return;
                    }
                }
                for (i = 0; i < scope.customProtocolList.length; i++) {
                    tmp = scope.customProtocolList[i];
                    if (tmp.error || tmp.nameError) {
                        scope.allowConfirm = false;
                        return;
                    }
                }
                scope.allowConfirm = true;
            };

            function concatLists() {
                var tmp;
                for (var i = scope.customProtocolList.length - 1; i >= 0; i--) {
                    tmp = scope.customProtocolList[i];
                    delete tmp.error;
                    delete tmp.nameError;
                    if (tmp.protocolName && tmp.protocolPort) {
                        scope.retList.push(scope.customProtocolList[i]);
                    }
                }
                for (var j = 0; j < scope.retList.length; j++) {
                    tmp = scope.retList[j];
                    delete tmp.error;
                }
            }

            scope.confirmUpdate = function (type) {
                scope.retList = [];
                angular.copy(scope.protocolList, scope.retList);
                concatLists();
                var modalInstance = $modal.open({
                    templateUrl: 'templates/setting/systemconsole/protocol-deviceOffline-confirm-panel.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });
                modalInstance.result.then(function () {

                    var deferred = $q.defer();
                    $rootScope.protocolDeployTaskPromise = deferred.promise;
                    PrivateProtocol.updatePrivateProtocols(scope.retList).then(function (taskInfo) {
                        var taskId = taskInfo.data.taskId;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: type + '下发成功'
                                        });
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        scope.editMode = false;
                                    } else if (data.data.state === 'FAILED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : type + '下发失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                        // vm.isEditingDP = false;
                                    } else if (data.data.state === 'REJECTED') {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : data.data.rejectReason ? (type + '下发失败：' + data.data.rejectReason) : type + '下发被拒绝')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                        // vm.isEditingDP = false;
                                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                        if (counter > 0) {
                                            countdown(counter - 1);
                                        } else {
                                            deferred.resolve('timeout');
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: type + '下发超时'
                                            });
                                            $timeout.cancel(checkDeploy);
                                            // vm.isEditingDP = false;
                                        }
                                    } else {
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : type + '下发失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                        // vm.isEditingDP = false;
                                    }
                                });
                            }, 1000);
                        })(30);
                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : data.data.rejectReason ? (type + '下发失败：' + data.data.rejectReason) : type + '下发失败')
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


            scope.addCustomProtocol = function () {
                scope.customProtocolList.push({
                    protocolName: '',
                    protocolType: 'TCP',
                    protocolPort: '',
                    dataType: 'CUSTOM',
                    disabled: true,
                    error: true,
                    nameError: true
                });
            };

            scope.validatePortObj = function (obj) {
                obj.error = !formatVal.checkPortInput(obj.protocolPort);
            };

            scope.removeCustomPort = function (index) {
                scope.customProtocolList.splice(index, 1);
            };

        }

        return obj;
    }

    function debugInfoCollection() {
        var obj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/debug-info-collection.html',
            controller: controller,
            controllerAs: 'debuginfo'
        };

        return obj;

        //////////
        function controller($state, $scope, $modal, $log, $timeout, Device, Task) {
            var vm = this;

            var payload = {};
            payload['$filter'] = 'infoType eq MW';
            Device.getDebuginfoCollection(payload).then(function (data) {
                $scope.dbgInfo = data[0];
            });

            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            vm.collectMWDebugInfo = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'debuginfo-mw-collection-confirmation.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($rootScope, $scope, $modalInstance, Device) {

                    $scope.ok = function () {
                        var tabNm = "DEBUG_INFO_COLLECTION";

                        $rootScope.mwCollecting = true;

                        var removeListener = $rootScope.$on('debuginfoCollect', function (event, msg) {
                            if (msg.name === 'mw') {
                                (function countdown(counter) {
                                    var checkInfoCollection = $timeout(function () {
                                        Task.getTask(msg.taskId).then(function (data) {
                                            if (data.data.state === 'SUCCESS') {
                                                reload({tab: tabNm}).then(function () {
                                                    $rootScope.addAlert({
                                                        type: 'success',
                                                        content: (data.data.reason ? ('信息收集成功：' + data.data.reason) : '信息收集成功')
                                                    });
                                                    $rootScope.mwCollecting = false;
                                                });
                                                $timeout.cancel(checkInfoCollection);
                                                removeListener();
                                            } else if (data.data.state === 'FAILED') {
                                                reload({tab: tabNm}).then(function () {
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('信息收集失败：' + data.data.reason) : '信息收集失败')
                                                    });
                                                    $rootScope.mwCollecting = false;
                                                });
                                                $timeout.cancel(checkInfoCollection);
                                                removeListener();
                                            } else if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $log.info('Task state was invalid.');
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: ('无法获取信息收集任务结果，请联系管理员。')
                                                });
                                                $rootScope.mwCollecting = false;
                                            }

                                        });
                                    }, 1000);
                                })(5);
                            }
                        });

                        var payload1 = {};
                        payload1['infoType'] = 'MW';
                        payload1['infoCollectionType'] = 'DEBUG';
                        Device.collectDebuginfo(payload1, function (data, err) {
                            $modalInstance.close();
                            if (err) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: (err.rejectReason ? ('信息收集失败：' + err.rejectReason) : '信息收集失败')
                                });
                                $rootScope.mwCollecting = false;
                            }
                        });

                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }

    }

    function debugInfoDpiTable($rootScope, $q, $modal, $log, $state, $timeout, Device, Topology, Enum, Task, topologyId) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/debug-info-dpi-table.html',
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
                    var payload = {};
                    payload['$filter'] = 'infoType eq DEVICE';
                    return Device.getDebuginfoCollection(payload).then(function (rst) {
                        var tmpMap = {};
                        rst.map(function (dbgInfo) {
                            tmpMap[dbgInfo.deviceId] = dbgInfo;
                        });
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
                                data[i].debuginfo = tmpMap[data[i].deviceId];
                            });
                            return setNodeConnectionStatus(data);
                        }) : [];
                    });

                });
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getCount(payload, topologyId.id);
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

            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

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

            ctrl.collectDpiDebugInfo = function (selectedItems) {
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
                    templateUrl: 'debuginfo-dpi-collection-confirmation.html',
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

                        var tabNm = "DEBUG_INFO_COLLECTION";
                        if ($rootScope.dpiCollecting !== undefined) {
                            for (var nameValue in $rootScope.dpiCollecting) {
                                if ($rootScope.dpiCollecting[nameValue] === true) {
                                    $modalInstance.close();
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '信息收集失败：另外一个任务还没有完成,请稍后再部署'
                                    });
                                    return;
                                }
                            }
                        }
                        $rootScope.dpiCollecting = {};
                        $rootScope.dpiCollectingError = {};
                        $rootScope.dpiCollectingMessage = {};
                        deviceIds.map(function (deviceId) {
                            $rootScope.dpiCollecting[deviceId] = true;
                            $rootScope.dpiCollectingError[deviceId] = false;
                            $rootScope.dpiCollectingMessage[deviceId] = '';
                        });

                        var removeListener = $rootScope.$on('debuginfoCollect', function (event, msg) {
                            if (msg.name !== 'mw') {
                                (function countdown(counter) {
                                    var checkInfoCollection = $timeout(function () {
                                        Task.getTask(msg.taskId).then(function (data) {
                                            var deviceId = msg.name;
                                            if (data.data.state === 'PROCESSING') {
                                                reload().then(function () {
                                                    $rootScope.dpiCollecting[deviceId] = false;
                                                });
                                                if (msg.exception) {
                                                    $rootScope.dpiCollectingError[deviceId] = true;
                                                    $rootScope.dpiCollectingMessage[deviceId] = msg.exception;
                                                } else {
                                                    $rootScope.dpiCollectingMessage[deviceId] = '信息收集完成';
                                                }
                                                $timeout.cancel(checkInfoCollection);
                                            } else if (data.data.state === 'SUCCESS') {
                                                reload({tab: tabNm}).then(function () {
                                                    $rootScope.addAlert({
                                                        type: 'success',
                                                        content: (data.data.reason ? ('信息收集完成：' + data.data.reason) : '信息收集完成')
                                                    });
                                                    $rootScope.dpiCollecting = {};
                                                });
                                                if (msg.exception) {
                                                    $rootScope.dpiCollectingError[deviceId] = true;
                                                    $rootScope.dpiCollectingMessage[deviceId] = msg.exception;
                                                } else {
                                                    $rootScope.dpiCollectingMessage[deviceId] = '信息收集完成';
                                                }
                                                $timeout.cancel(checkInfoCollection);
                                                removeListener();
                                            } else if (data.data.state === 'FAILED') {
                                                reload({tab: tabNm}).then(function () {
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('信息收集完成：' + data.data.reason) : '信息收集失败')
                                                    });
                                                    $rootScope.dpiCollecting = {};
                                                });
                                                if (msg.exception) {
                                                    $rootScope.dpiCollectingError[deviceId] = true;
                                                    $rootScope.dpiCollectingMessage[deviceId] = msg.exception;
                                                } else {
                                                    $rootScope.dpiCollectingMessage[deviceId] = '信息收集完成';
                                                }
                                                $timeout.cancel(checkInfoCollection);
                                                removeListener();
                                            } else if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $log.info('Task state was invalid.');
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: ('无法获取信息收集任务结果，请联系管理员。')
                                                });
                                                $rootScope.dpiCollecting = {};
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
                            payload['infoCollectionType'] = 'DEBUG';
                            Device.collectDebuginfo(payload, function (data, err) {
                                $modalInstance.close();
                                if (err) {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.rejectReason ? ('信息收集失败：' + err.rejectReason) : '信息收集失败')
                                    });
                                    $rootScope.dpiCollecting = {};
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

    function configurationBackup() {
        var obj = {
            scope: {
                target: '@'
            },
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/configuration-backup.html',
            controller: controller,
            controllerAs: 'backup'
        };

        return obj;

        //////////
        function controller($state, $scope, $modal, $log, $timeout, $q, System, Task) {
            var vm = this;
            vm.target = $scope.target;
            vm.isMW = $scope.target === 'MW';
            vm.disabled = 1;
            var getBackUpStrategyInfo = function () {
                var payload = "CONF_BACKUP_" + $scope.target;
                System.getJobStrategyInfo(payload).then(function (data) {
                    if (data.data) {
                        vm.confAutoBackUp = data.data;
                        data.data.schedulingJob.jobData === "1" ? vm.disabled = 1 : vm.disabled = 0;
                    }
                });
            };
            getBackUpStrategyInfo();

            vm.switchBackUpStrategy = function (status) {
                vm.disabled = status;
                vm.confAutoBackUp.schedulingJob.jobData = status;
                $q.all([
                    System.updateStradegyJobBuilder(vm.confAutoBackUp)
                ]).then(function () {
                    getBackUpStrategyInfo();
                });
            };

            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            vm.doConfBackUp = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'conf-backup-mw-collection-confirmation.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($rootScope, $scope, $modalInstance, Device) {

                    $scope.ok = function () {
                        var tabNm = "CONFIGURATION_BACKUP";

                        var deferred = $q.defer();
                        $rootScope.mwConfBackUpPromise = deferred.promise;

                        var removeListener = $rootScope.$on('confBakCollect', function (event, msg) {
                            if (msg.name === 'mw') {
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
                        Device.doConfBackUp(payload, function (data, err) {
                            $modalInstance.close();
                            if (err) {
                                deferred.resolve('fail');
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: (err.rejectReason ? ('配置备份失败：' + err.rejectReason) : '配置备份失败')
                                });
                            }
                        });

                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }
    }

    function confBackupMwTable($rootScope, $modal, $log, $state, Device) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/configuration-backup-mw-table.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            var filter = 'infoType eq MW';

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
                payload['$filter'] = payload['$filter'] + ' and ' + filter;
                return Device.getConfBackUpInfos(payload);
            }

            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

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
                    templateUrl: 'conf-backup-mw-delete-confirmation.html',
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

                        var tabNm = "CONFIGURATION_BACKUP";

                        if (fileIds.length !== 0) {
                            Device.deleteBackUpFiles(fileIds, function (err) {
                                $modalInstance.close();
                                if (err) {
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('文件删除失败：' + err.data) : '文件删除失败')
                                    });
                                } else {
                                    reload({tab: tabNm}).then(function () {
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

    function runningModeSetting(System, formatVal, $q) {
        var obj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/setting/systemconsole/running-mode-setting.html',
            link: link,
            controller: controller,
            controllerAs: 'runningModeSetting'
        };

        return obj;

        function link() {
        }

        function controller() {
            var vm = this;
            vm.valid = true;
            vm.isEditing = false;
            vm.editRunningMode = function () {
                vm.isEditing = true;
                vm.validate();
            };

            vm.confirmEdit = function () {
                console.log(vm.runningMode);
                var config = {
                    runningMode: vm.runningMode,
                    autoDiscovery: vm.autoDiscovery,
                    remoteMwIp: vm.autoDiscovery ? "" : vm.remoteMwIp
                };

                var promises = [];
                promises.push(System.saveRunningMode(config));
                var deferred = $q.defer();
                vm.configPromise = deferred.promise;
                $q.all(promises).finally(function () {
                    vm.loadRunningMode();
                    vm.isEditing = false;
                    vm.configPromise = null;
                });
            };

            vm.cancel = function () {
                vm.isEditing = false;
                vm.loadRunningMode();
            };

            vm.activeRunningMode = function (runningMode) {
                var valid = vm.runningModes.some(function (element) {
                    return element.mode === runningMode;
                });
                if (valid) {
                    vm.runningMode = runningMode;
                } else {
                    console.log("invalid running mode:" + runningMode);
                }
            };

            vm.isActive = function (runningMode) {
                return vm.runningMode === runningMode;
            };

            vm.loadRunningMode = function () {
                System.loadRunningMode().then(function (config) {
                    vm.runningModes = config.runningModes;
                    vm.runningMode = config.runningMode;
                    vm.autoDiscovery = config.autoDiscovery;
                    vm.remoteMwIp = config.remoteMwIp;
                });
            };

            vm.canAutoDiscovery = function () {
                return vm.runningMode === 1;
            };

            vm.canInputMwIp = function () {
                return vm.isEditing && vm.runningMode === 1 && !vm.autoDiscovery;
            };

            vm.validate = function () {
                var manualInputIp = vm.canInputMwIp();
                if (manualInputIp) {
                    if (!vm.remoteMwIp) {
                        vm.valid = false;
                    } else {
                        vm.valid = !formatVal.validateIp(vm.remoteMwIp);
                    }
                } else {
                    vm.valid = true;
                }
            };

            vm.loadRunningMode();
        }
    }

})();
