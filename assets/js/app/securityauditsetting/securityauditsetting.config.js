/**
 * Monitor Audit Table Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.securityauditsetting')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('audit_setting', {
            parent: 'dashboard',
            url: '/audit_setting',
            controller: 'SecurityauditSettingCtrl as securityauditsetting',
            templateUrl: 'templates/securityauditsetting/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_AUDIT';
                }
            }
        }).state('audit_setting.protocol_setting', {
            parent: 'dashboard',
            url: '/audit_setting/protocol_setting',
            controller: 'SecurityauditSettingCtrl as securityauditsetting',
            templateUrl: 'templates/securityauditsetting/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_AUDIT';
                }
            }
        }).state('audit_setting.behavior_setting', {
            parent: 'dashboard',
            url: '/audit_setting/behavior_setting',
            controller: 'SecurityauditSettingCtrl as securityauditsetting',
            templateUrl: 'templates/securityauditsetting/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_AUDIT';
                }
            }
        }).state('audit_setting.content_setting', {
            parent: 'dashboard',
            url: '/audit_setting/content_setting',
            controller: 'SecurityauditSettingCtrl as securityauditsetting',
            templateUrl: 'templates/securityauditsetting/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'SETTINGS_AUDIT';
                }
            }
        });
    }
})();
