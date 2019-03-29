/**
 * Created by Morgan on 15-02-13.
 */
(function () {
    'use strict';

    angular
        .module('southWest.infsafety')
        .directive('sourceTable', sourceTable)
        .directive('targetTable', targetTable)
        .directive('analyzeTable', analyzeTable)
        .directive('shortestPathTable', shortestPathTable)
        .directive('itemInThreadTable', itemInThreadTable)
        .directive('optimizationPlanTable', optimizationPlanTable);

    function sourceTable(infSafety, topologyId) {
        var sourceTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/infsafety/tables/source-table.html',
            link: link
        };

        return sourceTableObj;

        //////////
        function link(scope) {
            scope.table = [];

            scope.check = function (key, state) {
                if (_.contains(scope.options.source, key)) {
                    scope.options.source = _.without(scope.options.source, key);
                    scope.count--;
                } else {
                    scope.options.source.push(key);
                    scope.count++;
                }
                if (state) {
                    scope.selectAll = scope.options.source.length === scope.table.length;
                } else {
                    scope.selectAll = false;
                }
                if (scope.options.source.length && scope.options.target.length) {
                    scope.disableCalculation.value = false;
                } else {
                    scope.disableCalculation.value = true;
                }
            };

            scope.checkAll = function (state) {
                scope.options.source = [];
                scope.count = state ? scope.table.length : 0;
                if (state) {
                    for (var index = 0; index < scope.table.length; index++) {
                        scope.table[index].checked = true;
                        scope.options.source.push(scope.table[index].nodeName);
                    }
                } else {
                    for (var i = 0; i < scope.table.length; i++) {
                        scope.table[i].checked = false;
                    }
                }
                if (scope.options.source.length && scope.options.target.length) {
                    scope.disableCalculation.value = false;
                } else {
                    scope.disableCalculation.value = true;
                }
            };

            getTableData();
            //////////
            function getTableData() {
                infSafety.source(topologyId, scope.infsafetyId).then(function (data) {
                    scope.table = scope.initializeData(data);
                });
            }
        }
    }

    function targetTable(infSafety, topologyId) {
        var targetTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/infsafety/tables/target-table.html',
            link: link
        };

        return targetTableObj;

        //////////
        function link(scope) {
            scope.table = [];

            scope.check = function (key, state) {
                if (_.contains(scope.options.target, key)) {
                    scope.options.target = _.without(scope.options.target, key);
                    scope.count--;
                } else {
                    scope.options.target.push(key);
                }
                if (state) {
                    scope.selectAll = scope.options.target.length === scope.table.length;
                    scope.count++;
                } else {
                    scope.selectAll = false;
                }
                if (scope.options.source.length && scope.options.target.length) {
                    scope.disableCalculation.value = false;
                } else {
                    scope.disableCalculation.value = true;
                }
            };

            scope.checkAll = function (state) {
                scope.options.target = [];
                scope.count = state ? scope.table.length : 0;
                if (state) {
                    for (var index = 0; index < scope.table.length; index++) {
                        scope.table[index].checked = true;
                        scope.options.target.push(scope.table[index].nodeName);
                    }
                } else {
                    for (var i = 0; i < scope.table.length; i++) {
                        scope.table[i].checked = false;
                    }
                }
                if (scope.options.source.length && scope.options.target.length) {
                    scope.disableCalculation.value = false;
                } else {
                    scope.disableCalculation.value = true;
                }
            };

            getTableData();
            //////////
            function getTableData() {
                infSafety.target(topologyId, scope.infsafetyId).then(function (data) {
                    scope.table = scope.initializeData(data);
                });
            }
        }
    }

    function analyzeTable(infSafety) {
        var analyzeTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/infsafety/tables/analyze-table.html',
            link: link
        };

        return analyzeTableObj;

        //////////
        function link(scope) {
            scope.table = [];

            scope.check = function (key, state) {
                if (_.contains(scope.options.analyze, key)) {
                    scope.options.analyze = _.without(scope.options.analyze, key);
                    scope.count--;
                } else {
                    scope.options.analyze.push(key);
                }
                if (state) {
                    scope.selectAll = scope.options.analyze.length === scope.table.length;
                    scope.count++;
                } else {
                    scope.selectAll = false;
                }
            };

            scope.checkAll = function (state) {
                scope.options.analyze = [];
                scope.count = state ? scope.table.length : 0;
                if (state) {
                    for (var index = 0; index < scope.table.length; index++) {
                        scope.table[index].checked = true;
                        scope.options.analyze.push(scope.table[index].id);
                    }
                } else {
                    for (var i = 0; i < scope.table.length; i++) {
                        scope.table[i].checked = false;
                    }
                }
            };

            getTableData();

            function getTableData() {
                infSafety.analyze().then(function (data) {
                    scope.table = scope.initializeAnalyzeData(data);
                });
            }
        }
    }

    function shortestPathTable() {
        var shortestPathTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/infsafety/tables/shortest-path-table.html',
            link: link
        };

        return shortestPathTableObj;

        function link(scope) {
            scope.table = [];
            var pathSafety = scope.result.pathSafty;
            if (pathSafety !== void(0)) {
                for (var path in pathSafety) {
//        console.log(item);
                    if (pathSafety[path]) {
                        var item = {};
                        var items = path.substring(1, path.length - 1).split(/,\s+/);
                        item.items = items;
                        item.source = items[0];
                        item.target = items[items.length - 1];
                        item.count = items.length;
                        item.score = pathSafety[path];
                        scope.table.push(item);
                    }
                }
            }
        }
    }

    function itemInThreadTable() {
        var itemInThreadTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/infsafety/tables/item-in-thread-table.html',
            link: link
        };

        return itemInThreadTableObj;

        function link(scope) {
            scope.table = [];
            var nodeSafety = scope.result.nodeSafty;
            for (var node in nodeSafety) {
                if (nodeSafety[node]) {
                    var item = {};
                    item.id = node;
                    item.score = nodeSafety[node];
                    scope.table.push(item);
                }
            }

        }
    }

    function optimizationPlanTable() {
        var optimizationPlanTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/infsafety/tables/optimization-plan-table.html',
            link: link
        };

        return optimizationPlanTableObj;

        function link(scope) {
            scope.table = [];
            var item = {};
            if (scope.result.mostImprLink.length) {
                item = {};
                item.method = '增加安全设备方案';
                item.location = scope.nodeMap[scope.result.mostImprLink[0]].name + ' ---- ' + scope.nodeMap[scope.result.mostImprLink[1]].name;
                item.suggestion = '增加保护设备';
                scope.table.push(item);
            }
            if (scope.result.mostImprNode !== undefined && scope.nodeMap[scope.result.mostImprNode]) {
                item = {};
                item.method = '设备升级方案';
                item.location = scope.nodeMap[scope.result.mostImprNode].name;
                item.suggestion = '升级此设备';
                scope.table.push(item);
            }
            if (scope.result.usbNode.length) {
                scope.result.usbNode.forEach(function (node) {
                    item = {};
                    item.method = '禁用USB设备';
                    item.location = scope.nodeMap[node].name;
                    item.suggestion = '禁用此设备USB';
                    scope.table.push(item);
                });
            }
            if (scope.result.cloudNode.length) {
                scope.result.cloudNode.forEach(function (cloud) {
                    item = {};
                    item.method = '更改外网接入模式';
                    item.location = scope.nodeMap[cloud].name;
                    item.suggestion = '阻止此外网接入模式';
                    scope.table.push(item);
                });
            }
        }
    }

})();
