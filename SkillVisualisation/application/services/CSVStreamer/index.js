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
var csv = require("fast-csv");
var fs = require("fs");


var CSVModuleInterface = function() {
    this.lastValue = {
        "targetLoad": 0,
        "currentLoad": 0,
        "currentSpeed": 0,
        "currentMode": 0,
        "currentState": 0,
        "AIReward": 0,
        "timestamp": new Date().getTime()
    };
    this.csvStream = null;
    this.writableStream = null;
    this.labelOption = "normal_90_cost";
    this.WriteInterval = null;
};

CSVModuleInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "CSVStreamer";
    self.settings.id = self.settings.id || this.app.util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {};

    // First create the csv stream
    self.csvStream = csv.createWriteStream({ headers: true });
    self.writableStream = fs.createWriteStream("./Data/log_" + self.labelOption + "_" + Date.now() + ".csv");
    self.writableStream.on("finish", function() {
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] logging done!");
    });
    self.writableStream.on('error', function(err) {
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] logging error: " + err);
    });

    self.csvStream.pipe(self.writableStream);

    self.app.log.info("MICROSERVICE[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};
CSVModuleInterface.prototype.start = function() {
    var self = this;
    // KPI changed
    self.app.eventBus.addListener("KPIChanged", function(data) {
        // TargetLoad
        if (data.name === "TargetLoad") {
            self.lastValue["targetLoad"] = data.value;
        }
        // CurrentLoad
        if (data.name === "CurrentLoad") {
            self.lastValue["currentLoad"] = data.value;
        }
        // CurrMachSpeed
        if (data.name === "CurrMachSpeed") {
            self.lastValue["currentSpeed"] = data.value;
        }
        // CurrentMode
        if (data.name === "CurrentMode") {
            self.lastValue["currentMode"] = data.value;
        }
        self.lastValue["timestamp"] = new Date().getTime();
    });

    self.app.eventBus.addListener("StatesChanged", function(data) {
        // Extract the current state
        self.lastValue["currentState"] = data.state.value;
        //self.paramObject.environnement.currentStateDescription = data.state;
        self.lastValue["timestamp"] = new Date().getTime();
    });

    self.app.eventBus.addListener("STATESDescriptionChanged", function(arg) {
        // ???
    });

    self.app.eventBus.addListener("AIReward", function(data) {
        self.lastValue["AIReward"] = data;
        self.lastValue["timestamp"] = new Date().getTime();
    });

    self.WriteInterval = setInterval(function() {
        self.csvStream.write(self.lastValue);
    }, 100);

    self.app.log.info("MICROSERVICE[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
CSVModuleInterface.prototype.stop = function() {
    var self = this;
    // Remove all listeners
    self.writableStream.end();
    self.csvStream.close();

    if (self.WriteInterval != null) {
        clearInterval(self.WriteInterval);
        self.WriteInterval = null;
    }

    self.app.log.info("MICROSERVICE[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};
CSVModuleInterface.prototype.getSettings = function() {
    var self = this;
    return self.settings
};

module.exports = CSVModuleInterface;