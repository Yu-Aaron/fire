/**
 * Created by Morgan on 14-11-07.
 */
/**
 * System Model
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.models')
        .factory('SystemUser', SystemUserModel);

    function SystemUserModel($http, URI) {
        var url = URI + '/users';
        var service = {
            getUsers: getUsers,
            getUsersByRoleId: getUsersByRoleId,
            getRoles: getRoles,
            getRolesById: getRolesById,
            //getCustomizedMenuByRoleId: getCustomizedMenuByRoleId,
            deleteUser: deleteUser,
            changeStatus: changeStatus,
            createUser: createUser,
            editUserPassword: editUserPassword,
            editUser: editUser,
            lockUser: lockUser,
            getUsersCount: getUsersCount,
            updateMyPassword: updateMyPassword,
            userToken: userToken,
            keepAlive: keepAlive,
            getUserGroup: getUserGroup,
            updateUserGroup: updateUserGroup,
            getCurrentUser: getCurrentUser,
            createGroup: createGroup,
            deleteGroup: deleteGroup,
            getDefaultUser: getDefaultUser,
            subtractionSessionNum: subtractionSessionNum,
            addSessionNum: addSessionNum
        };
        return service;

        //////////
        function getUsers() {

            return $http.get(url + '/').then(function (data) {
                return data.data;
            });
        }

        function getUsersByRoleId(id) {
            return $http.get(url + '/role/' + id).then(function (data) {
                return data.data;
            });
        }

        function getRoles() {
            return $http.get(URI + '/roles/').then(function (data) {
                return data.data;
            });
        }

        //======================TODO=========================
        function getRolesById(id) {
            return $http.get(URI + '/roles/role/'+id).then(function (data) {
                return data.data;
            });
        }

        //function getCustomizedMenuByRoleId() {
        //    return $http.get(URI + '/roles/' + topologyId.id).then(function (data) {
        //        return data.data;
        //    });
        //}

        //===================End of TODO======================

        function deleteUser(userId) {
            return $http.put('/api/v2.0/users/user/' + userId + '/markasdeleted');
        }

        function changeStatus(index, status) {
            return $http.post('/api/v2.0/systemusers/changeStatus', {
                data: {
                    'index': index,
                    'status': status
                }
            });
        }

        function createUser(user) {
            return $http.post(url, user).then(function (data) {
                return data.data;
            });
        }

        function editUserPassword(user) {
            return $http.put('/api/v2.0/user/info', {
                'userId': user.userId,
                'name': user.name,
                'passwordHash': user.password
            });
        }

        function editUser(user) {
            return $http.put('/api/v2.0/users/user/info', user);
        }

        function userToken() {
            return $http.put(url + '/usertoken');
        }

        function keepAlive() {
            return $http.put('/api/v2.0/users/usertoken');
        }

        function lockUser(lock, userId) {
            return $http.put(url + '/user/' + lock + '/' + userId);
        }

        function updateMyPassword(oldPassword, password) {
            return $http.put(url + '/password', {
                'oldPasswordHash': oldPassword,
                'passwordHash': password
            }, {
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
                }
            });
        }

        function getUsersCount() {
            return $http.get(url).then(function (data) {
                return data.data.length;
            });
        }

        function getUserGroup(roleId) {
            return $http.get('/api/v2.0/roles/role/' + roleId).then(function (data) {
                return data.data;
            });
        }

        function updateUserGroup(userGroup) {
            return $http.put('/api/v2.0/roles', {
                role: {
                    "name": userGroup.role.name,
                    "comment": userGroup.role.comment,
                    "roleId": userGroup.role.roleId,
                    "roleLevel": userGroup.role.roleLevel
                },
                targetAndActionValueFormList: userGroup.targetAndActionValueFormList,
                deviceIds: userGroup.deviceIds,
                customizedMenus: userGroup.customizedMenus
            });
        }

        function getCurrentUser() {
            return $http.get('/api/v2.0/users/whoami').then(function (data) {
                return data.data;
            });
        }

        function createGroup(userGroup) {
            return $http.post('/api/v2.0/roles', {
                role: {
                    "name": userGroup.role.name,
                    "comment": userGroup.role.comment,
                    "roleLevel": userGroup.role.roleLevel,
                    "parentRoleId": userGroup.parentRoleId
                },
                targetAndActionValueFormList: userGroup.targetAndActionValueFormList,
                customizedMenus: userGroup.customizedMenus
            });
        }

        function deleteGroup(roleId) {
            return $http.delete(URI + '/roles/role/' + roleId);
        }

        function getDefaultUser() {
            return $http.get(url+"/defaultusers").then(function (data) {
                return data.data;
            });
        }

        function subtractionSessionNum() {
            return $http.get(url + '/subtractionSessionNum').then(function (data) {
                return data.data;
            });
        }

        function addSessionNum() {
            return $http.post(url + "/addSessionNum");
        }
    }

})();
