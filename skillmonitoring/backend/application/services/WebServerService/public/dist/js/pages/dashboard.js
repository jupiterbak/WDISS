let myDiagram;
var gSOCKETId = "8548585858";
let gSERVERNAME = "SP347DEMO";
var globalKGClientId = null;
var gLastIP = "";
var gLastPORT = "";
var gSkillList = [];
var gOPCUASkillList = [];


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
    const socket = io("/");
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
                    port: el.port,
                    hostname: window.location.hostname,
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

    // Knoeledge Graph
    function propagageKG(ip_,port_){
        $.getJSON("/connectKG", { ip: ip_, port: port_ })
            .done(function(data) {
                globalKGClientId = data.ID;
                $('#process_tree').empty();
                $('#product_tree').empty();
                $('#resource_tree').empty();
                $('#skill_tree').empty();
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
                    }),
                    $('#skill_tree').jstree({
                        'core': {
                            'data': {
                                'url': '/getAllSkillKGInstances',
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
                        'plugins': ['state', 'dnd', 'wholerow']
                    })
                ).then(function() {
                    $("#labelKGIP").text($("#paramIP").val());
                    $("#labelKGPort").text($("#paramPort").val());
                    $('#treeview').tab('show');
                    $('#addKG').modal('hide');

                });
            });
    }
    socket.on("KGConnected", function(arg) {
        if (arg) {
            if(arg.length > 0){
                propagageKG(arg[0].ip,arg[0].port);
            }
        }
    });

    // Knowledge Graph
    $("#connectKG").click(function() {
        propagageKG($("#paramIP").val(),$("#paramPort").val());
    });

    // OPC UA Search
    $("#connectOPCUA").click(function() {
        var _ip = $("#paramIPOPCUA").val();
        var _port = $("#paramPortOPCUA").val();
        gLastIP = _ip;
        gLastPORT = _port;

        $('#opcua_overlay').css('visibility', 'visible').show().fadeIn().removeClass('hidden');
        $('#opcua_content').css('visibility', 'hidden').hide().fadeOut().addClass('hidden');
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

    $('#validateSkill').on('show.bs.modal', function (e) {
        $.getJSON("/getAllSkillOPCUASkills" ,
            function(result) {
                if (result) {
                    gOPCUASkillList = result;
                    $('#selectedSkillOPCUA').empty();
                    for (var prop in result) {
                        const el = result[prop];
                        $('#selectedSkillOPCUA').append($('<option>', {
                            value: prop,
                            text: "" + el.skill.name + " on tcp.opc://" + el.ip + ":" + el.port
                        }));
                    }
                }
            });
        $.getJSON("/getAllSkillKGInstances", { ID: globalKGClientId, parent: { id: '#' } },
            function(result) {
                if (result) {
                    gSkillList = result;
                    $('#selectedSkillKG').empty();
                    for (let i = 0; i < result.length; i++) {
                        const skill_el = result[i];
                        $('#selectedSkillKG').append($('<option>', {
                            value: i,
                            text: skill_el.text
                        }));
                    }
                }
            });
            $('#CompatibilityResults').val('');
    });

    $( "#validateOPCUASkill" ).click(function() {
        // Empty the text area
        $('#CompatibilityResults').val('');
        // Extract the skills objects
        var skill_index = $( "#selectedSkillKG" ).val();
        var opcua_index = $( "#selectedSkillOPCUA" ).val();
        var _skill = gSkillList[skill_index];
        var _opcuaskill = gOPCUASkillList[opcua_index];
        if (_skill && _opcuaskill){
            // Check Type. TODO: Jupiter
            var templateSelector = '#SkillTypeTemplate';
            var context = {
                match: false,
                r_skill: _skill.text,
                i_skill: _opcuaskill.skill.name
            };

            var template = $(templateSelector).html();
            // compile it with Template7
            var compiledTemplate = Template7.compile(template);
            // Now we may render our compiled template by passing required context            
            var html = compiledTemplate(context).replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, "");

            // Matching constraints
            templateSelector = '#MatchingConstraintTemplate';
            context = {
                match: false,
                constraints: []
            };
            template = $(templateSelector).html();
            compiledTemplate = Template7.compile(template);
            html = html + compiledTemplate(context).replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, "");

            // Matching paameters
            templateSelector = '#MatchingParameterTemplate';
            context = {
                match: false,
                in_parameters: _opcuaskill.skillModel.Invokation.Start.parameters.inputArguments,
                out_parameters:_opcuaskill.skillModel.Invokation.GetResult.parameters.outputArguments
            };
            template = $(templateSelector).html();
            compiledTemplate = Template7.compile(template);
            html = html + compiledTemplate(context);

            // render the text
            $('#CompatibilityResults').val(html);
        }else{
            $('#CompatibilityResults').val('Please select a required Skill and an implemented Skill!');
        }
    });
});