/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.securityaudit')
        .controller('SecurityAuditCtrl', SecurityAuditCtrl);

    function SecurityAuditCtrl($scope, $state, $rootScope, uiCtrl) {
        var vm = this;

        //vm.showImportBtn = ($rootScope.VERSION_NUMBER.slice(-4) === '-C05');

        vm.closeAudit = true;
        vm.closeContent = true;

        vm.expanded = localStorage.getItem('securityaudit:navbar:expanded') === 'true' ? true : false;

        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('securityaudit:navbar:expanded', vm.expanded);
        };

        vm.isActive = function (state) {
            if (state === "protocolaudit" && $state.current.name === "securityaudit.audittable") {
                return true;
            }
            if (state === "audit" || state === 'dpidata' || state === 'dpidevice_data' || state === 'icdevice_data') {
                if ($state.current.name === 'securityaudit.audittable.dpidata' || $state.current.name === 'securityaudit.audittable.dpidevicedata' || $state.current.name === 'securityaudit.audittable.icdevicedata' || $state.current.name === 'audit.dpidevice_data' || $state.current.name === 'audit.dpidevice_data.detail' || $state.current.name === 'audit.icdevice_data' || $state.current.name === 'audit.icdevice_data.detail') {
                    return vm.closeAudit;
                }
            }
            if (state === "behavioraudit" && ($state.current.name === "securityaudit.audittable.behavioraudit" || $state.current.name === "audit.behaviortimecontrol")) {
                return true;
            }
            if (state === "contentaudit" || state === 'forumpost' || state === 'searchengine') {
                if ($state.current.name === 'securityaudit.audittable.forumpost' || $state.current.name === 'securityaudit.audittable.searchengine' || $state.current.name === "audit.timecontrol") {
                    return vm.closeContent;
                }
            }
            return false;
        };

        vm.isActiveSub = function (state) {
            if (state === "dpidata" && $state.current.name === 'securityaudit.audittable.dpidata') {
                return true;
            }
            if (state === 'dpidevice_data') {
                if ($state.current.name === 'audit.dpidevice_data' || $state.current.name === 'audit.dpidevice_data.detail' || $state.current.name === 'securityaudit.audittable.dpidevicedata') {
                    return true;
                }
            }
            if (state === 'icdevice_data') {
                if ($state.current.name === 'audit.icdevice_data' || $state.current.name === 'audit.icdevice_data.detail' || $state.current.name === 'securityaudit.audittable.icdevicedata') {
                    return true;
                }
            }
            if (state === 'forumpost') {
                if ($state.current.name === 'securityaudit.audittable.forumpost' || ($state.current.name === "audit.timecontrol" && $rootScope.menuName && $rootScope.menuName === "forumpost")) {
                    return true;
                }
            }
            if (state === 'searchengine') {
                if ($state.current.name === 'securityaudit.audittable.searchengine' || ($state.current.name === "audit.timecontrol" && $rootScope.menuName && $rootScope.menuName === "searchengine")) {
                    return true;
                }
            }
            return false;
        };

        vm.uiEnable = function (target, lv) {
            return uiCtrl.isShow(target, lv);
        };

        vm.entry = function (tab) {
            if (tab.getState() === "protocolaudit") {
                $state.go("securityaudit.audittable");
            }
            if (tab.getState() === "dpidata") {
                $state.go("securityaudit.audittable.dpidata");
            }
            if (tab.getState() === "dpidevice_data") {
                $state.go("securityaudit.audittable.dpidevicedata");
            }
            if (tab.getState() === "icdevice_data") {
                $state.go("securityaudit.audittable.icdevicedata");
            }
            if (tab.getState() === "behavioraudit") {
                $state.go("securityaudit.audittable.behavioraudit");
            }
            if (tab.getState() === "forumpost") {
                $state.go("securityaudit.audittable.forumpost");
            }
            if (tab.getState() === "searchengine") {
                $state.go("securityaudit.audittable.searchengine");
            }
        };

        vm.displayNav = true;

        if (!$rootScope.isJAXX) {
            vm.displayNav = false;
        }

        vm.notJAStyle = {};

        if (!$rootScope.isJAXX) {
            vm.notJAStyle = {"margin-left": "-25px", "margin-right": "-20px", "margin-top": "-10px"};
        }
    }
})();
