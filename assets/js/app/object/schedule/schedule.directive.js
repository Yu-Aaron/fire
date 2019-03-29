/**
 * Object Schedule Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.object.schedule')
        .directive('objectScheduleTable', objectScheduleTable);

    function objectScheduleTable($rootScope, $q, $modal, $log, $state, $timeout, Enum, Task, ObjectSchedule) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/schedule/scheduleTable.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            var vm = ctrl;

            ctrl.setConfig({
                name: 'item',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                //TODO: _policyRefers的搜索，目前MW尚不支持，待支持后再调试
                //fields: ['name', 'type', '_policyRefers', 'description']
                fields: ['name', 'type', 'description'],
                advancedSearch: 'times',
                advancedSearchOptions:[
                    {'name': 'name', 'display': '名称', 'input': 'string', 'option': false, value: ""},
                    {'name': 'start', 'display': '开始', 'input': 'timerange', 'option': true, value: [],  'options': []},
                    {'name': 'finish', 'display': '结束', 'input': 'timerange', 'option': true, value: [],  'options': []},
                    {'name': 'type', 'display': '循环', 'input': 'checkbox', 'option': true, options: [{'value': '-1', 'text': '全部'},{'value': 'LOOP', 'text': '是'},{'value': 'ONCE', 'text': '否'}]},
                    {'name': 'description', 'display': '描述', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return ObjectSchedule.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return ObjectSchedule.getCount(payload);
            }

            function search(params) {
                //TODO: 循环列为Enum，并且带filter，所以输入的搜索文字可能需要过滤后传给MW server
                return getAll(params);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (schedule) {
                    ctrl.selectedItems[schedule.name] = ctrl.selectAllValue;
                });
            };

            //获取是否具有编辑权限
            scope.privilegeName = 'OBJECT_SCHEDULE';
            var values = Enum.get('privilege').filter(function (pri) {
                return pri.name === scope.privilegeName;
            });
            var actionValue = values && values.length > 0 ? values[0].actionValue : 1;
            scope.isNoEditPri = (actionValue < 28);

            ctrl.addSingleSchedule = function(){
                var modalInstance = $modal.open({
                    templateUrl: 'object-schedule-single-new.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ObjectSchedule, formatVal) {
                    var now = moment($rootScope.currentTime).milliseconds(0).toDate();
                    var tomorrow = moment($rootScope.currentTime).add(1, 'days').milliseconds(0).toDate();
                    $scope.newSchedule={
                        startDate: now,
                        startTime: now,
                        endDate: tomorrow,
                        endTime: tomorrow
                    };

                    //自定义validation
                    function checkNameUnique(name){
                        var schedules = vm.table;
                        var rst = true;
                        if(name && schedules){
                            schedules.some(function(schedule){
                                if(schedule.name === name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name){
                        if(name && !formatVal.validateShortName(name)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，2-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已创建该名称的时间表，请更换其他时间表名称';
                            }
                        }
                        return rst;
                    };

                    $scope.invalidStartDateTime = '';
                    $scope.invalidEndDateTime = '';
                    $scope.checkDateTimeVal = function(flag){
                        var time = $scope.newSchedule;
                        var start = moment(time.startDate).format('YYYY-MM-DD') + 'T' + moment(time.startTime).format('HH:mm:ss');
                        start = moment(start).utc().format();

                        var end = moment(time.endDate).format('YYYY-MM-DD') + 'T' + moment(time.endTime).format('HH:mm:ss');
                        end = moment(end).utc().format();

                        var now = (moment($rootScope.currentTime)).utc().format();

                        $scope.invalidStartDateTime = '';
                        $scope.invalidEndDateTime = '';

                        if (start === 'Invalid date') {
                            $scope.invalidStartDateTime = '开始日期/时间不合法';
                        }
                        if (end === 'Invalid date') {
                            $scope.invalidEndDateTime = '结束日期/时间不合法';
                        }

                        if ($scope.invalidStartDateTime.length === 0 && $scope.invalidEndDateTime.length === 0) {
                            if (start >= end) {
                                if (flag === 'startdate' || flag === 'starttime') {
                                    $scope.invalidStartDateTime = '开始时间要在结束时间之前';
                                }else if (flag === 'enddate' || flag === 'endtime') {
                                    $scope.invalidEndDateTime = '结束时间要在开始时间之后';
                                }
                            }
                            if (start < now) {
                                $scope.invalidStartDateTime = '开始时间不可在当前时间之前';
                            }
                            if (end < now) {
                                $scope.invalidEndDateTime = '结束时间不可在当前时间之前';
                            }
                        }
                    };

                    $scope.ok = function (formValid) {
                        if(formValid){
                            //格式化日期时间
                            var params = angular.copy($scope.newSchedule);
                            params.start = moment(params.startDate).format('YYYY-MM-DD') + 'T' +
                                            moment(params.startTime).format('HH:mm:ss');
                            params.finish = moment(params.endDate).format('YYYY-MM-DD') + 'T' +
                                            moment(params.endTime).format('HH:mm:ss');
                            delete params.startDate;
                            delete params.startTime;
                            delete params.endDate;
                            delete params.endTime;
                            //调用api
                            $scope.isAddingSchedule = true;
                            ObjectSchedule.addSingleSchedule([params], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isAddingSchedule = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('时间表添加失败：' + err.data) : '时间表添加失败')
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
                                                            content: '时间表添加成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表添加失败：' + data.data.reason) : '时间表添加失败')
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '时间表添加超时'
                                                        });
                                                        $timeout.cancel(checkAdding);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表添加失败：' + data.data.reason) : '时间表添加失败')
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

            ctrl.viewSingleSchedule = function(scheduleObject){
                var modalInstance = $modal.open({
                    templateUrl: 'object-schedule-single-edit.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.isViewOnly = true;
                    $scope.editSchedule = scheduleObject;
                    var tempStart = new Date($scope.editSchedule.start);
                    var tempEnd = new Date($scope.editSchedule.finish);
                    $scope.editSchedule.startDate = tempStart;
                    $scope.editSchedule.startTime = tempStart;
                    $scope.editSchedule.endDate = tempEnd;
                    $scope.editSchedule.endTime = tempEnd;

                    $scope.checkNameVal = function(){
                        return true;
                    };

                    $scope.invalidStartDateTime = '';
                    $scope.invalidEndDateTime = '';
                    $scope.checkDateTimeVal = function(){};

                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.editSingleSchedule = function(scheduleObject){
                var modalInstance = $modal.open({
                    templateUrl: 'object-schedule-single-edit.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ObjectSchedule, formatVal) {
                    $scope.editSchedule = angular.copy(scheduleObject);
                    var tempStart = new Date($scope.editSchedule.start);
                    var tempEnd = new Date($scope.editSchedule.finish);
                    $scope.editSchedule.startDate = tempStart;
                    $scope.editSchedule.startTime = tempStart;
                    $scope.editSchedule.endDate = tempEnd;
                    $scope.editSchedule.endTime = tempEnd;

                    //自定义validation
                    function checkNameUnique(name){
                        var schedules = vm.table;
                        var rst = true;
                        if(name && schedules){
                            schedules.some(function(schedule){
                                if(schedule.name === name && name !== scheduleObject.name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name){
                        if(name && !formatVal.validateShortName(name)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，2-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已创建该名称的时间表，请更换其他时间表名称';
                            }
                        }
                        return rst;
                    };

                    $scope.invalidStartDateTime = '';
                    $scope.invalidEndDateTime = '';
                    $scope.checkDateTimeVal = function(flag){
                        var time = $scope.editSchedule;
                        var start = moment(time.startDate).format('YYYY-MM-DD') + 'T' + moment(time.startTime).format('HH:mm:ss');
                        start = moment(start).utc().format();

                        var end = moment(time.endDate).format('YYYY-MM-DD') + 'T' + moment(time.endTime).format('HH:mm:ss');
                        end = moment(end).utc().format();

                        var now = (moment($rootScope.currentTime)).utc().format();

                        $scope.invalidStartDateTime = '';
                        $scope.invalidEndDateTime = '';

                        if (start === 'Invalid date') {
                            $scope.invalidStartDateTime = '开始日期/时间不合法';
                        }
                        if (end === 'Invalid date') {
                            $scope.invalidEndDateTime = '结束日期/时间不合法';
                        }

                        if ($scope.invalidStartDateTime.length === 0 && $scope.invalidEndDateTime.length === 0) {
                            if (start >= end) {
                                if (flag === 'startdate' || flag === 'starttime') {
                                    $scope.invalidStartDateTime = '开始时间要在结束时间之前';
                                }else if (flag === 'enddate' || flag === 'endtime') {
                                    $scope.invalidEndDateTime = '结束时间要在开始时间之后';
                                }
                            }
                            if (start < now) {
                                $scope.invalidStartDateTime = '开始时间不可在当前时间之前';
                            }
                            if (end < now) {
                                $scope.invalidEndDateTime = '结束时间不可在当前时间之前';
                            }
                        }
                    };

                    $scope.ok = function (formValid) {
                        if(formValid){
                            //格式化日期时间
                            var params = angular.copy($scope.editSchedule);
                            params.start = moment(params.startDate).format('YYYY-MM-DD') + 'T' +
                                moment(params.startTime).format('HH:mm:ss');
                            params.finish = moment(params.endDate).format('YYYY-MM-DD') + 'T' +
                                moment(params.endTime).format('HH:mm:ss');
                            delete params.startDate;
                            delete params.startTime;
                            delete params.endDate;
                            delete params.endTime;
                            //调用api
                            $scope.isEdittingSchedule = true;
                            params.type = 'ONCE';
                            ObjectSchedule.updateSchedule([params], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isEdittingSchedule = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('时间表修改失败：' + err.data) : '时间表修改失败')
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
                                                            content: '时间表修改成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表修改失败：' + data.data.reason) : '时间表修改失败')
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '时间表修改超时'
                                                        });
                                                        $timeout.cancel(checkEditting);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表修改失败：' + data.data.reason) : '时间表修改失败')
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

            ctrl.addLoopSchedule = function(){
                var modalInstance = $modal.open({
                    templateUrl: 'object-schedule-loop-new.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ObjectSchedule, formatVal) {
                    var now = moment($rootScope.currentTime).milliseconds(0).toDate();
                    var onehourlater = moment($rootScope.currentTime).add(1, 'hours').milliseconds(0).toDate();
                    $scope.newSchedule={
                        startTime: now,
                        endTime: onehourlater
                    };
                    $scope.loop = {};

                    //自定义validation
                    function checkNameUnique(name){
                        var schedules = vm.table;
                        var rst = true;
                        if(name && schedules){
                            schedules.some(function(schedule){
                                if(schedule.name === name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name){
                        if(name && !formatVal.validateShortName(name)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，2-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已创建该名称的时间表，请更换其他时间表名称';
                            }
                        }
                        return rst;
                    };

                    $scope.invalidStartTime = '';
                    $scope.invalidEndTime = '';
                    $scope.checkTimeVal = function(flag){
                        var time = $scope.newSchedule;
                        var start = moment(time.startTime).utc().format();
                        var end = moment(time.endTime).utc().format();

                        $scope.invalidStartTime = '';
                        $scope.invalidEndTime = '';

                        if (start === 'Invalid date') {
                            $scope.invalidStartTime = '开始时间不合法';
                        }
                        if (end === 'Invalid date') {
                            $scope.invalidEndTime = '结束时间不合法';
                        }

                        if ($scope.invalidStartTime.length === 0 && $scope.invalidEndTime.length === 0) {
                            if (start >= end) {
                                if (flag === 'starttime') {
                                    $scope.invalidStartTime = '开始时间要在结束时间之前';
                                }else if (flag === 'endtime') {
                                    $scope.invalidEndTime = '结束时间要在开始时间之后';
                                }
                            }
                        }
                    };

                    $scope.loopValMsg = '';
                    $scope.$watch("[loop.mon, loop.tue, loop.wed, loop.thu, loop.fri, loop.sat, loop.sun]",
                        function () {
                            $scope.isLoopChecked = false;
                            for(var day in $scope.loop){
                                if($scope.loop[day]){
                                    $scope.isLoopChecked = true;
                                    break;
                                }
                            }
                        });
                    $scope.ok = function (formValid) {
                        $scope.loopValMsg = '';
                        if(formValid){
                            //校验循环周期选择
                            if(!$scope.isLoopChecked){
                                $scope.loopValMsg = '请选择循环周期';
                                return;
                            }
                            //格式化日期时间
                            var params = angular.copy($scope.newSchedule);
                            params.start = moment(params.startTime).format('HH:mm:ss');
                            params.finish = moment(params.endTime).format('HH:mm:ss');
                            delete params.startTime;
                            delete params.endTime;
                            //将星期合并到params
                            angular.merge(params, $scope.loop);
                            //调用api
                            $scope.isAddingSchedule = true;
                            ObjectSchedule.addLoopSchedule([params], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isAddingSchedule = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('时间表添加失败：' + err.data) : '时间表添加失败')
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
                                                            content: '时间表添加成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表添加失败：' + data.data.reason) : '时间表添加失败')
                                                    });
                                                    $timeout.cancel(checkAdding);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '时间表添加超时'
                                                        });
                                                        $timeout.cancel(checkAdding);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表添加失败：' + data.data.reason) : '时间表添加失败')
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

            ctrl.viewLoopSchedule = function(scheduleObject){
                var modalInstance = $modal.open({
                    templateUrl: 'object-schedule-loop-edit.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.isViewOnly = true;
                    $scope.editSchedule = scheduleObject;
                    $scope.editSchedule.startTime = new Date($scope.editSchedule.start);
                    $scope.editSchedule.endTime = new Date($scope.editSchedule.finish);
                    $scope.loop = {
                        'mon': $scope.editSchedule.mon,
                        'tue': $scope.editSchedule.tue,
                        'wed': $scope.editSchedule.wed,
                        'thu': $scope.editSchedule.thu,
                        'fri': $scope.editSchedule.fri,
                        'sat': $scope.editSchedule.sat,
                        'sun': $scope.editSchedule.sun
                    };

                    $scope.checkNameVal = function(){
                        return true;
                    };

                    $scope.invalidStartTime = '';
                    $scope.invalidEndTime = '';
                    $scope.checkTimeVal = function(){};

                    $scope.loopValMsg = '';
                    $scope.ok = function () {
                        $modalInstance.close();
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.editLoopSchedule = function(scheduleObject){
                var modalInstance = $modal.open({
                    templateUrl: 'object-schedule-loop-edit.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, ObjectSchedule, formatVal) {
                    $scope.editSchedule = angular.copy(scheduleObject);
                    $scope.editSchedule.startTime = new Date($scope.editSchedule.start);
                    $scope.editSchedule.endTime = new Date($scope.editSchedule.finish);
                    $scope.loop = {};

                    //自定义validation
                    function checkNameUnique(name){
                        var schedules = vm.table;
                        var rst = true;
                        if(name && schedules){
                            schedules.some(function(schedule){
                                if(schedule.name === name && name !== scheduleObject.name){
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name){
                        if(name && !formatVal.validateShortName(name)){
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function(name){
                        var rst = checkNameCharacter(name);
                        if(!rst){
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，2-20个字符';
                        }else{
                            rst = checkNameUnique(name);
                            if(!rst){
                                $scope.nameValMsg = '已创建该名称的时间表，请更换其他时间表名称';
                            }
                        }
                        return rst;
                    };

                    $scope.invalidStartTime = '';
                    $scope.invalidEndTime = '';
                    $scope.checkTimeVal = function(flag){
                        var time = $scope.editSchedule;
                        var start = moment(time.startTime).utc().format();
                        var end = moment(time.endTime).utc().format();

                        $scope.invalidStartTime = '';
                        $scope.invalidEndTime = '';

                        if (start === 'Invalid date') {
                            $scope.invalidStartTime = '开始时间不合法';
                        }
                        if (end === 'Invalid date') {
                            $scope.invalidEndTime = '结束时间不合法';
                        }

                        if ($scope.invalidStartTime.length === 0 && $scope.invalidEndTime.length === 0) {
                            if (start >= end) {
                                if (flag === 'starttime') {
                                    $scope.invalidStartTime = '开始时间要在结束时间之前';
                                }else if (flag === 'endtime') {
                                    $scope.invalidEndTime = '结束时间要在开始时间之后';
                                }
                            }
                        }
                    };

                    $scope.loopValMsg = '';
                    $scope.$watch("[loop.mon, loop.tue, loop.wed, loop.thu, loop.fri, loop.sat, loop.sun]",
                        function () {
                            $scope.isLoopChecked = false;
                            for(var day in $scope.loop){
                                if($scope.loop[day]){
                                    $scope.isLoopChecked = true;
                                    break;
                                }
                            }
                        });
                    $scope.loop = {
                        'mon': $scope.editSchedule.mon,
                        'tue': $scope.editSchedule.tue,
                        'wed': $scope.editSchedule.wed,
                        'thu': $scope.editSchedule.thu,
                        'fri': $scope.editSchedule.fri,
                        'sat': $scope.editSchedule.sat,
                        'sun': $scope.editSchedule.sun
                    };
                    $scope.ok = function (formValid) {
                        $scope.loopValMsg = '';
                        if(formValid){
                            //校验循环周期选择
                            if(!$scope.isLoopChecked){
                                $scope.loopValMsg = '请选择循环周期';
                                return;
                            }
                            //格式化日期时间
                            var params = angular.copy($scope.editSchedule);
                            params.start = moment(params.startTime).format('HH:mm:ss');
                            params.finish = moment(params.endTime).format('HH:mm:ss');
                            delete params.startTime;
                            delete params.endTime;
                            //将星期合并到params
                            angular.merge(params, $scope.loop);
                            //调用api
                            $scope.isEdittingSchedule = true;
                            params.type = 'LOOP';
                            ObjectSchedule.updateSchedule([params], function(taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function(){
                                    $scope.isEdittingSchedule = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('时间表修改失败：' + err.data) : '时间表修改失败')
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
                                                            content: '时间表修改成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表修改失败：' + data.data.reason) : '时间表修改失败')
                                                    });
                                                    $timeout.cancel(checkEditting);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '时间表修改超时'
                                                        });
                                                        $timeout.cancel(checkEditting);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('时间表修改失败：' + data.data.reason) : '时间表修改失败')
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

            ctrl.deleteSchedule = function() {
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
                    $rootScope.scheduleDeleteTaskPromise = deferred.promise;
                    ObjectSchedule.deleteSchedule(itemNames, function (taskInfo, err) {
                        if (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('时间表删除失败：' + err.data) : '时间表删除失败')
                            });
                            deferred.resolve('fail');
                        } else {
                            var taskId = taskInfo.taskId;
                            (function countdown(counter) {
                                var checkScheduleDeletion = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        if (data.data.state === 'SUCCESS') {
                                            $state.reload().then(function () {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: '时间表删除成功'
                                                });
                                            });
                                            deferred.resolve('success');
                                            $timeout.cancel(checkScheduleDeletion);
                                        } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('时间表删除失败：' + data.data.reason) : '时间表删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkScheduleDeletion);
                                        } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                            if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '时间表删除超时'
                                                });
                                                deferred.resolve('timeout');
                                                $timeout.cancel(checkScheduleDeletion);
                                            }
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('时间表删除失败：' + data.data.reason) : '时间表删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkScheduleDeletion);
                                        }
                                    });
                                }, 1000);
                            })(30);
                        }
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条时间表'
                    });
                }
            };
        }
    }
})();
