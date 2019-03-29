/**
 * SystemUser Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.systemuser')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.usercontrol', {
            parent: 'setting',
            url: '/usercontrol',
            controller: 'SystemUserCtrl as systemuser',
            templateUrl: 'templates/systemuser/index.html',
            resolve: {
                users: function (SystemUser) {
                    return SystemUser.getUsers();
                },
                roles: function (SystemUser, secretKey){ // jshint ignore:line
                    return SystemUser.getRoles().then(function (data) {
                        return data;
                    }, function (error) {
                        return error;
                    });
                },
                user: function (SystemUser, secretKey){ // jshint ignore:line
                    return SystemUser.getCurrentUser();
                },
                strategyInfo: function (System, secretKey){ // jshint ignore:line
                    return System.getStrategyInfo();
                }
            }
        }).state('setting.rootcontrol', {
            parent: 'setting',
            url: '/rootcontrol',
            controller: 'RootUserCtrl as systemuser',
            templateUrl: 'templates/systemuser/rootcontrol.html',
            resolve: {
                users: function (SystemUser, secretKey){ // jshint ignore:line
                    return SystemUser.getDefaultUser();
                },
                user: function (SystemUser, secretKey){ // jshint ignore:line
                    return SystemUser.getCurrentUser();
                },
                strategyInfo: function (System, secretKey){ // jshint ignore:line
                    return System.getStrategyInfo();
                }, roles: function (SystemUser, secretKey){ // jshint ignore:line
                    return SystemUser.getRoles().then(function (data) {
                        return data;
                    }, function (error) {
                        return error;
                    });
                }
            }
        });
    }
})();
