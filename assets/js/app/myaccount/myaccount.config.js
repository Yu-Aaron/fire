/**
 * myaccount Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.myaccount')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.myaccount', {
            parent: 'setting',
            url: '/myaccount',
            controller: 'MyAccountCtrl as myaccount',
            templateUrl: 'templates/myaccount/index.html',
            resolve: {
                accountUsers: function (SystemUser, secretKey){ // jshint ignore:line
                    return SystemUser.getUsers();
                },
                strategyInfo: function (System, secretKey){ // jshint ignore:line
                    return System.getStrategyInfo();
                }
            }
        });
    }
})();
