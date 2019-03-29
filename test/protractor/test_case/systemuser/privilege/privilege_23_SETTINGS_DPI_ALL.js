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
		userName: curPrivilege + "_ALL_User",
		groupName: curPrivilege + "_ALL_GROUP",
		privilegeGroupName: ["SETTINGS_DPI_UPGRADE_RESET"],
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
		expect(element(by.id('security_device_upgrade')).isPresent()).toBeTruthy();
		element(by.id('security_device_upgrade')).click();
		expect(element(by.id('sysdevice_upgrade_dpi_select_all')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_setting')).click();
		expect(element(by.id('setting_li_systemdevice')).isPresent()).toBeFalsy();
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