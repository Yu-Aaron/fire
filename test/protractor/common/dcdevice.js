'use strict';
var path = require('path');
(function(){
	function topoExist(){
	    return element(by.id('sidePanelButton')).isDisplayed();
	}
	var dcdevice = function(){
		var obj = this;

		obj.createDCDevice = function(){
			topoExist.then(function(){
				element(by.id('header_li_asset')).click();
			    element(by.id('asset_device_create_btn')).click();
			    element(by.id('new-device-name')).sendKeys("TestDC001");
			    element(by.id('new-device-serial')).sendKeys("SC0201B500000110");
			    element(by.id('new-device-ip')).sendKeys("2.2.2.5");
			    element(by.id('new-device-confirm')).click();

			    var DeviceNames = element.all(by.css('.table-col-device-name'));
			    var foundLen = function (DeviceNames){
			        var len = 0;
			        DeviceNames.map(function (d) {
			            len = d.getText().then(function (text) {
			                return text==='TestDC001'?++len:len;
			            });
			        });
			        return protractor.promise.fullyResolved(len);
			    }
			    expect(foundLen(DeviceNames)).toEqual(1);
			});
		};
	};
	module.exports = function() {
    return new dcdevice();
  };
}());