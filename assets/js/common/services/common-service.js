/**
 * sm Services
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('CommonService', commonService);

    function commonService() {
        var service = {
            mapDeviceAndNode: mapDeviceAndNode
        };
        return service;

        function mapDeviceAndNode(array, dId) {
            return _.find(array,
                function (a) {
                    return a.deviceId === dId;
                }).name;
        }
    }
})();
