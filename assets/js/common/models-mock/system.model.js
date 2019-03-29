/**
 * System Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('System', SystemModel);

    function SystemModel($resource, $http, URI, topologyId, MOCK) {
        var API = function (name) {
            return $resource(URI + '/:name', {
                name: name
            }, {
                'update': {
                    method: 'PUT'
                }
            });
        };

        var Maintenance = new API('maintenance');
        var System = new API('system');

        var service = {
            getSystemStatus: getSystemStatus,
            getMaintenance: getMaintenance,
            updateMaintenance: updateMaintenance,
            updateSyslog: updateSyslog,
            updateStorageInfo: updateStorageInfo,
            updateIPTrafficInfo: updateIPTrafficInfo,
            initConfig: initConfig,
            initSystem: initSystem,
            resetSystem: resetSystem,
            restartSystem: restartSystem,
            shutdownSystem: shutdownSystem,
            resetDevice: resetDevice,
            restartDevice: restartDevice,
            shutdownDevice: shutdownDevice,
            getStrategyInfo: getStrategyInfo,
            getJobStrategyInfo: getJobStrategyInfo,
            ipMac: ipMac,
            getRemoteIp: getRemoteIp,
            createRemoteIp: createRemoteIp,
            deleteRemoteIp: deleteRemoteIp,
            updateStradegyJobBuilder: updateStradegyJobBuilder,
            updateRemoteIp: updateRemoteIp,
            updateIPAddress: updateIPAddress,
            updateNtpSync: updateNtpSync,
            getDPIUpgradeInfo: getDPIUpgradeInfo,
            isDPIUpgrading: isDPIUpgrading,
            upgradeDPI: upgradeDPI,
            getUpgradeImageInfo: getUpgradeImageInfo,
            updateSystemConsoleInfo: updateSystemConsoleInfo,
            updateSystemConsoleAction: updateSystemConsoleAction,
            getLastUpgrade: getLastUpgrade,
            startUpgrade: startUpgrade,
            getSerialNumber: getSerialNumber
        };
        return service;

        //////////
        function getSystemStatus() {
            return $http.get(URI + '/systemsetting');
        }

        function getMaintenance() {
            return Maintenance.get().$promise;
        }

        function getStrategyInfo() {
            return $http.get(MOCK + "system/getStrategyInfo.json");
        }

        function getJobStrategyInfo(data) {
            return $http.get(URI + '/jobscheduler/jobbuilder/category/' + data);
        }

        function updateStradegyJobBuilder(param) {
            return $http.put(URI + '/jobscheduler/jobbuilder', param);
        }

        function updateSyslog(params) {
            return $http.post(URI + '/systemsetting/syslog', params).then(function (data) {
                return data.data;
            });
        }

        function updateMaintenance(params) {
            return $http.post(URI + '/systemsetting/mode', params).then(function (data) {
                return data.data;
            });
        }

        function updateIPAddress(ip) {
            var param = {"mwIp": ip};
            return $http.post(URI + '/systemsetting/mwip', param).then(function (data) {
                return data.data;
            });
        }

        function updateNtpSync(ip, flag) {
            var param = {"ntpIp": ip, "activateNtp": flag};
            return $http.post(URI + '/systemsetting/topology/' + topologyId.id + '/ntp', param).then(function (data) {
                return data.data;
            });
        }

        function updateStorageInfo(params) {
            return $http({
                url: URI + '/strategymanagement/strategyrule/ruledata',
                data: params,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function updateIPTrafficInfo(params) {
            return $http({
                url: URI + '/strategymanagement/strategyrule/ruledata',
                data: params,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function initConfig() {
            return Maintenance.update({
                status: 'init'
            }).$promise;
        }

        function initSystem() {
            return System.update().$promise;
        }

        function resetSystem(topoId) {
            return $http.post(URI + '/systemsetting/topology/' + topoId + '/factoryreset/mw', {
                flag: true
            });
        }

        function restartSystem(topoId) {
            return $http.post(URI + '/systemsetting/topology/' + topoId + '/restart/mw', {
                flag: true
            });
        }

        function shutdownSystem(topoId) {
            return $http.post(URI + '/systemsetting/topology/' + topoId + '/shutdown/mw', {
                flag: true
            });
        }

        function resetDevice(devices, topoId) {
            return $http.post(URI + '/systemsetting/topology/' + topoId + '/factoryreset/dpi', devices);
        }

        function restartDevice(devices, topoId) {
            return $http.post(URI + '/systemsetting/topology/' + topoId + '/restart/dpi', devices);
        }

        function shutdownDevice(devices, topoId) {
            return $http.post(URI + '/systemsetting/topology/' + topoId + '/shutdown/dpi', devices);
        }


        function ipMac(params) {
            return $http.post(URI + '/systemsetting/ipmac', params).then(function (data) {
                return data.data;
            });
        }

        function getRemoteIp() {
            return $http.get(URI + '/strategymanagement/strategybuilder/strategycode/IP_LOGIN_MANAGEMENT');
        }

        function createRemoteIp(data) {
            console.log(data);
            return $http({
                url: URI + '/strategymanagement/strategyrule/',
                data: data,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function deleteRemoteIp(id) {
            return $http.delete(URI + '/strategymanagement/strategyrule/' + id);
        }

        function updateRemoteIp(data) {
            //console.log(data);
            return $http({
                url: URI + '/strategymanagement/strategyrule/ruledata',
                data: data,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function getDPIUpgradeInfo() {   // qStr
            // return $http.get(URI + '/devices/upgrade?' + qStr).then(function (data){
            //     return data;
            // });
            return $http.get(MOCK + "system/getDPIUpgradeInfo.json").then(function (data) {
                return data;
            });
        }

        // function getDPIUpgradeInfo(qStr){
        //     var time = new Date();
        //     var error = false;
        //     //var num = Math.round(time.getSeconds()*100/60);
        //     var num = time.getSeconds();
        //     error = error||num%50===0;
        //     //console.log(num);

        //     return $http.get(URI + '/devices/upgrade?' + qStr).then(function (data){
        //         //console.log(data.data);
        //         return {
        //             'data':[{
        //             "upgradeImageId":"0d0ef7e0-742e-4164-a08f-0c1db1439196",
        //             "deviceId": "7a9690bd-0a07-4625-b86a-79571f9739d2",
        //             "state": 'NONE',          //NONE|COMMAND_RESOLVED|DOWNLOADING|UPGRADING,
        //             "percentage": 0,
        //             "lastUpgraded": "aaa",
        //             "lastVersion":"DPI-2.0",
        //             "error": false,         //true or false,
        //             "reason": "reason if error"


        //               // UPGRADE_COMMAND_RESOLVE,          //解析升级命令
        //               // IMAGE_DOWNLOAD,                   //解析命令完成，校验通过，IMAGE下载中
        //               // IMAGE_UPGRADING,                  //IMAGE下载完成，升级中
        //               // IMAGE_REBOOTING,                  //IMAGE升级完成，重启中
        //               // IMAGE_UPGRADE_DONE                //IMAGE升级过程完成


        //         },{
        //             "upgradeImageId":"71f999c6-ad01-45c7-8131-b51048aa8b9c",
        //             "deviceId": "6df70a3c-aea7-42e8-a0f6-ab68109a9ab8",
        //             "state": 'DOWNLOADING',          //NONE|COMMAND_RESOLVED|DOWNLOADING|UPGRADING,
        //             "percentage": num,
        //             "lastUpgraded": "aaa",
        //             "lastVersion":"DPI-2.0",
        //             "error": error,         //true or false,
        //             "reason": "reason if error"


        //               // UPGRADE_COMMAND_RESOLVE,          //解析升级命令
        //               // IMAGE_DOWNLOAD,                   //解析命令完成，校验通过，IMAGE下载中
        //               // IMAGE_UPGRADING,                  //IMAGE下载完成，升级中
        //               // IMAGE_REBOOTING,                  //IMAGE升级完成，重启中
        //               // IMAGE_UPGRADE_DONE                //IMAGE升级过程完成


        //         }]};
        //     });
        // }
        function isDPIUpgrading(deviceId) {
            // $http.get(URI + '/devices/upgrade').then(function (data) {
            $http.get(MOCK + "system/getDPIUpgradeInfo.json").then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (deviceId) {
                        if (deviceId === data[i].deviceId) {
                            return (data[i].state !== 'NONE' || (data[i].state === 'NONE' && data[i].percentage !== 0 && data[i].percentage !== 100)) && !data[i].error;
                        }
                    } else if (data[i].state !== 'NONE' || (data[i].state === 'NONE' && data[i].percentage !== 0 && data[i].percentage !== 100) && !data[i].error) {
                        return true;
                    }
                }
                return false;
            });
            // var data = [{
            //     "deviceId": "3988361e-ef08-4454-9ced-c621a0be0b76",
            //     "state": "NONE"
            // }
            //       // NONE|COMMAND_RESOLVED|DOWNLOADING|UPGRADING
            //       // UPGRADE_COMMAND_RESOLVE,          //解析升级命令
            //       // IMAGE_DOWNLOAD,                   //解析命令完成，校验通过，IMAGE下载中
            //       // IMAGE_UPGRADING,                  //IMAGE下载完成，升级中
            //       // IMAGE_REBOOTING,                  //IMAGE升级完成，重启中
            //       // IMAGE_UPGRADE_DONE                //IMAGE升级过程完成


            // ];
            // for(var i=0; i<data.length; i++){
            //     if(deviceId){
            //         if(deviceId === data[i].deviceId){
            //             return (data[i].state !== 'NONE');
            //         }
            //     }else {
            //         return (data[i].state !== 'NONE');
            //     }
            // }
            // return false;
        }

        function upgradeDPI(list) {
            return $http.post(URI + '/devices/upgrade', list);
        }

        function getUpgradeImageInfo() {
            return $http.get(URI + '/files/device/image');
        }

        function updateSystemConsoleInfo(data) {
            return $http({
                url: URI + '/strategymanagement/strategyrule/ruledata',
                data: data,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function updateSystemConsoleAction(data) {
            return $http({
                url: URI + '/strategymanagement/strategyaction/actiondata',
                data: data,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function getLastUpgrade() {
            return $http.get(URI + '/files/console/lastsuccessfulupgrade');
        }

        function startUpgrade() {
            return $http.post(URI + '/files/console/upgrade');
        }

        function getSerialNumber() {
            return $http.get(URI + '/sysbaseinfo/serialnumber');
        }

    }
})();
