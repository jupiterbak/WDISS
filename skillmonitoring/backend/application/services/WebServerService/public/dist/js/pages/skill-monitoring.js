'use strict';

let myDiagram;
let gIP = "localhost";
let gPORT = 4840;
let gSkill = "";
let gSERVERNAME = "SP347DEMO";
let gSOCKETId = "8548585858";
var globalStateConfiguration;
var current_server_url = window.location;

// Get all Parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

$(function() {
    gIP = getUrlParameter('ip');
    gPORT = getUrlParameter('port');
    gSkill = getUrlParameter('skill');

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

    function showAlert(_text, _type){
        if (_type === 'success'){
            $(".alert").removeClass('alert-warning').removeClass('alert-success').addClass('alert-success');
        }else{
            $(".alert").removeClass('alert-warning').removeClass('alert-success').addClass('alert-warning');
        }
        $(".alert").addClass('in out');
        $('.alert').show();
        $('.alert').text(_text);
        return false; // Keep close.bs.alert event from removing from DOM
    }

    function removeAlert(){
        $('.alert').hide();
        $('.alert').removeClass('in out');
        $('input').removeClass('has-success').removeClass('has-warning');
        return false; // Keep close.bs.alert event from removing from DOM
    }

    function executeMethod(self, params) {
        var all_parameters = $(self).parent().parent().find('.input_param_div input');
        let data = {
            ip: gIP,
            hostname: window.location.hostname,
            port: gPORT,
            serverName: gSERVERNAME,
            socketID: gSOCKETId,
            skillName: gSkill,
            actionName: self.dataset["actionname"],
            parameters: []
        };

        for (let index = 0; index < all_parameters.length; index++) {
            const el = all_parameters[index];
            var _val = el.value?el.value:0;
            data.parameters.push({
                dataType: el.dataset["datatype"], // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                arrayType: el.dataset["arraytype"], //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                value: _val
            });
        }

        $.getJSON("/ExecuteMethod", { action: JSON.stringify(data) },
            function(result) {
                if (result.err) {
                    // TODO: make a nice error feedback
                    $(".alert").removeClass('alert-warning').removeClass('alert-success').addClass('alert-warning');
                    showAlert(result.err.text, 'error');
                    $('.output_param_div input').filter(function(index){
                        if(index < result.results.outputArguments.length){
                            $( this ).val(result.results.outputArguments[index].value);
                            $( this ).addClass('has-warning');
                        }                        
                        return true;
                    });
                } else {
                    $(".alert").removeClass('alert-warning').removeClass('alert-success').addClass('alert-success');
                    showAlert("Execusion was sucessfull.", 'success');
                    // $('.modal').modal('hide');
                    // Update the output values
                    $('.output_param_div input').filter(function(index){
                        if(index < result.results.outputArguments.length){
                            $( this ).val(result.results.outputArguments[index].value);
                            $( this ).addClass('has-success');
                        }
                        return true;
                    });
                }
            }
        );
    }


    /** SOCKET IO Handler **/
    const socket = io("/");
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
        for (var prop in data) {
            if (Object.prototype.hasOwnProperty.call(data, prop)) {
                var con_status = data[prop];
                if(gIP === con_status.ip || gPORT === con_status.port ){

                    if (con_status.connection) {
                        $('#ressourceStatus').removeClass("text-red").addClass("text-green");
                        $('#ressourceStatus').text("Connected");
                    } else {
                        $('#ressourceStatus').removeClass("text-green").addClass("text-red");
                        $('#ressourceStatus').text("Not connected");
                    }
                    if (con_status.ip) {
                        $('#ressourceIP').text(con_status.ip);
                    }
                    
                    $('#ressourceName').text(gSkill);
                    if (con_status.port) {
                        $('#ressourcePort').text(con_status.port);
                    }
                }
            }
        }        
    });


    socket.on( 'StatesChanged', function(data) {
        // Highlight the current state
        var _keys = [];
        for (var prop in data) {
            if (Object.prototype.hasOwnProperty.call(data, prop)) {
                var el = data[prop];
                if (el.ip === gIP && el.port === gPORT && el.skill === gSkill) {
                    var candidates = globalStateConfiguration.nodeDataArray.filter(item => item.id === el.state.value);
                    // filter with the nodeId
                    if (candidates.length == 0) {
                        candidates = globalStateConfiguration.nodeDataArray.filter(function(item) {
                            var src = el.state.value;
                            var target = item.nid;
                            var rslt = ("" + src).indexOf(target);
                            return rslt >= 0;
                        });
                    }

                    /*
                    // filter with the type State Name
                    if (candidates.length == 0) {
                        candidates = globalStateConfiguration.nodeDataArray.filter(function(item) {
                            var src = el.state_object_from_type.browseName.value;
                            var target = item.nid;
                            var rslt = ("" + src).indexOf(target);
                            return rslt >= 0;
                        });
                    }
                    */
                    if (candidates.length > 0) {
                        _keys.push(candidates[0].id);
                        $('span#CurrentState').text(candidates[0].id);
                    }
                }
            }
        }
        highlightNode(_keys);
    });

    socket.on("skillModels", function(arg) {
        if (arg) {
            for (var prop in arg) {
                var el = arg[prop];
                if (el.ip === gIP && el.port === gPORT && el.skill.name === gSkill) {
                    // Dismiss all modal
                    $('.modal').modal('hide');
                    $("#modalContainers").empty();
                    $("#modelActionBtn").empty();
                    removeAlert();
                    // extract the methods --> TODO: Make it more generic
                    var methods = [el.skillModel.Invokation.Start, el.skillModel.Invokation.GetResult];
                    methods.forEach(m => {
                        // Generate Parameter View                        
                        var template = $('#SkillParameterModal').html();
                        var compiledTemplate = Template7.compile(template);
                        var html = compiledTemplate(m);
                        $("#modalContainers").append(html);
                        var template = $('#SkillActionList').html();
                        var compiledTemplate = Template7.compile(template);
                        var html = compiledTemplate(m);
                        $("#modelActionBtn").append(html);
                        removeAlert();
                    });

                    // Add the listener
                    $('.executeMethod').click(function(params) {
                        executeMethod(this, params);
                    });
                }
            }
        }
    });

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

function highlightNode(keys) {
    var nodes = myDiagram.nodes.filter(node => keys.includes(node.key));
    myDiagram.nodes.each(function(node) {
        node.findLinksOutOf().each(function(l) { l.isHighlighted = false; });
        node.isHighlighted = false;
    });
    nodes.each(function(node) {
        //if (node.key === key) {
        //let diagram = node.diagram;
        //diagram.startTransaction("highlight");
        // remove any previous highlighting
        //diagram.clearHighlighteds();

        // for each Link coming out of the Node, set Link.isHighlighted
        node.findLinksOutOf().each(function(l) { l.isHighlighted = true; });

        // for each Node destination for the Node, set Node.isHighlighted
        // node.findNodesOutOf().each(function(n) { n.isHighlighted = true; });
        node.isHighlighted = true;
        //diagram.commitTransaction("highlight");
        //}
    });
    //myDiagram.select(myDiagram.findNodeForKey(key));
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
                maxSelectionCount: 10,
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
                },
                new go.Binding("fill", "isHighlighted", function(h) { return h ? _(go.Brush, "Linear", { 0: "#41aaaa" }) : _(go.Brush, "Linear", { 0: "#afbcc6" }); }).ofObject(),
                // new go.Binding("strokeWidth", "isHighlighted", function(h, srcData, model) {
                //     return h || srcData.isInitState ? 2.5 : 1.0;
                // }).ofObject(),
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#41aaaa" : "#444"; }).ofObject()
            ),
            _(go.TextBlock, {
                    font: "12pt helvetica, arial, sans-serif",
                    //stroke: "#444",
                    editable: false // editing the text automatically updates the model data
                },
                new go.Binding("font", "isHighlighted", function(h) { return h ? "bold 11pt helvetica, arial, sans-serif" : "11pt helvetica, arial, sans-serif"; }).ofObject(),
                // new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#ffffff" : "#444"; }).ofObject(),
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
                    },
                    //new go.Binding("fill", "isHighlighted", function(h) { return h ? _(go.Brush, "Linear", { 0: "#faa50a" }) : _(go.Brush, "Linear", { 0: "#afbcc6" }); }).ofObject(),
                    new go.Binding("strokeWidth", "isHighlighted", function(h, srcData, model) {
                        return h ? 3.0 : 0.5;
                    }).ofObject(),
                    new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#41aaaa" : "#444"; }).ofObject()
                ),
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
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#41aaaa" : "#444"; }).ofObject()
            ),
            _(go.Shape, // the arrowhead
                { toArrow: "standard", stroke: null },
                new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#41aaaa" : "#444"; }).ofObject(),
                new go.Binding("fill", "isHighlighted", function(h) { return h ? "#41aaaa" : "#444"; }).ofObject()
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
                    new go.Binding("font", "isHighlighted", function(h) { return h ? "bold 11pt helvetica, arial, sans-serif" : "11pt helvetica, arial, sans-serif"; }).ofObject(),
                    new go.Binding("stroke", "isHighlighted", function(h) { return h ? "#41aaaa" : "#444"; }).ofObject(),
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