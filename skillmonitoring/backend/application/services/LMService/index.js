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

var LMInterface = function() {
    this.activated = false;
    this.paramObject = {
        reward: 0,
        possibleActions: [],
        lastAction: null,
        environnement: {
            targetLoad: 0,
            currentLoad: 0,
            maxAvgLoad: 0,
            currentSpeed: 0,
            currentState: 0,
            currentStateDescription: {},
            currentMode: 0
        }
    };
    this.core = null;
    this.connected = false;
};

LMInterface.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "LastManager";
    self.settings.id = self.settings.id || this.app.util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        ip: "192.168.43.1",
        port: 4840,
        serverName: "DEMO",
        socketID: "8548585858",
        core: "Priority",
        coreSettings: {}
    };

    self.app.log.info("MICROSERVICE[" + self.settings.name + "] initialized successfully!");
    return when.resolve();
};

LMInterface.prototype.start = function() {
    var self = this;

    // Initialize the core service
    if (self.settings.modulesetting.core) {
        try {
            var coreModule = require("./" + self.settings.modulesetting.core);
            self.core = new coreModule();
            self.core.init(self.app, self.settings.modulesetting);
        } catch (error) {
            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] core module cannot be initialized. Module: " + self.settings.modulesetting.core + " - Error: " + error);
            console.log(error.stack);
        }
    } else {
        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] No LM Core settings defined");
    }

    // register to the IO EventBus
    self.registerToEventBus();

    self.app.log.info("MICROSERVICE[" + self.settings.name + "] started successfully!");
    return when.resolve();
};
LMInterface.prototype.stop = function() {
    var self = this;

    //Unregister from the IO EventBus

    // Delete the core module
    if (self.core) {
        self.core.clear();
    }
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] stopped successfully!");
    return when.resolve();
};

var sleep = function(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


LMInterface.prototype.selectAndExecuteLMAction = function() {
    var self = this;
    self.paramObject.lastAction = self.paramObject.lastAction || { name: "SC", parameter1: 0, parameter2: 0 };

    // Let the core select an action and execute it
    if (self.connected && self.activated && self.core) {
        // Select a valid action
        self.paramObject.reward = self.core.computeReward(self.paramObject);
        self.core.train(self.paramObject.reward);

        self.app.eventBus.emit("AIReward", self.paramObject.reward);

        let action = null;
        var actionIsValid = false;
        while (actionIsValid === false) {
            action = self.core.selectAction(self.paramObject);
            self.app.log.info("LMCore[" + self.settings.name + "] selected action: " + action.name + ".");
            for (let index = 0; index < self.paramObject.possibleActions.length; index++) {
                const element = self.paramObject.possibleActions[index];
                if (element.hasCause.name === action.name) {
                    actionIsValid = true;
                    break;
                }
            }
            action["isValid"] = actionIsValid;
        }
        self.paramObject.lastAction = action;
        // Execute the action
        if (action) {
            self.app.eventBus.emit("ExecutePLCAction", {
                ip: self.settings.modulesetting.ip,
                port: self.settings.modulesetting.port,
                serverName: self.settings.modulesetting.serverName,
                socketID: self.settings.modulesetting.socketID,
                actionName: action.name,
                parameters: [{
                    dataType: 10, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                    arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                    value: action.parameter1
                }, {
                    dataType: 10, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
                    arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
                    value: action.parameter2
                }]
            });
        }
    }
}

LMInterface.prototype.registerToEventBus = function() {
    var self = this;

    // Serverstatus
    self.app.eventBus.addListener("activateLM", function(data) {
        self.activated = data.activated;
        if (self.activated) {
            self.selectAndExecuteLMAction();
        }
    });

    // Serverstatus
    self.app.eventBus.addListener("serverstatus", function(data) {
        self.connected = data.connection;
    });

    // KPI changed
    self.app.eventBus.addListener("KPIChanged", function(data) {
        // TargetLoad
        if (data.name === "TargetLoad") {
            self.paramObject.environnement.targetLoad = data.value;
        }
        // CurrentLoad
        if (data.name === "CurrentLoad") {
            self.paramObject.environnement.currentLoad = data.value;
        }
        // CurrMachSpeed
        if (data.name === "CurrMachSpeed") {
            self.paramObject.environnement.currentSpeed = data.value;
        }
        // CurrentMode
        if (data.name === "CurrentMode") {
            self.paramObject.environnement.currentMode = data.value;
        }
    });

    self.app.eventBus.addListener("StatesChanged", function(data) {
        const allowedStates = [0, 2, 4, 5, 9, 11, 17, 18, 20, 22, 24];
        // Extract the current state
        self.paramObject.environnement.currentState = data.state.value;
        self.paramObject.environnement.currentStateDescription = data.state;

        // Extract all possible actions
        self.paramObject.possibleActions = [];
        data.transitions.forEach(function(elem) {
            if (elem && elem.hasCause) {
                let enabled = elem.EnableFlag.value;
                if (enabled && enabled === true) {
                    self.paramObject.possibleActions.push(elem);
                }
            }
        });

        // execute the core's desired action
        if (self.activated && allowedStates.includes(data.state.value)) {
            sleep(500).then(() => {
                // Do something after the sleep!
                self.selectAndExecuteLMAction();
            });

        }
    });

    self.app.eventBus.addListener("STATESDescriptionChanged", function(arg) {

    });

    self.app.eventBus.addListener("TRANSITIONDescriptionChanged", function(elem) {
        for (let index = 0; index < self.paramObject.possibleActions.length; index++) {
            const action = self.paramObject.possibleActions[index];
            if (elem.name == action.name) {
                let enabled = elem.EnableFlag.value;
                if (enabled && enabled === true) {
                    self.paramObject.possibleActions[index] = elem;
                    break;
                }
            }
        }
    });
}

module.exports = LMInterface;