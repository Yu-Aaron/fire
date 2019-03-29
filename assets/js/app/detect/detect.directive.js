/**
 * Detect Directive
 *
 * Description
 */
(function () {
    'use strict';

    // angular
    //     .module('southWest.detect')
    //     .directive('uploadRecord', uploadRecord);

    // function uploadRecord($timeout, $q, $rootScope) {
    //     return {
    //         scope: false,
    //         restrict: 'E',
    //         replace: true,
    //         templateUrl: '/templates/detect/header/uploadRecord.html',
    //         link: link
    //     };

    //     //////////

    //     function link(scope, el) {
    //         // var input = el.find('#recordSelector');
    //         // scope.uploader = {};
    //         // input.on('change', upload);

    //         // scope.$on('$destroy', function () {
    //         //     input.off('change', upload);
    //         // });

    //         // scope.uploader.recordSelector = recordSelector;

    //         //////////
    //         function upload(event) {
    //             var tmp = event.target.files[0];
    //             if (!tmp) {
    //                 return;
    //             }
    //             var file = tmp;

    //             uploadRecord(file);
    //             this.value = null;
    //         }

    //         function uploadRecord(file) {
    //             var topo = {};
    //             Detect.upload(file).then(function (data) {
    //                 input.val('');
    //                 scope.uploader.action = '上传拓扑';
    //                 scope.uploader.hasFile = false;
    //                 scope.uploader.msg = {
    //                     'type': 'success',
    //                     'content': '上传成功'
    //                 };
    //                 $rootScope.addAlert({
    //                     type: 'success',
    //                     content: '拓扑文件上传成功'
    //                 });
    //             }, function (data) {
    //                 console.log(data.data);
    //                 scope.uploader.msg = {
    //                     'type': 'error',
    //                     'content': '上传失败'
    //                 };
    //                 if (!data.data || !data.data.error) {
    //                     data = {
    //                         'data': {}
    //                     };
    //                     data.data.error = '上传失败';
    //                 }
    //                 $rootScope.addAlert({
    //                     type: 'danger',
    //                     content: data.data.error
    //                 });
    //             });
    //         }
    //     }
    // }
})();