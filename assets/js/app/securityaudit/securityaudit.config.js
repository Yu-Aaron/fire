/**
 * security audit Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.securityaudit')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('securityaudit', {
            parent: 'dashboard',
            abstract: true,
            //url: '/securityaudit',
            controller: 'SecurityAuditCtrl as securityaudit',
            templateUrl: 'templates/securityaudit/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('securityaudit.audittable', {
            url: '/securityaudit/protocolaudit',
            controller: 'AuditTableCtrl as audittable',
            templateUrl: 'templates/protocolaudit/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('securityaudit.audittable.dpidata', {
            parent: 'securityaudit',
            url: '/securityaudit/audit/dpidata',
            controller: 'DPIDataCtrl as dpidata',
            templateUrl: 'templates/audit/dpidata/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('securityaudit.audittable.dpidevicedata', {
            parent: 'securityaudit',
            url: '/securityaudit/audit/dpidevicedata',
            controller: 'DPIDeviceDataCtrl as dpidevicedata',
            templateUrl: 'templates/audit/dpidevicedata',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('securityaudit.audittable.icdevicedata', {
            parent: 'securityaudit',
            url: '/securityaudit/audit/icdevicedata',
            controller: 'ICDeviceDataCtrl as icdevicedata',
            templateUrl: 'templates/audit/icdevicedata',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('securityaudit.audittable.behavioraudit', {
            parent: 'securityaudit',
            url: '/securityaudit/audit/behavioraudit',
            //controller: 'DPIDataCtrl as dpidata',
            //templateUrl: 'templates/audit/dpidata/index.html',
            controller: 'BehaviorCtrl as BehaviorCtrl',
            templateUrl: 'templates/audit/behavior/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('securityaudit.audittable.forumpost', {
            parent: 'securityaudit',
            url: '/securityaudit/audit/forumpost',
            controller: 'ForumPostDataCtrl as forumpostdata',
            templateUrl: 'templates/audit/forumpostdata',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        }).state('securityaudit.audittable.searchengine', {
            parent: 'securityaudit',
            url: '/securityaudit/audit/searchengine',
            controller: 'SearchEngineDataCtrl as searchenginedata',
            templateUrl: 'templates/audit/searchenginedata',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'AUDIT_MANAGEMENT';
                }
            }
        });
    }
})();
