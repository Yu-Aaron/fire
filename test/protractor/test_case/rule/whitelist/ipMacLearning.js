'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var Mocks = require('../../../common/mock.js');

//Protractor Test:
describe('Rule - Whitelist - IP MAC Learning Test: ', function() {
    var settings = new Settings();
    var login = new Login();
    var mock = new Mocks();

    //Functions need to be called before each 'it'
    //============================= addMockModule to use mock up data ================================
    beforeAll(function(){
        browser.addMockModule('apiMockModule', function () {
            var serviceId = 'LearningMock';
            angular.module('apiMockModule', [])
                .config(['$httpProvider', configApiMock])
                .factory(serviceId, [LearningMock]);

            // Function that find certain http request and replace the response with mockup data:
            function LearningMock() {
                var getTaskMac = false;
                return {
                    request: function (config) {
                        getTaskMac = (config.url.indexOf('learnedipmac')) > -1;
                        window.setIpmac = getTaskMac&&config.method==='PUT'?"Called":window.setIpmac;
                        return config;
                    },
                    response: function (response) {
                        if(getTaskMac){
                            response.data = window.ipmacRecord;
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
        
        // mock.addMockModule('PUT', '/learnedipmac/', [{"learnedIpMacId":"8d3fc036-a294-4aae-86e2-edf2de5739b3","deviceId":"bf081a30-d28e-4484-81a6-4d5142e91130","deviceIp":"192.168.3.101","realMac":"08:00:27:6f:50:98","createdAt":"2015-12-04 23:55:33.0","updatedAt":"2015-12-04 23:55:33.0","taskId":"123","deviceName":"Client VM(Linux)","topoMac":"08:00:27:6f:50:95","status":0},{"learnedIpMacId":"fdd2f698-12b8-4c55-ac6e-11b2b134da04","deviceId":"9962ce7a-f8c8-45fa-be2e-253405615b72","deviceIp":"192.168.3.201","realMac":"08:00:27:76:c7:b3","createdAt":"2015-12-04 23:55:34.0","updatedAt":"2015-12-04 23:55:34.0","taskId":"123","deviceName":"Server VW(Windows)","topoMac":"08:00:27:76:c7:b3","status":0}], 200);
    });
    //============================= End of addMockModule ================================

    it('Ip mac UI with 2 records, 1st one has a update button', function() {
        browser.get('http://127.0.0.1:3000');

        settings.init();
        login.loginAsAdmin();
        var tabRule = element(by.id('header_li_rule'));
        var tabWhitelist = element(by.id('rule_a_whitelist'));
        var subMenuWhitelist = element(by.id('rule_a_sub_learning'));
        var tabPolicyManagement = element(by.id('rule-whiteList_li_whiteList_li_policyManagement'));
        var btnCreateRules = element(by.id('rule-whiteList-policyManagement_button_createRules'));
        var learningUI = element(by.id('rule-whiteList-editor_li_addRules'));
        var inputSetTime = element(by.id('learningInterval_text_minutes')); 
        var btnStartLearn = element(by.id('rule-whiteList-learningCtrl_startLearning'));
        var ipmacModal = element(by.id('mac-activity-record-modal'));
        var liLearnItem = element.all(by.css('.learning-item')).first();

        var linkIPMACMonitor = element(by.id('rule-whiteList-editor_a_showIPMACMonitor'));

        // Go to white list editor UI:
        tabRule.click();
        tabWhitelist.click();
        subMenuWhitelist.click();

        // tabPolicyManagement.click();
        // btnCreateRules.click(); 

        // start learning. Based on "learningInterval_text_days" is displayed or not, click different btn
        inputSetTime.isDisplayed().then(function (isVisible){
            if(isVisible){
                element(by.id('learningInterval_text_days')).click();
                inputSetTime.clear();
                inputSetTime.sendKeys("0.03");
                btnStartLearn.click();
            }else{
                learningUI.click();
                element(by.id('learningInterval_text_days')).click();
                inputSetTime.clear();
                inputSetTime.sendKeys("0.03");
                btnStartLearn.click();
            }

            // Get the learning item
            var taskId;
            tabWhitelist.click();
            element(by.id('rule_a_sub_whitelist')).click();
            liLearnItem.getAttribute('id').then(function(id){
                taskId = id.replace("rule-whiteList-editor_li_learningTasks_", "");
                browser.executeScript('window.ipmacRecord = [{"learnedIpMacId":"8d3fc036-a294-4aae-86e2-edf2de5739b3","deviceId":"bf081a30-d28e-4484-81a6-4d5142e91130","deviceIp":"192.168.3.101","realMac":"08:00:27:6f:50:98","createdAt":"2015-12-04 23:55:33.0","updatedAt":"2015-12-04 23:55:33.0","taskId":"' + taskId + '","deviceName":"Client VM(Linux)","topoMac":"08:00:27:6f:50:95","status":0},{"learnedIpMacId":"fdd2f698-12b8-4c55-ac6e-11b2b134da04","deviceId":"9962ce7a-f8c8-45fa-be2e-253405615b72","deviceIp":"192.168.3.201","realMac":"08:00:27:76:c7:b3","createdAt":"2015-12-04 23:55:34.0","updatedAt":"2015-12-04 23:55:34.0","taskId":"' + taskId + '","deviceName":"Server VW(Windows)","topoMac":"08:00:27:76:c7:b3","status":0}]');
            });

            liLearnItem.click();
            // open mac-activity-record-modal
            linkIPMACMonitor.click();
            var macItemsContainer = element(by.id('macItems-container'));
            macItemsContainer.all(by.css('.macItem')).then(function (items){
                expect(items.length).toEqual(2);
                expect(items[0].element(by.css('.btn')).isDisplayed()).toBeTruthy();
                expect(items[1].element(by.css('.btn')).isPresent()).toBeFalsy();
                items[0].element(by.css('.btn')).click();
                browser.executeScript(function () {
                    return window.setIpmac;
                }).then(function (setIpmac) {
                    expect(setIpmac).toEqual("Called");
                });
                element(by.css('.modal-close')).click();
            });
        });
    });

    afterAll(function() {
        browser.removeMockModule('apiMockModule');
        login.logout();
    });
});

