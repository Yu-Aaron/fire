/**
 * Monitor Signatrue left side 4 tab: customTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        .directive('customTable', customTable);

    function customTable($modal, Custom, $stateParams, DeviceAsset, Signature, Template, $q, $rootScope, dataservice, $state, WhiteListService) {
        "ngInject";// jshint ignore:line
        var customTableObj = {
            restrict: 'E',
            scope: false,
            templateUrl: '/templates/rule/whitelist/custom-table.html',
            require: '^dtable',
            link: link
        };

        return customTableObj;

        //////////

        function link(scope, element, attrs, ctrl) {
            ctrl.protocolType = 'WHITELIST';

            scope.getDateTime = function (s) {
                var d = new Date(s);
                return d.toLocaleString('en-GB');
            };
            ctrl.disableToolbar = true;
            ctrl.disableSearch = true;
            var vm = ctrl;
            vm.table = [];
            vm.blockCount = 0;
            vm.selectedBlockCount = 0;
            vm.selectedRuleCount = 0;
            scope.$on('updateLeftSelectAllStatus', function () {
                if(!vm.selectAllSigs){
                    vm.selectAll = false;
                }
            });
            vm.countSelected = function (signature) {
                if (signature.checked) {
                    vm.selectedBlockCount++;
                    vm.selectedRuleCount += signature['_rulesCount'];
                } else {
                    vm.selectedBlockCount--;
                    vm.selectedRuleCount -= signature['_rulesCount'];
                }
                var canSelectedCount = 0, selectedCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        canSelectedCount++;
                        if (vm.table[a].checked) {
                            selectedCount++;
                        }
                    }
                }
                var hasSelected = selectedCount > 0;
                var selectedAll = selectedCount === canSelectedCount;
                vm.selectAll = hasSelected ? (selectedAll ? true : null) : false;
            };

            vm.toggle = function () {
                vm.selectedBlockCount = 0;
                vm.selectedRuleCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        vm.table[a].checked = vm.selectAll;
                        if (vm.selectAll) {
                            vm.selectedBlockCount++;
                            vm.selectedRuleCount += vm.table[a]['_rulesCount'];
                        }
                    }
                }
            };


            scope.$on('customs', function () {
                var policyBlockIdList = [];
                for (var a = 0; a < vm.table.length; a++) {
                    if (vm.table[a].checked && !vm.table[a].deployed) {
                        policyBlockIdList.push(vm.table[a].policyBlockId);
                    }
                }
                if (policyBlockIdList.length > 0) {
                    $rootScope.unlockPromise = Template.unlock(policyId, dataservice.policyName, policyBlockIdList, ctrl.protocolType).then(function (data) {
                        for (var a = 0; a < vm.table.length; a++) {
                            if (vm.table[a].checked && !vm.table[a].deployed) {
                                vm.table[a].deployed = true;
                            }
                        }
                        $rootScope.$broadcast('refreshPreDeployTable', data.data);
                    });
                }
            });

            $rootScope.$on('refreshLeftTable', function () {
                ctrl.getTableData();
            });

            var policyId = $stateParams.policyId;

            function ModalInstanceCtrl($scope, $modalInstance, tree, state) {
                "ngInject";// jshint ignore:line
                if (state.indexOf('whitelist') !== -1) {
                    $scope.tab = 'whitelist';
                } else {
                    $scope.tab = 'networklist';
                }
                $scope.editRules = false;
                $scope.editRuleItem = false;
                $scope.ruleItems = [];
                $scope.currentTree = {};
                $scope.selectedRuleItems = [];


                $scope.customPolicyBlock = {};
                $scope.customPolicyBlock.name = '';
                $scope.customPolicyBlock.sourceZoneName = '';
                $scope.customPolicyBlock.destinationZoneName = '';
                $scope.customPolicyBlock.descirption = '';
                $scope.customPolicyBlock.timeStamp = new Date();
                $scope.customPolicyBlock.type = 'CUSTOM';
                //$scope.customPolicyBlock.topology = '当前没有应用的拓扑';
                $scope.customPolicyBlock.ruleItems = $scope.ruleItems;
                $scope.customPolicyBlock.selectAll = false;
                $scope.securityZones = [];
                $scope.zones = [];
                $scope.ruleList = [{
                    sourceIp: {value: '', option: false, placeHolder: '任意'},
                    desIp: {value: '', option: false, placeHolder: '任意'},
                    sourcePort: {value: '', option: false, placeHolder: '任意'},
                    desPort: {value: '', option: false, placeHolder: '任意'}
                }];

 /*               Topology.getTopo(topologyId.id, $rootScope.currentIp).then(function (data) {
                    $scope.customPolicyBlock.topology = data.name;
                });

                Topology.getZones($rootScope.currentIp, topologyId.id).then(function (data) {
                    $scope.zones = data.data;
                });
*/
                DeviceAsset.getSecurityAreaNames().then(function (data) {
                    $scope.securityZones = data;
                    // $scope.zones = data;
                });

                tree($scope);

                $scope.createRuleItem = function () {
                    $scope.editRules = true;
                    $scope.currentTree = {};
                    var payload = {
                        'currentValue': '[]'
                    };

                    Custom.getData(payload).then(function (data) {
                        var json = data.data.nodeTree;

                        $scope.generateTree(json.nodes);

                    });
                };


                $scope.confirmCreateRule = function () {
                    $scope.ruleList = [{
                        sourceIp: {value: '', option: false, placeHolder: '任意'},
                        desIp: {value: '', option: false, placeHolder: '任意'},
                        sourcePort: {value: '', option: false, placeHolder: '任意'},
                        desPort: {value: '', option: false, placeHolder: '任意'}
                    }];
                    $scope.editRules = false;
                    var rules = [];
                    if ($scope.tab === 'networklist') {
                        var tmp = $scope.ruleList[0];
                        rules.push({name: '协议名称', value: tmp.protocol});
                        rules.push({name: '起源IP', value: tmp.sourceIp.value});
                        rules.push({name: '目标IP', value: tmp.desIp.value});
                        rules.push({name: '起源端口', value: tmp.sourcePort.value});
                        rules.push({name: '目标端口', value: tmp.desPort.value});
                    } else {
                        for (var node in $scope.currentTree) {
                            if ($scope.currentTree[node]) {
                                if (!$scope.currentTree[node].active) {
                                    var rule = {};
                                    rule.name = $scope.currentTree[node].nodeDisplayName;
                                    rule.value = $scope.currentTree[node].nodeDisplayValue;

                                    rules.push(rule);
                                }
                            }
                        }
                    }
                    if (rules.length > 0) {
                        $scope.ruleItems.push({
                            'fields': rules,
                            'action': 'DROP',
                            'checked': false,
                            'riskLevel': 'LOW'
                        });
                    }
                    $scope.editRuleItem = false;
                };

                $scope.modifyRuleItem = function (ruleItemIndex, ruleItem) {

                    $scope.ruleItemIndex = ruleItemIndex;
                    $scope.editRules = true;
                    $scope.editRuleItem = true;
                    var payload = {
                        'currentValue': angular.toJson(ruleItem.fields)
                    };

                    Custom.getData(payload).then(function (data) {
                        var json = data.data.nodeTree;
                        $scope.currentTree = json.nodes;
                        $scope.generateTree(json.nodes);

                    });
                };


                $scope.confirmRuleEdit = function () {
                    $scope.editRules = false;
                    var rules = [];
                    if ($scope.tab === 'networklist') {
                        var tmp = $scope.ruleList[0];
                        rules.push({name: '协议名称', value: tmp.protocol});
                        rules.push({name: '起源IP', value: tmp.sourceIp.value});
                        rules.push({name: '目标IP', value: tmp.desIp.value});
                        rules.push({name: '起源端口', value: tmp.sourcePort.value});
                        rules.push({name: '目标端口', value: tmp.desPort.value});
                    } else {
                        for (var node in $scope.currentTree) {
                            if ($scope.currentTree[node]) {
                                if (!$scope.currentTree[node].active) {
                                    var rule = {};
                                    rule.name = $scope.currentTree[node].nodeDisplayName;
                                    rule.value = $scope.currentTree[node].nodeDisplayValue;
                                    rules.push(rule);
                                }
                            }
                        }
                    }
                    $scope.ruleItems[$scope.ruleItemIndex].fields = rules;
                    $scope.editRuleItem = false;
                };

                $scope.cancelRuleEdit = function () {
                    $scope.editRules = false;

                    $("#diagram", "*").empty();
                };

                $scope.selectRuleItem = function (ruleItem, index) {
                    if (ruleItem.checked) {
                        $scope.selectedRuleItems.push(index);
                        if ($scope.selectedRuleItems.length === $scope.ruleItems.length) {
                            $scope.customPolicyBlock.selectAll = true;
                        }
                    } else {
                        $scope.selectedRuleItems = _.without($scope.selectedRuleItems, index);
                        $scope.customPolicyBlock.selectAll = false;
                    }
                };

                $scope.selectAllRuleItem = function () {
                    $scope.selectedRuleItems = [];
                    $scope.ruleItems.forEach(function (rule, index) {
                        rule.checked = $scope.customPolicyBlock.selectAll;
                        if ($scope.customPolicyBlock.selectAll) {
                            $scope.selectedRuleItems.push(index);
                        }
                    });
                };

                $scope.moveUp = function () {
                    var originIndex = $scope.selectedRuleItems[0];
                    if (originIndex === 0) {
                        return;
                    } else {
                        var targetIndex = originIndex - 1;
                        var temp = $scope.ruleItems[originIndex];
                        $scope.ruleItems[originIndex] = $scope.ruleItems[targetIndex];
                        $scope.ruleItems[targetIndex] = temp;
                        $scope.selectedRuleItems[0] = targetIndex;
                    }
                };

                $scope.moveDown = function () {
                    var originIndex = $scope.selectedRuleItems[0];
                    if (originIndex === $scope.ruleItems.length - 1) {
                        return;
                    } else {
                        var targetIndex = originIndex + 1;
                        var temp = $scope.ruleItems[originIndex];
                        $scope.ruleItems[originIndex] = $scope.ruleItems[targetIndex];
                        $scope.ruleItems[targetIndex] = temp;
                        $scope.selectedRuleItems[0] = targetIndex;
                    }
                };

                $scope.deleteRuleItems = function () {
                    $scope.selectedRuleItems.forEach(function (index) {
                        delete $scope.ruleItems[index];
                        $scope.selectedRuleItems = _.without($scope.selectedRuleItems, index);
                    });
                    $scope.ruleItems = _.without($scope.ruleItems, undefined);
                    $scope.customPolicyBlock.selectAll = false;
                };

                $scope.changeAction = function (ruleItem, action) {
                    ruleItem.action = action;
                };

                $scope.changeRiskLevel = function (rule, lv) {
                    rule.riskLevel = lv;
                };

                $scope.ok = function () {
                    $modalInstance.close($scope.customPolicyBlock);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            /* function CustomIpModalCtrl($scope, $modalInstance, formatVal) {
                $scope.rule = {
                    sourceIp: '',
                    desIp: '',
                    sourcePort: {value: '', option: false, placeHolder: '任意'},
                    desPort: {value: '', option: false, placeHolder: '任意'},
                    action: 'DROP',
                    riskLevel: 'LOW',
                    protocolType: 'TCP'
                };

                $scope.ok = function () {
                    $modalInstance.close($scope.rule);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.getRuleAction = function (action) {
                    var lst = {
                        DENY: '阻断',
                        ALERT: '警告',
                        ALLOW: '允许'
                    };
                    return lst[action];
                };

                $scope.validateSourceIp = function (ip) {
                    if (formatVal.validateIp(ip) && formatVal.subnetValidation(ip)) {
                        $scope.sourceIpError = true;
                    } else {
                        $scope.sourceIpError = false;
                    }
                };

                $scope.validateDesIp = function (ip) {
                    if (formatVal.validateIp(ip) && formatVal.subnetValidation(ip)) {
                        $scope.desIpError = true;
                    } else {
                        $scope.desIpError = false;
                    }
                };
                $scope.sourcePortError = false;
                $scope.desPortError = false;
                $scope.validatePort = function (port, key) {
                    if (!formatVal.checkPortInput(port)) {
                        $scope[key] = true;
                    } else {
                        $scope[key] = false;
                    }
                };

                $scope.getRuleRiskLevel = function (idx) {
                    var lst = {
                        LOW: '低',
                        MEDIUM: '中',
                        HIGH: '高'
                    };
                    return lst[idx];
                };

                $scope.optionSelected = function (event, ip) {
                    if (ip.option) {
                        ip.placeHolder = '';
                    } else {
                        ip.value = '';
                        ip.placeHolder = '任意';
                    }
                };
            }*/

            ctrl.createCustomRules = function (current_state) {
                var protocolType = '';
                var templateUrl = '';
                var controller = ModalInstanceCtrl;
                //if (current_state.indexOf('whitelist_manager') !== -1) {
                    protocolType = 'WHITELIST';
                    templateUrl = '/templates/rule/whitelist/custom-rule-editor.html';
                //} else {
                //    protocolType = 'IP_RULE';
                //    templateUrl = '/templates/rule/whitelist/custom-ip-rule-editor.html';
                //    controller = CustomIpModalCtrl;
                //}
                var modalInstance = $modal.open({
                    templateUrl: templateUrl,
                    controller: controller,
                    size: 'lg',
                    resolve: {
                        state: function () {
                            return current_state;
                        }
                    }
                });
                //if (current_state.indexOf('whitelist_manager') !== -1) {
                    modalInstance.result.then(function (customPolicyBlock) {
                        var policyBlock = {};
                        policyBlock.name = customPolicyBlock.name;
                        policyBlock._sourceZoneName = customPolicyBlock.sourceZoneName;
                        policyBlock._destinationZoneName = customPolicyBlock.destinationZoneName;
                        policyBlock.description = customPolicyBlock.description;

                        Custom.createPolicyBlock(policyId, policyBlock, protocolType).then(function (data) {
                            var policyBlockId = data.data.policyBlockId;
                            if (customPolicyBlock.ruleItems.length) {
                                var promises = [];
                                customPolicyBlock.ruleItems.forEach(function (ruleItem, index) {
                                    var rule = {};
                                    rule.priority = index;
                                    rule.action = ruleItem.action;
                                    rule.riskLevel = ruleItem.riskLevel;
                                    rule.fields = angular.copy(ruleItem.fields);
                                    promises.push(Custom.createRule(policyBlockId, rule));
                                });

                                $q.all(promises).then(function () {
                                    ctrl.getTableData();
                                    ctrl.getTableDataCount();
                                });

                            } else {
                                ctrl.getTableData();
                                ctrl.getTableDataCount();
                            }

                        });

                    }, function () {
                        console.log('Modal dismissed at: ' + new Date());
                    });
             /*   } else {
                    modalInstance.result.then(function (rule) {
                        var policyBlock = {};
                        policyBlock.name = '规则 ' + rule.sourceIp + ' 到 ' + rule.desIp;
                        policyBlock._sourceZoneName = rule.sourceIp;
                        policyBlock._destinationZoneName = rule.desIp;
                        Custom.createPolicyBlock(policyId, policyBlock, 'IP_RULE').then(function (data) {
                            var policyBlockId = data.data.policyBlockId;
                            var obj = {};
                            obj.priority = 0;
                            obj.action = rule.action;
                            obj.riskLevel = rule.riskLevel;
                            obj.fields = [{name: '协议', value: rule.protocolType.toLowerCase()}, {
                                name: 'sourcePort',
                                value: rule.sourcePort.value
                            }, {name: 'destinationPort', value: rule.desPort.value}];
                            Custom.createRule(policyBlockId, obj).then(function () {
                                ctrl.getTableData();
                                ctrl.getTableDataCount();
                            });
                        });
                    });
                }*/
            };


            function ModalInstanceCtrl2($scope, $modalInstance, items, policyBlock, tree, ruleItemEdit) {
                "ngInject";// jshint ignore:line
                var policyBlockId = policyBlock.policyBlockId;
                $scope.enableEdit = true;
                $scope.rulePagination = {
                    currentPage : 1,
                    numPerPage : 5,
                    totalNum : 0
                };
                $scope.rulePagination.totalNum = items.data.length;
                $scope.rulePagination.numPages = parseInt($scope.rulePagination.totalNum/$scope.rulePagination.numPerPage);
                if (policyBlock.type === 'SIGNATURE') {
                    policyBlock.signatures = items.data;
                } else {
                    policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                        $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                    policyBlock.rules.forEach(function (rule) {
                        rule.checked = false;
                    });
                }
                $scope.policyBlocks = policyBlock;
                tree($scope);
                ruleItemEdit($scope, items);

                $scope.changeAction = function (policy, action) {
                    policy.action = action;
                    if (policyBlock.type === 'SIGNATURE') {
                        Template.changeAction(policyBlockId, policy.signatureId, action).then(function () {
                        });
                    } else {
                        Signature.changeAction(policyBlockId, policy.ruleId, action).then(function () {
                        });
                    }
                };

                $scope.pageChanged = function () {
                    policyBlock.rules = items.data.slice(($scope.rulePagination.currentPage - 1) * $scope.rulePagination.numPerPage,
                        $scope.rulePagination.currentPage * $scope.rulePagination.numPerPage);
                    policyBlock.rules.forEach(function (rule) {
                        rule.checked = false;
                    });
                };

                $scope.changeRiskLevel = function (rule, lv) {
                    rule.riskLevel = lv;
                    Signature.changeRuleRiskLevel(rule.ruleId, rule.riskLevel).then(function (data) {
                        console.log(data);
                    });
                };

                $scope.ok = function () {
                    $modalInstance.close('ok');
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }

            vm.showDetail = function (policyBlock) {
                var templateUrl = '/templates/rule/whitelist/policyContent.html';
                var ctrl = ModalInstanceCtrl2;
                if ($state.current.name.indexOf('networklist') !== -1) {
                    templateUrl = '/templates/rule/whitelist/ip-rule-policy-content.html';
                    ctrl = WhiteListService.showIpRuleDetailCtrl;
                }
                var modalInstance2 = $modal.open({
                    templateUrl: templateUrl,
                    controller: ctrl,
                    size: 'lg',
                    backdrop:true,
                    resolve: {
                        items: function () {
                            return Signature.getRulesbyBlockId(policyBlock.policyBlockId);
                        },
                        policyBlock: function () {
                            return policyBlock;
                        },
                        policy: function () {
                            return Signature.getPolicyByPolicyId(policyId);
                        }
                    }
                });


                modalInstance2.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };


            //getTableData();
            //
            //function getTableData() {
            //
            //  var payload = {
            //    offset: (vm.currentPage - 1) * vm.numPerPage,
            //    limit: vm.numPerPage
            //  };
            //
            //  if (vm.predicate) {
            //    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
            //  }
            //}

            var filterFunc = function (q) {
                var fields = ['name',
                    'make',
                    'modelIdentifier',
                    'serialNumber',
                    '_zoneNames',
                    'devicePorts',
                    'portsNumber',
                    'protectedDevicesNumber'
                ];

                return fields.map(function (field) {
                    return "contains(" + field + ", '" + q + "')";
                }).join(' or ');
            };
            ctrl.setConfig({
                name: 'custom',
                pagination: true,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
                predicate: 'updatedAt',
                reverse: true,
                search: search
            });

            function getAll(params) {
                var payload = params || {};
                return Custom.getAll(policyId, 'NoDeploy', 'custom', payload, ctrl.protocolType);
            }

            function getCount(params) {
                var payload = params || {};
                return Custom.getCount(policyId, 'NoDeploy', 'custom', payload, ctrl.protocolType);
            }

            function search(q) {
                return Custom.getAll({
                    '$filter': filterFunc(q)
                });
            }


        }
    }
})();
