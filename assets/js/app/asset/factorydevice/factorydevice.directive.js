/**
 * Asset Factory Device Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.asset.factorydevice')
        .directive('factoryDeviceTable', factoryDeviceTable)
        .directive('nodeZoneTable', nodeZoneTable);

    function factoryDeviceTable(Device, topologyId, deviceTypeService) {
        var deviceTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/asset/factorydevice/factoryDeviceTable.html',
            link: link
        };

        return deviceTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;
            var filter = 'category eq FACTORY_DEVICE';
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
                //To visit all in one device:
                //return Device.getCount(payload, null, '10.0.10.226');
                return Device.getCount(payload, topologyId.id);
            }

            function search(q) {
                return Device.search('FACTORY_DEVICE', q);
            }

            ctrl.getType = function (type) {
                return deviceTypeService.getFactoryType(type);
            };
        }
    }

    function nodeZoneTable(Device) {
        var nodeZoneTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/asset/factorydevice/nodeZoneTable.html',
            link: link
        };

        return nodeZoneTableObj;

        //////////
        function link(scope, element, attr, ctrl) {
            ctrl.disableToolbar = true;

            var filter = "zoneName ne 'NA'";
            var orderby = 'zoneName';
            ctrl.setConfig({
                name: 'nodeZone',
                pagination: true,
                scrollable: false,
                totalCount: true,
                getAll: getAll,
                getCount: getCount,
                search: search
            });

            function getAll(params) {
                if (!params['$orderby'] || params['$orderby'] === '') {
                    params['$orderby'] = orderby;
                }
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getAllNodeZone(payload);
            }

            function getCount(params) {
                var payload = params || {};
                payload['$filter'] = filter;
                return Device.getNodeZoneCount(payload);
            }

            function search(input) {
                var payload = {};
                payload['$orderby'] = orderby;
                payload['$filter'] = filter;
                payload['searchContent'] = input;
                return Device.getAllNodeZone(payload);
            }
        }
    }

})();
