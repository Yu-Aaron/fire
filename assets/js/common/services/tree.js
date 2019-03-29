/**
 * Created by Morgan on 15-01-15.
 */

(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('tree', tree);

    function tree($compile, Custom, formatVal) {
        return function (scope) {
            var $scope = scope;

            $scope.setSelectedItem = function (arrayIndex, optionName) {
                //console.log(optionName);
                //console.log(arrayIndex);
                //console.log($scope.array);
                //console.log($scope.array[arrayIndex].value);

                if (_.contains($scope.array[arrayIndex].value, optionName)) {
                    $scope.array[arrayIndex].value = _.without($scope.array[arrayIndex].value, optionName);
                    $scope.customValueIndex ? $scope.customValueIndex-- : 0;
                    if ($scope.array[arrayIndex].value.length === 0) {
                        $scope.array[arrayIndex].value.push('请选择');
                    }
                    $scope.array[arrayIndex].selectAll = false;
                } else {
                    $scope.array[arrayIndex].value = _.without($scope.array[arrayIndex].value, '请选择');
                    $scope.array[arrayIndex].value.push(optionName);
                    if ($scope.array[arrayIndex].value.length === $scope.array[arrayIndex].options.length) {
                        $scope.array[arrayIndex].selectAll = true;
                    }
                }
            };

            $scope.selectAll = function (arrayIndex) {
                _.forEach($scope.array[arrayIndex].options, function (option) {
                    option.checked = $scope.array[arrayIndex].selectAll;
                    if ($scope.array[arrayIndex].selectAll) {
                        $scope.array[arrayIndex].value = _.without($scope.array[arrayIndex].value, '请选择');
                        if (!_.contains($scope.array[arrayIndex].value, option.name)) {
                            $scope.array[arrayIndex].value.push(option.name);
                        }
                    }
                });

                if (!$scope.array[arrayIndex].selectAll) {
                    if ($scope.customValueIndex >= 0) {
                        var customValue = $scope.array[arrayIndex].value[$scope.customValueIndex];
                        console.log(customValue);
                        $scope.array[arrayIndex].value = [];
                        $scope.array[arrayIndex].value.push(customValue);
                        $scope.customValueIndex = 0;
                    } else {
                        $scope.array[arrayIndex].value = [];
                        $scope.array[arrayIndex].value.push('请选择');
                    }
                }

            };

            $scope.useCustomValue = function (arrayIndex) {
                console.log($scope.customValueIndex);

                if ($scope.array[arrayIndex].custom.enableCustomValue) {
                    $scope.array[arrayIndex].value = _.without($scope.array[arrayIndex].value, '请选择');
                    $scope.customValueIndex = $scope.array[arrayIndex].value.length;
                    $scope.array[arrayIndex].value[$scope.customValueIndex] = $scope.array[arrayIndex].custom.customValue === '' ? '自定义' : $scope.array[arrayIndex].custom.customValue;
                    $scope.updateCustomValue(arrayIndex);

                } else {
                    $scope.array[arrayIndex].value.splice($scope.customValueIndex, 1);
                    if ($scope.array[arrayIndex].value.length === 0) {
                        $scope.array[arrayIndex].value.push('请选择');
                    }
                    $scope.array[arrayIndex].custom.showBracket = false;
                }
            };

            $scope.changeProtocol = function (arrayIndex, protocol) {
                $scope.array[arrayIndex].value = [];
                $scope.array[arrayIndex].value.push(protocol);
            };

            $scope.updateCustomValue = function (arrayIndex) {
                //console.log($scope.array[arrayIndex].custom.customValue);
                var hasSquareBracket = false;
                if ($scope.array[arrayIndex].name === "fifo地址" || $scope.array[arrayIndex].name === "起始地址" || $scope.array[arrayIndex].name === "终止地址") {
                    $scope.array[arrayIndex].custom.invalid = formatVal.validateFifoAddr($scope.array[arrayIndex].custom.customValue);
                }

                if ($scope.array[arrayIndex].custom.customValue.toString().indexOf('[') !== -1 || $scope.array[arrayIndex].custom.customValue.toString().indexOf(']') !== -1) {
                    hasSquareBracket = true;
                }

                $scope.array[arrayIndex].value[$scope.customValueIndex] = $scope.array[arrayIndex].custom.customValue === '' ? '自定义' : $scope.array[arrayIndex].custom.customValue;
                if ($scope.array[arrayIndex].custom.customValue.toString().split(',').length > 1 && !hasSquareBracket) {
                    $scope.array[arrayIndex].custom.showBracket = true;
                } else {
                    $scope.array[arrayIndex].custom.showBracket = false;
                }

            };

            $scope.confirmPreviousChange = function (arrayIndex) {
                //console.log(arrayIndex);
                var childrenIdsArray = [];

                function getChildrenIdsArray(arrayIndex) {
                    if ($scope.array[arrayIndex].childrenIds) {
                        $scope.array[arrayIndex].childrenIds.forEach(function (id) {
                            childrenIdsArray.push(id);
                            return getChildrenIdsArray(id);
                        });
                    }

                }

                getChildrenIdsArray(arrayIndex);

                //console.log(childrenIdsArray);

                for (var a = childrenIdsArray.length - 1; a >= 0; a--) {
                    $scope.array.splice(childrenIdsArray[a]);
                }

                $scope.redraw();
            };

            $scope.cancelPreivousChange = function () {
                angular.copy($scope.arrayCopy, $scope.array);
                $scope.editPreviousItem = false;
            };

            $scope.showOptions = function (arrayIndex) {
                angular.copy($scope.arrayCopy, $scope.array);

                var customValueArray = [];
                var selectedValueArray = [];
                angular.copy($scope.array[arrayIndex].value, customValueArray);

                var previousArray = [];
                angular.copy($scope.array, previousArray);

                _.forEach($scope.array, function (item) {
                    item.showOption = false;
                });

                var rules = [];

                if (arrayIndex === 0) {
                    rules = [];
                } else {
                    previousArray[arrayIndex].value = [];
                    for (var a = 0; a < previousArray.length; a++) {
                        var rule = {};
                        rule.name = previousArray[a].name;

                        previousArray[a].value = _.without(previousArray[a].value, '请选择');
                        previousArray[a].value = _.without(previousArray[a].value, '自定义');

                        if (previousArray[a].value.length > 0) {
                            rule.value = previousArray[a].value.toString();
                            rules.push(rule);
                        }
                    }
                }

                var payload = {
                    'currentValue': JSON.stringify(rules)
                };

                Custom.getData(payload).then(function (data) {
                    var json = data.data.nodeTree;
                    var name = arrayIndex;
                    //console.log(name);

                    var options = json.nodes[name].nodeDisplayValue.split(',');
                    options = _.without(options, 'NONSTANDARD');
                    options = _.without(options, '所有协议');

                    $scope.array[arrayIndex].options = [];

                    for (var a = 0; a < options.length; a++) {
                        if (_.contains($scope.array[arrayIndex].value, options[a])) {
                            console.log(options[a]);
                            $scope.array[arrayIndex].options.push({
                                name: options[a],
                                checked: true
                            });
                            selectedValueArray.push(options[a]);
                            customValueArray = _.without(customValueArray, options[a]);
                        } else {
                            $scope.array[arrayIndex].options.push({
                                name: options[a],
                                checked: false
                            });
                        }
                    }

                    angular.copy(selectedValueArray, $scope.array[arrayIndex].value);
                    if (customValueArray.length > 0) {
                        $scope.customValueIndex = $scope.array[arrayIndex].value.length;
                        $scope.array[arrayIndex].value[$scope.customValueIndex] = customValueArray.toString();
                    }


                    if (_.isEqual(options, selectedValueArray)) {
                        $scope.array[arrayIndex].selectAll = true;
                    } else {
                        $scope.array[arrayIndex].selectAll = false;
                    }

                    if (customValueArray.length > 0) {
                        $scope.array[arrayIndex].custom = {
                            'enableCustomValue': true,
                            'customValue': customValueArray.toString(),
                            'showBracket': false
                        };

                        var hasSquareBracket = false;

                        if (customValueArray.toString().indexOf('[') !== -1 || customValueArray.toString().indexOf(']') !== -1) {
                            hasSquareBracket = true;
                        }
                        if (customValueArray.length > 1 && !hasSquareBracket) {
                            $scope.array[arrayIndex].custom.showBracket = true;
                        }
                    } else {
                        $scope.array[arrayIndex].custom = {
                            'enableCustomValue': false,
                            'customValue': '',
                            'showBracket': false
                        };
                    }

                    $scope.editPreviousItem = true;

                });

            };

            function encodeStr(rawStr) {
                if (typeof rawStr !== 'string') {
                    return rawStr;
                }
                return rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                    return '&#' + i.charCodeAt(0) + ';';
                });
            }

            $scope.generateTree = function (nodes) {
                $("#diagram", "*").empty();
                var ul = $("#diagram");

                $scope.canCreateRule = true;
                $scope.canEditRule = true;
                var modbusStartValueChanged = false;
                var modbusEndValueChanged = false;
                if ((nodes[0].nodeDisplayValue === "modbus") && nodes[2] !== undefined && (!nodes[2].active) && nodes[3] !== undefined && (!nodes[3].active)) {
                    var start = parseInt(nodes[2].nodeDisplayValue);
                    var end = parseInt(nodes[3].nodeDisplayValue);
                    if (start > end) {
                        $scope.canCreateRule = false;
                        $scope.canEditRule = false;
                        if ($scope.arrayCopy[2].value[0] !== $scope.array[2].value[0]) {
                            modbusStartValueChanged = true;
                        }
                        if ($scope.arrayCopy[3].value[0] !== $scope.array[3].value[0]) {
                            modbusEndValueChanged = true;
                        }
                    }
                }
                $scope.array = [];
                $scope.previousOptions = [];
                var index = 0;
                for (var node in nodes) {
                    if (nodes[node]) {
                        var arrayItem = {};
                        arrayItem.name = nodes[node].nodeDisplayName;
                        arrayItem.childrenIds = nodes[node].childrenIds;
                        arrayItem.checked = false;

                        $scope.array.push(arrayItem);
                        var value = '';
                        //console.log($scope.array);
                        if (nodes[node].active) {
                            var options = nodes[node].nodeDisplayValue.split(',');
                            options = _.without(options, 'NONSTANDARD');
                            options = _.without(options, '所有协议');

                            arrayItem.options = [];
                            for (var a = 0; a < options.length; a++) {
                                arrayItem.options.push({
                                    name: options[a],
                                    checked: false
                                });
                            }

                            arrayItem.showOption = false;
                            arrayItem.selectAll = false;
                            arrayItem.custom = {
                                'enableCustomValue': false,
                                'customValue': '',
                                'showBracket': false
                            };
                            arrayItem.value = ['请选择'];
                            //console.log($scope.array);

                            value = '<span class="signature-padding-height signature-text-content" ng-show="editPreviousItem" ng-click="cancelPreivousChange()">{{array[' + index + '].value.toString()}}</span>' +
                                '<span ng-show="' + index + '==0 && !editPreviousItem">' +
                                '<div class="dropdown display-inline-block" dropdown>' +
                                '<button type="button" class="btn btn-default dropdown-toggle btn-text-overflow" dropdown-toggle>{{array[' + index + '].value.toString()}}<span class="caret"></span></button>' +
                                '<ul class="dropdown-menu" role="menu">' +
                                '<li ng-repeat="option in array[' + index + '].options">' +
                                '<p ng-click="changeProtocol(' + index + ',option.name)">{{option.name}}</p>' +
                                '</li>' +
                                '</ul>' +
                                '</div>' +
                                '</span>' +
                                '<span ng-show="' + index + '>0 && !editPreviousItem">' +
                                '<div class="dropdown display-inline-block" dropdown>' +
                                '<button type="button" class="btn btn-default dropdown-toggle btn-text-overflow" dropdown-toggle><span ng-if="array[' + index + '].value.length >1 || array[' + index + '].custom.showBracket">{</span>{{array[' + index + '].value.toString()}}<span class="caret"></span><span ng-if="array[' + index + '].value.length >1 || array[' + index + '].custom.showBracket">}</span></button>' +
                                '<ul class="dropdown-menu tree" role="menu">' +
                                '<li><div class="signature-dropdown-list"><input custom-checkbox class="input-checkbox-signature" type="checkbox" ng-model="array[' + index + '].custom.enableCustomValue" ng-change="useCustomValue(' + index + ')"/><input class="input-text-signature" type="text" ng-disabled="!array[' + index + '].custom.enableCustomValue" ng-change="updateCustomValue(' + index + ')" ng-model="array[' + index + '].custom.customValue" placeholder="自定义"/><span class="input-alert-error" ng-if="array[' + index + '].custom.enableCustomValue && array[' + index + '].custom.invalid">请输入合法的值</span></div></li>' +
                                '<li ng-if="array[' + index + '].options.length>0"><div class="signature-dropdown-list"><label><input custom-checkbox class="input-checkbox-signature" type="checkbox" ng-model="array[' + index + '].selectAll" ng-change="selectAll(' + index + ')">All</label></div></li>' +
                                '<li class="divider" ng-if="array[' + index + '].options.length>0"></li>' +
                                '<li ng-repeat="option in array[' + index + '].options">' +
                                '<div class="signature-dropdown-list"><label><input custom-checkbox class="input-checkbox-signature" type="checkbox" ng-model="option.checked" ng-change="setSelectedItem(' + index + ', option.name)">{{option.name | ellipsis:"30"}}</label></div>' +
                                '</li>' +
                                '</ul>' +
                                '</div>' +
                                '</span>' +
                                '<button class="btn btn-default" ng-if="!editPreviousItem" ng-disabled="array[' + index + '].custom.invalid" ng-click="redraw()"><i class="fa fa-check-circle icon-left"></i>确定编辑</button></span>';

                        } else {
                            arrayItem.value = nodes[node].nodeDisplayValue.replace(/[{}]/g, '').split(',');
                            //value = '<span ng-click="showOptions(' + index + '); showOption = !showOption">' + nodes[node].nodeDisplayValue + '</span>';
                            value = '<span class="signature-padding-height signature-text-content" ng-hide="array[' + index + '].showOption" ng-click="showOptions(' + index + '); array[' + index + '].showOption = true">' + encodeStr(nodes[node].nodeDisplayValue) + '</span>' +
                                '<span ng-show="array[' + index + '].showOption && ' + index + '==0">' +
                                '<div class="dropdown display-inline-block" dropdown>' +
                                '<button type="button" class="btn btn-default dropdown-toggle btn-text-overflow" data-toggle="previousDropdown" dropdown-toggle>{{array[' + index + '].value.toString()}}<span class="caret"></span></button>' +
                                '<ul class="dropdown-menu previous" role="menu">' +
                                '<li ng-repeat="option in array[' + index + '].options">' +
                                '<p ng-click="changeProtocol(' + index + ',option.name)">{{option.name}}</p>' +
                                '</li>' +
                                '</ul>' +
                                '</div>' +
                                '</span>' +
                                '<span ng-show="array[' + index + '].showOption && ' + index + '>0">' +
                                '<div class="dropdown display-inline-block" dropdown>' +
                                '<button type="button" class="btn btn-default dropdown-toggle btn-text-overflow" data-toggle="dropdown" dropdown-toggle><span ng-if="array[' + index + '].value.length >1 || array[' + index + '].custom.showBracket">{</span>{{array[' + index + '].value.toString()}}<span class="caret"></span><span ng-if="array[' + index + '].value.length >1 || array[' + index + '].custom.showBracket">}</span></button>' +
                                '<ul class="dropdown-menu previous-tree" role="menu">' +
                                '<li><div class="signature-dropdown-list"><input custom-checkbox class="input-checkbox-signature" type="checkbox" ng-model="array[' + index + '].custom.enableCustomValue" ng-change="useCustomValue(' + index + ')"/><input class="input-text-signature" type="text" ng-disabled="!array[' + index + '].custom.enableCustomValue" ng-change="updateCustomValue(' + index + ')" ng-model="array[' + index + '].custom.customValue" placeholder="自定义"/><span class="input-alert-error" ng-if="array[' + index + '].custom.enableCustomValue && array[' + index + '].custom.invalid">请输入合法的值</span></div></li>' +
                                '<li ng-if="array[' + index + '].options.length>0"><input class="input-checkbox-signature" type="checkbox" ng-model="array[' + index + '].selectAll" ng-change="selectAll(' + index + ')"> All</li>' +
                                '<li class="divider" ng-if="array[' + index + '].options.length>0"></li>' +
                                '<li ng-repeat="option in array[' + index + '].options">' +
                                '<div class="signature-dropdown-list"><label><input custom-checkbox class="input-checkbox-signature" type="checkbox" ng-model="option.checked" ng-change="setSelectedItem(' + index + ', option.name)">{{option.name | ellipsis:"30"}}</label></div>' +
                                '</li>' +
                                '</ul>' +
                                '</div>' +
                                '</span>' +
                                '<button class="btn btn-default" ng-disabled="array[' + index + '].custom.invalid" ng-click="confirmPreviousChange(' + index + ')" ng-show="array[' + index + '].showOption"><i class="fa fa-check-circle icon-left"></i>确定编辑</button>' +
                                '<button class="btn btn-default" ng-click="cancelPreivousChange()" ng-show="array[' + index + '].showOption"><i class="fa fa-times-circle icon-left"></i>取消编辑</button>';
                            if (modbusStartValueChanged && index === 2) {
                                value = value + '<span class="input-alert-error">终止地址必须大于或者等于起始地址</span>';
                            }
                            if (modbusEndValueChanged && index === 3) {
                                value = value + '<span class="input-alert-error">终止地址必须大于或者等于起始地址</span>';
                            }
                        }

                        $scope.arrayCopy = [];
                        angular.copy($scope.array, $scope.arrayCopy);

                        var styleClass = nodes[node].childrenIds ? 'hasChild' : '';
                        var txt = "<li data-id='" + encodeStr(nodes[node].valueNodeId) + "' class='" + styleClass + "'><span class='signature-padding-height'><span id='diamond'></span>" + encodeStr(nodes[node].nodeDisplayName) + ": </span>" +
                            // "<span id='diamond'> : </span>" +
                            value +
                            "</li>";

                        var template = angular.element(txt);

                        var element = $compile(template)($scope);

                        var parent;

                        if (nodes[node].valueNodeId === 0) {
                            parent = ul;
                        } else {
                            var $elem = ul.find("li[data-id='" + encodeStr(nodes[node].parentId) + "']");
                            if ($elem.find("ul.tree").length === 0) {
                                $elem.append("<ul class='tree'>");
                            }
                            parent = $elem.find("ul.tree:first");
                        }
                        parent.append(element);

                        $('.dropdown-menu.tree').click(function (e) {
                            e.stopPropagation();
                        });
                        $('.dropdown-menu.previous-tree').click(function (e) {
                            e.stopPropagation();
                        });
                        index++;
                    }
                }
            };

            $scope.redraw = function () {

                for (var a = $scope.array.length - 1; a >= 0; a--) {
                    if (_.contains($scope.array[a].value, '请选择') || _.contains($scope.array[a].value, '自定义')) {
                        $scope.array[a].value = _.without($scope.array[a].value, '自定义');
                        $scope.array[a].value = _.without($scope.array[a].value, '请选择');
                        if ($scope.array[a].value.length === 0) {
                            $scope.array.splice(a, 1);
                        }
                    }
                }

                var rules = [];

                for (var index = 0; index < $scope.array.length; index++) {
                    var rule = {};
                    rule.name = $scope.array[index].name;
                    if ($scope.array[index].value.length > 1) {
                        rule.value = '{' + $scope.array[index].value.toString() + '}';
                    } else {
                        var hasSquareBracket = false;

                        if ($scope.array[index].value.toString().indexOf('[') !== -1 || $scope.array[index].value.toString().indexOf(']') !== -1) {
                            hasSquareBracket = true;
                        }

                        if ($scope.array[index].value.toString().split(',').length > 1 && !hasSquareBracket) {
                            rule.value = '{' + $scope.array[index].value.toString() + '}';
                        } else {
                            rule.value = $scope.array[index].value.toString();
                        }
                    }
                    rules.push(rule);
                }

                var payload = {
                    'currentValue': JSON.stringify(rules)
                };

                Custom.getData(payload).then(function (data) {
                    var json = data.data.nodeTree;
                    $scope.showOption = false;
                    $scope.currentTree = json.nodes;
                    $scope.generateTree(json.nodes);
                    $scope.editPreviousItem = false;
                });


            };

        };
    }
})();
