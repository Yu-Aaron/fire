/*

 safety.controller

 */
(function () {
    'use strict';

    angular
        .module('southWest.infsafety')
        .controller('InfsafetyCtrl', InfsafetyCtrl);

    function InfsafetyCtrl($scope, infsafetyId, infSafety, topologyId, $rootScope, $modal) {
        var vm = this;
        vm.selected = '';
        $scope.infsafetyId = infsafetyId;
        $scope.options = {'source': [], 'target': [], 'analyze': []};
        vm.resultOptions = $scope.resultOptions = {
            'shortestPath': {'dropDown': false, 'table': false},
            'itemInThread': {'dropDown': false, 'table': false},
            'optimizationPlan': {'dropDown': false, 'table': false}
        };
        vm.showResult = false;

        vm.selectOption = $scope.selectOption = function (option) {
            vm.selected = $scope.selected = option;
        };
        $scope.disableCalculation = {value: true};

        vm.resetResult = function () {
            // console.log("reset");
            $rootScope.$broadcast('infsafetyResult', -1);
        };

        vm.toggleSuggestedPosition = function () {
            // $rootScope.$broadcast('toggleSuggestedPosition', $scope.result);
        };

        vm.startCalculation = function () {
            vm.selected = '';
//        console.log($scope.options);
            var params = {};
            params._selectedSourceNameList = $scope.options.source;
            params._selectedTargetNameList = $scope.options.target;
            if (_.contains($scope.options.analyze, 'vimp')) {
                params.vimp = 1;
            }
            if (_.contains($scope.options.analyze, 'useVulner')) {
                params.useVulner = 1;
            }
            for (var option in $scope.resultOptions) {
                if ($scope.resultOptions[option]) {
                    $scope.resultOptions[option].dropDown = false;
                    $scope.resultOptions[option].table = false;
                }
            }

            if (params._selectedSourceNameList.length && params._selectedTargetNameList.length) {
                infSafety.calculate(topologyId, infsafetyId, params).then(function (data) {

                    $rootScope.$broadcast('infsafetyResult', data);
                    $scope.result = data;
                    $scope.result.pathSafetyLength = Object.keys($scope.result.pathSafty).length;
                    var pathSafety = $scope.result.pathSafty;
                    var pathSafetyData = $scope.pathSafetyData = [
                        {name: '低危', color: '#79B900', y: 0, visible: false},
                        {name: '中危', color: '#FEDA00', y: 0, visible: false},
                        {name: '高危', color: '#FE540F', y: 0, visible: false}
                    ];

                    for (var property in pathSafety) {
                        if (pathSafety[property]) {
                            if (pathSafety[property] <= 60) {
                                pathSafetyData[2].y++;
                                delete pathSafetyData[2].visible;
                            }
                            else if (pathSafety[property] >= 80) {
                                pathSafetyData[0].y++;
                                delete pathSafetyData[0].visible;
                            } else {
                                pathSafetyData[1].y++;
                                delete pathSafetyData[1].visible;
                            }
                        }
                    }
                    //console.log(pathSafetyData);
                    $scope.nodeSafety = [];
                    $scope.dangerousNode = 0;
                    for (var node in $scope.result.nodeSafty) {
                        if ($scope.result.nodeSafty[node]) {
                            $scope.nodeSafety.push($scope.result.nodeSafty[node]);
                            if ($scope.result.nodeSafty[node] <= 60) {
                                $scope.dangerousNode++;
                            }
                        }
                    }

                    function sortNumber(a, b) {
                        return a - b;
                    }

                    $scope.nodeSafety.sort(sortNumber);

                    $scope.optimizationPlanCount = 0;
                    if ($scope.result.mostImprLink.length) {
                        $scope.optimizationPlanCount++;
                    }
                    if ($scope.result.mostImprNode !== undefined && $scope.nodeMap[$scope.result.mostImprNode]) {
                        $scope.optimizationPlanCount++;
                    }
                    if ($scope.result.usbNode.length) {
                        $scope.optimizationPlanCount++;
                    }
                    if ($scope.result.cloudNode.length) {
                        $scope.optimizationPlanCount++;
                    }

                    $scope.chartConfig = infSafety.pieChart(pathSafetyData, $scope.filterPathSafety, $scope.result.allSafe);

                    if (Object.keys($scope.result.pathSafty).length) {
                        vm.showResult = true;
                    } else {
                        errorPopup();
                    }
                });
            } else {
                invalidSelectionPopup();
            }

        };

        function errorPopup() {
            var modalInstance = $modal.open({
                templateUrl: 'calculationError.html',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close('ok');
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: 'sm'
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        function invalidSelectionPopup() {
            var modalInstance = $modal.open({
                templateUrl: 'selectionError.html',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close('ok');
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: 'sm'
            });

            modalInstance.result.then(function (msg) {
                console.log(msg);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        vm.showResultOption = function (selection) {
            if ($scope.resultOptions[selection].dropDown) {
                $scope.resultOptions[selection].dropDown = false;
                $scope.resultOptions[selection].table = false;
            } else {
                for (var option in $scope.resultOptions) {
                    if ($scope.resultOptions[option]) {
                        if (option === selection) {
                            $scope.resultOptions[option].dropDown = true;
                            $scope.resultOptions[option].table = true;
                        } else {
                            $scope.resultOptions[option].dropDown = false;
                            $scope.resultOptions[option].table = false;
                        }
                    }
                }
            }
        };

        vm.showResultOptionTable = function (optionTable) {
            console.log(optionTable);
            $scope.resultOptions.shortestPath.table = false;
            $scope.resultOptions.itemInThread.table = false;
            $scope.resultOptions.optimizationPlan.table = false;

            $scope.resultOptions[optionTable].table = true;
        };

        $scope.initializeData = function (data) {
            var key = $scope.selected === 'source' ? 'nodeName' : $scope.selected === 'target' ? 'nodeName' : 'id';
            $scope.count = 0;
            for (var index = 0; index < data.length; index++) {
                if (_.contains($scope.options[$scope.selected], data[index][key])) {
                    data[index].checked = true;
                    $scope.count++;
                } else {
                    data[index].checked = false;
                }
            }

            if ($scope.count === data.length) {
                $scope.selectAll = true;
            } else {
                $scope.selectAll = false;
            }
            return data;
        };
        $scope.initializeAnalyzeData = function (data) {
            var key = $scope.selected === 'source' ? 'nodeName' : $scope.selected === 'target' ? 'nodeName' : 'id';
            $scope.count = 0;
            for (var index = 0; index < data.length; index++) {
                if (_.contains($scope.options[$scope.selected], data[index][key]) || index === 0) {
                    data[index].checked = true;
                    $scope.count++;
                } else {
                    data[index].checked = false;
                }
            }

            if ($scope.count === data.length) {
                $scope.selectAll = true;
            } else {
                $scope.selectAll = false;
            }
            return data;
        };
    }
})();
