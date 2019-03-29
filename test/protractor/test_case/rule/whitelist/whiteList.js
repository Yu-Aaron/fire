'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var Constants = require('../../../common/constants.js');
var UploadTopology = require('../../../common/uploadTopology.js');
var Mocks = require('../../../common/mock.js');
var path = require('path');

var deployedPolicy = require('../../../mocks/rule/whitelist/deployedPolicy.json');

describe('Rule - WhiteList: ', function(){
	var settings = new Settings();
	var constants = new Constants();
  	var login = new Login();
  	var uploadTopology = new UploadTopology();
    var mocks = new Mocks();
  	var host = settings.host;
    it('Rule - WhiteList Entry Test', function(){
        mocks.cleanMockModule();
        browser.get(host);
        settings.init();
        login.loginAsAdmin();
        uploadTopology.simpleTopo();

        $('#header_li_rule').click();
        $('#rule_a_whitelist').click();
        $('#rule_a_sub_whitelist').click();

        expect($('#whitelist-editor').isDisplayed()).toBe(true);
    });

    it('Rule - WhiteList Entry Test - Has Undeployed Policy', function(){
        $('#rule-whiteList-editor_li_customs').click();
        $('#rule-whiteList-editor_button_handwriteRules').click();
        $('#whitelist_custome_rule_editor_blockname').sendKeys('Test Rule');
        $('#whitelist_custome_rule_editor_sourcename_select option:nth-child(2)').click();
        $('#whitelist_custome_rule_editor_destname_select option:nth-child(2)').click();
        $('#whitelist_custome_rule_editor_footer_save_btn').click();
        browser.wait(function(){
            return $('.modal-backdrop').isPresent().then(function(data){
                return !data;
            });
        }, 1000);
        $('#rule-whiteList-editor_checkbox_customCheck1').click();
        $('#rule-whiteList-editor_i_movePreDep').click();
        $('#rule_a_blacklist').click();
        $('#rule_a_whitelist').click();
        $('#rule_a_sub_whitelist').click();
        expect($('#whitelist-undeployed-panel').isDisplayed()).toBe(true);
    });

    it('Rule - WhiteList Entry Test - Has Deployed Policy', function(){
        mocks.addMockModule('GET', '.+topology\\/.+\\?\\$filter=inUse\\seq\\strue\\sand\\spolicyType\\seq.+', deployedPolicy, 200);
        browser.get(host);
        $('#header_li_rule').click();
        $('#rule_a_whitelist').click();
        $('#rule_a_sub_whitelist').click();
        expect($('#rule-whiteList_li_deployedPanel').isDisplayed()).toBe(true);
        expect($('#whitelist_deployed_table_summary_panel').isDisplayed()).toBe(true);
        login.logout();
    });
});