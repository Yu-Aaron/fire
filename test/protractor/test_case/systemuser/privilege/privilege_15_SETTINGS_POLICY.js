'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "SETTINGS_POLICY";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
		privilegeUrl: "/setting/systemconsole",
		hasView: true,
		testForAdmin: testForAdmin,
		testForNonePrivilege: testForNonePrivilege,
		testForViewPrivilege: testForViewPrivilege
	}
	pTest.test(params);
	return;

	function testForAdmin () {
		element(by.id('header_li_setting')).click();
		expect(element(by.id('setting_li_systemconsole')).isPresent()).toBeTruthy();
		element(by.id('setting_li_systemconsole')).click();
		expect(element(by.id('setting-systemconsole_button_editIPAddress')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_editNtpSync')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_editSecurity')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_editStorage')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_editInfor')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_editSoundOption')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_editIPTraffic')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_setting')).click();
		element(by.id('setting_li_systemconsole')).click();
		expect(element(by.id('setting-systemconsole_li_systemSetting')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting_systemconsole_container_editIPAddress')).isPresent()).toBeFalsy();
		expect(element(by.id('setting_systemconsole_container_editNtpSync')).isPresent()).toBeFalsy();
		expect(element(by.id('setting-systemconsole_button_shutdownModal')).isDisplayed()).toBeTruthy();
	}

	function testForViewPrivilege () {
		element(by.id('header_li_setting')).click();
		expect(element(by.id('setting_li_systemconsole')).isPresent()).toBeTruthy();
		element(by.id('setting_li_systemconsole')).click();
		expect(element(by.id('setting-systemconsole_button_editIPAddress')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting-systemconsole_button_editNtpSync')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting-systemconsole_button_editSecurity')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting-systemconsole_button_editStorage')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting-systemconsole_button_editInfor')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting-systemconsole_button_editSoundOption')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting-systemconsole_button_editIPTraffic')).isDisplayed()).toBeFalsy();
	};
});