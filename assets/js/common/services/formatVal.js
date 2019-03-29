/*****************************
 Format validation
 IP, MAC, subnet IP
 *****************************/
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('formatVal', formatVal);

    function formatVal() {
        var VALIDATE_IP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        var VALIDATE_NETMASK = /^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/;
        var VALIDATE_MAC = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;
        var VALIDATE_DOMAIN = /^[a-zA-Z0-9-]{0,62}[a-zA-Z0-9](?:\.[a-zA-Z0-9]{1,62})+$/;
        var VALIDATE_IP_RANGE = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
        var VALIDATE_SUBNET_SIZE = /^[0-9]+$/;
        var VALIDATE_SUBNET = /^((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}(-((\b|\.)(1|2(?!5(?=6|7|8|9)|6|7|8|9))?\d{1,2}){4}|\/((1|2|3(?=1|2))\d|\d))\b$/;
        var VALIDATE_PORT = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
        var VALIDATE_PORT_INPUT = /^([0-9]+((\s*)(,|:)(\s*)[0-9]+(\s*))*)$/;
        var VALIDATE_PORT_RANGE = /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])(-([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])){0,1}$/;
        var VALIDATE_PORT_DISCRETE = /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])(,([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])){0,7}$/;
        var VALIDATE_PROTOCOL_INPUT = /^([A-Za-z][A-Za-z0-9-]*)$/;
        var VALIDATE_OBJECTASSETS_NAME = /^[A-Za-z0-9_\-\u4e00-\u9fa5]{3,}$/;    //支持中文、数字、字母、-与_的匹配(至少4位以上)
        var VALIDATE_SHORT_NAME = /^[A-Za-z0-9_\-\u4e00-\u9fa5]{2,}$/;    //支持中文、数字、字母、-与_的匹配(至少2位以上)
        var VALIDATE_VALUE_DISCRETE = /^(\d|[1-9]\d+)(\.\d+)?([,](\d|[1-9]\d+)(\.\d+)?)*$/;
        var VALIDATE_VALUE_LIMIT = /^(\d|[1-9]\d+)(\.\d+)?-(\d|[1-9]\d+)(\.\d+)?$/;
        var VALIDATE_PSW = /^(?=.*[0-9])(?=.*[!@#$%^&*_])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*_]{8,25}$/;
        var VALIDATE_NET_MASKS = [
            '0.0.0.0',
            '128.0.0.0',
            '192.0.0.0',
            '224.0.0.0',
            '240.0.0.0',
            '248.0.0.0',
            '252.0.0.0',
            '254.0.0.0',
            '255.0.0.0',
            '255.128.0.0',
            '255.192.0.0',
            '255.224.0.0',
            '255.240.0.0',
            '255.248.0.0',
            '255.252.0.0',
            '255.254.0.0',
            '255.255.0.0',
            '255.255.128.0',
            '255.255.192.0',
            '255.255.224.0',
            '255.255.240.0',
            '255.255.248.0',
            '255.255.252.0',
            '255.255.254.0',
            '255.255.255.0',
            '255.255.255.128',
            '255.255.255.192',
            '255.255.255.224',
            '255.255.255.240',
            '255.255.255.248',
            '255.255.255.252',
            '255.255.255.254',
            '255.255.255.255'
        ];

        var service = {
            validateIp: validateIp,
            validatePort: validatePort,
            validateIpRange: validateIpRange,
            validateNetMask: validateNetMask,
            validateMac: validateMac,
            validateDomain: validateDomain,
            subnetParser: subnetParser,
            checkRanges: checkRanges,
            getSubnetReg: getSubnetReg,
            getPortReg: getPortReg,
            getIPRangeReg: getIPRangeReg,
            getIPReg: getIPReg,
            getMACReg: getMACReg,
            getNetMasks: getNetMasks,
            subnetValidation: subnetValidation,
            checkOverLap: checkOverLap,
            subnetOverlap: subnetOverlap,
            checkIpInSubnet: checkIpInSubnet,
            numToNetmask: numToNetmask,
            checkSerialNumberDup: checkSerialNumberDup,
            checkPortInput: checkPortInput,
            checkProtocolName: checkProtocolName,
            checkAuditIpFormat: checkAuditIpFormat,
            validateFifoAddr: validateFifoAddr,
            validateObjectAssetsName: validateObjectAssetsName,
            validateShortName: validateShortName,
            validateIpMask: validateIpMask,
            validateIpSegment: validateIpSegment,
            ipLongMaskToIpShortNum: ipLongMaskToIpShortNum,
            validatePortRange: validatePortRange,
            validatePortDiscrete: validatePortDiscrete,
            validateValueInput: validateValueInput,
            validatePsw: validatePsw
        };
        return service;

        // Returns true to ip format error
        function validateIp(ip) {
            if (ip === undefined) {
                return true;
            }
            if (!ip.match(VALIDATE_IP)) {
                return true;
            } else {
                var lst = ip.split('.');
                for (var i = 0; i < lst.length; i++) {
                    if (lst[i].startsWith('0') && lst[i].length > 1) {
                        return true;
                    }
                    lst[i] = parseInt(lst[i]);
                }
                //A类地址范围:   1.0.0.1—126.255.255.254
                if (lst[0] === 0 || (lst[0] === 126 && lst[1] > 155) || lst[0] === 127 || (lst[0] === 126 && lst[1] === 155 && lst[3] === 255)) {
                    return true;
                }
                //B类地址范围：128.0.0.1—191.255.255.254
                //C类地址范围：192.0.0.1—223.255.255.254
                // --暂不考虑 D类地址范围：224.0.0.1—239.255.255.254
                // --暂不考虑 E类地址范围：240.0.0.1—255.255.255.254
                if (lst[0] === 0 || lst[0] === 127 || lst[0] > 223) {
                    return true;
                }
                if (ip === "1.0.0.0" || ip === "126.255.255.255" || ip === "128.0.0.0" || ip === "191.255.255.255" || ip === "192.0.0.0" || ip === "223.255.255.255") {
                    return true;
                }
            }
            return false;
        }

        // Retruns true to port format error
        function validatePort(port) {
            return !(port + '').match(VALIDATE_PORT);
        }

        // Returns true to netMask format error
        function validateNetMask(netMask) {
            if (!netMask.match(VALIDATE_NETMASK)) {
                return true;
            } else {
                var lst = netMask.split('.');
                for (var i = 0; i < lst.length; i++) {
                    if (lst[i].startsWith('0') && lst[i].length > 1) {
                        return true;
                    }
                }
            }
        }

        // Returns true to mac format error
        function validateMac(mac) {
            return !mac.match(VALIDATE_MAC);
        }

        // Returns true to domain format error
        function validateDomain(domain) {
            return !domain.match(VALIDATE_DOMAIN);
        }

        // Returns expression
        function getSubnetReg() {
            return VALIDATE_SUBNET;
        }

        // Returns expression
        function getPortReg() {
            return VALIDATE_PORT;
        }

        // Returns expression
        function getIPRangeReg() {
            return VALIDATE_IP_RANGE;
        }

        function validateIpRange(ipRange, isSegment) {
            if (!ipRange.match(VALIDATE_IP_RANGE)) {
                return true;
            } else {
                var ip = ipRange.split('/')[0];
                var lst = ip.split('.');
                lst = lst.map(function (n) {
                    return parseInt(n);
                });
                //A类地址范围:   1.0.0.1—126.255.255.254
                //B类地址范围：128.0.0.1—191.255.255.254
                //C类地址范围：192.0.0.1—223.255.255.254
                // --暂不考虑 D类地址范围：224.0.0.1—239.255.255.254
                // --暂不考虑 E类地址范围：240.0.0.1—255.255.255.254
                if (lst[0] === 0 || lst[0] === 127 || lst[0] > 223) {
                    return true;
                }

                if (isSegment) {
                    return false;
                }

                if (ip === "1.0.0.0" || ip === "126.255.255.255" || ip === "128.0.0.0" || ip === "191.255.255.255" || ip === "192.0.0.0" || ip === "223.255.255.255") {
                    return true;
                }
            }
            return false;
        }

        // Returns expression
        function getIPReg() {
            return VALIDATE_IP;
        }

        // Returns expression
        function getMACReg() {
            return VALIDATE_MAC;
        }

        function getNetMasks() {
            return VALIDATE_NET_MASKS;
        }

        function subnetParser(validator, object, ip, alldevice) {
            var netMask = '', maskNumerals = ip.split('/');
            object.ip = maskNumerals[0];
            if (maskNumerals.length === 2 && maskNumerals[0].match(VALIDATE_IP) && maskNumerals[1] && maskNumerals[1].match(VALIDATE_SUBNET_SIZE) && maskNumerals[1] <= 32 && maskNumerals[1] > 7) {
                var binaryRef = '';
                var shift = 32 - parseInt(maskNumerals[1]);
                maskNumerals[1] = parseInt(maskNumerals[1]);
                for (var nm = 0; nm < 4; nm++) {
                    var maskBits = (maskNumerals[1] > 0 ) ? ((maskNumerals[1] = maskNumerals[1] - 8) > 0) ? Array(9).join("1") : Array(maskNumerals[1] + 9).join("1") + Array(1 - maskNumerals[1]).join("0") : "0";
                    netMask = netMask + parseInt(maskBits, 2).toString();
                    (nm !== 3) ? netMask = netMask + '.' : '';
                }
                var ipNumber = object.ip.split('.');
                for (nm = 0; nm < ipNumber.length; nm++) {
                    var inter = (ipNumber[nm] >>> 0).toString(2);
                    binaryRef = binaryRef + Array(9 - inter.length).join("0") + inter;
                }
                validator.invalidRange = checkRanges(object.deviceId, binaryRef, shift, alldevice);
            } else {
                validator.invalidRange = false;
            }
            object.netMask = netMask;
        }

        function numToNetmask(n) {
            return VALIDATE_NET_MASKS[n];
        }

        // return false if valid
        function subnetValidation(subnetIp) {
            if (!subnetIp) {
                return false;
            }
            var maskNumerals = subnetIp.split('/');
            if (maskNumerals.length === 2 && maskNumerals[0].match(VALIDATE_IP) && maskNumerals[1] && maskNumerals[1] <= 32 && maskNumerals[1] >= 8) {
                return false;
            }
            return true;
        }

        // check if two subnet ips are overlapping
        function checkOverLap(subnetIp1, subnetIp2) {
            if (!subnetIp1 || !subnetIp2) {
                return false;
            }
            var tmp = subnetIp1.split('/');
            var ip1 = tmp[0];
            var mask1 = tmp[1];
            tmp = subnetIp2.split('/');
            var ip2 = tmp[0];
            var mask2 = tmp[1];
            tmp = ip1.split('.');
            var intNotaion1 = ((parseInt(tmp[0]) & 0xFF) << 24) | ((parseInt(tmp[1]) & 0xFF) << 16) | ((parseInt(tmp[2]) & 0xFF) << 8) | ((parseInt(tmp[3]) & 0xFF) << 0);
            tmp = ip2.split('.');
            var intNotaion2 = ((parseInt(tmp[0]) & 0xFF) << 24) | ((parseInt(tmp[1]) & 0xFF) << 16) | ((parseInt(tmp[2]) & 0xFF) << 8) | ((parseInt(tmp[3]) & 0xFF) << 0);
            if ((intNotaion1 & (0xFFFFFFFF << (32 - mask1))) === (intNotaion2 & (0xFFFFFFFF << (32 - mask1)))) {
                return true;
            }
            if ((intNotaion1 & (0xFFFFFFFF << (32 - mask2))) === (intNotaion2 & (0xFFFFFFFF << (32 - mask2)))) {
                return true;
            }
            return false;
        }

        // check if the ip and subnetIp are overlapping
        function ipInSubnet(subnetIp, ip) {
            if (!subnetIp || !ip) {
                return false;
            }
            var tmp = subnetIp.split('/');
            var sub_ip = tmp[0];
            var mask = tmp[1];
            tmp = sub_ip.split('.');
            var intNotaion1 = ((parseInt(tmp[0]) & 0xFF) << 24) | ((parseInt(tmp[1]) & 0xFF) << 16) | ((parseInt(tmp[2]) & 0xFF) << 8) | ((parseInt(tmp[3]) & 0xFF) << 0);
            tmp = ip.split('.');
            var intNotaion2 = ((parseInt(tmp[0]) & 0xFF) << 24) | ((parseInt(tmp[1]) & 0xFF) << 16) | ((parseInt(tmp[2]) & 0xFF) << 8) | ((parseInt(tmp[3]) & 0xFF) << 0);
            if ((intNotaion1 & (0xFFFFFFFF << (32 - mask))) === (intNotaion2 & (0xFFFFFFFF << (32 - mask)))) {
                return true;
            }
            return false;
        }

        //check if the subnet ip overlaps with any of the subnets or ip in the device list (Including the devices have not been saved)
        function subnetOverlap(device, deviceList, subnetIp) {
            for (var i = 0; i < deviceList.length; i++) {
                var tmp = deviceList[i];
                if ((!device.deviceId || device.deviceId === '') && (!tmp.deviceId || tmp.deviceId === '')) {
                    if (device.key === tmp.key) {
                        continue;
                    }
                } else {
                    if (device.deviceId === tmp.deviceId) {
                        continue;
                    }
                }
                if (tmp.iconType === 'subnet') {
                    if (checkOverLap(subnetIp, ((tmp.deviceId && tmp.deviceId !== '') ? tmp.devicePorts[0].portIp : tmp.subnetIp))) {
                        return true;
                    }
                } else {
                    if (tmp.category === 'FACTORY_DEVICE') {
                        for (var j = 0; j < tmp.devicePorts.length; j++) {
                            if (tmp.devicePorts[j].portIp && tmp.devicePorts[j].isMgmtPort && ipInSubnet(subnetIp, tmp.devicePorts[j].portIp)) {
                                return true;
                            }
                        }
                    } else {
                        // need to get management port
                        if (tmp.devicePorts.length) {
                            for (var k = 0; k < tmp.devicePorts.length; k++) {
                                var port = tmp.devicePorts[k];
                                if (port.isMgmtPort && port.portIp && ipInSubnet(subnetIp, port.portIp)) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }

        // check ip is in any of the subnets (Including the subnets have not been saved), assume that if the device type is subnet, it has only one port
        function checkIpInSubnet(ip, deviceList) {
            for (var i = 0; i < deviceList.length; i++) {
                var tmp = deviceList[i];
                if (tmp.iconType === 'subnet') {
                    if (!tmp.deviceId || tmp.deviceId === '') {
                        if (tmp.subnetIp && ipInSubnet(tmp.subnetIp, ip)) {
                            return true;
                        }
                    } else {
                        if (tmp.devicePorts.length && tmp.devicePorts[0].isMgmtPort && ipInSubnet(tmp.devicePorts[0].portIp, ip)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        // check if given serial number has duplicate in the device list
        function checkSerialNumberDup(deviceList, sn, deviceId) {
            for (var i = 0; i < deviceList.length; i++) {
                var tmp = deviceList[i];
                if (tmp.deviceId !== deviceId && tmp.serialNumber === sn) {
                    return true;
                }
            }
            return false;
        }

        function checkRanges(deviceId, ip, shift, deviceList) {
            var inRange = false;
            for (var index = 0; index < deviceList.length; index++) {
                if (deviceList[index].category === 'FACTORY_DEVICE' && deviceList[index].ip && ((deviceId) ? deviceList[index].deviceId !== deviceId : true) && deviceList[index].iconType !== 'cloud') {
                    var actualShift = shift;

                    if (deviceList[index].iconType === "subnet" && (32 - deviceList[index].subnetIp.split('/')[1]) > shift) {
                        actualShift = (32 - deviceList[index].subnetIp.split('/')[1]);
                    }

                    var binaryIp = '', ipNumber = deviceList[index].ip.split('.');
                    for (var nm = 0; nm < ipNumber.length; nm++) {
                        var inter = (ipNumber[nm] >>> 0).toString(2);
                        binaryIp = binaryIp + Array(9 - inter.length).join("0") + inter;
                    }
                    // Assume that checkranges called after duplication has passed without error
                    if (ip === binaryIp) {
                        continue;
                    }
                    inRange = (parseInt(ip, 2) >>> actualShift) === (parseInt(binaryIp, 2) >>> actualShift);

                    if (inRange) {
                        return inRange;
                    }
                }
            }
            return inRange;
        }

        function checkPortRange(input) {
            var lst = input.split(':');
            if (lst.length !== 2) {
                return false;
            }
            var arr = [];
            for (var i = 0; i < 2; i++) {
                var tmp = lst[i].trim();
                if (!tmp.match(/^[0-9]+$/)) {
                    return false;
                }
                var t = parseInt(tmp);
                if (t < 1 || t > 65535) {
                    return false;
                }
                arr.push(t);
            }
            if (arr[0] > arr[1]) {
                return false;
            }
            return true;
        }

        function checkPortInput(input) {
            alert("checkPortInput");
            if (input.match(VALIDATE_PORT_INPUT)) {
                var lst = input.split(',');
                for (var i = 0; i < lst.length; i++) {
                    var tmp = lst[i].trim();
                    if (tmp.match(/^[0-9]+$/)) {
                        var t = parseInt(tmp);
                        if (t < 1 || t > 65535) {
                            return false;
                        }
                    } else if (tmp.match(/^[0-9]+:[0-9]+$/)) {
                        if (!checkPortRange(tmp)) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
            return true;
        }

        function checkProtocolName(input) {
            if (input.match(VALIDATE_PROTOCOL_INPUT)) {
                return true;
            } else {
                return false;
            }
            return true;
        }

        // Returns true to Fifo addr error
        function validateFifoAddr(value) {
            if (value.match(/^[0-9]*$/) && value <= 65535 && value >= 0) {
                return false;
            } else {
                return true;
            }
            return true;
        }

        function checkAuditIpFormat(input) {
            var ipAndMaskVals = input.split('/');
            var ipSegmentVals = input.split('-');
            if (ipAndMaskVals.length === 2 && ipAndMaskVals[0].match(VALIDATE_IP) && ipAndMaskVals[1] && ipAndMaskVals[1] <= 32 && ipAndMaskVals[1] >= 8) {
                return true;
            } else if (ipSegmentVals.length === 2 && ipSegmentVals[0].match(VALIDATE_IP) && ipSegmentVals[1].match(VALIDATE_IP)) {
                return true;
            } else if (input.match(VALIDATE_IP)) {
                return true;
            } else {
                return false;
            }
        }

        function validateObjectAssetsName(name) {
            if (!name.match(VALIDATE_OBJECTASSETS_NAME)) {
                return false;
            }
            return true;
        }

        function validateShortName(name) {
            if (!name.match(VALIDATE_SHORT_NAME)) {
                return false;
            }
            return true;
        }

        function validateIpMask(ipMask) {
            if (ipMask) {
                var ips = ipMask.split('/');
                if (angular.isArray(ips) && ips.length === 2) {
                    var ip = ips[0];
                    var netMask = ips[1];
                    if (ip.length === ip.trim().length && netMask.length === netMask.trim().length && (!validateIpRange(ipMask) || (!validateIp(ip) && !validateNetMask(netMask)))) {
                        return false;   //只有当输入合法时返回false
                    }
                }
            }
            return true;
        }

        function validateIpSegment(ipMask) {
            if (ipMask) {
                var ips = ipMask.split('/');
                if (angular.isArray(ips) && ips.length === 2) {
                    var ip = ips[0];
                    var netMask = ips[1];
                    if (ip.length === ip.trim().length && netMask.length === netMask.trim().length) {
                        if ((!validateIpRange(ipMask, true) || (!validateIp(ip) && !validateNetMask(netMask)))) {
                            return false;   //只有当输入合法时返回false
                        }

                    }
                }
            }
            return true;
        }

        function ipLongMaskToIpShortNum(ipMask) {
            if (ipMask) {
                if (!validateIpRange(ipMask)) {
                    return ipMask;
                }
                var ips = ipMask.split('/');
                if (ips.length === 2) {
                    var netMask = ips[1];
                    for (var i = 0; i < VALIDATE_NET_MASKS.length; i++) {
                        if (netMask === VALIDATE_NET_MASKS[i]) {
                            netMask = i;
                            break;
                        }
                    }
                    return ips[0] + '/' + netMask;
                }
            }
            return ipMask;
        }

        function validatePortRange(portRange) {
            var ports = portRange.split(',');
            var result = true;
            if (ports.length > 1) {
                ports.some(function (port) {
                    if (!port.match(VALIDATE_PORT)) {
                        result = false;
                        return true;
                    }
                });
            } else {
                if (!portRange.match(VALIDATE_PORT_RANGE)) {
                    result = false;
                }
            }
            return result;
        }

        function validatePortDiscrete(ports) {
            var result = true;
            if (!ports.match(VALIDATE_PORT_DISCRETE)) {
                result = false;
            }
            return result;
        }

        function validateValueInput(value, type) {
            var isDiscrete = type.indexOf('DISCRETE') >= 0;
            var isLimit = type.indexOf('LIMIT') >= 0;
            if (isDiscrete && isLimit) {
                return value.match(VALIDATE_VALUE_DISCRETE) !== null ||
                    value.match(VALIDATE_VALUE_LIMIT) !== null;
            } else if (isDiscrete) {
                return value.match(VALIDATE_VALUE_DISCRETE) !== null;
            } else if (isLimit) {
                return value.match(VALIDATE_VALUE_LIMIT) !== null;
            }
            return true;
        }

        function validatePsw(psw) {
            return !!psw && !!psw.match(VALIDATE_PSW);
        }
    }
})();
