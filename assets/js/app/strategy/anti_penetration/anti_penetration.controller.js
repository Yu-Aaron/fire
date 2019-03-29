/**
 * Created by duanrenjie on 16-10-28.
 */
(function () {
    'use strict';

    angular.module('southWest.strategy.anti_penetration')
        .controller('antiPenetrationCtrl', antiPenetrationCtrl);
    function antiPenetrationCtrl($rootScope, antiPenetration, Task, $timeout, $q) {
        var vm = this;
        vm.dos = false;
        vm.dosid = "";
        vm.scanning = false;
        vm.scanningid = "";
        vm.editMode = false;
        vm.isShowTimeWarn = false;
        vm.isDisabledTimeText = false;
        vm.antiPenetrations = [];
        antiPenetration.getAntiPenetrationSetting().then(function (data) {
            vm.antiPenetrations = data;
            vm.antiPenetrations.map(function(onedata){
                if(onedata.attackValue==="0"){
                    onedata.attackValue="";
                }
            });
            vm.oldantiPenetrations = angular.copy(vm.antiPenetrations);
            data.forEach(function (oneAnti) {
                if (oneAnti.attackType === 0) {
                    vm.dos = oneAnti.g_switch;
                    vm.dosid = 'dos' + oneAnti.attackType;
                } else {
                    vm.scanning = oneAnti.g_switch;
                    vm.scanningid = 'scanning' + oneAnti.attackType;
                }
            });
        });

        vm.editChangeMode = function () {
            vm.editMode = !vm.editMode;
            var ed = false;
            vm.antiPenetrations.map(function (newanti) {
                if (newanti.attackType === 1 && newanti.enable) {
                    ed = true;
                }
            });

            if(vm.scanning && vm.editMode && ed){
                vm.isDisabledTimeText = true;
            }
        };

        //重构AntiPenetrations
        vm.changeAntiPenetrations = function (antiAttackId, g_switch, attackValue, enable) {
            vm.setEnable = false;
            if (antiAttackId.toString().indexOf('dos') >= 0) {
                vm.antiPenetrations.map(function (newanti) {
                    if (newanti.attackType === 0) {
                        newanti.g_switch = g_switch;
                    }
                });
            } else if (antiAttackId.toString().indexOf('scanning') >= 0) {
                vm.antiPenetrations.map(function (newanti) {
                    if (newanti.attackType === 1) {
                        newanti.g_switch = g_switch;
                    }
                });
            } else {
                vm.antiPenetrations.map(function (newanti) {
                    if (newanti.antiAttackId === antiAttackId) {
                        newanti.g_switch = g_switch;
                        if (!enable && newanti.documentType !== 2) {
                            newanti.attackValue = "";
                        } else {
                            newanti.attackValue = attackValue;
                        }
                        newanti.enable = enable;
                    }
                });
            }
            var a = false;
            var b = false;
            vm.antiPenetrations.map(function (newanti) {
                if (newanti.enable && newanti.attackType === 1 && newanti.documentType === 1) {
                    vm.antiPenetrations.map(function (anti) {
                        if (anti.attackType === 1 && anti.documentType === 2 && (!anti.attackValue || !vm.isNormalInteger(anti.attackValue) || anti.attackValue<=59)) {
                            vm.intervalErrorMessage = ' 请在秒数区域输入大于等60的整数数字';
                            b = true;
                        }
                    });
                    a = true;
                }
            });
            vm.isDisabledTimeText = a;
            vm.isShowTimeWarn = b;
            vm.antiPenetrations.map(function (anti) {
                if (anti.attackType === 1 && anti.documentType === 2 && anti.attackValue && !vm.isDisabledTimeText) {
                    anti.attackValue = "";
                }
                if ((anti.documentType === 1 && anti.enable && (!vm.isNormalInteger(anti.attackValue) || anti.attackValue<10)) || vm.isShowTimeWarn) {
                    vm.setEnable = true;
                }
            });
        };

        vm.checkAttackValue = function (enable,attackValue){
          if(enable && vm.editMode && (!vm.isNormalInteger(attackValue) || attackValue<10)){
              return true;
          }
          return false;
        };
        vm.isNormalInteger = function (str) {
            var n = ~~Number(str);
            return n===parseFloat(str);
        };

        vm.setAntiPenetrations = function () {
            var deferred = $q.defer();
            var type = "抗攻击配置";
            $rootScope.antiPenetrationDeployTaskPromise = deferred.promise;
            antiPenetration.setAntiPenetrationSetting(vm.antiPenetrations).then(function (taskInfo) {
                //var taskId = taskInfo.taskId;
                if(taskInfo.state==="SUCCESS"){
                    $rootScope.addAlert({
                        type: 'success',
                        content: type + '下发成功'
                    });
                    deferred.resolve('success');
                    antiPenetration.getAntiPenetrationSetting().then(function (data) {
                        vm.antiPenetrations = data;
                        vm.antiPenetrations.map(function(onedata){
                            if(onedata.attackValue==="0"){
                                onedata.attackValue="";
                            }
                        });
                        vm.oldantiPenetrations = angular.copy(vm.antiPenetrations);
                        data.forEach(function (oneAnti) {
                            if (oneAnti.attackType === 0) {
                                vm.dos = oneAnti.g_switch;
                                vm.dosid = 'dos' + oneAnti.attackType;
                            } else {
                                vm.scanning = oneAnti.g_switch;
                                vm.scanningid = 'scanning' + oneAnti.attackType;
                            }
                        });
                    });
                    vm.editMode = false;
                }
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : data.data.rejectReason ? (type + '下发失败：' + data.data.rejectReason) : type + '下发失败')
                });
                deferred.resolve('fail');
            });
        };
        vm.cancelAntiPenetrations = function () {
            vm.antiPenetrations = angular.copy(vm.oldantiPenetrations);
            vm.antiPenetrations.forEach(function (oneAnti) {
                if (oneAnti.attackType === 0) {
                    vm.dos = oneAnti.g_switch;
                    vm.dosid = 'dos' + oneAnti.attackType;
                } else {
                    vm.scanning = oneAnti.g_switch;
                    vm.scanningid = 'scanning' + oneAnti.attackType;
                }
            });
            vm.editMode = !vm.editMode;
            vm.isShowTimeWarn = false;
            vm.isDisabledTimeText = false;
        };
        /*vm.processResponse = function (deferred, taskId, type, counter) {
            counter = counter ? counter : 30;
            var checkDeploy = $timeout(function () {
                Task.getTask(taskId).then(function (data) {
                    if (data.data.state === 'SUCCESS') {
                        $rootScope.addAlert({
                            type: 'success',
                            content: type + '下发成功'
                        });
                        deferred.resolve('success');
                        $timeout.cancel(checkDeploy);
                        antiPenetration.getAntiPenetrationSetting().then(function (data) {
                            vm.antiPenetrations = data;
                            vm.antiPenetrations.map(function(onedata){
                                if(onedata.attackValue==="0"){
                                    onedata.attackValue="";
                                }
                            });
                            vm.oldantiPenetrations = angular.copy(vm.antiPenetrations);
                            data.forEach(function (oneAnti) {
                                if (oneAnti.attackType === 0) {
                                    vm.dos = oneAnti.g_switch;
                                    vm.dosid = 'dos' + oneAnti.attackType;
                                } else {
                                    vm.scanning = oneAnti.g_switch;
                                    vm.scanningid = 'scanning' + oneAnti.attackType;
                                }
                            });
                        });
                        vm.editMode = false;
                    } else if (data.data.state === 'FAILED') {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : type + '下发失败')
                        });
                        deferred.resolve('fail');
                        $timeout.cancel(checkDeploy);
                    } else if (data.data.state === 'REJECTED') {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : data.data.rejectReason ? (type + '下发失败：' + data.data.rejectReason) : type + '下发被拒绝')
                        });
                        deferred.resolve('fail');
                        $timeout.cancel(checkDeploy);
                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                        if (counter > 0) {
                            vm.processResponse(counter - 1);
                        } else {
                            deferred.resolve('timeout');
                            $rootScope.addAlert({
                                type: 'danger',
                                content: type + '下发超时'
                            });
                            $timeout.cancel(checkDeploy);
                        }
                    } else {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.reason ? (type + '下发失败：' + data.data.reason) : type + '下发失败')
                        });
                        deferred.resolve('fail');
                        $timeout.cancel(checkDeploy);
                    }
                });
            }, 1000);
        };*/
    }
})();
