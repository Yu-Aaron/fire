/**
 * systemUser Filter
 * Created By: Alan
 * Date:       28/05/2015
 */
(function () {
    'use strict';

    angular
        .module('southWest.filters')
        .filter('targetValueReformat', targetValueReformat);

    function targetValueReformat() {
        return function (value) {
            // console.log(value);
            var map = {
                USER_MANAGEMENT: 'User Management',
                POLICY: 'Policy',
                REAL_TIME_PROTECTION: 'Real Time Protection',
                DOMAIN_SUBNET: 'Doman Subnet',
                DEVICE_MANAGEMENT: 'Device Management',
                AUDIT_MANAGEMENT: 'Audit Management',
                TOPOLOGY: 'Topology',
                STRATEGY_MANAGEMENT: 'Strategy Management',
                STRUCTURE_SAFETY: 'Structure Safety',
                PRIVATE_PROTOCOL: 'Private Protocol',
                ATTACKPATH: 'AttackPath',
                SETTINGS_POLICY: 'System Management',
                INTRUSION_DETECTION: 'Intrusion Detection'
            };

            return map[value] || value;
        };
    }

})();

