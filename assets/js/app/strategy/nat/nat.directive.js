/**
 * Strategy NAT Directive
 *
 * Description
 */

(function () {
    'use strict';

    angular
        .module('southWest.strategy.nat')
        .directive('snatTable', snatTable)
        .directive('dnatTable', dnatTable);

    function snatTable($modal, $log, snatModel, dnatModel, $rootScope, $q, formatVal, interfaceModel,$state) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/strategy/nat/snatTable.html',
            link: link
        };

        return obj;

        function link(scope, element, attr, ctrl) {
            var fields = ['snatName', 'sourceAddress', 'destinationAddress', 'serversApps', 'transAddress'];
            ctrl.setConfig({
                name: 'item',
                numPerPage: 10,
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                advancedSearch: 'item',
                advancedSearchOptions: [
                    {'name': 'snatName', 'display': '策略名称', 'input': 'string', 'option': false, value: ""},
                    {'name': 'sourceAddress', 'display': '源地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'destinationAddress', 'display': '目的地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'serversApps', 'display': '服务/应用', 'input': 'string', 'option': false, value: ""},
                    {'name': 'transAddress', 'display': '转换地址', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function search(params) {
                return getAll(params);
            }

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;
                return snatModel.getSNATAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return snatModel.getSNATCount(payload);
            }

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (snatData) {
                    ctrl.selectedItems[snatData.snatId] = ctrl.selectAllValue;
                });
            };

            ctrl.selectItem = function () {
                var haschecked = false;
                var allchecked = true;
                ctrl.table.forEach(function (snatData) {
                    if (ctrl.selectedItems[snatData.snatId]) {
                        haschecked = true;
                    } else {
                        allchecked = false;
                    }
                });
                if (haschecked === true && allchecked === false) {
                    ctrl.selectAllValue = null;
                } else if (haschecked === true && allchecked === true) {
                    ctrl.selectAllValue = true;
                } else {
                    ctrl.selectAllValue = false;
                }
            };

            scope.switchMsg = "";
            scope.isSwitching = {};
            ctrl.changeStatus = function (snatData, type) {
                var deferred = $q.defer();
                ctrl.changeStatusPromise = deferred.promise;

                scope.switchMsg = snatData[type] === true ? "启动" : "停止";

                if (scope.isSwitching[type] && scope.isSwitching[type][snatData['snatName']]) {
                    scope.isSwitching[type][snatData['snatName']] = true;
                } else {
                    var switchObject = {};
                    switchObject[snatData['snatName']] = true;
                    scope.isSwitching[type] = switchObject;
                }

                if (type === "status") {
                    snatModel.switchSNATStatus(snatData).then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: 'SNAT' + snatData.snatName + scope.switchMsg + '成功'
                        });
                    }, function (err) {
                        snatData.status = !snatData.status;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: 'SNAT:' + snatData.snatName + scope.switchMsg + '失败：' + (err.data ? ('：' + err.data.error) : '')
                        });
                    }).finally(function () {
                        scope.isSwitching[type][snatData['snatName']] = false;
                        deferred.resolve();
                    });
                }
            };

            //SNAT名称唯一性验证
            function checkNameUnique(name) {
                var snatDatas = ctrl.table;
                if (name && snatDatas) {
                    for (var i = 0; i < snatDatas.length; i++) {
                        if (snatDatas[i].snatName === name) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function checkNameCharacter(name) {
                if (name && formatVal.validateObjectAssetsName(name)) {
                    return false;
                }
                return true;
            }
            //带参数传递的state reload
            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            function transSnatData(snatData) {
                var SNATSetting = {};
                SNATSetting.snatName = snatData.snatName;
                SNATSetting.sourceAddressType = snatData.sourceAddressType;
                SNATSetting.sourceAddress = snatData.sourceAddressType === 1 ? snatData.sourceAddressPool : snatData.sourceInterface;
                SNATSetting.destinationAddressType = snatData.destinationAddressType;
                SNATSetting.destinationAddress = snatData.destinationAddressType === 1 ? snatData.destinationAddressPool : snatData.destinationInterface;
                SNATSetting.serversAppsType = snatData.serversAppsType;
                SNATSetting.serversApps = snatData.serversApps;
                SNATSetting.transAddressType = snatData.transAddressType;
                SNATSetting.transAddress = snatData.transAddressType === 1 ? snatData.transAddressPool : snatData.transAddressIp;
                return SNATSetting;
            }

            function ModalInstanceCtrl($scope, $modalInstance, data, type, snatData) {
                $scope.interfaceList = data[0];
                $scope.securityAreaList = [];
                $scope.sourceAddressPoolList = [];
                $scope.destinationAddressPoolList = [];
                $scope.transAddressAddressPoolList = [];
                var saToap = {};
                angular.forEach(data[1], function (addressPool) {
                    var sa = addressPool['securityAreaName'] ? addressPool['securityAreaName'] : '其他区域';
                    var ap = addressPool['addressPoolName'] ? addressPool['addressPoolName'] : '';
                    if (saToap[sa]) {
                        saToap[sa].push(ap);
                    } else {
                        saToap[sa] = [ap];
                    }
                });
                angular.forEach(saToap, function (value, key) {
                    $scope.securityAreaList.push(key);
                });
                if ($scope.securityAreaList.length > 0) {
                    $scope.sourceAddressPoolList = saToap[$scope.securityAreaList[0]];
                    $scope.destinationAddressPoolList = saToap[$scope.securityAreaList[0]];
                    $scope.transAddressPoolList = saToap[$scope.securityAreaList[0]];
                }

                function getSaByAp(addressPool) {
                    var rs = "";
                    angular.forEach(saToap, function (apList, sa) {
                        angular.forEach(apList, function (ap) {
                            if (ap === addressPool) {
                                rs = sa;
                            }
                        });
                    });
                    return rs;
                }

                $scope.snatData = {};
                if (type === "add") {
                    $scope.snatData = {
                        "sourceAddressType": 0,
                        "sourceInterface": $scope.interfaceList[0],
                        "sourceSecurityArea": $scope.securityAreaList ? $scope.securityAreaList[0] : "",
                        "sourceAddressPool": $scope.sourceAddressPoolList ? $scope.sourceAddressPoolList[0] : "",
                        "destinationAddressType": 0,
                        "destinationInterface": $scope.interfaceList[0],
                        "destinationSecurityArea": $scope.securityAreaList ? $scope.securityAreaList[0] : "",
                        "destinationAddressPool": $scope.destinationAddressPoolList ? $scope.destinationAddressPoolList[0] : "",
                        "serversAppsType": 0,
                        "transAddressType": 0,
                        "transAddressSecurityArea": $scope.securityAreaList ? $scope.securityAreaList[0] : "",
                        "transAddressPool": $scope.transAddressPoolList ? $scope.transAddressPoolList[0] : ""
                    };
                    $scope.isEditing = false;

                } else {
                    $scope.snatData = angular.copy(snatData);
                    $scope.snatData.sourceInterface = $scope.snatData.sourceAddressType === 0 ? $scope.snatData.sourceAddress : $scope.interfaceList[0];
                    $scope.snatData.sourceSecurityArea = $scope.snatData.sourceAddressType === 1 ? getSaByAp($scope.snatData.sourceAddress) : ($scope.securityAreaList ? $scope.securityAreaList[0] : "");
                    $scope.snatData.sourceAddressPool = $scope.snatData.sourceAddressType === 1 ? $scope.snatData.sourceAddress : ($scope.sourceAddressPoolList ? $scope.sourceAddressPoolList[0] : "");
                    $scope.snatData.destinationInterface = $scope.snatData.destinationAddressType === 0 ? $scope.snatData.destinationAddress : $scope.interfaceList[0];
                    $scope.snatData.destinationSecurityArea = $scope.snatData.destinationAddressType === 1 ? getSaByAp($scope.snatData.destinationAddress) : ($scope.securityAreaList ? $scope.securityAreaList[0] : "");
                    $scope.snatData.destinationAddressPool = $scope.snatData.destinationAddressType === 1 ? $scope.snatData.destinationAddress : ($scope.destinationAddressPoolList ? $scope.destinationAddressPoolList[0] : "");
                    $scope.snatData.transAddressIp = $scope.snatData.transAddressType === 0 ? $scope.snatData.transAddress : "";
                    $scope.snatData.transAddressSecurityArea = $scope.snatData.transAddressType === 1 ? getSaByAp($scope.snatData.transAddress) : ($scope.securityAreaList ? $scope.securityAreaList[0] : "");
                    $scope.snatData.transAddressPool = $scope.snatData.transAddressType === 1 ? $scope.snatData.transAddress : ($scope.transAddressPoolList ? $scope.transAddressPoolList[0] : "");
                    $scope.selectedObj = {"title": $scope.snatData.serversApps};
                    $scope.isEditing = true;
                }

                $scope.error = {
                    "snatName": type === "add" ? true : false,
                    "sourceAddress": !$scope.interfaceList || $scope.interfaceList.length === 0,
                    "destinationAddress": !$scope.interfaceList || $scope.interfaceList.length === 0,
                    "transAddress": type === "add" ? true : false
                };

                $scope.validateAddress = function (ip) {
                    return  formatVal.validateIp(ip);
                };

                $scope.changeSnat_transAddress_ipaddress = function (){
                    $scope.error.transAddress = $scope.validateAddress($scope.snatData.transAddressIp);
                };

                $scope.searchServiceApps = function (str) {
                    if ($scope.snatData.serversAppsType === 1) {
                        return dnatModel.searchApps(str);
                    } else {
                        return dnatModel.searchServices(str);
                    }
                };
                $scope.$watch('snatData.sourceSecurityArea', function (newValue, oldValue) {
                    $scope.sourceAddressPoolList = saToap[newValue];
                    if (newValue !== oldValue || type === "add") {
                        $scope.snatData.sourceAddressPool = $scope.sourceAddressPoolList ? $scope.sourceAddressPoolList[0] : "";
                    }
                });

                $scope.$watch('snatData.destinationSecurityArea', function (newValue, oldValue) {
                    $scope.destinationAddressPoolList = saToap[newValue];
                    if (newValue !== oldValue || type === "add") {
                        $scope.snatData.destinationAddressPool = $scope.destinationAddressPoolList ? $scope.destinationAddressPoolList[0] : "";
                    }
                });

                $scope.$watch('snatData.transAddressSecurityArea', function (newValue, oldValue) {
                    $scope.transAddressPoolList = saToap[newValue];
                    if (newValue !== oldValue || type === "add") {
                        $scope.snatData.transAddressPool = $scope.transAddressPoolList ? $scope.transAddressPoolList[0] : "";
                    }
                });

                $scope.$watch('snatData.sourceAddressType', function (newValue) {
                    if (newValue === 1) {
                        $scope.error.sourceAddress = !($scope.sourceAddressPoolList !== undefined && $scope.sourceAddressPoolList.length > 0);
                    } else {
                        $scope.error.sourceAddress = !($scope.interfaceList !== undefined && $scope.interfaceList.length > 0);
                    }
                });

                $scope.$watch('snatData.destinationAddressType', function (newValue) {
                    if (newValue === 1) {
                        $scope.error.destinationAddress = !($scope.destinationAddressPoolList !== undefined && $scope.destinationAddressPoolList.length > 0);
                    } else {
                        $scope.error.destinationAddress = !($scope.interfaceList !== undefined && $scope.interfaceList.length > 0 );
                    }
                });

                $scope.$watch('snatData.transAddressType', function (newValue) {
                    if (newValue === 1) {
                        $scope.error.transAddress = !($scope.transAddressPoolList !== undefined && $scope.transAddressPoolList.length > 0);
                    } else {
                        $scope.error.transAddress = $scope.validateAddress($scope.snatData.transAddressIp);
                    }
                });

                $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                $scope.checkNameVal = function (name) {
                    var rst = checkNameCharacter(name);
                    if (!rst) {
                        rst = checkNameUnique(name);
                        $scope.nameValMsg = rst ? '已创建该名称的SNAT，请更换其他SNAT名称' : '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                    }
                    $scope.error.snatName = rst;
                };

                $scope.ok = function () {
                    var deferred = $q.defer();
                    $scope.configPromise = deferred.promise;
                    snatModel.addSNATData(transSnatData($scope.snatData)).then(function () {
                        reload().then(function () {
                            $rootScope.addAlert({
                                type: 'success',
                                content: 'SNAT策略添加成功'
                            });
                        });
                    }, function (err) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('SNAT策略添加失败：' + err.data.error) : 'SNAT策略添加失败')
                        });
                    }).finally(function () {
                        $scope.configPromise = null;
                        $modalInstance.close('done');
                    });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            ctrl.addNew = function () {
                $q.all([interfaceModel.getInterfaceNames({$filter: "(interfaceType eq 'ETH')"}), snatModel.getAddressPools()]).then(function (data) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/strategy/nat/snatAdd.html',
                        size: 'sm',
                        backdrop: 'static',
                        controller: ModalInstanceCtrl,
                        resolve: {
                            type: function () {
                                return "add";
                            },
                            data: function () {
                                return data;
                            },
                            snatData: function () {
                                return {};
                            }
                        }
                    });
                    modalInstance.result.then(function () {
                        //do nothing.
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                });
            };

            ctrl.edit = function (snatData) {
                $q.all([interfaceModel.getInterfaceNames({$filter: "(interfaceType eq 'ETH')"}), snatModel.getAddressPools()]).then(function (data) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/strategy/nat/snatAdd.html',
                        size: 'sm',
                        backdrop: 'static',
                        controller: ModalInstanceCtrl,
                        resolve: {
                            type: function () {
                                return "edit";
                            },
                            data: function () {
                                return data;
                            },
                            snatData: function () {
                                return snatData;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        //do nothing.
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });
                });
            };

            ctrl.delete = function () {
                var selectedItems = ctrl.selectedItems;
                var snatDatas = [];
                if (selectedItems) {
                    for (var snatId in selectedItems) {
                        if (selectedItems[snatId]) {
                            for (var i = 0; i < ctrl.table.length; i++) {
                                if (ctrl.table[i].snatId + '' === snatId) {
                                    snatDatas.push(ctrl.table[i]);
                                }
                            }
                        }
                    }
                }
                if (snatDatas.length !== 0) {
                    var deferred = $q.defer();
                    ctrl.deletePromise = deferred.promise;
                    snatModel.deleteSNATData(snatDatas).then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: 'SNAT删除成功'
                        });
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: 'SNAT删除失败' + (err.data ? ('：' + err.data.error) : '')
                        });
                    }).finally(function () {
                        deferred.resolve();
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条SNAT'
                    });
                }
            };
        }
    }

    function dnatTable($rootScope, $q, $modal, $log, $state, dnatModel, formatVal) {

        var obj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/strategy/nat/dnatTable.html',
            link: link
        };

        return obj;

        function link(scope, element, attr, ctrl) {
            var fields = ['dnatName', 'destinationAddress', 'serversApps', 'mappingAddress', 'mappingPort'];
            ctrl.setConfig({
                name: 'item',
                numPerPage: 10,
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: fields,
                advancedSearch: 'item',
                advancedSearchOptions: [
                    {'name': 'dnatName', 'display': '策略名称', 'input': 'string', 'option': false, value: ""},
                    {'name': 'destinationAddress', 'display': '目的地址', 'input': 'string', 'option': false, value: ""},
                    {'name': 'serversApps', 'display': '服务/应用', 'input': 'string', 'option': false, value: ""},
                    {'name': 'mappingAddress', 'display': '映射IP', 'input': 'string', 'option': false, value: ""},
                    {'name': 'mappingPort', 'display': '映射端口', 'input': 'string', 'option': false, value: ""}
                ]
            });

            function search(params) {
                return getAll(params);
            }

            function getAll(params) {
                var payload = params || {};
                scope.skip = params.$skip || 0;
                return dnatModel.getDNATAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                return dnatModel.getDNATCount(payload);
            }

            scope.switchMsg = "";
            scope.isSwitching = {'status': {}, 'logs': {}};
            ctrl.changeStatus = function (dnatData, type) {
                scope.switchMsg = dnatData[type] === true ? "开启" : "关闭";
                if (scope.isSwitching[type] && scope.isSwitching[type][dnatData['dnatName']]) {
                    scope.isSwitching[type][dnatData['dnatName']] = true;
                } else {
                    var switchObject = {};
                    switchObject[dnatData['dnatName']] = true;
                    scope.isSwitching[type][dnatData['dnatName']] = true;
                }

                if (type === "status") {
                    dnatModel.switchDNATStatus(dnatData).then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: dnatData.dnatName + scope.switchMsg + '成功'
                        });
                    }, function (err) {
                        dnatData.status = !dnatData.status;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: dnatData.dnatName + scope.switchMsg + '失败：' + (err.data ? ('：' + err.data) : '')
                        });
                    }).finally(function () {
                        scope.isSwitching[type][dnatData['dnatName']] = false;
                    });
                } else if (type === "logs") {
                    dnatModel.switchDNATLogs(dnatData).then(function () {
                        $rootScope.addAlert({
                            type: 'success',
                            content: dnatData.dnatName + scope.switchMsg + '日志成功'
                        });
                    }, function (err) {
                        dnatData.logs = !dnatData.logs;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: dnatData.dnatName + scope.switchMsg + '日志失败：' + (err.data ? ('：' + err.data) : '')
                        });
                    }).finally(function () {
                        scope.isSwitching[type][dnatData['dnatName']] = false;
                    });
                }
            };

            //带参数传递的state reload
            var reload = function (stateParams) {
                return $state.go($state.current, stateParams, {
                    reload: true, inherit: false, notify: true
                });
            };

            ctrl.addNew = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/strategy/nat/dnatAdd.html',
                    size: 'sm',
                    backdrop: 'static',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.dnatData = {
                        "destinationAddressType": 0,
                        "destinationAddress": "",
                        "serversAppsType": 0,
                        "mappingAddressType": 0,
                        "mappingAddress": ""
                    };
                    $scope.isEditing = false;
                    $scope.error = {
                        "dnatName": true,
                        "destinationAddress": true,
                        "serversApps": true,
                        "mappingAddress": true,
                        //"mappingPort": true
                    };

                    $scope.isGettingAddressPools = true;
                    dnatModel.getAddressPools().then(function (data) {
                        $scope.securityAreas = [];
                        $scope.addressaddressPools = [];
                        $scope.addressaddressPool = [];
                        var securityArea = '其他';
                        if (data) {
                            for (var i = 0; i < data.length; i++) {
                                if (!data[i].securityAreaName) {
                                    data[i].securityAreaName = '其他';
                                }
                                if (data[i].securityAreaName !== securityArea) {
                                    $scope.securityAreas.push(securityArea);
                                    securityArea = data[i].securityAreaName;
                                    if ($scope.addressaddressPool.length) {
                                        $scope.addressaddressPools.push($scope.addressaddressPool);
                                        $scope.addressaddressPool = [];
                                    }
                                }
                                $scope.addressaddressPool.push(data[i].addressPoolName);
                                if (i === data.length - 1) {
                                    $scope.securityAreas.push(securityArea);
                                    if ($scope.addressaddressPool.length) {
                                        $scope.addressaddressPools.push($scope.addressaddressPool);
                                    }
                                }
                            }
                        }
                        $scope.securityAreaName = $scope.securityAreas[0];
                        $scope.destAddresses = $scope.addressaddressPools[0];
                        $scope.destAddressesName = $scope.destAddresses[0];

                        $scope.mappingSecurityAreaName = angular.copy($scope.securityAreaName);
                        $scope.mappingAddresses = angular.copy($scope.destAddresses);
                        $scope.mappingAddressesName = angular.copy($scope.destAddressesName);

                        $scope.isGettingAddressPools = false;
                    }, function () {
                        //无法获取数据
                        $scope.isGettingAddressPools = false;
                    });

                    $scope.changeDestType = function (destType) {
                        if (destType === 1) {
                            $scope.error.destinationAddress = false;
                        } else {
                            $scope.error.destinationAddress = formatVal.validateIp($scope.dnatData.destinationAddress);
                        }

                    };
                    $scope.changeSecurityArea = function (index, securityArea) {
                        $scope.securityAreaName = securityArea;
                        $scope.destAddresses = $scope.addressaddressPools[index];
                        $scope.destAddressesName = $scope.addressaddressPools[index][0];
                    };
                    $scope.changeDestAddress = function (destAddress) {
                        $scope.destAddressesName = destAddress;
                    };

                    $scope.changeMappingType = function (mappingType) {
                        if (mappingType === 1) {
                            $scope.error.mappingAddress = false;
                        } else {
                            $scope.error.mappingAddress = formatVal.validateIp($scope.dnatData.mappingAddress);
                        }

                    };
                    $scope.changeMappingSecurityArea = function (index, securityArea) {
                        $scope.mappingSecurityAreaName = securityArea;
                        $scope.mappingAddresses = $scope.addressaddressPools[index];
                        $scope.mappingAddressesName = $scope.addressaddressPools[index][0];
                    };
                    $scope.changeMappingAddress = function (mappingAddress) {
                        $scope.mappingAddressesName = mappingAddress;
                    };

                    $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                    $scope.checkNameVal = function (name) {
                        var rst = !checkNameCharacter(name);
                        if (!rst) {
                            rst = checkNameUnique(name);
                            $scope.nameValMsg = rst ? '已创建该名称的DNAT，请更换其他DNAT名称' : '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        }
                        $scope.error.dnatName = !name || rst;
                    };

                    $scope.validateDestinationAddress = function (ip) {
                        $scope.error.destinationAddress = formatVal.validateIp(ip);
                    };
                    $scope.validateMappingAddress = function (ip) {
                        $scope.error.mappingAddress = formatVal.validateIp(ip);
                    };
                    $scope.validateMappingPort = function (mappingPort) {
                        $scope.error.mappingPort = mappingPort === '' ? false : formatVal.validatePort(mappingPort);
                    };

                    $scope.searchServiceApps = function (str) {
                        if ($scope.dnatData.serversAppsType === 0) {
                            return dnatModel.searchApps(str);
                        } else {
                            return dnatModel.searchServices(str);
                        }
                    };

                    $scope.ok = function () {
                        var deferred = $q.defer();
                        $scope.configPromise = deferred.promise;
                        if ($scope.dnatData.destinationAddressType === 1) {
                            $scope.dnatData.destinationAddress = $scope.destAddressesName;
                        }
                        if ($scope.dnatData.mappingAddressType === 1) {
                            $scope.dnatData.mappingAddress = $scope.mappingAddressesName;
                        }
                        dnatModel.addDNATData($scope.dnatData).then(function () {
                            reload().then(function () {
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: 'DNAT策略添加成功'
                                });
                            });
                        }, function (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('DNAT策略添加失败：' + err.data) : 'DNAT策略添加失败')
                            });
                        }).finally(function () {
                            $scope.configPromise = null;
                            $modalInstance.close('done');
                        });
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.edit = function (dnatData) {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/strategy/nat/dnatAdd.html',
                    size: 'sm',
                    backdrop: 'static',
                    controller: ModalInstanceCtrl
                });

                modalInstance.result.then(function () {
                    //do nothing.
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.dnatData = angular.copy(dnatData);
                    $scope.selectedObj = {"title": $scope.dnatData.serversApps};
                    $scope.isEditing = true;
                    $scope.error = {
                        "destinationAddress": $scope.dnatData.destinationAddressType === 1?false:formatVal.validateIp($scope.dnatData.destinationAddress),
                        "serversApps": !$scope.dnatData.serversApps,
                        "mappingAddress": $scope.dnatData.mappingAddressType === 1?false:formatVal.validateIp($scope.dnatData.mappingAddress),
                        "mappingPort": $scope.dnatData.mappingPort === '' ? false : formatVal.validatePort($scope.dnatData.mappingPort)
                    };

                    $scope.isGettingAddressPools = true;
                    dnatModel.getAddressPools().then(function (data) {
                        $scope.securityAreas = [];
                        $scope.addressaddressPools = [];
                        $scope.addressaddressPool = [];
                        var securityArea = '其他';
                        var i, j;
                        if (data) {
                            for (i = 0; i < data.length; i++) {
                                if (!data[i].securityAreaName) {
                                    data[i].securityAreaName = '其他';
                                }
                                if (data[i].securityAreaName !== securityArea) {
                                    $scope.securityAreas.push(securityArea);
                                    securityArea = data[i].securityAreaName;
                                    if ($scope.addressaddressPool.length) {
                                        $scope.addressaddressPools.push($scope.addressaddressPool);
                                        $scope.addressaddressPool = [];
                                    }
                                }
                                $scope.addressaddressPool.push(data[i].addressPoolName);
                                if (i === data.length - 1) {
                                    $scope.securityAreas.push(securityArea);
                                    if ($scope.addressaddressPool.length) {
                                        $scope.addressaddressPools.push($scope.addressaddressPool);
                                    }
                                }
                            }
                        }
                        if ($scope.dnatData.destinationAddressType === 1) {
                            for (i = 0; i < data.length; i++) {
                                if ($scope.dnatData.destinationAddress === data[i].addressPoolName) {
                                    $scope.securityAreaName = data[i].securityAreaName;
                                    for (j = 0; j < $scope.securityAreas.length; j++) {
                                        if ($scope.securityAreas[j] === $scope.securityAreaName) {
                                            $scope.destAddresses = $scope.addressaddressPools[j];
                                        }
                                    }
                                }
                            }
                            $scope.destAddressesName = $scope.dnatData.destinationAddress;
                        } else {
                            $scope.securityAreaName = $scope.securityAreas[0];
                            $scope.destAddresses = $scope.addressaddressPools[0];
                            $scope.destAddressesName = $scope.destAddresses[0];
                        }

                        if ($scope.dnatData.mappingAddressType === 1) {
                            for (i = 0; i < data.length; i++) {
                                if ($scope.dnatData.mappingAddress === data[i].addressPoolName) {
                                    $scope.mappingSecurityAreaName = data[i].securityAreaName;
                                    for (j = 0; j < $scope.securityAreas.length; j++) {
                                        if ($scope.securityAreas[j] === $scope.mappingSecurityAreaName) {
                                            $scope.mappingAddresses = $scope.addressaddressPools[j];
                                        }
                                    }
                                }
                            }
                            $scope.mappingAddressesName = $scope.dnatData.mappingAddress;
                        } else {
                            $scope.mappingSecurityAreaName = angular.copy($scope.securityAreaName);
                            $scope.mappingAddresses = angular.copy($scope.destAddresses);
                            $scope.mappingAddressesName = angular.copy($scope.destAddressesName);
                        }

                        $scope.isGettingAddressPools = false;
                    }, function () {
                        //无法获取数据
                        $scope.isGettingAddressPools = false;
                    });

                    $scope.changeDestType = function (destType) {
                        if (destType === 1) {
                            $scope.error.destinationAddress = false;
                        } else {
                            $scope.error.destinationAddress = formatVal.validateIp($scope.dnatData.destinationAddress);
                        }

                    };
                    $scope.changeSecurityArea = function (index, securityArea) {
                        $scope.securityAreaName = securityArea;
                        $scope.destAddresses = $scope.addressaddressPools[index];
                        $scope.destAddressesName = $scope.addressaddressPools[index][0];
                    };
                    $scope.changeDestAddress = function (destAddress) {
                        $scope.destAddressesName = destAddress;
                    };

                    $scope.changeMappingType = function (mappingType) {
                        if (mappingType === 1) {
                            $scope.error.mappingAddress = false;
                        } else {
                            $scope.error.mappingAddress = formatVal.validateIp($scope.dnatData.mappingAddress);
                        }

                    };
                    $scope.changeMappingSecurityArea = function (index, securityArea) {
                        $scope.mappingSecurityAreaName = securityArea;
                        $scope.mappingAddresses = $scope.addressaddressPools[index];
                        $scope.mappingAddressesName = $scope.addressaddressPools[index][0];
                    };
                    $scope.changeMappingAddress = function (mappingAddress) {
                        $scope.mappingAddressesName = mappingAddress;
                    };

                    $scope.validateDestinationAddress = function (ip) {
                        $scope.error.destinationAddress = formatVal.validateIp(ip);
                    };
                    $scope.validateMappingAddress = function (ip) {
                        $scope.error.mappingAddress = formatVal.validateIp(ip);
                    };
                    $scope.validateMappingPort = function (mappingPort) {
                        $scope.error.mappingPort = mappingPort === '' ? false : formatVal.validatePort(mappingPort);
                    };

                    $scope.searchServiceApps = function (str) {
                        if ($scope.dnatData.serversAppsType === 0) {
                            return dnatModel.searchApps(str);
                        } else {
                            return dnatModel.searchServices(str);
                        }
                    };

                    $scope.ok = function () {
                        var deferred = $q.defer();
                        $scope.configPromise = deferred.promise;
                        if ($scope.dnatData.destinationAddressType === 1) {
                            $scope.dnatData.destinationAddress = $scope.destAddressesName;
                        }
                        if ($scope.dnatData.mappingAddressType === 1) {
                            $scope.dnatData.mappingAddress = $scope.mappingAddressesName;
                        }
                        dnatModel.editDNATData($scope.dnatData).then(function () {
                            $rootScope.addAlert({
                                type: 'success',
                                content: 'DNAT策略修改成功'
                            });
                        }, function (err) {
                            $rootScope.addAlert({
                                type: 'danger',
                                content: (err.data ? ('DNAT策略修改失败：' + err.data) : 'DNAT策略修改失败')
                            });
                        }).finally(function () {
                            $scope.configPromise = null;
                            $modalInstance.close('done');
                        });
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            ctrl.selectedItems = {};
            ctrl.selectAll = function () {
                ctrl.selectedItems = {};
                ctrl.table.forEach(function (dnatData) {
                    ctrl.selectedItems[dnatData.dnatId] = ctrl.selectAllValue;
                });
            };

            ctrl.selectItem = function () {
                var hasChecked = false;
                var allChecked = true;
                ctrl.table.forEach(function (dnatData) {
                    if (ctrl.selectedItems[dnatData.dnatId]) {
                        hasChecked = true;
                    } else {
                        allChecked = false;
                    }
                });
                if (hasChecked === true && allChecked === false) {
                    ctrl.selectAllValue = null;
                } else if (hasChecked === true && allChecked === true) {
                    ctrl.selectAllValue = true;
                } else {
                    ctrl.selectAllValue = false;
                }
            };

            ctrl.delete = function () {
                var selectedItems = ctrl.selectedItems;
                var dnatDatas = [];
                if (selectedItems) {
                    for (var dnatId in selectedItems) {
                        if (selectedItems[dnatId]) {
                            for (var i = 0; i < ctrl.table.length; i++) {
                                if (ctrl.table[i].dnatId + '' === dnatId) {
                                    dnatDatas.push(ctrl.table[i]);
                                }
                            }
                        }
                    }
                }
                if (dnatDatas.length !== 0) {
                    var deferred = $q.defer();
                    ctrl.deletePromise = deferred.promise;
                    dnatModel.deleteDNATData(dnatDatas).then(function () {
                        deferred.resolve('success');
                        $rootScope.addAlert({
                            type: 'success',
                            content: 'DNAT策略删除成功'
                        });
                        reload();
                    }, function (err) {
                        deferred.resolve('fail');
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (err.data ? ('DNAT策略删除失败：' + err.data) : 'DNAT策略删除失败')
                        });
                    });
                } else {
                    $rootScope.addAlert({
                        type: 'info',
                        content: '请至少选中一条DNAT策略'
                    });
                }
            };

            function checkNameCharacter(name) {
                if (name && !formatVal.validateObjectAssetsName(name)) {
                    return false;
                }
                return true;
            }

            //DNAT名称唯一性验证
            function checkNameUnique(name) {
                var dnatDatas = ctrl.table;
                if (name && dnatDatas) {
                    for (var i = 0; i < dnatDatas.length; i++) {
                        if (dnatDatas[i].dnatName === name) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }

    }
})();
