/**
 * Strategy Model
 */

(function () {
    'use strict';

    angular.module("southWest.models")
        .factory("SecurityStrategyModel", SecurityStrategyModel)
        .factory("SessionStateModel", SessionStateModel)
        .factory("SessionControlModel", SessionControlModel)
        .factory("dnatModel", dnatModel)
        .factory("snatModel", snatModel);

    ///////////////////////////
    function SecurityStrategyModel($http, URI, encodeURL, formatVal) {
        var securityurl = URI + '/cpolicy/policy';

        var service = {
            getAll: getAll,
            getCount: getCount,
            searchObjects: searchObjects,
            searchServices: searchServices,
            searchApps: searchApps,
            getTimes: getTimes,
            getTreeNode: getTreeNode,
            formatStrategy:  formatStrategy,
            parseStrategy: parseStrategy,
            initTreeNodeAction: initTreeNodeAction,
            addNewSecurityStrategy: addNewSecurityStrategy,
            updateSecurityStrategy: updateSecurityStrategy,
            deleteSecurityStrategy: deleteSecurityStrategy
        };

        return service;

        //////////
        function getAll(params) {
            var link = securityurl + '/all';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            var link = securityurl + '/all/count';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function searchObjects(params) {
            var link = URI + '/cpolicy/object/names';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                var rst = data.data;
                if(angular.isArray(rst)){
                    rst = rst.map(function(item){
                        if(angular.isString(item)) {
                            return {
                                name: item
                            };
                        }
                        return item;
                    });
                }
                return rst;
            });
        }

        function searchServices(params) {
            var link = URI + '/cpolicy/service/names';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                var rst = data.data;
                if(angular.isArray(rst)){
                    rst = rst.map(function(item){
                        if(angular.isString(item)) {
                            return {
                                name: item
                            };
                        }
                        return item;
                    });
                }
                return rst;
            });
        }

        function searchApps(params) {
            var link = URI + '/cpolicy/apps/names';
            return $http.get(link, {
                params: encodeURL(params)
            }).then(function (data) {
                var rst = data.data;
                if(angular.isArray(rst)){
                    rst = rst.map(function(item){
                        if(angular.isString(item)) {
                            return {
                                name: item
                            };
                        }
                        return item;
                    });
                }
                return rst;
            });
        }

        function getTimes() {
            var link = URI + '/cpolicy/time/names';
            return $http.get(link).then(function (data) {
                return data.data;
            });
        }

        function getTreeNode(params) {
            //协议树节点对象
            function ProtocolNode(tree, funcCode) {
                var vm = this;
                vm.name = funcCode;
                vm.tree = tree;
                vm.detail = funcCode ? (tree[funcCode] ? tree[funcCode] : {}) : null;
                vm.isHavingSubFunc = false;
                vm.isHavingValue = false;
                //////////////////
                vm.getAllFuncCode = function () {
                    var funcCodes = [];
                    var escapeKeys = ['value', 'ref-options'];
                    for (var key in vm.detail) {
                        if (escapeKeys.indexOf(key) < 0) {
                            funcCodes.push(key);
                        }
                    }
                    return funcCodes;
                };

                if (angular.isObject(vm.detail)) {
                    vm.isHavingValue = (angular.isArray(vm.detail.value) && vm.detail.value.length > 0);
                    vm.isHavingSubFunc = vm.getAllFuncCode().length > 0;
                }

                vm.getValueDetail = function (valueObj) {
                    var tempValue = valueObj ? valueObj : angular.copy(vm.detail.value);
                    if (vm.isHavingValue) {
                        tempValue.map(function (item) {
                            //类型：单个或带范围的输入（带或不带表达式）
                            if (angular.isString(item.value)) {
                                var multitmp = item.value.split(',');
                                multitmp.forEach(function(inputrule){
                                    var tmp = inputrule.split('-');
                                    if (tmp.length === 2) {
                                        item.type = item.type?(item.type+'-'+'RANGE'):'RANGE';
                                        item.min = Number(tmp[0]);
                                        item.max = Number(tmp[1]);
                                    } else {
                                        item.type = item.type?(item.type+'-'+inputrule):inputrule;
                                    }
                                });
                            //类型：下拉列表
                            } else if (angular.isArray(item.value)) {
                                item.type = 'OPTION';
                                item.option = [];
                                item.value.forEach(function (val) {
                                    var tmp = angular.isString(val) ? val.split(',') : [];
                                    if (tmp.length === 2) {
                                        var min = Number(tmp[0]);
                                        var max = Number(tmp[1]);
                                        var array = [];
                                        for (var i = min; i <= max; i++) {
                                            array.push(i);
                                        }
                                        Array.prototype.push.apply(item.option, array);
                                    } else {
                                        item.option.push(val);
                                    }
                                });
                            //类型：引用另一个单独数组，每一项的option也可以作为输入项显示到配置中
                            } else if (item.ref && angular.isArray(vm.tree[item.ref])) {
                                item.type = 'REF-OPTION';
                                item.option = angular.copy(vm.tree[item.ref]);
                                item.option.forEach(function (val) {
                                    if(val.option){
                                        vm.getValueDetail(val.option);
                                    }
                                });
                            }
                            return item;
                        });
                    }
                    return tempValue;
                };
            }

            return $http.get('js/protocolTree.json').then(function (data) {
                var tree = data.data;
                var funcCode = 'Modbus-TCP';
                //TODO: 下一个版本要改成从MW获取协议树状态
                if (params && angular.isObject(params)) {
                    params.tree ? tree = params.tree : null;
                    params.funcCode ? funcCode = params.funcCode : null;
                }
                return new ProtocolNode(tree, funcCode);
            });
        }

        //格式化安全策略传输格式以符合api要求
        function formatStrategy(sourceStrategy, treeNodes){
            function formatNode(nodes){
                //带表达式input的参数名称集合,与ProtocolNode类中一致 TODO:以后要传入协议类型，然后按照不同的协议指定不同表达式输入
                var EXPRESSION_INPUT = [{name:'data', expressionKey:'expression'}];
                if(angular.isArray(nodes) && nodes.length > 0){
                    nodes.forEach(function(node){
                        delete node.funcCodes;
                        delete node.nodeIndex;
                        delete node.tree;
                        delete node.value;
                        delete node.isHavingSubFunc;
                        //格式化带表达式的input
                        EXPRESSION_INPUT.forEach(function(input){
                            var expressionObj = node[input.name];
                            if(angular.isObject(expressionObj)){
                                node[input.expressionKey] = expressionObj.expression;
                                node[input.name] = expressionObj.value;
                            }
                        });
                        //DNP3协议的格式化 TODO:以后要传入协议类型，然后按照不同的协议分别进行格式化
                        if(angular.isArray(node.objs) && node.objs.length > 0){
                            node.objs.map(function(object){
                                var strLen = object.refvalue.length;
                                object.Object = object.refvalue?object.refvalue.slice(0, strLen - 2):'';
                                object.Variation = object.refvalue?object.refvalue.slice(-2, strLen):'';
                                delete object.name;
                                delete object.refvalue;
                                delete object.option;
                                EXPRESSION_INPUT.forEach(function(input){
                                    var expressionObj = object[input.name];
                                    if(angular.isObject(expressionObj)){
                                        object[input.expressionKey] = expressionObj.expression;
                                        object[input.name] = expressionObj.value;
                                    }
                                });
                                if(object.value){
                                    if(object.value.indexOf('-')>-1){
                                        var tmp = object.value.split('-');
                                        object.value = "[" + tmp[0] + "," + tmp[1] + "]";
                                    }else{
                                        object.value = "{" + object.value + "}";
                                    }
                                }
                                return object;
                            });
                        }

                        if(angular.isArray(node.nodes) && node.nodes.length > 0){
                            formatNode(node.nodes);
                        }else{
                            delete node.nodes;
                        }
                    });
                }
            }
            var strategy = angular.copy(sourceStrategy);
            var uiRules = angular.copy(treeNodes);
            formatNode(uiRules);
            strategy.uiRules = JSON.stringify(uiRules);
            return strategy;
        }

        //将从api获取的控制规则数据转换为UI可识别属性结构Object
        function parseStrategy(sourceStrategy, rootTree, rootFuncCodes, selectFuncCode){
            //带表达式input的参数名称集合,与ProtocolNode类中一致 TODO:以后要传入协议类型，然后按照不同的协议指定不同表达式输入
            var EXPRESSION_INPUT = [{name:'data', expressionKey:'expression'}];
            //回调函数，根据values值来解析从数据库获取的数据
            function parseObj4RefOption(node){
                //解析DNP3协议　TODO:以后要传入协议类型，然后按照不同的协议分别进行解析
                if(angular.isArray(node.objs) && node.objs.length > 0){
                    var valueLength = angular.isArray(node.value)?node.value.length:0;
                    node.objs = node.objs.map(function(object, index){
                        var keyValue = String.prototype.concat.call(object.Object, object.Variation);
                        delete object.Object;
                        delete object.Variation;
                        EXPRESSION_INPUT.forEach(function(input){
                            var expression = object[input.expressionKey];
                            var data = object[input.name];
                            if(angular.isDefined(expression) && angular.isDefined(data)){
                                object[input.name] = {
                                    'expression': expression,
                                    'value': data
                                };
                                delete object[input.expressionKey];
                            }
                        });
                        if(index < valueLength){
                            node.value[index].option.some(function(item){
                                if(item.refvalue ===  keyValue){
                                    object = angular.extend(item, object);
                                    return true;
                                }
                            });
                        }
                        if(object.value){
                            if(object.value.indexOf('[')===0){
                                var tmp = JSON.parse(object.value);
                                object.value = tmp[0] + "-" + tmp[1];
                            }else{
                                object.value = object.value.slice(1, object.value.length-1);
                            }
                        }
                        return object;
                    });
                }
            }
            //解析节点
            function parseNode(nodes, isFirstLv, parentNode){
                if(angular.isArray(nodes) && nodes.length > 0){
                    nodes.forEach(function(node){
                        //解析带表达式的input
                        EXPRESSION_INPUT.forEach(function(input){
                            var expression = node[input.expressionKey];
                            var data = node[input.name];
                            if(angular.isDefined(expression) && angular.isDefined(data)){
                                node[input.name] = {
                                    'expression': expression,
                                    'value': data
                                };
                                delete node[input.expressionKey];
                            }
                        });
                        if(isFirstLv){
                            node.tree = rootTree;
                            node.funcCodes = rootFuncCodes;
                            selectFuncCode(node, parseObj4RefOption);
                            if(angular.isArray(node.nodes) && node.nodes.length > 0){
                                parseNode(node.nodes, false, node);
                            }else{
                                node.nodes = [];
                            }
                        }else{
                            var payload = {
                                tree: parentNode.tree,
                                funcCode: parentNode.funcCode
                            };
                            getTreeNode(payload).then(function(funcNode){
                                //子功能码列表
                                var funcCodes = funcNode.getAllFuncCode();
                                node.tree = funcNode.detail;
                                node.funcCodes = funcCodes;
                                node.nodeIndex = parentNode.nodeIndex;
                                selectFuncCode(node, parseObj4RefOption);
                                if(angular.isArray(node.nodes) && node.nodes.length > 0){
                                    parseNode(node.nodes, false, node);
                                }else{
                                    node.nodes = [];
                                }
                            });
                        }
                    });
                }
            }
            var treeNodes = sourceStrategy.uiRules?JSON.parse(sourceStrategy.uiRules):'';
            parseNode(treeNodes, true);
            return treeNodes;
        }

        //初始化控件中各个node的action
        function initTreeNodeAction(scope) {
            //节点类型识别
            scope.isTypeOption = function(type){
                return type === 'OPTION';
            };
            scope.isTypeRefOption = function(type){
                return type === 'REF-OPTION';
            };
            scope.isTypeInputSingle = function(type){
                return type === 'RANGE' || type === 'SINGLE';
            };
            scope.isTypeInputMulti = function(type){
                return type.indexOf('DISCRETE') > -1 || type.indexOf('LIMIT') > -1;
            };
            scope.isTypeExpression = function(type){
                return type.indexOf('EXPRESSION') > -1;
            };

            //动作列表
            scope.actions = ['pass', 'drop'];

            //增加一级节点
            scope.addNewFuncCode = function(){
                scope.treeNodes.push({
                    tree: scope.rootTree,
                    funcCodes: scope.funcCodes,
                    funcCode: scope.funcCodes.length>0?scope.funcCodes[0]:'',
                    action: 'pass',
                    nodes: []
                });
                scope.selectFuncCode(scope.treeNodes[scope.treeNodes.length - 1]);
            };

            //树形结构展开
            scope.toggle = function (scopeParam) {
                scopeParam.toggle();
            };

            //功能码选择
            scope.selectFuncCode = function(node, callback){
                var payload = {
                    tree: node.tree,
                    funcCode: node.funcCode
                };
                //删除前一个功能码的数据设定
                if(angular.isArray(node.value)){
                    node.value.forEach(function(value){
                        if(node[value.name]){
                            delete node[value.name];
                        }
                    });
                }

                getTreeNode(payload).then(function(funcNode){
                    //获取功能码对应的输入参数
                    node.value = angular.copy(funcNode.getValueDetail());
                    //初始化ref-option-index
                    if(node.value){
                        node.value.map(function(value, index){
                            if(payload.tree['ref-options']){
                                value.refValueIndex = index;
                                return value;
                            }
                        });
                    }
                    node.isHavingSubFunc = funcNode.isHavingSubFunc;
                    callback?callback(node):null;
                });
            };

            //删除节点
            scope.remove = function (scopeParam) {
                scopeParam.remove();
            };

            //新增子节点
            scope.newSubNode = function (scopeParam) {
                scopeParam.expand();//强制父节点为打开状态
                var nodeData = scopeParam.$modelValue;
                var payload = {
                    tree: nodeData.tree,
                    funcCode: nodeData.funcCode
                };
                getTreeNode(payload).then(function(funcNode){
                    //子功能码列表
                    var funcCodes = funcNode.getAllFuncCode();
                    nodeData.nodes.push({
                        tree: funcNode.detail,
                        funcCodes: funcCodes,
                        funcCode: funcCodes.length>0?funcCodes[0]:'',
                        action: 'pass',
                        nodeIndex: nodeData.nodeIndex,  //继承父节点的nodeIndex值，保证所有子节点name不重复(form验证)
                        nodes: []
                    });
                    scope.selectFuncCode(nodeData.nodes[nodeData.nodes.length - 1]);
                });
            };

            //input的范围校验
            scope.checkRangeVal = function(input, params){
                if(input && params){
                    if(params.type){
                        var rst = formatVal.validateValueInput(input, params.type);
                        if(rst){
                            var tmpInput = [input];
                            if(input.indexOf('-') >= 0){
                                tmpInput = input.split('-');
                                if(Number(tmpInput[0]) > Number(tmpInput[1])){
                                    return false;
                                }
                            }
                            if(angular.isDefined(params.min) && angular.isDefined(params.max)){
                                var min = Number(params.min);
                                var max = Number(params.max);
                                if(input.indexOf(',') >= 0){
                                    tmpInput = input.split(',');
                                }
                                tmpInput.some(function(value){
                                    value = Number(value);
                                    rst = (value>=min && value<=max);
                                    return !rst;
                                });
                            }
                        }
                        return rst;
                    }else if(angular.isDefined(params.min) && angular.isDefined(params.max)){
                        input = Number(input);
                        return (input>=Number(params.min) && input<=Number(params.max));
                    }
                }
                return true;
            };
        }

        function addNewSecurityStrategy(data, callback) {
            return $http({
                url: securityurl,
                method: 'POST',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function updateSecurityStrategy(data, callback) {
            return $http({
                url: securityurl,
                method: 'PUT',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }

        function deleteSecurityStrategy(data, callback) {
            return $http({
                url: securityurl,
                method: 'DELETE',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                    callback(null, data.error);
                });
        }
    }

    ///////////////////////////
    function SessionStateModel($http, URI, encodeURL, $q) {
        var service = {
            getAll: getAll,
            getCount: getCount,
            getSessionCount: getSessionCount,
            getStrategyList: getStrategyList
        };
        return service;

        function getAll(params, tbl) {
            return $http.get(URI + '/sessionmanage/sessionstate/all', {
                params: encodeURL(params)
            }).then(function (data) {
                tbl.totalNum = data.data.totalCount;
                return data.data.pageData;
            });
        }

        function getCount(tbl) {
            return $q.resolve(tbl.totalNum || 0);
        }

        function getSessionCount(startTime, endTime) {
            var endTimeStr = formatDate(endTime);
            var startTimeStr = formatDate(startTime);
            return $http.get(URI + '/sessionmanage/session/count/startTime/' + startTimeStr + '/endTime/' + endTimeStr).then(function (data) {
                var result = [];
                data.data.forEach(function (d) {
                    result.push([new Date(d.sessionTimestamp), d.sessionCount]);
                });
                return result;
            });
        }

        function formatDate(date) {
            return (date.getUTCFullYear() + "-" + (((date.getUTCMonth() + 1) > 9) ? date.getUTCMonth() + 1 : ("0" + (date.getUTCMonth() + 1))) + "-" + ((date.getUTCDate() > 9) ? date.getUTCDate() : ("0" + date.getUTCDate())) + "T" + ((date.getUTCHours() > 9) ? date.getUTCHours() : ("0" + date.getUTCHours())) + ":" + ((date.getUTCMinutes() > 9) ? date.getUTCMinutes() : ("0" + date.getUTCMinutes())) + ":" + ((date.getUTCSeconds() > 9) ? date.getUTCSeconds() : ("0" + date.getUTCSeconds())) + "Z");
        }

        function getStrategyList(){
            return $http.get(URI + "/sessionmanage/strategylist").then(function(data){
                return data.data;
            });
        }
    }

    ///////////////////////////
    function SessionControlModel($http, URI, encodeURL) {
        var service = {
            getAll: getAll,
            getCount: getCount,
            addSessionControl: addSessionControl,
            editSessionControl: editSessionControl,
            delSessionControl: delSessionControl,
            searchService: searchService,
            searchApp: searchApp,
            changeSwitch: changeSwitch,
            validateSessionControl: validateSessionControl
        };
        return service;

        function getAll(params) {
            return $http.get(URI + '/sessionmanage/sessioncontrol/all', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            return $http.get(URI + '/sessionmanage/sessioncontrol/all/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function addSessionControl(params) {
            return $http.post(URI + "/sessionmanage/sessioncontrol/add", params).then(function (data) {
                return data.data;
            });
        }

        function editSessionControl(params) {
            return $http.post(URI + "/sessionmanage/sessioncontrol/edit", params).then(function (data) {
                return data.data;
            });
        }

        function delSessionControl(params) {
            return $http.post(URI + "/sessionmanage/sessioncontrol/del", params).then(function (data) {
                return data.data;
            });
        }

        function searchService(str) {
            return $http.get(URI + "/objects/server/like/" + str).then(function (data) {
                return data.data;
            });
        }

        function searchApp(str) {
            return $http.get(URI + "/objects/app/like/" + str).then(function (data) {
                return data.data;
            });
        }

        function changeSwitch(params) {
            return $http.post(URI + "/sessionmanage/sessioncontrol/switch", params).then(function (data) {
                return data.data;
            });
        }

        function validateSessionControl(params) {
            return $http.post(URI + "/sessionmanage/sessioncontrol/validate", params).then(function (data) {
                return data.data;
            });
        }
    }

    function dnatModel($http, URI, encodeURL) {
        var url = URI + '/natSetting';
        var service = {
            getDNATAll: getDNATAll,
            getDNATCount: getDNATCount,
            addDNATData: addDNATData,
            editDNATData: editDNATData,
            deleteDNATData: deleteDNATData,
            switchDNATStatus: switchDNATStatus,
            switchDNATLogs: switchDNATLogs,
            getAddressPools: getAddressPools,
            searchApps: searchApps,
            searchServices: searchServices
        };
        return service;


        function getDNATAll(params) {
            return $http.get(url + '/getDNATSettings', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function getDNATCount(params) {
            return $http.get(url + '/getDNATSettingsCount', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function getAddressPools() {
            return $http.get(url + '/addressPools').then(function (data) {
                return data.data;
            });
        }

        function addDNATData(dnatData) {
            return $http.post(url + '/addDNATSetting', dnatData);
        }

        function editDNATData(dnatData) {
            return $http.post(url + '/updateDNATSetting', dnatData);
        }

        function deleteDNATData(dnatDatas) {
            return $http.post(url + '/deleteDNATSetting', dnatDatas);
        }

        function switchDNATStatus(dnatDatas) {
            return $http.post(url + '/switchDNATSettingStatus', dnatDatas);
        }

        function switchDNATLogs(dnatDatas) {
            return $http.post(url + '/switchDNATSettingLogs', dnatDatas);
        }

        function searchApps(str) {
            return $http.get(URI + "/objects/app/like/" + str).then(function (data) {
                return data.data;
            });
        }

        function searchServices(str) {
            return $http.get(URI + "/objects/server/like/" + str).then(function (data) {
                return data.data;
            });
        }

    }

    function snatModel($http, URI, encodeURL) {
        var url = URI + '/natSetting';
        var service = {
            getSNATAll: getSNATAll,
            getSNATCount: getSNATCount,
            addSNATData: addSNATData,
            editSNATData: editSNATData,
            deleteSNATData: deleteSNATData,
            switchSNATStatus: switchSNATStatus,
            switchSNATLogs: switchSNATLogs,
            getAddressPools: getAddressPools
        };

        return service;


        function getSNATAll(params) {

            return $http.get(url + '/getSNATSettings', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function getSNATCount(params) {
            return $http.get(url + '/getSNATSettingsCount', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function getAddressPools(params) {
            return $http.get(url + '/addressPools', {params: encodeURL(params)}).then(function (data) {
                return data.data;
            });
        }

        function addSNATData(dnatData) {
            return $http.post(url + '/addSNATSetting', dnatData);
        }

        function editSNATData(dnatData) {
            return $http.post(url + '/updateSNATSetting', dnatData);
        }

        function deleteSNATData(dnatDatas) {
            return $http.post(url + '/deleteSNATSetting', dnatDatas);
        }

        function switchSNATStatus(dnatDatas) {
            return $http.post(url + '/switchSNATSettingStatus', dnatDatas);
        }

        function switchSNATLogs(dnatDatas) {
            return $http.post(url + '/switchSNATSettingLogs', dnatDatas);
        }

    }
})();
