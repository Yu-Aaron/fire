/**
 * DeviceController
 *
 * @description :: Server
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var data = [{
    ID: 1,
    STATUS: '已安装',
    NAME: '设备名称-001',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 2,
    STATUS: '已安装',
    NAME: '设备名称-002',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 2,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }]
}, {
    ID: 3,
    STATUS: '已安装',
    NAME: '设备名称-003',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 31,
    STATUS: '未安装',
    NAME: '设备名称-004',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 21,
    STATUS: '未安装',
    NAME: '设备名称-005',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 33,
    STATUS: '未安装',
    NAME: '设备名称-006',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 51,
    STATUS: '已安装',
    NAME: '设备名称-0011',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 16,
    STATUS: '已安装',
    NAME: '设备名称-0021',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 146,
    STATUS: '已安装',
    NAME: '设备名称-0015',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 431,
    STATUS: '已安装',
    NAME: '设备名称-00178',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 6341,
    STATUS: '已安装',
    NAME: '设备名称-0081',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 132,
    STATUS: '已安装',
    NAME: '设备名称-001',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}, {
    ID: 1556,
    STATUS: '已安装',
    NAME: '设备名称-001',
    MAKE: '匡恩',
    MODEL: 'S-7000',
    NUMBER: 'AN-1002',
    ZONE: '表面处理车间',
    IP: '192.168.1.100',
    PORT: 5,
    PDEVICE: 4,
    DETAILS: [{
        ID: '端口1-2',
        STATUS: '保护(IPS)',
        RULES: 3,
        DEVICES: 1,
        CONNECTION: '连至IP 10.23.99.20',
        CONNECTED: 1
    }, {
        ID: '端口3-4',
        STATUS: '监听(IDS)',
        RULES: 4,
        DEVICES: 3,
        CONNECTION: '交换机',
        CONNECTED: 0
    }]
}];

var openConnections = [];
module.exports = {
    upload: function (req, res) {
        console.log("upload new device");
        res.json({
            result: 'success'
        });

        openConnections.forEach(function (resp) {
            var d = new Date();
            resp.write('id: ' + d.getMilliseconds() + '\n');
            resp.write('data:' + JSON.stringify({
                    ID: 1,
                    STATUS: '已安装',
                    NAME: '设备名称-NEW',
                    MAKE: '匡恩',
                    MODEL: 'S-7000',
                    NUMBER: 'AN-1002',
                    ZONE: '表面处理车间',
                    IP: '192.168.1.100',
                    PORT: 5,
                    PDEVICE: 4,
                    DETAILS: [{
                        ID: '端口1-2',
                        STATUS: '保护(IPS)',
                        RULES: 3,
                        DEVICES: 1,
                        CONNECTION: '连至IP 10.23.99.20',
                        CONNECTED: 1
                    }, {
                        ID: '端口3-4',
                        STATUS: '监听(IDS)',
                        RULES: 4,
                        DEVICES: 3,
                        CONNECTION: '交换机',
                        CONNECTED: 0
                    }]
                }) + '\n\n'); // Note the extra newline
        });
    },
    get: function (req, res) {
        if (req.query.fields == "count") {
            res.json({
                COUNT: data.length
            });
        } else {
            var offset = req.query.offset;
            var limit = req.query.limit;
            var result = offset >= 0 && limit ? data.slice(offset, offset + limit) : data;
            res.json(result);
        }
    },

    stream: function (req, res) {
        req.socket.setTimeout(Infinity);
        res.connection.setTimeout(0);

        // send headers for event-stream connection
        // see spec for more information
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('\n');

        openConnections.push(res);

        req.on("close", function () {
            var toRemove;
            for (var j = 0; j < openConnections.length; j++) {
                if (openConnections[j] == res) {
                    toRemove = j;
                    break;
                }
            }
            openConnections.splice(j, 1);
            console.log(openConnections.length);
        });
    }
};
