/**
 * Monitor Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.monitor')
        .controller('MonitorCtrl', MonitorCtrl)
        .controller('TabCtrl', TabCtrl);
//, uiCtrl, Enum, leftNavCustomMenu, $rootScope
    function MonitorCtrl($state, localStorage,$rootScope) {
        var vm = this;
        vm.prefixId = "monitor";
        vm.subMenus = $rootScope.rootMenu.getChild("MONITOR");
        vm.expanded = localStorage.getItem('monitor:navbar:expanded') === 'true' ? true : false;

        //
        //vm.uiEnable = function (target, lv) {
        //    return uiCtrl.isShow(target, lv);
        //};
        vm.toggleExpand = function () {
            vm.expanded = !vm.expanded;
            localStorage.setItem('monitor:navbar:expanded', vm.expanded);
        };
        //
        //vm.leftNavItemEnabled = leftNavCustomMenu.leftNavItemEnabled;
        //
        vm.isActive = function (tab) {
            return $state.current.name.indexOf(tab.getState()) > -1;
        };
        //
        //vm.isGranted = function (target) {
        //    var level = Enum.get('privilege').filter(function (a) {
        //        return a.name === target;
        //    });
        //    if (target === "INCIDENT") {
        //        level = level.concat(Enum.get('privilege').filter(function (a) {
        //            return a.name === 'EVENT';
        //        }));
        //    }
        //    return level && level[0] && Math.max.apply(Math, level.map(function (l) {
        //            return l.actionValue;
        //        })) > 1;
        //};

        //vm.displayThirdMenus = function (tab) {
        //    if (vm.expanded) {
        //        return false;
        //    }
        //    tab.expand = !tab.expand;
        //};
        //
        //vm.subMenusSelected = function (tab) {
        //    if (vm.expanded) {
        //        return false;
        //    }
        //    if (tab.expand && $state.current.name !== 'monitor.report_event' && $state.current.name !== 'monitor.report_log') {
        //        return true;
        //    }
        //
        //    return false;
        //};
        //
        //vm.isSubMenusActive = function (tab) {
        //    if ($state.current.name === 'monitor.report_event' || $state.current.name === 'monitor.report_log') {
        //        return true;
        //    }
        //    return false;
        //}


        //$rootScope.displaySubMenus = function (tab, expand) {
        //    if (expand) {
        //        return false;
        //    }
        //    tab.expand = !tab.expand;
        //};
        //
        //$rootScope.subMenusSelected = function (tab, expand) {
        //    if (expand) {
        //        return false;
        //    }
        //    if (tab.expand) {
        //        var subMenus = tab.getChilds().filter(function (t) {
        //            return t.getState() === $state.current.name;
        //        });
        //
        //        return subMenus !== null && subMenus.length > 0;
        //    }
        //    return false;
        //};
        //
        //$rootScope.isSubMenusActive = function (tab) {
        //    var subMenus = tab.getChilds().filter(function (t) {
        //        return t.getState() === $state.current.name;
        //    });
        //
        //    return subMenus !== null && subMenus.length > 0;
        //};
    }

    function TabCtrl($state) {
        var vm = this;

        // panel
        vm.activatePanel = function (panel, index) {
            if (index >= 0) {
                vm.active = (panel + index);
            } else {
                vm.active = panel;
                //console.log(vm.active);
            }
        };

        vm.isActive = function (panel, index) {
            if (index >= 0) {
                return vm.active === (panel + index);
            } else {
                return vm.active === panel;
            }
        };

        vm.returnPanel = function (panel, index) {
            //console.log(panel + index);
            return (panel + index);
        };

        if ($state.params.panel) {
            vm.activatePanel($state.params.panel);
        }

        // tab
        vm.activateTab = function (tab) {
            vm.activeTab = tab;
        };

        vm.isActiveTab = function (tab) {
            return vm.activeTab === tab;
        };

        if ($state.params.tab) {
            vm.activateTab($state.params.tab);
        } else {
            vm.activateTab('learning');
        }

        // view
        vm.activateView = function (view) {
            vm.activeView = view;
        };

        vm.isActiveView = function (view) {
            return vm.activeView === view;
        };

        vm.activeBtn = function (btn, ind) {
            if (ind >= 0) {
                //console.log("inside if");
                if (vm.actBtn === (btn + ind)) {
                    vm.actBtn = '';
                } else {
                    //console.log((btn + ind));
                    vm.actBtn = (btn + ind);
                    //console.log(vm.actBtn);
                }
            } else {
                vm.actBtn = btn;
                //console.log(vm.actBtn);
            }
        };

        vm.isActiveBtn = function (btn, ind) {
            if (ind >= 0) {
                return vm.actBtn === (btn + ind);
            } else {
                //console.log(btn);
                return vm.actBtn === btn;
            }
        };
    }
})();
