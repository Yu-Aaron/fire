/**
 * rule Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.reduction')
        .controller('ReductionCtrl', ReductionCtrl);

    function ReductionCtrl($scope, $state) {
        $scope.refresh = function () {
            $state.reload();
        };
    }
})();
