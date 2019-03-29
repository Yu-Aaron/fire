'use strict';
(function(){
	var Mocks = function(){
		var obj = this;
		obj.cleanMockModule = function(){
			browser.removeMockModule('mockE2E');
		};

		obj.addMultiMock = function(arr){
			browser.addMockModule('mockE2E', function(arr){
				angular.module('mockE2E', ['ngMockE2E']).run(function($httpBackend){
					for (var i=0;i<arr.length;i++){
						var tmp = arr[i];
						var regex = new RegExp(tmp.url, 'i');
						$httpBackend.when(tmp.method, regex).respond(tmp.status, tmp.data);
					}
					$httpBackend.whenGET(/.*/).passThrough();
	                $httpBackend.whenPOST(/.*/).passThrough();
	                $httpBackend.whenPUT(/.*/).passThrough();
	                $httpBackend.whenDELETE(/.*/).passThrough();
				});
			}, arr);
		}

		obj.addMockModule = function(method, url, data, status){
			var api = {
				method: method,
				url: url,
				data: data,
				status: status,
			};
			browser.addMockModule('mockE2E', function(api){
	            angular.module('mockE2E', ['ngMockE2E']).run(function($httpBackend){
	            	var regex = new RegExp(api.url, 'i');
	                $httpBackend.when(api.method, regex).respond(function(){
	                    return [api.status, api.data, {}];
	                });
	                $httpBackend.whenGET(/.*/).passThrough();
	                $httpBackend.whenPOST(/.*/).passThrough();
	                $httpBackend.whenPUT(/.*/).passThrough();
	                $httpBackend.whenDELETE(/.*/).passThrough();
	            });
	        }, api);
        }
    };
    module.exports = function() {
        return new Mocks();
    };
}());