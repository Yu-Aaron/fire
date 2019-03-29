/**
 * help Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.help.setting')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('help.setting_basic', {
            url: '/setting/basic',
            template: '<div>test help setting basic</div>'
        }).state('help.setting_reliable', {
            parent:'help',
            url: '/setting/reliable',
            template: '<div>test help setting reliable</div>'
        }).state('help.setting_update', {
            parent:'help',
            url: '/setting/update',
            template: '<div>test help settingupdate</div>'
        });
    }
})();

