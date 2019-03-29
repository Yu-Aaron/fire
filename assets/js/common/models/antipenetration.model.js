/**
 * Created by duanrenjie on 16-10-31.
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('antiPenetration', AntiPenetrationModel);

    function AntiPenetrationModel($http, URI, $rootScope, UCD) {
        var antiurl = URI + '/antipenetration';

        var service = {
            getAntiPenetrationSetting: getAntiPenetrationSetting,
            setAntiPenetrationSetting: setAntiPenetrationSetting
        };
        return service;

        function getAntiPenetrationSetting() {
            return $http.get(UCD.getUrl($rootScope.currentIp) + antiurl + '/getAntiPenetrationSetting').then(function(data){
                return data.data;
            });
        }
        function setAntiPenetrationSetting(newantiPenetrations){
            return $http.post(UCD.getUrl($rootScope.currentIp) + antiurl + '/antiattackInfosSetting',newantiPenetrations).then(function(data){
                return data.data;
            });
        }
    }
})();

