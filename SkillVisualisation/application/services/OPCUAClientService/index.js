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
var async = require("async");
var opcua = require("node-opcua");
var NodeId = opcua.NodeId;

var DAISYOPCClientManager = require('./OPCUAClient/DAISYOPCClientManager');

var OPCUAClientInterface = function() {};
OPCUAClientInterface.prototype.init = function(_app, _settings) {
    var self = this;
    this.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "OPC UA Client Manager";
    self.settings.id = self.settings.id || this.app.util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        interval: 10,
        ip: "localhost",
        port: 48020,
        defaultObjectModel: { CURRENT_STATES: [], STATES: [], KPI: [], ACTIONS: [] }
    };
    self.settings.defaultObjectModel = self.settings.defaultObjectModel || {};

    self.started = false;
    self.manager = new DAISYOPCClientManager(self.app.eventBus);
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] initialized successfully!");
};
OPCUAClientInterface.prototype.start = function() {
    var self = this;
    if (self.started) {
        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] already started !");
        return when.resolve();
    }

    subscribeToEventBus(self.app.eventBus, self, function(err) {
        if (err) {
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] could not start: " + err);
            self.stop();
            self.started = false;
        } else {
            self.started = true;
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started successfully!");
        }
    });

    return when.resolve();
};
OPCUAClientInterface.prototype.stop = function() {
    var self = this;
    unSubscribeToEventBus(self.app.eventBus, self, function(err) {
        self.started = false;
        self.manager.close(function(err) {
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] stopped successfully!");
        });
    });

    return when.resolve();
};

function monitorServerInformationModel(bus, self, client, fCallBack) {
    async.series([
        function(callback) { // Monitor the current state Machines
            var ii = 0;
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring CURRENT STATES.");
            self.settings.modulesetting.defaultObjectModel.CURRENT_STATES.forEach(function(el) {
                if (el.nodeId && client) {
                    client.monitorNode(el.nodeId.ns, el.nodeId.nid, el.name, el.interval, function(err) {
                        if (err) {
                            self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not monitor item [" + el.name + "] - [" + el.nodeId.ns + ":" + el.nodeId.nid + "]: " + err);
                        }
                    }, function(dataValue) {
                        if (dataValue.value) {
                            el["value"] = dataValue.value.value;
                            self.settings.modulesetting.defaultObjectModel.CURRENT_STATE_VALUE = dataValue.value.value;
                        } else {
                            el["value"] = 1;
                            self.settings.modulesetting.defaultObjectModel.CURRENT_STATE_VALUE = 1;
                        }
                        //TODO Optimize SocketIO Communication
                        // Wait 500 ms to get all notification changes before sending the result
                        if (self.started) {
                            setTimeout(function() {
                                // Collect all transitions that are enabled
                                let transitions = [];
                                let transitionsObj = self.settings.modulesetting.defaultObjectModel.TRANSITIONS;
                                for (const key in transitionsObj) {
                                    if (transitionsObj.hasOwnProperty(key)) {
                                        const trans = transitionsObj[key];
                                        if (trans.EnableFlag) {
                                            //if (trans.EnableFlag.value) {
                                            transitions.push(trans);
                                            //}
                                        }
                                    }
                                }

                                self.app.eventBus.emit("StatesChanged", {
                                    state: el,
                                    transitions: transitions
                                });
                            }, 500);
                        }
                        //self.app.eventBus.emit("StatesChanged", self.settings.modulesetting.defaultObjectModel);
                    });
                }
                ii++;
            });
            callback();
        },
        function(callback) { // Monitor KPI
            var iii = 0;
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring KPIS.");
            self.settings.modulesetting.defaultObjectModel.KPI.forEach(function(el) {
                if (el.nodeId && client) {
                    client.monitorNode(el.nodeId.ns, el.nodeId.nid, el.name, 20, function(err) { //el.interval
                        if (err) {
                            self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not monitor item [" + el.name + "] - [" + el.nodeId.ns + ":" + el.nodeId.nid + "]: " + err);
                        }
                    }, function(dataValue) {
                        if (dataValue.value) {
                            el["value"] = dataValue.value.value;
                        }

                        if (self.started) self.app.eventBus.emit("KPIChanged", el);
                    });
                }
                iii++;
            });
            callback();
        },
        function(callback) { // Monitor all STATES DESCRIPTIONS
            var iiii = 0;
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring possibles STATES.");
            let statesObj = self.settings.modulesetting.defaultObjectModel.STATES;
            for (const key in statesObj) {
                if (statesObj.hasOwnProperty(key)) {
                    const eState = statesObj[key];
                    //Monitors Properties and Variable of this state
                    for (const key_ in eState) {
                        if (eState.hasOwnProperty(key_) && key_ != "name" && key_ !== "nodeId" && key_ !== "type" && key_ !== "parent" && key_ !== "interval" && key_ !== "hasCause") {
                            const eStateProp = eState[key_];
                            if (eStateProp.type === "Variable") {
                                client.monitorNode(eStateProp.nodeId.ns, eStateProp.nodeId.nid, eStateProp.name, eStateProp.interval, function(err) {
                                    if (err) {
                                        self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not monitor item [" + eStateProp.name + "] - [" + eStateProp.nodeId.ns + ":" + eStateProp.nodeId.nid + "]: " + err);
                                    }
                                }, function(dataValue) {
                                    if (dataValue.value) {
                                        eStateProp["value"] = dataValue.value.value;
                                    }
                                    if (self.started && self.settings.modulesetting.defaultObjectModel.CURRENT_STATE_VALUE) { // === eState.StateNumber.value) {
                                        self.app.eventBus.emit("STATESDescriptionChanged", eState);
                                    }
                                });
                            }

                        }
                    }

                }
            }
            callback();
        },
        function(callback) { // Monitor all TRANSITION DESCRIPTIONS
            var iiii = 0;
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring possibles TRANSITIONS.");
            let transitionObj = self.settings.modulesetting.defaultObjectModel.TRANSITIONS;
            for (const key in transitionObj) {
                if (transitionObj.hasOwnProperty(key)) {
                    const eTransition = transitionObj[key];
                    //Monitors Properties and Variable of this state
                    for (const key_ in eTransition) {
                        if (eTransition.hasOwnProperty(key_) && key_ != "name" && key_ !== "nodeId" && key_ !== "type" && key_ !== "parent" && key_ !== "interval" && key_ !== "hasCause") {
                            const eTransitionProp = eTransition[key_];
                            if (eTransitionProp.type === "Variable") {
                                client.monitorNode(eTransitionProp.nodeId.ns, eTransitionProp.nodeId.nid, eTransitionProp.name, eTransitionProp.interval, function(err) {
                                    if (err) {
                                        self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not monitor item [" + eTransitionProp.name + "] - [" + eTransitionProp.nodeId.ns + ":" + eTransitionProp.nodeId.nid + "]: " + err);
                                    }
                                }, function(dataValue) {
                                    if (dataValue.value) {
                                        eTransitionProp["value"] = dataValue.value.value;
                                    }
                                    if (eTransition.EnableFlag) {
                                        if (self.started) {
                                            self.app.eventBus.emit("TRANSITIONDescriptionChanged", eTransition);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
            callback();
        }
    ], function(err) {
        fCallBack(err);
    });
}

// function monitorStateTransitions(stateName, bus, self, client, fCallBack) {
//     async.series([
//         function(callback) { // UnMonitor the old states transitions data
//             if (self.settings.modulesetting.defaultObjectModel.STATES_MONITORING[stateName]) {
//                 let objStateMon = self.settings.modulesetting.defaultObjectModel.STATES_MONITORING[stateName];

//                 for (const key in objStateMon) {
//                     if (objStateMon.hasOwnProperty(key) && (key === "") && (key === "") && (key === "")) {
//                         const el = objStateMon[key];
//                         client.unmonitorNode(el.nodeId.ns, el.nodeId.nid, function(err) {
//                             if (err) {
//                                 self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not unmonitor item [" + el.name + "] - [" + el.nodeId.ns + ":" + el.nodeId.nid + "]: " + err);
//                             }
//                         });
//                     }
//                 }
//             }
//             callback();
//         },
//         function(callback) { // Monitor the new state
//             if (self.settings.modulesetting.defaultObjectModel.STATES_MONITORING[stateName]) {
//                 let objStateMon = self.settings.modulesetting.defaultObjectModel.STATES_MONITORING[stateName];
//                 for (const key in objStateMon) {
//                     if (objStateMon.hasOwnProperty(key) && (key === "") && (key === "") && (key === "")) {
//                         const el = objStateMon[key];
//                         if (el.nodeId && client) {
//                             client.monitorNode(el.nodeId.ns, el.nodeId.nid, el.name, el.interval, function(err) {
//                                 if (err) {
//                                     self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not monitor item [" + el.name + "] - [" + el.nodeId.ns + ":" + el.nodeId.nid + "]: " + err);
//                                 }
//                             }, function(dataValue) {
//                                 el["value"] = dataValue.value.value;
//                                 if (self.started) self.app.eventBus.emit("KPIChanged", self.settings.modulesetting.defaultObjectModel);
//                             });
//                         }
//                     }
//                 }
//             }
//             callback();
//         },
//         function(callback) { // Publish changes

//             callback();
//         }
//     ], function(err) {
//         fCallBack(err);
//     });
// }


function subscribeToEventBus(bus, self, fCallBack) {
    var client = null;
    // Connect PLC
    self.app.eventBus.addListener("ConnectPLC", function(arg) {
        if (arg.ip && arg.socketID && arg.port && arg.serverName) async.series([
            function(callback) { // Get the client
                client = self.manager.getClient(self.manager.getClientID(arg.ip, arg.port, arg.serverName, arg.socketID));
                if (client) {
                    self.app.log.warn("MICROSERVICE[" + self.settings.name + "] client already exist.");
                    callback({ errorCode: 0 });
                } else {
                    client = self.manager.addNewOPCClient(arg.ip, arg.port, arg.serverName, arg.socketID);
                    self.app.log.info("MICROSERVICE[" + self.settings.name + "] new client initialized.");
                    callback();
                }

            },
            function(callback) { // Connect the client to the server
                if (client.connected === false) {
                    client.connect(arg.ip, arg.port, arg.serverName, arg.socketID, function(err) {
                        if (err) {
                            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] new client could connect to server: " + client.url);
                            callback(err);
                        } else {
                            self.app.log.info("MICROSERVICE[" + self.settings.name + "] new client connected to server: " + client.url);
                            self.app.eventBus.emit("PLCConnected", arg);
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            },
            function(callback) { // Check the server information model
                // Check Server Model
                checkServerModel(bus, self, client, arg, function(err) {
                    if (err) {
                        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] PLC Server is not compatible to LEMS.");
                        callback(err);
                    } else {
                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] PLC Server is compatible with Information model. Client will start monitoring.");
                        callback();
                    }
                });
            },
            function(callback) { // Monitor the PLC assuming that it is compatible to our model
                monitorServerInformationModel(bus, self, client, function(err) {
                    if (err) {
                        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] PLC Server Information model could not be monitored.");
                        callback(err);
                    } else {
                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] PLC Server Information model is being monitored.");
                        callback();
                    }
                });
            }
        ], function(err) {
            if (err) {
                if (err.errorCode > 0) fCallBack(err);
            }
        });
    });

    // Disconnect PLC
    self.app.eventBus.addListener("DisconnectPLC", function(arg) {
        //Initialize a new client
        if (arg.ip && arg.socketID && arg.port && arg.serverName) {
            var client = manager.getClient(manager.getClientID(arg.ip, arg.port, arg.serverName, arg.socketID));
            if (client) {
                if (client.connected === true) {
                    client.disconnect(function(err) {
                        if (err) {
                            self.app.log.info("MICROSERVICE[" + self.settings.name + "] client could disconnect from server.");
                        } else {
                            self.app.log.info("MICROSERVICE[" + self.settings.name + "] client disconnected from server.");
                            self.app.eventBus.emit("PLCDisconnected", arg);
                        }
                    });
                }
            } else {
                self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not disconnect client.");
            }
        }
    });

    // SeverStatus
    self.app.eventBus.addListener("serverstatus", function(arg) {});

    // ExecuteAction
    self.app.eventBus.addListener("ExecutePLCAction", function(arg) {
        //Initialize a new client
        if (arg.ip && arg.socketID && arg.port && arg.serverName && arg.actionName) {
            var client = self.manager.getClient(self.manager.getClientID(arg.ip, arg.port, arg.serverName, arg.socketID));
            if (client) {
                if (client.connected === true) {
                    var action = null;
                    for (var i = 0; i < self.settings.modulesetting.defaultObjectModel.ACTIONS.length; i++) {
                        if (self.settings.modulesetting.defaultObjectModel.ACTIONS[i].name === arg.actionName) {
                            action = self.settings.modulesetting.defaultObjectModel.ACTIONS[i];
                            break;
                        }
                    }
                    if (action) {
                        async.series(
                            [
                                // Set the target load variable if the action is start or load change
                                function(callback) {
                                    if (arg.actionName === "ChangeLoad" || arg.actionName === "Start") {
                                        // Initialize the parameters
                                        let targetLoadAC = arg.parameters[0].value;
                                        let targetLoadDC = arg.parameters[1].value;

                                        // Initialize the parameters
                                        let _variable = null;
                                        for (let i = 0; i < self.settings.modulesetting.defaultObjectModel.KPI.length; i++) {
                                            const element = self.settings.modulesetting.defaultObjectModel.KPI[i];
                                            if (element.name === "TargetLoad") {
                                                _variable = element;
                                            }
                                        }
                                        if (_variable) {
                                            let _value = {
                                                value: { /* Variant */
                                                    dataType: opcua.DataType.Float,
                                                    value: targetLoadAC
                                                }
                                            };

                                            client.write(_variable.nodeId.ns, _variable.nodeId.nid, _value, function(err, statusCode) {
                                                if (err) {
                                                    self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not write variable [" + arg.name + "] : " + err);
                                                } else {
                                                    self.app.log.error("MICROSERVICE[" + self.settings.name + "] write variable executed with : " + statusCode);
                                                }
                                            });
                                        }
                                    }
                                    callback();
                                },
                                function(callback) {
                                    if (action.objectId && action.methodId && client) {
                                        // Initialize the parameters
                                        var inputArguments = [];
                                        if (arg.parameters) {
                                            var k = 0;
                                            arg.parameters.forEach(function(el) {
                                                inputArguments.push({
                                                    dataType: arg.parameters[k].dataType || el.dataType, //DataType.Double,
                                                    arrayType: arg.parameters[k].arrayType || el.arrayType, //VariantArrayType.Scalar,
                                                    value: arg.parameters[k].value || el.defaultValue
                                                });
                                                k++;
                                            });
                                        }

                                        client.callMethod(action.objectId.ns, action.objectId.nid, action.methodId.ns, action.methodId.nid, inputArguments, function(err, response) {
                                            if (err) {
                                                self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not execute action [" + arg.actionName + "] : " + err);
                                            } else {
                                                if (response[0].statusCode == 0) {
                                                    /*
                                                        UseCase:
                                                        Walze --> 1. Antrieb Haupantrieb
                                                                  2. Antrieb Versorgung

                                                    */
                                                    // TODO: Check the Feedback if the method triggers any state change
                                                    if (response[0].outputArguments.length > 0) {
                                                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] executed action [" + arg.actionName + "] successfully. The result is :" + response[0].outputArguments[0].value);
                                                    } else {
                                                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] executed action [" + arg.actionName + "] successfully with errorCode: " + response[0].statusCode);
                                                    }

                                                    self.app.eventBus.emit("PLCActionExecuted", arg);
                                                } else {
                                                    self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not execute action [" + arg.actionName + "] with errorCode: " + response[0].statusCode);
                                                }
                                            }
                                        });
                                    }
                                    callback();
                                }
                            ],
                            function(err) {

                            });
                    }
                }
            } else {
                self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not execute action. Client is disconnected.");
            }
        }
    });

    // WriteVariable
    self.app.eventBus.addListener("WriteVariable", function(arg) {
        let _variable = null;
        for (let i = 0; i < self.settings.modulesetting.defaultObjectModel.KPI.length; i++) {
            const element = self.settings.modulesetting.defaultObjectModel.KPI[i];
            if (element.name === arg.name) {
                _variable = element;
            }
        }

        if (_variable) {
            if (arg.ip && arg.socketID && arg.port && arg.serverName) {
                var client = self.manager.getClient(self.manager.getClientID(arg.ip, arg.port, arg.serverName, arg.socketID));
                if (client) {
                    if (client.connected === true) {
                        async.series(
                            [
                                function(callback) { // Write Data to the PLC
                                    if (_variable.nodeId) {
                                        // Initialize the parameters
                                        let _value = {
                                            value: { /* Variant */
                                                dataType: opcua.DataType.Float,
                                                value: arg.value
                                            }
                                        };



                                        client.write(_variable.nodeId.ns, _variable.nodeId.nid, _value, function(err, statusCode) {
                                            if (err) {
                                                self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not write variable [" + arg.name + "] : " + err);
                                            } else {
                                                self.app.log.error("MICROSERVICE[" + self.settings.name + "] write variable executed with : " + statusCode);
                                            }
                                        });
                                    }
                                    callback();
                                }
                            ],
                            function(err) {

                            });
                    }
                } else {
                    self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not write variable. Client is disconnected.");
                }
            }
        }
    });
    fCallBack(null);
}

function unSubscribeToEventBus(bus, self, fCallBack) {
    //self.app.eventBus.removeAllListeners();
    fCallBack(null);
}

function checkServerModel(bus, self, client, arg, fCallBack) {
    var rslts = [];
    async.series([
            function(callback) { // Check if a PackMLObject exist
                self.app.log.warn("MICROSERVICE[" + self.settings.name + "] Client starts parsing PLC information model....");
                getPackMLObject(client, { ns: 0, nid: 85 },
                    rslts).then(
                    function(foundedObjects) {
                        if (foundedObjects.length > 0) {
                            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] Client found a EFLEX LObject with the nodeId: " + JSON.stringify(foundedObjects[0]));
                            rslts = foundedObjects;
                            callback();
                        } else {
                            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] No PACKMLObject exists in the PLC information model.");
                            callback("");
                        }
                    });
            },
            function(callback) {
                let ObjModel = {};
                if (rslts.length > 0) {
                    parseEFlexObject(client, {
                            ns: rslts[0].namespace,
                            nid: rslts[0].value
                        }, ObjModel, self.settings.modulesetting.defaultObjectModel)
                        .then(
                            function(parsedModel) {
                                self.app.log.info("MICROSERVICE[" + self.settings.name + "] Client validated the EFLEX Object and extracted STATES, KPI and METHODS successfully.");
                                //console.log(JSON.stringify(parsedModel));
                                callback();
                            }
                        );
                }

            }
        ],
        function(err) {
            fCallBack(err);
        });
}

async function getPackMLObject(client, nodeId, rslts) {

    return await new Promise((resolve, reject) => {
        client.browseNode(nodeId.ns, nodeId.nid, function(err, browse_results) {
            if (err) {
                reject(err);
            } else {
                if (browse_results[0].statusCode.value !== 0) {
                    reject({ msg: "Bad status code", statusCode: browse_results[0].statusCode });
                } else {
                    resolve(browse_results[0].references);
                }
            }
        });
    }).then(async function(references) {
        let _rslts = rslts || [];
        for (let i = 0; i < references.length; i++) {
            var desc = references[i];
            try {
                let founded = await isPackMLBaseObjectType(client, { ns: desc.nodeId.namespace, nid: desc.nodeId.value });
                if (founded) {
                    _rslts.push(desc.nodeId);
                } else {
                    await getPackMLObject(client, { ns: desc.nodeId.namespace, nid: desc.nodeId.value }, _rslts);
                }
            } catch (err) {
                return _rslts;
            }
        }
        return _rslts;
    });


}

function isPackMLBaseObjectType(client, nodeId) {
    return new Promise((resolve, reject) => {
        let founded = false;
        client.browseNodeByReferenceType(nodeId.ns, nodeId.nid, "HasTypeDefinition", async function(type_err, type_browse_results) {
            if (type_err) {
                reject(type_err);
            } else {
                if (type_browse_results[0].statusCode.value !== 0) {
                    reject(type_err);
                } else {
                    for (let k = 0; k < type_browse_results[0].references.length; k++) {
                        const element = type_browse_results[0].references[k];
                        const NodeClass = element.nodeClass;

                        // Check if type is PackMLBaseMachineType
                        if (element.nodeId.namespace === client.getNamespaceIndexOfURI("http://siemens.com/PackML_Eflex/") && element.nodeId.value === 1007) {
                            founded = true;
                            break;
                        }
                    }
                    resolve(founded);
                }
            }
        });
    });
}

function getOpcUAType(client, nodeId) {
    return new Promise((resolve, reject) => {
        let founded = false;
        client.browseNodeByReferenceType(nodeId.ns, nodeId.nid, "HasTypeDefinition", async function(type_err, type_browse_results) {
            if (type_err) {
                reject(type_err);
            } else {
                if (type_browse_results[0].statusCode.value !== 0) {
                    reject(type_err);
                } else {
                    resolve(type_browse_results[0].references[0]);
                }
            }
        });
    });
}

async function getGetAllSuperTypes(client, nodeId, rslts) {
    let _rslts = rslts || [];
    return await client.browseNodeByReferenceTypAndDirection(nodeId.ns, nodeId.nid, 1, "HasSubtype")
        .then(async function(references) {
            let containsBaseObjectType = false;
            for (let i = 0; i < references[0].references.length; i++) {
                let ref = references[0].references[i];
                _rslts.push(ref);
                containsBaseObjectType = (ref.browseName.name === "BaseObjectType");
            }
            if (containsBaseObjectType) {
                return _rslts;
            } else {
                for (let i = 0; i < references[0].references.length; i++) {
                    let ref = references[0].references[i];
                    let rslts_list = await getGetAllSuperTypes(client, {
                        ns: ref.nodeId.namespace,
                        nid: ref.nodeId.value
                    }, _rslts);
                    _rslts.concat(rslts_list);
                }
                return _rslts;
            }
        }, function(err) {
            return _rslts;
        });
}

async function superTypeContainsStateMachineType(types) {
    for (let index = 0; index < types.length; index++) {
        const element = types[index];
        if (element.browseName.name === "StateMachineType") {
            return true;
        }
    }
    return false;
}

async function superTypeContainsStateType(types) {
    for (let index = 0; index < types.length; index++) {
        const element = types[index];
        if (element.browseName.name === "StateType") {
            return true;
        }
    }
    return false;
}

async function superTypeTransitionType(types) {
    for (let index = 0; index < types.length; index++) {
        const element = types[index];
        if (element.browseName.name === "TransitionType") {
            return true;
        }
    }
    return false;
}

async function superTypeStateChangePropertiesType(types) {
    for (let index = 0; index < types.length; index++) {
        const element = types[index];
        if (element.browseName.name === "StateChangeProperties") {
            return true;
        }
    }
    return false;
}

async function parseEFlexObject(client, BaseObjectNodeId, ObjectResult, RootObject) {
    var ObjectResult = ObjectResult || {};
    // Prepare the Object
    return await new Promise((resolve, reject) => {
        client.browseNode(BaseObjectNodeId.ns, BaseObjectNodeId.nid, async function(err, browse_results) {
            if (err) {
                reject(err);
            } else {
                if (browse_results[0].statusCode.value !== 0) {
                    reject({ msg: "Bad status code", statusCode: browse_results[0].statusCode });
                } else {
                    for (let i = 0; i < browse_results[0].references.length; i++) {
                        const element = browse_results[0].references[i];
                        const NodeClass = element.nodeClass.key;
                        var item = {};
                        let type = "Object";
                        let types = [];
                        if (NodeClass === "Object") {
                            // Get all superTypes
                            let opcuaType = await getOpcUAType(client, {
                                ns: element.nodeId.namespace,
                                nid: element.nodeId.value
                            });
                            types = await getGetAllSuperTypes(client, {
                                ns: opcuaType.nodeId.namespace,
                                nid: opcuaType.nodeId.value
                            }, [opcuaType]);
                            // Check if it has a supertype StateMachineType
                            if (await superTypeContainsStateMachineType(types)) {
                                type = "StateMachineType";
                            } else if (await superTypeContainsStateType(types)) {
                                type = "StateType";
                            } else if (await superTypeTransitionType(types)) {
                                type = "TransitionType";
                            } else if (await superTypeStateChangePropertiesType(types)) {
                                type = "StateChangeProperties";
                            } else {
                                type = "Object";
                            }

                            item = {
                                name: element.browseName.name,
                                nodeId: {
                                    ns: element.nodeId.namespace,
                                    nid: element.nodeId.value
                                },
                                type: type
                            };
                            await parseEFlexObject(client, {
                                ns: element.nodeId.namespace,
                                nid: element.nodeId.value
                            }, item, RootObject);

                            if (item.type === "StateType") {
                                // Check if state is subState of a state
                                var pState = await getStateParent(client, item);
                                if (pState) {
                                    item.parent = {
                                        name: pState.browseName.name,
                                        nodeId: {
                                            ns: pState.nodeId.namespace,
                                            nid: pState.nodeId.value
                                        }
                                    };
                                } else {
                                    item.parent = null;
                                }
                                item.interval = 100;

                                RootObject.STATES = RootObject.STATES || {};
                                Object.defineProperty(RootObject.STATES, "" + element.browseName.name, {
                                    value: item,
                                    writable: true,
                                    enumerable: true,
                                    configurable: true
                                });

                            }
                            if (item.type === "TransitionType") {
                                var hasCause = await getTransitionCause(client, item);
                                if (hasCause) {
                                    item.hasCause = {
                                        name: hasCause.browseName.name,
                                        nodeId: {
                                            ns: hasCause.nodeId.namespace,
                                            nid: hasCause.nodeId.value
                                        }
                                    };
                                } else {
                                    item.hasCause = null;
                                }
                                item.interval = 100;

                                RootObject.TRANSITIONS = RootObject.TRANSITIONS || {};
                                Object.defineProperty(RootObject.TRANSITIONS, "" + element.browseName.name, {
                                    value: item,
                                    writable: true,
                                    enumerable: true,
                                    configurable: true
                                });
                            }

                        } else if (NodeClass === "Variable" || NodeClass === "Property") {
                            type = "Variable";
                            item = {
                                name: element.browseName.name,
                                nodeId: {
                                    ns: element.nodeId.namespace,
                                    nid: element.nodeId.value
                                },
                                type: type
                            };
                            await parseEFlexObject(client, {
                                ns: element.nodeId.namespace,
                                nid: element.nodeId.value
                            }, item, RootObject);

                            if (RootObject._states.includes(element.browseName.name)) {
                                RootObject.CURRENT_STATES = RootObject.CURRENT_STATES || [];
                                item.interval = 50;
                                RootObject.CURRENT_STATES.push(item);
                            }
                            if (RootObject._kpi.includes(element.browseName.name)) {
                                item.interval = 50;
                                RootObject.KPI = RootObject.KPI || [];
                                RootObject.KPI.push(item);
                            }
                        } else if (NodeClass === "Method") {
                            type = "Method";
                            item = {
                                name: element.browseName.name,
                                objectId: {
                                    ns: BaseObjectNodeId.ns,
                                    nid: BaseObjectNodeId.nid
                                },
                                methodId: {
                                    ns: element.nodeId.namespace,
                                    nid: element.nodeId.value
                                },
                                type: type
                            };
                            await parseEFlexObject(client, {
                                ns: element.nodeId.namespace,
                                nid: element.nodeId.value
                            }, item, RootObject);

                            if (RootObject._actions.includes(element.browseName.name)) {
                                RootObject.ACTIONS = RootObject.ACTIONS || [];
                                RootObject.ACTIONS.push(item);
                            }
                        }

                        Object.defineProperty(ObjectResult, "" + element.browseName.name, {
                            value: item,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                    }
                    resolve(ObjectResult);
                }
            }
        });
    });
}

async function getStateParent(client, item) {
    // get the machine state of the state client
    let pStateMachine = await client.browseNodeByReferenceTypAndDirection(item.nodeId.ns, item.nodeId.nid, 1, "HasComponent")
        .then(async function(references) {
            if (references[0].references.length !== 1) {
                return null;
            } else {
                return references[0].references[0];
            }
        }, function(err) {
            return null;
        });
    if (pStateMachine) {
        let pState = await client.browseNodeByReferenceTypAndDirection(pStateMachine.nodeId.namespace, pStateMachine.nodeId.value, 1, "HasSubStateMachine")
            .then(async function(references) {
                if (references[0].references.length !== 1) {
                    return null;
                } else {
                    return references[0].references[0];
                }
            }, function(err) {
                return null;
            });
        return pState;
    } else {
        return null;
    }
}

async function getTransitionCause(client, item) {
    // get the machine state of the state client
    return await client.browseNodeByReferenceTypAndDirection(item.nodeId.ns, item.nodeId.nid, 0, "HasCause") // HasCause
        .then(async function(references) {
            if (references[0].references.length < 1) {
                return null;
            } else {
                return references[0].references[0];
            }
        }, function(err) {
            return null;
        });
}

module.exports = OPCUAClientInterface;