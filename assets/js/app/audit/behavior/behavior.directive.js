/**
 * Audit behavior Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.behavior')
        .directive('behaviorTable', behaviorTable);

    function behaviorTable(behaviordata, $modal, $log, apiInfo) {
        var behaviorTableObj = {
            scope: true,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/audit/behavior/behaviorTable.html',
            link: link
        };
        return behaviorTableObj;

        function link(scope, element, attr, ctrl) {
            var fields = ['usrIp', 'shoppingNum', 'newsNum', 'videoNum', 'sportNum', 'entertainmentNum', "financeNum", "gamesNum", "novelNum", "otherNum", "totalNum", "visitTimestamp"];
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                pagination: false,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount,
                fields: fields,
            });

            function getAll() {
                if (!scope.$parent.$parent.BehaviorCtrl.startTimeStr || !scope.$parent.$parent.BehaviorCtrl.endTimeStr) {
                    return apiInfo.sysbaseinfo().then(function () {
                        return null;
                    });
                }
                return behaviordata.getBehaviorDatas(scope.$parent.$parent.BehaviorCtrl.startTimeStr, scope.$parent.$parent.BehaviorCtrl.endTimeStr);
            }

            function getCount() {
                return apiInfo.sysbaseinfo().then(function () {
                    return null;
                });
            }

            scope.openExportPanel = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'templates/includes/confirmOutputPanel.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.addPsw = '1';
                    $scope.validatePsw = function (psw) {
                        var regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*(_|[^\w])).+$/g;
                        return psw && psw.match(regex) && psw.length >= 8;
                    };
                    $scope.download = function (psw) {
                        $modalInstance.close();
                        behaviordata.getAllExport(scope.$parent.$parent.BehaviorCtrl.startTimeStr, scope.$parent.$parent.BehaviorCtrl.endTimeStr, psw).then(function (data) {
                            window.open('./' + data, '_self');
                        });
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };

            scope.showDetailWindow = function (behavior) {
                var modalInstance = $modal.open({
                    templateUrl: '/templates/audit/behavior/behaviorDetail.html',
                    controller: ModalInstanceCtrl,
                    size: 'sm'
                });

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

                function ModalInstanceCtrl($scope, $modalInstance) {
                    $scope.behavior = behavior;
                    window.onload = showRadarChart();
                    function showRadarChart() {
                        apiInfo.sysbaseinfo().then(function () {
                            var myChart = echarts.init(document.getElementById('behavior-audit-radar-chart'));
                            myChart.setOption(behaviordata.behaviorRadarChart(behavior));
                        });
                    }

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }
            };
        }
    }

})();
