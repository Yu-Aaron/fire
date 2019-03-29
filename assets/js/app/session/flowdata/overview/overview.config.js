(function () {
    'use strict';

    angular
        .module('southWest.session.flowdata_overview')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('session.flowdata_overview', {
            url: '/flowdata/overview',
            controller: 'DPIDataCtrl2 as dpidata',
            templateUrl: 'templates/session/flowdata/overview/index.html',
            //resolve: {
            //    state: function ($rootScope) {
            //        $rootScope.currentState = 'AUDIT_MANAGEMENT';
            //    }
            //}
        });
    }
})();
