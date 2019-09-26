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

var DAISYOPCClientManager = require('./OPCUAClient/DAISYOPCClientManager');

var OPCUAClientInterface = function() {};
OPCUAClientInterface.prototype.init = function(_app, sio, _settings) {
    var self = this;
    this.app = _app;
    self.settings = _settings;
    self.settings.name = self.settings.name || "OPC UA Client Manager";
    self.settings.id = self.settings.id || this.app.util.generateId();
    self.settings.level = self.settings.level || "info";
    self.settings.modulesetting = self.settings.modulesetting || {
        interval: 10,
        ip: "localhost",
        port: 4840,
        defaultObjectModel: { CURRENT_STATES: [], STATES: [], KPI: [], ACTIONS: [] }
    };
    self.settings.defaultObjectModel = self.settings.defaultObjectModel || {};

    self.started = false;
    self.manager = new DAISYOPCClientManager(sio);
    self.app.log.info("MICROSERVICE[" + self.settings.name + "] initialized successfully!");
    self.current_state_objects = [];
};
OPCUAClientInterface.prototype.start = function() {
    var self = this;
    if (self.started) {
        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] already started !");
        return when.resolve();
    } else {
        self.started = true;
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] started successfully!");
    }
    return when.resolve();
};

OPCUAClientInterface.prototype.stop = function() {
    var self = this;
    self.started = false;
    self.manager.close(function() {
        self.app.log.info("MICROSERVICE[" + self.settings.name + "] stopped successfully!");
    });
    return when.resolve();
};


// ---------------------------------------------------------------------------------------------------
// -------------  Secondary functions 
// ---------------------------------------------------------------------------------------------------
OPCUAClientInterface.prototype.ConnectPLC = function(arg, sio, fCallBack) {
    var self = this;
    if (arg.ip && arg.socketID && arg.port && arg.serverName) {
        async.waterfall([
            function(callback) { // Get the client
                var client = self.manager.getClient(self.manager.getClientID(arg.ip, arg.port, arg.serverName, arg.socketID));
                if (client) {
                    self.app.log.warn("MICROSERVICE[" + self.settings.name + "] client already exist.");
                } else {
                    client = self.manager.addNewOPCClient(arg.ip, arg.port, arg.serverName, arg.socketID);
                    self.app.log.info("MICROSERVICE[" + self.settings.name + "] new client initialized.");
                }
                if (client) {
                    callback(null, client);
                } else {
                    callback({ text: "Client not found!" }, null);
                }
            },
            function(client, callback) { // Connect the client to the server
                if (client.connected === false) {
                    client.connect(arg.ip, arg.port, arg.serverName, arg.socketID, function(err) {
                        if (err) {
                            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] new client could connect to server: " + client.url);
                            callback(err, null);
                        } else {
                            self.app.log.info("MICROSERVICE[" + self.settings.name + "] new client connected to server: " + client.url);
                            callback(null, client);
                        }
                    });
                } else {
                    self.app.log.info("MICROSERVICE[" + self.settings.name + "] client is already connected to " + client.url);
                    callback(null, client);
                }
            },
            function(client, callback) { // Check the server information model
                // Check Server Model
                checkServerModel(self, client, sio, function(err, skillArray) {
                    if (err) {
                        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] PLC Server is not compatible to the Skill model.");
                        callback(err, client, []);
                    } else {
                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] PLC Server implements compatible Automation Skill. Client will start monitoring.");
                        callback(null, client, skillArray);
                    }
                });
            },
            function(client, skillArray, callback) { // Monitor the PLC assuming that it is compatible to our model
                monitorServerInformationModel(self, client, sio, skillArray, function(err) {
                    if (err) {
                        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] PLC Server Information model could not be monitored.");
                        callback(err, client, []);
                    } else {
                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] PLC Server Information model is being monitored.");
                        callback(null, client, skillArray);
                    }
                });
            }
        ], function(err, client, results) {
            fCallBack(err, client, results);
        });
    } else {
        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] invalid Argument for method ConnectPLC.");
        fCallBack({ text: "Invalid Arguments" }, null, []);
    }
};

OPCUAClientInterface.prototype.DisconnectPLC = function(arg, fCallBack) {
    var self = this;
    var client = null;
    //Initialize a new client
    if (arg.ip && arg.socketID && arg.port && arg.serverName) {
        var client = manager.getClient(manager.getClientID(arg.ip, arg.port, arg.serverName, arg.socketID));
        if (client) {
            if (client.connected === true) {
                client.disconnect(function(err) {
                    if (err) {
                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] client could disconnect from server.");
                        fCallBack(null, false);
                    } else {
                        self.app.log.info("MICROSERVICE[" + self.settings.name + "] client disconnected from server.");
                        fCallBack(null, true);
                    }
                });
            }
        } else {
            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not disconnect client.");
            fCallBack({ text: "Invalid Arguments" }, false);
        }
    } else {
        fCallBack({ text: "Invalid Arguments" }, false);
    }
};

OPCUAClientInterface.prototype.ExecuteMethod = function(arg, fCallBack) {
    var self = this;
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
                    if (action.objectId && action.methodId && client) {
                        // Initialize the parameters
                        var inputArguments = [];
                        if (action.parameters) {
                            var k = 0;
                            action.parameters.inputArguments.forEach(function(el) {
                                // Filter Datatype
                                // TODO: Only basic datatypes are supported
                                //const keys = Object.keys(opcua.DataType).filter(k => opcua.DataType[k] === el.dataType.value);
                                /*
                                 *     nodeId = opcua.coerceNodeId("ns=2;s=Scalar_Static_ImagePNG");
                                 *     session.getBuildInDataType(nodeId,function(err,dataType) {
                                 *        assert(dataType === opcua.DataType.ByteString);
                                 *     });
                                 * */
                                inputArguments.push({
                                    dataType: el.dataType.value, // only basic datatypes are supported
                                    arrayType: el.valueRank !== -1 ? opcua.VariantArrayType.Array : opcua.VariantArrayType.Scalar,
                                    value: el.valueRank !== -1 ? [0] : 0
                                });
                                k++;
                            });
                        }

                        client.callMethod(action.objectId.ns, action.objectId.nid, action.methodId.ns, action.methodId.nid, inputArguments, function(err, response) {
                            if (err) {
                                self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not execute action [" + arg.actionName + "] : " + err);
                                fCallBack({ text: "Could not execute action.", err: err }, null);
                            } else {
                                if (response[0].statusCode == 0) {
                                    self.app.log.info("MICROSERVICE[" + self.settings.name + "] executed action [" + arg.actionName + "] successfully with errorCode: " + response[0].statusCode);
                                    fCallBack(null, response[0]);
                                } else {
                                    self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not execute action [" + arg.actionName + "] with errorCode: " + response[0].statusCode);
                                    fCallBack({ text: "Could not execute action [" + arg.actionName + "] with errorCode: " + response[0].statusCode }, response[0]);
                                }
                            }
                        });
                    }
                } else {
                    fCallBack({ text: "Could not execute action. Action was not found on OPC UA Server." }, null);
                    self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not execute action. Action was not found on OPC UA Server.");
                }
            }
        } else {
            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not execute action. Client is disconnected.");
            fCallBack({ text: "Could not execute action. Client is disconnected." }, null);
        }
    } else {
        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not execute action. Invalid Arguments.");
        fCallBack({ text: "Invalid Arguments" }, null);
    }
};

OPCUAClientInterface.prototype.WriteVariable = function(arg, fCallBack) {
    var self = this;
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
                if (client.connected === true && _variable.nodeId) {
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
                            fCallBack({ text: "Could not write variable [" + arg.name + "] : ", err: err }, null);
                        } else {
                            self.app.log.log("MICROSERVICE[" + self.settings.name + "] write variable [" + arg.name + "] : executed with : " + statusCode);
                            fCallBack(null, statusCode);
                        }
                    });
                }

            } else {
                self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not write variable. Client is disconnected.");
                fCallBack({ text: "Could not execute action. Client is disconnected." }, null);
            }
        } else {
            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not write variable. Client is disconnected.");
            fCallBack({ text: "Could not execute action. Client is disconnected." }, null);
        }
    } else {
        self.app.log.warn("MICROSERVICE[" + self.settings.name + "] could not write variable. Invalid arguments.");
        fCallBack({ text: "Invalid Arguments" }, null);
    }
};

// ---------------------------------------------------------------------------------------------------

function monitorServerInformationModel(self, client, sio, skillArray, fCallBack) {
    async.series([
        function(callback) { // Monitor the current state Machines
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring CURRENT STATES.");
            var _current_states = self.settings.modulesetting.defaultObjectModel.CURRENT_STATES;
            if (_current_states) {
                var ii = 0;
                _current_states.forEach(function(el) {
                    if (el.nodeId && client) {
                        client.monitorNode(el.nodeId.ns, el.nodeId.nid, el.name, el.interval, function(err) {
                            if (err) {
                                self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not monitor item [" + el.name + "] - [" + el.nodeId.ns + ":" + el.nodeId.nid + "]: " + err);
                            }
                        }, function(dataValue) {
                            if (dataValue.value) {
                                el["value"] = dataValue.value.value;
                                el["ID"] = "ns=" + el.nodeId.ns + ";i=" + el.nodeId.nid;
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

                                    sio.emit("StatesChanged", {
                                        ip: "" + client.ip,
                                        port: "" + client.port,
                                        state: el,
                                        transitions: transitions
                                    });
                                }, 500);
                            }
                        });
                    }
                    ii++;
                });
            }
            callback();
        },
        function(callback) { // Monitor KPI
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring KPIS.");
            var _kpis = self.settings.modulesetting.defaultObjectModel.KPI;
            if (_kpis) {
                _kpis.forEach(function(el) {
                    if (el.nodeId && client) {
                        client.monitorNode(el.nodeId.ns, el.nodeId.nid, el.name, 20, function(err) { //el.interval
                            if (err) {
                                self.app.log.error("MICROSERVICE[" + self.settings.name + "] could not monitor item [" + el.name + "] - [" + el.nodeId.ns + ":" + el.nodeId.nid + "]: " + err);
                            }
                        }, function(dataValue) {
                            if (dataValue.value) {
                                el["value"] = dataValue.value.value;
                            }

                            if (self.started)
                                sio("KPIChanged", {
                                    ip: "" + client.ip,
                                    port: "" + client.port,
                                    item: el
                                });
                        });
                    }
                    iii++;
                });
            }

            callback();
        },
        function(callback) { // Monitor all STATES DESCRIPTIONS
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring possibles STATES.");
            var statesObj = self.settings.modulesetting.defaultObjectModel.STATES;
            if (statesObj) {
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
                                            sio("STATESDescriptionChanged", {
                                                ip: "" + client.ip,
                                                port: "" + client.port,
                                                item: eState
                                            });
                                        }
                                    });
                                }

                            }
                        }

                    }
                }
            }
            callback();
        },
        function(callback) { // Monitor all TRANSITION DESCRIPTIONS
            self.app.log.info("MICROSERVICE[" + self.settings.name + "] started monitoring possibles TRANSITIONS.");
            let transitionObj = self.settings.modulesetting.defaultObjectModel.TRANSITIONS;
            if (transitionObj) {
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
                                                sio.emit("TRANSITIONDescriptionChanged", {
                                                    ip: "" + client.ip,
                                                    port: "" + client.port,
                                                    item: eTransition
                                                });
                                            }
                                        }
                                    });
                                }
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

function checkServerModel(self, client, sio, fCallBack) {
    async.waterfall([
            function(callback) { // Check if a SkillMLObject exist
                self.app.log.warn("MICROSERVICE[" + self.settings.name + "] Client starts parsing PLC information model....");
                getSkillObject(client, { ns: 0, nid: 85 }, []).then(
                    function(foundedObjects) {
                        if (foundedObjects.length > 0) {
                            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] Client found a EFLEX LObject with the nodeId: " + JSON.stringify(foundedObjects[0]));
                            callback(null, foundedObjects);
                        } else {
                            self.app.log.warn("MICROSERVICE[" + self.settings.name + "] No SkillObject exists in the PLC information model.");
                            callback({ text: "No Skill Object founded." }, []);
                        }
                    });
            },
            function(foundedObjects, callback) {
                if (foundedObjects.length > 0) {
                    var FindTasks = [];
                    foundedObjects.forEach(el => {
                        FindTasks.push(
                            new Promise((resolve, reject) => {
                                parseSkillObject(client, {
                                        ns: el.nodeId.namespace,
                                        nid: el.nodeId.value
                                    }, {}, self.settings.modulesetting.defaultObjectModel)
                                    .then(
                                        function(parsedModel) {
                                            // propagate the model to the clients
                                            sio.emit("skillModelFounded", {
                                                ip: "" + client.ip,
                                                port: "" + client.port,
                                                skill: el,
                                                skillModel: parsedModel
                                            });
                                            resolve({
                                                ip: "" + client.ip,
                                                port: "" + client.port,
                                                skill: el,
                                                skillModel: parsedModel
                                            });
                                        }
                                    );
                            })
                        );
                    });

                    Promise.all(FindTasks)
                        .then(values => {
                            // console.log(JSON.stringify(values, 4));
                            self.app.log.info("MICROSERVICE[" + self.settings.name + "] Client validated the Skill Object and extracted STATES, KPI and METHODS successfully.");
                            callback(null, values);
                        });
                }
            }
        ],
        function(err, _results) {
            fCallBack(err, _results);
        });
}

async function getSkillObject(client, nodeId, rslts) {
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
                let founded = await isSkillObjectType(client, { ns: desc.nodeId.namespace, nid: desc.nodeId.value });
                if (founded) {
                    _rslts.push({ name: desc.browseName.name, nodeId: desc.nodeId });
                } else {
                    await getSkillObject(client, { ns: desc.nodeId.namespace, nid: desc.nodeId.value }, _rslts);
                }
            } catch (err) {
                return _rslts;
            }
        }
        return _rslts;
    });
}

function isSkillObjectType(client, nodeId) {
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

                        // Check if type is SkillObjectType
                        if (element.nodeId.namespace === client.getNamespaceIndexOfURI("http://www.siemens.com/AutomationSkills") && element.nodeId.value === 1032) {
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
        }, function() {
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

async function parseSkillObject(client, BaseObjectNodeId, ObjectResult, RootObject) {
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
                            await parseSkillObject(client, {
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
                            await parseSkillObject(client, {
                                ns: element.nodeId.namespace,
                                nid: element.nodeId.value
                            }, item, RootObject);

                            RootObject.CURRENT_STATES = RootObject.CURRENT_STATES || [];
                            if (RootObject._states.includes(element.browseName.name)) {
                                item.interval = 50;
                                RootObject.CURRENT_STATES.push(item);
                            }
                            RootObject.KPI = RootObject.KPI || [];
                            if (RootObject._kpi.includes(element.browseName.name)) {
                                item.interval = 50;
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
                            await new Promise((resolve) => {

                                client.getArgumentDefinition(element.nodeId.namespace, element.nodeId.value, async function(err, inputArguments) {
                                    item.parameters = inputArguments;
                                    resolve(item);
                                });
                            });
                            await parseSkillObject(client, {
                                ns: element.nodeId.namespace,
                                nid: element.nodeId.value
                            }, item, RootObject);

                            RootObject.ACTIONS = RootObject.ACTIONS || [];
                            if (RootObject._actions.includes(element.browseName.name)) {
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
        }, function() {
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
            }, function() {
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
        }, function() {
            return null;
        });
}

module.exports = OPCUAClientInterface;