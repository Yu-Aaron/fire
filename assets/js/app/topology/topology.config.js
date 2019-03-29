/**
 * Monitor Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.topology')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('topology', {
            parent: 'dashboard',
            abstract: true,
            controller: 'TopoOverCtrl as topoOver',
            templateUrl: 'templates/topology/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'TOPOLOGY';
                }
            }
        });
    }
})();
