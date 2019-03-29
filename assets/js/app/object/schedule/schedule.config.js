///**
// * object Config
// *
// * Description
// */
(function () {
    'use strict';

    angular
        .module('southWest.object.schedule')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('object.schedule', {
            url: '/schedule',
            controller: 'ScheduleCtrl',
            templateUrl: 'templates/object/schedule/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'OBJECT';
                }
            }
        });
    }
})();
