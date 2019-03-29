'use strict';

var Login = require('../../common/login.js');
var Settings = require('../../common/settings.js');
var UploadTopology = require('../../common/uploadTopology.js');
var path = require('path');

describe('Asset - FactoryDevice: ', function() {
  var settings = new Settings();
  var login = new Login();
  var uploadTopology = new UploadTopology();
  var host = settings.host;
  beforeAll(function() {
    browser.removeMockModule('mockE2E');
  });
  it('Factory Device Table Display Test', function() {
    browser.get(host);
    browser.sleep(2000);
    settings.init();
    login.loginAsAdmin();
    uploadTopology.simpleTopo();

    $('#header_li_asset').click();
    $('.left-navbar-item-factorydevice').click();

    var row1 = $('.factory-device-table >tbody >tr:nth-child(1)');
    var row2 = $('.factory-device-table >tbody >tr:nth-child(2)');
    var row3 = $('.factory-device-table >tbody >tr:nth-child(5)');
    // check the content of the first row of table
    expect(row1.element(by.className('table-col-device-name')).getText()).toBe('Client VM(Linux)');
    expect(row1.element(by.className('table-col-model')).getText()).toBe('OPCandS7');
    expect(row1.element(by.className('inline-table-ip')).getText()).toBe('192.168.3.101');
    expect(row1.element(by.className('inline-table-mac')).getText()).toBe('08:00:27:6F:50:98');
    // check the content of the second row of table
    expect(row2.element(by.className('table-col-device-name')).getText()).toBe('Client VM(Windows)');
    expect(row2.element(by.className('table-col-model')).getText()).toBe('N/A');
    expect(row2.element(by.className('inline-table-ip')).getText()).toBe('192.168.3.102');
    expect(row2.element(by.className('inline-table-mac')).getText()).toBe('未知');
    // check the content of the third row of table
    expect(row3.element(by.className('table-col-device-name')).getText()).toBe('Server VW(Windows)');
    expect(row3.element(by.className('table-col-model')).getText()).toBe('S7');
    expect(row3.element(by.className('inline-table-ip')).getText()).toBe('192.168.3.201');
    expect(row3.element(by.className('inline-table-mac')).getText()).toBe('08:00:27:76:C7:B3');

  }, 120000);
  
  it('Factory Device Detail View Test', function(){
    $('.factory-device-table > tbody > tr:nth-child(1) .view-device-detail').click();
    //check the device image
    expect(($('.detail-page-wrapper')).isPresent()).toBe(true);
    expect($('.device-image').getCssValue('background-image')).toContain('/images/hmi-icon.png');
    // check the content of the device detail panel
    expect($('#name-content').getText()).toBe('Client VM(Linux)');
    expect($('#serial-number-content').getText()).toBe('未知');
    expect($('#model-content').getText()).toBe('OPCandS7');
    expect($('#manufacturer-content').getText()).toBe('未知');
    expect($('#node-zone-content').getText()).toBe('HMI');
    expect($('#update-time-content').getText()).not.toBe('');
    // //check the content of the ip/mac panel
    var row1 = $$('.ip-mac-row').get(0);
    expect(row1.$('.ip-content').getText()).toBe('192.168.3.101');
    expect(row1.$('.mac-content').getText()).toBe('08:00:27:6f:50:98');
  }, 120000);

  it('Factory Device Add New Device Test', function(){
    $('.left-navbar-item-factorydevice').click();
    $('#new-device-button').click();
    // check the device name field
    $('#new-device-name').sendKeys('Test Device');
    $('#new-device-name').clear();
    expect($('#new-device-name + error-msg .name-error').isPresent()).toBe(true);

    $('#new-device-name').sendKeys('Test Device');
    expect($('#new-device-name + error-msg .name-error').isDisplayed()).toBe(false);

    $('#new-device-serial').sendKeys('Serial Number');
    // check the device mode field and device image
    /*
    $('#new-device-working-mode option[value="0"]').click();
    expect($('.device-img').getAttribute('src')).toBe(host+'/images/hmi-icon.png');

    $('#new-device-working-mode option[value="1"]').click();
    expect($('.device-img').getAttribute('src')).toBe(host+'/images/opc_client-icon.png');

    $('#new-device-working-mode option[value="2"]').click();
    expect($('.device-img').getAttribute('src')).toBe(host+'/images/opc_server-icon.png');

    $('#new-device-working-mode option[value="3"]').click();
    expect($('.device-img').getAttribute('src')).toBe(host+'/images/plc-icon.png');

    $('#new-device-working-mode option[value="4"]').click();
    expect($('.device-img').getAttribute('src')).toBe(host+'/images/workstation-icon.png');
    //check if the fields are correct if subnet is selected
    $('#new-device-working-mode option[value="5"]').click();
    expect($('.device-img').getAttribute('src')).toBe(host+'/images/subnet-icon.png');
    expect($('.model-field').isDisplayed()).toBe(false);
    expect($('.manufacturer-field').isDisplayed()).toBe(false);
    expect($('.memo-field').isDisplayed()).toBe(false);
    expect($('.ip-mac-row').isDisplayed()).toBe(false);
    expect($('.subnet-ip-mac').isDisplayed()).toBe(true);
    // check if the fields are correct if mode is other than subnet
    $('#new-device-working-mode option[value="6"]').click();
    expect($('.device-img').getAttribute('src')).toBe(host+'/images/unknown-device-icon.png');
    expect($('.model-field').isDisplayed()).toBe(true);
    expect($('.manufacturer-field').isDisplayed()).toBe(true);
    expect($('.memo-field').isDisplayed()).toBe(true);
    expect($('.ip-mac-row').isDisplayed()).toBe(true);
    expect($('.subnet-ip-mac').isDisplayed()).toBe(false);
    */
    //check if the fields are correct if model is new
    $('#new-device-working-mode option[value="0"]').click();
    $('#device-model-list option[value="0"]').click();
    expect($('#new-device-model-make').isDisplayed()).toBe(true);
    expect($('#new-device-model-memo').isDisplayed()).toBe(true);
    expect($('.input-stacked-wrap').isDisplayed()).toBe(true);
    //check if the fields are correct if model is other than new
    $('#device-model-list option[value="2"]').click();
    expect($('#new-device-model-make').isDisplayed()).toBe(false);
    expect($('#new-device-model-memo').isDisplayed()).toBe(false);
    expect($('.input-stacked-wrap').isDisplayed()).toBe(false);
    //check ip fields
    $('.ip-mac-row-0 .ip-input').sendKeys('192.168.0.1');
    expect($('.add-ip-mac-button').isEnabled()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(true);

    // //---------------- short cut --------------------//
    // $('#new-device-name').sendKeys('Test Device');
    // $('#new-device-serial').sendKeys('Serial Number');
    // $('#new-device-working-mode option[value="0"]').click();
    // $('#device-model-list option[value="2"]').click();
    // //---------------- short cut end--------------------//

    $('.ip-mac-row-0 .ip-input').clear();
    expect($('.add-ip-mac-button').isEnabled()).toBe(false);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);
    
    $('.ip-mac-row-0 .ip-input').sendKeys('192.168.0.');
    expect($('.add-ip-mac-button').isEnabled()).toBe(false);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);
    expect($('.ip-mac-row-0 error-msg .ip-invalid').isDisplayed()).toBe(true);

    $('.ip-mac-row-0 .ip-input').clear();
    $('.ip-mac-row-0 .ip-input').sendKeys('192.168.0.1');
    $('.add-ip-mac-button').click();
    expect($('.ip-mac-row-1').isPresent()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);

    $('.ip-mac-row-1 .ip-input').sendKeys('192.168.0.1');
    expect($('.ip-mac-row-1 error-msg .ip-dup').isDisplayed()).toBe(true);

    $('.ip-mac-row-1 .ip-input').clear();
    $('.ip-mac-row-1 .ip-input').sendKeys('192.168.0.2');
    expect($('.ip-mac-row-1 error-msg .ip-dup').isDisplayed()).toBe(false);
    expect($('.add-ip-mac-button').isEnabled()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(true);

    $('.ip-mac-row-1 .ip-input').clear();
    $('.ip-mac-row-1 .ip-input').sendKeys('192.168.3.101');
    expect($('.ip-mac-row-1 error-msg .ip-dup').isDisplayed()).toBe(true);
    expect($('.add-ip-mac-button').isEnabled()).toBe(false);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);

    $('.ip-mac-row-1 .delete-button').click();
    expect($('.ip-mac-row-1').isPresent()).toBe(false);
    expect($('.add-ip-mac-button').isEnabled()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(true);

    // //---------------- short cut --------------------//
    // $('.ip-mac-row-0 .ip-input').sendKeys('192.168.0.1');
    // //---------------- short cut end--------------------//

    //check mac fields
    $('.ip-mac-row-0 .mac-input').sendKeys('11:11:11:11:11:33');
    expect($('.add-ip-mac-button').isEnabled()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(true);

    $('.ip-mac-row-0 .mac-input').clear();
    $('.ip-mac-row-0 .mac-input').sendKeys('11:11:11:11:11:1');
    expect($('.ip-mac-row-0 error-msg .mac-invalid').isDisplayed()).toBe(true);
    expect($('.add-ip-mac-button').isEnabled()).toBe(false);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);

    $('.ip-mac-row-0 .mac-input').clear();
    $('.ip-mac-row-0 .mac-input').sendKeys('08:00:27:76:C7:B3');
    expect($('.ip-mac-row-0 error-msg .mac-dup').isDisplayed()).toBe(true);
    expect($('.add-ip-mac-button').isEnabled()).toBe(false);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);

    $('.ip-mac-row-0 .mac-input').clear();
    $('.ip-mac-row-0 .mac-input').sendKeys('11:11:11:11:11:33');
    $('.add-ip-mac-button').click();
    $('.ip-mac-row-1 .ip-input').sendKeys('192.168.0.2');
    $('.ip-mac-row-1 .mac-input').sendKeys('11:11:11:11:11:12');
    expect($('.add-ip-mac-button').isEnabled()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(true);

    $('.ip-mac-row-1 .mac-input').clear();
    $('.ip-mac-row-1 .mac-input').sendKeys('11:11:11:11:11:33');
    expect($('.ip-mac-row-0 error-msg .mac-dup').isDisplayed()).toBe(true);
    expect($('.add-ip-mac-button').isEnabled()).toBe(false);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);

    // //---------------- short cut --------------------//
    // $('.ip-mac-row-0 .mac-input').sendKeys('11:11:11:11:11:11');
    // $('.add-ip-mac-button').click();
    // $('.ip-mac-row-1 .ip-input').sendKeys('192.168.0.2');
    // $('.ip-mac-row-1 .mac-input').sendKeys('11:11:11:11:11:12');
    // //---------------- short cut end--------------------//
    $('.ip-mac-row-1 .mac-input').clear();
    $('.ip-mac-row-1 .mac-input').sendKeys('11:11:11:11:11:12');
    $('.confirm-new-device-btn').click();
    browser.sleep(2000);
    expect($$('.pagination-sm > li').count()).toBe(6);
    expect($$('.factory-device-table > tbody > tr').count()).toBe(10);

  }, 450000);

  it('Factory Device Add New Subnet Test', function(){
    $('.left-navbar-item-factorydevice').click();
    $('#new-device-button').click();
    $('#new-device-name').sendKeys('Test Subnet');
    $('#new-device-serial').sendKeys('Subnet Serial Number');
    $('#new-device-working-mode option[value="5"]').click();

    $('#new-device-ip').sendKeys('192.168.3.1/24');
    expect($('.subnet-ip-mac error-msg .subnet-conflict').isPresent()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);

    $('#new-device-ip').clear();
    $('#new-device-ip').sendKeys('192.168.3.1');
    expect($('.subnet-ip-mac error-msg .subnet-invalid').isPresent()).toBe(true);
    expect($('.confirm-new-device-btn').isEnabled()).toBe(false);

    $('#new-device-ip').clear();
    $('#new-device-ip').sendKeys('192.168.2.1/24');
    $('.confirm-new-device-btn').click();
    browser.sleep(2000);
    expect($$('.pagination-sm > li').count()).toBe(6);
    expect($$('.factory-device-table > tbody > tr').count()).toBe(10);

  }, 300000);

  it('Factory Device Modify Device Ip Mac Test', function(){
    $('.factory-device-table > tbody > tr:nth-child(6) .view-device-detail').click();
    $('#edit-ip-button').click();
    expect($('.ip-mac-row-0').isDisplayed()).toBe(true);
    expect($('.ip-mac-row-1').isDisplayed()).toBe(true);
    expect($('.ip-mac-row-1 .remove-ip-mac').isDisplayed()).toBe(true);
    expect($('.add-ip-mac-button').isDisplayed()).toBe(true);
    expect($('.add-ip-mac-button').isEnabled()).toBe(true);
    expect($('#edit-ip-done').isEnabled()).toBe(true);

    $('.add-ip-mac-button button').click();
    expect($$('.ip-mac-row').count()).toBe(3);
    expect($('#remove-ip-mac-button-1').isEnabled()).toBe(false);
    expect($('.add-ip-mac-button button').isEnabled()).toBe(false);
    expect($('#edit-ip-done').isEnabled()).toBe(false);    

    $('#ip-input-2').sendKeys('192.168.0.1');
    expect($('#ip-error-2 .ip-dup').isDisplayed()).toBe(true);

    $('#ip-input-2').clear();
    $('#ip-input-2').sendKeys('192.168.3.101');
    expect($('#ip-error-2 .ip-dup').isDisplayed()).toBe(true);

    $('#ip-input-2').clear();
    $('#ip-input-2').sendKeys('192.168.0.3');
    expect($('#ip-error-2 .ip-dup').isDisplayed()).toBe(false);

    $('#mac-input-2').sendKeys('11:11:11:11:11:1');
    expect($('#mac-error-2 .mac-invalid').isDisplayed()).toBe(true);

    $('#mac-input-2').clear();
    $('#mac-input-2').sendKeys('11:11:11:11:11:11');
    expect($('#mac-error-2 .mac-dup').isDisplayed()).toBe(true);

    $('#mac-input-2').clear();
    $('#mac-input-2').sendKeys('08:00:27:6F:50:98');
    expect($('#mac-error-2 .mac-dup').isDisplayed()).toBe(true);

    $('#mac-input-2').clear();
    $('#mac-input-2').sendKeys('11:11:11:11:11:13');
    $('.add-ip-mac-button button').click();
    expect($$('.ip-mac-row').count()).toBe(4);

    $('#ip-input-3').sendKeys('192.168.0.4');
    $('#edit-ip-done').click();
    expect($$('.ip-mac-row').count()).toBe(4);

    $('#edit-ip-button').click();
    $('#remove-ip-mac-button-3').click();
    $('#edit-ip-done').click();
    expect($$('.ip-mac-row').count()).toBe(3);
  }, 300000);

  afterAll(function() {
    browser.removeMockModule('mockE2E');
    login.logout();
  });

});

