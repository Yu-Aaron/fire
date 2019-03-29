/**
 * Monitor Signatrue left side 4 tab: signatureTable Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.blacklist')
        .directive('blacklistSignatureTable', signatureTable);

    function signatureTable($stateParams, $modal, $rootScope, Device, Template, Signature, dataservice) {
        "ngInject";
        var signatureTableObj = {
            restrict: 'E',
            scope: false,
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/rule/blacklist/signature-table.html',
            //controller: controller,
            link: link
        };

        return signatureTableObj;

        //////////

        function link(scope, element, attr, ctrl) {
            //console.log(ctrl);

            var vm = ctrl;
            vm.table = [];
            vm.blockCount = 0;
            vm.selectedBlockCount = 0;
            vm.selectedSignatureCount = 0;
            vm.selectAll = false;
            vm.selectAllCheckBox = true;
            vm.selectAllSigs = false;
            vm.selectAllSigsText = '';
            vm.updateNumPerPage = function () {
                //getTableData();
            };
            vm.disableToolbar = true;

            vm.selectAllSignature = function () {
                vm.selectAllCheckBox = !vm.selectAllCheckBox;
                vm.selectAllSigs = !vm.selectAllSigs;
                vm.selectAllSigsText = vm.selectAllSigs ? '清除全部勾选' : '全选所有漏洞';
                vm.selectAll = vm.selectAllSigs;
                vm.selectedBlockCount = vm.selectAllSigs ? vm.totalNum : 0;
                for (var a = 0; a < vm.table.length; a++) {
                    vm.table[a].checked = vm.selectAllSigs;
                }
            };

            vm.selectAllSigsText = '全选所有漏洞';

            //console.log($scope.policyId());

            scope.$on('updateLeftSelectAllStatus', function () {
                if (!vm.selectAllSigs) {
                    vm.selectAll = false;
                }
            });

            var policyId = $stateParams.policyId;

            vm.typeSelected = "请选择";
            vm.valueChanged = function () {
                vm.typeSelected = "";
                for (var n in advancedSearchOptions[0].options) {
                    if (advancedSearchOptions[0].options[n].value === true) {
                        vm.typeSelected += advancedSearchOptions[0].options[n].name + ",";
                    }
                }

                if (vm.typeSelected === "") {
                    vm.typeSelected = "请选择";
                } else {
                    vm.typeSelected = vm.typeSelected.substring(0, vm.typeSelected.length - 1);
                }
            };


            angular.element('input.signature').bind('change', function (event) {
                var tmp = event.target.files[0];
                if (!tmp) {
                    return;
                }
                var file = tmp;
                vm.uploadSignature(file);
                this.value = null;
            });

            scope.$on('signatures', function () {
                var policyBlockIdList = [];
                for (var a = 0; a < vm.table.length; a++) {
                    if (vm.table[a].checked && !vm.table[a].deployed) {
                        //console.log(vm.table[a].policyBlockId);
                        policyBlockIdList.push(vm.table[a].policyBlockId);
                        //var policyBlockId = vm.table[a].policyBlockId;
                    }
                }
                if (vm.selectAllSigs) {
                    var payload = {
                        '$limit': 1000000,
                        '$orderby': 'priority,name'
                    };
                    Signature.getAll(policyId, 'NoDeploy', 'signature', getcategory(), getdesc(), getsid(), getsigname(), payload).then(function (data) {
                        policyBlockIdList = data.map(function (item) {
                            return item.policyBlockId;
                        });
                        console.log('unlock all signatures');
                        //$rootScope.unlockPromise = Signature.unlockAll(topologyId, policyId, dataservice.policyName, 'BLACKLIST').then(function (data) {
                        $rootScope.unlockPromise = Signature.unlock(policyId, dataservice.policyName, policyBlockIdList, 'BLACKLIST').then(function (data) {
                            console.log(data.data);
                            for (var a = 0; a < vm.table.length; a++) {
                                if (vm.table[a].checked && !vm.table[a].deployed) {
                                    vm.table[a].deployed = true;
                                }
                            }
                            $rootScope.$broadcast('refreshPreDeployTable', data.data);
                        });
                    });
                } else if (policyBlockIdList.length > 0 && !vm.selectAllSigs) {
                    $rootScope.unlockPromise = Signature.unlock(policyId, dataservice.policyName, policyBlockIdList, 'BLACKLIST').then(function (data) {
                        for (var a = 0; a < vm.table.length; a++) {
                            if (vm.table[a].checked && !vm.table[a].deployed) {
                                vm.table[a].deployed = true;
                            }
                        }
                        $rootScope.$broadcast('refreshPreDeployTable', data.data);
                    });
                }
            });

            vm.uploadSignature = function (file) {
                Signature.signatureIsValid(file, policyId)
                    .then(function (data) {
                        if (data.data.message === 'success') {
                            return Signature.uploadSignature(file, policyId);
                        } else {
                            var modalInstance = $modal.open({
                                templateUrl: '/templates/rule/blacklist/confirmUpload.html',
                                controller: function ($scope, $modalInstance) {
                                    $scope.ok = function () {
                                        $modalInstance.close('ok');
                                    };
                                    $scope.cancel = function () {
                                        $modalInstance.dismiss('cancel');
                                    };
                                },
                                backdrop: true,
                                size: 'sm'
                            });
                            return modalInstance.result.then(function () {
                                return Signature.uploadSignature(file, policyId);
                            }, function () {
                                console.log('cancel upload.');
                            });
                        }
                    })
                    .then(function (data) {
                        data = data.data;
                        ctrl.getTableData();
                        ctrl.getTableDataCount();
                        $rootScope.addAlert({
                            type: 'success',
                            content: ('上传成功' + (data.newSids.length > 0 ? (', 增加' + data.newSids.length + '条漏洞规则') : '') + (data.updatedSids.length > 0 ? (', 更新' + data.updatedSids.length + '条漏洞规则') : '') + (data.deletedSids && data.deletedSids.length > 0 ? (', 删除' + data.deletedSids.length + '条漏洞规则') : '') + (data.invalidSids.length > 0 ? (', ' + data.invalidSids.length + '条无效漏洞规则') : ''))
                        });
                    })
                    .catch(function (data) {
                        $rootScope.addAlert({
                            type: 'danger',
                            content: ('上传失败' + (data.error ? (': ' + data.error) : (data.data.message ? data.data.message : '')))
                        });
                    });

                // $rootScope.uploadSignaturePromise = Signature.uploadSignature(file, policyId)
                //     .then(function (data) {
                //         data = data.data;
                //         console.log(data);
                //         ctrl.getTableData();
                //         ctrl.getTableDataCount();
                //         $rootScope.addAlert({
                //             type: 'success',
                //             content: ('上传成功' + (data.newSids.length > 0 ? (', 增加' + data.newSids.length + '条漏洞规则') : '') + (data.updatedSids.length > 0 ? (', 更新' + data.updatedSids.length + '条漏洞规则') : '') + (data.deletedSids.length > 0 ? (', 删除' + data.deletedSids.length + '条漏洞规则') : '') + (data.invalidSids.length > 0 ? (', ' + data.invalidSids.length + '条无效漏洞规则') : ''))
                //         });
                //     }, function (data) {
                //         data = data.data;
                //         $rootScope.addAlert({
                //             type: 'danger',
                //             content: ('上传失败' + (data.error ? (': ' + data.error) : ''))
                //         });
                //     });
            };

            var ModalInstanceCtrl = function ($scope, $modalInstance, items, policyBlock) {
                //console.log(items);
                //console.log(policyBlock);

                if (policyBlock.type === 'SIGNATURE') {
                    policyBlock.signatures = items.data;
                } else {
                    policyBlock.rules = items.data;
                }
                //console.log(policyBlock);
                $scope.policyBlocks = policyBlock;

                $scope.changeAction = function (policy, action) {
                    console.log(policy);
                    //console.log(action);
                    //console.log(priority);
                    policy.action = action;
                    if (policyBlock.type === 'SIGNATURE') {
                        Template.changeAction(policyBlock.policyBlockId, policy.signatureId, action).then(function (data) {
                            console.log(data.data);
                        });
                    } else {
                        Signature.changeAction(policyBlock.policyBlockId, policy.ruleId, action).then(function (data) {
                            console.log(data.data);
                        });
                    }
                };


                $scope.ok = function () {
                    $modalInstance.close('ok');
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

            };
            vm.showDetail = function (policyBlock) {
                console.log(policyBlock);
                var modalInstance = $modal.open({
                    templateUrl: '/templates/rule/blacklist/policyContent-signature.html',
                    controller: ['$scope', '$modalInstance', 'items', 'policyBlock', ModalInstanceCtrl],
                    backdrop: true,
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return Signature.getSignaturesbyBlockId(policyBlock.policyBlockId);
                        },
                        policyBlock: function () {
                            return policyBlock;
                        }

                    }
                });

                modalInstance.result.then(function (msg) {
                    console.log(msg);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };

            vm.countSelected = function (signature) {
                //console.log(signature);
                if (signature.checked) {
                    vm.selectedBlockCount++;
                    vm.selectedSignatureCount += signature['_signaturesCount'];
                } else {
                    vm.selectedBlockCount--;
                    vm.selectedSignatureCount -= signature['_signaturesCount'];
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
                vm.selectedSignatureCount = 0;
                for (var a = 0; a < vm.table.length; a++) {
                    if (!vm.table[a].deployed) {
                        vm.table[a].checked = vm.selectAll;
                        if (vm.selectAll) {
                            vm.selectedBlockCount++;
                            vm.selectedSignatureCount += vm.table[a]['_signaturesCount'];
                        }
                    }
                }
            };

            $rootScope.$on('refreshSignatureTable', function () {
                ctrl.getTableData();
            });

            //getTableData();


            //function initializeData(blocks, callback) {
            //  //console.log(blocks);
            //  Signature.getPolicyBlockbyPolicyId(topologyId, policyId, 'ReadyDeploy').then(function(data){
            //    //console.log(data.data);
            //    vm.blockCount = 0;
            //    vm.selectedBlockCount = 0;
            //    vm.selectedSignatureCount = 0;
            //    vm.selectAll = false;
            //    for (var a =0; a <blocks.length; a++) {
            //      blocks[a].checked = false;
            //      vm.blockCount+=blocks[a]['_signaturesCount'];
            //      for (var b=0; b<data.data.length; b++){
            //        if(blocks[a].policyBlockId === data.data[b].sourceId){
            //          blocks[a].deployed = true;
            //        }
            //      }
            //    }
            //    if(callback){
            //      callback(blocks);
            //    }
            //  });
            //}

            //////////
            //function getTableData() {
            //  var payload = {
            //    offset: (vm.currentPage - 1) * vm.numPerPage,
            //    limit: vm.numPerPage
            //  };
            //
            //  if (vm.predicate) {
            //    payload.sorting = (!vm.reverse ? '+' : '-') + vm.predicate;
            //  }
            //
            //  Signature.getPolicyBlockbyPolicyId(topologyId, policyId, 'NoDeploy', 'signature').then(function (data) {
            //    initializeData(data.data,function(blocks){
            //      vm.table = blocks;
            //    });
            //    //console.log(data.data);
            //  });
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

            var advancedSearchOptions = [];

            advancedSearchOptions.push({
                'name': 'type',
                'display': '类型',
                'input': 'list_checkbox',
                'option': true,
                value: [],
                'options': [
                    {
                        name: "botnet",
                        value: "false"
                    }, {
                        name: "code_execution",
                        value: "false"
                    }, {
                        name: "dos",
                        value: "false"
                    }, {
                        name: "info_leak",
                        value: "false"
                    }, {
                        name: "misc_activity",
                        value: "false"
                    }, {
                        name: "overflow",
                        value: "false"
                    }, {
                        name: "scan",
                        value: "false"
                    }, {
                        name: "sql_injection",
                        value: "false"
                    }, {
                        name: "trojan",
                        value: "false"
                    }, {
                        name: "worm",
                        value: "false"
                    }, {
                        name: "xss",
                        value: "false"
                    }]
            });

            advancedSearchOptions.push({
                'name': 'description',
                'display': '描述',
                'input': 'string',
                'option': false,
                value: ""
            });
            advancedSearchOptions.push({}); //for layout
            advancedSearchOptions.push({
                'name': 'sid',
                'display': '特征编号',
                'input': 'string',
                'option': false,
                value: ""
            });
            advancedSearchOptions.push({
                'name': 'signame',
                'display': '特征名称',
                'input': 'string',
                'option': false,
                value: ""
            });
            var config = {
                name: 'signature',
                pagination: true,
                scrollable: false,
                totalCount: false,
                advancedSearch: {enable: true},
                getAll: getAll,
                getCount: getCount,
                search: search,
                fields: []
            };
            vm.disableSearch = true;

            vm.query = vm.isSearching = vm.advancedSearchQuery = "";
            angular.extend(config, {
                advancedSearchOptions: advancedSearchOptions
            });
            vm.setConfig(config);
            //console.log(ctrl);


            function getAll(params) {
                var payload = params || {};
                payload['$orderby'] = 'priority,name';

                if (payload.$filter) {
                    delete payload["$filter"];
                }

                return Signature.getAll(policyId, 'NoDeploy', 'signature', getcategory(), getdesc(), getsid(), getsigname(), payload);
            }

            function getcategory() {
                var where = "";
                if (vm.advancedSearch.enable) {
                    for (var n in advancedSearchOptions[0].options) {
                        if (advancedSearchOptions[0].options[n].value === true) {
                            where += advancedSearchOptions[0].options[n].name + ",";
                        }
                    }
                    where = where.substring(0, where.length - 1);
                }

                return where;
            }

            function getdesc() {
                var desc = "";
                if (vm.advancedSearch.enable) {
                    if (advancedSearchOptions[1].value.trim() !== "") {
                        desc = advancedSearchOptions[1].value;
                    }
                }
                return desc;
            }

            function getsid() {
                var sid = "";
                if (vm.advancedSearch.enable) {
                    if (advancedSearchOptions[3].value.trim() !== "") {
                        sid = advancedSearchOptions[3].value;
                    }
                }
                return sid;
            }

            function getsigname() {
                var signame = "";
                if (vm.advancedSearch.enable) {
                    if (advancedSearchOptions[4].value.trim() !== "") {
                        signame = advancedSearchOptions[4].value;
                    }
                }
                return signame;
            }

            function getCount(params) {
                var payload = params || {};
                if (payload.$filter) {
                    delete payload["$filter"];
                }

                return Signature.getCount(policyId, 'NoDeploy', 'signature', getcategory(), getdesc(), getsid(), getsigname(), payload);
            }

            function search(q) {
                return Device.getAll({
                    '$filter': filterFunc(q)
                });
            }
        }

    }
})();
