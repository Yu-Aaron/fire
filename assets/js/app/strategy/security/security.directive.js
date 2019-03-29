/**
 * Strategy Security Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.strategy.security')
        .directive('strategySecurityTable', strategySecurityTable)
        .directive('valueDetailContainer', valueDetailContainer)
        .directive('expressionInput', expressionInput);

    function strategySecurityTable($rootScope, $state, $q, $timeout, $modal, $log, $filter, formatVal,
                                   Enum, Task, SecurityStrategyModel) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/strategy/security/securityTable.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            $q.all([
                SecurityStrategyModel.getTimes()
            ]).then(function(data){
                //获取时间表列表内容
                scope.times = data[0];

                //配置dtable
                ctrl.setConfig({
                    name: 'item',
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    //fields: ['name', 'sourceObjectName', 'targetObjectName', 'serviceAppName', 'timeObjectName', 'action', 'enable', 'enableLog'],
                    fields: ['name', 'sourceObjectName', 'targetObjectName', 'serviceAppName', 'action', 'enable', 'enableLog'],
                    advancedSearch: 'securityStrategy',
                    advancedSearchOptions:[
                        {'name': 'name', 'display': '策略名称', 'input': 'string', 'option': false, value: ""},
                        {'name': 'sourceObjectName', 'display': '源策略对象', 'input': 'string', 'option': false, value: ""},
                        {'name': 'targetObjectName', 'display': '目标策略对象', 'input': 'string', 'option': false, value: ""},
                        {'name': 'serviceAppName', 'display': '应用/服务', 'input': 'string', 'option': false, value: ""},
//                        {'name': 'timeObjectName', 'display': '生效时间', 'input': 'checkbox', 'option': true, 'parser':'string', options: conver2Options(scope.times)},
                        {'name': 'action', 'display': '动作', 'input': 'checkbox', 'option': true, 'options': [{'value': '-1', 'text': '全部'},{'value': 'ALLOW', 'text': '放行'},{'value': 'REJECT', 'text': '阻断'}]},
                        {'name': 'enable', 'display': '启用状态', 'input': 'checkbox', 'option': true, 'options': [{'value': '-1', 'text': '全部'},{'value': true, 'text': '开启'},{'value': false, 'text': '关闭'}]},
                        {'name': 'enableLog', 'display': '日志', 'input': 'checkbox', 'option': true, 'options': [{'value': '-1', 'text': '全部'},{'value': true, 'text': '打开'},{'value': false, 'text': '关闭'}]}
                    ]
                });
            });


            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return SecurityStrategyModel.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return SecurityStrategyModel.getCount(payload);
            }

            function search(params) {
                //TODO: 部分列显示带filter，所以输入的搜索文字可能需要过滤后传给MW server
                return getAll(params);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (stragety) {
                    ctrl.selectedItems[stragety.name] = ctrl.selectAllValue;
                });
            };

            //获取是否具有编辑权限
            scope.privilegeName = 'STRATEGY_SECURITY';
            var values = Enum.get('privilege').filter(function (pri) {
                return pri.name === scope.privilegeName;
            });
            var actionValue = values && values.length > 0 ? values[0].actionValue : 1;
            scope.isNoEditPri = (actionValue < 28);

//            function conver2Options(srcArray){
//                var rst = [{'value': '-1', 'text': '全部'}];
//                if(angular.isArray(srcArray)){
//                    srcArray.forEach(function(item){
//                        rst.push({
//                            value: item,
//                            text: item
//                        });
//                    });
//                }
//                return rst;
//            }

            //校验名字输入内容
            function checkNameCharacter(name){
                if(name && !formatVal.validateObjectAssetsName(name)){
                    return false;
                }
                return true;
            }

            ctrl.addNewStrategy = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'strategy-security-add-new.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.times = angular.isArray(scope.times)?scope.times:[];
                    $scope.software = 'APPLICATION';
                    $scope.newStrategy={
                        enable: true,
                        action: 'ALLOW'
//                        timeObjectName: $scope.times.length>0?$scope.times[0]:''
                    };

                    //验证名字唯一性
                    function checkNameUnique(name){
                        var apps = ctrl.table;
                        var rst = true;
                        if(name && apps){
                            apps.some(function(strategy){
                                if(strategy.name === name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }
                    //自定义validation
                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已定义该名称的安全策略，请更换其他策略名称';
                            }
                        }
                        return rst;
                    };

                    //联想搜索
                    $scope.searchObjects = function(str){
                        var payload = {
                            $filter: "(contains(name, '" +  str + "'))"
                        };
                        return SecurityStrategyModel.searchObjects(payload);
                    };
                    $scope.searchServiceApps = function(str){
                        var payload = {
                            $filter: "(contains(name, '" +  str + "'))"
                        };
                        if($scope.software === 'APPLICATION'){
                            return SecurityStrategyModel.searchApps(payload);
                        }else{
                            return SecurityStrategyModel.searchServices(payload);
                        }
                    };
                    //应用选定对象变化时，识别应用的协议类型(通过appId)
                    $scope.$watch('selectedSoftware', function(newValue){
                        if(newValue && newValue.originalObject){
                            $scope.appId = newValue.originalObject.appId;
                            $scope.appProtocolType = $filter('appIdToProtocol')($scope.appId);
                            //初始化数据
                            $scope.treeNodes = [];
                            var payload = {
                                funcCode: $scope.appProtocolType
                            };
                            SecurityStrategyModel.getTreeNode(payload).then(function(node){
                                //根节点(按协议区分)
                                $scope.rootTree = node.detail;
                                $scope.funcCodes = node.getAllFuncCode();

                                //功能码节点缺省数据
                                $scope.addNewFuncCode();
                            });
                        }else{
                            $scope.appId = '';
                            $scope.appProtocolType = null;
                        }
                    });
                    //应用控制变化时，初始化三个checkbox的状态
                    $scope.$watch('newStrategy.appSetting', function(newValue){
                        if(newValue){
                            if(angular.isUndefined($scope.newStrategy.enableFlood)){
                                $scope.newStrategy.enableFlood = false;
                            }
                            if(angular.isUndefined($scope.newStrategy.enableTransaction)){
                                $scope.newStrategy.enableTransaction = false;
                            }
                            if(angular.isUndefined($scope.newStrategy.enableNoresponse)){
                                $scope.newStrategy.enableNoresponse = false;
                            }
                        }
                    });
                    //应用控制中checkbox值的监听
                    $scope.$watch('newStrategy.enableFlood', function(newValue){
                        if(!newValue){
                            $scope.newStrategy.floodSetting = '';
                        }
                    });
                    $scope.$watch('newStrategy.enableTransaction', function(newValue){
                        if(!newValue){
                            $scope.newStrategy.transactionSetting = '';
                        }
                    });
                    $scope.$watch('newStrategy.enableNoresponse', function(newValue){
                        if(!newValue){
                            $scope.newStrategy.noresponseSetting = '';
                        }
                    });

                    //初始化控件中各个node的action
                    SecurityStrategyModel.initTreeNodeAction($scope);

                    $scope.ok = function (formValid) {
                        if(formValid){
                            //格式化应用控制设置
                            var strategy = SecurityStrategyModel.formatStrategy($scope.newStrategy, $scope.treeNodes);
                            //设置应用/服务　应用ID
                            if($scope.software === 'APPLICATION'){
                                strategy.serviceAppType = 1;
                            }else{
                                strategy.serviceAppType = 0;
                            }
                            strategy.appId = $scope.appId;
                            //新增安全策略
                            $scope.isAddingStrategy = true;
                            SecurityStrategyModel.addNewSecurityStrategy([strategy], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isAddingStrategy = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('安全策略添加失败：' + err.data) : '安全策略添加失败')
                                    });
                                } else {
                                    var taskId = taskInfo.taskId;
                                    (function countdown(counter) {
                                        var checkAdding = $timeout(function () {
                                            Task.getTask(taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    $scope.$emit('closeAddModal');
                                                    $state.reload().then(function () {
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '安全策略添加成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全策略添加失败：' + data.data.reason) : '安全策略添加失败')
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '安全策略添加超时'
                                                        });
                                                        $timeout.cancel(checkAdding);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全策略添加失败：' + data.data.reason) : '安全策略添加失败')
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                }
                                            });
                                        }, 1000);
                                    })(30);
                                }
                            });
                        }
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.viewStrategy = function (strategy) {
                var modalInstance = $modal.open({
                    templateUrl: 'strategy-security-edit.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.isViewOnly = true;
                    $scope.times = angular.isArray(scope.times)?scope.times:[];
                    //初始化安全策略
                    $scope.editStrategy = strategy;
                    //初始化angucomplete校验用的变量
                    $scope.selectedSourceObject = $scope.selectedTargetObject = $scope.selectedSoftware = {};

                    //自定义validation
                    $scope.checkNameVal = function(){
                        return true;
                    };

                    //联想搜索
                    $scope.searchServiceApps = function(str){
                        var payload = {
                            $filter: "(contains(name, '" +  str + "'))"
                        };
                        if($scope.software === 'APPLICATION'){
                            return SecurityStrategyModel.searchApps(payload);
                        }else{
                            return SecurityStrategyModel.searchServices(payload);
                        }
                    };

                    //应用 or 服务
                    if($scope.editStrategy.serviceAppType === 1){
                        $scope.software = 'APPLICATION';
                        //获取当前名称应用对应的appId
                        $scope.searchServiceApps($scope.editStrategy.serviceAppName).then(function(data){
                            if(angular.isArray(data)){
                                data.some(function(item){
                                    if(item.name === $scope.editStrategy.serviceAppName){
                                        $scope.appId = item.appId;
                                        $scope.appProtocolType = $filter('appIdToProtocol')($scope.appId);
                                        var payload = {
                                            funcCode: $scope.appProtocolType
                                        };
                                        SecurityStrategyModel.getTreeNode(payload).then(function(node){
                                            //根节点(按协议区分)
                                            $scope.rootTree = node.detail;
                                            $scope.funcCodes = node.getAllFuncCode();

                                            //初始化安全策略应用控制数据
                                            $scope.treeNodes = SecurityStrategyModel.parseStrategy(
                                                $scope.editStrategy,
                                                $scope.rootTree,
                                                $scope.funcCodes,
                                                $scope.selectFuncCode
                                            );
                                        });
                                        return true;
                                    }
                                });
                            }
                        });
                    }else{
                        $scope.software = 'SERVICE';
                    }

                    //应用控制中checkbox值的监听
                    $scope.$watch('editStrategy.enableFlood', function(newValue){
                        if(!newValue){
                            $scope.editStrategy.floodSetting = '';
                        }
                    });
                    $scope.$watch('editStrategy.enableTransaction', function(newValue){
                        if(!newValue){
                            $scope.editStrategy.transactionSetting = '';
                        }
                    });
                    $scope.$watch('editStrategy.enableNoresponse', function(newValue){
                        if(!newValue){
                            $scope.editStrategy.noresponseSetting = '';
                        }
                    });

                    //初始化控件中各个node的action
                    SecurityStrategyModel.initTreeNodeAction($scope);
                    $scope.checkRangeVal = function(){
                        return true;
                    };

                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.editStrategy = function (strategy) {
                var modalInstance = $modal.open({
                    templateUrl: 'strategy-security-edit.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.isEditDisabled = true;
                    $scope.times = angular.isArray(scope.times)?scope.times:[];
                    //初始化安全策略
                    $scope.editStrategy = angular.copy(strategy);
                    //初始化angucomplete校验用的变量
                    $scope.selectedSourceObject = $scope.selectedTargetObject = $scope.selectedSoftware = {};

                    //验证名字唯一性
                    function checkNameUnique(name){
                        var apps = ctrl.table;
                        var rst = true;
                        if(name && apps){
                            apps.some(function(item){
                                if(item.name === name && item.name !== strategy.name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }
                    //自定义validation
                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已定义该名称的安全策略，请更换其他策略名称';
                            }
                        }
                        return rst;
                    };

                    //联想搜索
                    $scope.searchObjects = function(str){
                        var payload = {
                            $filter: "(contains(name, '" +  str + "'))"
                        };
                        return SecurityStrategyModel.searchObjects(payload);
                    };
                    $scope.searchServiceApps = function(str){
                        var payload = {
                            $filter: "(contains(name, '" +  str + "'))"
                        };
                        if($scope.software === 'APPLICATION'){
                            return SecurityStrategyModel.searchApps(payload);
                        }else{
                            return SecurityStrategyModel.searchServices(payload);
                        }
                    };

                    //应用 or 服务
                    if($scope.editStrategy.serviceAppType === 1){
                        $scope.software = 'APPLICATION';
                        //获取当前名称应用对应的appId
                        $scope.searchServiceApps($scope.editStrategy.serviceAppName).then(function(data){
                            if(angular.isArray(data)){
                                data.some(function(item){
                                    if(item.name === $scope.editStrategy.serviceAppName){
                                        $scope.appId = item.appId;
                                        $scope.appProtocolType = $filter('appIdToProtocol')($scope.appId);
                                        var payload = {
                                            funcCode: $scope.appProtocolType
                                        };
                                        SecurityStrategyModel.getTreeNode(payload).then(function(node){
                                            //根节点(按协议区分)
                                            $scope.rootTree = node.detail;
                                            $scope.funcCodes = node.getAllFuncCode();

                                            //初始化安全策略应用控制数据
                                            $scope.treeNodes = SecurityStrategyModel.parseStrategy(
                                                $scope.editStrategy,
                                                $scope.rootTree,
                                                $scope.funcCodes,
                                                $scope.selectFuncCode
                                            );
                                        });
                                        return true;
                                    }
                                });
                            }
                        });
                    }else{
                        $scope.software = 'SERVICE';
                    }

                    //应用选定对象变化时，识别应用的协议类型(通过appId)
                    $scope.$watch('selectedSoftware', function(newValue){
                        if(newValue && newValue.originalObject){
                            $scope.appId = newValue.originalObject.appId;
                            $scope.appProtocolType = $filter('appIdToProtocol')($scope.appId);
                            //初始化数据
                            $scope.treeNodes = [];
                            var payload = {
                                funcCode: $scope.appProtocolType
                            };
                            SecurityStrategyModel.getTreeNode(payload).then(function(node){
                                //根节点(按协议区分)
                                $scope.rootTree = node.detail;
                                $scope.funcCodes = node.getAllFuncCode();

                                //功能码节点缺省数据
                                $scope.addNewFuncCode();
                            });
                        }else{
                            $scope.appId = '';
                            $scope.appProtocolType = null;
                        }
                    });
                    //应用控制变化时，初始化三个checkbox的状态
                    $scope.$watch('editStrategy.appSetting', function(newValue){
                        if(newValue){
                            if(angular.isUndefined($scope.editStrategy.enableFlood)){
                                $scope.editStrategy.enableFlood = false;
                            }
                            if(angular.isUndefined($scope.editStrategy.enableTransaction)){
                                $scope.editStrategy.enableTransaction = false;
                            }
                            if(angular.isUndefined($scope.editStrategy.enableNoresponse)){
                                $scope.editStrategy.enableNoresponse = false;
                            }
                        }
                    });
                    //应用控制中checkbox值的监听
                    $scope.$watch('editStrategy.enableFlood', function(newValue){
                        if(!newValue){
                            $scope.editStrategy.floodSetting = '';
                        }
                    });
                    $scope.$watch('editStrategy.enableTransaction', function(newValue){
                        if(!newValue){
                            $scope.editStrategy.transactionSetting = '';
                        }
                    });
                    $scope.$watch('editStrategy.enableNoresponse', function(newValue){
                        if(!newValue){
                            $scope.editStrategy.noresponseSetting = '';
                        }
                    });

                    //初始化控件中各个node的action
                    SecurityStrategyModel.initTreeNodeAction($scope);

                    $scope.ok = function (formValid) {
                        if(formValid){
                            //格式化应用控制设置
                            var strategy = SecurityStrategyModel.formatStrategy($scope.editStrategy, $scope.treeNodes);
                            //设置应用/服务　应用ID
                            if($scope.software === 'APPLICATION'){
                                strategy.serviceAppType = 1;
                            }else{
                                strategy.serviceAppType = 0;
                            }
                            strategy.appId = $scope.appId;
                            //新增安全策略
                            $scope.isEdittingStrategy = true;
                            SecurityStrategyModel.updateSecurityStrategy([strategy], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isEdittingStrategy = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('安全策略修改失败：' + err.data) : '安全策略修改失败')
                                    });
                                } else {
                                    var taskId = taskInfo.taskId;
                                    (function countdown(counter) {
                                        var checkEditting = $timeout(function () {
                                            Task.getTask(taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    $scope.$emit('closeAddModal');
                                                    $state.reload().then(function () {
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '安全策略修改成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全策略修改失败：' + data.data.reason) : '安全策略修改失败')
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '安全策略修改超时'
                                                        });
                                                        $timeout.cancel(checkEditting);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全策略修改失败：' + data.data.reason) : '安全策略修改失败')
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                }
                                            });
                                        }, 1000);
                                    })(30);
                                }
                            });
                        }
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.selectChanged = function () {
                var hasSelected = false;
                var selectedAll = true;
                ctrl.table.forEach(function (data) {
                    var itemSelected = ctrl.selectedItems[data.name] !== undefined && ctrl.selectedItems[data.name] !== false;
                    hasSelected = hasSelected || itemSelected;
                    selectedAll = selectedAll && itemSelected;
                });
                ctrl.selectAllValue = selectedAll ? true : (hasSelected ? null : false);
            };

            ctrl.deleteStrategy = function() {
                var selectedItems = ctrl.selectedItems;
                var itemNames = [];
                if (selectedItems) {
                    for (var name in selectedItems) {
                        if (selectedItems[name]) {
                            itemNames.push(name);
                        }
                    }
                }
                if (itemNames.length !== 0) {
                    var deferred = $q.defer();
                    $rootScope.securityStrategyDeleteTaskPromise = deferred.promise;
                    SecurityStrategyModel.deleteSecurityStrategy(itemNames, function (taskInfo, err) {
                        if (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('安全策略删除失败：' + err.data) : '安全策略删除失败')
                            });
                            deferred.resolve('fail');
                        } else {
                            var taskId = taskInfo.taskId;
                            (function countdown(counter) {
                                var checkDeletion = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        if (data.data.state === 'SUCCESS') {
                                            $state.reload().then(function () {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: '安全策略删除成功'
                                                });
                                                ctrl.selectedItems = {};
                                                ctrl.selectChanged();
                                            });
                                            deferred.resolve('success');
                                            $timeout.cancel(checkDeletion);
                                        } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('安全策略删除失败：' + data.data.reason) : '安全策略删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkDeletion);
                                        } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                            if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '安全策略删除超时'
                                                });
                                                deferred.resolve('timeout');
                                                $timeout.cancel(checkDeletion);
                                            }
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('安全策略删除失败：' + data.data.reason) : '安全策略删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkDeletion);
                                        }
                                    });
                                }, 1000);
                            })(30);
                        }
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条安全策略'
                    });
                }
            };
        }
    }

    function valueDetailContainer($timeout) {
        var obj = {
            scope: false,
            restrict: 'C',
            link: link
        };

        return obj;

        //////////
        function link(scope, element) {
            var MIN_WIDTH = 90;
            //重新设定input宽度
            $timeout(function(){
                var labelWidth = angular.element(element[0].querySelector('.info-label')).width();
                var width = element.width();
                var targetWidth = width-labelWidth-5;//其中2为左右边框，另外的3是因为css只能获取整的width,避免小数时换行。
                angular.element(element[0].querySelector('.info-value')).css({
                    width:  targetWidth >= MIN_WIDTH ? (targetWidth + 'px') : '100%'
                });
            });
        }
    }

    function expressionInput() {
        var obj = {
            scope: {
                'ngDisabled': '<?',
                'formName': '<',
                'min': '<',
                'max': '<'
            },
            restrict: 'E',
            require: '?ngModel',
            replace: true,
            templateUrl: '/templates/strategy/security/expressionInputTpl.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {
            //初始化数据
            ctrl.$render = function(){
                if(ctrl.$modelValue){
                    scope.expression = ctrl.$modelValue.expression;
                    scope.value = ctrl.$modelValue.value;
                }
            };

            // //重新设定input宽度
            // function resizeInput(){
            //     var expressionWidth = element.find('span').width();
            //     var inputWidth = element.width() - expressionWidth;
            //     element.find('input').css({
            //         width: inputWidth-4 + 'px' //其中2为左右边框，另一个2因为css只能获取向下取整的width,避免小数时换行
            //     });
            // }
            // scope.hasResized = false;
            // scope.$watch('expression', resizeInput);    //表达式变化时触发
            // scope.$watch(function () {
            //     return element.width();
            // }, function(newValue, oldValue){
            //     if(newValue !== oldValue && !scope.hasResized){
            //         resizeInput();
            //     }
            // });                                         //容器大小发生变化时触发(初始化调用一次)

            //设定ngModel
            scope.$watch("[expression, value]", function(){
                if(!ctrl.$modelValue || (ctrl.$modelValue && (scope.expression !== ctrl.$modelValue.expression ||
                    scope.value !== ctrl.$modelValue.value))){
                    scope.regex = scope.expression === 'rg' ? /^(\d|[1-9]\d{1,4})-(\d|[1-9]\d{1,4})$/ : /^\d$|^[1-9]\d{1,4}$/;
                    scope.maxlen = scope.expression === 'rg' ? 11 : 5;
                    ctrl.$setViewValue({
                        expression: scope.expression,
                        value: scope.value
                    });
                }
            });
            //表达式初始值
            scope.expression = 'eq';

            //校验输入范围
            scope.checkRangeVal = function(input, params){
                if(input){
                    var tmpInput = [input];
                    //表达式为'范围'
                    if(scope.expression === 'rg'){
                        if(input.indexOf('-') >= 0){
                            tmpInput = input.split('-');
                            if(Number(tmpInput[0]) > Number(tmpInput[1])){
                                return false;
                            }
                        }
                    }
                    //校验输入值范围
                    if(params && angular.isDefined(params.min) && angular.isDefined(params.max)){
                        var rst = true;
                        var min = Number(params.min);
                        var max = Number(params.max);
                        tmpInput.some(function(value){
                            value = Number(value);
                            rst = (value>=min && value<=max);
                            return !rst;
                        });
                        return rst;
                    }
                }

                return true;
            };
        }
    }
})();
