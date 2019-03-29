/*********************************************************
 *    UI Tree Service
 *    --------------------------
 *    updates: 2015-11-12 (James)
 *    Create UI Tree for other service to use.
 *
 *********************************************************/
(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('uiTree', uiTree);

    function uiTree($rootScope) {
        var uiNode = function (mLevel, mTarget, mState, mName, mIcon, mDescription, mChildren, mParent, mExpanded) {
            var level = mLevel ? mLevel : 1;
            var target = mTarget ? mTarget : "";
            var state = mState ? mState : "";
            var name = mName ? mName : "";
            var icon = mIcon ? mIcon : "";
            var description = mDescription ? mDescription : "";
            //var options = o ? o : null;
            //var enable = e;
            //var root_enable = re;
            //var privilege = pr ? pr : "";
            //var privilegeValue = 1;
            var child = mChildren ? mChildren : [];
            var parent = mParent ? mParent : null;

            var expanded = mExpanded ? mExpanded : false;

            this.setLevel = function (l) {
                level = l;
            };
            this.getLevel = function () {
                return level;
            };

            this.setTarget = function (t) {
                target = t;
            };
            this.getTarget = function () {
                return target;
            };

            this.setState = function (s) {
                state = s;
            };
            this.getState = function () {
                return state;
            };

            this.setName = function (n) {
                name = n;
            };
            this.getName = function () {
                return name;
            };

            this.setIcon = function (i) {
                icon = i;
            };
            this.getIcon = function () {
                return icon;
            };

            this.setDescription = function (d) {
                description = d;
            };
            this.getDescription = function () {
                return description;
            };

            //this.setOptions = function (o) {
            //    options = o;
            //};
            //this.getOptions = function () {
            //    return options;
            //};
            //
            //this.setRootEnable = function (re) {
            //    root_enable = re;
            //};
            //this.getRootEnable = function () {
            //    return root_enable;
            //};
            //this.setPrivilege = function (pr) {
            //    privilege = pr;
            //};
            //this.getPrivilege = function () {
            //    return privilege;
            //};
            //this.setPrivilegeValue = function (prv) {
            //    privilegeValue = prv;
            //};
            //this.getPrivilegeValue = function () {
            //    return privilegeValue;
            //};
            //this.getWholePrivilege = function () {
            //    var value = (target === "SCHEDULED_REPORT") ? 1 : privilegeValue;
            //    if (child && child.length) {
            //        child.map(function (node) {
            //            value = Math.max(value, node.getWholePrivilege());
            //        });
            //    }
            //    return value;
            //};
            //this.setWholePrivilege = function () {
            //    var level = Enum.get('privilege').filter(function (a) {
            //        return a.name === privilege;
            //    });
            //    privilegeValue = (level && level[0]) ? level[0].actionValue : 2;
            //    //==================Test Code==================
            //    this.privilegeValue = privilegeValue;
            //    //===============End of Test Code==============
            //    if (child && child.length) {
            //        child.map(function (node) {
            //            node.setWholePrivilege();
            //        });
            //    }
            //};

            this.setParent = function (p) {
                parent = p;
            };
            this.getParent = function () {
                return parent;
            };
            this.addChild = function (c) {
                child.push(c);
            };
            this.getChilds = function () {
                return child;
            };
            this.getChild = function (t) {
                var temp = child.filter(function (c) {
                    return c.getTarget() === t;
                });
                return temp && temp[0] ? temp[0] : null;
            };
            this.getSiblings = function () {
                return this.getParent().getChilds().filter(function (item) {
                    return item.getTarget() !== target;
                });
            };
            this.getChildByState = function (s) {
                var temp = child.filter(function (c) {
                    return c.getState() === s;
                });
                return temp && temp[0] ? temp[0] : null;
            };
            //==================Test Code==================
            this.level = level;
            this.target = target;
            this.state = state;
            this.name = name;
            this.icon = icon;
            this.description = description;
            //this.enable = e;
            //this.root_enable = re;
            //this.privilege = pr;
            //this.privilegeValue = privilegeValue;
            this.child = child;
            this.parent = parent;

            this.expanded = expanded;

            //===============End of Test Code==============
        };

        var root = new uiNode(0, "", "", "Root", "", "Root", null, null);
        root.content = [];
        var service = {
            init: init,
            //initPrivilegeValue: initPrivilegeValue,
            getCurrentNode: getCurrentNode,
            getParentNode: getParentNode,
            getSiblingNodes: getSiblingNodes,
            getNode: getNode
            //addContent: addContent,
            //getContentShow: getContentShow,
            //getPrivilegeByUIrouteState: getPrivilegeByUIrouteState
        };
        return service;

        //=============================Init ui Tree and the related functions:=============================
        function init(usertype) {
            // Need to be called after $http.get(URI + '/domains/customizedMenus')
            removeNode(root);
            //root = new uiNode("", 0, "Root", "", null, true, true, "", "root", null, null);
            root = new uiNode(0, "", "", "Root", "", "Root", null, null);
            //root.content = [];

            //if (usertype === 1) {
            //    for (var i = 0; i < $rootScope.config.root.length; i++) {
            //        root.addChild(new uiNode(1, $rootScope.config.root[i].target, $rootScope.config.root[i].state, $rootScope.config.root[i].name,
            //            $rootScope.config.root[i].icon, $rootScope.config.root[i].name, [], root));
            //    }
            //    addChildLvMenuforroot("SETTING", $rootScope.config.root[0].children, root.getChild("SETTING"));
            //}
            //else {
            for (var n = 0; n < $rootScope.config.dashboard.length; n++) {
                if (checkNodeEnabled($rootScope.config.dashboard[n].target)) {
                    root.addChild(new uiNode(1, $rootScope.config.dashboard[n].target, $rootScope.config.dashboard[n].state, $rootScope.config.dashboard[n].name,
                        $rootScope.config.dashboard[n].icon, $rootScope.config.dashboard[n].name, [], root));
                }
            }
            addChildLvMenu("MONITOR", $rootScope.config.dashboard[0].children, root.getChild("MONITOR"), usertype);

            addChildLvMenu("SESSION", $rootScope.config.dashboard[1].children, root.getChild("SESSION"), usertype);

            addChildLvMenu("RULE", $rootScope.config.dashboard[2].children, root.getChild("RULE"), usertype);

            addChildLvMenu("NETWORK", $rootScope.config.dashboard[3].children, root.getChild("NETWORK"), usertype);

            addChildLvMenu("OBJECT", $rootScope.config.dashboard[4].children, root.getChild("OBJECT"), usertype);

            addChildLvMenu("STRATEGY", $rootScope.config.dashboard[5].children, root.getChild("STRATEGY"), usertype);

            addChildLvMenu("SETTING", $rootScope.config.dashboard[6].children, root.getChild("SETTING"), usertype);

            //addChildLvMenu("HELP", $rootScope.config.dashboard[6].children, root.getChild("HELP"), usertype);

            //if ($rootScope.isJAXX) {
            //    addSecondLvMenu("SECURITY_AUDIT", $rootScope.config.securityaudit, root.getChild("SECURITY_AUDIT"));
            //    addSecondLvMenu("AUDIT_SETTING", $rootScope.config.audit_setting, root.getChild("AUDIT_SETTING"));
            //}
            //addSecondLvMenu("ASSET_MANAGEMENT", $rootScope.config.asset, root.getChild("ASSET_MANAGEMENT"));
            //addSecondLvMenu("RULE", $rootScope.config.rule, root.getChild("RULE"));
            //addSecondLvMenu("AUDIT", $rootScope.config.audit, root.getChild("AUDIT"));
            //addSecondLvMenu("SCHEDULED_REPORT", $rootScope.config.report, root.getChild("SCHEDULED_REPORT"));
            //addSecondLvMenu("SYSTEM_MANAGEMENT", $rootScope.config.setting, root.getChild("SYSTEM_MANAGEMENT"));
            //addSecondLvMenu("INTRUSION_DETECTION", $rootScope.config.detect, root.getChild("INTRUSION_DETECTION"));
            //addSecondLvMenu("AI_LEARNING", $rootScope.config.ai, root.getChild("AI_LEARNING"));
            //addSecondLvMenu("UNKNOWN_DEVICE_PROTECTION", $rootScope.config.unknown, root.getChild("UNKNOWN_DEVICE_PROTECTION"));
            //addSecondLvMenu("NTP_SYNC", $rootScope.config.ntpsync, root.getChild("NTP_SYNC"));
            //addSecondLvMenu("IC_VULNERABILITY", $rootScope.config.vul, root.getChild("IC_VULNERABILITY"));
            //
            //addThirdLvMenu("INCIDENT", $rootScope.config.content);
            //addThirdLvMenu("OPERATION_LOG", $rootScope.config.content);
            //addThirdLvMenu("ASSET_MANAGEMENT", $rootScope.config.content);
            //addThirdLvMenu("PROTECTION_SECURITY_DEVICE", $rootScope.config.content);
            //addThirdLvMenu("PROTECTION_FACTORY_DEVICE", $rootScope.config.content);
            //addThirdLvMenu("BLACK_LIST", $rootScope.config.content);
            //
            //var whiteListNode = getNode('WHITE_LIST');
            //if (whiteListNode) {
            //    for (var j = 0; j < $rootScope.config.rule[1].children.length; j++) {
            //        var tmp = $rootScope.config.rule[1].children[j];
            //        if ($rootScope.isX03 && (tmp.state === "learning" || tmp.state === "whitelist" || tmp.state === "sync")) {
            //            continue;
            //        }
            //        whiteListNode.addChild(new uiNode(tmp.target, 3, tmp.name, tmp.icon, tmp.options, tmp.enable, tmp.root_enable, tmp.currentState, tmp.state, whiteListNode, [], tmp));
            //    }
            //}
            //if ($rootScope.isJAXX) {
            //    if (root.getChild('SECURITY_AUDIT') !== null) {
            //        var audit = root.getChild('SECURITY_AUDIT').getChild("AUDIT");
            //        if (audit) {
            //            for (var m = 0; m < $rootScope.config.securityaudit[1].children.length; m++) {
            //                var tmpa = $rootScope.config.securityaudit[1].children[m];
            //                if ($rootScope.isJAXX) {
            //                    audit.addChild(new uiNode(tmpa.target, 3, tmpa.name, tmpa.icon, tmpa.options, tmpa.enable, tmpa.root_enable, tmpa.currentState, tmpa.state, audit, [], tmpa));
            //                }
            //            }
            //        }
            //    }
            //
            //    if (root.getChild("SECURITY_AUDIT") !== null) {
            //        var content_audit = root.getChild("SECURITY_AUDIT").getChild("CONTENT_AUDIT");
            //        if (content_audit) {
            //            for (var n = 0; n < $rootScope.config.securityaudit[3].children.length; n++) {
            //                var tmpc = $rootScope.config.securityaudit[3].children[n];
            //                if ($rootScope.isJAXX) {
            //                    content_audit.addChild(new uiNode(tmpc.target, 3, tmpc.name, tmpc.icon, tmpc.options, tmpc.enable, tmpc.root_enable, tmpc.currentState, tmpc.state, content_audit, [], tmpc));
            //                }
            //            }
            //
            //        }
            //    }
            //}
            //var whiteListAiNode = getNode('RULE_LEARNING');
            //if (whiteListAiNode) {
            //    for (var k = 0; k < $rootScope.config.ai[0].children.length; k++) {
            //        var tmpk = $rootScope.config.ai[0].children[k];
            //        whiteListAiNode.addChild(new uiNode(tmpk.target, 3, tmpk.name, tmpk.icon, tmpk.options, tmpk.enable, tmpk.root_enable, tmpk.currentState, tmpk.state, whiteListAiNode, []));
            //    }
            //}
            //// addThirdLvMenu("IP_MAC", $rootScope.config.content);
            //var ipmacNode = getNode('IP_MAC');
            //if (ipmacNode) {
            //    for (var x = 0; x < $rootScope.config.rule[2].children.length; x++) {
            //        var temp = $rootScope.config.rule[2].children[x];
            //        ipmacNode.addChild(new uiNode(temp.target, 3, temp.name, temp.icon, temp.options, temp.enable, temp.root_enable, temp.currentState, temp.state, ipmacNode, [], temp));
            //    }
            //}
            //addThirdLvMenu("REPORT_INCIDENT", $rootScope.config.content);
            //addThirdLvMenu("SYSTEM_CONSOLE", $rootScope.config.content);
            //addThirdLvMenu("SYSTEM_DEVICE_MANAGEMENT", $rootScope.config.content);
            //
            //// Add All Content
            //$rootScope.customizedMenus.map(function (menu) {
            //    menu.menuLevel = (menu.customizedMenuId.match(/-/g) || []).length + 1;
            //    if (menu.menuLevel === 3) {
            //        addContent(menu.target, menu.active);
            //    }
            //});
            //
            //root.getContentPrivilege = function (t) {
            //    var p = root.content.filter(function (c) {
            //        return c.target === t;
            //    });
            //    return p && p[0] ? p[0].privilege : null;
            //};
            //}

            $rootScope.rootMenu = root;
        }

        //function initPrivilegeValue() {
        //    root.setWholePrivilege();
        //}

        // Check if node is within customizedMenus
        function checkNodeEnabled(target) {
            var tempMenu = $rootScope.customizedMenus.filter(function (m) {
                return m.target === target;
            });
            return tempMenu && tempMenu[0] && tempMenu[0].active;
        }

        function addChildLvMenu(target, range, parentNode, usertype) {
            if (range !== undefined && range !== null && range.length > 0) {
                var firstLvMenu = root.getChilds().filter(function (c) {
                    return c.getTarget() === target;
                });
                firstLvMenu = firstLvMenu && firstLvMenu[0] ? firstLvMenu[0] : null;
                if (firstLvMenu) {
                    for (var i = 0; i < range.length; i++) {
                        if (checkNodeEnabled(range[i].target)) {
                            var secondNode;
                            if (usertype === 1 && target === "SETTING" && range[i].target === "SETTING_USERCONTROL") {
                                secondNode = new uiNode(2, range[i + 1].target, range[i + 1].state, range[i + 1].name, range[i + 1].icon, range[i + 1].name, [], parentNode);
                                addThirdLvMenu(range[i + 1].children, secondNode);
                            }
                            else {
                                secondNode = new uiNode(2, range[i].target, range[i].state, range[i].name, range[i].icon, range[i].name, [], parentNode);
                                addThirdLvMenu(range[i].children, secondNode);
                            }
                            firstLvMenu.addChild(secondNode);
                        }
                    }
                }
            }
        }

        //function addChildLvMenuforroot(target, range, parentNode) {
        //    if (range !== undefined && range !== null && range.length > 0) {
        //        var firstLvMenu = root.getChilds().filter(function (c) {
        //            return c.getTarget() === target;
        //        });
        //        firstLvMenu = firstLvMenu && firstLvMenu[0] ? firstLvMenu[0] : null;
        //        if (firstLvMenu) {
        //            for (var i = 0; i < range.length; i++) {
        //
        //                var secondNode = new uiNode(2, range[i].target, range[i].state, range[i].name, range[i].icon, range[i].name, [], parentNode);
        //                addThirdLvMenu(range[i].children, secondNode);
        //                firstLvMenu.addChild(secondNode);
        //
        //            }
        //        }
        //    }
        //}

        function addThirdLvMenu(range, parentNode) {
            if (parentNode && range !== undefined && range.length > 0) {
                for (var i = 0; i < range.length; i++) {
                    if (checkNodeEnabled(range[i].target)) {
                        parentNode.addChild(new uiNode(3, range[i].target, range[i].state, range[i].name, range[i].icon, range[i].name, [], parentNode));
                    }
                }
            }
        }

        //function addThirdLvMenu(target, range) {
        //    var secondLvMenu = getNode(target);
        //    if (secondLvMenu) {
        //        for (var i = 0; i < range.length; i++) {
        //            if (range[i].parent && range[i].parent === target) {
        //                secondLvMenu.addChild(new uiNode(range[i].target, 3, range[i].name, range[i].icon, range[i].options, range[i].enable, range[i].root_enable, range[i].currentState, range[i].state, secondLvMenu, []));
        //            }
        //        }
        //    }
        //}

        //function addContent(target, enable) {
        //    var privilege = $rootScope.config.content.filter(function (c) {
        //        return c.target === target;
        //    });
        //    if (privilege && privilege[0] && privilege[0].currentState) {
        //        root.content.push({target: target, enable: enable, privilege: privilege[0].currentState});
        //    }
        //}
        //
        //function getContentShow(target) {
        //    var show = root.content.filter(function (c) {
        //        return c.target === target;
        //    });
        //    return show && show[0] && show[0].enable;
        //}

        function removeNode(node) {
            if (node.getChilds() !== [] && node.getChilds()) {
                for (var i = 0; i < node.getChilds().length; i++) {
                    removeNode(node.getChilds()[i]);
                }
            }
            if (node.getParent()) {
                node.setParent(undefined);
            }
            node = undefined;
        }


        //=============================Find current node based on Target:=============================
        function getCurrentNode(t) {
            var node = root.getChild(t);
            if (node) {
                return node;
            } else {
                for (var i = 0; i < root.getChilds().length; i++) {
                    node = root.getChilds()[i].getChild(t);
                    if (node) {
                        return node;
                    }
                }
            }
        }

        //=============================Find parent node based on Target:=============================
        function getParentNode(t) {
            var cur = getCurrentNode(t);
            if (cur) {
                return cur.getParent() ? cur.getParent() : null;
            } else {
                console.log("Error target");
            }
        }

        //=============================Find getSibling node based on Target:=============================
        function getSiblingNodes(t) {
            var parent = getParentNode(t);
            if (parent) {
                return parent.getChilds().filter(function (n) {
                    return n.getTarget() !== t;
                });
            }
        }

        //=============================Find node based on Target: (only work for 1st and 2nd level menu)=============================
        function getNode(t) {
            var node = root.getChilds().filter(function (n) {
                return n.getTarget() === t;
            });
            if (node.length) {
                return node[0];
            }
            for (var i = 0; i < root.getChilds().length; i++) {
                node = root.getChilds()[i].getChilds();
                for (var j = 0; j < node.length; j++) {
                    if (node[j].getTarget() === t) {
                        return node[j];
                    }
                }
            }
            //console.log("Target menu node not found! - " + t);
        }

        //=============================getPrivilegeByUIrouteState=============================
        //function getPrivilegeByUIrouteState(state) {
        //    if (state) {
        //        var name = state.split('.');
        //        //Special for right-top corner menu:
        //        if (name[0] === "systemuser" || name[0] === "myaccount") {
        //            var p = root.content.filter(function (c) {
        //                return c.target === "USER_MANAGEMENT";
        //            });
        //            return p && p[0] ? p[0].privilege : 1;
        //        }
        //        // Special for: topology.singlTopo should just use "topology" to find node
        //        if (name[0] === "topology") {
        //            return root.getChild('TOPOLOGY').getPrivilege();
        //        }
        //        var node = angular.copy(root);
        //        for (var i = 0; i < name.length; i++) {
        //            node = node ? node.getChildByState(name[i]) : null;
        //        }
        //        return node.getPrivilege();
        //    }
        //}
    }
})
();
