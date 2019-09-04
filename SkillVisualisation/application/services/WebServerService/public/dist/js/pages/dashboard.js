let myDiagram;
let gIP = "192.168.43.1";
let gPORT = 4840;
let gSERVERNAME = "SP164DEMO";
let gSOCKETId = "8548585858";
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

    /*
     * Flot Interactive Chart
     * -----------------------
     */
    // We use an inline data source in the example, usually data would
    // be fetched from a server
    let plotoptions = {
        grid: {
            borderColor: "#f3f3f3",
            borderWidth: 1,
            tickColor: "#f3f3f3"
        },
        series: {
            shadowSize: 0, // Drawing is faster without shadows
            color: "#3c8dbc"
        },
        lines: {
            fill: true, //Converts the line chart to area chart
            color: "#3c8dbc"
        },
        yaxis: {
            show: true,
            min: -3000.0,
            max: 3000.0
        },
        xaxis: {
            show: false
        }
    };

    let plotoptions2 = {
        grid: {
            borderColor: "#f3f3f3",
            borderWidth: 1,
            tickColor: "#f3f3f3"
        },
        series: {
            shadowSize: 0, // Drawing is faster without shadows
            color: "#3c8dbc"
        },
        lines: {
            fill: true, //Converts the line chart to area chart
            color: "#3c8dbc"
        },
        yaxis: {
            show: true,
            min: -5.0
        },
        xaxis: {
            show: false
        }
    };

    let totalPoints = 100;
    let all_graphs = {};


    let sliceData = function(data) {
        let i;
        if (data.length > totalPoints) {
            data = data.slice(1, totalPoints + 1)
        }
        let res = [];
        for (i = 0; i < totalPoints - data.length; ++i) {
            res.push([i, 0]);
        }
        for (i = (totalPoints - data.length); i < totalPoints; ++i) {
            res.push([i, data[i - (totalPoints - data.length)][1]]);
        }
        return res;
    };

    let updateGraph = function(plotObj, new_value) {
        let allData = plotObj.getData(); // allData is an array of series objects
        allData[0].data.push([allData[0].data.length, new_value]);
        allData[0].data = sliceData(allData[0].data);
        plotObj.setData(allData);
        plotObj.setupGrid(); // if axis have changed
        plotObj.draw();
    };

    /** SOCKET IO Handler **/
    let updateNewValueInGraph = function(msg, value_key) {
        let MD5ID = value_key;
        if (all_graphs[MD5ID]) {
            updateGraph(all_graphs[MD5ID], msg.value.toFixed(2));
            $('#' + MD5ID + '_current_value').text('' + msg.value.toFixed(2));
        }
    };

    // set Range of axis y
    all_graphs["CurrentLoad"] = $.plot('#CurrentLoad_graph', [
        []
    ], plotoptions2);


    // Set Range of axis y
    all_graphs["CurrMachSpeed"] = $.plot('#CurrMachSpeed_graph', [
        []
    ], plotoptions);

    // Generate SandKey Diagram
    let configSankey = {
        margin: { top: 5, left: 5, right: 5, bottom: 5 },
        nodes: {
            dynamicSizeFontNode: {
                enabled: true,
                minSize: 14,
                maxSize: 20
            },
            draggableX: false,
            draggableY: true,
            //colors: d3.scaleOrdinal(d3.schemeCategory10),
            //colors: d3.scaleOrdinal(['#41aaaa', '#49a5a5', '#519f9f', '#589a9a', '#609595', '#688f8f', '#708a8a', '#788585'])
            //colors: d3.scaleOrdinal(['#41aaaa', '#59b5b5','#71bfbf','#88caca','#a0d4d4','#b8dfdf','#d0eaea','#e7f4f4'])
            colors: d3.scaleOrdinal(['#41aaaa', '#4176aa', '#4141aa', '#7641aa', '#aa41aa', '#aa4176'])
            //colors: d3.scaleOrdinal(['#15534C', '#206555', '#30785B', '#448B5F', '#5D9D61', '#79AF61', '#99C160', '#BCD160', '#E2E062'])
        },
        links: {
            title: "Mytitle",
            formatValue: function(val) {
                return d3.format(",.2f")(val) + ' W';
            }
        },
        tooltip: {
            infoDiv: true,
            labelSource: 'Input:',
            labelTarget: 'Output:'
        }
    };

    let SandkeyObject = loadSandKey();
    let objSankey = sk.createSankey('#SandKey_graph', configSankey, SandkeyObject);
    let SandkeyInterval = setInterval(function() {
        objSankey.updateData(SandkeyObject);
    }, 1000);

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

        // Send the state of the AI CheckBox
        let dataActivated = {
            activated: !($('#AICheckBox').is(":checked"))
        };
        $.getJSON("/activateLM", { action: JSON.stringify(dataActivated) },
            function(result) {
                // TODO
                if (result.err) {

                }
            });
    });

    // Listen to all events
    socket.on("serverstatus", function(data) {
        if (data.connection) {
            $('#PLCStatus').removeClass("text-red").addClass("text-green");
            $('#PLCStatusMsg').text("connected");
        } else {
            $('#PLCStatus').removeClass("text-green").addClass("text-red");
            $('#PLCStatusMsg').text("not connected");
        }
        if (data.ip) {
            $('#PLCStatusIP').text(data.ip);
        }
        if (data.port) {
            $('#PLCStatusPORT').text(data.port);
        }
    });

    socket.on("StatesChanged", function(data) {
        // Highlight the current state
        let keyObj = statesArr[data.state.value];
        if (keyObj) {
            highlightNode(keyObj.id);
            $('span#CurrentState').text(keyObj.id);
        } else {
            highlightNode('Stopped');
            $('span#CurrentState').text('Stopped');
        }

        // Change the transitions
        data.transitions.forEach(function(elem) {
            if (elem && elem.hasCause) {
                let enabled = elem.EnableFlag.value;
                let txt_class = "text-red";
                let hidden_class = "hidden";
                if (enabled && enabled === true) {
                    txt_class = "text-green";
                    hidden_class = "";
                }

                $('#' + elem.hasCause.name).removeClass("hidden").addClass(hidden_class);
                $('#' + elem.hasCause.name + " i").removeClass("text-red").removeClass("text-green").addClass(txt_class);
                //$('#' + elem.hasCause.name + " span.info-box-number").text(elem.LoadGradient.value.toFixed(2) + ' W ');
            }
        });
    });

    socket.on("KPIChanged", function(data) {
        if (data) {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const element = data[key];
                    if (element.name === "CurrentLoads") {
                        let val = element.value;
                        let motor_AC = val[0];
                        let motor_DC = val[1];
                        let V90_controller = val[2];
                        let all_Devices = val[3];

                        // Grid
                        SandkeyObject.links[0].value = motor_AC; // Grid V90
                        if (data["EnergySource"].value) {
                            SandkeyObject.links[1].value = 0; // Grid --> PSU
                            SandkeyObject.links[2].value = motor_DC + all_Devices + V90_controller; // Buffer --> PSU
                        } else {
                            SandkeyObject.links[1].value = motor_DC + all_Devices + V90_controller; // Grid --> PSU
                            SandkeyObject.links[2].value = 0; // Buffer --> PSU
                        }
                        // Buffer


                        // PSU
                        SandkeyObject.links[3].value = all_Devices / 5; // PSU --> 1500
                        SandkeyObject.links[4].value = all_Devices / 5; // PSU --> Ethernet-Switch
                        SandkeyObject.links[5].value = all_Devices / 5; // PSU --> WLAN Switch
                        SandkeyObject.links[6].value = all_Devices / 5; // PSU --> Nanobox
                        SandkeyObject.links[7].value = all_Devices / 5; // PSU --> IO-Modul
                        SandkeyObject.links[8].value = motor_DC; // PSU --> Motor DC
                        SandkeyObject.links[10].value = V90_controller; // PSU --> Motor DC

                        // V90
                        SandkeyObject.links[9].value = motor_AC; // V90 --> Motor AC
                        //objSankey.updateData(SandkeyObject);

                    } else {
                        let obj = $('span#' + element.name);
                        if (obj.length > 0) {

                            let val = element.value || 0.0;
                            if (element.name === "TargetLoad") {
                                obj.text(Number(val).toFixed(2) * 100.0);
                                $('span#start_max_load').text("" + (Number(val * 160.00).toFixed(2)) + " W");

                            } else if (element.name === "EnergySource") {
                                obj.text(val ? "Buffer" : "Grid");
                            } else {
                                if (isNumber(val)) {
                                    obj.text(val.toFixed(2));
                                } else {
                                    obj.text(val);
                                }
                            }
                        }

                        // Update Graph
                        updateNewValueInGraph(element, element.name)
                    }
                }
            }
        }
    });

    socket.on("TRANSITIONDescriptionChanged", function(elem) {
        if (elem && elem.hasCause) {
            let enabled = elem.EnableFlag.value;
            let txt_class = "text-red";
            let hidden_class = "hidden";
            if (enabled && enabled === true) {
                txt_class = "text-green";
                hidden_class = "";
            }

            $('#' + elem.hasCause.name).removeClass("hidden").addClass(hidden_class);
            $('#' + elem.hasCause.name + " i").removeClass("text-red").removeClass("text-green").addClass(txt_class);
            //$('#' + elem.hasCause.name + " span.info-box-number").text(elem.LoadGradient.value.toFixed(2) + ' W ');
        }
    });

    /*
    socket.on("KPIChanged", function(data) {
        $('span#currentMachSpeed').text(data.KPI[1].value);
    });
    socket.on("KPIChanged", function(data) {
        $('span#currentMachSpeed').text(data.KPI[1].value);
    });
    */

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


    $('#AICheckBox').change(function() {
        let data = {
            activated: !($(this).is(":checked"))
        };

        $.getJSON("/activateLM", { action: JSON.stringify(data) },
            function(result) {
                // TODO
                if (result.err) {

                }
            });
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




let changeInterval = null;
let statesArr = [
    { "id": "Stopped", "text": "Stopped", "trans": 0, "group": "ClearedState", "loc": "200 400" },
    { "id": "Clearing", "text": "Clearing", "trans": 1, "group": "ClearedState", "loc": "500 400" },
    { "id": "Stopped", "text": "Stopped", "trans": 0, "group": "ClearedState", "loc": "200 400" },
    { "id": "Starting", "text": "Starting", "trans": 1, "group": "RunningState", "loc": "300 200" },
    { "id": "Idle", "text": "Idle", "trans": 0, "group": "RunningState", "loc": "200 200" },
    { "id": "Suspended", "text": "Suspended", "trans": 0, "group": "RunningState", "loc": "450 300" },
    { "id": "Execute", "text": "Execute", "trans": 0, "group": "RunningState", "loc": "450 200" },
    { "id": "Stopping", "text": "Stopping", "trans": 1, "group": "ClearedState", "loc": "325 400" },
    { "id": "Aborting", "text": "Aborting", "trans": 1, "loc": "600 550" },
    { "id": "Aborted", "text": "Aborted", "trans": 0, "loc": "500 550" },
    { "id": "Holding", "text": "Holding", "trans": 1, "group": "RunningState", "loc": "300 100" },
    { "id": "Held", "text": "Held", "trans": 0, "group": "RunningState", "loc": "450 100" },
    { "id": "UnHolding", "text": "UnHolding", "trans": 1, "group": "RunningState", "loc": "550 100" },
    { "id": "Suspending", "text": "Suspending", "trans": 1, "group": "RunningState", "loc": "300 300" },
    { "id": "UnSuspending", "text": "UnSuspending", "trans": 1, "group": "RunningState", "loc": "550 300" },
    { "id": "Resetting", "text": "Resetting", "trans": 1, "group": "RunningState", "loc": "200 300" },
    { "id": "Completing", "text": "Completing", "trans": 1, "group": "RunningState", "loc": "550 200" },
    { "id": "Completed", "text": "Completed", "trans": 0, "group": "RunningState", "loc": "700 200" },
    { "id": "LoadChange", "text": "LoadChange", "trans": 1, "group": "RunningState", "loc": "250 0" },
    { "id": "PoweringOff", "text": "PoweringOff", "trans": 1, "group": "RunningState", "loc": "100 0" },
    { "id": "PowerOff", "text": "PowerOff", "trans": 0, "group": "RunningState", "loc": "0 0" },
    { "id": "StandingBy", "text": "StandingBy", "trans": 1, "group": "RunningState", "loc": "100 100" },
    { "id": "StandBy", "text": "StandBy", "trans": 0, "group": "RunningState", "loc": "0 100" },
    { "id": "StartingUp", "text": "StartingUp", "trans": 1, "group": "RunningState", "loc": "0 200" },
    { "id": "StartedUp", "text": "StartedUp", "trans": 0, "group": "RunningState", "loc": "0 300" }

];

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function highlightNodeRandomly() {
    let index = Math.floor(Math.random() * statesArr.length);
    let key = statesArr[index].id;
    highlightNode(key);
    changeInterval = setInterval(function() {
        let index = Math.floor(Math.random() * statesArr.length);
        let key = statesArr[index].id;
        highlightNode(key);
    }, 10000);
}

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
                //"toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
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
                    width: 100,
                    height: 30,
                    //fill: _(go.Brush, "Linear", { 0: "#afbcc6" }),
                    //stroke: "#444",
                    //strokeWidth: 1.0,
                    portId: "", // this Shape is the Node's port, not the whole Node
                    fromLinkable: false,
                    fromLinkableSelfNode: false,
                    fromLinkableDuplicates: false,
                    toLinkable: false,
                    toLinkableSelfNode: false,
                    toLinkableDuplicates: false,
                    cursor: "pointer"
                },
                new go.Binding("fill", "isHighlighted", function(h) { return h ? _(go.Brush, "Linear", { 0: "#2387AA" }) : _(go.Brush, "Linear", { 0: "#afbcc6" }); }).ofObject(),
                new go.Binding("strokeWidth", "isHighlighted", function(h) { return h ? 2.5 : 1.0; }).ofObject(),
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#2387AA" : "#444"; }).ofObject()
            ),
            _(go.TextBlock, {
                    font: "12pt helvetica, arial, sans-serif",
                    //stroke: "#444",
                    editable: false // editing the text automatically updates the model data
                },
                new go.Binding("font", "isHighlighted", function(h) { return h ? "bold 11pt helvetica, arial, sans-serif" : "11pt helvetica, arial, sans-serif"; }),
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
                    width: 100,
                    height: 30,
                    fill: _(go.Brush, "Linear", { 0: "#faa50a" }),
                    stroke: "#faa50a",
                    strokeWidth: 2.0
                }),
                _(go.TextBlock, {
                        font: "bold 12pt helvetica, bold arial, sans-serif",
                        stroke: "#444",
                        editable: false // editing the text automatically updates the model data
                    },
                    new go.Binding("text").makeTwoWay())
            )
        ); // end Adornment

    // define the group template
    myDiagram.groupTemplate =
        _(go.Group, "Spot", {
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
                    fill: "rgba(217,230,239, 0.3)",
                    stroke: "#000000",
                    strokeWidth: 0.5
                }),
                _(go.Placeholder, { padding: 40 })
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
                        fill: _(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
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
    let obj = JSON.parse('{ "nodeKeyProperty": "id",\
    "nodeDataArray": [\
        { "key": "RunningState", "id": "RunningState", "text": "Running States",  "isGroup": true ,"group": "ClearedState"},\
        { "key": "ClearedState", "id": "ClearedState", "text": "Cleared States", "isGroup": true},\
        { "id": "Aborted", "text": "Aborted", "trans": 0  , "loc": "550 550"},\
        { "id": "Aborting", "text": "Aborting", "trans": 1 , "loc": "700 550" },\
        { "id": "Stopped",  "text": "Stopped" , "trans": 0,"group": "ClearedState" , "loc": "250 400"},\
        { "id": "Clearing", "text": "Clearing", "trans": 1  ,"group": "ClearedState", "loc": "550 400"},\
        { "id": "Stopping", "text": "Stopping", "trans": 1  ,"group": "ClearedState", "loc": "400 400"},\
      { "id": "PowerOff", "text": "PowerOff", "trans": 0 , "group": "RunningState","loc": "0 0" },\
      { "id": "PoweringOff", "text": "PoweringOff", "trans": 1 , "group": "RunningState", "loc": "150 0" },\
      { "id": "LoadChange", "text": "LoadChange", "trans": 1 , "group": "RunningState" , "loc": "300 0" },\
      { "id": "StartingUp",  "text": "StartingUp" , "trans": 1, "group": "RunningState", "loc": "0 200" },\
      { "id": "StandBy",  "text": "StandBy" , "trans": 0, "group": "RunningState", "loc": "0 100" },\
      { "id": "StandingBy",  "text": "StandingBy" , "trans": 1, "group": "RunningState", "loc": "150 100" },\
      { "id": "StartedUp",  "text": "StartedUp" , "trans": 0, "group": "RunningState", "loc": "0 300" },\
      { "id": "Resetting", "text": "Resetting", "trans": 1 , "group": "RunningState" , "loc": "250 300" },\
      { "id": "Idle", "text": "Idle", "trans": 0 , "group": "RunningState", "loc": "250 200" },\
      { "id": "Starting", "text": "Starting", "trans": 1, "group": "RunningState", "loc": "400 200"  },\
      { "id": "Execute", "text": "Execute", "trans": 0 , "group": "RunningState" , "loc": "550 200" },\
      { "id": "Completing", "text": "Completing", "trans": 1 , "group": "RunningState" , "loc": "700 200" },\
      { "id": "Completed", "text": "Completed", "trans": 0 , "group": "RunningState" , "loc": "850 200"},\
      { "id": "Holding", "text": "Holding", "trans": 1 , "group": "RunningState" , "loc": "400 100" },\
      { "id": "Held", "text": "Held", "trans": 0 , "group": "RunningState", "loc": "550 100" },\
      { "id": "UnHolding", "text": "UnHolding", "trans": 1 , "group": "RunningState", "loc": "700 100"  },\
      { "id": "Suspending", "text": "Suspending", "trans": 1 , "group": "RunningState", "loc": "400 300"  },\
      { "id": "Suspended", "text": "Suspended", "trans": 0 , "group": "RunningState", "loc": "550 300" },\
      { "id": "UnSuspending", "text": "UnSuspending", "trans": 1, "group": "RunningState" , "loc": "700 300"}\
    ],\
    "linkDataArray": [\
        { "from": "LoadChange", "to": "Idle", "curviness": 10, "text": "Change load" },\
        { "from": "LoadChange", "to": "Held", "curviness": 60 , "text": "Change load"},\
        { "from": "LoadChange", "to": "Suspending", "curviness": -40 , "text": "Change load"},\
        { "from": "LoadChange", "to": "Execute", "curviness": 60 , "text": "Change load"},\
        { "from": "Idle", "to": "LoadChange", "curviness": -10 , "text": "Change load"},\
        { "from": "Held", "to": "LoadChange", "curviness": -60 , "text": "Change load"},\
        { "from": "Suspending", "to": "LoadChange", "curviness": 40 , "text": "Change load"},\
        { "from": "Execute", "to": "LoadChange", "curviness": -60 , "text": "Change load"},\
      { "from": "ClearedState", "to": "Aborting", "curviness": 0 , "text": "Abort"},\
      { "from": "Aborting", "to": "Aborted", "curviness": 0 , "text": "SC"},\
      { "from": "Aborted", "to": "Clearing", "curviness": 0 , "text": "Clear"},\
      { "from": "Clearing", "to": "Stopped" , "curviness": 50, "text": "SC"},\
      { "from": "Stopped", "to": "Resetting", "curviness": 0 , "text": "Reset"},\
      { "from": "Resetting", "to": "Idle", "curviness": 0 , "text": "SC"},\
      { "from": "Idle", "to": "Starting", "curviness": 0 , "text": "Start"},\
      { "from": "Starting", "to": "Execute", "curviness": 0 , "text": "SC"},\
      { "from": "Execute", "to": "Completing", "curviness": 0 , "text": "SC"},\
      { "from": "Completing", "to": "Completed", "curviness": 0 , "text": "SC"},\
      { "from": "Completed", "to": "Resetting", "curviness": 0 , "text": "Reset"},\
      { "from": "Execute", "to": "Holding", "curviness": 0 , "text": "Hold"},\
      { "from": "Holding", "to": "Held", "curviness": 0 , "text": "SC"},\
      { "from": "Held", "to": "UnHolding", "curviness": 0 , "text": "UnHold"},\
      { "from": "UnHolding", "to": "Execute", "curviness": 0 , "text": "SC"},\
      { "from": "Execute", "to": "Suspending", "curviness": 0 , "text": "Suspend"},\
      { "from": "Suspending", "to": "Suspended", "curviness": 0 , "text": "SC"},\
      { "from": "Suspended", "to": "UnSuspending", "curviness": 0 , "text": "UnSuspend"},\
      { "from": "UnSuspending", "to": "Execute", "curviness": 0 , "text": "SC"},\
      { "from": "RunningState", "to": "Stopping", "curviness": 0 , "text": "Stop"},\
      { "from": "Stopping", "to": "Stopped", "curviness": 0 , "text": "SC"},\
      { "from": "Stopped", "to": "Resetting", "curviness": 0 , "text": "Reset"},\
      { "from": "Idle", "to": "PoweringOff", "curviness": -30 , "text": "Power Off"},\
      { "from": "PoweringOff", "to": "PowerOff", "curviness": 0 , "text": "SC"},\
      { "from": "PowerOff", "to": "StartingUp", "curviness": -100 , "text": "Power On"},\
      { "from": "Idle", "to": "StandingBy", "curviness": 30 , "text": "Stand by"},\
      { "from": "StandingBy", "to": "StandBy", "curviness": 0 , "text": "SC"},\
      { "from": "StandBy", "to": "StartingUp", "curviness": 0 , "text": "Power On"},\
      { "from": "StartingUp", "to": "StartedUp", "curviness": 0 , "text": "SC"},\
      { "from": "StartedUp", "to": "Starting", "curviness": 0 , "text": "Start"},\
      { "from": "StartedUp", "to": "Resetting", "curviness": 0 , "text": "Reset"}\
    ]\
  }');
    myDiagram.model = go.Model.fromJson(obj);
}

function loadSandKey() {
    return JSON.parse(
        '{"nodes":[{"name":"Grid"},{"name":"Buffer"},{"name":"PSU"},{"name":"V90"},{"name":"PLC(S7 1500)"},{"name":"Ethernet-Switch(Scalance M764)"},{"name":"WLAN Switch(Scalance W700)"},{"name":"Nanobox(IPC 227E)"},{"name":"IO-Modul(ET200 SP)"},{"name":"DC Motor"},{"name":"AC Motor"},{"name":"V90 Controller"}],"links":[{"source":0,"target":3,"value":55},{"source":0,"target":2,"value":60},{"source":1,"target":2,"value":0.1},{"source":2,"target":4,"value":1.5},{"source":2,"target":5,"value":1},{"source":2,"target":6,"value":1},{"source":2,"target":7,"value":2},{"source":2,"target":8,"value":1},{"source":2,"target":9,"value":50},{"source":3,"target":10,"value":50},{"source":2,"target":11,"value":50}]}');
}