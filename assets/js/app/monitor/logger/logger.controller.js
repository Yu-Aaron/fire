/**
 * Monitor Logger Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor.logger')
        .controller('LoggerCtrl', LoggerCtrl)
        .controller('LoggerDetailCtrl', LoggerDetailCtrl);

    function LoggerCtrl() {
        var vm = this;
        vm.editRight = true;
        vm.showImportBtn = false;
        vm.showExportBtn = true;
    }

    function LoggerDetailCtrl($stateParams, Logger, localStorage) {
        var vm = this;
        vm.detailLog = 'LOADING';

        vm.logInfo = JSON.parse(localStorage.getItem('logItem'));
        console.log(vm.logInfo);

        Logger.get($stateParams.logName).then(function (data) {
            vm.detailLog = data;
        });
    }
})();
