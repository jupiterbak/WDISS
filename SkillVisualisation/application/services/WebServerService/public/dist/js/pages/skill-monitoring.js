let myDiagram;
let gIP = "localhost";
let gPORT = 4840;
let gSERVERNAME = "SP164DEMO";
let gSOCKETId = "8548585858";
var globalStateConfiguration;
$(function() {

    'use strict';

    // Make the dashboard widgets sortable Using jquery UI
    $('.connectedSortable').sortable({
        placeholder: 'sort-highlight',
        connectWith: '.connectedSortable',
        handle: '.box-header, .nav-tabs',
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $('.connectedSortable .box-header, .connectedSortable .nav-tabs-custom').css('cursor', 'move');

    /* BOOTSTRAP SLIDER */
    $('.slider').slider();

    // jQuery UI sortable for the todo list
    $('.todo-list').sortable({
        placeholder: 'sort-highlight',
        handle: '.handle',
        forcePlaceholderSize: true,
        zIndex: 999999
    });

    initGoJsGraph("StateChart");


    // Add the listener
    $('.EFlexAction').click(function(params) {
        let data = {
            ip: gIP,
            port: gPORT,
            serverName: gSERVERNAME,
            socketID: gSOCKETId,
            actionName: $(this).data("action"),
            parameters: [{
                dataType: 11, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: Math.floor(Math.random() * 1000)
            }, {
                dataType: 11, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: Math.floor(Math.random() * 1000)
            }]
        };
        let hasArgument = $(this).data("argumentcount");
        if (hasArgument) {
            // Change the title
            if ($(this).data("action") === "ChangeLoad") {
                $('#paramHeaderCL').text($(this).data("action"));
                $('#paramModalChangeLoad').modal();
            } else {
                $('#paramHeader').text($(this).data("action"));
                $('#paramModal').modal();
            }

        } else {
            $.getJSON("/executeAction", { action: JSON.stringify(data) },
                function(result) {
                    // TODO
                    if (result.err) {

                    }
                });
        }
    });

    $('#executeMethod').click(function(params) {
        let paramValueAC = eval($('#paramACLoad').val());
        let paramValueDC = eval($('#paramDCLoad').val());

        let data = {
            ip: gIP,
            port: gPORT,
            serverName: gSERVERNAME,
            socketID: gSOCKETId,
            actionName: $('#paramHeader').text(),
            parameters: [{
                dataType: 10, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: paramValueAC / 100.0 //Math.floor(Math.random())
            }, {
                dataType: 10, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: paramValueDC / 100.0 //Math.floor(Math.random() * 1000)
            }]
        };

        $.getJSON("/executeAction", { action: JSON.stringify(data) },
            function(result) {
                // TODO
                if (result.err) {

                }
                $('#paramModal').modal('hide');
            });
    });

    $('#executeChangeLoadMethod').click(function(params) {
        let paramValueACCL = eval($('#paramACLoadCL').val());
        let paramValueDCCL = eval($('#paramDCLoadCL').val());
        let paramValueEnergySourceID = eval($('#EnergySourceID').val());
        let paramValueEnergySourceLoad = eval($('#EnergySourceLoad').val());

        let data = {
            ip: gIP,
            port: gPORT,
            serverName: gSERVERNAME,
            socketID: gSOCKETId,
            actionName: $('#paramHeaderCL').text(),
            parameters: [{
                dataType: 10, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: paramValueACCL / 100.0 //Math.floor(Math.random())
            }, {
                dataType: 10, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: paramValueDCCL / 100.0 //Math.floor(Math.random() * 1000)
            }, {
                dataType: 1, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: paramValueEnergySourceID !== 1
            }, {
                dataType: 10, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: paramValueEnergySourceLoad / 100.0
            }]
        };

        $.getJSON("/executeAction", { action: JSON.stringify(data) },
            function(result) {
                // TODO
                if (result.err) {

                }
                $('#paramModalChangeLoad').modal('hide');
            });
    });

    /** SOCKET IO Handler **/
    const socket = io("http://localhost:8080/");
    socket.on('connected', (data) => {
        gSOCKETId = "8548585858"; //data;
        /** Start a new connection */
        $.getJSON("/connect", { parameter: JSON.stringify({ socketID: "" + gSOCKETId, ip: gIP, port: gPORT, serverName: gSERVERNAME }) },
            function(result) {
                // TODO
                if (result.err) {

                }
            });
    });

    // Listen to all events
    socket.on("serverstatus", function(data) {
        if (data.connection) {
            $('#ressourceStatus').removeClass("text-red").addClass("text-green");
            $('#ressourceStatus').text("Connected");
        } else {
            $('#ressourceStatus').removeClass("text-green").addClass("text-red");
            $('#ressourceStatus').text("Not connected");
        }
        if (data.ip) {
            $('#ressourceIP').text(data.ip);
        }
        if (data.port) {
            $('#ressourcePort').text(data.port);
        }
    });

    socket.on("StatesChanged", function(data) {
        // Highlight the current state
        var keyObj = globalStateConfiguration.nodeDataArray[data.state.value];
        if (keyObj) {
            highlightNode(keyObj.id);
            $('span#CurrentState').text(keyObj.id);
        } else {
            highlightNode('Stopped');
            $('span#CurrentState').text('Stopped');
        }

        // // Change the transitions
        // data.transitions.forEach(function(elem) {
        //     if (elem && elem.hasCause) {
        //         let enabled = elem.EnableFlag.value;
        //         let txt_class = "text-red";
        //         let hidden_class = "hidden";
        //         if (enabled && enabled === true) {
        //             txt_class = "text-green";
        //             hidden_class = "";
        //         }

        //         $('#' + elem.hasCause.name).removeClass("hidden").addClass(hidden_class);
        //         $('#' + elem.hasCause.name + " i").removeClass("text-red").removeClass("text-green").addClass(txt_class);
        //         //$('#' + elem.hasCause.name + " span.info-box-number").text(elem.LoadGradient.value.toFixed(2) + ' W ');
        //     }
        // });
    });

    // socket.on("TRANSITIONDescriptionChanged", function(elem) {
    //     if (elem && elem.hasCause) {
    //         let enabled = elem.EnableFlag.value;
    //         let txt_class = "text-red";
    //         let hidden_class = "hidden";
    //         if (enabled && enabled === true) {
    //             txt_class = "text-green";
    //             hidden_class = "";
    //         }

    //         $('#' + elem.hasCause.name).removeClass("hidden").addClass(hidden_class);
    //         $('#' + elem.hasCause.name + " i").removeClass("text-red").removeClass("text-green").addClass(txt_class);
    //         //$('#' + elem.hasCause.name + " span.info-box-number").text(elem.LoadGradient.value.toFixed(2) + ' W ');
    //     }
    // });


    $('#SetParameters').click(function(params) {
        let value = $('#load_parameter_1').val() / 100.0;
        value = eval(value) || 0;

        let data = {
            ip: gIP,
            port: gPORT,
            serverName: gSERVERNAME,
            socketID: gSOCKETId,
            name: "TargetLoad",
            value: value
        };

        $.getJSON("/writeVariable", { action: JSON.stringify(data) },
            function(result) {
                // TODO
                if (result.err) {}
            }
        );
    });

    $('#ResetParameters').click(function(params) {
        $('#load_parameter_1').val(0);
    });

    //Make the dashboard widgets sortable Using jquery UI
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

});

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function highlightNode(key) {
    myDiagram.nodes.each(function(node) {
        if (node.key === key) {
            let diagram = node.diagram;
            diagram.startTransaction("highlight");
            // remove any previous highlighting
            diagram.clearHighlighteds();
            // for each Link coming out of the Node, set Link.isHighlighted
            node.findLinksOutOf().each(function(l) { l.isHighlighted = true; });
            // for each Node destination for the Node, set Node.isHighlighted
            node.findNodesOutOf().each(function(n) { n.isHighlighted = true; });
            //node.isHighlighted = true;
            diagram.commitTransaction("highlight");
        }
    });
    myDiagram.select(myDiagram.findNodeForKey(key));
}

function initGoJsGraph(id) {
    // GoJS Graph
    let _ = go.GraphObject.make; // for conciseness in defining templates

    myDiagram =
        _(go.Diagram, id, // must name or refer to the DIV HTML element
            {
                // an initial automatic zoom-to-fit
                initialAutoScale: go.Diagram.Uniform,
                // start everything in the middle of the viewport
                initialContentAlignment: go.Spot.Center,
                // no more than 1 element can be selected at a time
                maxSelectionCount: 1,
                // have mouse wheel events zoom in and out instead of scroll up and down
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                // support double-click in background creating a new node
                "clickCreatingTool.archetypeNodeData": { text: "new node" },
                // enable undo & redo
                "undoManager.isEnabled": true,
                //layout: _(ParallelLayout, { layerSpacing: 20, nodeSpacing: 10 })
                allowHorizontalScroll: false,
                allowVerticalScroll: false
            });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function(e) {
        let button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        let idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });

    // define the Node template
    myDiagram.nodeTemplate =
        _(go.Node, "Auto", { isShadowed: true },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // define the node's outer shape, which will surround the TextBlock
            _(go.Shape, "Rectangle", {
                    width: 120,
                    height: 40,
                    fill: _(go.Brush, "Linear", { 0: "#afbcc6" }),
                    stroke: "#444",
                    strokeWidth: 1.0,
                    portId: "", // this Shape is the Node's port, not the whole Node
                    fromLinkable: false,
                    fromLinkableSelfNode: false,
                    fromLinkableDuplicates: false,
                    toLinkable: false,
                    toLinkableSelfNode: false,
                    toLinkableDuplicates: false,
                    cursor: "pointer"
                }
                //, new go.Binding("fill", "isHighlighted", function(h) { return h ? _(go.Brush, "Linear", { 0: "#2387AA" }) : _(go.Brush, "Linear", { 0: "#afbcc6" }); }).ofObject(),
                // new go.Binding("strokeWidth", "isHighlighted", function(h, srcData, model) {
                //     return h || srcData.isInitState ? 2.5 : 1.0;
                // }).ofObject(),
                // new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#2387AA" : "#444"; }).ofObject()
            ),
            _(go.TextBlock, {
                    font: "12pt helvetica, arial, sans-serif",
                    //stroke: "#444",
                    editable: false // editing the text automatically updates the model data
                },
                new go.Binding("font", "isHighlighted", function(h) { return h ? "bold 11pt helvetica, arial, sans-serif" : "11pt helvetica, arial, sans-serif"; }).ofObject(),
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#ffffff" : "#444"; }).ofObject(),
                new go.Binding("text").makeTwoWay()
            ), {
                toolTip: //  define a tooltip for each group that displays its information
                    _(go.Adornment, "Auto",
                    _(go.Shape, { fill: "#EFEFCC" }),
                    _(go.TextBlock, { margin: 4 },
                        new go.Binding("text").makeTwoWay())
                )
            }
        );

    // unlike the normal selection Adornment, this one includes a Button
    myDiagram.nodeTemplate.selectionAdornmentTemplate =
        _(go.Adornment, "Spot",
            _(go.Panel, "Auto",
                _(go.Shape, "Rectangle", {
                    width: 120,
                    height: 40,
                    fill: _(go.Brush, "Linear", { 0: "#faa50a" }),
                    stroke: "#faa50a",
                    strokeWidth: 1.0
                }),
                _(go.TextBlock, {
                        font: "bold 12pt helvetica, bold arial, sans-serif",
                        stroke: "#444",
                        editable: false // editing the text automatically updates the model data
                    },
                    new go.Binding("text").makeTwoWay()
                )
            )
        ); // end Adornment

    // define the group template
    myDiagram.groupTemplate =
        _(go.Group, "Spot", { isShadowed: true }, {
                selectionAdornmentTemplate: // adornment when a group is selected
                    _(go.Adornment, "Auto",
                    _(go.Shape, "Rectangle", { fill: null, stroke: "dodgerblue", strokeWidth: 3 }),
                    _(go.Placeholder)
                ),
                toSpot: go.Spot.AllSides, // links coming into groups at any side
                toEndSegmentLength: 30,
                fromEndSegmentLength: 30
            },
            _(go.Panel, "Auto",
                _(go.Shape, "Rectangle", {

                    name: "GROUPOBJSHAPE",
                    fill: "#EEEEEE",
                    stroke: "#000000",
                    strokeWidth: 0.5
                }),
                _(go.Placeholder, { padding: 30 })
            ),
            _(go.TextBlock, {
                    name: "GROUPGROUPTEXT",
                    alignment: go.Spot.TopLeft,
                    alignmentFocus: new go.Spot(0, 0, 10, 10),
                    font: "Bold 14pt Sans-Serif"
                },
                new go.Binding("text").makeTwoWay()), {
                toolTip: //  define a tooltip for each group that displays its information
                    _(go.Adornment, "Auto",
                    _(go.Shape, { fill: "#EFEFCC" }),
                    _(go.TextBlock, { margin: 4 },
                        new go.Binding("text").makeTwoWay())
                )
            }
        );
    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
        _(go.Link, // the whole link panel
            {
                curve: go.Link.Bezier,
                adjusting: go.Link.Stretch,
                reshapable: false,
                relinkableFrom: false,
                relinkableTo: false,
                toShortLength: 3
            },
            new go.Binding("points").makeTwoWay(),
            new go.Binding("curviness"),
            _(go.Shape, // the link shape
                { strokeWidth: 1.5 },
                new go.Binding("strokeWidth", "isHighlighted", function(h) { return h ? 2.5 : 1.5; }).ofObject(),
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#2387AA" : "#444"; }).ofObject()
            ),
            _(go.Shape, // the arrowhead
                { toArrow: "standard", stroke: null },
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#2387AA" : "#444"; }).ofObject(),
                new go.Binding("fill", "isHighlighted", function(h) { return h ? "#2387AA" : "#444"; }).ofObject()
            ),
            _(go.Panel, "Auto",
                _(go.Shape, // the label background, which becomes transparent around the edges
                    {
                        fill: _(go.Brush, "Radial", { 0: "#FFFFFF", 0.3: "#FFFFFF", 1: "#FFFFFF" }),
                        stroke: null
                    }),
                _(go.TextBlock, "transition", // the label text
                    {
                        textAlign: "center",
                        font: "11pt helvetica, arial, sans-serif",
                        margin: 4,
                        editable: false // enable in-place editing
                    },
                    new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#2387AA" : "#444"; }).ofObject(),
                    // editing the text automatically updates the model data
                    new go.Binding("text").makeTwoWay())
            )
        );


    // read in the JSON data from the "mySavedModel" element
    load();

    // Show the diagram's model in JSON format */
}

function load() {
    $.getJSON("./SkillStatechart.json", function(json) {
        globalStateConfiguration = json;
        myDiagram.model = go.Model.fromJson(json);
    });
}