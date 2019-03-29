/**
 * Strategy Filter
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter("strategyAction", [
            function () {
                return function (key) {
                    var map = {
                        'ALLOW': '放行',
                        'REJECT': '阻断',
                        'pass': '放行',
                        'drop': '阻断'
                    };
                    return map[key] || key;
                };
            }
        ])
        .filter("strategyExpression", [
            function () {
                return function (key) {
                    var map = {
                        'eq': '等于',
                        'ne': '不等于',
                        'gt': '大于',
                        'ge': '大于等于',
                        'lt': '小于',
                        'le': '小于等于',
                        'rg': '范围'
                    };
                    return map[key] || key;
                };
            }
        ])
        .filter("appIdToProtocol", [
            function () {
                return function (key) {
                    var map = {
                        '616': 'DNP3',
                        '737': 'Modbus-TCP',
                        '4200': 'Modbus-UDP'
//                        '1098': 'OPCDA',
//                        '2042': 'OPCUA-TCP'
                    };
                    return key?map[key]:null;
                };
            }
        ])
        .filter("protocolValueTemplate", [
            function () {
                return function (protocolType) {
                    var template = 'templates/strategy/security/protocoltemplates/funcCodeStaticValueTpl.html';
                    switch(protocolType) {
                        case 'DNP3':
                            template = 'templates/strategy/security/protocoltemplates/funcCodeRefOptionValueTpl.html';
                            break;
                        default:
                            break;
                    }
                    return template;
                };
            }
        ])
        .filter("protocolTranslation", [
            function () {
                return function (input, protocolType) {
                    var map = null;
                    switch(protocolType){
                        case 'Modbus-TCP':
                        case 'Modbus-UDP':
                            map = {
                                'Read_Coils': '读线圈',
                                'Read_Discrete_Inputs': '读输入离散量',
                                'Read_Holding_Registers': '读保持寄存器',
                                'Read_Input_Register': '读输入寄存器',
                                'Write_Single_Coil': '写单个线圈',
                                'Write_Single_Register': '写单个寄存器',
                                'Read_Exception_Status': '读异常状态',
                                'Diagnostic': '诊断',
                                'Program_484': 'Program_484',
                                'Poll_484': 'Poll_484',
                                'Get_Com_Event_Counter': 'Get_Com_Event_Counter',
                                'Get_Com_Event_Log': 'Get_Com_Event_Log',
                                'Program_Controller': 'Program_Controller',
                                'Poll_Controller': 'Poll_Controller',
                                'Write_Multiple_Coils': '写多个线圈',
                                'Write_Multiple_Registers': '写多个寄存器',
                                'Report_Slave_ID': '报告从设备ID',
                                'Program_884/M84': 'Program_884/M84',
                                'Reset_Comm._Link': 'Reset_Comm._Link',
                                'Read_File_Record': '读文件记录',
                                'Write_File_Record': '写文件记录',
                                'Mask_Write_Register': '屏蔽写寄存器',
                                'Read_Write_Multiple_Registers': '读写多个寄存器',
                                'Read_FIFO_Queue': '读队列',
                                'Read_Device_Identification': '读设备识别码',

                                'startaddr': '起始地址',
                                'endaddr': '数量',
                                'data': '数值',
                                'subfunc': '异常码',
                                'refaddr': '参考地址',
                                'rdstartaddr': '读起始地址',
                                'rdendaddr': '读数量',
                                'wtstartaddr': '写起始地址',
                                'wtendaddr': '写数量',
                                'fifoaddr': '队列地址',
                                'meitype': 'MEI类型'
                            };
                            break;
                        case 'DNP3':
                            map = {
                                'object': '对象',
                                'value': '数值',
                                'obj0101': '单位二进制输入',
                                'obj0102': '带status的二进制输入',
                                'obj0201': '不带时间的二进制变位输入',
                                'obj0202': '带变位时间的二进制输入',
                                'obj0203': '带相对时间的二进制变位输入',
                                'obj1001': '二进制输出',
                                'obj1002': '带status的二进制输出',
                                'obj1201': '控制继电器的输出块',
                                'obj1202': '模式控制块（PCB）',
                                'obj2001': '32位二进制计数器',
                                'obj2002': '16位二进制计数器 ',
                                'obj2003': '32位增值计数器（Dalta count）',
                                'obj2004': '16位增值计数器',
                                'obj2005': '32位不带标志的二进制计数器 ',
                                'obj2006': '16位不带标志的二进制计数器 ',
                                'obj2007': '32位不带标志的增值计数器',
                                'obj2008': '16位不带标志的增值计数器',
                                'obj2101': '32位冻结计数器',
                                'obj2102': '16位冻结计数器',
                                'obj2103': '32位冻结的增值计数器',
                                'obj2104': '16位冻结的增值计数器',
                                'obj2105': '带冻结时间的32位冻结的计数器',
                                'obj2106': '带冻结时间的16位冻结的计数器',
                                'obj2107': '带冻结时间的32位冻结的增值计数器',
                                'obj2108': '带冻结时间的16位冻结的增值计数器',
                                'obj2109': '无标志的32位冻结计数器',
                                'obj2110': '无标志的16位冻结计数器',
                                'obj2111': '无标志的32位冻结增值计数器',
                                'obj2112': '无标志的16位冻结增值计数器',
                                'obj2201': '无时间的32位事件变化计数器 ',
                                'obj2202': '无时间的16位事件变化计数器 ',
                                'obj2203': '无时间的32位事件变化增值计数器',
                                'obj2204': '无时间的16位事件变化增值计数器',
                                'obj2205': '带时间的32位事件变化计数器',
                                'obj2206': '带时间的16位事件变化计数器',
                                'obj2207': '带时间的32位事件变化增值计数器',
                                'obj2208': '带时间的16位事件变化增值计数器',
                                'obj2301': '不带时间的32位冻结计数器事件',
                                'obj2302': '不带时间的16位冻结计数器事件',
                                'obj2303': '不带时间的32位冻结的delta计数器事件',
                                'obj2304': '不带时间的16位冻结的delta计数器事件',
                                'obj2305': '带时间的32位冻结计数器事件',
                                'obj2306': '带时间的16位冻结计数器事件',
                                'obj2307': '带时间的32位冻结的delta计数器事件',
                                'obj2308': '带时间的16位冻结的delta计数器事件',
                                'obj3001': '32位模拟量输入',
                                'obj3002': '16位模拟量输入 ',
                                'obj3003': '不带标志的32位模拟量输入',
                                'obj3004': '不带标志的16位模拟量输入',
                                'obj3101': '冻结的32位模拟输入',
                                'obj3102': '冻结的16位模拟输入',
                                'obj3103': '带冻结时间的32位冻结的模拟输入',
                                'obj3104': '带冻结时间的16位冻结的模拟输入',
                                'obj3105': '无标志的32位冻结了的模拟输入',
                                'obj3106': '无标志的16位冻结了的模拟输入',
                                'obj3201': '不带时间的32位模拟量变化事件',
                                'obj3202': '不带时间的16位模拟量变化事件',
                                'obj3203': '带时间的32位模拟量变化事件',
                                'obj3204': '带时间的16位模拟量变化事件',
                                'obj3301': '不带时间的32位冻结模拟量事件',
                                'obj3302': '不带时间的16位冻结模拟量事件',
                                'obj3303': '带时间的32位冻结模拟量事件',
                                'obj3304': '带时间的16位冻结模拟量事件',
                                'obj4001': '32位模拟量输出之状态',
                                'obj4002': '16位模拟量输出之状态',
                                'obj4101': '32位模拟量输出块',
                                'obj4102': '16位模拟量输出块',
                                'obj5001': '时间与日期',
                                'obj5002': '带有时间间隔的时间与日期',
                                'obj5101': 'CTO的时间与日期（Comman Time of Occurrence）',
                                'obj5102': '非同步的CTO时间与日期',
                                'obj5201': '粗延时',
                                'obj5202': '精延时',
                                'obj6001': '0类数据',
                                'obj6002': '1类数据',
                                'obj6003': '2类数据',
                                'obj6004': '3类数据',
                                'obj7001': '文件识别码',
                                'obj8001': '内部信号',
                                'obj8101': '存储对象 ',
                                'obj8201': '设备简表（profile）',
                                'obj8301': '保密登记对象（PRO）',
                                'obj8302': '保密登记对象的说明项（PROD）',
                                'obj9001': '应用程序之识别等',
                                'obj10001': '短浮点',
                                'obj10002': '长浮点',
                                'obj10003': '扩充的浮点',
                                'obj10101': '小包装的二进制编码十进制',
                                'obj10102': '中包装的二进制编码十进制',
                                'obj10103': '大包装的二进制编码十进制'
                            };
                            break;
                        default:
                            map = {};
                    }
                    return map[input] || input;
                };
            }
        ]);
})();
