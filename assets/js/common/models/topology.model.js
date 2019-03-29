/**
 * Topology Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Topology', TopologyModel);

    function TopologyModel($rootScope, $resource, $http, URI, topologyId, UCD) {
        var tempurl = URI + '/topologies/';

        var Topology = $resource(URI + '/topologies/:id', {
            id: '@id'
        }, {
            'update': {
                method: 'PUT'
            }
        });

        var service = {
            get: get,
            getCurrentTopo: getCurrentTopo,
            setCurrentTopo: setCurrentTopo,
            getTopo: getTopo,
            getCount: getCount,
            getZones: getZones,
            getFakeTopo: getFakeTopo,
            getTopologies: getTopologies,
            getCurrentDiscover: getCurrentDiscover,
            getDiscoverSkeleton: getDiscoverSkeleton,
            cleanup: cleanup,
            update: update,
            search: search,
            deployAllEndpoint: deployAllEndpoint,
            upload: uploadTopology,
            uploadBackbone: uploadBackboneTopology,
            uploadImage: uploadTopologyImage,
            downloadLink: downloadLink,
            downloadImage: downloadTopologyImage,
            updatePosition: updatePosition,
            getNodes: getNodes,
            getDeviceNodes: getDeviceNodes,
            getLinks: getLinks,
            getDevices: getDevices,
            stopTopologyDiscover: stopTopologyDiscover,
            setMemo: setMemo,
            updateTopologyDiscoverWithoutSkeleton: updateTopologyDiscoverWithoutSkeleton,
            updateLink: updateLink,
            addLink: addLink,
            deleteLink: deleteLink,
            validateTopo: validateTopo,
            getAllDeviceFull: getAllDeviceFull,
            changeTopoName: changeTopoName,
            getAllSecurityZones: getAllSecurityZones
        };
        return service;

        function getAllSecurityZones(){

            return $http.get(tempurl + '/getAllSecurityZones').then(function (data) {
                return data.data;
            }, function () {
                var json = '[{"hidden":false, "nodeZoneId":"05322031-eb2a-4fca-86d2-2918567d71fb", "zoneName":"工作站111"}]';
                return angular.fromJson(json);
            });
        }
        //////////
        function get(params) {
            return Topology.query(params).$promise;
        }

        function validateTopo(data) {
            return $http.post(tempurl + topologyId.id + "/validation", {
                nodes: data.nodes,
                links: data.links,
                devices: data.devices,
                models: data.models
            });
        }

        function getFakeTopo() {
            return $http.get('/api/v2.0/topologies/getFakeTopo');
        }

        function getZones(ip, id) {
            return $http.get(UCD.getUrl(ip) + tempurl + id + '/allzones');
        }

        function updatePosition(node) {
            return $http.post(tempurl + 'node/' + node.id + '/nodeview', {
                'x': node.x,
                'y': node.y
            });
        }

        function updateLink(oldLinks, topoId) {
            return $http.put(tempurl + topoId + '/links', oldLinks
            );
        }

        function cleanup(topoId) {
            return $http.put(tempurl + topoId + '/cleanup');
        }

        function addLink(newLinks, topoId) {
            return $http.post(tempurl + topoId + '/links', newLinks
            );
        }

        function deleteLink(deleteLinks, topoId) {
            return $http({
                url: tempurl + topoId + '/links',
                method: 'DELETE',
                data: deleteLinks,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        function getCurrentDiscover() {
            return $http.get(URI + '/topologydiscover/currentdiscover');
        }

        function getCurrentTopo() {
            return $http.get(tempurl).then(function (data) {
                var topologies = data.data;
                var current = {};
                for (var a = 0; a < topologies.length; a++) {
                    if (topologies[a].currentTopology) {
                        current = topologies[a];
                        break;
                    }
                }
                return current;
            });
        }

        function setCurrentTopo(topo) {
            return $http.put(tempurl + topo.topologyId + '/current');
        }

        function getTopologies() {
            return $http.get(tempurl);
        }

        function getTopo(id, ip) {
            return $http.get(UCD.getUrl(ip) + tempurl + UCD.getDomain(ip, id).topoId).then(function (data) {
                return data.data;
            });
        }

        function getLinks(id, ip) {
            return $http.get(UCD.getUrl(ip) + tempurl + UCD.getDomain(ip, id).topoId + '/links');
        }

        function getDevices(id, ip) {
            return $http.get(UCD.getUrl(ip) + tempurl + UCD.getDomain(ip, id).topoId + '/devices').then(function (data) {
                topologyId.hasNode = false;
                if (data.data.length) {
                    topologyId.hasNode = true;
                }
                return data;
            });
        }

        function getNodes(id, ip) {
            return $http.get(UCD.getUrl(ip) + tempurl + UCD.getDomain(ip, id).topoId + '/nodes').then(function (data) {
                return data;
            });
        }

        function getDeviceNodes(deviceId, ip) {
            return $http.get(UCD.getUrl(ip) + tempurl + 'device/' + deviceId + '/nodes').then(function (data) {
                return data.data;
            });
        }

        function getDiscoverSkeleton(taskId) {
            return $http.get(URI + '/topologydiscover/skeleton/' + taskId);
        }

        function getCount(status) {
            return Topology.get({
                fields: 'count',
                status: status
            }).$promise;
        }

        function update(params) {
            return Topology.update(params).$promise;
        }

        function setMemo(topologyId, memo) {
            return $http.put(tempurl + topologyId + '/memo', {
                memo: memo
            });
        }

        function stopTopologyDiscover() {
            return $http.put(URI + '/topologydiscover/stop');
        }

        function search(q) {
            return $http({
                url: '/api/v2.0/search',
                params: {
                    q: q
                }
            });
        }

        function deployAllEndpoint(topologyId) {
            return $http.put(tempurl + topologyId + '/configdevices');
        }

        function uploadTopology(file, topologyId) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: URI + '/files/topology/' + topologyId + '/fileupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function uploadBackboneTopology(file) {
            var fd = new FormData();
            fd.append('file', file);
            return $http({
                url: URI + '/files/topologydiscover/topologyskeletonupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function uploadTopologyImage(file, topologyId) {
            var fd = new FormData();
            fd.append('topologyImage', file);
            return $http({
                url: URI + '/files/topology/' + topologyId + '/imageupload',
                method: 'POST',
                data: fd,
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }

        function downloadLink(id) {
            return $http.get(URI + '/files/topology/' + id + '/filedownload').then(function (data) {
                return data.data;
            });
        }

        function downloadTopologyImage() {
            return '/images/test/test-topology-image.jpg';
        }

        function updateTopologyDiscoverWithoutSkeleton(topologyid) {
            return $http.put(URI + '/topologydiscover/' + topologyid + '/startwithoutskeleton');
        }

        function getAllDeviceFull(id) {
            if (id) {
                return this.getDevices(id).then(function (data) {
                    return data.data;
                });
            } else {
                return [];
            }
        }

        function changeTopoName(topologyid, name) {
            var data = {
                name: name
            };
            return $http({
                url: URI + '/topologies/topologyid/' + topologyid,
                method: 'PUT',
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
})();
