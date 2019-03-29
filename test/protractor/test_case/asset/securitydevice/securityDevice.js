'use strict';

var Login = require('../../../common/login.js');
var Settings = require('../../../common/settings.js');
var UploadTopology = require('../../../common/uploadTopology.js');
var path = require('path');

describe('Asset - FactoryDevice: ', function() {
  var settings = new Settings();
  var login = new Login();
  var uploadTopology = new UploadTopology();
  var host = settings.host;

  it('Create DC Device Test', function() {
    browser.get(host);
    settings.init();
    login.loginAsAdmin();
    uploadTopology.simpleTopo();

    browser.waitForAngular();
    element(by.id('header_li_asset')).click();
    element(by.id('asset_device_create_btn')).click();
    element(by.id('new-device-name')).sendKeys("TestDC001");
    element(by.id('new-device-serial')).sendKeys("SC0201B500000110");
    element(by.id('new-device-ip')).sendKeys("1.1.2.5");
    element(by.id('new-device-confirm')).click();
    browser.sleep(1000);
    browser.waitForAngular();
    expect(element(by.id('securitydevice-securityDeviceTable_a_showDetails_7')).isDisplayed().isDisplayed()).toBeTruthy();
  }, 100000);

  it('Change security device rule deploy Test', function() {
    element(by.id('securitydevice-securityDeviceTable_a_showDetails_1')).click();
    expect(element(by.id('securitydetail_rule_text_all')).isDisplayed()).toBeTruthy();

    element(by.id('securitydetail_rule_edit')).click();
    element(by.id('securitydetail_rule_select')).click();
    element(by.cssContainingText('option', '只部署黑名单')).click();
    element(by.id('securitydetail_rule_confirm')).click();
    expect(element(by.id('securitydetail_rule_text_blacklist')).isDisplayed()).toBeTruthy();
  }, 100000);

  it('Change DC device protocol Test', function() {
    element(by.id('asset-assetSideNav_a_securitydevice')).click();
    element(by.id('securitydevice-securityDeviceTable_a_showDetails_7')).click();
    element(by.id('securitydetail_protocol_edit')).click();
    element(by.css('.dropdown-toggle.ng-binding.btn.btn-default')).click();
    element.all(by.css('.checkboxInput')).get(0).click();
    element.all(by.css('.checkboxInput')).get(1).click();
    element(by.id('securitydetail_protocol_confirm')).click();
    expect(element.all(by.css('.securitydetail_protocol_text')).get(0).getText()).toEqual("OPCDA  ");
    expect(element.all(by.css('.securitydetail_protocol_text')).get(1).getText()).toEqual("MODBUS  ");
    login.logout();
  }, 100000);
});

