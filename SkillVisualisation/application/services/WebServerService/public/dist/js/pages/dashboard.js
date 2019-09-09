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

    /*
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
    */

    /*
    socket.on("KPIChanged", function(data) {
        $('span#currentMachSpeed').text(data.KPI[1].value);
    });
    socket.on("KPIChanged", function(data) {
        $('span#currentMachSpeed').text(data.KPI[1].value);
    });
    */

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