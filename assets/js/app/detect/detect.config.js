/*

 detect.config

 */
(function () {
    'use strict';

    angular
        .module('southWest.detect')
        .config(config);

    function config($stateProvider) {
        $stateProvider.state('detect', {
            parent: 'dashboard',
            url: '/detect?panel',
            controller: 'DetectCtrl as detect',
            templateUrl: 'templates/detect/index.html',
            zhName: '入侵检测',
            resolve: {
                intrusionDetectionId: function (Topology, Detect, domain) {
                    return domain.getDomain().then(function (data) {
                        //console.log(data[0].domainInfo.currentTopologyId);
                        if (!data[0].domainInfo.currentTopologyId) {
                            data[0].domainInfo.currentTopologyId = 0;
                        }
                        return Detect.getId(data[0].domainInfo.currentTopologyId);
                    });
                },
                //intrusionDetectionId: function (Topology, Detect) {
                //  return Topology.getCurrentTopo().then(function (data) {
                //    if(!data.topologyId){
                //      data.topologyId = 0;
                //    }
                //    return Detect.getId(data.topologyId);
                //  });
                //},
                vulnerabilityCount: function (Detect) {
                    return Detect.getVulnerabilityCount().then(function (data) {
                        return data;
                    });
                },
                state: function ($rootScope) {
                    $rootScope.currentState = 'INTRUSION_DETECTION';
                }
            }
        });
    }
})();
