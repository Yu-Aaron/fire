/**
 * Created by gaohui on 16-11-2.
 */


(function () {
    'use strict';

    angular
        .module('southWest.setting.security_operation')
        .directive("updateInfoTable", updateInfoTable);

    function updateInfoTable(System) {
        var updateObj = {
            scope: true,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/setting/security_operation/update-info-table.html',
            link: link
        };

        return updateObj;

        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            ctrl.setConfig({
                pagination: false,
                scrollable: false,
                totalCount: false,
                getAll: getAll,
                getCount: getCount
            });

            function getAll() {
                return System.getAllUpgradeInfo();
            }

            function getCount() {
                return System.getAllUpgradeInfo().then(function (data) {
                    return data.length;
                });
            }
        }
    }
})();
