/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/

$(function() {

    "use strict";

    //Make the dashboard widgets sortable Using jquery UI
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });
    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

    //jQuery UI sortable for the todo list
    $(".todo-list").sortable({
        placeholder: "sort-highlight",
        handle: ".handle",
        forcePlaceholderSize: true,
        zIndex: 999999
    });

    /* jQueryKnob */
    //$(".knob").knob();

    //Fix for charts under tabs
    $('.box ul.nav a').on('shown.bs.tab', function() {
        area.redraw();
        donut.redraw();
        line.redraw();
    });

    var editor2 = CodeMirror.fromTextArea(document.getElementById("query_results"), {
        tabMode: "indent",
        matchBrackets: true,
        tabSize: 5,
        lineNumbers: true
    });

    var editor = CodeMirror.fromTextArea(document.getElementById("query_text"), {
        mode: "application/x-sparql-query",
        tabMode: "indent",
        matchBrackets: true,
        tabSize: 5,
        lineNumbers: true
    });

    /** BTN Handling **/
    $('#querry_submit').click(function() {
        $.get("/query", {
                query: editor.getValue()
            },
            function(data) {
                editor2.setValue(data);
                //$("#query_results").val(data);
            }
        ).fail(function() {
            $("#query_results").val("Error while executing query!");
        });
    });
});