/**
 * Created by Morgan on 14-10-31.
 */
module.exports = {
    templates: function (req, res) {
        res.json(
            [{
                "ruleId": "123",
                "templateName": "电厂模版",
                "sourceZoneName": "sourceZoneName1",
                "sourceZone": [
                    "sourceZone1",
                    "sourceZone2",
                    "sourceZone3"
                ],
                "destionationZoneName": "destionationZoneName1",
                "destinationZone": [
                    "destinationZone1",
                    "destinationZone2"
                ],
                "fields": [{
                    "key1": "value1",
                    "key2": "value2",
                    "key3": "value3"
                }],
                "date": "2014/10/29",
                "action": "ALLOW",
                "deviceIps": [
                    "deviceIps1",
                    "deviceIps2",
                    "deviceIps3",
                    "deviceIps4"
                ]
            }]
        );
    },
    upload: function (req, res) {
        res.json(req.body.data);
    },
    deploy: function (req, res) {
        var sigs = req.body.data;
        for (var a = 0; a < sigs.length; a++) {
            sigs[a].status = 'DEPLOYED';
        }
        setTimeout(function () {
            res.json(sigs);
        }, 3000);
    }
};
