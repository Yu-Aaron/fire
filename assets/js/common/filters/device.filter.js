/**
 * Device Filter
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter('deviceCategoryFilter', deviceCategoryFilter)
        .filter('deviceInstallationState', deviceInstallationState)
        .filter('deviceZoneFilter', deviceZoneFilter)
        .filter('deviceMode', deviceMode)
        .filter('deviceModel', deviceModel)
        .filter('deviceConnection', deviceConnection)
        .filter('devicePortConnection', devicePortConnection)
        .filter('deviceDebugInfoResult', deviceDebugInfoResult);

    function deviceCategoryFilter() {
        return function (value) {
            var map = {
                'SECURITY_DEVICE': '安全设备',
                'FACTORY_DEVICE': '工控设备',
                'NETWORK_DEVICE': '网络设备'
            };
            return map[value] || value;
        };
    }

    function deviceInstallationState() {
        return function (value) {
            var map = {
                'INSTALLED': '已安装',
                'NOT_INSTALLED': '未安装',
                'SUGGESTED': '建议安装'
            };
            return map[value] || value;
        };
    }

    function deviceZoneFilter() {
        return function (zones) {
            if (Array.isArray(zones)) {
                var str = [];
                zones.forEach(function (zone) {
                    zone && str.push(zone.zoneName);
                });
                return str.join(', ');
            }
            return zones;
        };
    }

    function deviceMode() {
        return function (key) {
            var map = {
                'IPS': '智能保护模式',
                'IDS': '监测审计模式',
                'ROUTING_IPS': '路由保护模式'
            };
            return map[key] || key;
        };
    }

    function deviceModel() {
        return function (key) {
            if (key && key.indexOf(' / ', key.length - 3) !== -1) {
                return key.substring(0, key.length - 3);
            }
            if (key && key.indexOf(' / ') > 0) {
                var model = key.split(' / ');
                if (model[0] === model[1]) {
                    return model[0];
                }
            }
            return key;
        };
    }

    function deviceConnection() {
        return function (key) {
            var map = {
                1: '连线',
                0: '未激活',
                '-1': '掉线'
            };
            return map[key] || key;
        };
    }

    function devicePortConnection() {
        return function (key) {
            var map = {
                1: '端口连接正常',
                0: '未知',
                '-1': '端口未连接'
            };
            return map[key] || key;
        };
    }

    function deviceDebugInfoResult() {
        return function (key) {
            var map = {
                'DOING': '',
                'SUCCESS': '成功',
                'FAILURE': '失败'
            };
            return map[key] || key;
        };
    }
})();
