/**
 * Created by Morgan on 15-01-16.
 */

(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('ruleItemEdit', ruleItemEdit);

    function ruleItemEdit(Custom, Signature) {
        return function (scope, items) {
            var $scope = scope;
            $scope.enabledEditRuleItem = true;
            $scope.editRules = false;
            $scope.editRuleItem = false;
            $scope.currentTree = {};
            $scope.ruleItem = {};
            $scope.selectedRuleItems = [];
            $scope.policyBlocks.selectAll = false;


            $scope.createRuleItem = function () {
                $scope.editRules = true;
                $scope.currentTree = {};
                var payload = {
                    'currentValue': '[]'
                };

                Custom.getData(payload).then(function (data) {
                    console.log(data.data);
                    var json = data.data.nodeTree;
                    //console.log(json);

                    $scope.generateTree(json.nodes);

                });
            };


            $scope.confirmCreateRule = function () {
                $scope.editRules = false;
                $scope.editRuleItem = false;
                console.log($scope.currentTree);
                var rules = [];

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

                if (rules.length > 0) {
                    var ruleItem = {};
                    ruleItem.priority = $scope.policyBlocks.rules.length;
                    ruleItem.action = 'DROP';
                    ruleItem.fields = rules;
                    Custom.createRule($scope.policyBlocks.policyBlockId, ruleItem).then(function (data) {
                        data.data.checked = false;
                        $scope.policyBlocks.rules.push(data.data);
                        console.log($scope.policyBlocks);
                        $scope.policyBlocks['_rulesCount']++;
                        //ctrl.getTableData();
                        //ctrl.getTableDataCount();
                    });
                }
            };

            $scope.modifyRuleItem = function (ruleItemIndex, ruleItem) {
                console.log(angular.toJson(ruleItem));
                //console.log(angular.toJson(ruleItem.fields));

                $scope.editRules = true;
                $scope.editRuleItem = true;
                $scope.ruleItem = ruleItem;
                $scope.ruleItemIndex = ruleItemIndex;
                var payload = {
                    'currentValue': angular.toJson(ruleItem.fields)
                };

                Custom.getData(payload).then(function (data) {
                    console.log(data.data);
                    var json = data.data.nodeTree;
                    //console.log(json);
                    $scope.currentTree = json.nodes;
                    $scope.generateTree(json.nodes);

                });
            };


            $scope.confirmRuleEdit = function () {
                $scope.editRules = false;
                //console.log($scope.currentTree);
                var rules = [];

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

                Signature.changeFields($scope.policyBlocks.policyBlockId, $scope.ruleItem.ruleId, rules).then(function (data) {
                    console.log(data.data);
                    data.data.checked = $scope.policyBlocks.rules[$scope.ruleItemIndex].checked;
                    $scope.policyBlocks.rules[$scope.ruleItemIndex] = data.data;
                    $scope.editRuleItem = false;
                });
            };

            $scope.cancelRuleEdit = function () {
                $scope.editRules = false;

                $("#diagram", "*").empty();
            };

            $scope.selectRuleItem = function (ruleItem) {
                if (ruleItem.checked) {
                    $scope.selectedRuleItems.push(ruleItem.ruleId);
                    if ($scope.selectedRuleItems.length === $scope.policyBlocks.rules.length) {
                        $scope.policyBlocks.selectAll = true;
                    }
                    //console.log($scope.selectedRuleItems);
                } else {
                    $scope.selectedRuleItems = _.without($scope.selectedRuleItems, ruleItem.ruleId);
                    $scope.policyBlocks.selectAll = false;
                    //console.log($scope.selectedRuleItems);
                }
            };

            $scope.selectAllRuleItem = function () {
                $scope.selectedRuleItems = [];
                $scope.policyBlocks.rules.forEach(function (rule) {
                    rule.checked = $scope.policyBlocks.selectAll;
                    if ($scope.policyBlocks.selectAll) {
                        $scope.selectedRuleItems.push(rule.ruleId);
                    }
                });
            };

            $scope.deleteRuleItems = function () {
                Custom.deleteRule($scope.selectedRuleItems).then(function (data) {
                    console.log(data.data);
                    $scope.selectedRuleItems.forEach(function (id) {
                        var index = _.findIndex($scope.policyBlocks.rules, {'ruleId': id});
                        $scope.policyBlocks.rules.splice(index, 1);
                        $scope.policyBlocks['_rulesCount']--;
                        $scope.selectedRuleItems = _.without($scope.selectedRuleItems, id);
                        $scope.policyBlocks.selectAll = false;
                        if($scope.rulePagination) {
                            $scope.rulePagination.totalNum -= 1;
                            $scope.rulePagination.numPages = Math.ceil($scope.rulePagination.totalNum / $scope.rulePagination.numPerPage);
                            if($scope.policyBlocks.rules.length === 0 && $scope.rulePagination.currentPage === $scope.rulePagination.numPages) {
                                $scope.rulePagination.currentPage -= 1;
                            }
                        }
                        if(_.isObject(items) && _.isArray(items.data)) {
                            items.data.splice(_.findIndex(items.data, {'ruleId': id}), 1);
                            if(_.isFunction($scope.pageChanged)) {
                                $scope.pageChanged();
                            }
                        }
                    });
                });
            };

            $scope.moveUp = function () {
                var selectedRuleItemId = $scope.selectedRuleItems[0];
                var index = _.findIndex($scope.policyBlocks.rules, {'ruleId': selectedRuleItemId});

                if (index === 0) {
                    return;
                } else {
                    var currentOrder = $scope.policyBlocks.rules[index].priority;
                    var targetOrder = $scope.policyBlocks.rules[index - 1].priority;
                    var param = {};
                    param.ruleId = selectedRuleItemId;
                    param.currentOrder = currentOrder;
                    param.targetOrder = targetOrder;
                    Custom.changePriority($scope.policyBlocks.policyBlockId, param).then(function (data) {
                        console.log(data.data);
                        $scope.policyBlocks.rules = data.data;
                        $scope.policyBlocks.rules.forEach(function (ruleItem) {
                            if (ruleItem.ruleId === $scope.selectedRuleItems[0]) {
                                ruleItem.checked = true;
                            } else {
                                ruleItem.checked = false;
                            }
                        });
                    });
                }

                //var targetOrder = currentOrder -1 <0 ? 0 : currentOrder -1;
                //if(currentOrder >= 0 && currentOrder!==targetOrder){
                //    var param = {};
                //    param.ruleId = selectedRuleItemId;
                //    param.currentOrder = currentOrder;
                //    param.targetOrder = targetOrder;
                //    Custom.changePriority($scope.policyBlocks.policyBlockId, param).then(function(data){
                //        console.log(data.data);
                //        $scope.policyBlocks.rules = data.data;
                //        $scope.policyBlocks.rules.forEach(function(ruleItem){
                //            if(ruleItem.ruleId === $scope.selectedRuleItems[0]) {
                //              ruleItem.checked = true;
                //            } else {
                //              ruleItem.checked = false;
                //            }
                //        });
                //    });
                //}
            };

            $scope.moveDown = function () {
                var selectedRuleItemId = $scope.selectedRuleItems[0];
                var index = _.findIndex($scope.policyBlocks.rules, {'ruleId': selectedRuleItemId});

                if (index === $scope.policyBlocks.rules.length - 1) {
                    return;
                } else {
                    var currentOrder = $scope.policyBlocks.rules[index].priority;
                    var targetOrder = $scope.policyBlocks.rules[index + 1].priority;
                    var param = {};
                    param.ruleId = selectedRuleItemId;
                    param.currentOrder = currentOrder;
                    param.targetOrder = targetOrder;
                    Custom.changePriority($scope.policyBlocks.policyBlockId, param).then(function (data) {
                        console.log(data.data);
                        $scope.policyBlocks.rules = data.data;
                        $scope.policyBlocks.rules.forEach(function (ruleItem) {
                            if (ruleItem.ruleId === $scope.selectedRuleItems[0]) {
                                ruleItem.checked = true;
                            } else {
                                ruleItem.checked = false;
                            }
                        });
                    });

                }

                //var targetOrder = currentOrder  + 1 < $scope.policyBlocks.rules.length ? currentOrder  + 1 : currentOrder;
                //if(currentOrder >= 0 && currentOrder!==targetOrder){
                //  var param = {};
                //  param.ruleId = selectedRuleItemId;
                //  param.currentOrder = currentOrder;
                //  param.targetOrder = targetOrder;
                //  Custom.changePriority($scope.policyBlocks.policyBlockId, param).then(function(data){
                //      console.log(data.data);
                //      $scope.policyBlocks.rules = data.data;
                //      $scope.policyBlocks.rules.forEach(function(ruleItem){
                //          if(ruleItem.ruleId === $scope.selectedRuleItems[0]) {
                //              ruleItem.checked = true;
                //          } else {
                //              ruleItem.checked = false;
                //          }
                //      });
                //  });
                //}
            };

        };
    }
})();
