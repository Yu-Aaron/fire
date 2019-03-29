/**
 * Rule Malicious Domain Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.maliciousdomain')
        .controller('MaliciousDomainCtrl', MaliciousDomainCtrl);

    function MaliciousDomainCtrl($rootScope, $scope, $state, $modal, $q, System, Enum, formatVal, Task, Signature, switchOn, policyId, waitingDomainCount, deployedDomainCount) {
        var vm = this;

        vm.editRight = Enum.get('privilege').filter(function (data) {
            return data.name === 'POLICY';
        });
        vm.editRight = vm.editRight && vm.editRight[0] && vm.editRight[0].actionValue === 30;

        vm.isDPIUpgrading = System.isDPIUpgrading();
        $rootScope.$on('dpiUpgradeState', function () {
            vm.isDPIUpgrading = System.isDPIUpgrading();
        });

        vm.switchOn = switchOn;
        vm.waitingDomainCount = waitingDomainCount;
        vm.deployedDomainCount = deployedDomainCount;

        vm.new = function (dTable) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/templates/rule/maliciousdomain/new.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    waitingDomains: function () {
                        return Signature.getMaliciousDomains({
                            '$filter': 'deployStatus ne DEPLOYED',
                            '$limit': 1000000
                        }).then(function (data) {
                            return data;
                        });
                    },
                    deployedDomains: function () {
                        return Signature.getMaliciousDomains({
                            '$filter': 'deployStatus eq DEPLOYED',
                            '$limit': 1000000
                        }).then(function (data) {
                            return data;
                        });
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, waitingDomains, deployedDomains) {
                $scope.newDomains = [];
                var firstNewDomain = {};
                firstNewDomain.domainName = '';
                firstNewDomain.action = 'ALERT';
                firstNewDomain.domainProtocolType = 'DNS';
                $scope.newDomains.push(firstNewDomain);

                $scope.addMaliciousDomain = function () {
                    var deferred = $q.defer();
                    var promises = [];
                    for (var i in $scope.newDomains) {
                        if (i) {
                            var newDomain = angular.copy($scope.newDomains[i]);
                            delete newDomain.invalidDomain;
                            delete newDomain.hasDuplicateDomain;
                            promises.push(Signature.addMaliciousDomain(newDomain));
                        }
                    }
                    $q.all(promises).then(function () {
                        deferred.resolve('success');
                        $modalInstance.close();
                        dTable.getTableData();
                        $rootScope.addAlert({
                            type: 'success',
                            content: '增加域名规则成功'
                        });
                        vm.waitingDomainCount += $scope.newDomains.length;
                    }, function (data) {
                        var failedDomain = data.config ? (data.config.data ? data.config.data.domainName : '') : '';
                        deferred.resolve('fail');
                        $modalInstance.close();
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('增加域名规则失败：' + data.data.error) : '增加域名规则失败') + (failedDomain ? ': ' + failedDomain : '')
                        });
                    });
                };

                $scope.ok = function () {
                    $scope.addMaliciousDomain();
                };

                $scope.cancel = function () {
                    $modalInstance.close();
                };

                $scope.add = function () {
                    var newDomain = {};
                    newDomain.domainName = '';
                    newDomain.action = 'ALERT';
                    newDomain.domainProtocolType = 'DNS';
                    newDomain.invalidDomain = true;
                    $scope.newDomains.push(newDomain);
                };

                $scope.delete = function (index) {
                    $scope.newDomains.splice(index, 1);
                };

                $scope.validate = function () {
                    $scope.allNewDomainValid = false;
                    var invalid = false;
                    for (var i = 0; i < $scope.newDomains.length; i++) {
                        var tmp = $scope.newDomains[i];
                        if (tmp.invalidDomain) {
                            invalid = true;
                        } else {
                            $scope.validateDulplcate(tmp);
                            if (tmp.hasDuplicateDomain) {
                                invalid = true;
                            }
                        }
                    }
                    $scope.allNewDomainValid = !invalid;
                };

                $scope.validateDulplcate = function (domain) {
                    domain.hasDuplicateDomain = false;
                    if (domain.domainName) {
                        if (!domain.invalidDomain) {
                            var count = 0;
                            for (var i = 0; i < $scope.newDomains.length; i++) {
                                if ($scope.newDomains[i].domainName.toUpperCase() === domain.domainName.toUpperCase()) {
                                    count++;
                                    if (count > 1) {
                                        domain.hasDuplicateDomain = true;
                                        return;
                                    }
                                }
                            }
                            for (var j = 0; j < waitingDomains.length; j++) {
                                if (waitingDomains[j].domainName.toUpperCase() === domain.domainName.toUpperCase()) {
                                    domain.hasDuplicateDomain = true;
                                    return;
                                }
                            }
                            for (var k = 0; k < deployedDomains.length; k++) {
                                if (deployedDomains[k].domainName.toUpperCase() === domain.domainName.toUpperCase()) {
                                    domain.hasDuplicateDomain = true;
                                    return;
                                }
                            }
                        }
                    }
                };

                $scope.validateFormat = function (domain) {
                    domain.invalidDomain = !domain.domainName || formatVal.validateDomain(domain.domainName);
                };
            }
        };

        vm.changeStatus = function (domain, status) {
            domain.maliciousDomainStatus = status;
            var org = '';
            if (status === 'ACTIVATED') {
                org = 'INACTIVATED';
            } else {
                org = 'ACTIVATED';
            }
            var changeDomain = angular.copy(domain);
            delete changeDomain.isdoing;
            delete changeDomain.checked;
            domain.isdoing = true;
            Signature.changeActionToMaliciousDomain(changeDomain).then(function () {
                domain.isdoing = false;
            }, function (data) {
                domain.isdoing = false;
                domain.maliciousDomainStatus = org;
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.error ? ('更改域名规则失败：' + data.data.error) : '更改域名规则失败')
                });
            });
        };

        function getSelected(dTable) {
            var table = dTable.table;
            var domains = [];
            if (!dTable.selectAllDomains) {
                for (var i = 0; i < table.length; i++) {
                    if (table[i].checked) {
                        delete table[i].checked;
                        domains.push(table[i]);
                    }
                }
                return domains;
            } else {
                var filter = "";
                if (dTable.query) {
                    filter = " and (contains(domainName,'" + dTable.query + "'))";
                } else if (dTable.advancedSearchQuery) {
                    filter = " and " + dTable.advancedSearchQuery;
                }
                return Signature.getMaliciousDomains({
                    '$filter': 'deployStatus ne DEPLOYED' + filter,
                    '$limit': 1000000
                }).then(function (data) {
                    for (var j = 0; j < data.length; j++) {
                        domains.push(data[j]);
                    }
                    return domains;
                });
            }
        }

        function updateList(domains, dTable, status) {
            dTable.selectAll = false;
            dTable.selectedDomainCount = 0;
            var promises = [];
            for (var i = 0; i < domains.length; i++) {
                if (domains[i].maliciousDomainStatus === status) {
                    continue;
                }
                domains[i].maliciousDomainStatus = status;
                promises.push(Signature.changeActionToMaliciousDomain(domains[i]));
            }
            if (promises.length) {
                var msg = '忽略';
                if (status === 'ACTIVATED') {
                    msg = '激活';
                }
                setDoingStatus(dTable, true);
                $q.all(promises).then(function () {
                    setDoingStatus(dTable, false);
                    dTable.getTableData();
                    $rootScope.addAlert({
                        type: 'success',
                        content: msg + '全部选中域名规则成功'
                    });
                }, function (data) {
                    setDoingStatus(dTable, false);
                    var failedDomain = data.config ? (data.config.data ? data.config.data.domainName : '') : '';
                    $rootScope.addAlert({
                        type: 'danger',
                        content: (data.data.error ? (msg + '域名规则失败：' + data.data.error) : msg + '域名规则失败') + (failedDomain ? ': ' + failedDomain : '')
                    });
                });
            }
        }

        vm.changeStatusSelected = function (dTable, status) {
            var domains = getSelected(dTable);
            if (!(domains instanceof Array)) {
                domains.then(function (data) {
                    updateList(data, dTable, status);
                });
            } else {
                updateList(domains, dTable, status);
            }
        };

        vm.delete = function (dTable, domain) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/maliciousdomain/confirmDelete.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    domain: function () {
                        return domain;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, domain) {
                $scope.domain = domain;

                $scope.ok = function () {
                    domain.isdoing = true;
                    Signature.deleteMaliciousDomain(domain.maliciousDomainId).then(function () {
                        domain.isdoing = false;
                        dTable.getTableData();
                        $rootScope.addAlert({
                            type: 'success',
                            content: '忽略域名规则成功'
                        });
                        vm.waitingDomainCount--;
                    }, function (data) {
                        domain.isdoing = false;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('忽略域名规则失败：' + data.data.error) : '忽略域名规则失败')
                        });
                    });
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    domain.isdoing = false;
                    $modalInstance.close();
                };
            }
        };

        vm.deleteSelected = function (dTable) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/maliciousdomain/confirmDelete.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    domains: function () {
                        var table = dTable.table;
                        var domains = [];
                        if (!dTable.selectAllDomains) {
                            for (var i = 0; i < table.length; i++) {
                                if (table[i].checked) {
                                    var domain = {};
                                    domain.maliciousDomainId = table[i].maliciousDomainId;
                                    domain.domainName = table[i].domainName;
                                    domain.action = table[i].action;
                                    domains.push(domain);
                                }
                            }
                        } else {
                            var filter = "";
                            if (dTable.query) {
                                filter = " and (contains(domainName,'" + dTable.query + "'))";
                            } else if (dTable.advancedSearchQuery) {
                                filter = " and " + dTable.advancedSearchQuery;
                            }
                            Signature.getMaliciousDomains({
                                '$filter': 'deployStatus ne DEPLOYED' + filter,
                                '$limit': 1000000
                            }).then(function (data) {
                                for (var j = 0; j < data.length; j++) {
                                    domains.push(data[j]);
                                }
                            });
                        }
                        return domains;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, domains) {

                $scope.ok = function () {
                    var deferred = $q.defer();
                    var promises = [];
                    for (var i in domains) {
                        if (i) {
                            promises.push(Signature.deleteMaliciousDomain(domains[i].maliciousDomainId));
                        }
                    }
                    setDoingStatus(dTable, true);
                    $q.all(promises).then(function () {
                        setDoingStatus(dTable, false);
                        deferred.resolve('success');
                        $modalInstance.close();
                        dTable.getTableData();
                        $rootScope.addAlert({
                            type: 'success',
                            content: '忽略全部选中域名规则成功'
                        });
                        vm.waitingDomainCount -= domains.length;
                    }, function (data) {
                        setDoingStatus(dTable, false);
                        var failedDomain = data.config ? (data.config.data ? data.config.data.domainName : '') : '';
                        deferred.resolve('fail');
                        $modalInstance.close();
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('忽略域名规则失败：' + data.data.error) : '忽略域名规则失败') + (failedDomain ? ': ' + failedDomain : '')
                        });
                    });
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    setDoingStatus(dTable, false);
                    $modalInstance.close();
                };
            }
        };

        vm.change = function (domain, action) {
            if (domain.action === action) {
                return;
            }
            var oldAction = angular.copy(domain.action);
            domain.action = action;
            var changeDomain = angular.copy(domain);
            delete changeDomain.isdoing;
            delete changeDomain.checked;
            domain.isdoing = true;
            Signature.changeActionToMaliciousDomain(changeDomain).then(function () {
                domain.isdoing = false;
            }, function (data) {
                domain.isdoing = false;
                domain.action = oldAction;
                $rootScope.addAlert({
                    type: 'danger',
                    content: (data.data.error ? ('更改域名规则失败：' + data.data.error) : '更改域名规则失败')
                });
            });
        };

        vm.changeSelected = function (dTable, action) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/maliciousdomain/confirmChange.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    action: function () {
                        return action;
                    },
                    domains: function () {
                        var table = dTable.table;
                        var domains = [];
                        if (!dTable.selectAllDomains) {
                            for (var i = 0; i < table.length; i++) {
                                if (table[i].checked) {
                                    var domain = {};
                                    domain.maliciousDomainId = table[i].maliciousDomainId;
                                    domain.domainName = table[i].domainName;
                                    domain.action = table[i].action;
                                    domains.push(domain);
                                }
                            }
                        } else {
                            var filter = "";
                            if (dTable.query) {
                                filter = " and (contains(domainName,'" + dTable.query + "'))";
                            } else if (dTable.advancedSearchQuery) {
                                filter = " and " + dTable.advancedSearchQuery;
                            }
                            Signature.getMaliciousDomains({
                                '$filter': 'deployStatus ne DEPLOYED' + filter,
                                '$limit': 1000000
                            }).then(function (data) {
                                for (var j = 0; j < data.length; j++) {
                                    domains.push(data[j]);
                                }
                            });
                        }
                        return domains;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, action, domains) {
                $scope.action = action;

                $scope.ok = function () {
                    var deferred = $q.defer();
                    var promises = [];
                    for (var i in domains) {
                        if (i) {
                            var domain = angular.copy(domains[i]);
                            domain.action = action;
                            promises.push(Signature.changeActionToMaliciousDomain(domain));
                        }
                    }
                    setDoingStatus(dTable, true);
                    $q.all(promises).then(function () {
                        setDoingStatus(dTable, false);
                        deferred.resolve('success');
                        $modalInstance.close();
                        var table = dTable.table;
                        for (var i = 0; i < table.length; i++) {
                            if (table[i].checked) {
                                table[i].action = action;
                            }
                        }
                        $rootScope.addAlert({
                            type: 'success',
                            content: '更改全部选中域名规则成功'
                        });
                    }, function (data) {
                        setDoingStatus(dTable, false);
                        var failedDomain = data.config ? (data.config.data ? data.config.data.domainName : '') : '';
                        deferred.resolve('fail');
                        $modalInstance.close();
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('更改域名规则失败：' + data.data.error) : '更改域名规则失败') + (failedDomain ? ': ' + failedDomain : '')
                        });
                    });
                    $modalInstance.close();
                };

                $scope.cancel = function () {
                    setDoingStatus(dTable, false);
                    $modalInstance.close();
                };
            }
        };

        vm.deploy = function (dTable) {
            var modalInstance = $modal.open({
                controller: ModalInstanceCtrl,
                templateUrl: '/templates/rule/maliciousdomain/confirmDeploy.html',
                size: 'sm',
                resolve: {
                    domains: function () {
                        var table = dTable.table;
                        var domains = [];
                        if (!dTable.selectAllDomains) {
                            for (var i = 0; i < table.length; i++) {
                                if (table[i].checked && table[i].maliciousDomainStatus === 'ACTIVATED') {
                                    var domain = {};
                                    domain.maliciousDomainId = table[i].maliciousDomainId;
                                    domain.domainName = table[i].domainName;
                                    domain.action = table[i].action;
                                    domains.push(domain);
                                }
                            }
                        } else {
                            var filter = "";
                            if (dTable.query) {
                                filter = " and (contains(domainName,'" + dTable.query + "'))";
                            } else if (dTable.advancedSearchQuery) {
                                filter = " and " + dTable.advancedSearchQuery;
                            }
                            Signature.getMaliciousDomains({
                                '$filter': 'deployStatus ne DEPLOYED' + filter,
                                '$limit': 1000000
                            }).then(function (data) {
                                for (var j = 0; j < data.length; j++) {
                                    if (data[j].maliciousDomainStatus === 'ACTIVATED') {
                                        domains.push(data[j]);
                                    }
                                }
                            });
                        }
                        return domains;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, $timeout, Topology, topologyId, domains) {
                var isUpgrading;
                Topology.getDevices(topologyId.id).then(function (Ddata) {
                    System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        isUpgrading = (dpiUpgradeData.data.filter(function (data) {
                            return (data.state !== 'NONE' || (data.state === 'NONE' && data.percentage !== 0 && data.percentage !== 100)) && !data.error;
                        })[0]) ? true : false;
                        $scope.check = {
                            checkDisconnect: true
                        };
                        $scope.msg = {
                            'title': '部署新域名规则',
                            'text': '部署新域名规则将会增加新规则到已部署的域名规则, 未激活的规则将不会被部署。',
                            'qus': '确定部署域名规则？',
                            'buttonText': '部署规则',
                            'fontAwesomeText': 'fa-cloud-download',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '无法部署域名规则到以下未连线设备：',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        $scope.deviceDisconnetedPool = [];
                        var promises = [];
                        promises.push(Topology.getLinks(topologyId.id));
                        for (var k = 0; k < Ddata.data.length; k++) {
                            if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                if (Ddata.data[k].deviceOnline !== 1) {
                                    $scope.msg.isShowDeviceDisconnectedMsg = true;
                                    $scope.check.checkDisconnect = false;
                                    $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                                } else {
                                    $scope.msg.isShowDeviceConnectedCnt++;
                                    promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId));
                                }
                            }
                        }
                        $q.all(promises).then(function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                                $scope.msg.text = "没有设备在线，无法部署域名规则。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                        });
                    });
                });

                $scope.deploy = function () {
                    setDoingStatus(dTable, true);
                    Signature.deployMaliciousDomains('inc', policyId, domains).then(function (data) {
                        var deferred = $q.defer();
                        var taskId = data.data.taskId;
                        $rootScope.deployTaskPromise = deferred.promise;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        dTable.getTableData();
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '部署域名规则成功'
                                        });
                                        vm.waitingDomainCount -= domains.length;
                                        vm.deployedDomainCount += domains.length;
                                    } else if (data.data.state === 'FAILED') {
                                        setDoingStatus(dTable, false);
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('部署域名规则失败：' + data.data.reason) : '部署域名规则失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        setDoingStatus(dTable, false);
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '部署域名规则超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(120);
                    }, function (data) {
                        setDoingStatus(dTable, false);
                        var conflict = data.status === 409;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('部署域名规则失败：' + data.data.error) : '部署域名规则失败' + (conflict ? '， 正在部署中， 请稍后再试。' : ''))
                        });
                    });
                };

                $scope.ok = function () {
                    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                        $modalInstance.dismiss('cancel');
                    } else {
                        $scope.deploy();
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    setDoingStatus(dTable, false);
                    $modalInstance.dismiss('cancel');
                };
            }
        };

        vm.clear = function (dTable) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/maliciousdomain/confirmDeploy.html',
                controller: ModalInstanceCtrl,
                size: 'sm'
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, $timeout, Topology, topologyId) {
                var isUpgrading;
                Topology.getDevices(topologyId.id).then(function (Ddata) {
                    System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        isUpgrading = (dpiUpgradeData.data.filter(function (data) {
                            return (data.state !== 'NONE' || (data.state === 'NONE' && data.percentage !== 0 && data.percentage !== 100)) && !data.error;
                        })[0]) ? true : false;
                        $scope.check = {
                            checkDisconnect: true
                        };
                        $scope.msg = {
                            'title': '清空已部署规则',
                            'text': '清空已部署规则将会删除全部已经部署的域名规则。',
                            'qus': '确定清空已部署规则？',
                            'buttonText': '清空已部署规则',
                            'fontAwesomeText': 'fa-times-circle-o',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '无法清空以下未连线设备上的全部已经部署的域名规则：',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        $scope.deviceDisconnetedPool = [];
                        var promises = [];
                        promises.push(Topology.getLinks(topologyId.id));
                        for (var k = 0; k < Ddata.data.length; k++) {
                            if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                if (Ddata.data[k].deviceOnline !== 1) {
                                    $scope.msg.isShowDeviceDisconnectedMsg = true;
                                    $scope.check.checkDisconnect = false;
                                    $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                                } else {
                                    $scope.msg.isShowDeviceConnectedCnt++;
                                    promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId));
                                }
                            }
                        }
                        $q.all(promises).then(function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                                $scope.msg.text = "没有设备在线，无法清空已部署规则。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                        });
                    });
                });

                $scope.clear = function () {
                    setDoingStatus(dTable, true);
                    Signature.deployMaliciousDomains('clear', policyId, []).then(function (data) {
                        var deferred = $q.defer();
                        var taskId = data.data.taskId;
                        $rootScope.deployTaskPromise = deferred.promise;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        dTable.getTableData();
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '清空已部署域名规则成功'
                                        });
                                        vm.waitingDomainCount += vm.deployedDomainCount;
                                        vm.deployedDomainCount = 0;
                                    } else if (data.data.state === 'FAILED') {
                                        setDoingStatus(dTable, false);
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('清空已部署规则失败：' + data.data.reason) : '清空已部署规则失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        setDoingStatus(dTable, false);
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '清空已部署规则超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(120);
                    }, function (data) {
                        setDoingStatus(dTable, false);
                        var conflict = data.status === 409;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('清空已部署规则失败：' + data.data.error) : '清空已部署规则失败' + (conflict ? '， 正在部署中， 请稍后再试。' : ''))
                        });
                    });
                    $modalInstance.close();
                };

                $scope.ok = function () {
                    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                        $modalInstance.dismiss('cancel');
                    } else {
                        $scope.clear();
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    setDoingStatus(dTable, false);
                    $modalInstance.close();
                };
            }
        };

        vm.deleteDeployed = function (dTable, domain) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/maliciousdomain/confirmDeploy.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    domain: function () {
                        return domain;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, $timeout, Topology, topologyId, domain) {
                $scope.domain = domain;
                var isUpgrading;
                Topology.getDevices(topologyId.id).then(function (Ddata) {
                    System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        isUpgrading = (dpiUpgradeData.data.filter(function (data) {
                            return (data.state !== 'NONE' || (data.state === 'NONE' && data.percentage !== 0 && data.percentage !== 100)) && !data.error;
                        })[0]) ? true : false;
                        $scope.check = {
                            checkDisconnect: true
                        };
                        $scope.msg = {
                            'title': '删除已部署域名规则',
                            'text': '删除已部署域名规则将会删除已经部署的该项域名规则。',
                            'qus': '确定删除已部署域名规则 ' + domain.domainName + ' ？',
                            'buttonText': '删除已部署规则',
                            'fontAwesomeText': 'fa-trash-o',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '无法删除以下未连线设备上的已部署域名规则：',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        $scope.deviceDisconnetedPool = [];
                        var promises = [];
                        promises.push(Topology.getLinks(topologyId.id));
                        for (var k = 0; k < Ddata.data.length; k++) {
                            if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                if (Ddata.data[k].deviceOnline !== 1) {
                                    $scope.msg.isShowDeviceDisconnectedMsg = true;
                                    $scope.check.checkDisconnect = false;
                                    $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                                } else {
                                    $scope.msg.isShowDeviceConnectedCnt++;
                                    promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId));
                                }
                            }
                        }
                        $q.all(promises).then(function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                                $scope.msg.text = "没有设备在线，无法删除已部署域名规则。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                        });
                    });
                });

                $scope.deleteDeployed = function () {
                    domain.isdoing = true;
                    var domains = [];
                    var deleteDomain = angular.copy(domain);
                    delete deleteDomain.isdoing;
                    delete deleteDomain.checked;
                    domains.push(deleteDomain);
                    Signature.deployMaliciousDomains('del', policyId, domains).then(function (data) {
                        var deferred = $q.defer();
                        var taskId = data.data.taskId;
                        $rootScope.deployTaskPromise = deferred.promise;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        dTable.getTableData();
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '删除已部署域名规则成功'
                                        });
                                        vm.waitingDomainCount++;
                                        vm.deployedDomainCount--;
                                    } else if (data.data.state === 'FAILED') {
                                        domain.isdoing = false;
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('删除已部署域名规则失败：' + data.data.reason) : '删除已部署域名规则失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        domain.isdoing = false;
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '删除已部署域名规则超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(120);
                    }, function (data) {
                        domain.isdoing = false;
                        var conflict = data.status === 409;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('删除已部署域名规则失败：' + data.data.error) : '删除已部署域名规则失败' + (conflict ? '， 正在部署中， 请稍后再试。' : ''))
                        });
                    });
                    $modalInstance.close();
                };

                $scope.ok = function () {
                    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                        $modalInstance.dismiss('cancel');
                    } else {
                        $scope.deleteDeployed();
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    domain.isdoing = false;
                    $modalInstance.close();
                };
            }
        };

        vm.deleteSelectedDeployed = function (dTable) {
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/maliciousdomain/confirmDeploy.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    domains: function () {
                        var table = dTable.table;
                        var domains = [];
                        if (!dTable.selectAllDomains) {
                            for (var i = 0; i < table.length; i++) {
                                if (table[i].checked) {
                                    var domain = {};
                                    domain.maliciousDomainId = table[i].maliciousDomainId;
                                    domain.domainName = table[i].domainName;
                                    domain.action = table[i].action;
                                    domains.push(domain);
                                }
                            }
                        } else {
                            var filter = "";
                            if (dTable.query) {
                                filter = " and (contains(domainName,'" + dTable.query + "'))";
                            } else if (dTable.advancedSearchQuery) {
                                filter = " and " + dTable.advancedSearchQuery;
                            }
                            Signature.getMaliciousDomains({
                                '$filter': 'deployStatus eq DEPLOYED' + filter,
                                '$limit': 1000000
                            }).then(function (data) {
                                for (var j = 0; j < data.length; j++) {
                                    domains.push(data[j]);
                                }
                            });
                        }
                        return domains;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, $timeout, Topology, topologyId, domains) {
                var isUpgrading;
                Topology.getDevices(topologyId.id).then(function (Ddata) {
                    System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        isUpgrading = (dpiUpgradeData.data.filter(function (data) {
                            return (data.state !== 'NONE' || (data.state === 'NONE' && data.percentage !== 0 && data.percentage !== 100)) && !data.error;
                        })[0]) ? true : false;
                        $scope.check = {
                            checkDisconnect: true
                        };
                        $scope.msg = {
                            'title': '删除全部选中已部署域名规则',
                            'text': '删除全部选中已部署域名规则将会删除全部选中的已经部署的域名规则。',
                            'qus': '确定删除全部选中已部署域名规则？',
                            'buttonText': '删除已部署规则',
                            'fontAwesomeText': 'fa-trash-o',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '无法删除以下未连线设备上的已部署域名规则：',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        $scope.deviceDisconnetedPool = [];
                        var promises = [];
                        promises.push(Topology.getLinks(topologyId.id));
                        for (var k = 0; k < Ddata.data.length; k++) {
                            if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                if (Ddata.data[k].deviceOnline !== 1) {
                                    $scope.msg.isShowDeviceDisconnectedMsg = true;
                                    $scope.check.checkDisconnect = false;
                                    $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                                } else {
                                    $scope.msg.isShowDeviceConnectedCnt++;
                                    promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId));
                                }
                            }
                        }
                        $q.all(promises).then(function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                                $scope.msg.text = "没有设备在线，无法删除已部署域名规则。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                        });
                    });
                });

                $scope.deleteSelectedDeployed = function () {
                    setDoingStatus(dTable, true);
                    Signature.deployMaliciousDomains('del', policyId, domains).then(function (data) {
                        var deferred = $q.defer();
                        var taskId = data.data.taskId;
                        $rootScope.deployTaskPromise = deferred.promise;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        dTable.getTableData();
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '删除已部署域名规则成功'
                                        });
                                        vm.waitingDomainCount += domains.length;
                                        vm.deployedDomainCount -= domains.length;
                                    } else if (data.data.state === 'FAILED') {
                                        setDoingStatus(dTable, false);
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('删除已部署域名规则失败：' + data.data.reason) : '删除已部署域名规则失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        setDoingStatus(dTable, false);
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '删除已部署域名规则超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(120);
                    }, function (data) {
                        setDoingStatus(dTable, false);
                        var conflict = data.status === 409;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('删除已部署域名规则失败：' + data.data.error) : '删除已部署域名规则失败' + (conflict ? '， 正在部署中， 请稍后再试。' : ''))
                        });
                    });
                    $modalInstance.close();
                };

                $scope.ok = function () {
                    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                        $modalInstance.dismiss('cancel');
                    } else {
                        $scope.deleteSelectedDeployed();
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    setDoingStatus(dTable, false);
                    $modalInstance.close();
                };
            }
        };

        vm.changeDeployed = function (domain, action) {
            if (domain.action === action) {
                return;
            }
            var oldAction = angular.copy(domain.action);
            domain.action = action;
            var modalInstance = $modal.open({
                templateUrl: 'templates/rule/maliciousdomain/confirmDeploy.html',
                controller: ModalInstanceCtrl,
                size: 'sm',
                resolve: {
                    oldAction: function () {
                        return oldAction;
                    },
                    domain: function () {
                        return domain;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
                domain.action = oldAction;
            });

            function ModalInstanceCtrl($scope, $modalInstance, $timeout, Topology, topologyId, oldAction, domain) {
                var isUpgrading;
                Topology.getDevices(topologyId.id).then(function (Ddata) {
                    System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        isUpgrading = (dpiUpgradeData.data.filter(function (data) {
                            return (data.state !== 'NONE' || (data.state === 'NONE' && data.percentage !== 0 && data.percentage !== 100)) && !data.error;
                        })[0]) ? true : false;
                        $scope.check = {
                            checkDisconnect: true
                        };
                        var actionName = (action === 'DENY' ? '阻断' : action === 'ALERT' ? '警告' : action === 'ALLOW' ? '允许' : '');
                        $scope.msg = {
                            'title': actionName + '已部署域名',
                            'text': actionName + '已部署域名将会更改已经部署的该项域名规则处理方式为' + actionName + '。',
                            'qus': '确定更改已部署域名规则 ' + domain.domainName + ' ？',
                            'buttonText': '更改已部署规则',
                            'fontAwesomeText': 'fa-cloud-download',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '无法更改以下未连线设备上的已部署域名规则：',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        $scope.deviceDisconnetedPool = [];
                        var promises = [];
                        promises.push(Topology.getLinks(topologyId.id));
                        for (var k = 0; k < Ddata.data.length; k++) {
                            if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                if (Ddata.data[k].deviceOnline !== 1) {
                                    $scope.msg.isShowDeviceDisconnectedMsg = true;
                                    $scope.check.checkDisconnect = false;
                                    $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                                } else {
                                    $scope.msg.isShowDeviceConnectedCnt++;
                                    promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId));
                                }
                            }
                        }
                        $q.all(promises).then(function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                                $scope.msg.text = "没有设备在线，无法更改已部署域名规则。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                        });
                    });
                });

                $scope.changeDeployed = function () {
                    domain.isdoing = true;
                    var domains = [];
                    var deleteDomain = angular.copy(domain);
                    delete deleteDomain.isdoing;
                    delete deleteDomain.checked;
                    domains.push(deleteDomain);
                    Signature.deployMaliciousDomains('inc', policyId, domains).then(function (data) {
                        var deferred = $q.defer();
                        var taskId = data.data.taskId;
                        $rootScope.deployTaskPromise = deferred.promise;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        domain.isdoing = false;
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '更改已部署域名规则成功'
                                        });
                                    } else if (data.data.state === 'FAILED') {
                                        domain.action = oldAction;
                                        domain.isdoing = false;
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('更改已部署域名规则失败：' + data.data.reason) : '更改已部署域名规则失败')
                                        });
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        domain.action = oldAction;
                                        domain.isdoing = false;
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '更改已部署域名规则超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(120);
                    }, function (data) {
                        domain.action = oldAction;
                        domain.isdoing = false;
                        var conflict = data.status === 409;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('更改已部署域名规则失败：' + data.data.error) : '更改已部署域名规则失败' + (conflict ? '， 正在部署中， 请稍后再试。' : ''))
                        });
                    });
                    $modalInstance.close();
                };

                $scope.ok = function () {
                    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                        domain.action = oldAction;
                        $modalInstance.dismiss('cancel');
                    } else {
                        $scope.changeDeployed();
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    domain.action = oldAction;
                    domain.isdoing = false;
                    $modalInstance.close();
                };
            }
        };

        vm.changeSelectedDeployed = function (dTable, action) {
            var modalInstance = $modal.open({
                controller: ModalInstanceCtrl,
                templateUrl: '/templates/rule/maliciousdomain/confirmDeploy.html',
                size: 'sm',
                resolve: {
                    action: function () {
                        return action;
                    },
                    domains: function () {
                        var table = dTable.table;
                        var domains = [];
                        if (!dTable.selectAllDomains) {
                            for (var i = 0; i < table.length; i++) {
                                if (table[i].checked) {
                                    var domain = {};
                                    domain.maliciousDomainId = table[i].maliciousDomainId;
                                    domain.domainName = table[i].domainName;
                                    domain.action = action;
                                    domains.push(domain);
                                }
                            }
                        } else {
                            var filter = "";
                            if (dTable.query) {
                                filter = " and (contains(domainName,'" + dTable.query + "'))";
                            } else if (dTable.advancedSearchQuery) {
                                filter = " and " + dTable.advancedSearchQuery;
                            }
                            Signature.getMaliciousDomains({
                                '$filter': 'deployStatus eq DEPLOYED' + filter,
                                '$limit': 1000000
                            }).then(function (data) {
                                for (var j = 0; j < data.length; j++) {
                                    var domain = data[j];
                                    domain.action = action;
                                    domains.push(domain);
                                }
                            });
                        }
                        return domains;
                    }
                }
            });

            modalInstance.result.then(function () {
            }, function () {
            });

            function ModalInstanceCtrl($scope, $modalInstance, $timeout, Topology, topologyId, action, domains) {
                var isUpgrading;
                Topology.getDevices(topologyId.id).then(function (Ddata) {
                    System.getDPIUpgradeInfo().then(function (dpiUpgradeData) {
                        isUpgrading = (dpiUpgradeData.data.filter(function (data) {
                            return (data.state !== 'NONE' || (data.state === 'NONE' && data.percentage !== 0 && data.percentage !== 100)) && !data.error;
                        })[0]) ? true : false;
                        $scope.check = {
                            checkDisconnect: true
                        };
                        var actionName = (action === 'DENY' ? '阻断' : action === 'ALERT' ? '警告' : action === 'ALLOW' ? '允许' : '');
                        $scope.msg = {
                            'title': actionName + '全部选中已部署域名',
                            'text': actionName + '全部选中已部署域名将会更改全部选中的已经部署的域名规则处理方式为' + actionName + '。',
                            'qus': '确定更改已部署域名规则？',
                            'buttonText': '更改已部署规则',
                            'fontAwesomeText': 'fa-cloud-download',
                            'isShowDeviceConnectedCnt': 0,
                            'isShowDeviceDisconnectedMsg': false,
                            'isShowDeviceDisconnectedText': '无法更改以下未连线设备上的已部署域名规则：',
                            'isShowDeviceUpgradingMsg': isUpgrading
                        };
                        $scope.deviceDisconnetedPool = [];
                        var promises = [];
                        promises.push(Topology.getLinks(topologyId.id));
                        for (var k = 0; k < Ddata.data.length; k++) {
                            if (Ddata.data[k].category === "SECURITY_DEVICE") {
                                if (Ddata.data[k].deviceOnline !== 1) {
                                    $scope.msg.isShowDeviceDisconnectedMsg = true;
                                    $scope.check.checkDisconnect = false;
                                    $scope.deviceDisconnetedPool.push(Ddata.data[k].name);
                                } else {
                                    $scope.msg.isShowDeviceConnectedCnt++;
                                    promises.push(Topology.getDeviceNodes(Ddata.data[k].deviceId));
                                }
                            }
                        }
                        $q.all(promises).then(function () {
                            if ($scope.msg.isShowDeviceConnectedCnt === 0) {
                                $scope.msg.text = "没有设备在线，无法更改已部署域名规则。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                            if ($scope.msg.isShowDeviceUpgradingMsg) {
                                $scope.msg.text = "DPI设备升级中，请稍后再试。";
                                $scope.msg.qus = "";
                                $scope.msg.buttonText = '关闭';
                                $scope.msg.fontAwesomeText = '';
                            }
                        });
                    });
                });

                $scope.changeSelectedDeployed = function () {
                    setDoingStatus(dTable, true);

                    Signature.deployMaliciousDomains('inc', policyId, domains).then(function (data) {
                        var deferred = $q.defer();
                        var taskId = data.data.taskId;
                        $rootScope.deployTaskPromise = deferred.promise;
                        (function countdown(counter) {
                            var checkDeploy = $timeout(function () {
                                Task.getTask(taskId).then(function (data) {
                                    if (data.data.state === 'SUCCESS') {
                                        $rootScope.$broadcast('updateDashboardHeader');
                                        setDoingStatus(dTable, false);
                                        deferred.resolve('success');
                                        $timeout.cancel(checkDeploy);
                                        var table = dTable.table;
                                        for (var i = 0; i < table.length; i++) {
                                            if (table[i].checked) {
                                                table[i].action = action;
                                            }
                                        }
                                        $rootScope.addAlert({
                                            type: 'success',
                                            content: '更改已部署域名规则成功'
                                        });
                                    } else if (data.data.state === 'FAILED') {
                                        setDoingStatus(dTable, false);
                                        deferred.resolve('fail');
                                        $timeout.cancel(checkDeploy);
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: (data.data.reason ? ('更改已部署域名规则失败：' + data.data.reason) : '更改已部署域名规则失败')
                                        });
                                    } else if (counter > 0) {
                                        countdown(counter - 1);
                                    } else {
                                        setDoingStatus(dTable, false);
                                        deferred.resolve('timeout');
                                        $rootScope.addAlert({
                                            type: 'danger',
                                            content: '更改已部署域名规则超时'
                                        });
                                    }
                                });
                            }, 1000);
                        })(120);
                    }, function (data) {
                        setDoingStatus(dTable, false);
                        var conflict = data.status === 409;
                        $rootScope.addAlert({
                            type: 'danger',
                            content: (data.data.error ? ('更改已部署域名规则失败：' + data.data.error) : '更改已部署域名规则失败' + (conflict ? '， 正在部署中， 请稍后再试。' : ''))
                        });
                    });
                };

                $scope.ok = function () {
                    if ($scope.msg.isShowDeviceConnectedCnt === 0 || $scope.msg.isShowDeviceUpgradingMsg) {
                        $modalInstance.dismiss('cancel');
                    } else {
                        $scope.changeSelectedDeployed();
                        $modalInstance.close();
                    }
                };

                $scope.cancel = function () {
                    setDoingStatus(dTable, false);
                    $modalInstance.dismiss('cancel');
                };
            }
        };

    }

    function setDoingStatus(dtable, isdoing) {
        for (var index in dtable.table) {
            if (index) {
                if (isdoing && dtable.table[index].checked) {
                    dtable.table[index].isdoing = true;
                } else {
                    delete dtable.table[index].isdoing;
                }
            }
        }
    }

})();
