/**
 * ipmac Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.ipmac')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.ipmac', {
            url: '/ipmac',
            controller: 'IPMACCtrl as ipmac',
            templateUrl: 'templates/rule/ipmac/index.html',
            resolve: {
                allAreas: function(SecurityArea, secretKey){ // jshint ignore:line
                    return SecurityArea.getAllSecurityAreaAndAssets({}).then(function(data){
                        return data;
                    });
                }
            }
        });
    }
})();
