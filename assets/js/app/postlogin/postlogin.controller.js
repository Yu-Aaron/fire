/**
 * PostLogin Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.postlog')
        .controller('PostLogCtrl', PostLogCtrl);

    function PostLogCtrl($state) {
        var vm = this;

        vm.$state = $state;
        vm.tabs = [];

        vm.tabs[0] = [{
            state: 'Topology',
            name: '网络拓扑',
            enabled: true
        }, {
            state: 'monitor.overview',
            name: '实时监控',
            enabled: true
        }, {
            state: 'safety',
            name: '安全性分区',
            enabled: true
        }, {
            state: 'other',
            name: '结构安全性'
        }, {
            state: 'attack',
            name: '攻击路径',
            enabled: true

        }];
        vm.tabs[1] = [{
            state: 'detect',
            name: '入侵检测',
            enabled: true
        }, {
            state: 'track',
            name: '事件追踪',
            enabled: true
        }, {
            state: 'process',
            name: '流程审计',
            enabled: true
        }, {
            state: 'other',
            name: '漏洞扫描'
        }, {
            state: 'other',
            name: '完整性验证'
        }, {
            state: 'other',
            name: '优化方案',
        }];
        vm.tabs[2] = [{
            state: 'report',
            name: '报告管理',
            enabled: true
        }];
    }
})();
