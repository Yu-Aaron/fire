/**
 * System Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Basic', BasicModel);

    function BasicModel($resource, $rootScope, $http, URI) {
        var service = {
            getBasicSetting: getBasicSetting,
            updateNtpSync: updateNtpSync,
            setSystemTime: setSystemTime,
            setWorkingModeSetting: setWorkingModeSetting,
            updateSyslog: updateSyslog,
            getMWNetwork: getMWNetwork,
            updateIPAddress: updateIPAddress,
            updateRemoteProtocol: updateRemoteProtocol,
            protocolPortOccupied: protocolPortOccupied,
            getFactoryGateway: getFactoryGateway,
            restartNginx: restartNginx
        };
        return service;

        function getBasicSetting() {
            return $http.get(URI + '/systemsetting/basic');
        }

        function updateNtpSync(ip, flag) {
            var param = {"ntpIp": ip, "activateNtp": flag};
            return $http.post(URI + '/systemsetting/ntp', param).then(function (data) {
                return data.data;
            });
        }

        function setSystemTime(time) {
            var param = {'systemTime': time, "activateNtp": false};
            return $http.post(URI + '/systemsetting/systemtime', param).then(function(data){
                return data.data;
            });
        }

        //set workingMode
        function setWorkingModeSetting(params) {
            return $http.post(URI + '/systemsetting/workingmodesetting', params).then(function (data) {
                return data.data;
            });
        }

        //update syslog
        function updateSyslog(params) {
            return $http.post(URI + '/systemsetting/syslog', params);
        }

        function getMWNetwork() {
            return $http.get(URI + '/systemsetting/mwnetwork');
        }

        function updateIPAddress(hostName, ip, netMask, gateWay, preferDns, spareDns) {
            var param = {
                "mwIp": ip,
                "netMask": netMask,
                "gateWay": gateWay,
                "mwHostname": hostName,
                "preferDns": preferDns,
                "spareDns": spareDns
            };
            return $http.post(URI + '/systemsetting/mwip', param).then(function (data) {
                return data.data;
            });
        }

        function updateRemoteProtocol(strategyRules) {
            return $http.post(URI + '/systemsetting/security/remoteprotocol', strategyRules);
        }

        function protocolPortOccupied(port) {
            return $http.get(URI + '/systemsetting/security/portstate/' + port);
        }


        function getFactoryGateway() {
            return $http.get(URI + '/systemsetting/originalgateway');
        }

        function restartNginx() {
            return $http.post(URI + '/systemsetting/nginx');
        }
    }
})();
