/**
 * Todo List Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.todolist')
        .directive('todoListTable', todoListTable)
        .directive('doneListTable', doneListTable);

    function todoListTable($q, Dashboard, $modal, $rootScope) {
        var todoListObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/todolist/todoListTable.html',
            link: link
        };
        return todoListObj;

        function link(scope, element, attr, ctrl) {
            ctrl.disableSearch = true;
            ctrl.disableToolbar = true;
            scope.showDetail = false;
            var filter = '(todoListStatus eq PENDING or todoListStatus eq READ)';
            ctrl.setConfig({
                name: '待办事宜',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount
            });

            scope.filter = 'all';
            scope.$on('newToDoListInsert', function () {
                scope.shouldFlash = true;
            });

            scope.updateTodoItem = function (todolistItem, action) {
                todolistItem.todoListStatus === "PENDING" && $rootScope.$broadcast('todolist_reduce');
                todolistItem.todoListStatus = action;
                Dashboard.updateTodoList(todolistItem.todoListId, todolistItem).then(function () {
                    ctrl.refresh();
                });
            };
            scope.viewDetail = function (todolistItem) {
                // For Malicious Domain, just redirect to the waiting tab.
                if (todolistItem.todoListType === 'MALICIOUS_DOMAIN') {
                    scope.updateTodoItem(todolistItem, 'DONE');
                    window.location.href = '/rule/maliciousdomain?panel=waiting';
                    return;
                }

                if (todolistItem.todoListStatus === "PENDING") {
                    scope.updateTodoItem(todolistItem, 'READ');
                    $rootScope.$broadcast('todolist_reduce');
                }
                var todoListModalInstance = $modal.open({
                    templateUrl: 'templates/todolist/todoList-modal.html',
                    controller: todoListModalInstanceCtrl,
                    size: "sm"
                });
                todoListModalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });

                function todoListModalInstanceCtrl($scope, $modalInstance) {
                    $scope.item = todolistItem;
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.decline = function (item) {
                        scope.updateTodoItem(item, "DECLINED");
                        ctrl.refresh();
                        $modalInstance.close('done');
                    };
                    $scope.confirm = function (item) {
                        Dashboard.doTodoItem(item).then(function (data) {
                            if (data.error) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: item.content + ' - 失败! ' + data.error
                                });
                            } else {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: item.content + ' - 成功'
                                });
                                scope.updateTodoItem(item, "DONE");
                            }
                        });
                        ctrl.refresh();
                        $modalInstance.close('done');
                    };
                }
            };

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'createdAt desc';
                }
                var payload = params || {};
                payload.$filter = filter;
                return Dashboard.getTodoList(payload).then(function (data) {
                    return data;
                });
            }

            function getCount() {
                var payload = {};
                payload.$filter = filter;
                return Dashboard.getTodoList(payload).then(function (data) {
                    $rootScope.$broadcast('todolist_refresh', data.length);
                    return data.length;
                });
            }
        }
    }

    function doneListTable($q, Dashboard, $modal) {
        var todoListObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/todolist/todoListTable.html',
            link: link
        };
        return todoListObj;

        function link(scope, element, attr, ctrl) {
            ctrl.disableSearch = true;
            ctrl.disableToolbar = true;
            scope.showDetail = false;
            var filter = '(todoListStatus eq DECLINED or todoListStatus eq DONE)';
            ctrl.setConfig({
                name: '已办事宜',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount
            });

            scope.filter = 'all';

            scope.viewDetail = function (todolistItem) {
                // For Malicious Domain, just redirect to the waiting tab.
                if (todolistItem.todoListType === 'MALICIOUS_DOMAIN') {
                    window.location.href = '/rule/maliciousdomain?panel=waiting';
                    return;
                }
                var todoListModalInstance = $modal.open({
                    templateUrl: 'templates/todolist/todoList-modal.html',
                    controller: todoListModalInstanceCtrl,
                    size: "sm"
                });
                todoListModalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });

                function todoListModalInstanceCtrl($scope, $modalInstance) {
                    $scope.item = todolistItem;
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'createdAt desc';
                }
                var payload = params || {};
                payload.$filter = filter;
                return Dashboard.getTodoList(payload).then(function (data) {
                    return data;
                });
            }

            function getCount() {
                var payload = {};
                payload.$filter = filter;
                return Dashboard.getTodoList(payload).then(function (data) {
                    return data.length;
                });
            }
        }
    }
})();
