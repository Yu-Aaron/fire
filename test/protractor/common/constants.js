'use strict';
(function(){
	var Constants = function(){
		var obj = this;
		obj.myMachineName = "josh-desktop";
	};
	module.exports = function() {
    return new Constants();
  };
}());