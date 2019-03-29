exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',

    baseUrl: 'http://127.0.0.1:3000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        onComplete: null,
        isVerbose: true,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 360000,
        print: function () {
        }
    },
    allScriptsTimeout: 300000,
    capabilities: {
        'browserName': 'chrome'
    },
    suites: {
        general: [
            'test/protractor/test_case/menu.js'
        ],
        asset: [
            'test/protractor/test_case/asset/factoryDevice.js',
            'test/protractor/test_case/asset/securitydevice/securityDevice.js'
        ],
        rule: [
            'test/protractor/test_case/rule/whitelist/learningTimePick.js',
            'test/protractor/test_case/rule/whitelist/ipMacLearning.js',
            'test/protractor/test_case/rule/ipmac/ipmac.js',
            'test/protractor/test_case/rule/maliciousdomain/maliciousdomain.js',
            'test/protractor/test_case/rule/learning/learning.js',
        ],
        systemuser: [
            'test/protractor/test_case/systemuser/usergroup/changeUserPrivilege.js'
        ],
        privilege: [
            'test/protractor/test_case/systemuser/privilege/privilege_01_REAL_TIME_PROTECTION.js',
            'test/protractor/test_case/systemuser/privilege/privilege_02_INCIDENT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_03_EVENT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_04_LOG_MANAGEMENT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_05_DEVICE_MANAGEMENT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_06_POLICY.js',
            // 'test/protractor/test_case/systemuser/privilege/privilege_06_BLACKLIST.js',
            // 'test/protractor/test_case/systemuser/privilege/privilege_07_WHITELIST.js',
            // 'test/protractor/test_case/systemuser/privilege/privilege_08_IPMAC.js',
            'test/protractor/test_case/systemuser/privilege/privilege_09_STRUCTURE_SAFETY.js',
            'test/protractor/test_case/systemuser/privilege/privilege_10_ATTACKPATH.js',
            'test/protractor/test_case/systemuser/privilege/privilege_11_INTRUSION_DETECTION.js',
            'test/protractor/test_case/systemuser/privilege/privilege_12_AUDIT_MANAGEMENT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_13_USER_MANAGEMENT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_14_USER_GROUP_MANAGEMENT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_15_SETTINGS_POLICY.js',
            'test/protractor/test_case/systemuser/privilege/privilege_16_SETTINGS_PLATFORM_REBOOT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_17_SETTINGS_PLATFORM_UPGRADE_RESET.js',
            'test/protractor/test_case/systemuser/privilege/privilege_18_SETTINGS_IP_LOGIN.js',
            'test/protractor/test_case/systemuser/privilege/privilege_19_SETTINGS_PROTOCOL.js',
            'test/protractor/test_case/systemuser/privilege/privilege_20_SETTINGS_ALL.js',
            'test/protractor/test_case/systemuser/privilege/privilege_21_SETTINGS_DPI_REBOOT.js',
            'test/protractor/test_case/systemuser/privilege/privilege_22_SETTINGS_DPI_UPGRADE_RESET.js',
            'test/protractor/test_case/systemuser/privilege/privilege_23_SETTINGS_DPI_ALL.js',
        ],
        report: [
            'test/protractor/test_case/report/protocol/protocolReport.js'
        ],
        dtable: [
            'test/protractor/test_case/dtable/search.js'
        ],
        setting: [
            'test/protractor/test_case/setting/systemconsole/protocolPortConfig.js',
            'test/protractor/test_case/setting/systemconsole/remoteIp.js'
        ],
        debugging: [
            'test/protractor/test_case/rule/learning/learning.js'
        ],
        todo: [
            'test/protractor/test_case/todolist/todolist.js'
        ],
        topology: [
            'test/protractor/test_case/topology/topology_test.js'
        ]
    },
    specs: [
        'test/protractor/test_case/login.js',
        'test/protractor/test_case/menu.js',
        'test/protractor/test_case/topology.js',
        'test/protractor/test_case/topology/topology_test.js',
        // 'test/protractor/test_case/setting/systemconsole/strategy.js',
        'test/protractor/test_case/asset/factoryDevice.js',
        'test/protractor/test_case/asset/securitydevice/securityDevice.js',
        'test/protractor/test_case/rule/whitelist/learningTimePick.js',
        'test/protractor/test_case/rule/whitelist/ipMacLearning.js',
        'test/protractor/test_case/rule/maliciousdomain/maliciousdomain.js',

        'test/protractor/test_case/systemuser/privilege/privilege_01_REAL_TIME_PROTECTION.js',
        'test/protractor/test_case/systemuser/privilege/privilege_02_INCIDENT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_03_EVENT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_04_LOG_MANAGEMENT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_05_DEVICE_MANAGEMENT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_06_POLICY.js',
        'test/protractor/test_case/systemuser/privilege/privilege_09_STRUCTURE_SAFETY.js',
        'test/protractor/test_case/systemuser/privilege/privilege_10_ATTACKPATH.js',
        'test/protractor/test_case/systemuser/privilege/privilege_11_INTRUSION_DETECTION.js',
        'test/protractor/test_case/systemuser/privilege/privilege_12_AUDIT_MANAGEMENT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_13_USER_MANAGEMENT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_14_USER_GROUP_MANAGEMENT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_15_SETTINGS_POLICY.js',
        'test/protractor/test_case/systemuser/privilege/privilege_16_SETTINGS_PLATFORM_REBOOT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_17_SETTINGS_PLATFORM_UPGRADE_RESET.js',
        'test/protractor/test_case/systemuser/privilege/privilege_18_SETTINGS_IP_LOGIN.js',
        'test/protractor/test_case/systemuser/privilege/privilege_19_SETTINGS_PROTOCOL.js',
        'test/protractor/test_case/systemuser/privilege/privilege_20_SETTINGS_ALL.js',
        'test/protractor/test_case/systemuser/privilege/privilege_21_SETTINGS_DPI_REBOOT.js',
        'test/protractor/test_case/systemuser/privilege/privilege_22_SETTINGS_DPI_UPGRADE_RESET.js',
        'test/protractor/test_case/systemuser/privilege/privilege_23_SETTINGS_DPI_ALL.js',
        'test/protractor/test_case/rule/blacklist/blackList.js',
        'test/protractor/test_case/rule/whitelist/whiteList.js',
        'test/protractor/test_case/rule/ipmac/ipmac.js',
        'test/protractor/test_case/todolist/todolist.js',
        'test/protractor/test_case/dtable/search.js',
        'test/protractor/test_case/report/protocol/protocolReport.js',
        'test/protractor/test_case/setting/systemconsole/protocolPortConfig.js',
        'test/protractor/test_case/setting/systemconsole/remoteIp.js',
        'test/protractor/test_case/rule/learning/learning.js',
    ],
    onPrepare: function () {
        var SpecReporter = require('jasmine-spec-reporter');
        // add jasmine spec reporter
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}));
        browser.driver.get('http://localhost:3000');
    }
};
