/**
 * Services
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.services', [])
        .config(config);

    function config($stateProvider) {
        var $delegate = $stateProvider.state;
        $stateProvider.state = function(name, definition) {
            if (!definition.resolve) {
                definition.resolve = {};
            }
            return $delegate.apply(this, arguments);
        };
    }
})();
