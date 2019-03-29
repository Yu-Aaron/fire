/**
 * unknown device protection Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.unknown')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('unknown', {
            parent: 'dashboard',
            abstract: true,
            controller: 'RuleCtrl as unknown',
            templateUrl: 'templates/unknown/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                }
            }

        }).state('unknown.ipmac', {
            url: '/unknown/ipmac/',
            controller: 'IPMACCtrl as ipmac',
            templateUrl: 'templates/rule/ipmac/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },
                allDeviceFull: function ($stateParams, Topology, domain) {
                    return domain.getDomain().then(function (data) {
                        ///////// use the first domain info object by default
                        return Topology.getDevices(data[0].domainInfo.currentTopologyId);
                    });
                }
            }

        }).state('unknown.ipmacsync', {
            url: '/unknown/ipmacsync/',
            controller: 'ipmacsyncCtrl as ipmacsyncCtrl',
            templateUrl: 'templates/rule/ipmacsync/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },
                allDeviceFull: function ($stateParams, Topology, domain) {
                    return domain.getDomain().then(function (data) {
                        ///////// use the first domain info object by default
                        return Topology.getDevices(data[0].domainInfo.currentTopologyId);
                    });
                }
            }

        });
    }
})();
