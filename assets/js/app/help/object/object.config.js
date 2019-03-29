/**
 * help Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help.object')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('help.object_network_asset', {
            url: '/object/network_asset',
            template: '<div>test help object network_asset</div>'
        }).state('help.object_service', {
            parent:'help',
            url: '/object/service',
            template: '<div>test help object service</div>'
        }).state('help.object_apply', {
            parent:'help',
            url: '/object/apply',
            template: '<div>test help object apply</div>'
        }).state('help.object_schedule', {
            parent:'help',
            url: '/object/schedule',
            template: '<div>test help object schedule</div>'
        });
    }
})();

