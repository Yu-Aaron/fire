(function () {
    'use strict';

    angular
        .module('southWest.session.flowdata_industry')
        .directive('icdevicedataTable2', ICDevicedataTable2)
        .directive('flowdataTable', flowdataTable);

    function ICDevicedataTable2($q, apiInfo, icdevicedata) {
        var devicedataTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/session/flowdata/industry/icdevicedataTable.html',
            link: link
        };

        return devicedataTableObj;

        function link(scope, element, attr, ctrl) {
            var fields = ['totalBytes', 'deviceName', 'ipAddr', 'macAddr', 'recvBytes', 'sendBytes', "percent", "createdAt"];
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                name: 'devicedata',
                pagination: true,
                numPerPage: 5,
                scrollable: false,
                totalCount: true,
                fields: fields,
                getAll: getAll,
                getCount: getCount,
            });

            function getCount(params) {
                return apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var endTime = new Date(endSecond);
                    var startSecond = endTime - (3600000);
                    var startTime = new Date(startSecond);
                    return icdevicedata.getDeviceTrafficCount(startTime, endTime, params);
                });
            }

            function getAll(params) {
                return apiInfo.sysbaseinfo().then(function (data) {
                    var currTime = new Date(data.data || "");
                    var endSecond = currTime - 24000;
                    var endTime = new Date(endSecond);
                    var startSecond = endTime - (3600000);
                    var startTime = new Date(startSecond);
                    return icdevicedata.getDeviceTrafficList(startTime, endTime, params).then(function (detail) {
                        return detail.length ? $q.all(detail).then(function () {
                            detail.map(function (d, i) {
                                detail[i].avgRecvSpeed = Math.floor(detail[i].avgRecvSpeed / 10.24) / 100 + ' KB/s';
                                detail[i].avgSendSpeed = Math.floor(detail[i].avgSendSpeed / 10.24) / 100 + ' KB/s';
                                detail[i].timestamp = new Date(detail[i].timestamp).getTime();
                            });
                            return detail;
                        }) : [];
                    });
                });
            }

            scope.$watch(function () {
                return scope.reloadDevices;
            }, function () {
                if (scope.reloadDevices === true) {
                    scope.$parent.dtable.getTableData();
                }
            });
        }
    }

    function flowdataTable(icdevicedata) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/session/flowdata/industry/flowdataTable.html',
            link: link
        };

        return obj;

        function link(scope, element, attr, ctrl) {
            var fields = ['iCDeviceIp', 'protocolType', 'timestamp', 'trafficType'];
            var protocolTypeOptions = [
                {text: '所有协议', value: '-1'},
                {text: 'TCP', value: '1'},
                {text: 'UDP', value: '2'},
                {text: 'ICMP', value: '3'},
                {text: 'OPC_Classic', value: '4'},
                {text: '其它', value: '5'},
            ];

            var trafficTypeOptions = [{text: '所有协议', value: '-1'},{"text":"MODBUS_TCP","value":"1"},{"text":"OPCDA","value":"2"},{"text":"IEC104","value":"3"},{"text":"DNP3","value":"4"},{"text":"MMS","value":"5"},{"text":"S7","value":"6"},{"text":"PROFINETIO","value":"7"},{"text":"GOOSE","value":"8"},{"text":"SV","value":"9"},{"text":"ENIP","value":"10"},{"text":"OPCUA","value":"12"},{"text":"PNRT_DCP","value":"13"},{"text":"MODBUS_UDP","value":"14"}];

            ctrl.setConfig({
                name: 'item',
                numPerPage: 10,
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                advancedSearch: 'item',
                advancedSearchOptions: [
                    {'name': 'timestamp', 'display': '时间', 'input': 'timerange', 'option': true, value: [],  'options': []},
                    {'name': 'iCDeviceIp', 'display': 'IP', 'input': 'string', 'option': false, value: ""},
                    {
                        'name': 'protocolType',
                        'display': '网络服务',
                        'input': 'checkbox',
                        'option': true,
                        value: '-1',
                        'options': protocolTypeOptions
                    },
                    {
                        'name': 'trafficType',
                        'display': '协议类型',
                        'input': 'checkbox',
                        'option': true,
                        value: '-1',
                        'options': trafficTypeOptions
                    }
                ]
            });

            function search(params) {
                return getAll(params);
            }

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return icdevicedata.getDeviceTrafficStats(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return icdevicedata.getDeviceTrafficStatsCount(payload);
            }

        }

    }
})();
