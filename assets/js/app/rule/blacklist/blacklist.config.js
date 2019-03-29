/**
 * Monitor Signature Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.blacklist')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.blacklist', {
            url: '/blacklist/:tab',
            controller: 'blacklistSignatureCtrl as signature',
            templateUrl: 'templates/rule/blacklist/index.html',
            resolve: {
                deployedPolicyArr: function(Signature, secretKey){ // jshint ignore:line
                    return Signature.getDeployedPolicy("BLACKLIST").then(function(data){
                        return data.data;
                    });
                },
                policiesArr: function(Signature, secretKey){ // jshint ignore:line
                    return Signature.getPolicies('BLACKLIST').then(function(data){
                        return _.filter(data.data, function(item){
                            return item._blocksCount > 0;
                        });
                    });
                }
            }
        }).state('rule.blacklist.editor', {
            parent: 'rule',
            url: '/blacklist/editor/:policyId/:tab',
            controller: 'blacklistEditorCtrl as editor',
            templateUrl: 'templates/rule/blacklist/editor.html',
            resolve: {
                policiesArr: function(Signature, secretKey){ // jshint ignore:line
                    return Signature.getPolicies('BLACKLIST').then(function(data){
                        return _.filter(data.data, function(item){
                            return item._blocksCount > 0;
                        });
                    });
                },
                menuState: function () {
                    return 'rule.blacklist';
                }
            }
        }).state('rule.blacklist.policyDetail', {
            parent: 'rule',
            url: '/blacklist/policyDetail/:policyId',
            controller: 'blacklistPolicyDetailCtrl as policyDetail',
            templateUrl: 'templates/rule/blacklist/policyDetail.html',
            resolve: {
                menuState: function () {
                    return 'rule.blacklist';
                }
            }
        });
    }
})();
