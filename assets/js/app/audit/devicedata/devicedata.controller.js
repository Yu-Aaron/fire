/**
 * Audit devicedata Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.devicedata')
        .controller('DevicedataCtrl', DevicedataCtrl);

    function DevicedataCtrl($scope, $state) {
        $scope.refresh = function () {
            $state.reload();
        };

        // var loopPattern;

        //startQueryPattern();

        // function startQueryPattern() {
        //     loopPattern = $interval(queryPattern, 24000);
        //     $scope.$on('$destroy', function () {
        //         cancelQueryPattern();
        //     });
        // }

        // function cancelQueryPattern() {
        //     $interval.cancel(loopPattern);
        // }

        // function queryPattern() {
        //     $scope.dtable.getTableData();
        // }
    }
})();
