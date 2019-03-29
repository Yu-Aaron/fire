'use strict';

var PrivilegeTest = require('../../../common/privilegeTest.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var host = settings.host;
	var pTest = new PrivilegeTest();
	var curPrivilege = "SETTINGS_IP_LOGIN";
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
		expect(element(by.id('setting-systemconsole_li_ipConfig')).isDisplayed()).toBeTruthy();
		element(by.id('setting-systemconsole_li_ipConfig')).click();
		expect(element(by.id('initial_add_remote_ip_button')).isDisplayed()).toBeTruthy();
	}

	function testForNonePrivilege () {
		element(by.id('header_li_setting')).click();
		element(by.id('setting_li_systemconsole')).click();
		expect(element(by.id('setting-systemconsole_li_ipConfig')).isDisplayed()).toBeFalsy();
	}

	function testForViewPrivilege () {
		element(by.id('header_li_setting')).click();
		expect(element(by.id('setting_li_systemconsole')).isPresent()).toBeTruthy();
		element(by.id('setting_li_systemconsole')).click();
		expect(element(by.id('setting-systemconsole_li_ipConfig')).isDisplayed()).toBeTruthy();
		element(by.id('setting-systemconsole_li_ipConfig')).click();
		expect(element(by.id('initial_add_remote_ip_button')).isDisplayed()).toBeFalsy();
	};
});