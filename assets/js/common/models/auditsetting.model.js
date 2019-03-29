/**
 * Created by gaohui on 16-7-28.
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('AuditSetting', AuditSettingModel);

    function AuditSettingModel($q, $http, URI) {
        var url = URI + '/servicesetting';
        var service = {
            getAuditSetting: getAuditSetting,
            setAuditSetting: setAuditSetting,
            setContentAuditSetting: setContentAuditSetting
        };
        return service;

        //////////
        function getAuditSetting(auditType) {
            return $http.get(url + '/auditlog/' + auditType).then(function (data) {
                return data.data;
            });
            //return auditType;
        }

        function setAuditSetting(data) {
            return $http.post(url + '/auditlog/action', data).then(function (data) {
                return data;
            });
        }

        function setContentAuditSetting(data) {
            return $http.post(url + '/auditlog/content', data).then(function (data) {
                return data;
            });
        }

    }
})();
