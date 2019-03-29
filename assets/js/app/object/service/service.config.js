/**
* object service Config
*
* Description
*/
(function () {
    'use strict';

    angular
        .module('southWest.object.service')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('object.service_predefined', {
            url: '/service/predefined',
            controller: 'SvcPredefineCtrl as svcPre',
            templateUrl: 'templates/object/service/predefine.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'OBJECT';
                }
            }
        }).state('object.service_customizedefined', {
            url: '/service/customizedefined',
            controller: 'SvcCustomizeCtrl as svcCus',
            templateUrl: 'templates/object/service/customize.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'OBJECT';
                }
            }
        });
    }
})();
