/**
 * Object Apply Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.object.apply')
        .directive('appPredefineTable', predefineTable)
        .directive('appCustomizeTable', customizeTable);

    function predefineTable($modal, $log, ApplyPredefine) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/apply/predefineTable.html',
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
                fields: ['name', 'appId', 'description'],
                advancedSearch: 'predefineApps',
                advancedSearchOptions:[
                    {'name': 'name', 'display': '应用名', 'input': 'string', 'option': false, value: ""},
                    {'name': 'appId', 'display': '应用Id', 'input': 'string', 'option': false, value: ""},
                    {'name': 'description', 'display': '描述', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return ApplyPredefine.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return ApplyPredefine.getCount(payload);
            }

            function search(params) {
                return getAll(params);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (app) {
                    ctrl.selectedItems[app.name] = ctrl.selectAllValue;
                });
            };

            ctrl.viewApply = function (appObject) {
                var modalInstance = $modal.open({
                    templateUrl: 'apply-predefine-view.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.viewApply = appObject;
//                    ApplyCustomize.getProtocols().then(function(data){
//                        $scope.protocols = data;
//                    });
                    //需求变更：预定义引用只显示UDP或TCP端口
                    $scope.protocols = ['TCP', 'UDP'];
                    $scope.viewApply.type = $scope.viewApply.tcpPort?'TCP':($scope.viewApply.udpPort?'UDP':'');
                    $scope.changeProtocol = function(){
                        if($scope.viewApply.type === 'TCP'){
                            $scope.tcpudpPort = $scope.viewApply.tcpPort;
                        }else if($scope.viewApply.type === 'UDP'){
                            $scope.tcpudpPort = $scope.viewApply.udpPort;
                        }
                    };
                    $scope.changeProtocol();

                    //应用特征对象
                    $scope.signatures = $scope.viewApply.traitInfos;

                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }
    }

    function customizeTable($rootScope, $state, $q, $timeout, $modal, $log, Enum, Task, ApplyCustomize) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/apply/customizeTable.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            $q.all([
                ApplyCustomize.getProtocols(),
                ApplyCustomize.getPredefineApps()
            ]).then(function(data){
                //获取承载协议列表内容
                scope.protocols = data[0];
                //获取域定义应用列表内容
                scope.predefineapps = data[1];

                //配置dtable
                ctrl.setConfig({
                    name: 'item',
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    //TODO: _policyRefers的搜索，目前MW尚不支持，待支持后再调试
                    //fields: ['name', 'type', 'inherit', '_policyRefers'],
                    fields: ['name', 'type', 'inherit'],
                    advancedSearch: 'customizedApps',
                    advancedSearchOptions:[
                        {'name': 'name', 'display': '应用名', 'input': 'string', 'option': false, value: ""},
                        {'name': 'type', 'display': '承载协议', 'input': 'checkbox', 'option': true, options: conver2Options(scope.protocols)},
                        {'name': 'inherit', 'display': '继承', 'input': 'checkbox', 'option': true, 'options': [{'value': '-1', 'text': '全部'},{'value': true, 'text': '是'},{'value': false, 'text': '否'}]}
                    ]
                });
            });


            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return ApplyCustomize.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return ApplyCustomize.getCount(payload);
            }

            function search(params) {
                //TODO: 承载协议列为Enum，继承列显示带filter，所以输入的搜索文字可能需要过滤后传给MW server
                return getAll(params);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (app) {
                    ctrl.selectedItems[app.name] = ctrl.selectAllValue;
                });
            };

            ctrl.selectedChanged = function () {
                var selectedAll = true;
                var hasSelected = false;
                var singleSelected = false;

                ctrl.table.forEach(function (app) {

                    if (ctrl.selectedItems[app.name] === undefined || ctrl.selectedItems[app.name] === null) {
                        singleSelected = false;
                    } else {
                        singleSelected = ctrl.selectedItems[app.name];
                    }

                    hasSelected = hasSelected || singleSelected;

                    selectedAll = selectedAll && singleSelected;
                });

                ctrl.selectAllValue = selectedAll ? true : (hasSelected ? null : false);
            };

            //获取是否具有编辑权限
            scope.privilegeName = 'OBJECT_APPLICATION';
            var values = Enum.get('privilege').filter(function (pri) {
                return pri.name === scope.privilegeName;
            });
            var actionValue = values && values.length > 0 ? values[0].actionValue : 1;
            scope.isNoEditPri = (actionValue < 28);

            function conver2Options(srcArray){
                var rst = [{'value': '-1', 'text': '全部'}];
                if(angular.isArray(srcArray)){
                    srcArray.forEach(function(item){
                        rst.push({
                            value: item,
                            text: item
                        });
                    });
                }
                return rst;
            }

            ctrl.addNewApply = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'apply-customize-add-new.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ApplyCustomize, formatVal) {
                    $scope.newApply={};
                    $scope.newAppSigunature={action:'EXTEND'};      //应用特征对象
                    $scope.signatures=[{}];                         //手写特征列表

                    $scope.protocols = scope.protocols;
                    $scope.newApply.type = scope.protocols && scope.protocols.length>0?scope.protocols[0]:'';
                    $scope.predefineapps = scope.predefineapps;
                    $scope.newAppSigunature.predefineapp =
                            scope.predefineapps && scope.predefineapps.length>0?scope.predefineapps[0]:'';

                    //自定义validation
                    function checkNameUnique(name){
                        var apps = ctrl.table;
                        var rst = true;
                        if(name && apps){
                            apps.some(function(app){
                                if(app.name === name){
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
                                $scope.nameValMsg = '已定义该名称的应用，请更换其他应用名称';
                            }
                        }
                        return rst;
                    };

                    function checkPortRange(input){
                        if(input && !formatVal.validatePortDiscrete(input)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkPortVal = function(portRange, flag){
                        var rst = checkPortRange(portRange);
                        if(!rst){
//                            var validateMsg = "请输入有效端口号（范围输入时请用'-'分隔，或用逗号分隔多个端口）";
                            var validateMsg = "请输入有效端口号（用逗号分隔最多8个端口）";
                            if(flag==='server'){
                                $scope.serverPortValMsg = validateMsg;
                            }else if(flag==='client'){
                                $scope.clientPortValMsg = validateMsg;
                            }
                        }
                        return rst;
                    };

                    $scope.changeSignatureAction = function(){
                        if($scope.newAppSigunature.action !== 'MANUAL'){
                            $scope.signatures = [{}];
                        }
                    };
                    $scope.addNewSignature = function (formValid) {
                        if(formValid){
                            $scope.signatures.push({});
                        }
                    };
                    $scope.deleteSignature = function (index) {
                        $scope.signatures.splice(index,1);
                    };

                    $scope.ok = function (formValid) {
                        if(formValid){
                            $scope.newApply.inherit = ($scope.newAppSigunature.action === 'EXTEND');
                            if($scope.newApply.inherit) {
                                $scope.newApply.predefineName = $scope.newAppSigunature.predefineapp;
                            }else{
                                $scope.newApply.traitInfos = $scope.signatures;
                            }

                            $scope.isAddingApply = true;
                            ApplyCustomize.addNewApply([$scope.newApply], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isAddingApply = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('自定义应用添加失败：' + err.data) : '自定义应用添加失败')
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
                                                            content: '自定义应用添加成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义应用添加失败：' + data.data.reason) : '自定义应用添加失败')
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '自定义应用添加超时'
                                                        });
                                                        $timeout.cancel(checkAdding);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义应用添加失败：' + data.data.reason) : '自定义应用添加失败')
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

            ctrl.viewApply = function (appObject) {
                var modalInstance = $modal.open({
                    templateUrl: 'apply-customize-edit.html',
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
                    $scope.editApply = appObject;
                    //应用特征对象
                    $scope.newAppSigunature={};
                    $scope.newAppSigunature.action = appObject.inherit ? 'EXTEND' : 'MANUAL';
                    if(appObject.inherit){
                        $scope.newAppSigunature.predefineapp = $scope.editApply.predefineName;
                        $scope.signatures = $scope.editApply.traitInfos = [{}];
                    }else{
                        $scope.newAppSigunature.predefineapp = scope.predefineapps && scope.predefineapps.length > 0 ?
                            scope.predefineapps[0] : '';
                        $scope.signatures = $scope.editApply.traitInfos;
                    }

                    $scope.protocols = scope.protocols;
                    $scope.predefineapps = scope.predefineapps;

                    $scope.checkNameVal = function(){
                        return true;
                    };

                    $scope.checkPortVal = function(){
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

            ctrl.editApply = function (appObject) {
                var modalInstance = $modal.open({
                    templateUrl: 'apply-customize-edit.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ApplyCustomize, formatVal) {
                    $scope.isEditDisabled = true;
                    $scope.editApply = angular.copy(appObject);
                    //应用特征对象
                    $scope.newAppSigunature={};
                    $scope.newAppSigunature.action = appObject.inherit ? 'EXTEND' : 'MANUAL';
                    if(appObject.inherit){
                        $scope.newAppSigunature.predefineapp = $scope.editApply.predefineName;
                        $scope.signatures = $scope.editApply.traitInfos = [{}];
                    }else{
                        $scope.newAppSigunature.predefineapp = scope.predefineapps && scope.predefineapps.length > 0 ?
                            scope.predefineapps[0] : '';
                        $scope.signatures = $scope.editApply.traitInfos;
                    }

                    $scope.protocols = scope.protocols;
                    $scope.predefineapps = scope.predefineapps;

                    //自定义validation
                    function checkNameUnique(name){
                        var apps = ctrl.table;
                        var rst = true;
                        if(name && apps){
                            apps.some(function(app){
                                if(app.name === name && name !== appObject.name){
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
                                $scope.nameValMsg = '已定义该名称的应用，请更换其他应用名称';
                            }
                        }
                        return rst;
                    };

                    function checkPortRange(input){
                        if(input && !formatVal.validatePortDiscrete(input)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkPortVal = function(portRange, flag){
                        var rst = checkPortRange(portRange);
                        if(!rst){
//                            var validateMsg = "请输入有效端口号（范围输入时请用'-'分隔，或用逗号分隔多个端口）";
                            var validateMsg = "请输入有效端口号（用逗号分隔最多8个端口）";
                            if(flag==='server'){
                                $scope.serverPortValMsg = validateMsg;
                            }else if(flag==='client'){
                                $scope.clientPortValMsg = validateMsg;
                            }
                        }
                        return rst;
                    };

                    $scope.changeSignatureAction = function(){
                        if($scope.newAppSigunature.action !== 'MANUAL'){
                            $scope.signatures = [{}];
                        }
                    };
                    $scope.addNewSignature = function (formValid) {
                        if(formValid){
                            $scope.signatures.push({});
                        }
                    };
                    $scope.deleteSignature = function (index) {
                        $scope.signatures.splice(index,1);
                    };

                    $scope.ok = function (formValid) {
                        if(formValid){
                            $scope.editApply.inherit = ($scope.newAppSigunature.action === 'EXTEND');
                            if ($scope.editApply.inherit) {
                                $scope.editApply.predefineName = $scope.newAppSigunature.predefineapp;
                                $scope.editApply.traitInfos=[{}];
                            }
                            else {
                                $scope.editApply.traitInfos = $scope.signatures;
                            }
                            $scope.isEdittingApply = true;
                            ApplyCustomize.updateApply([$scope.editApply], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isEdittingApply = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('自定义应用修改失败：' + err.data) : '自定义应用修改失败')
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
                                                            content: '自定义应用修改成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义应用修改失败：' + data.data.reason) : '自定义应用修改失败')
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '自定义应用修改超时'
                                                        });
                                                        $timeout.cancel(checkEditting);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('自定义应用修改失败：' + data.data.reason) : '自定义应用修改失败')
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

            ctrl.deleteApply = function() {
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
                    $rootScope.applyDeleteTaskPromise = deferred.promise;
                    ApplyCustomize.deleteApply(itemNames, function (taskInfo, err) {
                        if (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('自定义应用删除失败：' + err.data) : '自定义应用删除失败')
                            });
                            deferred.resolve('fail');
                        } else {
                            var taskId = taskInfo.taskId;
                            (function countdown(counter) {
                                var checkApplyDeletion = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        if (data.data.state === 'SUCCESS') {
                                            $state.reload().then(function () {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: '自定义应用删除成功'
                                                });
                                            });
                                            deferred.resolve('success');
                                            $timeout.cancel(checkApplyDeletion);
                                        } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('自定义应用删除失败：' + data.data.reason) : '自定义应用删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkApplyDeletion);
                                        } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                            if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '自定义应用删除超时'
                                                });
                                                deferred.resolve('timeout');
                                                $timeout.cancel(checkApplyDeletion);
                                            }
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('自定义应用删除失败：' + data.data.reason) : '自定义应用删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkApplyDeletion);
                                        }
                                    });
                                }, 1000);
                            })(30);
                        }
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条自定义应用'
                    });
                }
            };
        }
    }
})();
