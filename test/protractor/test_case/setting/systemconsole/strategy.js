'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');

describe('Setting - SystemConsole - Strategy Setting Test: ', function() {
 it('Strategy Setting successful', function() {
    browser.get('http://127.0.0.1:3000');

    var settings = new Settings();
    var login = new Login();

    settings.init();
    login.loginAsAdmin();

    var tabSetting = element(by.id('header_li_setting'));
    var toggleEncrypt = element(by.id('setting-systemconsole_checkbox_ActiveEncryptionSwitch'));
    var buttonEdit = element(by.id('setting-systemconsole_button_encryption'));
    var buttonConfirm = element(by.id('setting-systemconsole_button_encryptionConfirm'));

    tabSetting.click();
    var oldVal = toggleEncrypt.isSelected();
    buttonEdit.click();
    toggleEncrypt.click();
    buttonConfirm.click();
    var newVal = toggleEncrypt.isSelected();
    expect(oldVal === newVal).toBeFalsy();
    login.logout();

    login.loginAsAdmin();
    tabSetting.click();
    oldVal = toggleEncrypt.isSelected();
    buttonEdit.click();
    toggleEncrypt.click();
    buttonConfirm.click();
    newVal = toggleEncrypt.isSelected();
    expect(oldVal === newVal).toBeFalsy();
    login.logout();
  }, 120000);
});

