/**
 * Created by Morgan on 14-10-22.
 */
var learningList = [];
var signatureBLocks = [];

var deployedPolicy = {
    "policyId": "1",
    "name": "power factory policy 1",
    "topologyId": "076b3254-5922-4d8a-812f-8a81a837843d",
    "blocksRef": {
        "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
        "type": "policy"
    },
    "blocks": [{
        "policyBlockId": "1",
        "priority": 1,
        "name": "Siemens-300",
        "cve": "1",
        "status": "INACTIVE",
        "type": "TEMPLATE",
        "rulesRef": {
            "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
            "type": "rule"
        },
        "rules": [{
            "ruleId": "1",
            "priority": 1,
            "sourceZone": [
                "192.168.1.1",
                "192.168.1.2"
            ],
            "destinationZone": [
                "192.168.1.3",
                "192.168.1.4"
            ],
            "fields": [{
                "name": "key1",
                "value": "value1"
            }, {
                "name": "key2",
                "value": "value2"
            }],
            "action": "ALLOW",
            "deviceIps": [
                "device1",
                "device2"
            ]
        }, {
            "ruleId": "2",
            "priority": 2,
            "sourceZone": [
                "192.168.1.1",
                "192.168.1.2"
            ],
            "destinationZone": [
                "192.168.1.3",
                "192.168.1.4"
            ],
            "fields": [{
                "name": "key2",
                "value": "value2"
            }, {
                "name": "key3",
                "value": "value3"
            }],
            "action": "ALERT",
            "deviceIps": [
                "device3",
                "device4"
            ]
        }],
        "readOnly": false,
        "task": {
            "targetStatus": "INACTIVE",
            "state": "INIT"
        },
        "sourceId": "sourceId1",
        "policyId": "policyId2",
        "sourceZoneName": "sourcezone1",
        "destinationZoneName": "destinationzone1",
        "description": "description1"
    }, {
        "policyBlockId": "1",
        "priority": 1,
        "name": "Siemens-301",
        "cve": "1",
        "status": "INACTIVE",
        "type": "SIGNATURE",
        "signatureRef": {
            "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
            "type": "signature"
        },
        "signatures": [{
            "signatureId": "1",
            "priority": 1,
            "publishDate": "2014/11/19",
            "publishId": "publishId1",
            "rev": 1,
            "signame": "signame1",
            "msg": "msg1",
            "body": "body1",
            "sid": 1,
            "action": "ALLOW",
            "vulnerabilityId": "vulnerabilityId1",
            "policyBlockId": "policyBlockId1"
        }, {
            "signatureId": "2",
            "priority": 2,
            "publishDate": "2014/11/19",
            "publishId": "publishId2",
            "rev": 2,
            "signame": "signame2",
            "msg": "msg2",
            "body": "body2",
            "sid": 1,
            "action": "ALLOW",
            "vulnerabilityId": "vulnerabilityId2",
            "policyBlockId": "policyBlockId2"
        }],
        "readOnly": true,
        "task": {
            "targetStatus": "INACTIVE",
            "state": "INIT"
        },
        "sourceId": "sourceId1",
        "policyId": "policyId2",
        "description": "description2"
    }]
};

var policies = [{
    "policyId": "1",
    "name": "power factory policy 1",
    "topologyId": "076b3254-5922-4d8a-812f-8a81a837843d",
    "blocksRef": {
        "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
        "type": "policy"
    },
    "blocks": [{
        "policyBlockId": "1",
        "priority": 1,
        "name": "Siemens-300",
        "cve": "1",
        "status": "INACTIVE",
        "type": "TEMPLATE",
        "rulesRef": {
            "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
            "type": "rule"
        },
        "rules": [{
            "ruleId": "1",
            "priority": 1,
            "sourceZone": [
                "192.168.1.1",
                "192.168.1.2"
            ],
            "destinationZone": [
                "192.168.1.3",
                "192.168.1.4"
            ],
            "fields": [{
                "name": "key1",
                "value": "value1"
            }, {
                "name": "key2",
                "value": "value2"
            }],
            "action": "ALLOW",
            "deviceIps": [
                "device1",
                "device2"
            ]
        }, {
            "ruleId": "2",
            "priority": 2,
            "sourceZone": [
                "192.168.1.1",
                "192.168.1.2"
            ],
            "destinationZone": [
                "192.168.1.3",
                "192.168.1.4"
            ],
            "fields": [{
                "name": "key2",
                "value": "value2"
            }, {
                "name": "key3",
                "value": "value3"
            }],
            "action": "ALERT",
            "deviceIps": [
                "device3",
                "device4"
            ]
        }],
        "readOnly": false,
        "task": {
            "targetStatus": "INACTIVE",
            "state": "INIT"
        },
        "sourceId": "sourceId1",
        "policyId": "policyId2",
        "sourceZoneName": "sourcezone1",
        "destinationZoneName": "destinationzone1",
        "description": "description1"
    }, {
        "policyBlockId": "1",
        "priority": 1,
        "name": "Siemens-301",
        "cve": "1",
        "status": "INACTIVE",
        "type": "SIGNATURE",
        "signatureRef": {
            "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
            "type": "signature"
        },
        "signatures": [{
            "signatureId": "1",
            "priority": 1,
            "publishDate": "2014/11/19",
            "publishId": "publishId1",
            "rev": 1,
            "signame": "signame1",
            "msg": "msg1",
            "body": "body1",
            "sid": 1,
            "action": "ALLOW",
            "vulnerabilityId": "vulnerabilityId1",
            "policyBlockId": "policyBlockId1"
        }, {
            "signatureId": "2",
            "priority": 2,
            "publishDate": "2014/11/19",
            "publishId": "publishId2",
            "rev": 2,
            "signame": "signame2",
            "msg": "msg2",
            "body": "body2",
            "sid": 1,
            "action": "ALLOW",
            "vulnerabilityId": "vulnerabilityId2",
            "policyBlockId": "policyBlockId2"
        }],
        "readOnly": true,
        "task": {
            "targetStatus": "INACTIVE",
            "state": "INIT"
        },
        "sourceId": "sourceId1",
        "policyId": "policyId2",
        "description": "description2"
    }]
}, {
    "policyId": "2",
    "name": "power factory policy 2",
    "topologyId": "076b3254-5922-4d8a-812f-8a81a837844e",
    "blocksRef": {
        "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837844e/nodes",
        "type": "policy"
    },
    "blocks": [{
        "policyBlockId": "1",
        "priority": 1,
        "name": "Siemens-400",
        "cve": "1",
        "status": "INACTIVE",
        "type": "TEMPLATE",
        "rulesRef": {
            "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
            "type": "rule"
        },
        "rules": [{
            "ruleId": "1",
            "priority": 1,
            "sourceZone": [
                "192.168.1.1",
                "192.168.1.2"
            ],
            "destinationZone": [
                "192.168.1.3",
                "192.168.1.4"
            ],
            "fields": [{
                "name": "key1",
                "value": "value1"
            }, {
                "name": "key2",
                "value": "value2"
            }],
            "action": "ALLOW",
            "deviceIps": [
                "device1",
                "device2"
            ]
        }, {
            "ruleId": "2",
            "priority": 2,
            "sourceZone": [
                "192.168.1.1",
                "192.168.1.2"
            ],
            "destinationZone": [
                "192.168.1.3",
                "192.168.1.4"
            ],
            "fields": [{
                "name": "key2",
                "value": "value2"
            }, {
                "name": "key3",
                "value": "value3"
            }],
            "action": "ALERT",
            "deviceIps": [
                "device3",
                "device4"
            ]
        }],
        "readOnly": false,
        "task": {
            "targetStatus": "INACTIVE",
            "state": "INIT"
        },
        "sourceId": "sourceId1",
        "policyId": "policyId2",
        "sourceZoneName": "sourcezone1",
        "destinationZoneName": "destinationzone1",
        "description": "description1"
    }, {
        "policyBlockId": "1",
        "priority": 1,
        "name": "Siemens-401",
        "cve": "1",
        "status": "INACTIVE",
        "type": "SIGNATURE",
        "signatureRef": {
            "baseUrl": "/076b3254-5922-4d8a-812f-8a81a837843d/nodes",
            "type": "signature"
        },
        "signatures": [{
            "signatureId": "1",
            "priority": 1,
            "publishDate": "2014/11/19",
            "publishId": "publishId1",
            "rev": 1,
            "signame": "signame1",
            "msg": "msg1",
            "body": "body1",
            "sid": 1,
            "action": "ALLOW",
            "vulnerabilityId": "vulnerabilityId1",
            "policyBlockId": "policyBlockId1"
        }, {
            "signatureId": "2",
            "priority": 2,
            "publishDate": "2014/11/19",
            "publishId": "publishId2",
            "rev": 2,
            "signame": "signame2",
            "msg": "msg2",
            "body": "body2",
            "sid": 1,
            "action": "ALLOW",
            "vulnerabilityId": "vulnerabilityId2",
            "policyBlockId": "policyBlockId2"
        }],
        "readOnly": true,
        "task": {
            "targetStatus": "INACTIVE",
            "state": "INIT"
        },
        "sourceId": "sourceId1",
        "policyId": "policyId2",
        "description": "description2"
    }]
}];

module.exports = {


    learninglist: function (req, res) {
        res.json(learningList);
    },
    removeSchedule: function (req, res) {
        for (var a = 0; a < learningList.length; a++) {
            if (learningList[a].id == req.body.data) {
                learningList.splice(a, 1);
            }
        }
        res.json(learningList);
    },
    getRules: function (req, res) {
        var rules = [];
        for (var a = 0; a < learningList.length; a++) {
            if (learningList[a].id == req.params.id) {
                rules = learningList[a].rules;
            }
        }
        res.json(rules);
    },
    insertRule: function (req, res) {
        var item = {};
        for (var a = 0; a < learningList.length; a++) {
            if (learningList[a].id == req.body.data.id) {
                item = learningList[a];
                item.rules = item.rules.concat([req.body.data.rule]);
            }
        }
        res.json(item);
    },
    updateSchedule: function (req, res) {
        for (var a = 0; a < learningList.length; a++) {
            if (learningList[a].id == req.body.data.id) {
                learningList[a].startTimeStamp = req.body.data.startTimeStamp;
                learningList[a].endTimeStamp = req.body.data.endTimeStamp;
            }
        }
        res.json(learningList);
    },
    updateStatus: function (req, res) {
        for (var a = 0; a < learningList.length; a++) {
            if (learningList[a].id == req.body.data.id) {
                learningList[a].status = req.body.data.status;
            }
        }
        res.json(learningList);
    },
    setSchedule: function (req, res) {
        learningList.push(req.body.data);
        res.json(learningList);
    },
    signatures: function (req, res) {
        res.json(signatureBLocks);
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
    },
    policies: function (req, res) {
        res.json(policies);
    },
    deployedPolicies: function (req, res) {
        res.json(deployedPolicy);
    },
    policy: function (req, res) {
        var id = req.params.id;
        var policy = {};
        for (var a = 0; a < policies.length; a++) {
            if (policies[a].policyId == id) {
                policy = policies[a];
            }
        }
        res.json(policy);
    },
    saveSignature: function (req, res) {
        signatureBLocks = signatureBLocks.concat(req.body.data);
        res.json(signatureBLocks);
    }
};
