/**
 * Privilege Directive
 *
 * Description
 * privilegeRequire include BAN,VIEW,MIXED types
 */
(function () {
    'use strict';
    angular
        .module('southWest.directives')
        .directive('settingPrivilege', settingPrivilege);

    function settingPrivilege($rootScope, Enum) {
        var displayObj = {
            scope: {
                privilegeName: '@',
                privilegeRequire: '@',
                privilegeHandle: '@'
            },
            restrict: 'A',
            link: link
        };

        return displayObj;

        function link(scope, el) {
            var name = scope.privilegeName;
            var require = scope.privilegeRequire;
            var setting = scope.privilegeHandle;
            var values = Enum.get('privilege').filter(function (a) {
                return a.name === name;
            });
            try {
                if (values !== undefined && values !== null && values.length > 0) {
                    var actionValue = values[0].actionValue;
                    switch (actionValue) {
                        case 1:
                            statusChanged(setting, el);
                            break;
                        case 2:
                            switch (require) {
                                case "BAN":
                                case "VIEW":
                                    if (setting !== undefined && setting !== null) {
                                        if (setting === "disabled") {
                                            el.prop('disabled', true);
                                            var inputs;
                                            (inputs = el.find('input, button')).length && inputs.prop('disabled', true);
                                            break;
                                        }
                                    }
                                    break;
                                case "MIXED":
                                    statusChanged(setting, el);
                                    break;
                                default:
                                    el.css('visibility', 'hidden');
                                    el.hide();
                                    break;
                            }
                            break;
                        case 30:
                            break;
                        default:
                            el.css('visibility', 'hidden');
                            el.hide();
                            break;
                    }
                }
                else {
                    el.css('visibility', 'hidden');
                    el.hide();
                }
            } catch (e) {
                el.css('visibility', 'hidden');
                el.hide();
            }
        }

        function statusChanged(setting, el) {
            switch (setting) {
                case "disabled":
                    el.prop('disabled', true);
                    var inputs;
                    (inputs = el.find('input, button')).length && inputs.prop('disabled', true);
                    break;
                case "hidden":
                    el.css('visibility', 'hidden');
                    el.hide();
                    break;
                default:
                    el.css('visibility', 'hidden');
                    el.hide();
                    break;
            }
        }

    }
})();
