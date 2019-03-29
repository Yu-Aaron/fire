/**
 * Event Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('Event', EventModel);

    function EventModel($http, URI, encodeURL, $q) {
        var url = URI + '/events';

        var service = {
            getAll: getAll,
            getCount: getCount,
            markAllRead: markAllRead,
            markAllDeleted: markAllDeleted,
            getAllExport: getAllExport,
            search: search
        };

        return service;

        //////////
        function getAll(params) {
            return $http.get(url, {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function getCount(params) {
            return $http.get(url + '/count', {
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function markAllRead() {
            return $http.put(url + '/markallread').then(function (data) {
                return data.data;
            });
        }

        function markAllDeleted() {
            return $http.put(url + '/markalldeleted').then(function (data) {
                return data.data;
            });
        }

        function getAllExport(params, psw) {
            var pdata = psw ? {password: psw} : null;
            return $http({
                method: 'POST',
                url: url + '/export',
                data: pdata,
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                    return str.join("&");
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: encodeURL(params)
            }).then(function (data) {
                return data.data;
            });
        }

        function search(keyword) {
            if (keyword) {
                return $http.get(URI + '/datadictionaries/source/' + keyword).then(function (data) {
                    return data.data;
                });
            } else {
                var dfd = $q.defer();
                dfd.resolve([]);
                return dfd.promise;
            }
        }

    }


})();
