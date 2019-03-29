/**
 * Attack Query Device Result Directive
 *
 * Description
 */
(function () {
    'use strict';

    angular
        .module('southWest.attack')
        .directive('attackTable', attackTable)
        .directive('attackMultiple', attackMultiple)
        .directive('attackTopology', attackTopology)
        .directive('attackUpload', attackUpload);

    function attackTable(Attack) {

        var attackTableObj = {
            scope: false,
            restrict: 'E',
            require: '^dtable',
            replace: true,
            templateUrl: '/templates/attack/table.html',
            link: link
        };

        return attackTableObj;

        //////////
        function link(scope, element, attr, ctrl) {

            ctrl.setConfig({
                name: 'events',
                pagination: false,
                scrollable: false,
                totalCount: false,
                getAll: getTableData,
                getCount: getTableDataCount,
                search: search
            });

            ctrl.disableSearch = true;

            function getTableData() {
                return Attack.getAttackTarget(scope.currentPath.pathId).then(function () {
                    //return data.data[0].attackTargetList;
                    return 0;
                });
            }

            function getTableDataCount() {
                return Attack.getAttackTarget(scope.currentPath.pathId).then(function () {
                    //return data.data[0].attackTargetList.length;
                    return 0;
                });
            }

            function search() {

            }
        }
    }

    function attackMultiple() {

        var attackMultipleObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/attack/multiple.html',
            link: link
        };

        return attackMultipleObj;

        //////////
        function link() {

            var $ = go.GraphObject.make;

            var diagram =
                $(go.Diagram, "multiplePath", {
                    initialContentAlignment: go.Spot.TopCenter, // Center Diagram contents
                    "undoManager.isEnabled": true // enable Ctrl-Z to undo and Ctrl-Y to redo
                });

            // var OASButton = makeStandardButton();

            function setupTree(diagram) {
                diagram.nodeTemplate =
                    $(go.Node, "Auto",
                        $(go.Panel, "Vertical",
                            $(go.TextBlock, {
                                    margin: 10,
                                    stroke: 'red'
                                },
                                new go.Binding("text", "key")),
                            $(go.Picture, {
                                    margin: 10,
                                    width: 90,
                                    height: 100,
                                    background: '#353535'
                                },
                                new go.Binding("source", "img")),
                            $(go.Panel,
                                $(go.Shape, {
                                    alignment: go.Spot.Bottom,
                                    click: addNodeAndLink,
                                    figure: "Ellipse",
                                    width: 50,
                                    height: 50,
                                    fill: 'lime',
                                    strokeWidth: 2,
                                    stroke: "yellow"
                                }),
                                $(go.Shape, {
                                    position: new go.Point(13, 13),
                                    figure: "ThickCross",
                                    fill: "white",
                                    width: 25,
                                    height: 25,
                                    stroke: null
                                })
                            )
                        )
                    );

                diagram.linkTemplate =
                    $(go.Link, {
                            routing: go.Link.Orthogonal,
                            corner: 5
                        },
                        $(go.Shape));

                var nodeDataArray = [{
                    key: "攻击者",
                    img: "images/hacker.png"
                }, {
                    key: "pc-2",
                    img: "images/pc-2.png",
                    parent: "攻击者"
                }

                ];
                diagram.model = new go.TreeModel(nodeDataArray);
            }

            setupTree(diagram);
            diagram.layout = $(go.TreeLayout, {
                angle: 90
            }); // automatic tree layout

            function addNodeAndLink(e, b) {
                // take a button panel in an Adornment, get its Adornment, and then get its adorned Node
                var node = b.part;
                // we are modifying the model, so conduct a transaction
                var diagram = node.diagram;
                diagram.startTransaction("add node and link");
                // have the Model add the node datasaile
                var newnode = {
                    key: "pc",
                    img: "images/workstation-icon.png",
                    parent: node.data.key
                };
                diagram.model.addNodeData(newnode);
                // finish the transaction
                diagram.commitTransaction("add node and link");
            }
        }
    }


    function attackTopology(Topology, $q, Attack, Device, topologyId) {

        var attackTopologyObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/attack/topology.html',
            link: link
        };

        return attackTopologyObj;

        //////////
        function link(scope) {
            function drawTopo(data) {
//        console.log(scope.currentPath);
                var linkDataArrayAttackPath = [];

//        console.log(data);
                var $ = go.GraphObject.make;

                var id = 1;

                var diagram =
                    $(go.Diagram, "topologyPath", {
                        initialContentAlignment: go.Spot.Center, // Center Diagram contents
                        initialScale: (localStorage.getItem('monitor:topology.scale.' + id) === null ? 1 : parseFloat(localStorage.getItem('monitor:topology.scale.' + id))),
                        "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                        "undoManager.isEnabled": true // enable Ctrl-Z to undo and Ctrl-Y to redo
                    });

                diagram.nodeTemplate = // provide custom Node appearance
                    $(go.Node, "Auto", {
                            margin: 50,
                            width: 80,
                            height: 95,
                            /* mouseEnter: mouseEnter, mouseLeave: mouseLeave,*/
                            click: function (e, node, l) {
                                showConnections(node, l);
                            }
                        },
                        new go.Binding("location", "loc", go.Point.parse),
                        $(go.Shape, {
                                stroke: "yellow",
                                strokeWidth: 0,
                                name: "SHAPE",
                                fill: "#2a2b31"
                            }
                        ),
                        $(go.Panel, "Vertical",
                            {
                                toolTip: $(go.Adornment, "Auto", {stretch: go.GraphObject.Fill},
                                    $(go.Shape, "Rectangle", {isPanelMain: true, maxSize: new go.Size(500, NaN)}),
                                    $(go.Panel, "Vertical", {margin: 10},
                                        $(go.TextBlock, {
                                                text: "",
                                                alignment: go.Spot.Left,
                                                stroke: "white",
                                                overflow: go.TextBlock.OverflowEllipsis,
                                                wrap: go.TextBlock.None,
                                                maxSize: new go.Size(450, NaN)
                                            },
                                            new go.Binding("text", "text")
                                        )))
                            },
                            $(go.Panel, "Vertical", {},
                                $(go.Panel, {
                                        width: 65,
                                        height: 55,
                                        background: "#1c1f1f",
                                        portId: "",
                                        fromSpot: go.Spot.None,
                                        toSpot: go.Spot.None
                                    },
                                    $(go.Shape, "RoundedRectangle", {
                                            stroke: "red",
                                            fill: "#1c1f1f",
                                            strokeWidth: 2,
                                            opacity: 1,
                                            width: 63,
                                            height: 53,
                                            visible: false
                                        },
                                        new go.Binding("visible", "targetOrder", function (i) {
                                            return i ? true : false;
                                        })),
                                    $(go.Picture, {
                                            margin: new go.Margin(12, 0, 0, 8),
                                            width: 50,
                                            height: 35,
                                            background: "#1c1f1f",
                                            imageStretch: go.GraphObject.Uniform
                                        },
                                        new go.Binding("source", "img"))),
                                $(go.TextBlock, {
                                        margin: new go.Margin(2, 2, 2, 2),
                                        stroke: "white",
                                        background: "#1c1f1f",
                                        isMultiline: false,
                                        width: 60,
                                        textAlign: "center",
                                        overflow: go.TextBlock.OverflowEllipsis,
                                        wrap: go.TextBlock.None,
                                        name: "TEXT"
                                    },
                                    new go.Binding("text", "text")))
                        ),
                        // decorations:
                        $(go.Shape, "Ellipse", {
                                alignment: go.Spot.TopLeft,
                                fill: "red",
                                width: 20,
                                height: 20,
                                margin: 0,
                                stroke: "red",
                                visible: false
                            },
                            new go.Binding("visible", "targetOrder", function (i) {
                                return i ? true : false;
                            })),
                        $(go.TextBlock, {
                                alignment: go.Spot.TopLeft,
                                stroke: "white",
                                width: 20,
                                height: 20,
                                font: "bold 10pt serif",
                                margin: new go.Margin(3, 0, 0, 6),
                                visible: true
                            },
                            new go.Binding("text", "targetOrder"))
                    );

                diagram.linkTemplate =
                    $(go.Link, {
                            curve: go.Link.JumpOver
                        },
                        new go.Binding("routing", "link"),
                        // link route should avoid nodes
                        $(go.Shape,
                            new go.Binding("strokeWidth", "strokeWidth"),
                            new go.Binding("stroke", "color")),
                        $(go.Shape, {
                                strokeWidth: 3
                            },
                            new go.Binding("stroke", "color"),
                            new go.Binding("toArrow", "toArrow"),
                            new go.Binding("fill", "color"))
                    );

                var nodeDataArray = [];

//        console.log(data);

                for (var i = 0; i < data.nodes.length; i++) {
//          var name = '';
                    var icon_name = Device.getIconName(data.nodes[i]._iconType);
                    var imagePath = 'images/';
                    if (['IPS', 'IDS', 'ROUTING_IPS', 'INLINE_IDS'].indexOf(data.nodes[i].type) >= 0) {
                        imagePath += 'devices/security/';
                    }
                    var nodeTemp = {
                        key: data.nodes[i].id,
                        text: data.nodes[i].name,
                        img: imagePath + icon_name + '-icon.png',
                        loc: data.nodes[i].x + " " + data.nodes[i].y
                    };
                    nodeDataArray.push(nodeTemp);
//          console.log(data);
                }

                var linkDataArrayTopology = [];

                for (var j = 0; j < data.links.length; j++) {
                    var linkTemp = {
                        from: data.links[j].nodeID,
                        to: data.links[j].destinationNodeID,
                        color: "gray",
                        toArrow: "",
                        strokeWidth: "1",
                        link: go.Link.AvoidsNodes
                    };
                    linkDataArrayTopology.push(linkTemp);
                }


                Attack.getAttackTarget(scope.currentPath.pathId).then(function (data) {
                    if (data.data.length > 1) {
                        for (var m = 1; m < data.data.length; m++) {
                            console.log(data.data);
                            var linkTempAttack = {
                                from: data.data[m - 1].selectedTarget,
                                to: data.data[m].selectedTarget,
                                color: "red",
                                toArrow: "Standard",
                                strokeWidth: "3",
                                link: go.Link.Normal,
                                targetOrder: data.data[m].targetOrder
                            };
                            linkDataArrayAttackPath.push(linkTempAttack);
                        }
                        for (var i = 0; i < data.data.length; i++) {
                            console.log(data.data[i]);
                            for (var j = 0; j < nodeDataArray.length; j++) {
                                if (data.data[i].selectedTarget === nodeDataArray[j].key.toString()) {
                                    nodeDataArray[j].targetOrder = data.data[i].targetOrder;
                                }
                            }
                        }
                    }

                    var linkDataArray = linkDataArrayTopology.concat(linkDataArrayAttackPath);

                    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
                });

                // highlight all Links and Nodes coming out of a given Node
                function showConnections(node) {
                    var diagram = node.diagram;
                    diagram.startTransaction("highlight");
                    // remove any previous highlighting
                    diagram.clearHighlighteds();
                    // for each Link coming out of the Node, set Link.isHighlighted
                    node.isHighlighted = true;
                    console.log(node);
                    // for each Node destination for the Node, set Node.isHighlighted
                    node.findNodesOutOf().each(function (n) {
                        n.isHighlighted = true;
                    });
                    diagram.commitTransaction("highlight");
                    console.log(123);
                }

                // when the user clicks on the background of the Diagram, remove all highlighting
                diagram.click = function () {
                    diagram.startTransaction("no highlighteds");
                    diagram.clearHighlighteds();
                    diagram.commitTransaction("no highlighteds");
                };
                scope.zoom = function (r) {
                    console.log(diagram);
                    diagram.scale *= r;
                };

                scope.show_image = function () {

                    var img = diagram.makeImage({
                        type: "image/jpeg",
                        scale: 1
                    });

                    document.body.appendChild(img);
                    console.log(img);
                };
            }

            Topology.getTopo(topologyId.id).then(function (data) {
                scope.topo.topo = data;
                var id = data.topologyId;
                var nodes = Topology.getNodes(id);
                var links = Topology.getLinks(id);
                var promises = [];
                promises.push(nodes);
                promises.push(links);
                $q.all(promises).then(function (data) {
                    //  Remove nodes that do not have any links
                    if (data[0].data) {
                        for (var i = 0; i < data[0].data.length;) {
                            var found = false;
                            if (data[1].data) {
                                var id = data[0].data[i].id;
                                for (var j = 0; j < data[1].data.length; j++) {
                                    if (data[1].data[j].nodeID === id || data[1].data[j].destinationNodeID === id) {
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            if (found) {
                                i++;
                            } else {
                                data[0].data.splice(i, 1);
                            }
                        }
                    }
                    scope.topo.topo.nodes = data[0].data;
                    scope.topo.topo.links = data[1].data;

                    drawTopo(scope.topo.topo);
//          console.log(scope.topo.topo);
                });
            });

        }
    }

    function attackUpload(Attack, $timeout, $rootScope) {

        var attackuploadObj = {
            scope: false,
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/attack/upload.html',
            link: link
        };

        return attackuploadObj;

        function link(scope, el) {
            var file, input = el.find('#selector');
            scope.uploader.action = '添加附件';
            scope.uploader.create = create;
            scope.uploader.cancel = cancel;
            scope.uploader.download = download;
            scope.uploader.downloadAPI = downloadAPI;
            scope.uploader.deleteAPI = deleteAPI;
            scope.uploader.array = [];
            scope.uploaderArray = [];
            input.on('change', upload);

            scope.$on('$destroy', function () {
                input.off('change', upload);
            });

            function upload(event) {
                for (var i = 0; i < event.target.files.length; i++) {
                    file = scope.uploader.array.push(event.target.files[i]);
                    console.log(scope.uploader.array);
                }

                console.log(file);
                if (!file) {
                    return;
                }
                create();
            }


            (function test() {
                $timeout(function () {
                }, 3000);
            })();

            function create() {
                // console.log(file);
                input.val('');
                scope.uploader.action = '上传';
                scope.uploader.hasFile = false;
                scope.uploader.msg = '上传文件';
                // scope.uploader.fileName = file.name;
                var item = {};
                angular.copy(scope.uploader, item);
                scope.uploaderArray.push(item);
                console.log(scope.uploader);
                console.log(scope);
                $timeout(function () {
                    scope.uploader.msg = '';
                }, 1000);
            }

            function download(index) {
                console.log(index);
                console.log("download");
            }

            function cancel(index) {
                console.log(index);
                console.log('shit shit');
                scope.uploader.array.splice(index, 1);
                console.log(scope.uploader.array);
            }

            function downloadAPI(file) {
                console.log("download API");
                console.log(file);
                Attack.downloadTargetFile(file.fileId).then(function (data) {
                    console.log(data.data.filePath);
                    window.open('./' + data.data.filePath, '_self');
                });
            }

            function deleteAPI(file, index) {
                console.log("deleteAPI API");
                console.log(index);
                console.log(file);

                console.log($rootScope);
                Attack.deleteTargetFile(file.fileId).then(function (data) {
                    console.log(data);
                    if (data.data) {
                        $rootScope.$broadcast('delete-file', index);
                    }
                });
            }
        }
    }
})();
