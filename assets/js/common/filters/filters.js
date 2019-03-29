/**
 * Filters
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters', [])
        .filter('translateSeverity', [

            function () {
                return function (value) {
                    var map = {
                        '1': 'LOW',
                        '2': 'MEDIUM',
                        '3': 'HIGH'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter('translateCategory', [

            function () {
                return function (value) {
                    var map = {
                        '0': 'BRUTE_FORCE',
                        '1': 'INFO_LEAK',
                        '2': 'CODE_EXECUTION',
                        '3': 'DOS',
                        '4': 'OVERFLOW'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter('translateAction', [

            function () {
                return function (value) {
                    var map = {
                        '1': 'ALLOW',
                        '2': 'ALERT',
                        '3': 'DROP',
                        '4': 'REJECTBOTH'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter('translateUserpril', [

            function () {
                return function (value) {
                    var map = {
                        'ADMIN': '管理员',
                        'NORMAL_USER': '普通用户'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter('translateTopoStatus', [

            function () {
                return function (value) {
                    var map = {
                        'on': '使用中',
                        'off': '未使用'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter('tableUnit', [

            function () {
                return function (value) {
                    var map = {
                        'device': '台设备',
                        'incident': '个事件',
                        'event': '个事件',
                        'user': '个用户',
                        'rules': '条规则',
                        'log': '条日志',
                        'audit': '条记录',
                        'devicedata': '台设备',
                        'nodeZone': '个逻辑分区',
                        'file': '个文件',
                        'reduction': '条记录',
                        'item': '条'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter('trustAsResourceUrl', ['$sce',

            function ($sce) {
                return function (value) {
                    return $sce.trustAsResourceUrl(value);
                };
            }
        ])
        .filter('convertOptions', [
            function () {
                return function (items, prop, param, convertTo) {
                    var filtered = [];
                    angular.forEach(items, function (item) {
                        item[prop] = (item[prop] === param) ? convertTo : item[prop];
                        filtered.push(item);
                    });
                    filtered.sort(function (a, b) {
                        return a[prop] > b[prop] ? 1 : -1;
                    });
                    return filtered;
                };
            }])
        .filter('convertText', [
            function () {
                return function (item, param, convertTo) {
                    return (item === param) ? convertTo : item;
                };
            }])
        .filter('ellipsis', [
            function () {
                return function (value, len) {
                    var str = String(value);
                    if (str.length > len) {
                        value = str.slice(0, len - 1).concat("...");
                    }
                    return value;
                };
            }])
        .filter("convertBackType", [
            function () {
                return function (value) {
                    if (value === "mwbus") {
                        return "业务备份";
                    }
                    if (value === "mwsys") {
                        return "系统备份";
                    }
                };
            }])
        .filter('convertNullBlank', [
            function () {
                return function (value, convertTo) {
                    return value ? value : convertTo;
                };
            }
        ])
        .filter('convertTrueFalse', [
            function () {
                return function (value, trueVal, falseVal) {
                    return value ? trueVal : falseVal;
                };
            }
        ])
        .filter('spliceContentFromArray', [
            function () {
                return function (value, sliceArrays, prop) {
                    if (angular.isArray(sliceArrays)) {
                        sliceArrays.forEach(function (item) {
                            value.some(function (spliceItem, index) {
                                if (prop) {
                                    if (item === spliceItem[prop]) {
                                        value.splice(index, 1);
                                        return true;
                                    }
                                } else if (item === spliceItem) {
                                    value.splice(index, 1);
                                    return true;
                                }
                            });
                        });
                    }
                    return value;
                };
            }
        ])
        .filter("outerInterface", [
            function () {
                return function (value) {
                    var map = {
                        'any': '任意'
                    };
                    return map[value] || value;
                };
            }
        ])
        .filter('spaceFormat', function () {
            return function (value) {
                var index = 0,
                    map = {
                        0: 'B',
                        1: 'K',
                        2: 'M',
                        3: 'G',
                        4: 'T',
                        5: 'P'
                    };
                while (value >= 100) {
                    value = value / 1024;
                    index++;
                }
                return value.toFixed(1) + map[index];
            };
        })
        .filter('byte', function () {
            return function (value) {
                var index = 0,
                    map = {
                        0: 'B',
                        1: 'K',
                        2: 'M',
                        3: 'G',
                        4: 'T',
                        5: 'P'
                    };
                while (value >= 1024) {
                    value = value / 1024;
                    index++;
                }
                return value.toFixed(2) + map[index];
            };
        })
        .filter('utc', function () {
            return function (time, format) {
                return moment(time).format(format || 'YYYY-MM-DD HH:mm:ss');
            };
        });
})();
