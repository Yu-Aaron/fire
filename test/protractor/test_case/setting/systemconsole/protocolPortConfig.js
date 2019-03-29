'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var Constants = require('../../../common/constants.js');
var UploadTopology = require('../../../common/uploadTopology.js');
var Mocks = require('../../../common/mock.js');
var path = require('path');

var securityDevice = require('../../../mocks/setting/securityDevice.json');

var settings = new Settings();
var constants = new Constants();
var login = new Login();
var uploadTopology = new UploadTopology();
var host = settings.host;
var mocks = new Mocks;
var hasDPI = false;

describe('System Setting - Protocol Port Config: ', function(){
    beforeAll(function() {
        mocks.cleanMockModule();
        browser.get(host);
        settings.init();
        login.loginAsAdmin();
        // uploadTopology.simpleTopo();
        $('#header_li_setting').click();
        $('#setting-systemconsole_li_protocolPortSetting').click();
    });

    it('System Setting - Entry Test', function(){
        expect($('#default-protocol-port-input-0').isEnabled()).toBe(false);
        expect($('#default-protocol-port-select-0').isEnabled()).toBe(false);
        expect($('#custom-protocol-name-input-0').isPresent()).toBe(false);
        expect($('#custom-protocol-port-input-0').isPresent()).toBe(false);
        expect($('#custom-protocol-select-0').isPresent()).toBe(false);
    }, 300000);

    it('System Setting - Edit Mode Test', function(){
        $('#protocol_setting_edit_button').click();
        expect($('#default-protocol-port-input-0').isEnabled()).toBe(true);
        expect($('#default-protocol-port-select-0').isEnabled()).toBe(true);
        expect($('#custom-protocol-name-input-0').isPresent()).toBe(false);
        expect($('#custom-protocol-port-input-0').isPresent()).toBe(false);
        expect($('#custom-protocol-select-0').isPresent()).toBe(false);
    }, 300000);

    it('System Setting - Default Protocol Validation Test', function(){
        $('#default-protocol-port-input-0').clear();
        expect($('#default-protocol-port-input-error-0').isDisplayed()).toBe(true);
        expect($('#protocol_setting_confirm_button').isEnabled()).toBe(false);
        $('#default-protocol-port-input-0').sendKeys('179');
        expect($('#default-protocol-port-input-error-0').isDisplayed()).toBe(false);
        expect($('#protocol_setting_confirm_button').isEnabled()).toBe(true);
    }, 300000);

    it('System Setting - Custom Protocol Validation Test', function(){
        $('#add-custom-protocol-button').click();
        $('#custom-protocol-name-input-0').sendKeys('1');
        $('#custom-protocol-name-input-0').clear();
        expect($('#custom-protocol-name-input-error-0').isDisplayed()).toBe(true);
        $('#custom-protocol-name-input-0').sendKeys('Private Protocol');
        expect($('#custom-protocol-name-input-error-0').isDisplayed()).toBe(false);
        $('#custom-protocol-port-input-0').sendKeys('1,');
        expect($('#custom-protocol-port-input-error-0').isDisplayed()).toBe(true);
        $('#custom-protocol-port-input-0').sendKeys('1,2');
        expect($('#custom-protocol-port-input-error-0').isDisplayed()).toBe(false);
        $('#custom-protocol-port-input-0').clear();
        $('#custom-protocol-port-input-0').sendKeys('1:2');
        expect($('#custom-protocol-port-input-error-0').isDisplayed()).toBe(false);
        expect($('#protocol_setting_confirm_button').isEnabled()).toBe(true);
    }, 300000); 

    it('System Setting - Deploy Test', function(){
        mocks.addMockModule('GET', '.+\\/devices\\/topology\\/.+2520SECURITY_DEVICE', securityDevice, 200);
        browser.get(host);
        $('#header_li_setting').click();
        $('#setting-systemconsole_li_protocolPortSetting').click();
        $('#protocol_setting_edit_button').click();
        $('#protocol_setting_confirm_button').click();
        $('#setting-protocol-confirmDeploy_disconnect_check').click();
        $('#setting-protocol-offlineConfirm_Confirm').click();
        login.logout();
    }, 300000);
});
