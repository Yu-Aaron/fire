/*****************************
 *    UCD Control Service
 *****************************/
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('snVal', snVal);

    function snVal() {

        var service = {
            validSNFormat: validSNFormat,
            getModelBySN: getModelBySN
        };
        return service;

        function validSNFormat(sn) {
            if (!sn || sn.length !== 16) {
                return false;
            } else {
                var ports = sn.slice(2, 4);
                if (isNaN(ports)) {
                    return false;
                }
                var version = sn.slice(4, 6);
                if (isNaN(version)) {
                    return false;
                }
                var year = sn.slice(6, 7);
                if (!year.match(/[A-Z]/)) {
                    return false;
                }
                var month = sn.slice(7, 8);
                if (isNaN(month)) {
                    if (!month.match(/[A-C]/)) {
                        return false;
                    }
                } else {
                    if (month === '0') {
                        return false;
                    }
                }
                var number = sn.slice(8);
                if (isNaN(number)) {
                    return false;
                }
            }
            return true;
        }

        function getModelBySN(sn, forms) {
            var modelParse, model = {};
            if (sn && sn.length >= 4) {
                var type = sn.slice(0, 2);
                if (type === 'JA' || type === 'JC' || type === 'JS') {
                    modelParse = 'KEA';
                } else if (type === 'SC') {
                    modelParse = 'KED';
                } else if (type === 'ZB') {
                    modelParse = 'KEV';
                } else if (type === 'SS') {
                    modelParse = 'KEC';
                } else {
                    return '';
                }
                var ports = sn.slice(2, 4);
                var version = sn.slice(4, 6);
                if (ports === '01') {
                    if (type === 'JA' || type === 'JS') {
                        return '';
                    }
                    modelParse += (modelParse === 'KEC') ? '-U1000' : '-C200';
                } else if (ports === '02') {
                    if (type === 'JA' || type === 'JC' || type === 'SS') {
                        return '';
                    }
                    modelParse += '-C400';
                } else if (ports === '03') {
                    if (type === 'JC' || type === 'JS' || type === 'SS') {
                        return '';
                    }
                    modelParse += (modelParse === 'KEA') ? ((version === '02') ? '-U1000E' : '-U1000') : '-U800';
                } else if (ports === '04') {
                    if (type === 'JC' || type === 'JS' || type === 'SS') {
                        return '';
                    }
                    modelParse += (modelParse === 'KEA') ? '-U2000' : '-U1600';
                } else if (ports === '05') {
                    if (type === 'JC' || type === 'JS' || type === 'SS') {
                        return '';
                    }
                    modelParse += '-U1142';
                } else {
                    return '';
                }
                for (var i in forms) {
                    if (i && forms[i]['iconType'] && forms[i]['model'] === modelParse) {
                        model['id'] = forms[i]['modelId'];
                        model['modelName'] = forms[i].model_name + ' / ' + forms[i].model;
                        model['model'] = modelParse;
                        break;
                    }
                }
            }
            return model;
        }

    }

//序列号的规则如下
//
//Example: ZB0401AC00000001
//
//ZB     04        01       A                          C                 00000001
//产品线  硬件子类型  硬件版本  出厂年份　A:2014, B:2015...  出厂月份 1~9,A,B,C  流水号
//
//设备型号     设备名称          设备序列号    端口数  注解                                               对应MC软件版本(通用版本)
//KEV-U1600   IAD智能保护平台   ZB0401 +...  16                                                       C00
//KEV-U800    IAD智能保护平台   ZB0301 +...  8                                                        C00
//KEV-C400    IAD智能保护平台   ZB0201 +...  4                                                        C00
//KEV-C200    IAD智能保护平台   ZB0101 +...  2                                                        C00
//KEA-U2000   监测审计平台      JA0401 +...  2      J：监测审计产品线　A：单体机　04：KEA-U2000　01：硬件版本  JA00
//KEA-U1000E  监测审计平台      JA0302 +...  5      J：监测审计产品线　A：单体机　03：KEA-U1000E　02：硬件版本 JA00
//KEA-U1000   监测审计平台      JA0301 +...  2      J：监测审计产品线　A：单体机　03：KEA-U1000　01：硬件版本  JA00
//KEA-C400    监测审计平台      JS0201 +...  4      已发货所以保留JS0201                                 C00
//KEA-C200    监测审计平台      JC0101 +...  2      J：监测审计产品线　C：遠端　01：KEA-C200　01：硬件版本      C00
//KED-U1600   数据采集隔离平台   SC0401 +...  16                                                       C00
//KED-U800    数据采集隔离平台   SC0301 +...  8                                                        C00
//KED-C400    数据采集隔离平台   SC0201 +...  4                                                        C00
//KED-C200    数据采集隔离平台   SC0101 +...  2                                                        C00
//KEC-U1000   数控审计保护平台   SS0101 +...  4                                                        X02
})();
