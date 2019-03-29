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
var mocks = new Mocks

var deployedPolicy = require('../../../mocks/rule/blacklist/deployedPolicy.json');

describe('Rule - BlackList: ', function(){
    it('Rule - BlackList Entry Test', function(){
        mocks.cleanMockModule();
        browser.get(host);
        settings.init();
        login.loginAsAdmin();
        uploadTopology.simpleTopo();
        $('#header_li_rule').click().then(function(){
            expect($('.signature-tab').isDisplayed()).toBe(true);
        });
    });

    it('Rule - BlackList Entry Test - Has Undeployed Policy', function(){
        $('#rule-blackList-editor_checkbox_check1').click();
        $('#rule-blackList-editor_i_movePreDep').click();
        $('#rule_a_whitelist').click();
        $('#rule_a_blacklist').click();
        expect($('#blacklist-undeployed-panel').isDisplayed()).toBe(true);
    });

    it('Rule - BlackList Entry Test - Has Undeployed Policy', function(){
        // browser.addMockModule('mockE2E', function(deployedPolicy){
        //     angular.module('mockE2E', ['ngMockE2E']).run(function($httpBackend){
        //         $httpBackend.whenGET(/.+topology\/.+\?\$filter=inUse\seq\strue\sand\spolicyType\seq.+/).respond(function(){
        //             return [200, deployedPolicy, {}];
        //         });
        //         $httpBackend.whenGET(/.*/).passThrough();
        //         $httpBackend.whenPOST(/.*/).passThrough();
        //         $httpBackend.whenPUT(/.*/).passThrough();
        //         $httpBackend.whenDELETE(/.*/).passThrough();
        //     });
        // }, deployedPolicy);
        mocks.addMockModule('GET', '.+topology\\/.+\\?\\$filter=inUse\\seq\\strue\\sand\\spolicyType\\seq.+', deployedPolicy, 200);
        browser.get(host);
        $('#header_li_rule').click();
        expect($('#rule-blackList_li_deployedPanel').isDisplayed()).toBe(true);
        expect($('#blacklist_deployed_table_summary_panel').isDisplayed()).toBe(true);
        login.logout();
    });
});
