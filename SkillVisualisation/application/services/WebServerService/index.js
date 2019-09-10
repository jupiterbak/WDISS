/**
 * Copyright 2018 Siemens AG.
 * 
 * File: LEMS.js
 * Project: SP 164
 * Author:
 *  - Jupiter Bakakeu
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * --------------------------------------------------------------------
 * ###################### Changes #####################################
 * -- 10.02.2018
 *      Initial implementation
 * --------------------------------------------------------------------
 **/

var when = require('when');
var util = require("util");


var WebServerService = function() {
    this.http = require('http');
    this.express = require('express');
    this.wapp = module.exports.app = this.express();
    this.sockets = {};
    this.connectionMsg = {
        msg: "Not connected",
        ip: "0.0.0.0",
        port: "4840",
        connection: false
    };

    this.lastStateChangeEvent = {
        state: { name: 'Stopped' },
        transitions: []
    };

    this.lastKPIChangedEvent = {};
    this.lastSTATESDescriptionChangedEvent = null;
    this.lastTRANSITIONDescriptionChangedEvent = null;
};

WebServerService.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;

    // Initialize the webserver
    this.webServer = this.http.createServer(this.wapp);

    // Initialize the socket IO chanel
    this.io = require('socket.io').listen(this.webServer);
    this.io.on('connection', function(socket) {
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] ######### ==> new Socket IO Connection.");
        self.sockets[socket.id.replace("/#", "")] = socket;
        socket.emit("connected", socket.id.replace("/#", ""));
        socket.emit("serverstatus", self.connectionMsg);
        socket.emit("StatesChanged", self.lastStateChangeEvent);
        socket.emit("KPIChanged", self.lastKPIChangedEvent);
        socket.emit("STATESDescriptionChanged", self.lastSTATESDescriptionChangedEvent);
        socket.emit("TRANSITIONDescriptionChanged", self.lastTRANSITIONDescriptionChangedEvent);

        socket.on('disconnect', function() {
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] ######### ==> Socket IO Disconnection: " + socket.id + ".");
        });
    });
    this.session = require('express-session');
    this.sessionMiddleware = this.session({
        secret: '4u83ur983hjfhj4e9fh4ehdp',
        resave: false,
        saveUninitialized: true
    });

    this.io.use(function(socket, next) {
        self.sessionMiddleware(socket.request, socket.request.res, next);
    });

    // Configure the webserver
    this.wapp.disable('x-powered-by');
    this.wapp.use(self.express.static('public'));
    this.wapp.use('/static', self.express.static(__dirname + '/public'));
    this.wapp.use(self.sessionMiddleware);


    self.app.log.info("MICROSERVICE[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};

WebServerService.prototype.start = function() {
    var self = this;

    self.wapp.get('/', function (req, res) {
        res.send('Hello World!');
      });

    self.wapp.get('/executeAction', function(req, res) {
        let action = JSON.parse(req.query.action);
        self.app.eventBus.emit("ExecutePLCAction", action);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ err: null }));
    });

    self.wapp.get('/writeVariable', function(req, res) {
        let variable = JSON.parse(req.query.action);


        self.app.eventBus.emit("WriteVariable", variable);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ err: null }));
    });

    self.wapp.get('/connect', function(req, res) {
        let params = JSON.parse(req.query.parameter);

        self.app.eventBus.emit("ConnectPLC", params);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ err: null }));
    });

    // Start the webserver
    self.webServer.listen(self.settings.uiPort, function() {
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] ######### ==> Web app listening on port "+ self.settings.uiPort +".");
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] started successfully.");
    });

    // Listen  to the EventBus
    self.app.eventBus.addListener("serverstatus", function(arg) {
        self.connectionMsg = arg;
        self.emitAll("serverstatus", arg);
    });
    self.app.eventBus.addListener("StatesChanged", function(arg) {
        self.emitAll("StatesChanged", arg);
        self.lastStateChangeEvent = arg;
    });
    self.app.eventBus.addListener("KPIChanged", function(arg) {

        self.lastKPIChangedEvent[arg.name] = arg;
        self.emitAll("KPIChanged", self.lastKPIChangedEvent);
    });
    self.app.eventBus.addListener("STATESDescriptionChanged", function(arg) {
        self.emitAll("STATESDescriptionChanged", arg);
        self.lastSTATESDescriptionChangedEvent = arg;
    });
    self.app.eventBus.addListener("TRANSITIONDescriptionChanged", function(arg) {
        self.emitAll("TRANSITIONDescriptionChanged", arg);
        self.lastTRANSITIONDescriptionChangedEvent = arg;
    });
    return when.resolve();
};
WebServerService.prototype.stop = function() {
    var self = this;
    this.webServer.close();
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] ######### ==> Web app stopped listening on port 8080.");
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};

WebServerService.prototype.emitAll = function(eventID, data) {
    var self = this;
    this.io.emit(eventID, data);
};

module.exports = WebServerService;