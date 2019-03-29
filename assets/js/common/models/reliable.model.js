/**
 * Reliable Model
 *
 * 可靠性模块Model
 */
(function(){
    'use strict';

    angular.module("southWest.models").factory('Reliable', ReliableModel);

    function ReliableModel($http, URI){
        var service = {
            getHotStandby: getHotStandby, //获取双机热备配置
            getHotStandbyState: getHotStandbyState,
            getBypass: getBypass, //获取bypass配置
            updateHotStandby: updateHotStandby, //更新双机热备配置
            updateBypass: updateBypass //更新bypass配置
        };
        return service;

        function getHotStandby(){
            return $http.get(URI + "/systemsetting/hotstandby").then(function(responseData){
                return responseData.data;
            });
        }

        function getHotStandbyState(){
            return $http.get(URI + "/systemsetting/hotstandbystate").then(function(responseData){
                return responseData.data;
            });
        }

        function updateHotStandby(params){
            return $http.post(URI + "/systemsetting/hotstandby", params).then(function(responseData){
                return responseData.data;
            });
        }

        function getBypass(){
            return $http.get(URI + "/systemsetting/bypass").then(function(responseData){
                return responseData.data;
            });
        }

        function updateBypass(params){
            return $http.post(URI + "/systemsetting/bypass", params).then(function(responseData){
                return responseData.data;
            });
        }
    }
})();
