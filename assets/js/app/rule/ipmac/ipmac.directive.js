(function () {
    'use strict';

    angular
        .module('southWest.rule.ipmac')
        .directive('ipmacTable', ipmacTable);

    function ipmacTable(SecurityArea, $rootScope) {
        var ipmacTableObj = {
            scope: false,
            restrict: 'E',
            require: '^?dtable',
            replace: true,
            templateUrl: '/templates/rule/ipmac/table/table.html',
            link: link
        };

        return ipmacTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            var fields = ['sourceName', 'dpiName', 'destinationName', 'appLayerProtocol'];
            ctrl.disableToolbar = true;
            ctrl.validIP = /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;

            ctrl.open = false;
            ctrl.selectedItems = {};
            ctrl.dropdownAreas = [];
            ctrl.importAreas = [];
            ctrl.setConfig({
                name: 'device',
                pagination: false,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                // search: search,
                fields: fields
            });
            /*ctrl.getValidSecurityAreas = function getValidSecurityAreas() {
                var param = {};
                param['enable'] = 1;
                SecurityArea.getAll(param).then(function (data) {
                    ctrl.allValidAreas = data;
                    ctrl.allValidAreas.forEach(function (area) {
                        if(area._ipmacRefers === '1'){
                            ctrl.importAreas.push(area);
                        }else{
                            ctrl.dropdownAreas.push(area);
                        }
                    })
                });
            }
            ctrl.getValidSecurityAreas();*/
            function getAll(params) {
                params['enable'] = 1;
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                return SecurityArea.getAllSecurityAreaAndAssets(params).then(function (data) {
                    ctrl.allValidAreas = data;
                    ctrl.importAreas = [];
                    ctrl.dropdownAreas = [];
                    ctrl.allValidAreas.forEach(function (area) {
                        if(area._ipmacRefers === '1'){
                            ctrl.importAreas.push(area);
                        }else{
                            ctrl.dropdownAreas.push(area);
                        }
                    });
                    return ctrl.importAreas;
                });
            }

            function getCount(params) {
                return SecurityArea.getCount(params);
            }

            /*function search(q) {
                return Device.search('FACTORY_DEVICE', q, $rootScope.currentIp);
            }*/

            scope.checkAll = function () {
                var enabledDevice = ctrl.table.filter(function (d) {
                    return d._ipmacBoolean;
                });
                ctrl.enableIpmac = enabledDevice ? enabledDevice.length > 0 : false;
            };

            ctrl.initSelectAll = function () {
                ctrl.selectAll = true;
                for (var k = 0; k < ctrl.importAreas.length; k++) {
                    for(var x=0; x< ctrl.importAreas[k].assetInfos.length; x++){
                        if(ctrl.importAreas[k].assetInfos[x]._ipmac === 1){
                            ctrl.importAreas[k].assetInfos[x]._ipmacBoolean = true;
                        }else{
                            ctrl.importAreas[k].assetInfos[x]._ipmacBoolean = false;
                        }
                    }
                    var enabledAssets = ctrl.importAreas[k].assetInfos.filter(function (d) {
                        return d._ipmacBoolean;
                    });

                    ctrl.importAreas[k]._ipmacBoolean = enabledAssets ? enabledAssets.length>0:false;
                }
                var enabledAreas = ctrl.importAreas.filter(function (d) {
                   return d._ipmacBoolean;
                });
                ctrl.enableIpmac = enabledAreas ? enabledAreas.length>0:false;
            };

            ctrl.selectAllorNone = function () {
                if (ctrl.selectAll) {
                    ctrl.selectAll = false;
                    for (var k = 0; k < ctrl.table.length; k++) {
                        for(var x=0; x< ctrl.table[k].assetInfos.length; x++){
                            ctrl.table[k].assetInfos[x]._ipmacBoolean = false;
                        }
                        ctrl.table[k]._ipmacBoolean = false;
                    }
                } else {
                    ctrl.selectAll = true;
                    for (var i = 0; i < ctrl.table.length; i++) {
                        for (var j = 0; j < ctrl.table[i].assetInfos.length; j++) {
                            ctrl.table[i].assetInfos[j]._ipmacBoolean = true;
                        }
                        ctrl.table[i]._ipmacBoolean = true;
                    }
                }
                ctrl.enableIpmac =  ctrl.selectAll ? true :  ctrl.enableIpmac;
                ctrl.current = true;
            };

            ctrl.import = function () {
                ctrl.open = false;
                var uncheckDropdownAreas = ctrl.dropdownAreas;
                var selectedItems = ctrl.selectedItems;
                for(var areaName in selectedItems) {
                    if(selectedItems.hasOwnProperty(areaName) && selectedItems[areaName]){
                        for(var i=0; i< ctrl.dropdownAreas.length; i++){
                            if(ctrl.dropdownAreas[i].name === areaName){
                                ctrl.importAreas.push((ctrl.dropdownAreas[i]));
                                uncheckDropdownAreas.splice(i,1);
                            }
                        }
                    }
                }
                ctrl.dropdownAreas = uncheckDropdownAreas;
                ctrl.selectedItems = [];
            };

            ctrl.deleteSecurityArea = function (data) {
                 for(var i=0; i<ctrl.importAreas.length; i++){
                    if(ctrl.importAreas[i].name === data.name){
                        ctrl.dropdownAreas.push(data);
                        ctrl.importAreas.splice(i, 1);
                        break;
                    }
                 }
            };

            $rootScope.$on('ipmacTableRefresh', function (event, callback) {
                ctrl.refresh();
                callback();
            });

            ctrl.toggleCurrent = function (item, value) {
                if(value !== undefined) {
                    item.current = value;
                } else {
                    item.current = !item.current;
                }
            };
        }
    }
})();
