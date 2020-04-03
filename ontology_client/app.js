/*#####################################################################################*/
/* General options	
/*#####################################################################################*/
/* eslint no-process-exit: 0 */
"use strict";
Error.stackTraceLimit = Infinity;
var colors = require("colors");
var util = require("util");
var fetch = require('isomorphic-fetch');
var SparqlHttp = require('sparql-http-client')
SparqlHttp.fetch = fetch;
// which endpoint to query
var endpoint = new SparqlHttp({ endpointUrl: 'http://localhost:3800/skill' })

/*#####################################################################################*/
/*WEB Server		
/*#####################################################################################*/

var http = require('http');
var express = require('express'),
    app = module.exports.app = express();
var webserver = http.createServer(app);
var io = require('socket.io').listen(webserver);

app.use(express.static(__dirname + '/public'));

// main application
app.get('/', function(req, res) {
    res.sendfile('public/');
});

// User query
app.get('/query', function(req, res) {
    // Extract querry parametrs
    let query = req.query.query;
    if (query) {
        // run query with promises
        endpoint.selectQuery(query).then(function(res) {

            return res.text()

            // result body of the query
        }).then(function(body) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(body));
            // necessary catch the error
        }).catch(function(err) {
            console.error(err);
        });
    }
});

webserver.listen(1717, function() {
    console.log('######### ==> Web app listening on port 1717.\n'.green);
});



process.title = "OPCUA2OWL on port: " + 1717;
process.on('SIGINT', function() {
    // only work on linux apparently
    console.log("Received server interruption from user ".red.bold);
    console.log("Shutting down ...".red.bold);
    process.exit(0);
});