/**
 * toHex Filter
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter('toHex', toHex)
        .filter('nodeName', nodeName)
        .filter('protocolDetail', protocolDetail)
        .filter('nodeIcon', nodeIcon)
        .filter('eventContent', eventContent)
        .filter('eventLevel', eventLevel)
        .filter('eventAction', eventAction)
        .filter('eventType', eventType)
        .filter('eventRiskLevel', eventRiskLevel);


    function toHex() {
        return function (bytes) {
            var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
            return bytes.map(function (byte) {
                return hexChar[(byte >> 4) & 0x0f] + hexChar[byte & 0x0f];
            }).join(' ');
        };
    }

    function nodeName() {
        return function (key) {
            var map = {
                0: '起源',
                1: '防火墙',
                2: '目标'
            };

            return map[key] || key;
        };
    }

    function protocolDetail() {
        return function (string) {
            return string ? string.replace(/,/g, ', ') : '';
        };
    }

    function nodeIcon() {
        return function (key) {
            var map = {
                '1source': 'laptop',
                '2dpi': 'placeholders/u857',
                '3destination': 'laptop'
            };
            return map[key] || key;
        };
    }

    function eventContent() {
        return function (key) {
            var map = {
                'Connected': '连接',
                'Disconnected': '未连接'
            };
            return map[key] || key;
        };
    }

    function eventLevel() {
        return function (key) {
            var map = {
                'REJECTBOTH': '阻断',
                'DROP': '丢弃',
                'WARN': '警告',
                'INFO': '信息'
            };
            return map[key] || key;
        };
    }


    function eventAction() {
        return function (key) {
            var map = {
                'DROP': '丢弃',
                'REJECTBOTH': '阻断',
                'ALERT': '警告',
                'ALLOW': '允许'
            };
            return map[key.toUpperCase()] || key;
        };
    }

    function eventType() {
        return function (key) {
            var map = {
                'DPI_ON_OFF': '设备状态',
                'IF_UP_DOWN': '接口状态',
                'MEM_WARNING': '内存警告',
                'DISK_WARNING': '磁盘警告',
                'TEMPERATURE_WARNING': '温度警告',
                'NTP_SYNC': 'NTP同步',
                "DPI_BYPASS": 'BYPASS',
                "TRAFFIC_UP_DOWN": '流量警告',
                "SYSTEM_CHECK": '系统自检测',
                "SELFTEST_RESULT": '开机自检',
                "MW_EVENT": '平台系统事件',
                "SYS_EVENT": '关键进程'
            };
            return map[key] || key;
        };
    }

    function eventRiskLevel() {
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
})();
