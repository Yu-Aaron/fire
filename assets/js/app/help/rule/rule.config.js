/**
 * help Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help.rule')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('help.rule_blacklist', {
            url: '/rule/blacklist',
            template: '<div>test help rule blacklist</div>'
        }).state('help.rule_whitelist', {
            parent:'help',
            url: '/rule/whitelist',
            template: '<div>test help rule whitelist</div>'
        }).state('help.rule_ipmac', {
            parent:'help',
            url: '/rule/ipmac',
            template: '<div>test help rule ipmac</div>'
        });
    }
})();
