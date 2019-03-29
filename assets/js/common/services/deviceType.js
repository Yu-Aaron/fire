/**
 * service for getting factory and network device type
 *
 * Description, get current time from ntp server, and update the time every second
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('deviceTypeService', deviceTypeService);

    function deviceTypeService($rootScope) {
        var obj = {};
        obj.factoryTypes = {
            'workstation': '工作站',
            'subnet': '子网',
            'hmi': 'HMI',
            'opc_client': 'OPC 客户端',
            'opc_server': 'OPC 服务器',
            'plc': 'PLC',
            'unknown-device': '其它',
            'cnc': '高端数控机床',
        };

        obj.networkTypes = {
            'switch': '网络交换机',
            'router': '路由器',
            'unknown-device': '其它',
        };

        obj.getFactoryType = function (type) {
            return obj.factoryTypes[type];
        };

        obj.getNetworkType = function (type) {
            return obj.networkTypes[type];
        };

        obj.simplifyModelName = function (name) {
            if (!$rootScope.simplifyModelName) {
                return name;
            }
            if (name && name.indexOf('/') !== -1) {
                var lst = name.split('/');
                var ret = lst[0] + '/' + lst[1].substring(0, 4);
                return ret;
            }
            return name;
        };

        return obj;
    }
})();
