/**
 * Created by Morgan on 14-12-30.
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter('actionName', actionName)
        .filter('riskLevel', riskLevel)
        .filter('templateSourceName', templateSourceName);


    function actionName() {
        return function (key) {
            var map = {
                'ALLOW': '允许',
                'ALERT': '警告',
                'DROP': '丢弃',
                'REJECTBOTH': '阻断'
            };
            return map[key] || key;
        };
    }

    function riskLevel() {
        return function (key) {
            var map = {
                'LOW': '低',
                'MEDIUM': '中',
                'HIGH': '高',
                'NONE': ''
            };
            return map[key] || key;
        };
    }

    function templateSourceName() {
        return function (key) {
            var map = {
                'DEFAULT': '上传',
                'SYNCHRONIZATION': '同步',
            };
            return map[key] || key;
        };
    }

})();
