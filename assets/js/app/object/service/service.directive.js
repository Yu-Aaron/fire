/**
 * Object Service Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.object.service')
        .directive('svcPredefineTable', predefineTable)
        .directive('svcCustomizeTable', customizeTable);

    function predefineTable(ServicePredefine) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/service/predefineTable.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            ctrl.setConfig({
                name: 'item',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: ['name', 'description'],
                advancedSearch: 'predefineServers',
                advancedSearchOptions:[
                    {'name': 'name', 'display': '服务名称', 'input': 'string', 'option': false, value: ""},
                    {'name': 'description', 'display': '描述', 'input': 'string', 'option': false, value: ""},
                    {'name': 'createdBy', 'display': '端口', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function getAll(params) {
                // var a = ctrl.q;
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return ServicePredefine.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return ServicePredefine.getCount(payload);
            }

            function search(params) {
                return getAll(params);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (service) {
                    ctrl.selectedItems[service.name] = ctrl.selectAllValue;
                });
            };
        }
    }

    function customizeTable($rootScope, $state, $q, $timeout, $modal, $log, Enum, Task, ServiceCustomize) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/service/customizeTable.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            ctrl.setConfig({
                name: 'item',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                //TODO: _policyRefers的搜索，目前MW尚不支持，待支持后再调试
                //fields: ['name', 'description', '_policyRefers'],
                fields: ['name', 'description'],
                advancedSearch: 'customizedServers',
                advancedSearchOptions:[
                    {'name': 'name', 'display': '服务名称', 'input': 'string', 'option': false, value: ""},
                    //{'name': '_policyRefers', 'display': '策略引用', 'input': 'string', 'option': false, value: ""},
                    {'name': 'description', 'display': '描述', 'input': 'string', 'option': false, value: ""},
                    {'name': 'createdBy', 'display': '端口', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return ServiceCustomize.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return ServiceCustomize.getCount(payload);
            }

            function search(params) {
                return getAll(params);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (service) {
                    ctrl.selectedItems[service.name] = ctrl.selectAllValue;
                });
            };

            ctrl.selectedChanged = function () {
                var selectedAll = true;
                var hasSelected = false;
                var singleSelected = false;

                ctrl.table.forEach(function (service) {

                    if (ctrl.selectedItems[service.name] === undefined || ctrl.selectedItems[service.name] === null) {
                        singleSelected = false;
                    } else {
                        singleSelected = ctrl.selectedItems[service.name];
                    }

                    hasSelected = hasSelected || singleSelected;

                    selectedAll = selectedAll && singleSelected;
                });

                ctrl.selectAllValue = selectedAll ? true : (hasSelected ? null : false);
            };

            //获取是否具有编辑权限
            scope.privilegeName = 'OBJECT_SERVICE';
            var values = Enum.get('privilege').filter(function (pri) {
                return pri.name === scope.privilegeName;
            });
            var actionValue = values && values.length > 0 ? values[0].actionValue : 1;
            scope.isNoEditPri = (actionValue < 28);

            ctrl.addNewService = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'service-customize-add-new.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ServiceCustomize, formatVal) {
                    $scope.newService={};
                    $scope.newRule={type:'TCP'};    //服务规则对象
                    $scope.rules=[];                //服务规则列表

                    //自定义validation
                    function checkNameUnique(name){
                        var services = ctrl.table;
                        var rst = true;
                        if(name && services){
                            services.some(function(service){
                                if(service.name === name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name){
                        if(name && !formatVal.validateObjectAssetsName(name)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已定义该名称的服务，请更换其他服务名称';
                            }
                        }
                        return rst;
                    };

                    function checkPort(port, isMinAction, relVal){
                        if(port && (formatVal.validatePort(port) || Number(port)<1)){
                            if(isMinAction && port.toUpperCase() === 'ANY' && relVal !== 'ANY'){
                                return true;
                            }
                            return false;
                        }
                        return true;
                    }

                    $scope.checkDestPortVal = function(port, flag){
                        $scope.isDestPortsInvalid = false;
                        var isMinAction = (flag <= 0);
                        var min = $scope.newRule.minDstPort;
                        var max = $scope.newRule.maxDstPort;
                        var tempMinSrcPort = $scope.newRule.minSrcPort ? $scope.newRule.minSrcPort.toUpperCase() : '';
                        var isMinValid = min?checkPort(min, true, tempMinSrcPort):true;
                        var isMaxValid = max?checkPort(max, false):true;
                        var rst = isMinValid && isMaxValid;
                        if(!rst){
                            $scope.destPortValMsg = '请输入有效' + (!isMinValid?'最小':(!isMaxValid?'最大':'')) + '端口号';
                            if((isMinAction && isMinValid) || (!isMinAction && isMaxValid)){
                                rst = true;
                            }
                        }else{
                            if(min && max && Number(min)>Number(max)){
                                $scope.isDestPortsInvalid = true;
                                $scope.destPortValMsg = '端口输入不合法,最大端口不能小于最小端口';
                            }
                        }
                        return rst;
                    };

                    $scope.checkSourcePortVal = function(port, flag){
                        $scope.isSourcePortsInvalid = false;
                        var isMinAction = (flag <= 0);
                        var min = $scope.newRule.minSrcPort;
                        var max = $scope.newRule.maxSrcPort;
                        var tempMinDstPort = $scope.newRule.minDstPort ? $scope.newRule.minDstPort.toUpperCase() : '';
                        var isMinValid = min?checkPort(min, true, tempMinDstPort):true;
                        var isMaxValid = max?checkPort(max, false):true;
                        var rst = isMinValid && isMaxValid;
                        if(!rst){
                            $scope.sourcePortValMsg = '请输入有效' + (!isMinValid?'最小':(!isMaxValid?'最大':'')) + '端口号';
                            if((isMinAction && isMinValid) || (!isMinAction && isMaxValid)){
                                rst = true;
                            }
                        }else{
                            if(min && max && Number(min)>Number(max)){
                                $scope.isSourcePortsInvalid = true;
                                $scope.sourcePortValMsg = '端口输入不合法,最大端口不能小于最小端口';
                            }
                        }
                        return rst;
                    };

                    $scope.$watch("[newRule.minSrcPort, newRule.minDstPort]", function(newVal){
                        //源端口最小为any，隐藏最大端口
                        if(newVal[0] && newVal[0].toUpperCase() === 'ANY'){
                            $scope.newRule.maxSrcPort='';
                            $scope.srcMaxPortHide = true;
                        }else{
                            $scope.srcMaxPortHide = false;
                        }
                        //目标端口最小为any，隐藏最大端口
                        if(newVal[1] && newVal[1].toUpperCase() === 'ANY'){
                            $scope.newRule.maxDstPort='';
                            $scope.destMaxPortHide = true;
                        }else{
                            $scope.destMaxPortHide = false;
                        }
                    });

                    $scope.$watch("[newRule.minSrcPort, newRule.minDstPort, newRule.maxSrcPort, newRule.maxDstPort]", function(newVal){
                        //源端口最大/小不填，最小/大被赋值为与最小/大相同的值
                        if(newVal[0] && newVal[0].toUpperCase() !== 'ANY' && !newVal[2]){
                            $scope.newRule.maxSrcPort=newVal[0];
                        }
                        if(newVal[2] && newVal[2].toUpperCase() !== 'ANY' && !newVal[0]){
                            $scope.newRule.minSrcPort=newVal[2];
                        }

                        //目标端口最大/小不填，最小/大被赋值为与最小/大相同的值
                        if(newVal[1] && newVal[1].toUpperCase() !== 'ANY' && !newVal[3]){
                            $scope.newRule.maxDstPort=newVal[1];
                        }
                        if(newVal[3] && newVal[3].toUpperCase() !== 'ANY' && !newVal[1]){
                            $scope.newRule.minDstPort=newVal[3];
                        }
                    });


                    $scope.addNewRule = function (formValid) {
                        if(formValid){
                            var newRule = angular.copy($scope.newRule);
                            $scope.rules.push(newRule);
                        }
                    };
                    $scope.deleteRule = function (index) {
                        $scope.rules.splice(index,1);
                    };

                    $scope.ok = function (formValid) {
                        if(formValid){
                            $scope.newService.serverRules = $scope.rules;

                            $scope.isAddingService = true;
                            ServiceCustomize.addNewService([$scope.newService], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isAddingService = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('自定义服务添加失败：' + err.data) : '自定义服务添加失败')
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
                                                            content: '自定义服务添加成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义服务添加失败：' + data.data.reason) : '自定义服务添加失败')
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '自定义服务添加超时'
                                                        });
                                                        $timeout.cancel(checkAdding);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义服务添加失败：' + data.data.reason) : '自定义服务添加失败')
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

            ctrl.editService = function (svcObject) {
                var modalInstance = $modal.open({
                    templateUrl: 'service-customize-edit.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ServiceCustomize, formatVal) {
                    $scope.isEditDisabled = true;
                    $scope.editService = angular.copy(svcObject);
                    $scope.newRule={type:'TCP'};                       //服务规则对象
                    $scope.rules = [];                                 //服务规则列表
                    if(angular.isArray($scope.editService.serverRules)){
                        $scope.rules = $scope.editService.serverRules;
                    }

                    //自定义validation
                    function checkNameUnique(name){
                        var services = ctrl.table;
                        var rst = true;
                        if(name && services){
                            services.some(function(service){
                                if(service.name === name && service.name !== svcObject.name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name){
                        if(name && !formatVal.validateObjectAssetsName(name)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已定义该名称的服务，请更换其他服务名称';
                            }
                        }
                        return rst;
                    };

                    function checkPort(port, isMinAction, relVal){
                        if(port && (formatVal.validatePort(port) || Number(port)<1)){
                            if(isMinAction && port.toUpperCase() === 'ANY' && relVal !== 'ANY'){
                                return true;
                            }
                            return false;
                        }
                        return true;
                    }

                    $scope.checkDestPortVal = function(port, flag){
                        $scope.isDestPortsInvalid = false;
                        var isMinAction = (flag <= 0);
                        var min = $scope.newRule.minDstPort;
                        var max = $scope.newRule.maxDstPort;
                        var tempMinSrcPort = $scope.newRule.minSrcPort ? $scope.newRule.minSrcPort.toUpperCase() : '';
                        var isMinValid = min?checkPort(min, true, tempMinSrcPort):true;
                        var isMaxValid = max?checkPort(max, false):true;
                        var rst = isMinValid && isMaxValid;
                        if(!rst){
                            $scope.destPortValMsg = '请输入有效' + (!isMinValid?'最小':(!isMaxValid?'最大':'')) + '端口号';
                            if((isMinAction && isMinValid) || (!isMinAction && isMaxValid)){
                                rst = true;
                            }
                        }else{
                            if(min && max && Number(min)>Number(max)){
                                $scope.isDestPortsInvalid = true;
                                $scope.destPortValMsg = '端口输入不合法,最大端口不能小于最小端口';
                            }
                        }
                        return rst;
                    };

                    $scope.checkSourcePortVal = function(port, flag){
                        $scope.isSourcePortsInvalid = false;
                        var isMinAction = (flag <= 0);
                        var min = $scope.newRule.minSrcPort;
                        var max = $scope.newRule.maxSrcPort;
                        var tempMinDstPort = $scope.newRule.minDstPort ? $scope.newRule.minDstPort.toUpperCase() : '';
                        var isMinValid = min?checkPort(min, true, tempMinDstPort):true;
                        var isMaxValid = max?checkPort(max, false):true;
                        var rst = isMinValid && isMaxValid;
                        if(!rst){
                            $scope.sourcePortValMsg = '请输入有效' + (!isMinValid?'最小':(!isMaxValid?'最大':'')) + '端口号';
                            if((isMinAction && isMinValid) || (!isMinAction && isMaxValid)){
                                rst = true;
                            }
                        }else{
                            if(min && max && Number(min)>Number(max)){
                                $scope.isSourcePortsInvalid = true;
                                $scope.sourcePortValMsg = '端口输入不合法,最大端口不能小于最小端口';
                            }
                        }
                        return rst;
                    };

                    $scope.$watch("[newRule.minSrcPort, newRule.minDstPort]", function(newVal){
                        //源端口最小为any，隐藏最大端口
                        if(newVal[0] && newVal[0].toUpperCase() === 'ANY'){
                            $scope.newRule.maxSrcPort='';
                            $scope.srcMaxPortHide = true;
                        }else{
                            $scope.srcMaxPortHide = false;
                        }
                        //目标端口最小为any，隐藏最大端口
                        if(newVal[1] && newVal[1].toUpperCase() === 'ANY'){
                            $scope.newRule.maxDstPort='';
                            $scope.destMaxPortHide = true;
                        }else{
                            $scope.destMaxPortHide = false;
                        }
                    });

                    $scope.$watch("[newRule.minSrcPort, newRule.minDstPort, newRule.maxSrcPort, newRule.maxDstPort]", function(newVal){
                        //源端口最大/小不填，最小/大被赋值为与最小/大相同的值
                        if(newVal[0] && newVal[0].toUpperCase() !== 'ANY' && !newVal[2]){
                            $scope.newRule.maxSrcPort=newVal[0];
                        }
                        if(newVal[2] && newVal[2].toUpperCase() !== 'ANY' && !newVal[0]){
                            $scope.newRule.minSrcPort=newVal[2];
                        }

                        //目标端口最大/小不填，最小/大被赋值为与最小/大相同的值
                        if(newVal[1] && newVal[1].toUpperCase() !== 'ANY' && !newVal[3]){
                            $scope.newRule.maxDstPort=newVal[1];
                        }
                        if(newVal[3] && newVal[3].toUpperCase() !== 'ANY' && !newVal[1]){
                            $scope.newRule.minDstPort=newVal[3];
                        }
                    });

                    $scope.addNewRule = function (formValid) {
                        if(formValid){
                            var newRule = angular.copy($scope.newRule);
                            $scope.rules.push(newRule);
                        }
                    };
                    $scope.deleteRule = function (index) {
                        $scope.rules.splice(index,1);
                    };

                    $scope.ok = function (formValid) {
                        if(formValid){
                            $scope.isEdittingService = true;
                            ServiceCustomize.updateService([$scope.editService], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isEdittingService = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('自定义服务修改失败：' + err.data) : '自定义服务修改失败')
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
                                                            content: '自定义服务修改成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义服务修改失败：' + data.data.reason) : '自定义服务修改失败')
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '自定义服务修改超时'
                                                        });
                                                        $timeout.cancel(checkEditting);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义服务修改失败：' + data.data.reason) : '自定义服务修改失败')
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

            ctrl.viewService = function (svcObject) {
                var modalInstance = $modal.open({
                    templateUrl: 'service-customize-edit.html',
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
                    $scope.editService = svcObject;
                    $scope.newRule={type:'TCP'};                       //服务规则对象
                    $scope.rules = $scope.editService.serverRules;     //服务规则列表

                    $scope.checkNameVal = function(){
                        return true;
                    };

                    $scope.checkDestPortVal = function(){
                        return true;
                    };

                    $scope.checkSourcePortVal = function(){
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

            ctrl.deleteService = function() {
                var selectedItems = ctrl.selectedItems;
                var itemIds = [];
                if (selectedItems) {
                    for (var name in selectedItems) {
                        if (selectedItems[name]) {
                            itemIds.push(name);
                        }
                    }
                }
                if (itemIds.length !== 0) {
                    var deferred = $q.defer();
                    $rootScope.serviceDeleteTaskPromise = deferred.promise;
                    ServiceCustomize.deleteService(itemIds, function (taskInfo, err) {
                        if (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('自定义服务删除失败：' + err.data) : '自定义服务删除失败')
                            });
                            deferred.resolve('fail');
                        } else {
                            var taskId = taskInfo.taskId;
                            (function countdown(counter) {
                                var checkServiceDeletion = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        if (data.data.state === 'SUCCESS') {
                                            $state.reload().then(function () {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: '自定义服务删除成功'
                                                });
                                            });
                                            deferred.resolve('success');
                                            $timeout.cancel(checkServiceDeletion);
                                        } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('自定义服务删除失败：' + data.data.reason) : '自定义服务删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkServiceDeletion);
                                        } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                            if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '自定义服务删除超时'
                                                });
                                                deferred.resolve('timeout');
                                                $timeout.cancel(checkServiceDeletion);
                                            }
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('自定义服务删除失败：' + data.data.reason) : '自定义服务删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkServiceDeletion);
                                        }
                                    });
                                }, 1000);
                            })(30);
                        }
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条自定义服务'
                    });
                }
            };
        }
    }
})();
