/**
 * PrivateProtocol Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('PrivateProtocol', PrivateProtocolModel);

    function PrivateProtocolModel($q, $http, URI, encodeURL) {
        var url = URI + '/privateprotocols';
        var service = {
            getProtocols: getProtocols,
            getHiddenPorts: getHiddenPorts,
            updateAll: updateAll,
            getFTPProtocols: getFTPProtocols,
            updateAllDP: updateAllDP,
            getProtocolSwitch: getProtocolSwitch,
            setProtocolSwitch: setProtocolSwitch,
            getPrivateProtocols: getPrivateProtocols,
            updatePrivateProtocols: updatePrivateProtocols
        };
        return service;

        //////////
        function getProtocols(dataType) {
            var obj = {};
            if (dataType) {
                obj = {params: encodeURL({$filter: "dataType eq " + dataType + ""})};
            }
            return $http.get(url, obj).then(function (data) {
                return data.data;
            });

            // Mock
            // var flowData = [
            //     {"privateProtocolId": "01", "disabled": 1, "protocolName": "BX_01", "protocolPort": 101, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "02", "disabled": 1, "protocolName": "BX_02", "protocolPort": 102, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "03", "disabled": 1, "protocolName": "BX_03", "protocolPort": 103, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "04", "disabled": 0, "protocolName": "BX_04", "protocolPort": 104, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "05", "disabled": 1, "protocolName": "BX_05", "protocolPort": 105, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "06", "disabled": 0, "protocolName": "BX_06", "protocolPort": 106, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "07", "disabled": 1, "protocolName": "BX_07", "protocolPort": 107, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "08", "disabled": 1, "protocolName": "BX_08", "protocolPort": 108, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "09", "disabled": 1, "protocolName": "BX_09", "protocolPort": 109, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "10", "disabled": 1, "protocolName": "BX_10", "protocolPort": 110, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "11", "disabled": 1, "protocolName": "BX_11", "protocolPort": 111, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "12", "disabled": 0, "protocolName": "BX_12", "protocolPort": 112, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "13", "disabled": 1, "protocolName": "BX_13", "protocolPort": 113, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "14", "disabled": 1, "protocolName": "BX_14", "protocolPort": 114, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "15", "disabled": 1, "protocolName": "BX_15", "protocolPort": 115, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "16", "disabled": 0, "protocolName": "BX_16", "protocolPort": 116, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "17", "disabled": 1, "protocolName": "BX_17", "protocolPort": 117, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "18", "disabled": 0, "protocolName": "BX_18", "protocolPort": 118, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "19", "disabled": 1, "protocolName": "BX_19", "protocolPort": 119, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "20", "disabled": 1, "protocolName": "BX_20", "protocolPort": 120, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "21", "disabled": 1, "protocolName": "BX_21", "protocolPort": 121, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "22", "disabled": 0, "protocolName": "BX_22", "protocolPort": 122, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "23", "disabled": 1, "protocolName": "BX_23", "protocolPort": 123, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "24", "disabled": 1, "protocolName": "BX_24", "protocolPort": 124, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "25", "disabled": 1, "protocolName": "BX_25", "protocolPort": 125, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "26", "disabled": 0, "protocolName": "BX_26", "protocolPort": 126, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "27", "disabled": 1, "protocolName": "BX_27", "protocolPort": 127, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "28", "disabled": 0, "protocolName": "BX_28", "protocolPort": 128, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "29", "disabled": 1, "protocolName": "BX_29", "protocolPort": 129, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "30", "disabled": 1, "protocolName": "BX_30", "protocolPort": 130, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "31", "disabled": 0, "protocolName": "BX_31", "protocolPort": 131, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "32", "disabled": 1, "protocolName": "BX_32", "protocolPort": 132, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "33", "disabled": 0, "protocolName": "BX_33", "protocolPort": 133, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "34", "disabled": 1, "protocolName": "BX_34", "protocolPort": 134, "dataType": 1, "hidden": 0},
            //     {"privateProtocolId": "35", "disabled": 1, "protocolName": "BX_35", "protocolPort": 135, "dataType": 1, "hidden": 0}
            // ];
            // return $q.when(flowData);
        }

        function getHiddenPorts() {
            return $http.get(url + '/defaultports').then(function (data) {
                return data.data;
            });

            // Mock
            // var flowData = [201, 202, 203, 204, 205];
            // return $q.when(flowData);
        }

        function updateAll(protocols) {
            var enabledProtocols = [];
            for (var i in protocols) {
                if (protocols[i] && !protocols[i].disabled) {
                    var protocol = {};
                    protocol['privateProtocolId'] = protocols[i].privateProtocolId;
                    protocol['protocolPort'] = protocols[i].protocolPort;
                    protocol['protocolName'] = protocols[i].protocolName;
                    protocol['disabled'] = protocols[i].disabled;
                    enabledProtocols.push(protocol);
                }
            }
            return $http.put(url, enabledProtocols);

            // Error Mock
            // var flowData = {"isValidate": false, "privateProtocolId": "31", "info": "1001 为工控专用端口", "validate": false};
            // return $q.reject(flowData);
        }

        function getFTPProtocols() {
            return $http.get(URI + '/strategymanagement/strategybuilder/strategycode/FTP_PROTOCOL_TOGGLE').then(function (data) {
                return data.data;
            });
        }

        function updateAllDP(protocols) {
            return $http.put(URI + '/strategymanagement/strategyrule/ruledata', protocols).then(function (data) {
                return data.data;
            });
        }

        function getProtocolSwitch() {
            return $http.get(URI + '/servicesetting/protocolswitch').then(function (data) {
                return data.data;
            });
        }

        function setProtocolSwitch(data) {
            return $http.post(URI + '/servicesetting/protocolswitch', data).then(function (data) {
                return data.data;
            });
        }

        function getPrivateProtocols(type) {
            return $http.get(url + '?$filter=dataType eq ' + type).then(function (data) {
                return data.data;
            }, function () {
                return [];
            });
        }

        function updatePrivateProtocols(data) {
            return $http.post(URI + '/servicesetting/protocolportsconfig', data).then(function (data) {
                return data;
            });
        }
    }

})();
