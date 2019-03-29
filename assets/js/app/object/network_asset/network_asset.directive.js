/**
 * Object Network assets Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.object.network_asset')
        .directive('ipPoolTable', ipPoolTable)
        .directive('securityAreaTable', securityAreaTable)
        .directive('deviceAssetTable', deviceAssetTable);

    function ipPoolTable($rootScope, $q, $modal, $log, $state, $timeout, $filter, Enum, Task, IpPool) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/network_asset/ipPoolTable.html',
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
                //fields: ['name', 'interfaceName', 'ipAddress', '_policyRefers', 'enable']
                fields: ['name', 'interfaceName', 'ipAddress', 'enable'],
                advancedSearch: 'addressPools',
                advancedSearchOptions: [
                    {'name': 'name', 'display': '地址池名称', 'input': 'string', 'option': false, value: ""},
                    {'name': 'interfaceName', 'display': '接口', 'input': 'string', 'option': false, value: ""},
                    {'name': 'ipAddress', 'display': 'IP段', 'input': 'string', 'option': false, value: ""},
                    {
                        'name': 'enable',
                        'display': '启动',
                        'input': 'checkbox',
                        'option': true,
                        'options': [{'value': '-1', 'text': '全部'}, {'value': true, 'text': '开启'}, {
                            'value': false,
                            'text': '关闭'
                        }]
                    }
                ]
            });

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return IpPool.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return IpPool.getCount(payload);
            }

            function search(params) {
                //TODO: 启动列显示带filter，所以输入的搜索文字可能需要过滤后传给MW server
                return getAll(params);
            }

            //带参数传递的state reload
            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (ip) {
                    ctrl.selectedItems[ip.name] = ctrl.selectAllValue;
                });
            };

            ctrl.selectedChanged = function () {
                var selectedAll = true;
                var hasSelected = false;
                var singleSelected = false;

                ctrl.table.forEach(function (ip) {

                    if (ctrl.selectedItems[ip.name] === undefined || ctrl.selectedItems[ip.name] === null) {
                        singleSelected = false;
                    } else {
                        singleSelected = ctrl.selectedItems[ip.name];
                    }

                    hasSelected = hasSelected || singleSelected;

                    selectedAll = selectedAll && singleSelected;
                });

                ctrl.selectAllValue = selectedAll ? true : (hasSelected ? null : false);
            };

            //获取是否具有编辑权限
            scope.privilegeName = 'OBJECT_ASSET';
            var values = Enum.get('privilege').filter(function (pri) {
                return pri.name === scope.privilegeName;
            });
            var actionValue = values && values.length > 0 ? values[0].actionValue : 1;
            scope.isNoEditPri = (actionValue < 28);

            scope.isSwitchIpPool = {};
            scope.switchIpPoolMsg = {};
            ctrl.changeStartStatus = function (ip) {
                var action = ip.enable ? '启动' : '关闭';
                scope.isSwitchIpPool[ip.name] = true;
                scope.switchIpPoolMsg[ip.name] = action;
                IpPool.switchIpPool(ip.name, ip.enable, function (taskInfo, err) {
                    if (err) {
                        scope.isSwitchIpPool[ip.name] = false;
                        ip.enable = !ip.enable;//复原radio box状态
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('地址池(' + ip.name + ')' + action + '失败：' + err.data) :
                            '地址池(' + ip.name + ')' + action + '失败')
                        });
                    } else {
                        var taskId = taskInfo.taskId;
                        (function countdown(counter) {
                            var checkIpPoolSwitch = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        scope.isSwitchIpPool[ip.name] = false;
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '地址池(' + ip.name + ')' + action + '成功'
                                        });
                                        $timeout.cancel(checkIpPoolSwitch);
                                    } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                        scope.isSwitchIpPool[ip.name] = false;
                                        ip.enable = !ip.enable;//复原radio box状态
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('地址池(' + ip.name + ')' + action +
                                            '失败：' + data.data.reason) :
                                            '地址池(' + ip.name + ')' + action + '失败')
                                        });
                                        $timeout.cancel(checkIpPoolSwitch);
                                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                        if (counter > 0) {
                                            countdown(counter - 1);
                                        } else {
                                            scope.isSwitchIpPool[ip.name] = false;
                                            ip.enable = !ip.enable;//复原radio box状态
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: '地址池(' + ip.name + ')' + action + '超时'
                                            });
                                            $timeout.cancel(checkIpPoolSwitch);
                                        }
                                    } else {
                                        scope.isSwitchIpPool[ip.name] = false;
                                        ip.enable = !ip.enable;//复原radio box状态
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('地址池(' + ip.name + ')' + action +
                                            '失败：' + data.data.reason) :
                                            '地址池(' + ip.name + ')' + action + '失败')
                                        });
                                        $timeout.cancel(checkIpPoolSwitch);
                                    }
                                });
                            }, 1000);
                        })(30);
                    }
                });
            };

            ctrl.addNewIp = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'ip-pool-add-new.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, IpPool, formatVal) {
                    $scope.newIpPool = {};
                    $scope.placeHolder = "192.168.1.2/255.255.255.0";
                    //获取类型列表内容
                    IpPool.getTypes().then(function (types) {
                        $scope.newIpPool.type = types && types.length > 0 ? types[0] : '';
                        $scope.types = types;
                    });
                    //获取接口列表内容
                    $scope.interfaces = ['any'];
                    IpPool.getInterfaces().then(function (interfaces) {
                        interfaces = $filter('spliceContentFromArray')(interfaces, ['agl0', 'ha']);
                        $scope.newIpPool.interfaceName = interfaces && interfaces.length > 0 ? interfaces[0] : 'any';
                        $scope.interfaces = $scope.interfaces.concat(interfaces);
                    });

                    //自定义validation
                    function checkNameUnique(name) {
                        var ippools = vm.table;
                        var rst = true;
                        if (name && ippools) {
                            ippools.some(function (ippool) {
                                if (ippool.name === name) {
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name) {
                        if (name && !formatVal.validateObjectAssetsName(name)) {
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function (name) {
                        var rst = checkNameCharacter(name);
                        if (!rst) {
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        } else {
                            rst = checkNameUnique(name);
                            if (!rst) {
                                $scope.nameValMsg = '已创建该名称的地址池，请更换其他地址池名称';
                            }
                        }
                        return rst;
                    };

                    $scope.checkIpRangeVal = function (input) {
                        if (input) {
                            var ips;
                            //类型为网段时:支持格式1.1.1.1-1.1.2.2
                            if ($scope.newIpPool.type === 'IPRANGE') {
                                ips = input.split('-');
                                if (angular.isArray(ips) && ips.length === 2) {
                                    var ipstart = ips[0];
                                    var ipend = ips[1];
                                    if (formatVal.validateIp(ipstart) || formatVal.validateIp(ipend)) {
                                        return false;
                                    }
                                } else {
                                    return false;
                                }
                            } else {
                                if ($.trim(input) !== "0.0.0.0/0" && $.trim(input) !== "0.0.0.0/0.0.0.0") {
                                    // if (formatVal.validateIpRange(input)) {
                                    // ips = input.split('/');
                                    // if (angular.isArray(ips) && ips.length === 2) {
                                    //     var ip = ips[0];
                                    //     var netmask = ips[1];
                                    //     if (formatVal.validateIp(ip) || formatVal.validateNetMask(netmask)) {
                                    //         return false;
                                    //     }
                                    // } else {
                                    //     return false;
                                    // }
                                    if (formatVal.validateIpSegment(input)) {
                                        return false;
                                    }
                                    // }
                                }
                            }
                        }
                        return true;
                    };

                    $scope.changeType = function (type) {
                        $scope.newIpPool.type = type;
                        $scope.newIpPool.ipAddress = '';

                        if (type === "IPRANGE") {
                            $scope.placeHolder = "192.168.1.2-192.168.2.2";
                        } else {
                            $scope.placeHolder = "192.168.1.2/255.255.255.0";
                        }
                    };

                    $scope.changeInterface = function (select) {
                        $scope.newIpPool.interfaceName = select;
                    };

                    $scope.ok = function (formValid) {
                        if (formValid) {
                            $scope.isAddingIpPool = true;
                            IpPool.addNewIpPool([$scope.newIpPool], function (taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function () {
                                    $scope.isAddingIpPool = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('地址池添加失败：' + err.data) : '地址池添加失败')
                                    });
                                } else {
                                    var taskId = taskInfo.taskId;
                                    (function countdown(counter) {
                                        var checkIpPoolAdding = $timeout(function () {
                                            Task.getTask(taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    $scope.$emit('closeAddModal');
                                                    reload().then(function () {
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '地址池添加成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkIpPoolAdding);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('地址池添加失败：' + data.data.reason) : '地址池添加失败')
                                                    });
                                                    $timeout.cancel(checkIpPoolAdding);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '地址池添加超时'
                                                        });
                                                        $timeout.cancel(checkIpPoolAdding);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('地址池添加失败：' + data.data.reason) : '地址池添加失败')
                                                    });
                                                    $timeout.cancel(checkIpPoolAdding);
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

            ctrl.viewIp = function (ipPool) {
                var modalInstance = $modal.open({
                    templateUrl: 'ip-pool-edit.html',
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
                    $scope.ipPool = ipPool;
                    $scope.checkNameVal = function () {
                        return true;
                    };
                    $scope.checkIpRangeVal = function () {
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

            ctrl.editIp = function (ipPool) {
                var modalInstance = $modal.open({
                    templateUrl: 'ip-pool-edit.html',
                    size: 'sm',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, IpPool, formatVal) {
                    $scope.isEditDisabled = true;
                    $scope.ipPool = angular.copy(ipPool);
                    $scope.placeHolder = "192.168.1.2/255.255.255.0";
                    //获取类型列表内容
                    IpPool.getTypes().then(function (types) {
                        $scope.types = types;
                    });
                    //获取接口列表内容
                    $scope.interfaces = ['any'];
                    IpPool.getInterfaces().then(function (interfaces) {
                        interfaces = $filter('spliceContentFromArray')(interfaces, ['agl0', 'ha']);
                        $scope.interfaces = $scope.interfaces.concat(interfaces);
                    });

                    //自定义validation
                    function checkNameUnique(name) {
                        var ippools = vm.table;
                        var rst = true;
                        if (name && ippools) {
                            ippools.some(function (ippool) {
                                if (ippool.name === name && ippool.name !== ipPool.name) {
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name) {
                        if (name && !formatVal.validateObjectAssetsName(name)) {
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function (name) {
                        var rst = checkNameCharacter(name);
                        if (!rst) {
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        } else {
                            rst = checkNameUnique(name);
                            if (!rst) {
                                $scope.nameValMsg = '已创建该名称的地址池，请更换其他地址池名称';
                            }
                        }
                        return rst;
                    };

                    $scope.checkIpRangeVal = function (input) {
                        if (input) {
                            var ips;
                            //类型为网段时:支持格式1.1.1.1-1.1.2.2
                            if ($scope.ipPool.type === 'IPRANGE') {
                                if ($.trim(input) !== "0.0.0.0-0.0.0.0") {
                                    ips = input.split('-');
                                    if (angular.isArray(ips) && ips.length === 2) {
                                        var ipstart = ips[0];
                                        var ipend = ips[1];
                                        if (formatVal.validateIp(ipstart) || formatVal.validateIp(ipend)) {
                                            return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                }
                            } else {
                                if ($.trim(input) !== "0.0.0.0/0" && $.trim(input) !== "0.0.0.0/0.0.0.0") {
                                    // if (formatVal.validateIpRange(input)) {
                                    //     ips = input.split('/');
                                    //     if (angular.isArray(ips) && ips.length === 2) {
                                    //         var ip = ips[0];
                                    //         var netmask = ips[1];
                                    //         if (formatVal.validateIp(ip) || formatVal.validateNetMask(netmask)) {
                                    //             return false;
                                    //         }
                                    //     } else {
                                    //         return false;
                                    //     }
                                    // }
                                    if (formatVal.validateIpSegment(input)) {
                                        return false;
                                    }
                                }
                            }
                        }
                        return true;
                    };

                    $scope.changeType = function (type) {
                        $scope.ipPool.type = type;
                        $scope.ipPool.ipAddress = '';

                        if (type === "IPRANGE") {
                            $scope.placeHolder = "192.168.1.2-192.168.2.2";
                        } else {
                            $scope.placeHolder = "192.168.1.2/255.255.255.0";
                        }
                    };

                    $scope.changeInterface = function (select) {
                        $scope.ipPool.interfaceName = select;
                    };

                    $scope.ok = function (formValid) {
                        if (formValid) {
                            $scope.isEdittingIpPool = true;
                            IpPool.updateIpPool([$scope.ipPool], function (taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function () {
                                    $scope.isEdittingIpPool = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('地址池修改失败：' + err.data) : '地址池修改失败')
                                    });
                                } else {
                                    var taskId = taskInfo.taskId;
                                    (function countdown(counter) {
                                        var checkIpPoolEditting = $timeout(function () {
                                            Task.getTask(taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    $scope.$emit('closeAddModal');
                                                    reload().then(function () {
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '地址池修改成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkIpPoolEditting);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('地址池修改失败：' + data.data.reason) : '地址池修改失败')
                                                    });
                                                    $timeout.cancel(checkIpPoolEditting);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '地址池修改超时'
                                                        });
                                                        $timeout.cancel(checkIpPoolEditting);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('地址池修改失败：' + data.data.reason) : '地址池修改失败')
                                                    });
                                                    $timeout.cancel(checkIpPoolEditting);
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

            ctrl.deleteIp = function () {
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
                    $rootScope.ipPoolDeleteTaskPromise = deferred.promise;
                    IpPool.deleteIpPool(itemNames, function (taskInfo, err) {
                        if (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('地址池删除失败：' + err.data) : '地址池删除失败')
                            });
                            deferred.resolve('fail');
                        } else {
                            var taskId = taskInfo.taskId;
                            (function countdown(counter) {
                                var checkIpPoolDeletion = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        if (data.data.state === 'SUCCESS') {
                                            reload().then(function () {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: '地址池删除成功'
                                                });
                                            });
                                            deferred.resolve('success');
                                            $timeout.cancel(checkIpPoolDeletion);
                                        } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('地址池删除失败：' + data.data.reason) : '地址池删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkIpPoolDeletion);
                                        } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                            if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '地址池删除超时'
                                                });
                                                deferred.resolve('timeout');
                                                $timeout.cancel(checkIpPoolDeletion);
                                            }
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('地址池删除失败：' + data.data.reason) : '地址池删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkIpPoolDeletion);
                                        }
                                    });
                                }, 1000);
                            })(30);
                        }
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条地址池'
                    });
                }
            };
        }

    }

    function securityAreaTable($rootScope, $q, $modal, $log, $state, $timeout, $filter, Enum, Task, SecurityArea) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/network_asset/securityAreaTable.html',
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
                //TODO: _interfaceNames、_policyRefers和_addressRefers的搜索，目前MW尚不支持，待支持后再调试
                //fields: ['name', '_interfaceNames', '_addressRefers', '_policyRefers', 'enable']
                fields: ['name', 'enable'],
                advancedSearch: 'securityAreas',
                advancedSearchOptions: [
                    {'name': 'name', 'display': '安全区域名', 'input': 'string', 'option': false, value: ""},
                    {
                        'name': 'enable',
                        'display': '启动',
                        'input': 'checkbox',
                        'option': true,
                        'options': [{'value': '-1', 'text': '全部'}, {'value': true, 'text': '开启'}, {
                            'value': false,
                            'text': '关闭'
                        }]
                    }
                ]
            });

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return SecurityArea.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return SecurityArea.getCount(payload);
            }

            function search(params) {
                //TODO: 启动列显示带filter，所以输入的搜索文字可能需要过滤后传给MW server
                return getAll(params);
            }

            //带参数传递的state reload
            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (area) {
                    ctrl.selectedItems[area.name] = ctrl.selectAllValue;
                });
            };

            ctrl.selectedChanged = function () {
                var selectedAll = true;
                var hasSelected = false;
                var singleSelected = false;

                ctrl.table.forEach(function (area) {

                    if (ctrl.selectedItems[area.name] === undefined || ctrl.selectedItems[area.name] === null) {
                        singleSelected = false;
                    } else {
                        singleSelected = ctrl.selectedItems[area.name];
                    }

                    hasSelected = hasSelected || singleSelected;

                    selectedAll = selectedAll && singleSelected;
                });

                ctrl.selectAllValue = selectedAll ? true : (hasSelected ? null : false);
            };

            //获取是否具有编辑权限
            scope.privilegeName = 'OBJECT_ASSET';
            var values = Enum.get('privilege').filter(function (pri) {
                return pri.name === scope.privilegeName;
            });
            var actionValue = values && values.length > 0 ? values[0].actionValue : 1;
            scope.isNoEditPri = (actionValue < 28);

            scope.isSwitchArea = {};
            scope.switchAreaMsg = {};
            ctrl.changeStartStatus = function (area) {
                var action = area.enable ? '启动' : '关闭';
                scope.isSwitchArea[area.name] = true;
                scope.switchAreaMsg[area.name] = action;
                SecurityArea.switchSecurityArea(area.securityAreaId, area.name, area.enable, function (taskInfo, err) {
                    if (err) {
                        scope.isSwitchArea[area.name] = false;
                        area.enable = !area.enable;//复原radio box状态
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('安全区域(' + area.name + ')' + action + '失败：' + err.data) :
                            '安全区域(' + area.name + ')' + action + '失败')
                        });
                    } else {
                        var taskId = taskInfo.taskId;
                        (function countdown(counter) {
                            var checkSwitch = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        scope.isSwitchArea[area.name] = false;
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '安全区域(' + area.name + ')' + action + '成功'
                                        });
                                        $timeout.cancel(checkSwitch);
                                    } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                        scope.isSwitchArea[area.name] = false;
                                        area.enable = !area.enable;//复原radio box状态
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('安全区域(' + area.name + ')' + action +
                                            '失败：' + data.data.reason) :
                                            '安全区域(' + area.name + ')' + action + '失败')
                                        });
                                        $timeout.cancel(checkSwitch);
                                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                        if (counter > 0) {
                                            countdown(counter - 1);
                                        } else {
                                            scope.isSwitchArea[area.name] = false;
                                            area.enable = !area.enable;//复原radio box状态
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: '安全区域(' + area.name + ')' + action + '超时'
                                            });
                                            $timeout.cancel(checkSwitch);
                                        }
                                    } else {
                                        scope.isSwitchArea[area.name] = false;
                                        area.enable = !area.enable;//复原radio box状态
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('安全区域(' + area.name + ')' + action +
                                            '失败：' + data.data.reason) :
                                            '安全区域(' + area.name + ')' + action + '失败')
                                        });
                                        $timeout.cancel(checkSwitch);
                                    }
                                });
                            }, 1000);
                        })(30);
                    }
                });
            };

            ctrl.addNewSecurityArea = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'security-area-add-new.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, SecurityArea, formatVal) {
                    $scope.newSecurityArea = {};
                    $scope.selectedInterfaces = {};//选择的接口
                    //获取接口列表内容
                    $scope.isGettingInterfaces = true;
                    SecurityArea.getInterfaces().then(function (interfaces) {
                        // $scope.interfaces = $filter('spliceContentFromArray')(
                        //     $filter('spliceContentFromArray')(interfaces, ['agl0', 'ha'], 'interfaceName'),
                        //     ['SUB'], 'interfaceType');
                        //BRI接口中包含的ETH接口都要disable
                        $scope.briInterfaceNames = [];
                        if (angular.isArray(interfaces)) {
                            interfaces.forEach(function (item) {
                                if (item.interfaceType === 'BRI') {
                                    if (item.briInterfaceName) {
                                        Array.prototype.push.apply($scope.briInterfaceNames,
                                            item.briInterfaceName.split(';'));
                                    }
                                }
                            });
                        }
                        var usedInterfaces = [];
                        interfaces.map(function (m) {
                            if (m.interfaceName !== 'agl0' && m.interfaceName !== 'ha' && m.interfaceType !== 'SUB') {
                                usedInterfaces.push(m);
                            }
                        });
                        $scope.interfaces = usedInterfaces;
                        $scope.isGettingInterfaces = false;
                    }, function () {
                        //无法获取接口数据
                        $scope.isGettingInterfaces = false;
                    });

                    //自定义validation
                    function checkNameUnique(name) {
                        var areas = vm.table;
                        var rst = true;
                        if (name && areas) {
                            areas.some(function (area) {
                                if (area.name === name) {
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name) {
                        if (name && !formatVal.validateObjectAssetsName(name)) {
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function (name) {
                        var rst = checkNameCharacter(name);
                        if (!rst) {
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        } else {
                            rst = checkNameUnique(name);
                            if (!rst) {
                                $scope.nameValMsg = '已创建该名称的安全区域，请更换其他安全区域名称';
                            }
                        }
                        return rst;
                    };

                    $scope.ok = function (formValid) {
                        if (formValid) {
                            $scope.newSecurityArea._interfaceNames = [];
                            for (var interfacename in $scope.selectedInterfaces) {
                                if ($scope.selectedInterfaces[interfacename]) {
                                    $scope.newSecurityArea._interfaceNames.push(interfacename);
                                }
                            }

                            if ($scope.newSecurityArea._interfaceNames.length === 0) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '安全区域添加失败,请选择接口!'
                                });
                                return;
                            }

                            $scope.newSecurityArea._interfaceNames = $scope.newSecurityArea._interfaceNames.join(';');

                            $scope.isAddingArea = true;
                            SecurityArea.addNewSecurityArea([$scope.newSecurityArea], function (taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function () {
                                    $scope.isAddingArea = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('安全区域添加失败：' + err.data) : '安全区域添加失败')
                                    });
                                } else {
                                    var taskId = taskInfo.taskId;
                                    (function countdown(counter) {
                                        var checkAreaAdding = $timeout(function () {
                                            Task.getTask(taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    $scope.$emit('closeAddModal');
                                                    reload().then(function () {
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '安全区域添加成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkAreaAdding);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全区域添加失败：' + data.data.reason) : '安全区域添加失败')
                                                    });
                                                    $timeout.cancel(checkAreaAdding);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '安全区域添加超时'
                                                        });
                                                        $timeout.cancel(checkAreaAdding);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全区域添加失败：' + data.data.reason) : '安全区域添加失败')
                                                    });
                                                    $timeout.cancel(checkAreaAdding);
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

            function genInterfaces(interfaceStr) {
                var rst = {};
                if (interfaceStr) {
                    var temp = interfaceStr.split(',');
                    temp.forEach(function (item) {
                        rst[item] = true;
                    });
                }
                return rst;
            }

            ctrl.viewSecurityArea = function (securityArea) {
                var modalInstance = $modal.open({
                    templateUrl: 'security-area-edit.html',
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
                    $scope.editSecurityArea = securityArea;
                    $scope.selectedInterfaces = genInterfaces(securityArea._interfaceNames);//选择的接口
                    //获取接口列表内容
                    $scope.isGettingInterfaces = true;
                    SecurityArea.getInterfaces().then(function (interfaces) {
                        // $scope.interfaces = $filter('spliceContentFromArray')(
                        //     $filter('spliceContentFromArray')(interfaces, ['agl0', 'ha'], 'interfaceName'),
                        //     ['SUB'], 'interfaceType');
                        //BRI接口中包含的ETH接口都要disable
                        $scope.briInterfaceNames = [];
                        if (angular.isArray(interfaces)) {
                            interfaces.forEach(function (item) {
                                if (item.interfaceType === 'BRI') {
                                    if (item.briInterfaceName) {
                                        Array.prototype.push.apply($scope.briInterfaceNames,
                                            item.briInterfaceName.split(';'));
                                    }
                                }
                            });
                        }
                        var usedInterfaces = [];
                        interfaces.map(function (m) {
                            if (m.interfaceName !== 'agl0' && m.interfaceName !== 'ha' && m.interfaceType !== 'SUB') {
                                usedInterfaces.push(m);
                            }
                        });
                        $scope.interfaces = usedInterfaces;
                        $scope.isGettingInterfaces = false;
                    }, function () {
                        //无法获取接口数据
                        $scope.isGettingInterfaces = false;
                    });

                    $scope.checkNameVal = function () {
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

            ctrl.editSecurityArea = function (securityArea) {
                var modalInstance = $modal.open({
                    templateUrl: 'security-area-edit.html',
                    size: 'lg',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance, SecurityArea, formatVal) {
                    $scope.isEditDisabled = true;
                    $scope.editSecurityArea = angular.copy(securityArea);
                    $scope.selectedInterfaces = genInterfaces(securityArea._interfaceNames);//选择的接口
                    //获取接口列表内容
                    $scope.isGettingInterfaces = true;
                    SecurityArea.getInterfaces().then(function (interfaces) {
                        // $scope.interfaces = $filter('spliceContentFromArray')(
                        //     $filter('spliceContentFromArray')(interfaces, ['agl0', 'ha'], 'interfaceName'),
                        //     ['SUB'], 'interfaceType');
                        //BRI接口中包含的ETH接口都要disable
                        $scope.briInterfaceNames = [];
                        if (angular.isArray(interfaces)) {
                            interfaces.forEach(function (item) {
                                if (item.interfaceType === 'BRI') {
                                    if (item.briInterfaceName) {
                                        Array.prototype.push.apply($scope.briInterfaceNames,
                                            item.briInterfaceName.split(';'));
                                    }
                                }
                            });
                        }
                        var usedInterfaces = [];
                        interfaces.map(function (m) {
                            if (m.interfaceName !== 'agl0' && m.interfaceName !== 'ha' && m.interfaceType !== 'SUB') {
                                usedInterfaces.push(m);
                            }
                        });
                        $scope.interfaces = usedInterfaces;
                        $scope.isGettingInterfaces = false;
                    }, function () {
                        //无法获取接口数据
                        $scope.isGettingInterfaces = false;
                    });

                    //自定义validation
                    function checkNameUnique(name) {
                        var areas = vm.table;
                        var rst = true;
                        if (name && areas) {
                            areas.some(function (area) {
                                if (area.name === name && area.name !== securityArea.name) {
                                    rst = false;
                                    return true;
                                }
                            });
                        }
                        return rst;
                    }

                    function checkNameCharacter(name) {
                        if (name && !formatVal.validateObjectAssetsName(name)) {
                            return false;
                        }
                        return true;
                    }

                    $scope.checkNameVal = function (name) {
                        var rst = checkNameCharacter(name);
                        if (!rst) {
                            $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        } else {
                            rst = checkNameUnique(name);
                            if (!rst) {
                                $scope.nameValMsg = '已创建该名称的安全区域，请更换其他安全区域名称';
                            }
                        }
                        return rst;
                    };

                    $scope.ok = function (formValid) {
                        if (formValid) {
                            $scope.editSecurityArea._interfaceNames = [];
                            for (var interfacename in $scope.selectedInterfaces) {
                                if ($scope.selectedInterfaces[interfacename]) {
                                    $scope.editSecurityArea._interfaceNames.push(interfacename);
                                }
                            }

                            if ($scope.editSecurityArea._interfaceNames.length === 0) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '安全区域修改失败,请选择接口!'
                                });
                                return;
                            }

                            $scope.editSecurityArea._interfaceNames = $scope.editSecurityArea._interfaceNames.join(';');

                            $scope.isEdittingArea = true;
                            SecurityArea.updateSecurityArea([$scope.editSecurityArea], function (taskInfo, err) {
                                var cancellable = $scope.$on('closeAddModal', function () {
                                    $scope.isEdittingArea = false;
                                    $modalInstance.close();
                                    cancellable();
                                });

                                if (err) {
                                    $scope.$emit('closeAddModal');
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: (err.data ? ('安全区域修改失败：' + err.data) : '安全区域修改失败')
                                    });
                                } else {
                                    var taskId = taskInfo.taskId;
                                    (function countdown(counter) {
                                        var checkAreaEditting = $timeout(function () {
                                            Task.getTask(taskId).then(function (data) {
                                                if (data.data.state === 'SUCCESS') {
                                                    $scope.$emit('closeAddModal');
                                                    reload().then(function () {
                                                        $rootScope.addAlert({
                                                            type: 'success',
                                                            content: '安全区域修改成功'
                                                        });
                                                    });
                                                    $timeout.cancel(checkAreaEditting);
                                                } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全区域修改失败：' + data.data.reason) : '安全区域修改失败')
                                                    });
                                                    $timeout.cancel(checkAreaEditting);
                                                } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                    if (counter > 0) {
                                                        countdown(counter - 1);
                                                    } else {
                                                        $scope.$emit('closeAddModal');
                                                        $rootScope.addAlert({
                                                            type: 'danger',
                                                            content: '安全区域修改超时'
                                                        });
                                                        $timeout.cancel(checkAreaEditting);
                                                    }
                                                } else {
                                                    $scope.$emit('closeAddModal');
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: (data.data.reason ? ('安全区域修改失败：' + data.data.reason) : '安全区域修改失败')
                                                    });
                                                    $timeout.cancel(checkAreaEditting);
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

            ctrl.deleteSecurityArea = function () {
                var selectedItems = ctrl.selectedItems;
                var itemNames = [];
                if (selectedItems) {
                    for (var name in selectedItems) {
                        if (selectedItems[name]) {
                            // ctrl.table.forEach(function (area) {
                            for (var i = 0; i < ctrl.table.length; i++) {
                                if (ctrl.table[i].name === name) {
                                    itemNames.push(name + "," + ctrl.table[i].securityAreaId);
                                }
                                // });
                            }
                        }
                    }
                }

                if (itemNames.length !== 0) {
                    var deferred = $q.defer();
                    $rootScope.secAreaDeleteTaskPromise = deferred.promise;
                    SecurityArea.deleteSecurityArea(itemNames, function (taskInfo, err) {
                        if (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('安全区域删除失败：' + err.data) : '安全区域删除失败')
                            });
                            deferred.resolve('fail');
                        } else {
                            var taskId = taskInfo.taskId;
                            (function countdown(counter) {
                                var checkSecurityAreaDeletion = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        if (data.data.state === 'SUCCESS') {
                                            reload().then(function () {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: '安全区域删除成功'
                                                });
                                            });
                                            deferred.resolve('success');
                                            $timeout.cancel(checkSecurityAreaDeletion);
                                        } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('安全区域删除失败：' + data.data.reason) : '安全区域删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkSecurityAreaDeletion);
                                        } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                            if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '安全区域删除超时'
                                                });
                                                deferred.resolve('timeout');
                                                $timeout.cancel(checkSecurityAreaDeletion);
                                            }
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('安全区域删除失败：' + data.data.reason) : '安全区域删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkSecurityAreaDeletion);
                                        }
                                    });
                                }, 1000);
                            })(30);
                        }
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条安全区域'
                    });
                }
            };
        }

    }

    function deviceAssetTable($rootScope, $q, $state, $timeout, Task, formatVal, Enum, DeviceAsset) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/object/network_asset/deviceAssetTable.html',
            link: link
        };

        return obj;

        //////////
        function link(scope, element, attr, ctrl) {

            $q.all([
//                DeviceAsset.getAddressPoolNames(),
                DeviceAsset.getSecurityAreaNames(),
                DeviceAsset.getTypes()
            ]).then(function (data) {
                //获取地址池列表内容
//                ctrl.ippools = data[0];
                //获取安全区域列表内容
                ctrl.securityareas = data[0];
                //获取类型列表内容
                scope.types = data[1];

                //配置dtable
                ctrl.setConfig({
                    name: 'item',
                    pagination: true,
                    scrollable: false,
                    totalCount: true,
                    getAll: getAll,
                    getCount: getCount,
                    search: search,
                    fields: ['name', 'kind', 'make', 'model', 'ipAddress', 'macAddress', /* 'addressPoolName',*/
                        'securityAreaName', 'inputType', 'enable'],
                    advancedSearch: 'deviceAssets',
                    advancedSearchOptions: [
                        {'name': 'name', 'display': '名称', 'input': 'string', 'option': false, value: ""},
                        {
                            'name': 'kind',
                            'display': '类型',
                            'input': 'checkbox',
                            'option': true,
                            'parser': 'string',
                            options: conver2Options(scope.types)
                        },
                        {'name': 'make', 'display': '厂商', 'input': 'string', 'option': false, value: ""},
                        {'name': 'model', 'display': '型号', 'input': 'string', 'option': false, value: ""},
                        {'name': 'ipAddress', 'display': 'IP地址', 'input': 'string', 'option': false, value: ""},
                        {'name': 'macAddress', 'display': 'MAC地址', 'input': 'string', 'option': false, value: ""},
//                        {'name': 'addressPoolName', 'display': '地址池', 'input': 'checkbox', 'option': true, 'parser':'string', options: conver2Options(ctrl.ippools)},
                        {
                            'name': 'securityAreaName',
                            'display': '安全区域',
                            'input': 'checkbox',
                            'option': true,
                            'parser': 'string',
                            options: conver2Options(ctrl.securityareas)
                        },
                        {
                            'name': 'inputType',
                            'display': '录入方式',
                            'input': 'checkbox',
                            'option': true,
                            'options': [{'value': '-1', 'text': '全部'}, {'value': 0, 'text': '手动'}, {
                                'value': 1,
                                'text': '自动'
                            }]
                        },
                        {
                            'name': 'enable',
                            'display': '启动',
                            'input': 'checkbox',
                            'option': true,
                            'options': [{'value': '-1', 'text': '全部'}, {'value': true, 'text': '开启'}, {
                                'value': false,
                                'text': '关闭'
                            }]
                        }
                    ]
                });
            });

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;//序号显示用
                return DeviceAsset.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return DeviceAsset.getCount(payload);
            }

            function search(params) {
                //TODO: 录入方式和启动列带filter，所以输入的搜索文字可能需要过滤后传给MW server
                return getAll(params);
            }

            function conver2Options(srcArray) {
                var rst = [{'value': '-1', 'text': '全部'}];
                if (angular.isArray(srcArray)) {
                    srcArray.forEach(function (item) {
                        rst.push({
                            value: item,
                            text: item
                        });
                    });
                }
                return rst;
            }

            //带参数传递的state reload
            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (asset) {
                    ctrl.selectedItems[asset.name] = ctrl.selectAllValue;
                });
            };

            ctrl.selectedChanged = function () {
                var selectedAll = true;
                var hasSelected = false;
                var singleSelected = false;

                ctrl.table.forEach(function (asset) {

                    if (ctrl.selectedItems[asset.name] === undefined || ctrl.selectedItems[asset.name] === null) {
                        singleSelected = false;
                    } else {
                        singleSelected = ctrl.selectedItems[asset.name];
                    }

                    hasSelected = hasSelected || singleSelected;

                    selectedAll = selectedAll && singleSelected;
                });

                ctrl.selectAllValue = selectedAll ? true : (hasSelected ? null : false);
            };

            //获取是否具有编辑权限
            scope.privilegeName = 'OBJECT_ASSET';
            var values = Enum.get('privilege').filter(function (pri) {
                return pri.name === scope.privilegeName;
            });
            var actionValue = values && values.length > 0 ? values[0].actionValue : 1;
            scope.isNoEditPri = (actionValue < 28);

            scope.isSwitchAction = {};
            scope.switchActionMsg = {};
            ctrl.changeStartStatus = function (asset) {
                var action = asset.enable ? '启动' : '关闭';
                scope.isSwitchAction[asset.name] = true;
                scope.switchActionMsg[asset.name] = action;
                DeviceAsset.switchDeviceAsset(asset.assetId, asset.name, asset.enable, function (taskInfo, err) {
                    if (err) {
                        scope.isSwitchAction[asset.name] = false;
                        asset.enable = !asset.enable;//复原radio box状态
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('设备资产(' + asset.name + ')' + action + '失败：' + err.data) :
                            '设备资产(' + asset.name + ')' + action + '失败')
                        });
                    } else {
                        var taskId = taskInfo.taskId;
                        (function countdown(counter) {
                            var checkSwitch = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        scope.isSwitchAction[asset.name] = false;
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '设备资产(' + asset.name + ')' + action + '成功'
                                        });
                                        $timeout.cancel(checkSwitch);
                                    } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                        scope.isSwitchAction[asset.name] = false;
                                        asset.enable = !asset.enable;//复原radio box状态
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('设备资产(' + asset.name + ')' + action +
                                            '失败：' + data.data.reason) :
                                            '设备资产(' + asset.name + ')' + action + '失败')
                                        });
                                        $timeout.cancel(checkSwitch);
                                    } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                        if (counter > 0) {
                                            countdown(counter - 1);
                                        } else {
                                            scope.isSwitchAction[asset.name] = false;
                                            asset.enable = !asset.enable;//复原radio box状态
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: '设备资产(' + asset.name + ')' + action + '超时'
                                            });
                                            $timeout.cancel(checkSwitch);
                                        }
                                    } else {
                                        scope.isSwitchAction[asset.name] = false;
                                        asset.enable = !asset.enable;//复原radio box状态
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('设备资产(' + asset.name + ')' + action +
                                            '失败：' + data.data.reason) :
                                            '设备资产(' + asset.name + ')' + action + '失败')
                                        });
                                        $timeout.cancel(checkSwitch);
                                    }
                                });
                            }, 1000);
                        })(30);
                    }
                });
            };

            //自定义validation
            function checkNameUnique(name) {
                var assets = ctrl.table;
                var rst = true;
                if (name && assets) {
                    assets.some(function (asset) {
                        if (asset.name === name) {
                            rst = false;
                            return true;
                        }
                    });
                }
                return rst;
            }

            function checkNameCharacter(name) {
                if (name && !formatVal.validateObjectAssetsName(name)) {
                    return false;
                }
                return true;
            }

            scope.checkNameVal = function (name) {
                var rst = checkNameCharacter(name);
                if (!rst) {
                    scope.nameValMsg = '支持中文、字母、数字等组合3-20个字符';
                } else {
                    rst = checkNameUnique(name);
                    if (!rst) {
                        scope.nameValMsg = '已创建该名称的设备资产';
                    }
                }
                return rst;
            };

            scope.checkIpVal = function (ipAddress) {
                if (ipAddress.split('/').length > 1) {
                    return false;
                }
                if (ipAddress) {
                    if (formatVal.validateIpRange(ipAddress)) {
                        var ips = ipAddress.split('/');
                        if (angular.isArray(ips) && ips.length === 2) {
                            var ip = ips[0];
                            var netmask = ips[1];
                            if (formatVal.validateIp(ip) || formatVal.validateNetMask(netmask)) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
                return true;
            };
            scope.checkMacVal = function (mac) {
                if (mac) {
                    var rst = !formatVal.validateMac(mac);
                    //校验是否为多播或广播MAC地址(the least significant bit of the first octet is set to 1)
                    if (rst) {
                        rst = (('0x' + mac.slice(0, 2)) & 0x01) !== 1;
                    }
                    return rst;
                }
                return true;
            };

            ctrl.addNewDeviceAsset = function () {
                //显示新增设备资产(一行)
                scope.isAddDeviceAsset = true;
                //关闭设备资产
                scope.isEditDeviceAssetId = '';

                scope.newDeviceAsset = {};
//                scope.newDeviceAsset.addressPoolName = ctrl.ippools && ctrl.ippools.length>0 ? ctrl.ippools[0] : '';
                scope.newDeviceAsset.securityAreaName = ctrl.securityareas &&
                ctrl.securityareas.length > 0 ? ctrl.securityareas[0] : '';
                scope.newDeviceAsset.kind = '';
                scope.newDeviceAsset.macAddress = '00:00:00:00:00:00';

                scope.$watch('newDeviceAsset.kind', function (newValue) {
                    //获取厂商列表内容
                    var type = newValue;
                    DeviceAsset.getFactories(type).then(function (factories) {
                        scope.factories = factories;
                        scope.newDeviceAsset.make = '';
                        scope.manualFactory();
                    });
                });
                scope.$watch('newDeviceAsset.make', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        var factory = newValue;
                        //获取型号列表内容
                        DeviceAsset.getModels(scope.newDeviceAsset.kind, factory).then(function (models) {
                            scope.models = models;
                            scope.newDeviceAsset.model = scope.models && scope.models.length > 0 ? scope.models[0] : '';
                            scope.manualModel();
                        });
                    }
                });
                //类型变化事件
                scope.manualType = function () {
                    if (scope.newDeviceAsset.kind) {
                        scope.newDeviceAsset.manual_kind = false;
                    } else {
                        scope.newDeviceAsset.manual_kind = true;
                    }
                };
                //厂商变化事件
                scope.manualFactory = function () {
                    if (scope.newDeviceAsset.make) {
                        scope.newDeviceAsset.manual_make = false;
                    } else {
                        scope.newDeviceAsset.manual_make = true;
                    }
                };
                //型号变化事件
                scope.manualModel = function () {
                    if (scope.newDeviceAsset.model) {
                        scope.newDeviceAsset.manual_model = false;
                    } else {
                        scope.newDeviceAsset.manual_model = true;
                    }
                };

                ctrl.ok = function (formValid) {
                    if (formValid) {
                        //TODO:目前api不支持，所以暂时删掉（以后有需要再加回来）
                        delete scope.newDeviceAsset.manual_kind;
                        delete scope.newDeviceAsset.manual_make;
                        delete scope.newDeviceAsset.manual_model;

                        scope.isAddingDeviceAsset = true;
                        DeviceAsset.addNewDeviceAsset([scope.newDeviceAsset], function (taskInfo, err) {
                            if (err) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: (err.data ? ('设备资产添加失败：' + err.data) : '设备资产添加失败')
                                });
                                scope.isAddingDeviceAsset = false;
                            } else {
                                var taskId = taskInfo.taskId;
                                (function countdown(counter) {
                                    var checkTimeout = $timeout(function () {
                                        Task.getTask(taskId).then(function (data) {
                                            if (data.data.state === 'SUCCESS') {
                                                reload().then(function () {
                                                    $rootScope.addAlert({
                                                        type: 'success',
                                                        content: '设备资产添加成功'
                                                    });
                                                });
                                                scope.isAddingDeviceAsset = false;
                                                $timeout.cancel(checkTimeout);
                                            } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: (data.data.reason ? ('设备资产添加失败：' + data.data.reason) : '设备资产添加失败')
                                                });
                                                scope.isAddingDeviceAsset = false;
                                                $timeout.cancel(checkTimeout);
                                            } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                if (counter > 0) {
                                                    countdown(counter - 1);
                                                } else {
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: '设备资产添加超时'
                                                    });
                                                    scope.isAddingDeviceAsset = false;
                                                    $timeout.cancel(checkTimeout);
                                                }
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: (data.data.reason ? ('设备资产添加失败：' + data.data.reason) : '设备资产添加失败')
                                                });
                                                scope.isAddingDeviceAsset = false;
                                                $timeout.cancel(checkTimeout);
                                            }
                                        });
                                    }, 1000);
                                })(30);
                            }
                        });
                    }
                };

                ctrl.cancel = function () {
                    //隐藏新增设备资产(一行)
                    scope.isAddDeviceAsset = false;
                };

            };

            ctrl.editDeviceAsset = function (asset) {
                //关闭新增设备资产(一行)
                scope.isAddDeviceAsset = false;
                //显示设备资产
                scope.isEditDeviceAssetId = asset.assetId;
                //初始化赋值
                scope.editDeviceAsset = angular.copy(asset);

                scope.editInputInfo = {};
                // scope.editInputInfo.editInputKind = "";
                // scope.editInputInfo.editInputMake = "";
                // scope.editInputInfo.editInputModel = "";

                scope.editInputInfo.manual_kind = false;
                scope.editInputInfo.manual_make = false;
                scope.editInputInfo.manual_model = false;

                var kind = scope.types.filter(function (t) {
                    return t === scope.editDeviceAsset.kind;
                });

                if (kind !== undefined && kind !== null && kind.length > 0) {
                    kind = kind[0];

                    DeviceAsset.getFactories(kind).then(function (factories) {
                        scope.factories = factories;
                        var make = factories.filter(function (f) {
                            return f === scope.editDeviceAsset.make;
                        });
                        if (make !== undefined && make !== null && make.length > 0) {
                            make = make[0];
                            DeviceAsset.getModels(scope.editDeviceAsset.kind, make).then(function (models) {
                                scope.models = models;
                                var model = models.filter(function (m) {
                                    return m === scope.editDeviceAsset.model;
                                });

                                if (model !== undefined && model !== null && model.length > 0) {
                                    scope.models = models;
                                    model = model[0];
                                } else {
                                    scope.editInputInfo.manual_model = true;
                                    scope.editInputInfo.editInputModel = scope.editDeviceAsset.model;
                                }
                            });
                        }
                        else {
                            scope.editInputInfo.manual_make = true;
                            scope.editInputInfo.manual_model = true;

                            scope.editInputInfo.editInputMake = scope.editDeviceAsset.make;
                            scope.editInputInfo.editInputModel = scope.editDeviceAsset.model;
                        }
                    });
                }
                else {
                    scope.editInputInfo.editInputKind = scope.editDeviceAsset.kind;
                    scope.editInputInfo.editInputMake = scope.editDeviceAsset.make;
                    scope.editInputInfo.editInputModel = scope.editDeviceAsset.model;

                    scope.editInputInfo.manual_kind = true;
                    scope.editInputInfo.manual_make = true;
                    scope.editInputInfo.manual_model = true;
                }

                // scope.$watch('editDeviceAsset.kind', function (newValue) {
                //     //获取厂商列表内容
                //     var type = newValue;
                //     DeviceAsset.getFactories(type).then(function (factories) {
                //         scope.factories = factories;
                //         if(scope.factories && scope.factories.length > 0 && scope.factories.indexOf(scope.editDeviceAsset.make) >=0) {
                //             scope.editDeviceAsset.manual_kind = false;
                //         } else {
                //             scope.editDeviceAsset.manual_kind = true;
                //         }
                //     });
                // });
                // scope.$watch('editDeviceAsset.make', function (newValue) {
                //     var factory = newValue;
                //     //获取型号列表内容
                //     DeviceAsset.getModels(scope.editDeviceAsset.kind, factory).then(function (models) {
                //         scope.models = models;
                //         if(scope.models && scope.models.length > 0 && scope.models.indexOf(scope.editDeviceAsset.model) >= 0) {
                //             scope.editDeviceAsset.manual_model = false;
                //         } else {
                //             scope.editDeviceAsset.manual_model = true;
                //         }
                //     });
                // });

                //类型变化事件
                scope.manualType = function () {
                    if (scope.editDeviceAsset.kind) {
                        scope.editInputInfo.manual_kind = false;
                        //获取厂商列表内容
                        DeviceAsset.getFactories(scope.editDeviceAsset.kind).then(function (factories) {
                            scope.factories = factories;
                            scope.editDeviceAsset.make = scope.factories && scope.factories.length > 0 ? scope.factories[0] : '';
                            scope.manualFactory();
                        });

                    } else {
                        scope.factories = [];
                        scope.editInputInfo.manual_kind = true;
                        scope.editInputInfo.manual_make = true;
                        scope.editInputInfo.manual_model = true;
                    }
                };
                //厂商变化事件
                scope.manualFactory = function () {
                    if (scope.editDeviceAsset.make) {
                        scope.editInputInfo.manual_make = false;
                        //获取型号列表内容
                        DeviceAsset.getModels(scope.editDeviceAsset.kind, scope.editDeviceAsset.make).then(function (models) {
                            scope.models = models;
                            scope.editDeviceAsset.model = scope.models && scope.models.length > 0 ? scope.models[0] : '';
                            scope.manualModel();
                        });
                    } else {
                        scope.models = [];
                        scope.editInputInfo.manual_make = true;
                        scope.editInputInfo.manual_model = true;
                    }
                };
                //型号变化事件
                scope.manualModel = function () {
                    if (scope.editDeviceAsset.model) {
                        scope.editInputInfo.manual_model = false;
                    } else {
                        scope.editInputInfo.manual_model = true;
                    }
                };

                ctrl.ok = function (formValid) {
                    if (formValid) {
                        if (scope.editInputInfo.manual_kind) {
                            scope.editDeviceAsset.kind = scope.editInputInfo.editInputKind;
                        }

                        if (scope.editInputInfo.manual_make) {
                            scope.editDeviceAsset.make = scope.editInputInfo.editInputMake;
                        }

                        if (scope.editInputInfo.manual_model) {
                            scope.editDeviceAsset.model = scope.editInputInfo.editInputModel;
                        }
                        //TODO:目前api不支持，所以暂时删掉（以后有需要再加回来）
                        // delete scope.editDeviceAsset.manual_kind;
                        // delete scope.editDeviceAsset.manual_make;
                        // delete scope.editDeviceAsset.manual_model;
                        // DeviceAsset.checkReferencedByIpMac(scope.editDeviceAsset.assetId).then(function (data) {
                        //     if (data.isReferenced) {
                        scope.isEdittingDeviceAsset = true;
                        DeviceAsset.updateDeviceAsset([scope.editDeviceAsset], function (taskInfo, err) {
                            if (err) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: (err.data ? ('设备资产修改失败：' + err.data) : '设备资产修改失败')
                                });
                                scope.isEdittingDeviceAsset = false;
                            } else {
                                var taskId = taskInfo.taskId;
                                (function countdown(counter) {
                                    var checkTimeout = $timeout(function () {
                                        Task.getTask(taskId).then(function (data) {
                                            if (data.data.state === 'SUCCESS') {
                                                reload().then(function () {
                                                    $rootScope.addAlert({
                                                        type: 'success',
                                                        content: '设备资产修改成功'
                                                    });
                                                });
                                                scope.isEdittingDeviceAsset = false;
                                                $timeout.cancel(checkTimeout);
                                            } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: (data.data.reason ? ('设备资产修改失败：' + data.data.reason) : '设备资产修改失败')
                                                });
                                                scope.isEdittingDeviceAsset = false;
                                                $timeout.cancel(checkTimeout);
                                            } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                                if (counter > 0) {
                                                    countdown(counter - 1);
                                                } else {
                                                    $rootScope.addAlert({
                                                        type: 'danger',
                                                        content: '设备资产修改超时'
                                                    });
                                                    scope.isEdittingDeviceAsset = false;
                                                    $timeout.cancel(checkTimeout);
                                                }
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: (data.data.reason ? ('设备资产修改失败：' + data.data.reason) : '设备资产修改失败')
                                                });
                                                scope.isEdittingDeviceAsset = false;
                                                $timeout.cancel(checkTimeout);
                                            }
                                        });
                                    }, 1000);
                                })(30);
                            }
                        });
                        //     } else {
                        //         $rootScope.addAlert({
                        //             type: 'danger',
                        //             content: (data.message ? ('设备资产修改失败：' + data.message) : '设备资产修改失败')
                        //         });
                        //         scope.isEdittingDeviceAsset = false;
                        //     }
                        // });
                    }
                };

                ctrl.cancel = function () {
                    //隐藏新增设备资产(一行)
                    scope.isEditDeviceAssetId = '';
                };

            };

            ctrl.deleteDeviceAsset = function () {

                // if (scope.isEditDeviceAssetId !== undefined && scope.isEditDeviceAssetId !== null && scope.isEditDeviceAssetId.toString().length > 0) {
                //     scope.isEditDeviceAssetId = '';
                // }

                var selectedItems = ctrl.selectedItems;
                var itemNames = [];
                if (selectedItems) {
                    for (var name in selectedItems) {
                        if (selectedItems[name]) {
                            // ctrl.table.forEach(function (asset) {
                            for (var i = 0; i < ctrl.table.length; i++) {
                                if (ctrl.table[i].name === name) {
                                    itemNames.push(name + "," + ctrl.table[i].securityAreaName + "," + ctrl.table[i].assetId);
                                }
                            }
                            // });

                        }
                    }
                }
                if (itemNames.length !== 0) {
                    var deferred = $q.defer();
                    $rootScope.dvcAssetTask.promise = deferred.promise;
                    $rootScope.dvcAssetTask.message = '设备资产删除中，请稍侯...';
                    DeviceAsset.deleteDeviceAsset(itemNames, function (taskInfo, err) {
                        if (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('设备资产删除失败：' + err.data) : '设备资产删除失败')
                            });
                            deferred.resolve('fail');
                        } else {
                            var taskId = taskInfo.taskId;
                            (function countdown(counter) {
                                var checkTimeout = $timeout(function () {
                                    Task.getTask(taskId).then(function (data) {
                                        if (data.data.state === 'SUCCESS') {
                                            reload().then(function () {
                                                $rootScope.addAlert({
                                                    type: 'success',
                                                    content: '设备资产删除成功'
                                                });
                                            });
                                            deferred.resolve('success');
                                            $timeout.cancel(checkTimeout);
                                        } else if (data.data.state === 'FAILED' || data.data.state === 'REJECTED') {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('设备资产删除失败：' + data.data.reason) : '设备资产删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkTimeout);
                                        } else if (data.data.state === 'PENDING' || 'PROCESSING' || 'PAUSE') {
                                            if (counter > 0) {
                                                countdown(counter - 1);
                                            } else {
                                                $rootScope.addAlert({
                                                    type: 'danger',
                                                    content: '设备资产删除超时'
                                                });
                                                deferred.resolve('timeout');
                                                $timeout.cancel(checkTimeout);
                                            }
                                        } else {
                                            $rootScope.addAlert({
                                                type: 'danger',
                                                content: (data.data.reason ? ('设备资产删除失败：' + data.data.reason) : '设备资产删除失败')
                                            });
                                            deferred.resolve('fail');
                                            $timeout.cancel(checkTimeout);
                                        }
                                    });
                                }, 1000);
                            })(30);
                        }
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条设备资产'
                    });
                }
            };
        }

    }
})();
