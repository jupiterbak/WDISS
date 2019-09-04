var myDiagram;
var gIP = "localhost";
var gPORT = 48022;
var gSERVERNAME = "SP164DEMO";
var gSOCKETId;
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
        // if (data.connection) {
        //     $('#PLCStatus').removeClass("text-red").addClass("text-green");
        //     $('#PLCStatusMsg').text("connected");
        // } else {
        //     $('#PLCStatus').removeClass("text-green").addClass("text-red");
        //     $('#PLCStatusMsg').text("not connected");
        // }
        // if (data.ip) {
        //     $('#PLCStatusIP').text(data.ip);
        // }
        // if (data.port) {
        //     $('#PLCStatusPORT').text(data.port);
        // }
    });

    socket.on("StatesChanged", function(data) {
        /*         // Highlight the current state
                var index = Math.floor(Math.random() * statesArr.length);
                var key = statesArr[index].id;
                highlightNode(key);

                // Change the transitions
                $('#transitionsHolder').empty();
                data.transitions.forEach(function(elem) {
                    $('#transitionsHolder').append(
                        '<li id="' + elem.name + '"> \
                            <a href = "#" class="EFlexAction" data-action="' + elem.hasCause.name + '"> \
                            <span class="info-box-text" >' + elem.name + ' --> (' + elem.hasCause.name + ') <i class ="fa fa-circle text-red pull-right" ></i> </span > \
                            <span class="info-box-number"> -' + elem.LoadGradient.value + ' W </span> \
                            </a>\
                        </li>');
                }); */

    });

    socket.on("KPIChanged", function(data) {
        // $('span#currentMachSpeed').text(data.KPI[1].value);
    });
});