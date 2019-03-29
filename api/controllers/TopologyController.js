/**
 * TopologyController
 *
 * @description :: Server-side logic for managing topologies
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var generatorId = 2;
var currentTopo = {};

var fakeTopo = [{
    topologyId: "18a6af87-0671-4c28-a7dd-298dfcdc8c0e",
    name: "ehantopo.topo",
    nodescount: 5,
    linkscount: 4,
    groupCount: 3,
    nodes: {
        baseUrl: "/18a6af87-0671-4c28-a7dd-298dfcdc8c0e/nodes",
        type: "nodes"
    },
    links: {
        baseUrl: "/18a6af87-0671-4c28-a7dd-298dfcdc8c0e/links",
        type: "link"
    }
}];
var data = [{
    status: 'active',
    topologyId: 0,
    name: '车间232拓扑',
    nodescount: 3,
    linkscount: 3,
    groupCount: 3,
    timestamp: new Date(),
    msg: ''
}, {
    status: '',
    id: 1,
    name: '车间233拓扑',
    nodescount: 3,
    linkscount: 3,
    groupCount: 3,
    timestamp: new Date(),
    msg: ''
}];

module.exports = {
    uploadFake: function (req, res) {
        fakeTopo = req.body.data;
        res.json(req.body.data);
    },
    getFakeTopo: function (req, res) {
        res.json(fakeTopo);
    },
    get: function (req, res) {
        if (req.query.fields == "count") {
            res.json({
                COUNT: data.length
            });
        } else if (req.query.fields == 'current') {
            var result = {};
            for (var i = 0; i < data.length; i++) {
                if (data[i].status = 'active') {
                    result = data[i];
                    break;
                }
            }
            ;
            res.json({
                current: result
            });
        } else {
            res.json(data);
        }
    },
    links: function (req, res) {

        res.json([{
            "id": 27,
            "topologyId": "18a6af87-0671-4c28-a7dd-298dfcdc8c0e",
            "nodeID": 60,
            "destinationNodeID": 61
        }]);

    },
    nodes: function (req, res) {
        res.json([{
            "id": 60,
            "topologyId": "18a6af87-0671-4c28-a7dd-298dfcdc8c0e",
            "orderID": 0,
            "name": "Modbus Client",
            "ip": "192.168.10.40",
            "groupName": "Modbus Client",
            "hardwareID": "ModbusClient",
            "totalPorts": 0,
            "MAC": "08:00:27:81:cb:d3",
            "ports": "",
            "x": 200,
            "y": 200
        }, {
            "id": 61,
            "topologyId": "18a6af87-0671-4c28-a7dd-298dfcdc8c0e",
            "orderID": 1,
            "name": "IPS-Perimeter",
            "ip": "10.0.10.62",
            "hardwareID": "IPS-Perimeter",
            "totalPorts": 0,
            "MAC": "NA",
            "ports": "[0, 1]",
            "x": 300,
            "y": 300
        }]);
    },
    currentTopo: function (req, res) {
        res.json(currentTopo);
    },
    updatePosition: function (req, res) {
        var node = req.body.data;
        if (fakeTopo.nodes) {
            var nodes = fakeTopo.nodes;
            for (var a = 0; a < nodes.length; a++) {
                if (nodes[a].orderID == node.orderID) {
                    nodes[a].x = node.x;
                    nodes[a].y = node.y;
                }
            }
        }
        res.json(fakeTopo);
    },
    updateNode: function (req, res) {
        var node = req.body.data;
        if (fakeTopo.nodes) {
            var nodes = fakeTopo.nodes;
            for (var a = 0; a < nodes.length; a++) {
                if (nodes[a].orderID == node.orderID) {
                    nodes[a] = node;
                }
            }
        }
        res.json(fakeTopo);
    },
    download: function (req, res) {
        var data = [{
            id: 0,
            name: '车间232拓扑',
            deviceCount: 3,
            secureCount: 3,
            zoneCount: 3,
            timestamp: new Date(),
            msg: ''

        }, {
            id: 1,
            name: '车间233拓扑',
            deviceCount: 3,
            secureCount: 3,
            zoneCount: 3,
            timestamp: new Date(),
            msg: '',
            status: ''
        }];
        var jsonString = JSON.stringify(data);
        var fileName = 'filename';
        var userAgent = (req.headers['user-agent'] || '').toLowerCase();
        res.setHeader('Content-Type', 'text/plain;charset=utf-8');

        if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
            res.header('Content-Disposition', 'attachment; filename=' + encodeURIComponent(fileName) + '.rule');
        } else if (userAgent.indexOf('firefox') >= 0) {
            res.header('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(fileName) + '.rule"');
        } else {
            res.header('Content-Disposition', 'attachment; filename=' + new Buffer(fileName).toString('binary') + '.rule');
        }
        res.write(jsonString);
        res.end('');
    },

    upload: function (req, res) {
        var newTopo = {
            status: 'active',
            id: generatorId,
            name: 'new拓扑' + generatorId,
            deviceCount: 3,
            secureCount: 3,
            zoneCount: 3,
            timestamp: new Date(),
            msg: ''
        };

        generatorId++;
        data.forEach(function (data) {
            data.status = ''
        });
        data.unshift(newTopo);
        res.json(newTopo);
    },

    activate: function (req, res) {
        var id = req.params.id;

        data.forEach(function (data) {
            if (data.id == id) {
                data.status = 'active';
            } else {
                data.status = '';
            }
        });

        res.send(200);
    }
};
