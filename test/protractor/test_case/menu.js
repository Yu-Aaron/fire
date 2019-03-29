'use strict';

var Login = require('../common/login.js');
var Settings = require('../common/settings.js');
var UploadTopology = require('../common/uploadTopology.js');
describe('Menu Test: ', function() {
  var login = new Login();
  var uploadTopology = new UploadTopology();

  var urlChecker = function(id, url) {
    element(by.id(id)).click().then(function() {
      //browser.waitForAngular();
      expect(browser.getCurrentUrl()).toContain(url);
    });
  };

  it('root user menus test', function() {
    browser.get('http://127.0.0.1:3000');
    var settings = new Settings();
    settings.init();
    login.loginAsRoot();

    urlChecker('header_li_domain', '/domain');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_setting', '/setting/systemconsole');
    urlChecker('setting-systemconsole_li_systemSetting', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_systemReset', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_systemUpgrade', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_ipConfig', 'setting/systemconsole');
    expect(element(by.id('setting-systemconsole_li_protocolConfig')).isDisplayed()).toBeFalsy();
    expect(element(by.id('setting_li_systemdevice')).isPresent()).toBeFalsy();

    ////////////////////////////////////////////////////////////
    element(by.css('.header-nav-right .header-nav-right-item:nth-child(2)')).click();
    urlChecker('header_li_myAccount', 'myaccount');
    element(by.css('.header-nav-right .header-nav-right-item:nth-child(2)')).click();
    urlChecker('header_li_todoList', 'todolist');
    element(by.css('.header-nav-right .header-nav-right-item:nth-child(2)')).click();
    expect(element(by.id('header_li_userManagement')).isDisplayed()).toBeFalsy();
    element(by.css('.header-nav-right .header-nav-right-item:nth-child(2)')).click();

    login.logout();
  });

  it('admin user menus test', function(){
    login.loginAsAdmin();
    uploadTopology.simpleTopo();

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_monitor', 'monitor/overview');
    urlChecker('monitor_a_overview', 'monitor/overview');
    urlChecker('monitor_a_event', 'monitor/event');
    urlChecker('monitor_a_logger', 'monitor/logger');
    urlChecker('monitor_a_device', 'monitor/device');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_asset', 'asset/securitydevice');
    urlChecker('asset-assetSideNav_a_securitydevice', 'asset/securitydevice');
    urlChecker('asset-assetSideNav_a_factorydevice', 'asset/factorydevice');
    urlChecker('asset-assetSideNav_a_networkdevice', 'asset/networkdevice');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_rule', 'rule/blacklist');
    urlChecker('rule_a_blacklist', 'rule/blacklist');
    element(by.id('rule_a_whitelist')).click();
    urlChecker('rule_a_sub_learning', 'rule/learning');
    urlChecker('rule_a_sub_whitelist', 'rule/whitelist');
    urlChecker('rule_a_sub_networklist', 'rule/networklist');
    urlChecker('rule_a_ipmac', 'rule/ipmac');
    urlChecker('rule_a_maliciousdomain', 'rule/maliciousdomain');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_topology', 'topology/singleTopo');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_infsafety', 'infsafety');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_attack', 'attack');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_detect', 'detect');
    urlChecker('detect_a_offline', 'detect?panel=offline');
    urlChecker('detect_a_online', 'detect?panel=online');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_audit', 'audit/dpidata');
    urlChecker('audit_sidenav_tab_0', 'audit/dpidata');
    urlChecker('audit_sidenav_tab_1', 'audit/dpidevicedata');
    urlChecker('audit_sidenav_tab_2', 'audit/icdevicedata');
    urlChecker('audit_sidenav_tab_3', 'audit/audittable');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_report', 'report/event');
    urlChecker('report_a_event', 'report/event');
    urlChecker('report_a_logger', 'report/logger');
    urlChecker('report_a_protocol', 'report/protocol');

    ////////////////////////////////////////////////////////////
    urlChecker('header_li_setting', 'setting/systemconsole');
    urlChecker('setting_li_systemconsole', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_systemSetting', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_systemReset', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_systemUpgrade', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_ipConfig', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_protocolConfig', 'setting/systemconsole');
    urlChecker('setting-systemconsole_li_protocolPortSetting', 'setting/systemconsole');
    urlChecker('setting_li_systemdevice', 'setting/systemdevice');
    urlChecker('security_device_reset', 'setting/systemdevice');
    urlChecker('security_device_upgrade', 'setting/systemdevice');

    ////////////////////////////////////////////////////////////
    element(by.css('.header-nav-right .header-nav-right-item:nth-child(2)')).click();
    urlChecker('header_li_myAccount', 'myaccount');
    element(by.css('.header-nav-right .header-nav-right-item:nth-child(2)')).click();
    urlChecker('header_li_todoList', 'todolist');
    element(by.css('.header-nav-right .header-nav-right-item:nth-child(2)')).click();
    urlChecker('header_li_userManagement', 'systemuser');

    login.logout();
  });

});

