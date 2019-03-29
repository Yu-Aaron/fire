/**
 * Asset Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset')
        .directive('assetSideNav', assetSideNav);

    function assetSideNav() {
        var assetTableObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/asset/assetSideNav.html',
            link: link
        };

        return assetTableObj;

        //////////
        function link() {

        }
    }
})();
