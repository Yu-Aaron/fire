/**
 * Setting Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.setting.security_operation')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('setting.security_operation', {
            parent:'setting',
            url: '/security_operation',
            templateUrl: 'templates/setting/security_operation/index.html',
            controller: 'SecurityOperationCtrl as update'
        });
    }
})();
