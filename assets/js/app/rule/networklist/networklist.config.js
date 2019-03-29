/**
 * Monitor Signature Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.networklist')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.networklist', {
            url: '/rule/networklist/?tab',
            controller: 'networkListCtrl as networkListCtrl',
            templateUrl: 'templates/rule/networklist/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },
                domainInfo: function (domain) {
                    return domain.getDomain();
                },
                deployedPolicyArr: function (Signature, secretKey){ // jshint ignore:line
                    return Signature.getDeployedPolicy("IP_RULE").then(function (data) {
                        return data.data;
                    });
                },
                policiesArr: function (Signature, secretKey){ // jshint ignore:line
                    return Signature.getPolicies('IP_RULE').then(function (data) {
                        return data.data;
                    });
                }
            }
        }).state('rule.networklist.editor', {
            parent: 'rule',
            url: '/rule/networklist/editor/:topologyId?policyId?tab',
            controller: 'networkEditorCtrl as editor',
            templateUrl: 'templates/rule/whitelist/editor.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },
                domainInfo: function (domain) {
                    return domain.getDomain();
                },
                policiesArr: function (Signature) {
                    return Signature.getPolicies('IP_RULE').then(function (data) {
                        return data.data;
                    });
                }
            }
        }).state('rule.networklist.policyDetail', {
            parent: 'rule',
            url: '/rule/networklist/policyDetail/:topologyId?policyId',
            controller: 'policyDetailCtrl as policyDetail',
            templateUrl: 'templates/rule/whitelist/policyDetail.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                }
            }
        });
    }
})();
