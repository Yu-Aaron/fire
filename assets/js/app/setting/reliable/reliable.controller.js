/**
 * Created by tuhuijie on 16-10-24.
 */
/**
 * Reliable Controller
 */
(function(){
    'use strict';

    angular.module('southWest.setting.reliable').controller('ReliableCtrl', ReliableCtrl);

    function ReliableCtrl($rootScope, $scope, Reliable, formatVal, $q){
        var vm = this;
        //vm.settingTypeName = {"HOTSTANDBY": "双机热备", "BYPASS": "BYPASS"};
        vm.editMode = {hotStandby: false, bypass: false};

        //------------ HotStandby begin ------------
        //页面初始化加载双机热备设置
        vm.loadHotStandby = function(){
            Reliable.getHotStandby().then(function(data){
                vm.enableHotStandby = data.enableHotStandby; //启用双机热备
                vm.localHAIp = data.localHAIp; //本地HA地址
                vm.localHAPort = data.localHAPort; //本地HA端口
                vm.priority = data.priority; //优先级
                vm.remoteHAIp = data.remoteHAIp; //远端HA地址
                vm.enableLocalPrimary = data.enableLocalPrimary;

                vm.checkHotStandbySW();
            });

            vm.hotStandbyState = "运行状态: 运行正常，本地为主设备";
            Reliable.getHotStandbyState().then(function(data){
                var runningState = data.runningState;
                var mainStandbyState = data.mainStandbyState;
                if(!runningState){
                    vm.hotStandbyState = "运行状态: 双机热备未启用";
                }else if(!mainStandbyState){
                    vm.hotStandbyState = "运行状态: 运行正常，本地为备设备";
                }
            });
        };
        //vm.loadHotStandby();

        //ip地址校验
        vm.validateIp = function (ip, type) {
            var result = ip && !formatVal.validateIp(ip) && ip !== "0.0.0.0" && ip !== "255.255.255.255";
            if(type === "local"){
                vm.validLocalHAIp = result;
            }else if(type === "remote"){
                vm.validRemoteHAIp = result;
            }
        };
        //端口校验
        vm.validateLocalHAPort = function(port){
            vm.validLocalHAPort = !(isNaN(port) || port < 1024 || port > 4096);
        };
        //优先级校验
        vm.validatePriority = function(priority){
            vm.validPriority = !(isNaN(priority) || priority < 1 || priority > 255);
        };
        //检查enableHotStadby开关状态
        vm.checkHotStandbySW = function(){
            if(vm.enableHotStandby){
                vm.validateIp(vm.localHAIp, "local");
                vm.validateIp(vm.remoteHAIp, "remote");
                vm.validateLocalHAPort(vm.localHAPort);
                vm.validatePriority(vm.priority);
            }else{
                vm.validLocalHAIp = true;
                vm.validRemoteHAIp = true;
                vm.validLocalHAPort = true;
                vm.validPriority = true;
            }
        };
        //提交更新设置
        vm.updateHotStandby = function(){
            var params = {
                "enableHotStandby" : vm.enableHotStandby,
                "localHAIp" : vm.localHAIp,
                "localHAPort" : vm.localHAPort,
                "priority" : vm.priority,
                "remoteHAIp" : vm.remoteHAIp,
                "enableLocalPrimary" : vm.enableLocalPrimary
            };

            var deferred = $q.defer();
            $rootScope.timeoutPromise = deferred.promise;
            Reliable.updateHotStandby(params).then(function() {
                deferred.resolve('success');
                $rootScope.addAlert({
                    type: 'success',
                    content: '双机热备下发成功'
                });
                vm.editMode.hotStandby = false;
            }, function (data) {
                deferred.resolve('fail');
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.reason ? ('双机热备下发失败：' + data.data.reason)
                        : data.data.rejectReason ? ('双机热备下发失败：' + data.data.rejectReason)
                        : '双机热备下发失败')
                });
            });
        };
        //取消修改
        vm.cancelHotStandby = function(){
            vm.loadHotStandby();
            vm.editMode.hotStandby = !vm.editMode.hotStandby;
        };

        //---------------- HotStandby end ------------

        //--------------  Bypass begin  ----------------
        vm.loadBypass = function(){
            Reliable.getBypass().then(function(data){
                vm.bypassList = data;
                vm.bypasses = [];
                for(var i = 0; i < data.length; i++){
                    var bp = data[i];
                    vm.bypasses[i] = {};
                    vm.bypasses[i].bypassName = bp.bypassName;
                    vm.bypasses[i].appFault = bp.appFault;
                    vm.bypasses[i].powerOn = bp.powerOn;
                }
            });
        };
        vm.loadBypass();

        vm.updateBypass = function(){
            var params = vm.bypasses;

            var deferred = $q.defer();
            $rootScope.timeoutPromise = deferred.promise;
            Reliable.updateBypass(params).then(function() {
                deferred.resolve('success');
                $rootScope.addAlert({
                    type: 'success',
                    content: 'BYPASS下发成功'
                });
                vm.editMode.bypass = false;
            }, function (data) {
                deferred.resolve('fail');
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.reason ? ('BYPASS下发失败：' + data.data.reason) :
                        data.data.rejectReason ? ('BYPASS下发失败：' + data.data.rejectReason) : 'BYPASS下发失败')
                });
            });
        };
        vm.cancelBypass = function(){
            vm.loadBypass();
            vm.editMode.bypass = !vm.editMode.bypass;
        };
        //---------------   Bypass end  ----------------

    }
})();
