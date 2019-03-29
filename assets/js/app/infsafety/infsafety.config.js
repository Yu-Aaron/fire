/*
 Safety config
 */
(function () {
    'use strict';

    angular
        .module('southWest.infsafety')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('infsafety', {
            parent: 'dashboard',
            url: '/infsafety',
            controller: 'InfsafetyCtrl as infsafety',
            templateUrl: 'templates/infsafety/index.html',
            zhName: '结构安全性',
            resolve: {
                infsafetyId: function (infSafety) {
                    return infSafety.getId().then(function (data) {
                        return data.value;
                    });
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'STRUCTURE_SAFETY';
                }
            }
        });
    }
})();
