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
var hasDPI = false;

describe('Setting - SystemConsole - Remote IP Test: ', function() {
    beforeAll(function() {
        browser.get(host);
        settings.init();
        login.loginAsAdmin();
        $('#header_li_setting').click();
        $('#setting-systemconsole_li_ipConfig').click();
    });

    it('Setting -SystemConsole - Remote IP Entry Test', function(){
        expect($('#initial_add_remote_ip_button').isDisplayed()).toBe(true);
        $('#initial_add_remote_ip_button').click();
        expect($('#remote-ip-panel').isDisplayed()).toBe(true);
        expect($('#setting-systemconsole_button_confirm').isEnabled()).toBe(false);
        $('#setting-systemconsole_button_refresh').click();
        expect($('#initial_add_remote_ip_button').isDisplayed()).toBe(true);
    }, 300000);

    it('Setting -SystemConsole - Remote IP Editing Test', function(){
        $('#initial_add_remote_ip_button').click();
        $('#setting-systemconsole_text_ruleData_1').sendKeys('1.1.1');
        expect($('#setting-systemconsole_text_ruleData_error_1').isPresent()).toBe(true);
        expect($('#setting-systemconsole_button_confirm').isEnabled()).toBe(false);
        $('#setting-systemconsole_text_ruleData_1').sendKeys('.1');
        expect($('#setting-systemconsole_text_ruleData_error_1').isPresent()).toBe(false);
        expect($('#setting-systemconsole_button_confirm').isEnabled()).toBe(true);
        $('#setting-systemconsole_button_remove_1').click();
        expect($('#setting-systemconsole_text_ruleData_2').isPresent()).toBe(false);
        $('#setting-systemconsole_button_add').click();
        expect($('#setting-systemconsole_text_ruleData_1').isPresent()).toBe(true);
        expect($('#setting-systemconsole_button_confirm').isEnabled()).toBe(false);
        $('#setting-systemconsole_text_ruleData_1').sendKeys('1.1.1.1');
        $('#setting-systemconsole_button_confirm').click();
        expect($('#remote-ip-table').isPresent()).toBe(true);
        expect($('#remote-ip-data-0').isPresent()).toBe(true);
        expect($('#remote-ip-data-1').isPresent()).toBe(true);
    }, 300000);

    it('Setting -SystemConsole - Remote IP Removing Test', function(){
        $('#close_all_remote_ip_button').click();
        expect($('#initial_add_remote_ip_button').isDisplayed()).toBe(true);
        $('#initial_add_remote_ip_button').click();
        $('#setting-systemconsole_text_ruleData_1').sendKeys('1.1.1.1');
        $('#setting-systemconsole_button_confirm').click();
        $('#setting-systemconsole_button_edit').click();
        $('#setting-systemconsole_button_remove_2').click();
        $('#setting-systemconsole_button_remove_1').click();
        $('#close_all_remote_ip_button').click();
        expect($('#initial_add_remote_ip_button').isDisplayed()).toBe(true);
        login.logout();
    }, 300000);
});

