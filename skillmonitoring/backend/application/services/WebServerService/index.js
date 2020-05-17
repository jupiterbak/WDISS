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
var KGEnpoints = {};
var kg_enpoints = require("./sparql_endpoint");
var OPCUAClientService = require("./OPCUAClientService");
var gFoundedSkills = {};

var WebServerService = function() {
    this.http = require('http');
    this.express = require('express');
    this.wapp = module.exports.app = this.express();
    this.sockets = {};
    this.connectionMsg = {};

    this.lastStateChangeEvent = {};
    this.lastResultTriggerChangeEvent = {};

    this.lastKPIChangedEvent = {};
    this.lastSTATESDescriptionChangedEvent = null;
    this.lastTRANSITIONDescriptionChangedEvent = null;
    this.opcuaclientservice = new OPCUAClientService();

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
        socket.emit("skillModels", gFoundedSkills);
        // Get KGEndponts
        var end_points = [];
        for (var prop in KGEnpoints) {
            var el = KGEnpoints[prop];
            end_points.push({ip:el.ip, port:el.port});
        }
        
        socket.emit("KGConnected", end_points);
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
    this.wapp.use(self.express.static(__dirname + '/public'));
    this.wapp.use(self.sessionMiddleware);

    // Initialize the opc ua Client service
    this.opcuaclientservice.init(self.app, self, self.settings.opcuaclient);
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};

WebServerService.prototype.start = function() {
    var self = this;

    // Initialize the OPCUA Client Service
    self.opcuaclientservice.start();

    self.wapp.get('/getAllSkillOPCUASkills', function(req, res) {        
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(gFoundedSkills));
    });

    self.wapp.get('/ExecuteMethod', function(req, res) {
        let action = JSON.parse(req.query.action);
        self.opcuaclientservice.ExecuteMethod(action, function(err, results) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ err: err, results: results }));
        });
    });

    self.wapp.get('/monitorResultTrigger', function(req, res) {
        let node = JSON.parse(req.query.node);
        self.opcuaclientservice.monitorResultTrigger(node, self, function(err, results) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ err: err, results: results }));
        });
    });

    self.wapp.get('/writeVariable', function(req, res) {
        let variable = JSON.parse(req.query.action);

        self.opcuaclientservice.WriteVariable(variable, function(err, results) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ err: err, results: results }));
        });
    });

    self.wapp.get('/connect', function(req, res) {
        let params = JSON.parse(req.query.parameter);
        self.opcuaclientservice.ConnectPLC(params, self, function(err, client, results) {
            // SockeiIO feedback
            self.emitAll("serverstatus", self.connectionMsg);
            self.emitAll("skillModels", gFoundedSkills);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ err: err, results: results }));
        });
    });

    // Configure Knowledege Base Endpoints
    self.wapp.get('/connectKG', function(req, res) {
        let kg_ip = req.query.ip;
        let kg_port = req.query.port;
        var _endpoint = new kg_enpoints(kg_ip, kg_port);
        KGEnpoints["" + _endpoint.ID] = _endpoint;

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ err: null, ID: "" + _endpoint.ID }));
    });

    self.wapp.get('/getAllProcess', function(req, res) {
        var ID = req.query.ID;
        var parentID = req.query.parent.id;
        var _endpoint = KGEnpoints[ID];
        if (_endpoint) {
            if (parentID && parentID === "#") {
                _endpoint.getAllProcess(res);
            } else {
                _endpoint.getChildBySubType(res, parentID);
            }
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify([]));
        }
    });

    self.wapp.get('/getAllProduct', function(req, res) {
        var ID = req.query.ID;
        var parentID = req.query.parent.id;
        var _endpoint = KGEnpoints[ID];
        if (_endpoint) {
            if (parentID && parentID === "#") {
                _endpoint.getAllProduct(res);
            } else {
                _endpoint.getChildBySubType(res, parentID);
            }
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify([]));
        }
    });

    self.wapp.get('/getAllResource', function(req, res) {
        var ID = req.query.ID;
        var _endpoint = KGEnpoints[ID];
        var parentID = req.query.parent.id;
        if (_endpoint) {
            if (parentID && parentID === "#") {
                _endpoint.getAllResource(res);
            } else {
                _endpoint.getChildBySubType(res, parentID);
            }

        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify([]));
        }
    });

    self.wapp.get('/getChildBySubType', function(req, res) {
        var ID = req.query.ID;
        var parentID = req.query.parentID;

        var _endpoint = KGEnpoints[ID];
        if (_endpoint) {
            _endpoint.getChildBySubType(res, parentID);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify([]));
        }
    });

    self.wapp.get('/getAllSkillKGInstances', function(req, res) {
        var ID = req.query.ID;
        var _endpoint = KGEnpoints[ID];
        var parentID = req.query.parent.id;
        if (_endpoint) {
            if (parentID && parentID === "#") {
                _endpoint.getAllSkillInstances(res);
            } else {
                _endpoint.getChildBySubType(res, parentID);
            }            
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify([]));
        }
    });

    // Start the webserver
    self.webServer.listen(self.settings.uiPort, function() {
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] ######### ==> Web app listening on port " + self.settings.uiPort + ".");
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] started successfully.");
    });
    return when.resolve();
};
WebServerService.prototype.stop = function() {
    var self = this;
    // Initialize the OPCUA Client Service
    self.opcuaclientservice.stop();
    self.webServer.close();
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] ######### ==> Web app stopped listening on port 8080.");
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};

WebServerService.prototype.emit = function(eventID, data) {
    var self = this;
    if (eventID === "PLCConnected") {
        self.connectionMsg["" + data.ip + "_" + data.port]  = data;
        self.emitAll("serverstatus", data);
    } else if (eventID === "PLCDisconnected") {
        self.connectionMsg["" + data.ip + "_" + data.port]  = data;
        self.emitAll("serverstatus", data);
    } else if (eventID === "serverstatus") {
        self.connectionMsg["" + data.ip + "_" + data.port]  = data;
        self.emitAll("serverstatus", data);
    } else if (eventID === "skillModelFounded") {
        gFoundedSkills["" + data.ip + "_" + data.port + "_" + data.skill.name] = data;
        self.emitAll("skillModels", gFoundedSkills);
    } else if (eventID === "StatesChanged") {
        self.lastStateChangeEvent["" + data.ip + "_" + data.port + "_"  + data.state.ID] = data;
        self.emitAll("StatesChanged", self.lastStateChangeEvent);
    } else if (eventID === "ResultTriggerChanged") {
        self.lastResultTriggerChangeEvent["" + data.ip + "_" + data.port + "_"  + data.node.ns + "_" + data.node.nid] = data;
        self.emitAll("ResultTriggerChanged", self.lastResultTriggerChangeEvent);
    } else if (eventID === "KPIChanged") {
        self.lastKPIChangedEvent["" + data.ip + "_" + data.port + "_" + data.name] = data;
        self.emitAll("KPIChanged", self.lastKPIChangedEvent);
    } else if (eventID === "STATESDescriptionChanged") {
        self.lastSTATESDescriptionChangedEvent = data;
        self.emitAll("STATESDescriptionChanged", data);
    } else if (eventID === "TRANSITIONDescriptionChanged") {
        self.emitAll("TRANSITIONDescriptionChanged", data);
        self.lastTRANSITIONDescriptionChangedEvent = data;
    }

    self.app.log.info("MICROSERVICE[" + self.settings.name + "] Socket IO Event: " + eventID);
};

WebServerService.prototype.emitAll = function(eventID, data) {
    this.io.emit(eventID, data);
};

module.exports = WebServerService;