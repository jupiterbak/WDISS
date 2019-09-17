let myDiagram;
var gSOCKETId = "8548585858";
let gSERVERNAME = "SP347DEMO";
var globalKGClientId = null;
var gLastIP = "";
var gLastPORT = "";


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

    //Make the dashboard widgets sortable Using jquery UI
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

    // SocketIO
    const socket = io("http://localhost:8080/");
    socket.on('connected', (data) => {
        gSOCKETId = "8548585858"; //data;
    });

    socket.on("skillModels", function(arg) {
        if (arg) {
            $("#opcua_content_table_tbody").empty();
            for (var prop in arg) {
                var el = arg[prop];
                var template = $('#Skilltemplate').html();
                // compile it with Template7
                var compiledTemplate = Template7.compile(template);
                // Now we may render our compiled template by passing required context
                var context = {
                    name: el.skill.name,
                    nodeId: el.skill.nodeId,
                    ip: el.ip,
                    port: el.port
                };
                var html = compiledTemplate(context);
                $("#opcua_content_table_tbody").append(html);
            }
        }
        // TODO: Add a good filter
        //if (arg.ip === gLastIP && arg.port === gLastPORT) {
        $('#opcua_overlay').css('visibility', 'hidden').hide().fadeOut().addClass('hidden');
        $('#opcua_content').css('visibility', 'visible').show().fadeIn().removeClass('hidden');
        $('#addRessource').modal('hide');
        //}
    });

    // Knowledge Graph
    $("#connectKG").click(function() {
        $.getJSON("/connectKG", { ip: $("#paramIP").val(), port: $("#paramPort").val() })
            .done(function(data) {
                globalKGClientId = data.ID;
                $('#process_tree').empty();
                $('#product_tree').empty();
                $('#resource_tree').empty();
                $.when(
                    $('#process_tree').jstree({
                        'core': {
                            'data': {
                                'url': '/getAllProcess',
                                'data': function(node) {
                                    return { ID: globalKGClientId, parent: { id: node.id } };
                                }
                            },
                            'force_text': true,
                            'check_callback': true,
                            'themes': {
                                'name': 'proton',
                                'responsive': true
                            },
                        },
                        'plugins': ['state', 'dnd', 'contextmenu', 'wholerow']
                    }),
                    $('#product_tree').jstree({
                        'core': {
                            'data': {
                                'url': '/getAllProduct',
                                'data': function(node) {
                                    return { ID: globalKGClientId, parent: { id: node.id } };
                                }
                            },
                            'force_text': true,
                            'check_callback': true,
                            'themes': {
                                'name': 'proton',
                                'responsive': true
                            },
                        },
                        'plugins': ['state', 'dnd', 'contextmenu', 'wholerow']
                    }),
                    $('#resource_tree').jstree({
                        'core': {
                            'data': {
                                'url': '/getAllResource',
                                'data': function(node) {
                                    return { ID: globalKGClientId, parent: { id: node.id } };
                                }
                            },
                            'force_text': true,
                            'check_callback': true,
                            'themes': {
                                'name': 'proton',
                                'responsive': true
                            },
                        },
                        'plugins': ['state', 'dnd', 'contextmenu', 'wholerow']
                    })
                ).then(function() {
                    $("#labelKGIP").text($("#paramIP").val());
                    $("#labelKGPort").text($("#paramPort").val());
                    $('#treeview').tab('show');
                    $('#addKG').modal('toggle');

                });


            });
    });

    // OPC UA Search
    $("#connectOPCUA").click(function() {
        var _ip = $("#paramIPOPCUA").val();
        var _port = $("#paramPortOPCUA").val();
        gLastIP = _ip;
        gLastPORT = _port;

        $('#opcua_overlay').css('visibility', 'visible').hide().fadeIn().removeClass('hidden');
        $("#labelOPCIP").text(_ip);
        $("#labelOPCPort").text(_port);
        /** Start a new connection */
        $.getJSON("/connect", { parameter: JSON.stringify({ socketID: "" + gSOCKETId, ip: _ip, port: _port, serverName: gSERVERNAME }) },
            function(result) {
                if (result.err) {
                    // TODO
                } else {
                    // TODO
                }
            });
    });
});