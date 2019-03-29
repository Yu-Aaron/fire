/**
 * Monitor Audit Controller
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.audit.dpidata')
        .controller('DPIDataCtrl', DPIDataCtrl)
        .filter('pagination', pagination);

    function DPIDataCtrl(mwdata, $modal, $rootScope, $q, $scope, topologyId, uiCtrl, trafficDataService) {
        //uiCtrl.findLand('FLOWDATA', 1);
        var vm = this;
        vm.protocolTime = "1h";

        getOverView();
        getProtocolView();
        //getDevice();
        //getSelectedDevice();

        vm.showTotalLineChart = function () {
            var inputData = [];
            var inputItem = {
                name: '数据流量',
                data: (function () {
                    var data = [];
                    if (!vm.overViewData) {
                        return data;
                    } else if (vm.overViewData.length < 1) {
                        data.push({
                            x: new Date().getTime(),
                            y: 0
                        });
                        return data;
                    }
                    var i = 0 - vm.overViewData.length;


                    for (i; i < 0; i += 1) {
                        var startTime = new Date(vm.overViewData[i + vm.overViewData.length].timestamp).getTime();
                        var totalBytes = Math.floor(vm.overViewData[i + vm.overViewData.length].totalBytes / 10.24) / 100;
                        data.push({
                            x: startTime,
                            y: totalBytes
                        });
                    }
                    return data;
                }())
            };
            inputData.push(inputItem);
            var config = {
                title: null,
                legendEnable: true
            };
            $('#dpi-overview-line-chart').highcharts(/*'StockChart', */mwdata.totalLineChart(inputData, config, $scope));
        };

        vm.showProtocolPieChart = function () {
            vm.protocolTotal = 0;
            vm.protocolNum = 0;
            vm.reportTime = new Date();
            var config_left = {title: null};
            for (var k = 0; k < vm.protocolViewData.length; k++) {
                vm.protocolNum++;
                vm.protocolTotal += vm.protocolViewData[k].totalBytes;
            }
            if (vm.protocolTotal > 0) {
                vm.protocolTotal = trafficDataService.formatTrafficDataWithUnit(vm.protocolTotal);
                var unit = vm.protocolTotal.substring(vm.protocolTotal.indexOf(" ") + 1);
                $('#dpi-protocol-pie-chart').highcharts(mwdata.pieChart(vm.protocolViewData, config_left, unit));
            } else {
                config_left = {title: null};
                $('#dpi-protocol-pie-chart').highcharts(mwdata.pieChart(vm.protocolViewData, config_left));
            }
            updateChartSize($('#dpi-protocol-pie-chart').highcharts());
        };

        vm.changeProtocolPieChart = function () {
            getProtocolView();
        };

        vm.showDeviceLine = function () {
            if (vm.selectedDevices) {
                var inputData = [];
                var inputColor = ['#7cb5ec', '#f45b5b', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#2b908f', '#91e8e1'];
                if (vm.selectedDevices.length > 3) {
                    console.log("Error! selected devices are more than 3!");
                    return 0;
                }
                var deviceIds = [];
                var inputDeviceDatas = function (index) {
                    var data = [];
                    if (!vm.deviceData[index]) {
                        return data;
                    } else if (vm.deviceData[index].length < 1) {
                        data.push({
                            x: new Date().getTime(),
                            y: 0
                        });
                        return data;
                    }
                    var i = 0 - vm.deviceData[index].length;

                    for (i; i < 0; i += 1) {
                        var startTime = new Date(vm.deviceData[index][i + vm.deviceData[index].length].startTime).getTime();
                        var totalBytes = Math.floor(vm.deviceData[index][i + vm.deviceData[index].length].totalBytes / 10.24) / 100;
                        data.push({
                            x: startTime,
                            y: totalBytes
                        });
                    }
                    //console.log(data);
                    return data;
                };
                for (var j = 0; j < vm.selectedDevices.length; j++) {
                    deviceIds.push(vm.selectedDevices[j].deviceId);
                    var inputItem = {
                        name: vm.selectedDevices[j].name,
                        color: inputColor[j],
                        data: inputDeviceDatas(j)
                    };
                    inputData.push(inputItem);
                }
                var config = {
                    title: null,
                    legendEnable: true,
                    deviceIds: deviceIds
                };
                vm.deviceLineChart = mwdata.deviceLineChart(inputData, config, $scope);
                $('#dpi-deviceview-line-chart').highcharts(/*'StockChart', */vm.deviceLineChart);
            }
        };

        function getOverView() {
            mwdata.getOverView(3600000).then(function (data) {
                vm.overViewData = data.data;
                vm.showTotalLineChart();
            });
        }

        function getProtocolView() {
            var time = 1;
            if (vm.protocolTime === "1h") {
                time = 3600000;
            } else if (vm.protocolTime === "24h") {
                time = 24 * 3600000;
            } else if (vm.protocolTime === "168h") {
                time = 168 * 3600000;
            }
            mwdata.getProtocolView(time).then(function (data) {
                vm.protocolViewData = data;
                vm.showProtocolPieChart();
            });
        }

        //function getDeviceView(){
        //  vm.deviceData = [];
        //  if(vm.selectedDevices){
        //    var promises = [];
        //    for(var j=0; j<vm.selectedDevices.length; j++){
        //      promises.push(dpidata.getDeviceView(vm.selectedDevices[j].deviceId, 3600000));
        //    }
        //    $q.all(promises).then(function (data) {
        //      for(var i=0; i<vm.selectedDevices.length; i++){
        //        if(data[i].data.length>0){
        //          vm.deviceData.push(data[i].data);
        //        }else{
        //          vm.deviceData.push({
        //            "startTime": data[i].endTime,
        //            "ipVersion": 0,
        //            "recvBytes": 0,
        //            "recvPackets": 0,
        //            "recvSpeed": 0,
        //            "sendBytes": 0,
        //            "sendPackets": 0,
        //            "sendSpeed": 0,
        //            "totalBytes": 0
        //          });
        //        }
        //      }
        //      vm.showDeviceLine();
        //    });
        //  }
        //}

        //function getDevice(){
        //  dpidata.getDevice(topologyId.id).then(function(data){
        //    vm.devices = data;
        //  });
        //}

        //function getSelectedDevice(){
        //  dpidata.getSelectedDevice(topologyId.id).then(function(data){
        //    if(!Object.keys(data).length){
        //      dpidata.getDevice(topologyId.id).then(function(deviceData){
        //        var length=(deviceData.length>3)?3:deviceData.length;
        //        if(length===0){
        //          console.log("No device found!");
        //        }else{
        //          var promises = [];
        //          for(var i=0; i<length; i++){
        //            promises.push(dpidata.updateSelectedDevice(deviceData[i].deviceId, 1));
        //          }
        //          $q.all(promises).then(function() {
        //            getSelectedDevice();
        //          });
        //        }
        //      });
        //    }else{
        //      vm.selectedDevices = data;
        //      getDeviceView();
        //    }
        //  });
        //}

        //vm.editDpiDevice = function(){
        //  var modalInstance = $modal.open({
        //    templateUrl: 'editDpiDevice.html',
        //    animation: true,
        //    controller: function($scope, $modalInstance, dpidata) {
        //      $scope.cancel = function (){
        //        $modalInstance.dismiss('cancel');
        //      };
        //      $scope.ok = function () {
        //        $scope.updataItems = [];
        //        //Update unselected items
        //        for(var j=0; j<$scope.lastSelectedItems.length; j++){
        //          $scope.updataItems.push($scope.items[$scope.lastSelectedItems[j]]);
        //        }
        //        for(var k=0; k<$scope.items.length; k++){
        //          if($scope.items[k].selected){
        //            $scope.updataItems.push($scope.items[k]);
        //          }
        //        }
        //        for(var l=0; l<$scope.updataItems.length; l++){
        //          console.log(dpidata.updateSelectedDevice($scope.updataItems[l].deviceId, $scope.updataItems[l].selected));
        //        }
        //        getSelectedDevice();
        //        $modalInstance.close();
        //        getSelectedDevice();
        //      };
        //
        //      dpidata.getDevice(topologyId.id).then(function(data){
        //      	$scope.items = data;
        //        $scope.itemSize = data.length;
        //        $scope.hasItem = data.length;
        //        console.log($scope.items);
        //        $scope.currentPage = 0;
        //        $scope.pageSize = 10;
        //        $scope.lastSelectedItems = [];
        //        for(var i=0; i<$scope.items.length; i++){
        //          if($scope.items[i].selected){
        //            $scope.lastSelectedItems.push(i);
        //          }
        //        }
        //        $scope.changeDeviceCheck();
        //      });
        //
        //      $scope.changeDeviceCheck = function(){
        //        var count = 0;
        //        for(var j=0; j<$scope.items.length; j++){
        //          if($scope.items[j].selected){
        //            count++;
        //          }
        //        }
        //        $scope.deviceCheckEnable = (count<3);
        //        $scope.confirmEnable = count;
        //        for(var i=0; i<$scope.items.length; i++){
        //          if($scope.items[i].selected){
        //            $scope.items[i].enable=true;
        //          }else{
        //            $scope.items[i].enable= $scope.deviceCheckEnable;
        //          }
        //        }
        //      };
        //
        //      $scope.numberOfPages=function(){
        //        if($scope.items){
        //          return Math.ceil($scope.items.length/$scope.pageSize);
        //        }
        //      };
        //    },
        //    size: 'lg'
        //  });
        //
        //  modalInstance.result.then(function () {}, function () {
        //    console.log('Modal dismissed at: ' + new Date());
        //  });
        //};
    }

    function pagination() {
        return function (input, start) {
            if (input) {
                start = +start; //parse to int
                return input.slice(start);
            }
        };
    }

    function updateChartSize(chart) {
        var height = 400;
        if (chart) {
            var newHeight = chart.hasData() ? height : height / 2;
            if (newHeight !== chart.chartHeight) {
                chart.setSize(chart.chartWidth, newHeight, false);
            }
        }
    }

})();
