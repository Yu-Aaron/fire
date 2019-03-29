/**
 * Created by tuhuijie on 16-12-21.
 */
/**
 * SwitchSetting Model
 *
 * Description
 */
(function () {
    'use strict';

    angular.module('southWest.models').factory('SwitchModel', SwitchModel);

    function SwitchModel($http, URI) {
        var service = {
            getTrafficSwitch: getTrafficSwitch,
            setTrafficSwitch: setTrafficSwitch,
            getProtocolSwitch: getProtocolSwitch,
            setProtocolSwitch: setProtocolSwitch
        };
        return service;

        function getTrafficSwitch() {
            return $http.get(URI + '/servicesetting/trafficswitch').then(function (data) {
                return data.data;
            });
        }

        function setTrafficSwitch(data) {
            return $http.post(URI + '/servicesetting/trafficswitch', data).then(function (data) {
                return data.data;
            });
        }

        function getProtocolSwitch() {
            return $http.get(URI + '/servicesetting/protocolswitch').then(function (data) {
                return data.data;
            });
        }

        function setProtocolSwitch(data) {
            return $http.post(URI + '/servicesetting/protocolswitch', data).then(function (data) {
                return data.data;
            });
        }
    }

})();
