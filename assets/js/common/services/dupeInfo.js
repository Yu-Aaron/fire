/**
 * Authorization Service
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('dupeInfo', dupeInfo);

    function dupeInfo($q, $rootScope, $$q, Device, Topology, topologyId, domain) {
        var service = {
            allDevice: allDevice,
            dupeCheck: dupeCheck,
            dupeCheckArrayObject: dupeCheckArrayObject,
            dupeDeepCheckArrayObject: dupeDeepCheckArrayObject,
            dupInOtherDevice: dupInOtherDevice,
            checkDupInDevice: checkDupInDevice
        };
        return service;

        function allDevice(deviceData) {
            if (!topologyId.id) {
                return domain.getDomain().then(function () {
                    return getDevice();
                });
            } else {
                return getDevice();
            }

            function getDevice() {
                var promise = [];
                !deviceData && promise.push(Topology.getDevices(topologyId.id));
                return $q.all(promise).then(function (da) {
                    deviceData && (da.push({"data": deviceData}));
                    var data = da[0].data;
                    var deviceIps = [];
                    for (var count = 0; count < data.length; count++) {
                        var ip = '', subnetIp = '', mac = '';
                        for (var d = 0; d < data[count].devicePorts.length; d++) {
                            if (data[count].devicePorts[d].isMgmtPort) {
                                ip = (data[count].devicePorts[d].portIp) ? data[count].devicePorts[d].portIp.split('/')[0] : '';
                                subnetIp = (data[count].devicePorts[d].portIp) ? data[count].devicePorts[d].portIp : '';
                                mac = (data[count].devicePorts[d].mac) ? data[count].devicePorts[d].mac : '';
                                break;
                            }
                        }
                        deviceIps.push({
                            deviceId: data[count].deviceId,
                            category: data[count].category,
                            iconType: data[count].iconType,
                            ip: ip,
                            subnetIp: subnetIp,
                            mac: mac

                        });
                    }
                    return deviceIps;
                });
            }
        }

        function dupeCheck(deviceId, infoType, targetValue, deviceList) {
            if (!targetValue) {
                return false;
            }
            for (var d = 0; d < deviceList.length; d++) {
                if (deviceId !== deviceList[d].deviceId) {
                    if (deviceList[d][infoType].toLowerCase() === targetValue.toLowerCase()) {
                        return true;
                    }
                }
            }
        }

        // check if key value has dup in an array of objects
        function dupeCheckArrayObject(key, targetValue, arr) {
            var count = 0;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][key] === targetValue) {
                    count++;
                }
            }
            if (count <= 1) {
                return false;
            }
            return true;
        }

        // check if key value has dup in an array of objects, which is a key in outter objects in an array, if id is identical, skip the object
        function dupeDeepCheckArrayObject(key1, key2, targetValue, arr, key3, id) {
            var count = 0;
            for (var i = 0; i < arr.length; i++) {
                var tmp = arr[i][key1];
                for (var j = 0; j < tmp.length; j++) {
                    if (tmp[j][key2] && tmp[j][key2].toLowerCase() === targetValue.toLowerCase()) {
                        count++;
                        if (id && tmp[j][key3] === id) {
                            count--;
                        }
                    }
                }
            }
            if (count < 1) {
                return false;
            }
            return true;
        }

        // check ip or mac dups in other existing devices
        function dupInOtherDevice(key, deviceId, deviceArr, targetValue) {
            var count = 0;
            for (var i = 0; i < deviceArr.length; i++) {
                if (deviceArr[i].deviceId === deviceId) {
                    continue;
                }
                var tmp = deviceArr[i].devicePorts;
                for (var j = 0; j < tmp.length; j++) {
                    if (tmp[j][key] && tmp[j][key].toLowerCase() === targetValue.toLowerCase()) {
                        count++;
                    }
                }
            }
            if (count < 1) {
                return false;
            }
            return true;
        }

        // check if ip or mac in the current device have duplicates
        function checkDupInDevice(portArr, port, index, key) {
            for (var i = 0; i < portArr.length; i++) {
                if (i === index) {
                    continue;
                }
                var tmp = portArr[i];
                if (port[key] && port[key].toLowerCase() === tmp[key].toLowerCase()) {
                    return true;
                }
            }
            return false;
        }

    }

})();
