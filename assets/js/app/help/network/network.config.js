/**
 * help Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help.network')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('help.network_interface', {
            url: '/network/interface',
            template: '<div>test help network interface</div>'
        }).state('help.network_static_router', {
            parent:'help',
            url: '/network/static_router',
            template: '<div>test help network static_router</div>'
        });
    }
})();

