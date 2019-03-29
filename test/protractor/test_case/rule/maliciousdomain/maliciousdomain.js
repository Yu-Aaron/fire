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

describe('Rule - MaliciousDomain: ', function(){
    beforeAll(function() {
        mocks.cleanMockModule();
        browser.get(host);
        settings.init();
        login.loginAsAdmin();
        uploadTopology.simpleTopo();
        $('#header_li_asset').click();
        $('#securitydevice-securityDeviceTable_a_showDetails_6').click();
        $('#device_info_online_status').getText().then(function (text) {
            text.indexOf("连线") >= 0 ? hasDPI = true : hasDPI = false;
            console.log("Has DPI? " + hasDPI);
        });
    });

    it('Rule - MaliciousDomain Entry Test', function(){
        $('#header_li_rule').click();
        $('#rule_a_maliciousdomain').click();
        expect($('#rule_maliciousdomain_tabs').isDisplayed()).toBe(true);
    }, 300000);

    it('Rule - MaliciousDomain Entry Test - Deloyed Tab', function(){
        $('#rule_maliciousdomain_li_deployedTab').click();
        expect($('#rule_maliciousdomain_tab_deployedTab').isDisplayed()).toBe(true);
    }, 300000);

    it('Rule - MaliciousDomain Entry Test - Waiting Tab', function(){
        $('#rule_maliciousdomain_li_waitingTab').click();
        expect($('#rule_maliciousdomain_tab_waitingTab').isDisplayed()).toBe(true);
    }, 300000);

    it('Rule - MaliciousDomain Add New Test - Open New Modal', function(){
        $('#rule_maliciousdomain_waitingTab_button_add').click();
        expect($('#rule_maliciousdomain_modal_new').isDisplayed()).toBe(true);
        expect($('#rule_maliciousdomain_remove_new_button_0').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_add_new_button').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_ok_new_button').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_cancel_new_button').isEnabled()).toBe(true);
    }, 300000);

    it('Rule - MaliciousDomain Add New Test - Validate Domain Name', function(){
        $('#rule_maliciousdomain_new_name_0').sendKeys('Test');
        expect($('.rule_maliciousdomain_new_names_0 error-msg .domain-invalid').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_new_name_0').clear();
        expect($('.rule_maliciousdomain_new_names_0 error-msg .domain-invalid').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_new_name_0').sendKeys('TestDomain-' + (new Date).getTime() + '0.ca');
        expect($('.rule_maliciousdomain_new_names_0 error-msg .domain-invalid').isDisplayed()).toBe(false);
        expect($('#rule_maliciousdomain_remove_new_button_0').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_add_new_button').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_ok_new_button').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_cancel_new_button').isEnabled()).toBe(true);
    }, 300000);

    it('Rule - MaliciousDomain Add New Test - Add New Domain Rule', function(){
        // We might need this in the future
        //$('#rule_maliciousdomain_new_protocol_dropdown_0').click();
        //$('#rule_maliciousdomain_new_protocol_list_0_netbios').click();
        $('#rule_maliciousdomain_new_action_dropdown_0').click();
        $('#rule_maliciousdomain_new_action_list_0_deny').click();
        $('#rule_maliciousdomain_add_new_button').click();
        expect($('.rule_maliciousdomain_new_names_1 error-msg .domain-invalid').isDisplayed()).toBe(true);
        expect($('#rule_maliciousdomain_remove_new_button_1').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_remove_new_button_0').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_add_new_button').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_ok_new_button').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_cancel_new_button').isEnabled()).toBe(true);
        $('#rule_maliciousdomain_new_name_1').sendKeys('Testcvoiqwe02305erog4mt9ndavn0q32.xx');
        expect($('.rule_maliciousdomain_new_names_1 error-msg .domain-invalid').isDisplayed()).toBe(false);
        $('#rule_maliciousdomain_add_new_button').click();
        $('#rule_maliciousdomain_new_name_2').sendKeys('Testcvoiqwe02305erog4mt9ndavn0q32.xx');
        expect($('.rule_maliciousdomain_new_names_1 error-msg .domain-dup').isDisplayed()).toBe(true);
        expect($('.rule_maliciousdomain_new_names_2 error-msg .domain-dup').isDisplayed()).toBe(true);
        expect($('#rule_maliciousdomain_add_new_button').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_ok_new_button').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_cancel_new_button').isEnabled()).toBe(true);
        $('#rule_maliciousdomain_new_name_1').clear();
        $('#rule_maliciousdomain_new_name_1').sendKeys('Testcvoiqwe02305erog4mt9ndavn0q31.xx');
        expect($('.rule_maliciousdomain_new_names_1 error-msg .domain-dup').isDisplayed()).toBe(false);
        expect($('.rule_maliciousdomain_new_names_2 error-msg .domain-dup').isDisplayed()).toBe(false);
        $('#rule_maliciousdomain_new_name_2').clear();
        $('#rule_maliciousdomain_new_name_2').sendKeys('Testcvoiqwe02305erog4mt9ndavn0q31.xx');
        expect($('.rule_maliciousdomain_new_names_1 error-msg .domain-dup').isDisplayed()).toBe(true);
        expect($('.rule_maliciousdomain_new_names_2 error-msg .domain-dup').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_remove_new_button_1').click();
        expect($('.rule_maliciousdomain_new_names_1 error-msg .domain-dup').isDisplayed()).toBe(false);
        expect($('#rule_maliciousdomain_add_new_button').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_ok_new_button').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_cancel_new_button').isEnabled()).toBe(true);
        $('#rule_maliciousdomain_new_name_1').clear();
        $('#rule_maliciousdomain_new_name_1').sendKeys('TestDomain-' + (new Date).getTime() + '1.ca');
        expect($('.rule_maliciousdomain_new_names_1 error-msg .domain-invalid').isDisplayed()).toBe(false);
        $('#rule_maliciousdomain_ok_new_button').click();
        browser.sleep(2000);
        expect($('.alert-success').isDisplayed()).toBe(true);
        expect($('#rule_maliciousdomain_waitingTab_button_selectAll').isEnabled()).toBe(true);
    }, 300000);

    it('Rule - MaliciousDomain Waiting Tab Test - Remove All Domain Rule', function(){
        $('#rule_maliciousdomain_waitingTab_button_selectAll').click();
        expect($('#rule_maliciousdomain_waitingTab_button_changeSelected').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_waitingTab_button_deleteSelected').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_waitingTab_button_deploy').isEnabled()).toBe(true);
        $('#rule_maliciousdomain_waitingTab_button_selectAll').click();
        expect($('#rule_maliciousdomain_waitingTab_button_changeSelected').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_waitingTab_button_deleteSelected').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_waitingTab_button_deploy').isEnabled()).toBe(false);
        $('#rule_maliciousdomain_waitingTab_button_selectAll').click();
        expect($('#rule_maliciousdomain_waitingTab_checkbox_selectAll').isSelected()).toBe(true);
        expect($('#rule_maliciousdomain_waitingTab_checkbox_selectAll').isEnabled()).toBe(false);
        $('#rule_maliciousdomain_waitingTab_button_deleteSelected').click();
        expect($('#rule_maliciousdomain_modal_delete').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_modal_delete_button_cancel').click();
        expect($('#rule_maliciousdomain_modal_delete').isPresent()).toBe(false);
        $('#rule_maliciousdomain_waitingTab_button_deleteSelected').click();
        expect($('#rule_maliciousdomain_modal_delete').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_modal_delete_button_ok').click();
        browser.sleep(2000);
        expect($('.alert-success').isDisplayed()).toBe(true);
        expect($('#rule_maliciousdomain_waitingTab_button_selectAll').isEnabled()).toBe(false);
        expect($('.rule_maliciousdomain_waiting_table > tbody > tr').isPresent()).toBe(false);
        expect($('#rule_maliciousdomain_waitingTab_button_changeSelected').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_waitingTab_button_deleteSelected').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_waitingTab_button_deploy').isEnabled()).toBe(false);
   }, 300000);

    it('Rule - MaliciousDomain Add New Test - Dulplacte Domain', function(){
        $('#rule_maliciousdomain_waitingTab_button_add').click();
        $('#rule_maliciousdomain_new_name_0').sendKeys('TestDomain-vcxomewvn.ca');
        $('#rule_maliciousdomain_ok_new_button').click();
        browser.sleep(2000);
        expect($('.alert-success').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_waitingTab_button_add').click();
        $('#rule_maliciousdomain_new_name_0').sendKeys('TestDomain-vcxomewvn.ca');
        expect($('.rule_maliciousdomain_new_names_0 error-msg .domain-dup').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_new_name_0').clear();
        $('#rule_maliciousdomain_new_name_0').sendKeys('TestDomain-' + (new Date).getTime() + '0.ca');
        browser.sleep(1000);
        $('#rule_maliciousdomain_add_new_button').click();
        $('#rule_maliciousdomain_new_name_1').sendKeys('TestDomain-' + (new Date).getTime() + '1.ca');
        browser.sleep(1000);
        $('#rule_maliciousdomain_ok_new_button').click();
        browser.sleep(2000);
        expect($('.alert-success').isDisplayed()).toBe(true);
        expect($$('.rule_maliciousdomain_waiting_table > tbody > tr').count()).toBe(3);
    }, 300000);

    it('Rule - MaliciousDomain Waiting Tab Test - Change Actions', function(){
        $('#rule_maliciousdomain_waitingTab_checkbox_selectAll').click();
        $('#rule_maliciousdomain_waitingTab_button_changeSelected').click();
        $('#rule_maliciousdomain_waitingTab_button_denySelected').click();
        expect($('#rule_maliciousdomain_modal_change').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_modal_change_button_ok').click();
        browser.sleep(2000);
        expect($('.alert-success').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_waitingTab_button_changeSelected').click();
        $('#rule_maliciousdomain_waitingTab_button_allowSelected').click();
        expect($('#rule_maliciousdomain_modal_change').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_modal_change_button_ok').click();
        browser.sleep(2000);
        expect($('.alert-success').isDisplayed()).toBe(true);
    }, 300000);

    it('Rule - MaliciousDomain Waiting Tab Test - Change Action', function(){
        $('#rule_maliciousdomain_waitingTab_action_dropdown_1').click();
        $('#rule_maliciousdomain_waitingTab_action_list_1_alert').click();
        browser.sleep(2000);
        expect($('#rule_maliciousdomain_waitingTab_action_dropdown_1').getText()).toBe("警告");
        $('#rule_maliciousdomain_waitingTab_action_dropdown_2').click();
        $('#rule_maliciousdomain_waitingTab_action_list_2_deny').click();
        browser.sleep(2000);
        expect($('#rule_maliciousdomain_waitingTab_action_dropdown_2').getText()).toBe("阻断");
    }, 300000);

    it('Rule - MaliciousDomain Waiting Tab Test - Delete', function(){
        $('#rule_maliciousdomain_delete_waiting_domain_button_2').click();
        expect($('#rule_maliciousdomain_modal_delete').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_modal_delete_button_ok').click();
        expect($$('.rule_maliciousdomain_waiting_table > tbody > tr').count()).toBe(2);
        $('#rule_maliciousdomain_delete_waiting_domain_button_1').click();
        expect($('#rule_maliciousdomain_modal_delete').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_modal_delete_button_ok').click();
        expect($$('.rule_maliciousdomain_waiting_table > tbody > tr').count()).toBe(1);
        $('#rule_maliciousdomain_delete_waiting_domain_button_0').click();
        expect($('#rule_maliciousdomain_modal_delete').isDisplayed()).toBe(true);
        $('#rule_maliciousdomain_modal_delete_button_ok').click();
        expect($('.rule_maliciousdomain_waiting_table > tbody > tr').isPresent()).toBe(false);
    }, 300000);

    it('Rule - MaliciousDomain Waiting Tab Test - Deploy', function(){
        if (hasDPI) {
            $('#rule_maliciousdomain_waitingTab_button_add').click();
            $('#rule_maliciousdomain_new_name_0').sendKeys('TestDomain-' + (new Date).getTime() + '0.ca');
            $('#rule_maliciousdomain_add_new_button').click();
            browser.sleep(1000);
            $('#rule_maliciousdomain_new_name_1').sendKeys('TestDomain-' + (new Date).getTime() + '1.ca');
            $('#rule_maliciousdomain_ok_new_button').click();
            browser.sleep(2000);
            expect($('.alert-success').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_waitingTab_button_selectAll').isEnabled()).toBe(true);
            expect($$('.rule_maliciousdomain_waiting_table > tbody > tr').count()).toBe(2);
            $('#rule_maliciousdomain_waitingTab_checkbox_check_1').click();
            $('#rule_maliciousdomain_waitingTab_checkbox_check_2').click();
            expect($('#rule_maliciousdomain_waitingTab_button_deploy').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_waitingTab_button_deploy').click();
            expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployCancel').isEnabled()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(false);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isPresent()).toBe(true);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isSelected()).toBe(false);
            $('#rule_maliciousdomain_confirmDeploy_disconnect').click();
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            expect($('#rule_maliciousdomain_waitingTab_isdoing_message_0').isPresent()).toBe(true);
            expect($('#rule_maliciousdomain_waitingTab_isdoing_message_1').isPresent()).toBe(true);
            browser.sleep(12000);
            // Current only time out, need to add success case
            // Delete all rules
            expect($$('.rule_maliciousdomain_waiting_table > tbody > tr').count()).toBe(2);
            $('#rule_maliciousdomain_waitingTab_button_selectAll').click();
            $('#rule_maliciousdomain_waitingTab_button_deleteSelected').click();
            expect($('#rule_maliciousdomain_modal_delete').isDisplayed()).toBe(true);
            $('#rule_maliciousdomain_modal_delete_button_ok').click();
            browser.sleep(2000);
            expect($('.alert-success').isDisplayed()).toBe(true);
        } else {
            $('#rule_maliciousdomain_waitingTab_button_add').click();
            $('#rule_maliciousdomain_new_name_0').sendKeys('TestDomain-' + (new Date).getTime() + '0.ca');
            $('#rule_maliciousdomain_add_new_button').click();
            browser.sleep(1000);
            $('#rule_maliciousdomain_new_name_1').sendKeys('TestDomain-' + (new Date).getTime() + '1.ca');
            $('#rule_maliciousdomain_ok_new_button').click();
            browser.sleep(2000);
            expect($('.alert-success').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_waitingTab_button_selectAll').isEnabled()).toBe(true);
            expect($$('.rule_maliciousdomain_waiting_table > tbody > tr').count()).toBe(2);
            $('#rule_maliciousdomain_waitingTab_checkbox_check_1').click();
            expect($('#rule_maliciousdomain_waitingTab_button_deploy').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_waitingTab_button_deploy').click();
            expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployCancel').isPresent()).toBe(false);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            browser.sleep(1000);
            // Delete all rules
            expect($$('.rule_maliciousdomain_waiting_table > tbody > tr').count()).toBe(2);
            $('#rule_maliciousdomain_waitingTab_button_selectAll').click();
            $('#rule_maliciousdomain_waitingTab_button_deleteSelected').click();
            expect($('#rule_maliciousdomain_modal_delete').isDisplayed()).toBe(true);
            $('#rule_maliciousdomain_modal_delete_button_ok').click();
            browser.sleep(2000);
            expect($('.alert-success').isDisplayed()).toBe(true);
        }
    }, 300000);

    it('Rule - MaliciousDomain Deployed Tab Test - Change Action', function(){
        var link = host + "/api/v2.0/policies/maliciousdomain/deployed/testinsert";
        browser.executeScript('$.get("' + link + '")');
        browser.executeScript('$.get("' + link + '")');
        browser.executeScript('$.get("' + link + '")');
        browser.driver.sleep(5000);
        $('#rule_maliciousdomain_li_deployedTab').click();
        expect($('#rule_maliciousdomain_tab_deployedTab').isDisplayed()).toBe(true);
        expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        $('#rule_maliciousdomain_deployedTab_action_dropdown_1').click();
        $('#rule_maliciousdomain_deployedTab_action_list_1_deny').click();
        expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
        if (hasDPI) {
            expect($('#rule_maliciousdomain_button_deployCancel').isEnabled()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(false);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isPresent()).toBe(true);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isSelected()).toBe(false);
            $('#rule_maliciousdomain_confirmDeploy_disconnect').click();
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            expect($('#rule_maliciousdomain_deployedTab_isdoing_message_1').isPresent()).toBe(true);
            browser.sleep(12000);
            // Current only time out, need to add success case
            // Delete all rules
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        } else {
            expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployCancel').isPresent()).toBe(false);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            browser.sleep(1000);
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        }
    }, 300000);

    it('Rule - MaliciousDomain Deployed Tab Test - Change Actions', function(){
        $('#rule_maliciousdomain_deployedTab_button_selectAll').click();
        expect($('#rule_maliciousdomain_deployedTab_checkbox_selectAll').isSelected()).toBe(true);
        expect($('#rule_maliciousdomain_deployedTab_checkbox_selectAll').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_deployedTab_button_changeSelected').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_deployedTab_button_deleteSelected').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_deployedTab_button_clearAll').isEnabled()).toBe(true);
        $('#rule_maliciousdomain_deployedTab_button_selectAll').click();
        expect($('#rule_maliciousdomain_deployedTab_checkbox_selectAll').isSelected()).toBe(false);
        expect($('#rule_maliciousdomain_deployedTab_checkbox_selectAll').isEnabled()).toBe(true);
        expect($('#rule_maliciousdomain_deployedTab_button_changeSelected').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_deployedTab_button_deleteSelected').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_deployedTab_button_clearAll').isEnabled()).toBe(true);
        $('#rule_maliciousdomain_deployedTab_button_selectAll').click();
        $('#rule_maliciousdomain_deployedTab_button_changeSelected').click();
        $('#rule_maliciousdomain_deployedTab_button_denySelected').click();
        expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
        if (hasDPI) {
            expect($('#rule_maliciousdomain_button_deployCancel').isEnabled()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(false);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isPresent()).toBe(true);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isSelected()).toBe(false);
            $('#rule_maliciousdomain_confirmDeploy_disconnect').click();
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            expect($('#rule_maliciousdomain_deployedTab_isdoing_message_1').isPresent()).toBe(true);
            browser.sleep(12000);
            // Current only time out, need to add success case
            // Delete all rules
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        } else {
            expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployCancel').isPresent()).toBe(false);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            browser.sleep(1000);
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        }
    }, 300000);

    it('Rule - MaliciousDomain Deployed Tab Test - Delete', function(){
        $('#rule_maliciousdomain_delete_deployed_domain_button_1').click();
        expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
        if (hasDPI) {
            expect($('#rule_maliciousdomain_button_deployCancel').isEnabled()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(false);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isPresent()).toBe(true);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isSelected()).toBe(false);
            $('#rule_maliciousdomain_confirmDeploy_disconnect').click();
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            expect($('#rule_maliciousdomain_deployedTab_isdoing_message_1').isPresent()).toBe(true);
            browser.sleep(12000);
            // Current only time out, need to add success case
            // Delete all rules
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        } else {
            expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployCancel').isPresent()).toBe(false);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            browser.sleep(1000);
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        }
    }, 300000);

    it('Rule - MaliciousDomain Deployed Tab Test - Delete Selected', function(){
        $('#rule_maliciousdomain_deployedTab_checkbox_selectAll').click();
        $('#rule_maliciousdomain_deployedTab_button_deleteSelected').click();
        expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
        if (hasDPI) {
            expect($('#rule_maliciousdomain_button_deployCancel').isEnabled()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(false);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isPresent()).toBe(true);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isSelected()).toBe(false);
            $('#rule_maliciousdomain_confirmDeploy_disconnect').click();
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            expect($('#rule_maliciousdomain_deployedTab_isdoing_message_1').isPresent()).toBe(true);
            browser.sleep(12000);
            // Current only time out, need to add success case
            // Delete all rules
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        } else {
            expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployCancel').isPresent()).toBe(false);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            browser.sleep(1000);
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        }
    }, 300000);

    it('Rule - MaliciousDomain Deployed Tab Test - Clear All', function(){
       $('#rule_maliciousdomain_deployedTab_button_clearAll').click();
        expect($('#rule_maliciousdomain_deployedTab_checkbox_selectAll').isSelected()).toBe(true);
        expect($('#rule_maliciousdomain_deployedTab_checkbox_selectAll').isEnabled()).toBe(false);
        expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
        if (hasDPI) {
            expect($('#rule_maliciousdomain_button_deployCancel').isEnabled()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(false);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isPresent()).toBe(true);
            expect($('#rule_maliciousdomain_confirmDeploy_disconnect').isSelected()).toBe(false);
            $('#rule_maliciousdomain_confirmDeploy_disconnect').click();
            expect($('#rule_maliciousdomain_button_deployConfirm').isEnabled()).toBe(true);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            expect($('#rule_maliciousdomain_deployedTab_isdoing_message_1').isPresent()).toBe(true);
            browser.sleep(12000);
            // Current only time out, need to add success case
            // Delete all rules
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        } else {
            expect($('#rule_maliciousdomain_modal_deploy').isDisplayed()).toBe(true);
            expect($('#rule_maliciousdomain_button_deployCancel').isPresent()).toBe(false);
            $('#rule_maliciousdomain_button_deployConfirm').click();
            browser.sleep(1000);
            expect($$('.rule_maliciousdomain_deployed_table > tbody > tr').count()).toBeGreaterThan(2);
        }
    }, 300000);

    afterAll(function() {
        login.logout();
    });
});
