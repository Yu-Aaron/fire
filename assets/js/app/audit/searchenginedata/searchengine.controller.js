/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.searchenginedata')
        .controller('SearchEngineDataCtrl', SearchEngineDataCtrl);

    function SearchEngineDataCtrl($rootScope) {
        var vm = this;

        vm.gotoTimeControl = function (menuName) {
            $rootScope.menuName = menuName;
        };

    }
})();
