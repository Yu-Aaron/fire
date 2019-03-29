/**
 * Monitor Signature Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.whitelist')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.whitelist_manager', {
            parent: 'rule',
            url: '/whitelist/manager',
            controller: function(Signature, $q, ruleService, $state){
                var requests = [];
                requests.push(Signature.getDeployedPolicy('WHITELIST'));
                requests.push(Signature.getPolicies('WHITELIST'));
                $q.all(requests).then(function(lst){
                    lst[1].data = _.filter(lst[1].data, function(item){
                        return item._blocksCount > 0;
                    });
                    if (lst[0].data.length){
                        $state.go('rule.whitelist_manager.deploy', {tab:'deployedPanel'});
                    }else if (lst[1].data.length){
                        $state.go('rule.whitelist_manager.deploy', {tab:'policyManagement'});
                    }else{
                        ruleService.createPolicy('whitelist_manager', 'total');
                    }
                });
            }
        }).state('rule.whitelist_manager.editor', {
            parent: 'rule',
            url: '/whitelist/manager/editor/:policyId/:tab',
            controller: 'editorCtrl as editor',
            templateUrl: 'templates/rule/whitelist/editor.html',
            resolve: {
                menuState: function () {
                    return 'rule.whitelist_manager';
                }
                /*state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },
                domainInfo: function (domain) {
                    return domain.getDomain();
                },
                policiesArr: function (Signature) {
                    return Signature.getPolicies('WHITELIST').then(function (data) {
                        return data.data;
                    });
                }*/
            }
        }).state('rule.whitelist_manager.policyDetail', {
            parent: 'rule',
            url: '/whitelist/manager/policyDetail/:policyId',
            controller: 'policyDetailCtrl as policyDetail',
            templateUrl: 'templates/rule/whitelist/policyDetail.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },
                menuState: function () {
                    return 'rule.whitelist_manager';
                }
            }
        }).state('rule.whitelist_manager.deploy', {
            parent: 'rule',
            url: '/whitelist/manager/deploy/:tab',
            controller: 'SignatureCtrl as signature',
            templateUrl: 'templates/rule/whitelist/index.html',
            resolve: {
               /* state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },*/
                deployedPolicyArr: function(Signature, secretKey){ // jshint ignore:line
                    return Signature.getDeployedPolicy("WHITELIST").then(function(data){
                        return data.data;
                    });
                },
                policiesArr: function(Signature, secretKey){ // jshint ignore:line
                    return Signature.getPolicies('WHITELIST').then(function(data){
                        return _.filter(data.data, function(item){
                            return item._blocksCount > 0;
                        });
                    });
                },
                menuState: function () {
                    return 'rule.whitelist_manager';
                }
            }
        });
    }
})();
