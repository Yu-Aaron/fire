/**
 * NetInterface Interface Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.network.interface')
        .directive('interfaceTable', interfaceTable);

    function interfaceTable(interfaceModel, formatVal, $modal, $log, $q, $rootScope,$timeout) {
        var interfaceTableObj = {
            scope: true,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/network/interface/interfaceTable.html',
            link: link
        };
        return interfaceTableObj;

        function link(scope, element, attr, ctrl) {
            var vm = ctrl;
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                pagination: false,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
            });

            function getAll() {
                return interfaceModel.getNetInterfaceDatas();
            }

            function getCount() {
                return interfaceModel.getNetInterfaceDataCounts();
            }

            function checkNameCharacter(name) {
                if (name && !formatVal.validateObjectAssetsName(name)) {
                    return false;
                }
                return true;
            }

            //接口名称唯一性验证
            function checkNameUnique(name) {
                var interfaceDatas = vm.table;
                if (name && interfaceDatas) {
                    for (var i = 0; i < interfaceDatas.length; i++) {
                        if (interfaceDatas[i].interfaceName === name) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function checkNumber(data) {
                var sData = String(data);
                if ((!sData.startsWith('0') || sData === '0') && !isNaN(sData)) {
                    if (Number(sData) >= 0 && Number(sData) <= 253) {
                        return true;
                    }
                }
                return false;
            }

            scope.addSubInterface = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/network/interface/subInterface.html',
                    controller: ModalInstanceCtrl,
                    backdrop: 'static',
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.interfaceData = {
                        "interfaceType": "SUB",
                        "ipType": 0,
                        "subIndex": ''
                    };
                    $scope.tableData = scope.dtable.table;
                    $scope.isEditing = true;
                    $scope.isNew = true;

                    interfaceModel.getInterfaceNames({$filter: "(interfaceType eq 'ETH')"}).then(function (interfaces) {
                        $scope.interfaceData.subEthInterfaceName = interfaces && interfaces.length > 0 ? interfaces[0] : '';
                        $scope.interfaceNames = interfaces;
                    });

                    $scope.error = {
                        'subIndex': true,
                        'interfaceName': false,
                        'ipAddressMask': true
                    };

                    $scope.setDefaultValue = function (value) {
                        angular.forEach($scope.tableData, function (data) {
                            if (data.interfaceType === "ETH" && data.interfaceName === value) {
                                $scope.interfaceData.ssh = data.ssh;
                                $scope.interfaceData.https = data.https;
                                //$scope.interfaceData.snmp = data.snmp;
                                $scope.interfaceData.ping = data.ping;

                            }
                        });
                    };
                    $scope.checkNameVal = function () {
                        if (checkNumber($scope.interfaceData.subIndex)) {
                            $scope.error.subIndex = false;
                            $scope.interfaceData.interfaceName = $scope.interfaceData.subEthInterfaceName + ":" + $scope.interfaceData.subIndex;
                            $scope.error.interfaceName = checkNameUnique($scope.interfaceData.interfaceName);
                        } else {
                            $scope.error.subIndex = true;
                            $scope.error.interfaceName = false;
                        }

                    };
                    $scope.validateIpType = function () {
                        $scope.error.ipAddressMask = $scope.interfaceData.ipType === 1 ? false : formatVal.validateIpMask($scope.interfaceData.ipAddressMask);
                    };
                    $scope.validateIpMask = function () {
                        $scope.error.ipAddressMask = formatVal.validateIpMask($scope.interfaceData.ipAddressMask);
                    };

                    $scope.ok = function () {
                        var promises = [];
                        if ($scope.interfaceData.ipType === 1) {
                            $scope.interfaceData.ipAddressMask = '';
                        } else {
                            $scope.interfaceData.ipAddressMask = formatVal.ipLongMaskToIpShortNum($scope.interfaceData.ipAddressMask);
                        }
                        var deferred = $q.defer();
                        scope.configPromise = deferred.promise;
                        interfaceModel.isIpRangeDuplicate($scope.interfaceData).then(function (data) {
                            $modalInstance.close('done');
                            if (data.data === true) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '子接口' + $scope.interfaceData.interfaceName + '添加失败，其他接口有相同网段IP。'
                                });
                                deferred.resolve("fail");
                            } else {
                                promises.push(interfaceModel.addNetInterfaceData($scope.interfaceData));
                                $q.all(promises).then(function () {
                                    //延迟两秒再刷新
                                    $timeout(function(){
                                        deferred.resolve("success");
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '子接口' + $scope.interfaceData.interfaceName + '添加成功'
                                        });
                                        scope.$parent.dtable.getTableData();
                                    },4000);
                                }, function (err) {
                                    deferred.resolve("fail");
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '子接口' + $scope.interfaceData.interfaceName + '添加失败' + (err.data ? ('：' + err.data) : '')
                                    });
                                }).finally(function () {

                                });
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            scope.addVlanInterface = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/network/interface/vlanInterface.html',
                    controller: ModalInstanceCtrl,
                    backdrop: 'static',
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.interfaceData = {
                        "interfaceType": "VLAN",
                        "ipType": 0,
                        "vlanType": "ACCESS",
                        "vlanId": ''
                    };
                    $scope.isEditing = true;
                    $scope.isNew = true;
                    interfaceModel.getInterfaceNames({$filter: "(interfaceType eq 'ETH')"}).then(function (interfaces) {
                        $scope.interfaceData.vlanEthInterfaceName = interfaces && interfaces.length > 0 ? interfaces[0] : '';
                        $scope.interfaceNames = interfaces;
                    });

                    $scope.error = {
                        'vlanId': true,
                        'interfaceName': false,
                        'ipAddressMask': false
                    };

                    $scope.checkNameVal = function () {
                        if (checkNumber($scope.interfaceData.vlanId)) {
                            $scope.error.vlanId = false;
                            $scope.interfaceData.interfaceName = $scope.interfaceData.interfaceType + $scope.interfaceData.vlanId + '_' + $scope.interfaceData.vlanEthInterfaceName;
                            $scope.error.interfaceName = checkNameUnique($scope.interfaceData.interfaceName);
                        } else {
                            $scope.error.vlanId = true;
                            $scope.error.interfaceName = false;
                        }

                    };
                    $scope.validateIpType = function () {
                        $scope.error.ipAddressMask = $scope.interfaceData.ipType === 1 ? false : !!$scope.interfaceData.ipAddressMask ? formatVal.validateIpMask($scope.interfaceData.ipAddressMask) : false;
                    };
                    $scope.validateIpMask = function () {
                        $scope.error.ipAddressMask = !!$scope.interfaceData.ipAddressMask ? formatVal.validateIpMask($scope.interfaceData.ipAddressMask) : false;
                    };

                    $scope.ok = function () {
                        var promises = [];
                        if ($scope.interfaceData.ipType === 1) {
                            $scope.interfaceData.ipAddressMask = '';
                        } else {
                            $scope.interfaceData.ipAddressMask = formatVal.ipLongMaskToIpShortNum($scope.interfaceData.ipAddressMask);
                        }
                        var deferred = $q.defer();
                        scope.configPromise = deferred.promise;
                        interfaceModel.isIpRangeDuplicate($scope.interfaceData).then(function (data) {
                            $modalInstance.close('done');
                            if (data.data === true) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: 'VLAN接口' + $scope.interfaceData.interfaceName + '添加失败，其他接口有相同网段IP。'
                                });
                                deferred.resolve("fail");
                            } else {
                                promises.push(interfaceModel.addNetInterfaceData($scope.interfaceData));
                                $q.all(promises).then(function () {
                                    //延迟两秒再刷新
                                    $timeout(function() {
                                        deferred.resolve("success");
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: 'VLAN接口' + $scope.interfaceData.interfaceName + '添加成功'
                                        });
                                        scope.$parent.dtable.getTableData();
                                    },4000);
                                }, function (err) {
                                    deferred.resolve("fail");
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: 'VLAN接口' + $scope.interfaceData.interfaceName + '添加失败' + (err.data ? ('：' + err.data) : '')
                                    });
                                }).finally(function () {

                                });
                            }
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            scope.addBriInterface = function () {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/network/interface/briInterface.html',
                    controller: ModalInstanceCtrl,
                    backdrop: 'static',
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.interfaceData = {
                        "interfaceType": "BRI",                      //接口类型["ETH", "VLAN","SUB","BRI”]
                        "ipType": 0,                                //ip获取类型 0:自定义  1: DHCP
                        "briInterfaceName" : ""                      //所选接口
                    };
                    $scope.isEditing = true;
                    $scope.isNew = true;
                    // $scope.ableInterfaceNum = 0;
                    interfaceModel.getInterfaceListByBri().then(function (data) {
                        $scope.interfaceListByBRI = data;
                        angular.forEach($scope.interfaceListByBRI, function (list) {
                            angular.forEach(list, function (value) {
                                value.value = false;
                                // if (!value.used) {
                                    // $scope.ableInterfaceNum++;
                                // }
                            });
                        });
                    });

                    $scope.error = {
                        'interfaceName': true,
                        'ipAddressMask': false
                        // 'interfaceCheck': true
                    };
                    $scope.nameValMsg = '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                    $scope.checkNameVal = function () {
                        var rst = !checkNameCharacter($scope.interfaceData.interfaceName);
                        if (!rst) {
                            rst = checkNameUnique($scope.interfaceData.interfaceName);
                            $scope.nameValMsg = rst ? '已创建该名称的接口，请更换其他接口名称' : '支持中文、字母、数字、"-"、"_"的组合，3-20个字符';
                        }
                        $scope.error.interfaceName = !$scope.interfaceData.interfaceName || rst;
                    };
                    $scope.validateIpMask = function () {
                        $scope.error.ipAddressMask = !!$scope.interfaceData.ipAddressMask ? formatVal.validateIpMask($scope.interfaceData.ipAddressMask) : false;
                    };
                    $scope.checkInterfaceByBri = function () {
                        // var checkNum = 0;
                        var briInterfaceName = "";
                        angular.forEach($scope.interfaceListByBRI, function (list) {
                            angular.forEach(list, function (value) {
                                if (value.value === true) {
                                    // checkNum++;
                                    if (briInterfaceName === "") {
                                        briInterfaceName = value.name;
                                    } else {
                                        briInterfaceName = briInterfaceName + ";" + value.name;
                                    }
                                }
                            });
                        });
                        // if (checkNum >= 2) {
                        //     $scope.error.interfaceCheck = false;
                        // } else {
                        //     $scope.error.interfaceCheck = true;
                        // }
                        $scope.interfaceData.briInterfaceName = briInterfaceName;
                    };

                    $scope.ok = function () {
                        var promises = [];
                        if ($scope.interfaceData.ipType === 1) {
                            $scope.interfaceData.ipAddressMask = '';
                        } else {
                            $scope.interfaceData.ipAddressMask = formatVal.ipLongMaskToIpShortNum($scope.interfaceData.ipAddressMask);
                        }
                        var deferred = $q.defer();
                        scope.configPromise = deferred.promise;
                        interfaceModel.isIpRangeDuplicate($scope.interfaceData).then(function (data) {
                            $modalInstance.close('done');
                            if (data.data === true) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '桥接口' + $scope.interfaceData.interfaceName + '添加失败，其他接口有相同网段IP。'
                                });
                                deferred.resolve("fail");
                            } else {
                                promises.push(interfaceModel.addNetInterfaceData($scope.interfaceData));
                                $q.all(promises).then(function () {
                                    //延迟两秒再刷新
                                    $timeout(function() {
                                        deferred.resolve("success");
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '桥接口' + $scope.interfaceData.interfaceName + '添加成功'
                                        });
                                        scope.$parent.dtable.getTableData();
                                    },4000);
                                }, function (err) {
                                    deferred.resolve("fail");
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '桥接口' + $scope.interfaceData.interfaceName + '添加失败' + (err.data ? ('：' + err.data) : '')
                                    });
                                }).finally(function () {

                                });
                            }
                        });


                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            scope.showDetail = function (interfaceData) {
                var page = '';
                if (interfaceData.interfaceType === 'ETH') {
                    page = '/templates/network/interface/ethInterface.html';
                } else if (interfaceData.interfaceType === 'SUB') {
                    page = '/templates/network/interface/subInterface.html';
                } else if (interfaceData.interfaceType === 'VLAN') {
                    page = '/templates/network/interface/vlanInterface.html';
                } else if (interfaceData.interfaceType === 'BRI') {
                    page = '/templates/network/interface/briInterface.html';
                }

                var modalInstance = $modal.open({
                    templateUrl: page,
                    controller: ModalInstanceCtrl,
                    backdrop:true,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.interfaceData = interfaceData;
                    $scope.isEditing = false;
                    $scope.isNew = false;
                    if (interfaceData.interfaceType === 'ETH') {
                        $scope.interfaceNames = [interfaceData.interfaceName];
                        $scope.interfaceData.confer = !!$scope.interfaceData.confer ? $scope.interfaceData.confer + '' : '0';
                        $scope.interfaceData.speed = !!$scope.interfaceData.speed ? $scope.interfaceData.speed + '' : '0';
                    } else if (interfaceData.interfaceType === 'SUB') {
                        $scope.interfaceNames = [interfaceData.subEthInterfaceName];
                    } else if (interfaceData.interfaceType === 'VLAN') {
                        $scope.interfaceNames = [interfaceData.vlanEthInterfaceName];
                    } else if (interfaceData.interfaceType === 'BRI') {
                        interfaceModel.getInterfaceListByBri(interfaceData.interfaceName)
                            .then(function (data) {
                                $scope.interfaceListByBRI = data;
                                angular.forEach($scope.interfaceListByBRI, function (list) {
                                    angular.forEach(list, function (value) {
                                        value.used = true;
                                        if (interfaceData.briInterfaceName.indexOf(value.name) !== -1) {
                                            value.value = true;
                                        } else {
                                            value.value = false;
                                        }
                                    });
                                });
                            });
                    }

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            scope.editInterface = function (interfaceData) {
                var page = '';
                if (interfaceData.interfaceType === 'ETH') {
                    page = '/templates/network/interface/ethInterface.html';
                } else if (interfaceData.interfaceType === 'VLAN') {
                    page = '/templates/network/interface/vlanInterface.html';
                } else if (interfaceData.interfaceType === 'SUB') {
                    page = '/templates/network/interface/subInterface.html';
                } else if (interfaceData.interfaceType === 'BRI') {
                    page = '/templates/network/interface/briInterface.html';
                }

                var modalInstance = $modal.open({
                    templateUrl: page,
                    controller: ModalInstanceCtrl,
                    backdrop: 'static',
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.interfaceData = angular.copy(interfaceData);
                    if($scope.interfaceData.interfaceType === "BRI" && $scope.interfaceData.briInterfaceName === undefined){
                        $scope.interfaceData.briInterfaceName = "" ;
                    }
                    $scope.isEditing = true;
                    $scope.isNew = false;
                    $scope.error = {};
                    if ($scope.interfaceData.ipType === 1) {
                        $scope.error.ipAddressMask = false;
                    } else {
                        if (interfaceData.interfaceType === 'SUB') {
                            $scope.error.ipAddressMask = formatVal.validateIpMask($scope.interfaceData.ipAddressMask);
                        } else {
                            $scope.error.ipAddressMask = !!$scope.interfaceData.ipAddressMask ? formatVal.validateIpMask($scope.interfaceData.ipAddressMask) : false;
                        }
                    }

                    if (interfaceData.interfaceType === 'ETH') {
                        $scope.interfaceNames = [];
                        $scope.interfaceNames.push(interfaceData.interfaceName);
                        $scope.interfaceData.confer = !!$scope.interfaceData.confer ? $scope.interfaceData.confer + '' : '0';
                        $scope.interfaceData.speed = !!$scope.interfaceData.speed ? $scope.interfaceData.speed + '' : '0';
                    } else if (interfaceData.interfaceType === 'SUB') {
                        $scope.interfaceNames = [interfaceData.subEthInterfaceName];
                    } else if (interfaceData.interfaceType === 'VLAN') {
                        $scope.interfaceNames = [interfaceData.vlanEthInterfaceName];
                    } else if (interfaceData.interfaceType === 'BRI') {
                        // $scope.ableInterfaceNum = 0;
                        interfaceModel.getInterfaceListByBri(interfaceData.interfaceName).then(function (data) {
                            $scope.interfaceListByBRI = data;
                            angular.forEach($scope.interfaceListByBRI, function (list) {
                                angular.forEach(list, function (value) {
                                    if (interfaceData.briInterfaceName.indexOf(value.name) !== -1) {
                                        value.value = true;
                                        // $scope.ableInterfaceNum++;
                                    } else {
                                        value.value = false;
                                        // if (!value.used) {
                                            // $scope.ableInterfaceNum++;
                                        // }
                                    }
                                });
                            });
                        });
                    }

                    $scope.validateIpType = function () {
                        if ($scope.interfaceData.ipType === 1) {
                            $scope.interfaceData.ipAddressMask = interfaceData.ipAddressMask;
                            $scope.error.ipAddressMask = false;
                        } else {
                            if (interfaceData.interfaceType === 'SUB') {
                                $scope.error.ipAddressMask = formatVal.validateIpMask($scope.interfaceData.ipAddressMask);
                            } else {
                                $scope.error.ipAddressMask = !!$scope.interfaceData.ipAddressMask ? formatVal.validateIpMask($scope.interfaceData.ipAddressMask) : false;
                            }
                        }
                    };
                    $scope.validateIpMask = function () {
                        if (interfaceData.interfaceType === 'SUB') {
                            $scope.error.ipAddressMask = formatVal.validateIpMask($scope.interfaceData.ipAddressMask);
                        } else {
                            $scope.error.ipAddressMask = !!$scope.interfaceData.ipAddressMask ? formatVal.validateIpMask($scope.interfaceData.ipAddressMask) : false;
                        }
                    };
                    var VALIDATE_MTU = /^([2][5][6-9]|[2][6-9][0-9]|[3-9][0-9][0-9]|[1][0-4][0-9][0-9]|[1][5][0][0])$/;
                    $scope.validateMTU = function () {
                        $scope.error.mtu = !$scope.interfaceData.mtu || !($scope.interfaceData.mtu).match(VALIDATE_MTU);
                    };
                    $scope.validateMac = function () {
                        $scope.error.mac = !$scope.interfaceData.mac || formatVal.validateMac($scope.interfaceData.mac);
                    };

                    $scope.checkInterfaceByBri = function () {
                        // var checkNum = 0;
                        var briInterfaceName = "";
                        angular.forEach($scope.interfaceListByBRI, function (list) {
                            angular.forEach(list, function (value) {
                                if (value.value === true) {
                                    // checkNum++;
                                    if (briInterfaceName === "") {
                                        briInterfaceName = value.name;
                                    } else {
                                        briInterfaceName = briInterfaceName + ";" + value.name;
                                    }
                                }
                            });
                        });
                        // if (checkNum >= 2) {
                        //     $scope.error.interfaceCheck = false;
                        // } else {
                        //     $scope.error.interfaceCheck = true;
                        // }
                        $scope.interfaceData.briInterfaceName = briInterfaceName;
                    };

                    $scope.changeConfer = function () {
                        if ($scope.interfaceData.confer === "0") {
                            $scope.interfaceData.speed = "0";
                        } else {
                            $scope.interfaceData.speed = "1000";
                        }
                    };

                    $scope.ok = function () {
                        var promises = [];
                        if ($scope.interfaceData.ipType === 1) {
                            $scope.interfaceData.ipAddressMask = '';
                        } else {
                            $scope.interfaceData.ipAddressMask = formatVal.ipLongMaskToIpShortNum($scope.interfaceData.ipAddressMask);
                        }
                        var deferred = $q.defer();
                        scope.configPromise = deferred.promise;
                        interfaceModel.isIpRangeDuplicate($scope.interfaceData).then(function (data) {
                            $modalInstance.close('done');
                            if (data.data === true) {
                                $rootScope.addAlert({
                                    type: 'danger',
                                    content: '接口' + $scope.interfaceData.interfaceName + '修改失败，其他接口有相同网段IP。'
                                });
                                deferred.resolve("fail");
                            } else {
                                promises.push(interfaceModel.editNetInterfaceData($scope.interfaceData));
                                $q.all(promises).then(function () {
                                    //延迟两秒再刷新
                                    $timeout(function() {
                                        deferred.resolve("success");
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '接口' + interfaceData.interfaceName + '修改成功'
                                        });
                                        scope.$parent.dtable.getTableData();
                                    },4000);
                                }, function (err) {
                                    deferred.resolve("fail");
                                    $rootScope.addAlert({
                                        type: 'danger',
                                        content: '接口' + interfaceData.interfaceName + '修改失败' + (err.data ? ('：' + err.data) : '')
                                    });
                                }).finally(function () {

                                });
                            }
                        });
                    };

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            scope.deleteInterface = function (interfaceData) {
                interfaceModel.checkBeforeDelete(interfaceData).then(function (referece){
                    if(!referece.data){
                        var deferred = $q.defer();
                        scope.configPromise = deferred.promise;
                        interfaceModel.deleteNetInterfaceData(interfaceData).then(function () {
                            //延迟两秒再刷新
                            $timeout(function() {
                                deferred.resolve("success");
                                $rootScope.addAlert({
                                    type: 'success',
                                    content: '接口' + interfaceData.interfaceName + '删除成功'
                                });
                                scope.$parent.dtable.getTableData();
                            },4000);
                        }, function (err) {
                            deferred.resolve("fail");
                            $rootScope.addAlert({
                                type: 'danger',
                                content: '接口' + interfaceData.interfaceName + '删除失败' + (err.data ? ('：' + err.data) : '')
                            });
                        });
                    }else {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '接口' + interfaceData.interfaceName + '删除失败,已经被' + referece.data +　'引用。'
                        });
                    }
                });

            };
        }
    }

})();
