///**
// * object Config
// *
// * Description
// */
(function () {
    'use strict';

    angular
        .module('southWest.object.apply')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('object.apply_predefined', {
            url: '/apply/predefined',
            controller: 'AppPredefineCtrl as appPre',
            templateUrl: 'templates/object/apply/predefine.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'OBJECT';
                }
            }
        }).state('object.apply_customizedefined', {
            url: '/apply/customizedefined',
            controller: 'AppCustomizeCtrl as appCus',
            templateUrl: 'templates/object/apply/customize.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'OBJECT';
                }
            }
        });
    }
})();
