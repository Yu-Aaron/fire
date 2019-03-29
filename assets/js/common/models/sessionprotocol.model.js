/**
 * SessionProtocol Model
 *
 * Description
 */

(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('ProtocolModel', ProtocolModel);

    function ProtocolModel($q, $http, URI) {
        var url = URI + '/auditlogs';

        var service = {
            get: get,
            getPoolDetails: getPoolDetails,
            getLineDetails: getLineDetails
        };

        return service;

        //////////
        function get(protocol, srcIP, dstIp, starttime, endtime) {
            return $http.get(url + '/sessionprotocol/?starttime=' + starttime + '&endtime=' + endtime + '&protocol=' + protocol + '&srcIp=' + srcIP + '&dstIp=' + dstIp, {timeout: 300000}).then(function (data) {
                var poolsAndLines = [];
                var pools = [];
                var otherpools = [];
                var lines = [];
                var totalCount = 0;
                data.data.map(function (m) {
                    if ((m.srcPoolName === "none" || m.dstPoolName === "none") && otherpools.length === 0) {
                        otherpools.push({
                            'poolName': '防火墙外地址池',
                            'poolId': '',
                            'ipRange': '',
                            'SecAreaName': ''
                        });
                    }

                    if (m.srcPoolName !== "none" && !existPoolName(pools, m.srcPoolName)) {
                        pools.push({
                            'poolName': m.srcPoolName,
                            'poolId': m.srcPoolId,
                            'ipRange': m.srcPoolAddress === "none" ? '' : m.srcPoolAddress,
                            'SecAreaName': m.srcSecAreaName === "none" ? '' : m.srcSecAreaName
                        });
                    }

                    if (m.dstPoolName !== "none" && !existPoolName(pools, m.dstPoolName)) {
                        pools.push({
                            'poolName': m.dstPoolName,
                            'poolId': m.dstPoolId,
                            'ipRange': m.dstPoolAddress === "none" ? '' : m.dstPoolAddress,
                            'SecAreaName': m.dstSecAreaName === "none" ? '' : m.dstSecAreaName
                        });
                    }

                    var existLine = _.find(lines, function (l) {
                        return l.protocolName === m.protocolName;
                    });


                    if (existLine !== undefined && existLine.protocolName !== undefined && existLine.protocolName !== null) {
                        existLine.data.push({
                            'srcPool': m.srcPoolName === "none" ? "防火墙外地址池" : m.srcPoolName,
                            'dstPoolName': m.dstPoolName === "none" ? "防火墙外地址池" : m.dstPoolName,
                            'srcPoolId': m.srcPoolId,
                            'dstPoolId': m.dstPoolId,
                            'value': m.count
                        });

                        totalCount += m.count;
                    }
                    else {
                        lines.push({
                            'protocolName': m.protocolName,
                            data: [{
                                'srcPool': m.srcPoolName === "none" ? "防火墙外地址池" : m.srcPoolName,
                                'dstPoolName': m.dstPoolName === "none" ? "防火墙外地址池" : m.dstPoolName,
                                'srcPoolId': m.srcPoolId,
                                'dstPoolId': m.dstPoolId,
                                'value': m.count
                            }]
                        });

                        totalCount += m.count;
                    }
                });

                poolsAndLines.push(_.sortBy(pools, 'SecAreaName'));
                poolsAndLines.push(otherpools);
                poolsAndLines.push(lines);
                poolsAndLines.push({"average": lines.length === 0 ? totalCount : totalCount / lines.length});
                return poolsAndLines;
            });
        }

        function existPoolName(pools, poolName) {
            var existPools = _.find(pools, function (p) {
                return p.poolName === poolName;
            });

            return existPools !== undefined && existPools.poolName !== undefined && existPools.poolName !== null;
        }

        function getPoolDetails(poolId, starttime, endtime) {
            return $http.get(url + '/sessionprotocol/poolId/' + poolId + '/?starttime=' + starttime + '&endtime=' + endtime, {timeout: 300000}).then(function (data) {
                var assets = [];

                var assetsName = [];

                var otherAsset = [];

                var otherAssetName = [];

                var protocols = [];

                var pooldatas = [];

                data.data.map(function (m) {
                    //m.protocolName = (m.protocolName==='modbus'?'Modbus-TCP':m.protocolName);
                    if (m.srcPoolId === poolId) {
                        if (!_.contains(assets, m.srcIp)) {
                            assets.push(m.srcIp);
                            assetsName.push(m.srcName);
                        }
                    }
                    else {
                        if (!_.contains(otherAsset, m.srcIp)) {
                            otherAsset.push(m.srcIp);
                            otherAssetName.push(m.srcName);
                        }
                    }

                    if (m.dstPoolId === poolId) {
                        if (!_.contains(assets, m.dstIp)) {
                            assets.push(m.dstIp);
                            assetsName.push(m.dstName);
                        }
                    }
                    else {
                        if (!_.contains(otherAsset, m.dstIp)) {
                            otherAsset.push(m.dstIp);
                            otherAssetName.push(m.dstName);
                        }
                    }

                    var protocol = _.find(protocols, function (p) {
                        return p.protocolName === m.protocolName;
                    });

                    if (protocol !== undefined && protocol.protocolName !== undefined && protocol.protocolName !== null) {
                        protocol.data.push({"srcIp": m.srcIp, "dstIp": m.dstIp});
                    }
                    else {
                        protocols.push({"protocolName": m.protocolName, data: [{"srcIp": m.srcIp, "dstIp": m.dstIp}]});
                    }
                });

                pooldatas.push(assets);
                pooldatas.push(otherAsset);
                pooldatas.push(protocols);
                pooldatas.push(assetsName);
                pooldatas.push(otherAssetName);
                return pooldatas;
            });
        }

        function getLineDetails(protocolName, srcPoolId, dstPoolId, starttime, endtime) {
            //protocolName = (protocolName==='Modbus-TCP'?'modbus':protocolName);
            return $http.get(url + '/sessionprotocol/protocol/' + protocolName + '/srcPoolId/' + srcPoolId + '/dstPoolId/' + dstPoolId + '/?starttime=' + starttime + '&endtime=' + endtime, {timeout: 300000}).then(function (data) {
                var sourcePoolAssets = [];
                var destinationsPoolAssets = [];
                var protocols = [];
                var linedatas = [];
                var sourcePoolAssetsName = [];
                var destinationsPoolAssetsName = [];

                data.data.map(function (m) {
                    //m.protocolName = (m.protocolName==='modbus'?'Modbus-TCP':m.protocolName);
                    if (m.srcPoolId === srcPoolId && !_.contains(sourcePoolAssets, m.srcIp) && !_.contains(destinationsPoolAssets, m.srcIp)) {
                        sourcePoolAssets.push(m.srcIp);
                        sourcePoolAssetsName.push(m.srcName);
                    }
                    else {
                        if (m.srcPoolId === dstPoolId && !_.contains(sourcePoolAssets, m.srcIp) && !_.contains(destinationsPoolAssets, m.srcIp)) {
                            destinationsPoolAssets.push(m.srcIp);
                            destinationsPoolAssetsName.push(m.srcName);
                        }
                    }

                    if (m.dstPoolId === dstPoolId && !_.contains(destinationsPoolAssets, m.dstIp) && !_.contains(sourcePoolAssets, m.dstIp)) {
                        destinationsPoolAssets.push(m.dstIp);
                        destinationsPoolAssetsName.push(m.dstName);
                    }
                    else {
                        if (m.dstPoolId === srcPoolId && !_.contains(destinationsPoolAssets, m.dstIp) && !_.contains(sourcePoolAssets, m.dstIp)) {
                            sourcePoolAssets.push(m.dstIp);
                            sourcePoolAssetsName.push(m.dstName);
                        }
                    }

                    var protocol = _.find(protocols, function (p) {
                        return p.protocolName === m.protocolName;
                    });

                    if (protocol !== undefined && protocol.protocolName !== undefined && protocol.protocolName !== null) {
                        protocol.data.push({"srcIp": m.srcIp, "dstIp": m.dstIp});
                    }
                    else {
                        protocols.push({"protocolName": m.protocolName, data: [{"srcIp": m.srcIp, "dstIp": m.dstIp}]});
                    }
                });

                linedatas.push(sourcePoolAssets);
                linedatas.push(destinationsPoolAssets);
                linedatas.push(protocols);
                linedatas.push(sourcePoolAssetsName);
                linedatas.push(destinationsPoolAssetsName);
                return linedatas;
            });
        }
    }
})();
