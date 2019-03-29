/**
 * Created by yucai on 16-7-25.
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.behavior')
        .controller('BehaviorCtrl', BehaviorCtrl);

    function BehaviorCtrl($scope, apiInfo, behaviordata) {
        var vm = this;
        init();

        vm.changeBarChart = function () {
            var time = 1;
            if (vm.totalTime === "1h") {
                time = 3600000;
            } else if (vm.totalTime === "1d") {
                time = 24 * 3600000;
            } else if (vm.totalTime === "1w") {
                time = 168 * 3600000;
            }
            getBehaviorDatas(time).then(function (data) {
                showBarChart(data);
            });
        };

        function init() {
            var time = 3600000;
            getBehaviorDatas(time).then(function (data) {
                showBarChart(data);
            });
        }

        function getBehaviorDatas(time) {
            return apiInfo.sysbaseinfo().then(function (data) {
                var endTime = new Date(data.data || "");
                var startTime = new Date(endTime - time);
                vm.endTimeStr = formatDate(endTime);
                vm.startTimeStr = formatDate(startTime);
                vm.reportTime = vm.endTimeStr;
                return behaviordata.getBehaviorDatas(vm.startTimeStr, vm.endTimeStr).then(function (data) {
                    $scope.$$childTail.dtable.refresh();
                    return data;
                });
            });
        }

        function showBarChart(data) {
            $('#behavior-audit-bar-chart').highcharts(behaviordata.behaviorBarChart(data));
        }

        function formatDate(date) {
            return (date.getUTCFullYear() + "-" + (((date.getUTCMonth() + 1) > 9) ? date.getUTCMonth() + 1 : ("0" + (date.getUTCMonth() + 1))) + "-" + ((date.getUTCDate() > 9) ? date.getUTCDate() : ("0" + date.getUTCDate())) + "T" + ((date.getUTCHours() > 9) ? date.getUTCHours() : ("0" + date.getUTCHours())) + ":" + ((date.getUTCMinutes() > 9) ? date.getUTCMinutes() : ("0" + date.getUTCMinutes())) + ":" + ((date.getUTCSeconds() > 9) ? date.getUTCSeconds() : ("0" + date.getUTCSeconds())) + "Z");
        }

    }
})();
