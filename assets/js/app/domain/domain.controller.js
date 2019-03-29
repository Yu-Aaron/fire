/**
 * Init Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.domain')
        .controller('DomainCtrl', DomainCtrl);

    function DomainCtrl($scope, $state, $filter, domain, System, $modal, $rootScope, uiCtrl, strategyInfo, constantService, passwordValidationService) {
        var vm = this;
        vm.leftColClass = "domain-left-col-shrink";
        vm.rightColClass = "domain-right-col-expend";
        vm.initOption = "single";
        vm.seletedDomain = [];
        vm.editingDomain = false;
        vm.editingUser = false;
        vm.creatingDomain = false;
        vm.noDomain = false;
        vm.isOnlyDomain = false;
        vm.orderWordSet = "";
        vm.searchWordset = "";
        vm.currentEditDomain = "";
        vm.modified = false;
        vm.updatingUser = false;
        vm.validation = {
            name: false,
            code: false,
            all: false,
            ip: [],
            mask: [],
            passowrd: false
        };
        var openConfirmPanel = function (domainData, index) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'domainConfirmPanel.html',
                size: 'sm',
                controller: function ($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.ok = function () {
                        vm.currentEditDomain = angular.copy(domainData);
                        for (var i = 0; i < vm.seletedDomain.length; i++) {
                            vm.seletedDomain[i] = false;
                        }
                        vm.seletedDomain[index] = true;
                        vm.editingDomain = false;
                        vm.editingUser = false;
                        vm.creatingDomain = false;
                        $modalInstance.close();
                    };
                }
            });
            modalInstance.result.then(function () {
            }, function () {
            });
        };
        // get password complexity strategy
        vm.passwordComplexityStrategy = passwordValidationService.getPassComplexity(strategyInfo.data);
        vm.passwordComplexityMessage = passwordValidationService.getPassComplexityMessage(vm.passwordComplexityStrategy.strategyRules[0].ruleData);
        vm.passwordErrormessages = passwordValidationService.errorMessages;

        vm.showRightCol = function (domainData, index) {
            if (vm.editingDomain || vm.creatingDomain || vm.editingUser) {
                openConfirmPanel(domainData, index);
            } else {
                vm.currentEditDomain = angular.copy(domainData);
                for (var i = 0; i < vm.seletedDomain.length; i++) {
                    vm.seletedDomain[i] = false;
                }
                vm.seletedDomain[index] = true;
                vm.editingDomain = false;
                vm.editingUser = false;
                vm.creatingDomain = false;
            }
        };
        vm.setSearchWord = function () {
            //vm.searchWord
            vm.searchWordset = vm.searchWord;
            vm.getDomainData(true);

        };
        vm.setTableOrder = function (order) {
            if (order === vm.orderWordSet) {
                vm.orderWordSet = "-" + order;
                console.log(vm.orderWordSet);
            } else {
                vm.orderWordSet = order;
                console.log(vm.orderWordSet);
            }
        };
        vm.selectAll = function () {
            for (var i = 0; i < vm.domainDatas.length; i++) {
                vm.domainDatas[i].selected = vm.selectAllValue;
            }
        };
        vm.isSelected = function () {
            for (var i = 0; i < vm.seletedDomain.length; i++) {
                if (vm.seletedDomain[i]) {
                    return true;
                }
            }
            return false;
        };
        vm.switchOnlyDomain = function () {
            if (vm.isOnlyDomain) {
                console.log("only domian");
                console.log(vm.isOnlyDomain);
                vm.currentEditDomain.domainInfo.domainName = "default";
                vm.currentEditDomain.domainInfo.domainCode = "default";
                vm.currentEditDomain.domainInfo._subnets = [
                    {
                        "domainSubnetMask": "255.255.255.255",
                        "domainIp": "0.0.0.0",
                        "description": ""
                    }
                ];

                vm.validation.name = true;
                vm.validation.code = true;
                vm.validation.ip = [true];
                vm.validation.mask = [true];
                vm.validation.all = true;
            } else {
                console.log("not only domian");
                console.log(vm.isOnlyDomain);
                vm.currentEditDomain.domainInfo.domainName = "";
                vm.currentEditDomain.domainInfo.domainCode = "";
                vm.currentEditDomain.domainInfo._subnets = [
                    {
                        "domainSubnetMask": "",
                        "domainIp": "",
                        "description": ""
                    }
                ];
                vm.validation.name = false;
                vm.validation.code = false;
                vm.validation.ip = [false];
                vm.validation.mask = [false];
                vm.validation.all = false;
            }
        };
        vm.editDomain = function () {
            vm.editingDomain = true;
            vm.validation.ip = [];
            vm.validation.mask = [];
            for (var i = 0; i < vm.currentEditDomain.domainInfo._subnets.length; i++) {
                vm.validation.ip.push(true);
                vm.validation.mask.push(true);
            }
            vm.validation.name = true;
            vm.validation.code = true;
            vm.editUser();
            validateAll();
        };
        vm.addDomain = function (isOnlyDomain) {
            vm.creatingDomain = true;
            vm.editingDomain = false;
            vm.editingUser = false;
            vm.noDomain = false;
            vm.isOnlyDomain = isOnlyDomain;
            vm.currentEditDomain = {
                "user": {
                    "name": (isOnlyDomain) ? "admin" : "",
                    "passwordHash": "",
                    "stuffName": "",
                    "locked": "off"
                },
                "domainInfo": {
                    "domainName": (isOnlyDomain) ? "default" : "",
                    "domainCode": (isOnlyDomain) ? "default" : "",
                    "isMultiDomains": !isOnlyDomain,
                    "_subnets": [
                        {
                            "domainSubnetMask": (isOnlyDomain) ? "255.255.255.255" : "",
                            "domainIp": (isOnlyDomain) ? "0.0.0.0" : "",
                            "description": ""
                        }]
                }
            };
            vm.validation.all = false;
            vm.validation.ip = [];
            vm.validation.mask = [];
            vm.validation.ip.push(isOnlyDomain);
            vm.validation.mask.push(isOnlyDomain);
            vm.validation.password = false;
            vm.validation.name = isOnlyDomain;
            vm.validation.code = isOnlyDomain;
            validateAll();
        };
        vm.addSelectedDomain = function () {
            if (vm.initOption === "single") {
                vm.addDomain(true);
            } else if (vm.initOption === "multiple") {
                vm.addDomain(false);
            }
        };
        vm.confirmDomainEdit = function () {
            vm.updatingUser = true;
            if (vm.creatingDomain) {
                submitNewDomain();
            } else {
                if (vm.isOnlyDomain) {
                    vm.confirmUserEdit();
                } else {
                    submitDomain();
                }
            }
        };
        vm.cancelDomainEdit = function () {
            vm.editingDomain = false;
            vm.creatingDomain = false;
            for (var i = 0; i < vm.seletedDomain.length; i++) {
                if (vm.seletedDomain[i]) {
                    vm.currentEditDomain = angular.copy(vm.domainDatas[i]);
                }
            }
            if (vm.domainDatas.length < 1) {
                vm.noDomain = true;
            }
            //Add cancel user edit together
            vm.cancelUserEdit();
        };

        vm.editUser = function () {
            vm.modified = false;
            delete vm.currentEditDomain.user.password;
            delete vm.currentEditDomain.user.checkpassword;
            vm.validation.newPassword = 0;
            vm.validation.confirmPassword = 0;
            vm.editingUser = true;
            vm.validation.password = true;
            vm.currentEditDomain.user.locked = vm.currentEditDomain.user.locked ? 'on' : 'off';
        };
        vm.confirmUserEdit = function () {
            vm.updatingUser = true;
            if (vm.currentEditDomain.user.password === undefined || vm.currentEditDomain.user.password.length === 0) {
                domain.lockUser(vm.currentEditDomain.user.locked === 'on' ? "lock" : "unlock", vm.currentEditDomain.user.userId).then(function () {
                    $rootScope.addAlert({
                        type: 'success',
                        content: '区域信息修改成功！'
                    });
                    vm.currentEditDomain.user.locked = vm.currentEditDomain.user.locked === 'on' ? true : false;
                    vm.editingUser = false;
                    vm.updatingUser = false;
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '区域信息修改失败！' + data.data.error
                    });
                    vm.cancelUserEdit();
                    vm.updatingUser = false;
                });
            } else {
                var userInfo = {
                    "userId": vm.currentEditDomain.user.userId,
                    "name": vm.currentEditDomain.user.name,
                    "failedLoginAttemptCount": vm.currentEditDomain.user.failedLoginAttemptCount,
                    "locked": vm.currentEditDomain.user.locked === 'on' ? true : false,
                    "createdBy": vm.currentEditDomain.user.createdBy,
                    "updatedBy": vm.currentEditDomain.user.updatedBy,
                    "createdAt": vm.currentEditDomain.user.createdAt,
                    "updatedAt": vm.currentEditDomain.user.updatedAt,
                    "_roles": vm.currentEditDomain.user._roles,
                    "stuffName": vm.currentEditDomain.user.stuffName,
                    "passwordHash": vm.currentEditDomain.user.password
                };
                domain.updateUser(userInfo).then(function (data) {
                    console.log(data);
                    domain.lockUser(userInfo.locked ? 'lock' : 'unlock', userInfo.userId).then(function (data) {
                        console.log(data);
                        vm.editingUser = false;
                        vm.updatingUser = false;
                        $rootScope.addAlert({
                            type: 'success',
                            content: '区域信息修改成功！'
                        });
                        vm.currentEditDomain.user.locked = vm.currentEditDomain.user.locked === 'on' ? true : false;
                    }, function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: '区域信息修改失败！' + data.data.error
                        });
                        vm.cancelUserEdit();
                        vm.updatingUser = false;
                    });
                }, function (data) {
                    $rootScope.addAlert({
                        type: 'danger',
                        content: '区域信息修改失败！' + data.data.error
                    });
                    vm.cancelUserEdit();
                    vm.updatingUser = false;
                });
            }
            vm.getDomainData(false);
        };
        vm.cancelUserEdit = function () {
            vm.editingUser = false;
            for (var i = 0; i < vm.seletedDomain.length; i++) {
                console.log(vm.seletedDomain);
                console.log(vm.domainDatas[i]);
                if (vm.seletedDomain[i]) {
                    vm.currentEditDomain = angular.copy(vm.domainDatas[i]);
                }
            }
        };
        vm.cancelOnlyUserEdit = function () {
            vm.creatingDomain = false;
            vm.editingDomain = false;
            vm.editingUser = false;
            vm.getDomainData(false);
            vm.currentEditDomain = angular.copy(vm.domainDatas[0]);
        };
        vm.getDomainData = function (reset) {
            domain.getDomainByKeyword(vm.searchWordset).then(function (data) {
                angular.forEach(data, function (item) {
                    var localtime = $filter("date")((item.user.updatedAt), "yyyy-MM-dd HH:mm:ss");

                    item.user.updatedAt = localtime;
                });
                vm.domainDatas = data;

                if (vm.domainDatas.length > 0) {
                    vm.noDomain = false;
                } else {
                    vm.noDomain = true;
                }
                if (reset) {
                    vm.seletedDomain = [];
                    if (vm.domainDatas.length > 0) {
                        vm.seletedDomain.push(true);
                        vm.currentEditDomain = angular.copy(vm.domainDatas[0]);
                        if (vm.currentEditDomain.domainInfo.isMultiDomains) {
                            vm.isOnlyDomain = false;
                        } else {
                            vm.isOnlyDomain = true;
                        }
                    } else {
                        vm.currentEditDomain = "";

                        //  Only support single domain in BL2.0
                        vm.addDomain(true);
                    }
                    for (var i = 1; i < vm.domainDatas.length; i++) {
                        vm.seletedDomain.push(false);
                    }
                }
            });
        };

        vm.getDomainData(true);

        vm.addSubnet = function () {
            var newSubnet = {
                "domainSubnetMask": "",
                "domainIp": "",
                "description": ""
            };
            vm.currentEditDomain.domainInfo._subnets.push(newSubnet);
            vm.checkSubnet();
        };
        vm.deleteSubnet = function (index) {
            vm.currentEditDomain.domainInfo._subnets.pop(index);
            vm.checkSubnet();
        };
        vm.checkName = function (name) {
            if (!name || name.length < 5 || name.length > 20) {
                vm.validation.name = false;
            } else {
                vm.validation.name = true;
            }
            validateAll();
        };
        vm.checkCode = function (code) {
            if (!code || code.length < 1 || code.length > 10) {
                vm.validation.code = false;
            } else {
                vm.validation.code = true;
            }
            validateAll();
        };
        vm.checkSubnet = function () {
            vm.validation.ip = [];
            vm.validation.mask = [];
            for (var i = 0; i < vm.currentEditDomain.domainInfo._subnets.length; i++) {
                vm.validation.ip.push(ipValidation(vm.currentEditDomain.domainInfo._subnets[i].domainIp) ? true : false);
                vm.validation.mask.push(ipValidation(vm.currentEditDomain.domainInfo._subnets[i].domainSubnetMask) ? true : false);
            }
            validateAll();
        };
        vm.checkIp = function (ip, index) {
            vm.validation.ip[index] = ipValidation(ip) ? true : false;
            validateAll();
        };
        vm.checkMask = function (ip, index) {
            vm.validation.mask[index] = ipValidation(ip) ? true : false;
            validateAll();
        };
        vm.checkPassword = function () {
            var ret = passwordValidationService.validator(vm.currentEditDomain.user.password, vm.currentEditDomain.user.checkpassword, vm.passwordComplexityStrategy.strategyRules[0].ruleData);
            vm.validation.newPassword = ret.newPassValid;
            vm.validation.confirmPassword = ret.confirmPassValid;
            vm.validation.password = ret.allValid;
        };
        function ipValidation(ip) {
            var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])($|(\/([12][0-9]|3[0-2]|[0-9])))$/;
            return (ip.match(exp));
        }

        function validateAll() {
            vm.validation.all = vm.validation.name && vm.validation.code;
        }

        function submitDomain() {
            var newDomainInfo = {
                "domainName": vm.currentEditDomain.domainInfo.domainName,
                "domainCode": vm.currentEditDomain.domainInfo.domainCode,
                "domainInfoId": vm.currentEditDomain.domainInfo.domainInfoId,
                "_subnets": vm.currentEditDomain.domainInfo._subnets
            };
            domain.updateDomain(newDomainInfo).then(function () {
                vm.editingDomain = false;
                vm.updatingUser = false;
                vm.creatingDomain = false;
                vm.getDomainData(false);
                vm.confirmUserEdit();
            }, function (data) {
                $rootScope.addAlert({
                    type: 'danger',
                    content: '区域修改失败！' + data.data.error
                });
            });
        }

        function submitNewDomain() {
            var userName = (vm.isOnlyDomain) ? "admin" : "admin@" + vm.currentEditDomain.domainInfo.domainCode;
            var newDomainInfo = {
                "user": {
                    "name": userName,
                    "passwordHash": vm.currentEditDomain.user.password,
                    "stuffName": vm.currentEditDomain.user.stuffName,
                    "locked": vm.currentEditDomain.user.locked === 'on' ? true : false
                },
                "domainInfo": {
                    "domainName": vm.currentEditDomain.domainInfo.domainName,
                    "domainCode": vm.currentEditDomain.domainInfo.domainCode,
                    "isMultiDomains": !vm.isOnlyDomain
                }
            };
            console.log(newDomainInfo);

            domain.addDomain(newDomainInfo).then(function () {
                vm.editingDomain = false;
                vm.editingUser = false;
                vm.updatingUser = false;
                vm.creatingDomain = false;
                vm.DomainCreating = false;
                vm.getDomainData(true);
                if (uiCtrl.isRemote()) {
                    System.syncDataToAllInOne().then(function () {
                    }, function (error) {
                        console.log(error.data.error);
                    });
                }
                $rootScope.addAlert({
                    type: 'success',
                    content: '区域添加成功！'
                });
            }, function (data) {
                console.log(data);
                vm.DomainCreating = false;
                vm.updatingUser = false;
                $rootScope.addAlert({
                    type: 'danger',
                    content: '用户信息同步失败！'
                });
            });
        }
    }
})();
