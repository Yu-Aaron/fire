'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var login = new Login();
	var host = settings.host;

	var privilegeName = "DEVICE_MANAGEMENT";
	var userName = "DEVICE_MANAGEMENT_User";
	var groupName = "DEVICE_MANAGEMENT_GROUP";

	var checkNextDelete = function (elements, index, length, compareTxt, target1css, target2id) {
		elements.get(index).getText().then(function (t) {
			if(t.indexOf(compareTxt)>-1){
				elements.get(index).element(by.css(target1css)).click();
				element(by.id(target2id)).click();
			}else{
				index++;
				index<length && checkNextDelete(elements, index, length, compareTxt, target1css, target2id);
			}
		})
	};

	it('1. Default admin should have privilege for ' + privilegeName + ': ', function() {
	    browser.get(host);
	    settings.init();
	    login.loginAsAdmin();
	    expect(element(by.id('header_li_asset')).isDisplayed()).toBeTruthy();
	    expect(element(by.id('header_li_topology')).isDisplayed()).toBeTruthy();
	});

	it('2. Create ' + groupName + ' Group and User, user should not be able to view ASSET tab, and MONITOR-DEVICE tab', function() {
		// Go to user group create page
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();

		// Delete old user if already exist.
		var users = element.all(by.css(".user_table_row_tr"));
		users.count().then(function(n){
			checkNextDelete(users, 0, n, userName, '.user_delete', 'user_group_delete_confirm');
		});
		browser.driver.sleep(4000);
		element(by.id('group_list_tab')).click();
		// Delete old group if already exist.
		var groups = element.all(by.css(".group_table_row_tr"));
		groups.count().then(function(n){
			checkNextDelete(groups, 0, n, groupName, '.user_group_delete', 'user_group_delete_confirm');
		});

		element(by.id('groups_create')).click();
		// Create group
		element.all(by.id('systemUserGroupEditInput')).first().sendKeys(groupName);
		element.all(by.id('input-stuffname')).first().sendKeys(groupName + " for unit test");
		element.all(by.id('userGroupPrivilege_' + privilegeName + '_none')).first().click();
		element.all(by.id('systemuser_group_edit_confirm')).first().click();

		// Create user and assign him to the new group
		element(by.id('user_list_tab')).click();
		element(by.id('user_list_create')).click();
		element.all(by.id('input-username')).first().sendKeys(userName);
		element.all(by.id('input-stuffname')).first().sendKeys(userName);
		element.all(by.id('input-password')).first().sendKeys("admin@123");
		element.all(by.id('input-confirm-password')).first().sendKeys("admin@123");
		element(by.id('group_select_radio_button_' + groupName)).click();
		element(by.id('systemuser_create_confirm')).click();

		// Login as new User and test
		login.logout();
		login.login(userName, "admin@123");
		element(by.id('header_li_monitor')).click().then(function () {
			expect(element(by.id('monitor_a_device')).isPresent()).toBe(false);
			expect(element(by.id('header_li_asset')).isPresent()).toBe(false);
		});
		element(by.id('header_li_monitor')).click();

	    browser.get(host + "/asset/securitydevice").then(function () {
	    	browser.getCurrentUrl().then(function(actualUrl) {
	    		expect(actualUrl).toBe(host + '/monitor/overview');
	    	});
	    });
		login.logout();
	});

	it('3. Change ' + groupName + ' to have view right, user should not be able to view buttons: ', function() {
		browser.driver.sleep(2000);
		login.loginAsAdmin();
		// Go to user group page
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();
		element(by.id('group_list_tab')).click();

		// edit group
		var groups = element.all(by.css(".group_table_row_tr"));
		groups.count().then(function(n){
			for(var i=0; i<n; i++){
				(function(){
					var index = i;
					groups.get(index).getText().then(function (t) {
						if(t.indexOf(groupName)>-1){
							groups.get(index).element(by.css('.user_group_edit')).click();
							element.all(by.id('userGroupPrivilege_' + privilegeName + '_view')).get(1).click();
							element.all(by.id('systemuser_group_edit_confirm')).get(1).click();
						}
					});
				})();
			}
		});
		// Login as new User and test
		login.logout();
		login.login(userName, "admin@123");
		element(by.id('header_li_monitor')).click().then(function () {
			expect(element(by.id('monitor_a_device')).isPresent()).toBe(true);
			expect(element(by.id('header_li_asset')).isPresent()).toBe(true);
		});
		element(by.id('header_li_asset')).click().then(function(){
			expect(element(by.id('asset_device_create_btn')).isPresent()).toBe(false);
		});
		login.logout();

		login.loginAsAdmin();
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();
		// Delete user
		var users = element.all(by.css(".user_table_row_tr"));
		users.count().then(function(n){
			checkNextDelete(users, 0, n, userName, '.user_delete', 'user_group_delete_confirm');
		});
		browser.driver.sleep(4000);
		element(by.id('group_list_tab')).click();
		// Delete group
		var groups = element.all(by.css(".group_table_row_tr"));
		groups.count().then(function(n){
			checkNextDelete(groups, 0, n, groupName, '.user_group_delete', 'user_group_delete_confirm');
		});
		login.logout();
	});
});