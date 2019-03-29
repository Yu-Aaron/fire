'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var path = require('path');

describe('New Privilege Test:', function() {
	var settings = new Settings();
	var login = new Login();
	var host = settings.host;

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

	var privilegeName = "USER_MANAGEMENT";
	var userName = "USER_MANAGEMENT_User";
	var groupName = "USER_MANAGEMENT_GROUP";
	var privilegeUrl = "/systemuser";

	it('1. Default admin should have privilege for ' + privilegeName + ': ', function() {
		browser.get(host);
		settings.init();
		login.loginAsAdmin();

		//====================Test for shown UI==============================
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();
		expect(element(by.id('user_list_create')).isPresent()).toBeTruthy();
	});

	it('2. Create ' + groupName + ' Group and User, user should not be able to edit ' + privilegeName, function() {
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
		element.all(by.id('userGroupPrivilege_' + privilegeName + '_view')).first().click();
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

		//====================Test for edit UI==============================
		element(by.id('header_a_navUser')).click();
		element(by.id('header_li_userManagement')).click();
		expect(element(by.id('user_list_create')).isEnabled()).toBe(false);
		login.logout();
	});

	it('3. delete ' + groupName + ' and its user: ', function() {
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