/**
 * help Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help.strategy')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('help.strategy_security', {
            url: '/strategy/security',
            template: '<div>test help strategy security</div>'
        }).state('help.strategy_nat', {
            parent:'help',
            url: '/strategy/nat',
            template: '<div>test help strategy nat</div>'
        }).state('help.strategy_session', {
            parent:'help',
            url: '/strategy/session',
            template: '<div>test help strategy session</div>'
        }).state('help.strategy_anti_penetration', {
            parent:'help',
            url: '/strategy/anti_penetration',
            template: '<div>test help strategy anti_penetration</div>'
        });
    }
})();

