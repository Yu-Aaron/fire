/**
* object Config
*
* Description
*/
(function () {
    'use strict';

    angular
        .module('southWest.object')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('object', {
            abstract: true,
            parent: 'dashboard',
            url: '/network',
            controller: 'ObjectCtrl as menuCtrl',
            templateUrl: 'templates/includes/nav-left.html'
        });
    }
})();
