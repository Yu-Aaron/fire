/**
 * Object Filter
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter("ipPoolTypes", [
            function () {
                return function (value) {
                    var map = {
                        'IPADDRESS': '单个地址',
                        'SUBNET': '子网',
                        'IPRANGE': '范围'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter("ipPoolInterfaces", [
            function () {
                return function (value) {
                    var map = {
//                        'ANY': 'any'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter("objScheduleTypes", [
            function () {
                return function (value) {
                    var map = {
                        'LOOP': '是',
                        'ONCE': '否'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter("dvcAssetInputMode", [
            function () {
                return function (value) {
                    var map = {
//                        'auto': '自动',
//                        'manual': '手动'
                        '1': '自动',
                        '0': '手动'
                    };
                    return map[value] || value;
                };
            }
        ]);
})();
