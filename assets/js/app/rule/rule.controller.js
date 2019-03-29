/**
 * rule Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.rule')
        .controller('RuleCtrl', RuleCtrl);
//$rootScope,, ruleService, topologyId, Signature, $q, Enum, leftNavCustomMenu,uiCtrl
    function RuleCtrl($rootScope, $state) {
        var vm = this;
        //vm.closeWhitelist = true;
        //vm.closeIpmac = true;
        //if ($rootScope.openWhitelist && $rootScope.isJAXX) {
        //    vm.closeWhitelist = false;
        //}
        //vm.uiEnable = function (target, lv) {
        //    return uiCtrl.isShow(target, lv);
        //};
        //vm.leftNavItemEnabled = leftNavCustomMenu.leftNavItemEnabled;
        //vm.entry = function (section) {
        //    var requests = [];
        //    var userPrivilege;
        //    if (section === 'blacklist') {
        //        userPrivilege = Enum.get('privilege').filter(function (a) {
        //            return a.name === 'BLACKLIST';
        //        });
        //        userPrivilege = userPrivilege && userPrivilege.length ? userPrivilege[0].actionValue : 1; // Default no view right
        //        if (userPrivilege > 1) {
        //            requests.push(Signature.getDeployedPolicy(topologyId.id, 'BLACKLIST'));
        //            requests.push(Signature.getPolicies(topologyId.id, 'BLACKLIST'));
        //            $q.all(requests).then(function (lst) {
        //                var prefix_state = $rootScope.isJAXX ? 'vul' : 'rule';
        //                if (lst[0].data.length) {
        //                    $state.go(prefix_state + '.blacklist', {tab: 'deployedPanel'});
        //                } else if (lst[1].data.length) {
        //                    $state.go(prefix_state + '.blacklist', {tab: 'policyManagement'});
        //                } else {
        //                    ruleService.createPolicy('blacklist', 'signatures');
        //                }
        //            });
        //        }
        //    } else if (section === 'whitelist') {
        //        userPrivilege = Enum.get('privilege').filter(function (a) {
        //            return a.name === 'WHITELIST';
        //        });
        //        userPrivilege = userPrivilege && userPrivilege.length ? userPrivilege[0].actionValue : 1; // Default no view right
        //        if (userPrivilege > 1) {
        //            requests.push(Signature.getDeployedPolicy(topologyId.id, 'WHITELIST'));
        //            requests.push(Signature.getPolicies(topologyId.id, 'WHITELIST'));
        //            $q.all(requests).then(function (lst) {
        //                if (lst[0].data.length) {
        //                    $state.go('rule.whitelist', {tab: 'deployedPanel'});
        //                } else if (lst[1].data.length) {
        //                    $state.go('rule.whitelist', {tab: 'policyManagement'});
        //                } else {
        //                    ruleService.createPolicy('whitelist', 'total');
        //                }
        //            });
        //        }
        //    } else if (section === "networklist") {
        //        userPrivilege = Enum.get('privilege').filter(function (a) {
        //            return a.name === 'WHITELIST';
        //        });
        //        userPrivilege = userPrivilege && userPrivilege.length ? userPrivilege[0].actionValue : 1; // Default no view right
        //        if (userPrivilege > 1) {
        //            requests.push(Signature.getDeployedPolicy(topologyId.id, 'IP_RULE'));
        //            requests.push(Signature.getPolicies(topologyId.id, 'IP_RULE'));
        //            $q.all(requests).then(function (lst) {
        //                if (lst[0].data.length) {
        //                    $state.go('rule.networklist', {tab: 'deployedPanel'});
        //                } else if (lst[1].data.length) {
        //                    $state.go('rule.networklist', {tab: 'policyManagement'});
        //                } else {
        //                    ruleService.createPolicy('networklist', 'total');
        //                }
        //            });
        //        }
        //        // ruleService.createPolicy('networklist', 'learning');
        //    } else if (section === 'learning') {
        //        var prefix_state = $rootScope.isJAXX ? 'ai' : 'rule';
        //        $state.go(prefix_state + '.learning');
        //    } else if (section === 'ipmac' && $rootScope.isJAXX) {
        //        $state.go('unknown.ipmac');
        //    } else if (section === 'ipmacsync' && $rootScope.isJAXX) {
        //        $state.go('unknown.ipmacsync');
        //    } else if (section === 'sync') {
        //        $state.go('rule.sync');
        //    } else if (section === 'maliciousdomain') {
        //        $state.go('rule.maliciousdomain', {tab: 'deployedTab'});
        //    } else {
        //        $state.go('rule.' + section);
        //    }
        //};

        vm.prefixId = "rule";
        vm.subMenus = $rootScope.rootMenu.getChild("RULE");

        //vm.uiEnable = function (description, lv) {
        //    return uiCtrl.isShow(description, lv);
        //};
        vm.expanded = localStorage.getItem('rule:navbar:expanded') === 'true' ? true : false;

        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('rule:navbar:expanded', vm.expanded);
        };

        vm.isActive = function (tab) {
            return $state.current.name.indexOf(tab.getState()) > -1;
        };

        //vm.isActive = function (state) {
        //    return state==="whitelistRoot"?(["ai.learning", "rule.sync", "rule.whitelist.editor", "rule.whitelist.policyDetail", "rule.whitelist", "rule.networklist", "rule.networklist.editor", "rule.networklist.policyDetail"].indexOf($state.current.name)>-1):($state.current.name.indexOf(state) > -1);
        //};
    }
})();
