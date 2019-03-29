'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "SETTINGS_DPI_REBOOT";
	var params = {
		privilegeName: curPrivilege,
		userName: curPrivilege + "_User",
		groupName: curPrivilege + "_GROUP",
		privilegeGroupName: [],
		privilegeUrl: "/setting/systemdevice",
		hasView: false,
		testForAdmin: testForAdmin,
		testForNonePrivilege: testForNonePrivilege,
		testForViewPrivilege: testForViewPrivilege
	}
	pTest.test(params);
	return;

	function testForAdmin () {
		element(by.id('header_li_setting')).click();
		expect(element(by.id('setting_li_systemdevice')).isPresent()).toBeTruthy();
		element(by.id('setting_li_systemdevice')).click();
		expect(element(by.id('security_device_reset')).isDisplayed()).toBeTruthy();
		expect(element(by.id('setting-systemdevice_button_confirmReset')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_setting')).click();
		element(by.id('setting_li_systemdevice')).click();
		expect(element(by.id('security_device_reset')).isDisplayed()).toBeFalsy();
		expect(element(by.id('sysdevice_upgrade_dpi_select_all')).isDisplayed()).toBeTruthy();
	}

	function testForViewPrivilege () {
		// Empty
	};
});