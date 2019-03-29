/**
 * Rule Malicious Domain Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule.maliciousdomain')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('rule.maliciousdomain', {
            url: '/rule/maliciousdomain?panel',
            controller: 'MaliciousDomainCtrl as maliciousdomain',
            templateUrl: 'templates/rule/maliciousdomain/index.html',
            resolve: {
                state: function ($rootScope) {
                    $rootScope.currentState = 'POLICY';
                },
                switchOn: function (System, secretKey){ // jshint ignore:line
                    return System.getJobStrategyInfo('MALICIOUS_DOMAIN_SCAN').then(function (data) {
                        return data.data.schedulingJob.jobData === 'true' ? true : false;
                    });
                },
                policyId: function (Signature, domain, secretKey){ // jshint ignore:line
                    return domain.getDomain().then(function (data) {
                        return Signature.getMaliciousDomainPolicy(data[0].domainInfo.currentTopologyId).then(function (data) {
                            return data.data[0].policyId;
                        });
                    });
                },
                waitingDomainCount: function (Signature, secretKey){ // jshint ignore:line
                    return Signature.getMaliciousDomainCount({
                        '$select': ['domainName'],
                        '$filter': 'deployStatus ne DEPLOYED'
                    });
                },
                deployedDomainCount: function (Signature, secretKey){ // jshint ignore:line
                    return Signature.getMaliciousDomainCount({
                        '$select': ['domainName'],
                        '$filter': 'deployStatus eq DEPLOYED'
                    });
                }
            }
        });
    }
})();
