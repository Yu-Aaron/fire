/**
 * Dashboard Config
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.dashboard')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('dashboard', {
            parent: 'root',
            abstract: true,
            views: {
                '@': {
                    controller: 'DashboardCtrl as dashboard',
                    templateUrl: 'templates/dashboard/index.html'
                }
            },
            resolve: {
                //topo: function (Topology, init, domain, topologyId) {
                //    if (localStorage.getItem('topologyId')) {
                //        topologyId.id = localStorage.getItem('topologyId');
                //        return Topology.getDevices(localStorage.getItem('topologyId')).then(function () {
                //            var domainInfos = {"topologyId": localStorage.getItem('topologyId')};
                //            return domainInfos;
                //        }, function () {
                //            console.log("failed");
                //        });
                //    } else {
                //        return domain.getDomain().then(function (data) {
                //            if (data && data.length > 0 && data[0].domainInfo) {
                //                data[0].domainInfo.topologyId = data[0].domainInfo.currentTopologyId;
                //                localStorage.setItem('topologyId', data[0].domainInfo.topologyId);
                //                topologyId.id = localStorage.getItem('topologyId');
                //                Topology.getDevices(data[0].domainInfo.currentTopologyId).then(function () {
                //                    return data[0].domainInfo;
                //                });
                //            }
                //            return {};
                //        });
                //    }
                //}
            }
        }).state('other', {});
    }

})();
