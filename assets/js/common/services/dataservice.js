/**
 * Created by Morgan on 14-12-20.
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('dataservice', dataservice);

    function dataservice() {
        var date = new Date();
        var currentMonth = date.getMonth() + 1;
        var month = currentMonth < 10 ? '0' + currentMonth : currentMonth;
        var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        var name = '规则-' + date.getFullYear() + '-' + month + '-' + day + '-' + hour + ':' + minutes;
        return {'policyName': name};
    }
})();
