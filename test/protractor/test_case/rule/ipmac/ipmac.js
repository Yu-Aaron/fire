'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var Mocks = require('../../../common/mock.js');
var UploadTopology = require('../../../common/uploadTopology.js');

//Protractor Test:
describe('Rule - IP MAC Test: ', function() {
    var settings = new Settings();
    var login = new Login();
    var uploadTopology = new UploadTopology();
    var mock = new Mocks();
    var host = settings.host;

    //Functions need to be called before each 'it'
    //============================= addMockModule to use mock up data ================================
    beforeAll(function(){
        browser.addMockModule('apiMockModule', function () {
            var serviceId = 'ipmacMock';
            angular.module('apiMockModule', [])
                .config(['$httpProvider', configApiMock])
                .factory(serviceId, [ipmacMock]);

            // Function that find certain http request and replace the response with mockup data:
            function ipmacMock() {
                var getTaskMac = false;
                var parameter = {};
                var taskId;
                var getTaskResult = false;
                var waitTime = 5;
                return {
                    request: function (config) {
                        taskId&&(getTaskResult = (config.url.indexOf('servicesetting/ipmacswitch')) > -1 && config.method==='POST');
                        getTaskMac = (config.url.indexOf('servicesetting/ipmacswitch')) > -1 && config.method==='POST';
                        getTaskMac&&console.log(config);
                        return config;
                    },
                    response: function (response) {
                        if(getTaskMac){
                            console.log("================");
                            console.log(response);
                        }
                        return response;
                    }
                };
            }

            // Use the service as a interceptor for http request
            function configApiMock($httpProvider) {
                $httpProvider.interceptors.push(serviceId);
            }
        });
        
    });
    //============================= End of addMockModule ================================

    var tabRule = element(by.id('header_li_rule'));
    var tabIpmac = element(by.id('rule_a_ipmac'));
    var IpmacEdit = element(by.id('rule-ipmac_button_enterEdit'));
    var ipmacActionContainer = element(by.id('ipmac_action_container'));
    var ipmacSwitch = element(by.id('rule-ipmac_checkbox'));
    var listItemSwitch_1 = element(by.id('rule-ipmac_checkbox_tableToggle2'));
    var unknownDeviceSwitch = element(by.id('rule-ipmac_unknowndevice_checkbox'));

    it('IP_MAC Should be off at first', function() {
        browser.get(host);

        settings.init();
        login.loginAsAdmin();
        uploadTopology.simpleTopo();
        
        // Go to ipmac editor UI:
        tabRule.click();
        tabIpmac.click();
        IpmacEdit.click();
        //Should be off at first
        expect(ipmacActionContainer.isPresent()).toBeFalsy();
        expect(listItemSwitch_1.getAttribute('checked')).toBeFalsy();
        element(by.id('rule-ipmac_button_cancelEdit')).click();
    });

    it('Device switches all turned on when ipmac switched on', function(){
        IpmacEdit.click();
        ipmacSwitch.click();
        expect(ipmacActionContainer.isDisplayed()).toBeTruthy();
        expect(listItemSwitch_1.getAttribute('checked')).toBeTruthy();
    });
    it('Have warning msg for empty MAC address', function(){
        expect(element(by.id('ipmac_invalid_error_msg_1')).isDisplayed()).toBeTruthy();
    });
    it('Disable confirm btn with empty MAC address error', function(){
        expect(element(by.id('rule-ipmac_button_confirmEdit')).isEnabled()).toBeFalsy();
    });
    it('Turned off all device when ipmac switch is turned off', function(){
        ipmacSwitch.click();
        expect(listItemSwitch_1.getAttribute('checked')).toBeFalsy();
    });
    it('Turn ipmac switch off if all device are off', function(){
        ipmacSwitch.click();
        for(var i=1; i<8; i++){
            element(by.id('rule-ipmac_checkbox_tableToggle'+i)).click();
        }
        element(by.id('rule-ipmac_checkbox_tableToggle10')).click();
        expect(ipmacSwitch.getAttribute('checked')).toBeFalsy();
    });
    it('Turn on unknownDeviceSwitch should turn on all devices and ipmac switch', function () {
        unknownDeviceSwitch.click();
        expect(ipmacSwitch.getAttribute('checked')).toBeTruthy();
        expect(listItemSwitch_1.getAttribute('checked')).toBeTruthy();
        element(by.id('rule-ipmac_button_cancelEdit')).click();
    });
    it('Deploy ipmac policy:', function () {
        // reset all MAC address
        IpmacEdit.click();
        unknownDeviceSwitch.click();
        element(by.id('rule-ipmac_text_tableMac_1_1')).clear();
        element(by.id('rule-ipmac_text_tableMac_2_1')).clear();
        element(by.id('rule-ipmac_text_tableMac_3_1')).clear();
        element(by.id('rule-ipmac_text_tableMac_3_2')).clear();
        element(by.id('rule-ipmac_text_tableMac_4_1')).clear();
        element(by.id('rule-ipmac_text_tableMac_4_2')).clear();
        element(by.id('rule-ipmac_text_tableMac_5_1')).clear();
        element(by.id('rule-ipmac_text_tableMac_6_1')).clear();
        element(by.id('rule-ipmac_text_tableMac_6_2')).clear();
        element(by.id('rule-ipmac_text_tableMac_7_1')).clear();
        element(by.id('rule-ipmac_text_tableMac_7_2')).clear();
        element(by.id('rule-ipmac_text_tableMac_7_3')).clear();
        element(by.id('rule-ipmac_text_tableMac_10_1')).clear();

        element(by.id('rule-ipmac_text_tableMac_1_1')).sendKeys('08:00:27:6f:50:01');
        element(by.id('rule-ipmac_text_tableMac_2_1')).sendKeys('08:00:27:6f:50:02');
        element(by.id('rule-ipmac_text_tableMac_3_1')).sendKeys('08:00:27:6f:50:03');
        element(by.id('rule-ipmac_text_tableMac_3_2')).sendKeys('08:00:27:6f:50:04');
        element(by.id('rule-ipmac_text_tableMac_4_1')).sendKeys('08:00:27:6f:50:05');
        element(by.id('rule-ipmac_text_tableMac_4_2')).sendKeys('08:00:27:6f:50:06');
        element(by.id('rule-ipmac_text_tableMac_5_1')).sendKeys('08:00:27:6f:50:07');
        element(by.id('rule-ipmac_text_tableMac_6_1')).sendKeys('08:00:27:6f:50:08');
        element(by.id('rule-ipmac_text_tableMac_6_2')).sendKeys('08:00:27:6f:50:09');
        element(by.id('rule-ipmac_text_tableMac_7_1')).sendKeys('08:00:27:6f:50:10');
        element(by.id('rule-ipmac_text_tableMac_7_2')).sendKeys('08:00:27:6f:50:11');
        element(by.id('rule-ipmac_text_tableMac_7_3')).sendKeys('08:00:27:6f:50:12');
        element(by.id('rule-ipmac_text_tableMac_10_1')).sendKeys('08:00:27:6f:50:13');
        expect(element(by.id('rule-ipmac_button_confirmEdit')).isEnabled()).toBeTruthy();
        // element(by.id('rule-ipmac_button_confirmEdit')).click();
        // if(element(by.id('rule_ipmac_confirmIPMAC_disconnect')).isPresent()){
        //     element(by.id('rule_ipmac_confirmIPMAC_disconnect')).click();
        //     element(by.id('rule-ipmacbinding-editor_button_deployConfirm')).click();
        //     expect(element(by.id('rule-ipmac_button_confirmEdit')).isPresent()).toBeFalsy();
        // }else if(element(by.id('rule-ipmacbinding-editor_button_deployConfirm')).isDisplayed()) {
        //     element(by.id('rule-ipmacbinding-editor_button_deployConfirm')).click();
        // }


    });

    afterAll(function() {
        browser.removeMockModule('apiMockModule');
        login.logout();
    });
});

