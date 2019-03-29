/**
 * object Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.object')
        .controller('ObjectCtrl', ObjectCtrl);

    function ObjectCtrl($rootScope, $scope, $state) {
        var vm = this;

        vm.prefixId = "object";
        vm.subMenus = $rootScope.rootMenu.getChild("OBJECT");
        //将当前active的二级菜单子菜单设置为expand
        vm.subMenus.getChilds().some(function(menu){
            if($rootScope.isSubMenusActive(menu)){
                $rootScope.displaySubMenus(menu);
                menu.expanded = true;
                return true;
            }
        });

        //判断二级菜单及子菜单跳转的target state
        vm.entry = function (state, target) {
            vm.currentTarget = target;
            vm.currentState = state;
            //所有的state内容都时conf.json中配置的
            if (state === 'ip_pool') {
                $state.go('object.networkassets.ippool');
            } else if (state === 'security_domain') {
                $state.go('object.networkassets.securitydomain');
            } else if (state === 'device_assets') {
                $state.go('object.networkassets.device');
            } else if (state === 'svc_predefine') {
                $state.go('object.service.predefine');
            } else if (state === 'svc_define') {
                $state.go('object.service.define');
            } else if (state === 'app_predefine') {
                $state.go('object.app.predefine');
            } else if (state === 'app_define') {
                $state.go('object.app.define');
            } else {
                $state.go('object.' + state);
            }
        };

        //二级菜单子菜单是否选中
        vm.isActive = function (tab) {
            return $state.current.name.indexOf(tab.getState()) > -1;
        };

        //导航栏最小化切换
        vm.expanded = localStorage.getItem('object:navbar:expanded') === 'true' ? true : false;
        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('object:navbar:expanded', vm.expanded);
        };
    }
})();
