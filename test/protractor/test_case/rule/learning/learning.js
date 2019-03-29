'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var Constants = require('../../../common/constants.js');
var UploadTopology = require('../../../common/uploadTopology.js');
var Mocks = require('../../../common/mock.js');
var path = require('path');

var settings = new Settings();
var constants = new Constants();
var login = new Login();
var uploadTopology = new UploadTopology();
var host = settings.host;
var mocks = new Mocks;

var learnedWhitelistBlock = require('../../../mocks/rule/whitelist/learnedWhitelistBlock.json');
var learnedIpRuleBlock = require('../../../mocks/rule/ip_rule/learnedIpRuleBlock.json');
var learnedWhitelistRule = require('../../../mocks/rule/whitelist/learnedWhitelistRule.json');

describe('Rule - Learnging: ', function(){
    beforeAll(function() {
        mocks.cleanMockModule();
        browser.get(host);
        settings.init();
        login.loginAsAdmin();
        uploadTopology.simpleTopo();
    });

    it('Rule - Learning Entry Test', function(){
        $('#header_li_rule').click();
        $('#rule_a_whitelist').click();
        $('#rule_a_sub_learning').click();
        expect($('#top-learning-panel').isDisplayed()).toBe(true);
    }, 300000);

    it('Rule - Learning - Start a Learning', function(){
        var lst = [];
        var obj = {
            url: '.+\\/policies\\/topology\\/.+policytype\\/WHITELIST\\/blocks\\?type=LEARN&lockstatus=NODEPLOY.+',
            method: 'GET',
            status: 200,
            data: learnedWhitelistBlock
        };
        lst.push(obj);
        obj = {
            url: '.+\\/policies\\/topology\\/.{36}\\/policy\\/.{36}\\/policytype\\/IP_RULE\\/blocks\\?type=LEARN&lockstatus=NODEPLOY.+',
            method: 'GET',
            status: 200,
            data: learnedIpRuleBlock
        };
        lst.push(obj);
        obj = {
            url: '.+\\/policies\\/block\\/.{36}\\/rules',
            method: 'GET',
            status: 200,
            data: learnedWhitelistRule
        };
        lst.push(obj);
        mocks.addMultiMock(lst);
        browser.get(host);
        $('#header_li_rule').click();
        $('#rule_a_whitelist').click();
        $('#rule_a_sub_learning').click();
        $('#duration-setting').click();
        $('#rule-whiteList-learningCtrl_startLearning').click();
        $('#rule-whiteList-learningCtrl_button_stopLearning').click();
        expect($('#learning-result-0').isDisplayed()).toBe(true);
    }, 300000);

    it('Rule - Learning - Start a Preset Learning', function(){
        $('#header_li_rule').click();
        $('#rule_a_whitelist').click();
        $('#rule_a_sub_learning').click();
        $('#preset-setting').click();
        $('#rule-whiteList-learningCtrl_startLearning').click();
        $('#rule-whiteList-learningCtrl_button_deleteRule').click();
        expect($('#learning-result-1').isPresent()).toBe(false);
    });

    it('Rule - Learning - View Learning Task', function(){
        $('#learning-result-0 .task-name').click();
        $('#return-to-learning-panel').click();
        expect($('#learning-result-0').isDisplayed()).toBe(true);
        expect($('#learning-result-1').isPresent()).toBe(false);
    });

    it('Rule - Learning - View Learning Task Rule Detail', function(){
        $('#learning-result-0 .task-name').click();
        $('#rule-whiteList-editor_button_learningShowDetail-1').click();
        expect($('#whitelist_policycontent_preview_window_rule_table_row_7').isDisplayed()).toBe(true);
        $('#rule-whiteList-editor_a_previewCancel').click();
        browser.wait(function(){
            return $('.modal-backdrop').isPresent(function(data){
                return !data;
            });
        },1000);
        $('#edit-policy-button').click();
        expect(browser.getCurrentUrl()).toMatch(/.+\/rule\/whitelist\/editor\/.+tab=total/);
    });

    afterAll(function() {
        login.logout();
    });
});
