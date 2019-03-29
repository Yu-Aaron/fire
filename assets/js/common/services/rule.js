/**
 * rule service
 *
 * Description
 * Functions for rule module
 */
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('ruleService', ruleService);

    function ruleService($rootScope, Signature, $state) {

        function createPolicy(section, tab) {
            Signature.createPolicy().then(function (data) {
                $state.go('rule.' + section + '.editor', {
                    'policyId': data.data.value,
                    'tab': tab
                });
            });
        }

        return {
            createPolicy: createPolicy,
            getProtocolType: getProtocolType,
            getRuleCreatedAt: getRuleCreatedAt,
            getSourcePort: getSourcePort,
            getDestinationPort: getDestinationPort
        };

        function getProtocolType(rule) {
            var lst = rule.fields;
            for (var i = 0; i < lst.length; i++) {
                if (lst[i].name === '协议') {
                    return lst[i].value;
                }
            }
            return "";
        }

        function getRuleCreatedAt(rule) {
            if (rule.createdAt) {
                var dt = new Date(rule.createdAt + ' UTC');
                return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
            }
            return "";
        }

        function getSourcePort(rule) {
            var lst = rule.fields;
            for (var i = 0; i < lst.length; i++) {
                if (lst[i].name === 'sourcePort') {
                    return lst[i].value;
                }
            }
            return "";
        }

        function getDestinationPort(rule) {
            var lst = rule.fields;
            for (var i = 0; i < lst.length; i++) {
                if (lst[i].name === 'destinationPort') {
                    return lst[i].value;
                }
            }
            return "";
        }

    }
})();
