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
		userName: curPrivilege + "_ALL_User",
		groupName: curPrivilege + "_ALL_GROUP",
		privilegeGroupName: ["SETTINGS_PLATFORM_REBOOT","SETTINGS_PLATFORM_UPGRADE_RESET","SETTINGS_IP_LOGIN","SETTINGS_PROTOCOL"],
		privilegeUrl: "/setting/systemconsole",
		hasView: false,
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
		expect(element(by.id('setting_systemconsole_container_editIPAddress')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_setting')).click();
		expect(element(by.id('setting_li_systemconsole')).isPresent()).toBeFalsy();
		expect(element(by.id('setting-systemdevice_button_confirmReset')).isDisplayed()).toBeTruthy();
		browser.get(host + params.privilegeUrl).then(function () {
			browser.getCurrentUrl().then(function(actualUrl) {
				expect(actualUrl).toBe(host + '/monitor/overview');
			});
		});
	}

	function testForViewPrivilege () {
		// Empty
	};
});