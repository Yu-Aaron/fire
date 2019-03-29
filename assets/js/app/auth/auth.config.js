/**
 * Login Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.auth')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('auth', {
            parent: 'root',
            url: '/login',
            views: {
                '@': {
                    controller: 'AuthCtrl as auth',
                    templateUrl: 'templates/auth/index.html'
                }
            },
            resolve: {
                curTime: function (mOverview) {
                    return mOverview.getCurtime();
                }
            }
        });
    }
})();
