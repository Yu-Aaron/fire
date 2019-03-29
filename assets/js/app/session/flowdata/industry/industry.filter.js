(function () {
    'use strict';

    angular
        .module('southWest.session.flowdata_industry')
        .filter('trafficType', trafficType);

    function trafficType() {
        var types = [{text: '所有协议', value: '-1'},{"text":"TOTAL","value":"0"},{"text":"MODBUS_TCP","value":"1"},{"text":"OPCDA","value":"2"},{"text":"IEC104","value":"3"},{"text":"DNP3","value":"4"},{"text":"MMS","value":"5"},{"text":"S7","value":"6"},{"text":"PROFINETIO","value":"7"},{"text":"GOOSE","value":"8"},{"text":"SV","value":"9"},{"text":"ENIP","value":"10"},{"text":"OPCUA","value":"12"},{"text":"PNRT_DCP","value":"13"},{"text":"MODBUS_UDP","value":"14"},{"text":"OTHER","value":"100"}];
        return function (str) {
            return (_.find(types, {value: str.toString()}) || {}).text || str;
        };
    }
})();
