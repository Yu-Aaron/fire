/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.protocolaudit')
        .controller('AuditTableCtrl', AuditTableCtrl);

    function AuditTableCtrl($scope, $state, $rootScope) {
        var vm = this;

        vm.showImportBtn = ($rootScope.VERSION_NUMBER.slice(-4) === '-C05');
    }
})();
