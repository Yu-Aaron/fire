/**
 * Postlogin Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.postlog')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('postlog', {
            url: '/postlog',
            controller: 'PostLogCtrl as postlog',
            templateUrl: 'templates/postlogin/index.html'
        });
    }
})();
