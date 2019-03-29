'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "SETTINGS_PLATFORM_REBOOT";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
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
		expect(element(by.id('setting-systemconsole_li_systemReset')).isDisplayed()).toBeTruthy();
		element(by.id('setting-systemconsole_li_systemReset')).click();
		expect(element(by.id('setting-systemconsole_button_shutdownModal')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_restartModal')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemconsole_button_resetModal')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_setting')).click();
		element(by.id('setting_li_systemconsole')).click();
		expect(element(by.id('setting-systemconsole_li_systemReset')).isDisplayed()).toBeFalsy();
		expect(element(by.id('setting_systemconsole_container_editIPAddress')).isDisplayed()).toBeTruthy();
	}

	function testForViewPrivilege () {
		// Empty
	};
});