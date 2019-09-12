let myDiagram;
var globalKGClientId = null;
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

    // Tab Pane Management


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
        $('#opcua_overlay').css('visibility', 'visible').hide().fadeIn().removeClass('hidden');
        $("#labelOPCIP").text($("#paramIPOPCUA").val());
        $("#labelOPCPort").text($("#paramPortOPCUA").val());
        setTimeout(() => {
            $('#opcua_overlay').css('visibility', 'hidden').hide().fadeOut().addClass('hidden');
            $('#opcua_content').css('visibility', 'visible').show().fadeIn().removeClass('hidden');
            $('#addRessource').modal('toggle');
        }, 5000);

    });

});