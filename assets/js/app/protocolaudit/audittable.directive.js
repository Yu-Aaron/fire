/**
 * Monitor Audit Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.protocolaudit')
        .directive('auditFullTable', AuditFullTable)
        .directive('auditDetailTable', AuditDetailTable);

    function AuditFullTable($q, Audit, $modal, $log, $filter, FileUploader, URI, topologyId, $rootScope, $state, $timeout, Custom) {
        var auditTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/protocolaudit/auditTab.html',
            link: link
        };

        return auditTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac'];
            setConfig('normal');

            scope.protocolOptions = [
                {display: '所有协议', value: 'normal', type: 'normal'},
                {display: 'HTTP', value: 'http', type: 'normal'},
                {display: 'FTP', value: 'ftp', type: 'normal'},
                {display: 'POP3', value: 'pop3', type: 'normal'},
                {display: 'SMTP', value: 'smtp', type: 'normal'},
                {display: 'Telnet', value: 'telnet', type: 'normal'},
                {display: 'SNMP', value: 'snmp', type: 'normal'},
            ];
            scope.factoryProtocolOptions = [
                {display: 'Modbus', value: 'modbus', type: 'factory'},
                {display: 'OPCDA', value: 'opcda', type: 'factory'},
                {display: 'S7', value: 's7', type: 'factory'},
                {display: 'DNP3', value: 'dnp3', type: 'factory'},
                {display: 'IEC104', value: 'iec104', type: 'factory'},
                {display: 'MMS', value: 'mms', type: 'factory'},
                {display: 'Profinetio', value: 'profinetio', type: 'factory'},
                {display: 'Pnrtdcp', value: 'pnrtdcp', type: 'factory'},
                {display: 'Goose', value: 'goose', type: 'factory'},
                {display: 'SV', value: 'sv', type: 'factory'},
                {display: 'EnipTcp', value: 'eniptcp', type: 'factory'},
                {display: 'EnipUdp', value: 'enipudp', type: 'factory'},
                {display: 'EnipIo', value: 'enipio', type: 'factory'},
                {display: 'OPCUA', value: 'opcua', type: 'factory'}
            ];

            var version = $rootScope.VERSION_NUMBER.split('-');
            var versionSuffix = version[version.length - 1];
            if (versionSuffix === "X02") {
                scope.factoryProtocolOptions.push({display: 'FOCAS', value: 'focas', type: 'factory'});
            }
            scope.protocol = scope.protocolOptions[0].value;
            scope.changeProtocol = changeProtocol;

            function changeProtocol(c) {
                scope.protocol = c;
                setConfig(c);
                //ctrl.filterBar(c);
            }

            var msOption = {
                modbus: {func: []},
                opcda: {opc: []},
                s7: {pdu: []},
                dnp3: {func: []},
                iec104: {causetx: [], asdu: []},
                mms: {pdu: [], serviceRequest: []},
                profinetio: {func: [], opp: [], dataType: []},
                pnrtdcp: {frameid: [], serviceid: [], servicetype: [], dcpoption: [], dcpsuboption: []},
                eniptcp: {command: [], serviceName: [], addressType: [], dataType: []},
                enipudp: {command: []},
                enipio: {addressType: [], dataType: []},
                goose: {datSet: [], goID: []},
                sv: {svID: [], smpSynch: []},
                opcua: {serviceId: []},
                snmp: {pduType: [], version: [], community: []},
                focas: {command: [], type: [], function_key: [], func: []}
            };

            function setOptions(source, destinationArray) {
                if (source) {
                    var temp = source.nodeDisplayValue.split(",");
                    temp.sort(function (a, b) {
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    });
                    var hasNonStandard = false;
                    temp.map(function (d) {
                        if (d === 'NONSTANDARD') {
                            hasNonStandard = true;
                            return;
                        }
                        d = {'name': d, 'value': d};
                        destinationArray.push(d);
                    });
                    // Hide the option.  Need to implement input field in the future
                    //if (hasNonStandard) {
                    //  destinationArray.push({'name': 'NONSTANDARD', 'value': 'NONSTANDARD'});
                    //}
                }
            }

            function setConfig(c) {
                if (c === 'modbus' && !msOption.modbus.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"modbus"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.modbus.func);
                        msOption.modbus.init = true;
                    });
                }
                if (c === 'opcda' && !msOption.opcda.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"opcda"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.opcda.opc);
                        msOption.opcda.init = true;
                    });
                }
                if (c === 's7' && !msOption.s7.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"S7"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.s7.pdu);
                        msOption.s7.init = true;
                    });
                }
                if (c === 'dnp3' && !msOption.dnp3.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"dnp3"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.dnp3.func);
                        msOption.dnp3.init = true;
                    });
                }
                if (c === 'iec104' && !msOption.iec104.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"iec104"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.iec104.causetx);
                        setOptions(data.data.nodeTree.nodes[2], msOption.iec104.asdu);
                        msOption.iec104.init = true;
                    });
                }
                if (c === 'mms' && !msOption.mms.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"mms"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.mms.pdu);
                        setOptions(data.data.nodeTree.nodes[2], msOption.mms.serviceRequest);
                        msOption.mms.init = true;
                    });
                }
                if (c === 'profinetio' && !msOption.profinetio.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"profinetio"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.profinetio.func);
                        setOptions(data.data.nodeTree.nodes[2], msOption.profinetio.opp);
                        setOptions(data.data.nodeTree.nodes[3], msOption.profinetio.dataType);
                        msOption.profinetio.init = true;
                    });
                }
                if (c === 'pnrtdcp' && !msOption.pnrtdcp.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"PNRTDCP"}]'}).then(function (data) {

                        setOptions(data.data.nodeTree.nodes[1], msOption.pnrtdcp.dcpoption);
                        setOptions(data.data.nodeTree.nodes[2], msOption.pnrtdcp.servicetype);
                        setOptions(data.data.nodeTree.nodes[3], msOption.pnrtdcp.serviceid);
                        setOptions(data.data.nodeTree.nodes[4], msOption.pnrtdcp.frameid);
                        //setOptions(data.data.nodeTree.nodes[5], msOption.pnrtdcp.dcpsuboption);
                        msOption.pnrtdcp.init = true;
                    });
                }
                if (c === 'eniptcp' && !msOption.eniptcp.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"ENIP-TCP"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.eniptcp.command);
                        setOptions(data.data.nodeTree.nodes[2], msOption.eniptcp.serviceName);
                        setOptions(data.data.nodeTree.nodes[3], msOption.eniptcp.addressType);
                        setOptions(data.data.nodeTree.nodes[4], msOption.eniptcp.dataType);
                        msOption.eniptcp.init = true;
                    });
                }
                if (c === 'enipudp' && !msOption.enipudp.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"ENIP-UDP"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.enipudp.command);
                        msOption.enipudp.init = true;
                    });
                }
                if (c === 'enipio' && !msOption.enipio.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"ENIP-IO"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.enipio.addressType);
                        setOptions(data.data.nodeTree.nodes[2], msOption.enipio.dataType);
                        msOption.enipio.init = true;
                    });
                }
                if (c === 'goose' && !msOption.goose.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"GOOSE"}]'}).then(function () {
                        //setOptions(data.data.nodeTree.nodes[1], msOption.goose.datSet);
                        //setOptions(data.data.nodeTree.nodes[2], msOption.goose.goID);
                        msOption.goose.init = true;
                    });
                }
                if (c === 'sv' && !msOption.sv.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"SV"}]'}).then(function (data) {
                        //setOptions(data.data.nodeTree.nodes[1], msOption.sv.svID);
                        setOptions(data.data.nodeTree.nodes[2], msOption.sv.smpSynch);
                        msOption.sv.init = true;
                    });
                }
                if (c === 'opcua' && !msOption.opcua.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"opcua_tcp"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.opcua.serviceId);
                        msOption.opcua.init = true;
                    });
                }
                if (c === 'snmp' && !msOption.snmp.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"snmp"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.snmp.pduType);
                        //setOptions(data.data.nodeTree.nodes[2], msOption.snmp.version);
                        //setOptions(data.data.nodeTree.nodes[3], msOption.snmp.community);
                        msOption.snmp.init = true;
                    });
                }
                if (c === 'focas' && !msOption.focas.init) {
                    Custom.getData({'currentValue': '[{"name":"协议","value":"focas"}]'}).then(function (data) {
                        setOptions(data.data.nodeTree.nodes[1], msOption.focas.command);
                        setOptions(data.data.nodeTree.nodes[2], msOption.focas.type);
                        setOptions(data.data.nodeTree.nodes[3], msOption.focas.function_key);
                        setOptions(data.data.nodeTree.nodes[4], msOption.focas.func);
                        msOption.focas.init = true;
                    });
                }
                var advancedSearchOptions = [
                    {
                        'name': 'packetTimestamp',
                        'display': '日期',
                        'input': 'timerange',
                        'option': true,
                        value: [],
                        'options': []
                    },
                    {'name': 'sourceIp', 'display': '源IP地址', 'input': 'ipAdress', 'option': false, value: ""},
                    {'name': 'sourceMac', 'display': '源MAC地址', 'input': 'macAdress', 'option': false, value: ""},
                    {'name': 'sourcePort', 'display': '源端口', 'input': 'portNum', 'option': false, value: ""},
                    {'name': 'destinationIp', 'display': '目标IP地址', 'input': 'ipAdress', 'option': false, value: ""},
                    {'name': 'destinationMac', 'display': '目标MAC地址', 'input': 'macAdress', 'option': false, value: ""},
                    {'name': 'destinationPort', 'display': '目标端口', 'input': 'portNum', 'option': false, value: ""}
                ];

                fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac'];
                if (c === 'modbus') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'func', 'startAddr', 'endAddr'];
                    advancedSearchOptions.push({
                        'name': 'func',
                        'display': '功能码',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.modbus.func
                    });
                    advancedSearchOptions.push({
                        'name': 'startAddr',
                        'display': '起始地址',
                        'input': 'string',
                        'option': false,
                        value: ""
                    });
                    advancedSearchOptions.push({
                        'name': 'endAddr',
                        'display': '终止地址',
                        'input': 'string',
                        'option': false,
                        value: ""
                    });
                }
                if (c === 'opcda') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'opInt', 'opCode'];
                    advancedSearchOptions.push({
                        'name': 'opInt',
                        'display': '操作接口',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.opcda.opc
                    });
                    advancedSearchOptions.push({
                        'name': 'opCode',
                        'display': '操作码',
                        'input': 'string',
                        'option': false,
                        value: ""
                    });
                }
                if (c === 's7') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'pduType', 'opType', 'dataType'];
                    advancedSearchOptions.push({
                        'name': 'pduType',
                        'display': 'PDU类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.s7.pdu
                    });
                    advancedSearchOptions.push({
                        'name': 'opType',
                        'display': '操作类型',
                        'input': 'string',
                        'option': false,
                        value: ""
                    });
                    advancedSearchOptions.push({
                        'name': 'dataType',
                        'display': '数据类型',
                        'input': 'string',
                        'option': false,
                        value: ""
                    });
                }
                if (c === 'dnp3') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'func'];
                    advancedSearchOptions.push({
                        'name': 'func',
                        'display': '功能码',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.dnp3.func
                    });
                }
                if (c === 'iec104') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'causetxType', 'asduType'];
                    advancedSearchOptions.push({
                        'name': 'causetxType',
                        'display': 'Causetx类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.iec104.causetx
                    });
                    advancedSearchOptions.push({
                        'name': 'asduType',
                        'display': 'Asdu类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.iec104.asdu
                    });
                }
                if (c === 'mms') {
                    advancedSearchOptions.push({
                        'name': 'pduType',
                        'display': 'PDU类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.mms.pdu
                    });
                    //advancedSearchOptions.push({'name': 'serviceRequest', 'display': '服务类型', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.mms.serviceRequest});
                }
                if (c === 'profinetio') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'func', 'opInt', 'dataType'];
                    advancedSearchOptions.push({
                        'name': 'func',
                        'display': '功能码',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.profinetio.func
                    });
                    advancedSearchOptions.push({
                        'name': 'opInt',
                        'display': '操作接口',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.profinetio.opp
                    });
                    advancedSearchOptions.push({
                        'name': 'dataType',
                        'display': '数据类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.profinetio.dataType
                    });
                }
                if (c === 'pnrtdcp') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'frameid', 'serviceid', 'servicetype', 'dcpoption', 'dcpsuboption'];
                    advancedSearchOptions.push({
                        'name': 'frameid',
                        'display': 'frame标识号',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.pnrtdcp.frameid
                    });
                    advancedSearchOptions.push({
                        'name': 'serviceid',
                        'display': '服务标识号',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.pnrtdcp.serviceid
                    });
                    advancedSearchOptions.push({
                        'name': 'servicetype',
                        'display': '服务类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.pnrtdcp.servicetype
                    });
                    //advancedSearchOptions.push({'name': 'dcpoption', 'display': '选项', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.pnrtdcp.dcpoption});
                    //advancedSearchOptions.push({'name': 'dcpsuboption', 'display': '子选项', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.pnrtdcp.dcpsuboption});
                }
                if (c === 'eniptcp') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'command', 'serviceName', 'addressType', 'dataType'];
                    advancedSearchOptions.push({
                        'name': 'command',
                        'display': '命令',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.eniptcp.command
                    });
                    //advancedSearchOptions.push({'name': 'serviceName', 'display': '服务码', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.eniptcp.serviceName});
                    //advancedSearchOptions.push({'name': 'addresstype', 'display': '地址类型', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.eniptcp.addresstype});
                    //advancedSearchOptions.push({'name': 'datatype', 'display': '数据类型', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.enipio.datatype});
                }
                if (c === 'enipudp') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'command'];
                    advancedSearchOptions.push({
                        'name': 'command',
                        'display': '命令',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.enipudp.command
                    });
                }
                if (c === 'enipio') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'addressType', 'dataType'];
                    advancedSearchOptions.push({
                        'name': 'addressType',
                        'display': '地址类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.enipio.addressType
                    });
                    advancedSearchOptions.push({
                        'name': 'dataType',
                        'display': '数据类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.enipio.dataType
                    });
                }
                if (c === 'goose') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'datSet', 'goID'];
                    //advancedSearchOptions.push({'name': 'datSet', 'display': '数据集', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.goose.datSet});
                    //advancedSearchOptions.push({'name': 'goID', 'display': 'go标识号', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.goose.goID});
                }
                if (c === 'sv') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'svID', 'smpSynch'];
                    //advancedSearchOptions.push({'name': 'svID', 'display': 'sv编号', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.sv.svID});
                    advancedSearchOptions.push({
                        'name': 'smpSynch',
                        'display': '采样同步',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.sv.smpSynch
                    });
                }
                if (c === 'opcua') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'serviceid'];
                    advancedSearchOptions.push({
                        'name': 'serviceid',
                        'display': '服务码',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.opcua.serviceId
                    });
                }
                if (c === 'snmp') {
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', 'pduType'];
                    advancedSearchOptions.push({
                        'name': 'pduType',
                        'display': 'PDU类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.snmp.pduType
                    });
                    //advancedSearchOptions.push({'name': 'version', 'display': '版本', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.snmp.version});
                    //advancedSearchOptions.push({'name': 'community', 'display': '团队类型', 'input': 'list_checkbox', 'option': true, value: [], 'options': msOption.snmp.community});
                }
                if (c === 'focas') {
                    //fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac',"type","function_key","func"];
                    fields = ['protocolSourceName', 'sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'sourceMac', 'destinationMac', "command", "type", "function_key", "func"];
                    advancedSearchOptions.push({
                        'name': 'command',
                        'display': '命令',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.focas.command
                    });
                    advancedSearchOptions.push({
                        'name': 'type',
                        'display': '操作类型',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.focas.type
                    });
                    advancedSearchOptions.push({
                        'name': 'function_key',
                        'display': '按键',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.focas.function_key
                    });
                    advancedSearchOptions.push({
                        'name': 'func',
                        'display': '功能码',
                        'input': 'list_checkbox',
                        'option': true,
                        value: [],
                        'options': msOption.focas.func
                    });
                }
                var config = {
                    name: 'audit',
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    fields: fields,
//                    dateTimeRange: 'timestamp',
                    advancedSearch: 'protocol'
                };
                ctrl.query = ctrl.isSearching = ctrl.advancedSearchQuery = "";
                angular.extend(config, {
                    advancedSearchOptions: advancedSearchOptions
                });
                ctrl.disableToolbar = true;
                ctrl.setConfig(config);
            }

            var vm = this;
            vm.sTime;
            vm.eTime;
            $rootScope.$on('getPoolLinesDetail', function (e, sTime, eTime, fromName, toName, protocolType) {
                //protocolType = (protocolType==='Modbus-TCP'?'modbus':protocolType);
                vm.sTime = sTime;
                vm.eTime = eTime;
                var playload = "(((sourceIp eq '" + fromName + "') and (destinationIp eq '" + toName + "')) or ((sourceIp eq '" + toName + "') and (destinationIp eq '" + fromName + "')))  and   (packetTimestamp gt '" + vm.sTime + "' and packetTimestamp lt '" + vm.eTime + "') and (protocolSourceName eq '" + protocolType + "')";

                scope.protocol = protocolType;

                ctrl.disableToolbar = true;

                ctrl.getDataByCustomParameter(playload);
            });

            function getCount(params) {
                var hasAdvanceSearch = ctrl.advancedSearchQuery !== '' || ctrl.query !== '';
                /*if (scope.protocol && scope.protocol !== 'normal') {
                 if (!_.contains(params['$filter'], scope.protocol)) {
                 params['$filter'] += " and (contains(protocolSourceName,'" + scope.protocol + "'))";
                 }
                 }*/
                return Audit.getCount(params, scope.protocol, hasAdvanceSearch);
            }

            function search(params) {
                scope.params = params;
                return getAll(params);
            }

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'packetTimestamp desc';
                }
                var hasAdvanceSearch = ctrl.advancedSearchQuery !== '' || ctrl.query !== '';
                if (scope.protocol && scope.protocol !== 'normal') {
                    /* if (hasAdvanceSearch) {
                     //params['$groupby'] = ['sourceIp', 'sourcePort', 'destinationIp', 'destinationPort', 'protocolType', 'protocolTypeName', 'protocolSourceName'];
                     //params['$groupby'] = ['flowdataHeadId' ,'sourceMac','destinationMac','sourceIp','sourcePort','destinationIp','destinationPort','protocolType','protocolTypeName','protocolSourceName','packetTimestamp'  ,'dpiIp', 'dpiPort','boxId','deviceId','headCreatedAt']
                     }*/
                    if (!_.contains(params['$filter'], scope.protocol)) {
                        params['$filter'] += " and (contains(protocolSourceName,'" + scope.protocol + "'))";
                    }
                }
                scope.params = params;
                //console.log(params);

                return Audit.getAll(params, scope.protocol, hasAdvanceSearch).then(function (listData) {
                    //return listData;
                    if (listData.length > 0 && hasAdvanceSearch) {
                        return $q.all(listData).then(function () {
                            listData.map(function (d, i) {
                                if (listData[i].protocolSourceName === 'goose' || listData[i].protocolSourceName === 'sv') {
                                    listData[i].flowTimestamp = listData[i].packetTimestamp;
                                }
                                var timestamp = listData[i].flowTimestamp || listData[i].packetTimestamp;
                                listData[i].flowTimestampLocal = new Date(timestamp);
                                listData[i].getDetails = getDetails;
                            });
                            return listData;
                        });
                    } else {
                        return [];
                    }
                    /*return listData.length ? $q.all(listData).then(function () {
                     listData.map(function (d, i) {
                     if (listData[i].protocolSourceName === 'goose' || listData[i].protocolSourceName === 'sv') {
                     listData[i].flowTimestamp = listData[i].packetTimestamp;
                     }
                     var timestamp = listData[i].flowTimestamp || listData[i].packetTimestamp;
                     listData[i].flowTimestampLocal = new Date(timestamp);
                     listData[i].getDetails = getDetails;
                     });
                     return listData;
                     }) : [];*/
                });
            }

            function getDetails(audit) {
                if (audit.detail || scope.factoryProtocolOptions && scope.factoryProtocolOptions.filter(function (b) {
                        return scope.protocol === b.value;
                    })[0]) {
                    return;
                }
                audit.flowTimestampLocal = new Date(audit.flowTimestampLocal);
                Audit.get(audit.flowdataHeadId, audit.protocolSourceName).then(function (detail) {
                    for (var index in detail) {
                        if (index) {
                            detail[index].packetTimestampLocal = new Date(detail[index].packetTimestamp);
                        }
                    }
                    audit.detail = detail || [];
                });
            }

            scope.openImportPanel = function (extension) {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmInputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm',
                    resolve: {
                        extension: function () {
                            return extension;
                        }
                    }
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, extension) {
                    $scope.extension = extension;
                    $scope.addPsw = '1';
                    $scope.uploader = new FileUploader({
                        url: URI + '/auditlogs/topology/' + topologyId.id + '/import',
                        autoUpload: false,
                        queueLimit: 1
                    });

                    $scope.uploader.onErrorItem = function (item, response) {
                        console.log(item);
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '导入协议审计失败： ' + response.error
                        });
                    };
                    $scope.uploader.onSuccessItem = function () {
                        $timeout(function () {
                            $state.reload();
                        }, 2000);
                        $rootScope.addAlert({
                            type: 'success',
                            content: '导入协议审计成功！'
                        });
                    };

                    $scope.upload = function () {
                        $modalInstance.close();
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
            scope.openExportPanel = function (flag, type) {
                /*
                 * Because type is now being selected automatically from dtable.filter,
                 * a conversion is needed to change 'normal' to 'all' to preserve function consistency.
                 * (Shawn)
                 */
                type = (type === 'normal' ? 'all' : type);
                var p = flag ? scope.params : {};
                p.$limit = 100000;
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        var regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*(_|[^\w])).+$/g;
                        return psw && psw.match(regex) && psw.length >= 8;
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        Audit.getAllExport(p, psw, type).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
            scope.supportIpAndPort = function (protocolType) {
                switch (protocolType.toLowerCase()) {
                    case "goose":
                    case "sv":
                    case "pnrtdcp":
                        return false;
                    default :
                        return true;
                }
            };

            ctrl.showDetailWindow = function (auditHeadInfo) {
                $q.all([]).then(function () {
                    var modalInstance = $modal.open({
                        templateUrl: 'templates/protocolaudit/detail-panel.html',
                        size: 'lg',
                        controller: ModalInstanceCtrl
                    });
                    modalInstance.result.then(function (msg) {
                        console.log(msg);
                    }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                    });

                    function ModalInstanceCtrl($scope, $modalInstance) {
                        $scope.getData = function () {
                            var detailData = auditHeadInfo;
                            detailData.unitSize = "B";
                            if (detailData.packetLenth && detailData.packetLenth >= 1024) {
                                detailData.packetLenth /= 1024;
                                detailData.unitSize = "KB";
                            }
                            if (detailData.packetLenth && detailData.packetLenth >= 1024) {
                                detailData.packetLenth /= 1024;
                                detailData.unitSize = "MB";
                            }
                            detailData.flowTimestampLocal = auditHeadInfo.flowTimestampLocal;
                            detailData.sourceIp = auditHeadInfo.sourceIp;
                            detailData.sourceMac = auditHeadInfo.sourceMac;
                            detailData.sourcePort = auditHeadInfo.sourcePort;
                            detailData.destinationIp = auditHeadInfo.destinationIp;
                            detailData.destinationMac = auditHeadInfo.destinationMac;
                            detailData.destinationPort = auditHeadInfo.destinationPort;
                            detailData.protocolSourceName = auditHeadInfo.protocolSourceName;
                            $scope.auditDataDetail = detailData;
                        };
                        $scope.getData();

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };

                        $scope.done = function () {
                            $modalInstance.close('done');
                        };

                        $scope.trim = function (input) {
                            input = (input === null || input === undefined) ? '' : String(input);
                            return input.replace(/(^\s*)|(\s*$)/g, '');
                        };

                        $scope.supportIpAndPort = function (protocolType) {
                            return scope.supportIpAndPort(protocolType);
                        };

                        $scope.exportFile = function (flag, headid) {
                            var params = flag ? $scope.params : {};
                            params.$limit = 100000;
                            //if (headid > 0) {
                            //    params.$filter = 'flowdataHeadId eq ' + headid;
                            //}
                            $q.all().then(function () {
                                Audit.getAuditProtocolExport(params, $scope.auditDataDetail.fileZipPsw, $scope.auditDataDetail.protocolSourceName, headid).then(function (data) {
                                    window.open('./' + data, '_self');
                                });
                            });
                        };
                        /*
                         $scope.downloadFile = function (fileId, fileName, timeoutFlag) {
                         var downloadFile = function () {
                         Audit.getDownloadFileZipPath($scope.auditDataDetail, fileId).then(function (data) {
                         var file = new Blob([data.data], { type: 'application/zip' });
                         saveAs(file, fileName?(fileName + ".zip"):"file.zip");
                         });
                         };
                         $scope.getData().then(function (){
                         function ModalInstanceCtrlConfirm($scope, $modalInstance) {
                         $scope.fileName = fileName;
                         $scope.cancel = function () {
                         $modalInstance.dismiss('cancel');
                         };
                         $scope.confirm = function () {
                         downloadFile();
                         $modalInstance.close('done');
                         };
                         }
                         if(timeoutFlag){
                         var modalInstanceConfirm = $modal.open({
                         templateUrl: 'templates/reduction/confirmDownload.html',
                         size: 'sm',
                         controller: ModalInstanceCtrlConfirm
                         });
                         modalInstanceConfirm.result.then(function (msg) {
                         console.log(msg);
                         }, function () {
                         console.log('Modal dismissed at: ' + new Date());
                         });
                         }else{
                         downloadFile();
                         }
                         });
                         };
                         $scope.downloadZip = function () {
                         $scope.getData().then(function (){
                         Audit.getDownloadZipPath($scope.auditDataDetail).then(function (data) {
                         window.open('./' + data.data, '_self');
                         }, function () {
                         $modalInstance.close('done');
                         $rootScope.addAlert({
                         type: 'danger',
                         content: '文件下载失败'
                         });
                         });
                         $modalInstance.close('done');
                         });
                         };*/
                    }
                });
            };
        }
    }

    function AuditDetailTable($q, $filter, Audit) {
        var auditDetailTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/protocolaudit/auditDetailTab.html',
            link: link
        };

        return auditDetailTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var config = {
                name: 'audit',
                pagination: true,
                scrollable: false,
                totalCount: true,
                numPerPage: 8,
                getAll: getAll,
                getCount: getCount
            };
            ctrl.setConfig(config);
            ctrl.disableToolbar = true;//hide search bar
            scope.listInfoHead = getTableHeads(scope.auditDataDetail.protocolSourceName.toLowerCase());

            function getCount() {
                var auditDataDetail = scope.auditDataDetail;
                return Audit.getDetailsCount(auditDataDetail.flowdataHeadId, auditDataDetail.protocolSourceName.toLowerCase()).then(function (count) {
                    return count;
                });
            }

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'packetTimestamp desc';
                }
                scope.params = params;
                var detailData = scope.auditDataDetail;
                var type = detailData.protocolSourceName.toLowerCase();
                return Audit.getDetails(scope.params, detailData.flowdataHeadId, type).then(function (data) {
                    return data.length ? $q.all(data).then(function () {
                        return getTableDatas(data, type);
                    }) : [];
                });
            }

            function getTableHeads(protocolType) {
                var heads = [];
                switch (protocolType) {
                    case "http":
                        heads = ["记录时间", "目标URL"];
                        break;
                    case "ftp":
                        heads = ["记录时间", "使用账号", "输入命令"];
                        break;
                    case "telnet":
                        heads = ["记录时间", "使用账号", "输入命令"];
                        break;
                    case "smtp":
                        heads = ["记录时间", "源信箱地址", "目的信箱地址"];
                        break;
                    case "pop3":
                        heads = ["记录时间", "源信箱地址", "目的信箱地址"];
                        break;
                    case 'modbus':
                        heads = ["记录时间", '功能码', '起始地址', '终止地址'];
                        break;
                    case 'opcda':
                        heads = ["记录时间", '操作接口', '操作码'];
                        break;
                    case 's7':
                        heads = ["记录时间", 'PDU类型', '操作类型', '数据类型'];
                        break;
                    case 'dnp3':
                        heads = ["记录时间", '功能码'];
                        break;
                    case 'iec104':
                        heads = ["记录时间", 'Causetx类型', 'Asdu类型'];
                        break;
                    case 'mms':
                        heads = ["记录时间", 'PDU类型', '服务请求类型'];
                        break;
                    case 'profinetio':
                        heads = ["记录时间", '功能码', '操作接口', '数据类型'];
                        break;
                    case 'pnrtdcp':
                        heads = ["记录时间", 'frame标识号', '服务标识号', '服务类型', '选项', '子选项'];
                        break;
                    case 'enipio':
                        heads = ["记录时间", '地址类型', '数据类型'];
                        break;
                    case 'eniptcp':
                        heads = ["记录时间", '命令', '服务码', '地址类型', '数据类型'];
                        break;
                    case 'enipudp':
                        heads = ["记录时间", '命令'];
                        break;
                    case 'goose':
                        heads = ["记录时间", "数据集", 'GO标识号'];
                        break;
                    case 'sv':
                        heads = ["记录时间", "SV编号", '采样同步'];
                        break;
                    case 'snmp':
                        heads = ["记录时间", "PDU类型", "版本", "团体名"];
                        break;
                    case 'opcua':
                        heads = ["记录时间", "服务码"];
                        break;
                    case 'focas':
                        heads = ["记录时间", "命令", "操作类型", "按键", "功能码"];
                        break;
                    default:
                        break;
                }
                return heads;
            }

            function getTableDatas(rawDatas, protocolType) {
                var datas = [];
                switch (protocolType) {
                    case "http":
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.url)
                            );
                        });
                        break;
                    case "ftp":
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.accountName, valObj.command));
                        });
                        break;
                    case "telnet":
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.accountName, valObj.command));
                        });
                        break;
                    case "smtp":
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.souceMailAddress, valObj.destMailAddress));
                        });
                        break;
                    case "pop3":
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.souceMailAddress, valObj.destMailAddress));
                        });
                        break;
                    case 'modbus':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.func, valObj.startAddr, valObj.endAddr)
                            );
                        });
                        break;
                    case 'opcda':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.opInt, valObj.opCode)
                            );
                        });
                        break;
                    case 's7':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.pduType, valObj.opType, valObj.dataType)
                            );
                        });
                        break;
                    case 'dnp3':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.func)
                            );
                        });
                        break;
                    case 'iec104':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.causetxType, valObj.asduType)
                            );
                        });
                        break;
                    case 'mms':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.pduType, valObj.serviceRequest)
                            );
                        });
                        break;
                    case 'profinetio':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.func, valObj.opInt, valObj.dataType)
                            );
                        });
                        break;
                    case 'pnrtdcp':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.frameid, valObj.serviceid, valObj.servicetype, valObj.dcpoption, valObj.dcpsuboption)
                            );
                        });
                        break;
                    case 'enipio':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.addressType, valObj.dataType)
                            );
                        });
                        break;
                    case 'eniptcp':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.command, valObj.serviceName, valObj.addressType, valObj.dataType)
                            );
                        });
                        break;
                    case 'enipudp':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.command)
                            );
                        });
                        break;
                    case 'goose':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.datSet, valObj.goID)
                            );
                        });
                        break;
                    case 'sv':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.svID, valObj.smpSynch)
                            );
                        });
                        break;
                    case 'snmp':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.pduType, valObj.version, valObj.community)
                            );
                        });
                        break;
                    case 'opcua':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.serviceId)
                            );
                        });
                        break;
                    case 'focas':
                        rawDatas.map(function (valObj) {
                            datas.push(
                                new Array($filter("date")(new Date(valObj.packetTimestamp), "yyyy-MM-dd HH:mm:ss"), valObj.command, valObj.type, valObj.function_key, valObj.func)
                            );
                        });
                        break;
                    default:
                        break;
                }
                return datas;
            }
        }
    }
})();
