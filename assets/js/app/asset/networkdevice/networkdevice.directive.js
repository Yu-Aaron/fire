/**
 * Asset Network Device Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.networkdevice')
        .directive('networkDeviceTable', networkDeviceTable);

    function networkDeviceTable(Device, topologyId, deviceTypeService) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/asset/networkdevice/networkDeviceTable.html',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            var filter = 'category eq NETWORK_DEVICE';
            ctrl.setConfig({
                name: 'device',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = 'name';
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAll(payload);
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getCount(payload, topologyId.id);
            }

            function search(q) {
                return Device.search('NETWORK_DEVICE', q);
            }

            ctrl.getType = function (type) {
                return deviceTypeService.getNetworkType(type);
            };
        }
    }

})();
