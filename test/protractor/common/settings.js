'use strict';
(function(){
	var Settings = function(){
		var obj = this;
		obj.init = function(){
			browser.manage().window().setSize(1280, 800);
		}

		obj.host = "http://localhost:3000";
		obj.coolStuffHost = "http://10.0.50.160";
	};
	module.exports = function() {
    return new Settings();
  };
}());