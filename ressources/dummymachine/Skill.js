/**
 * Copyright 2019 Siemens AG.
 * 
 * File: SkillVis.js
 * Project: SP 347
 * Author:
 *  - Jupiter Bakakeu
 **/

const opcua = require("node-opcua");
const SkillStateMachine = require('./SkillStateMachine');
var hasOwnNestedProperty = function(obj, propertyPath) {
    if (!propertyPath)
        return false;

    var properties = propertyPath.split('.');

    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];

        if (!obj || !obj.hasOwnProperty(prop)) {
            return false;
        } else {
            obj = obj[prop];
        }
    }

    return true;
};

class Skill {
    constructor(logger, opcua_server) {
        this.logger = logger;
        this.skill_state_machine = new SkillStateMachine(logger, this);
        this.addressSpace = opcua_server.engine.addressSpace;

        // get the namespace Index
        this.skill_namespace_index = null;

        this.skill_state_machine_cs = null;
        this.cleared_state_machine_cs = null;
        this.running_state_machine_cs = null;
        this.idle_state_machine_cs = null;
        this.hold_state_machine_cs = null;
        this.resetting_state_machine_cs = null;

        this.start_method = null;
        this.GetResult_method = null;
    }

    initialize() {
        var self = this;
        // get the namespace Index
        this.skill_namespace_index = this.addressSpace.getNamespaceIndex("http://siemens.com/automation_skills_test");

        // Find the methods
        this.start_method_node = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1079");
        this.GetResult_method_node = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1092");
        this.start_method = this.addressSpace.findMethod(this.start_method_node.nodeId);
        this.GetResult_method = this.addressSpace.findMethod(this.GetResult_method_node.nodeId);

        // Bind the methods
        this.start_method.bindMethod((inputArguments, context, callback) => {
            self.startSkillMethod(inputArguments, context, callback);
        });
        this.GetResult_method.bindMethod((inputArguments, context, callback) => {
            self.getSkillResultsMethod(inputArguments, context, callback);
        });
        // Find and initialize current state variables nodes
        this.skill_state_machine_cs = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1034");
        this.cleared_state_machine_cs = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1038");
        this.running_state_machine_cs = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1047");
        this.idle_state_machine_cs = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1064");
        this.execute_state_machine_cs = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1056");
        this.hold_state_machine_cs = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1060");
        this.resetting_state_machine_cs = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=1069");
        this.initializeCurrentStateVariables();
    }

    initializeCurrentStateVariables() {


        this.skill_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "--" }, opcua.StatusCodes.Good, new Date());
        this.cleared_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "--" }, opcua.StatusCodes.Good, new Date());
        this.running_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "--" }, opcua.StatusCodes.Good, new Date());
        this.idle_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "--" }, opcua.StatusCodes.Good, new Date());
        this.execute_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "--" }, opcua.StatusCodes.Good, new Date());
        this.hold_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "--" }, opcua.StatusCodes.Good, new Date());
        this.resetting_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "--" }, opcua.StatusCodes.Good, new Date());
    }


    startSkillMethod(inputArguments, context, callback) {
        this.logger.info("StartSkill is called.");
        if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared.running.idle") && this.skill_state_machine.current_state.cleared.running.idle === "skill_ready") {
            // Start the skill
            this.skill_state_machine.startSkill();

            const callMethodResult = {
                statusCode: opcua.StatusCodes.Good,
                outputArguments: [{
                    dataType: opcua.DataType.Int16,
                    value: 0
                }]
            };
            callback(null, callMethodResult);
        } else {
            const callMethodResult = {
                statusCode: opcua.StatusCodes.BadWaitingForInitialData & opcua.StatusCodes.BadRequestNotAllowed,
                outputArguments: [{
                    dataType: opcua.DataType.Int16,
                    value: 0x88
                }]
            };
            callback(null, callMethodResult);
        }

    }

    getSkillResultsMethod(inputArguments, context, callback) {
        this.logger.info("GetSkillResult is called.");
        if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared.running") && this.skill_state_machine.current_state.cleared.running === "execute") {
            const callMethodResult = {
                statusCode: opcua.StatusCodes.BadWaitingForInitialData & opcua.StatusCodes.BadRequestNotAllowed,
                outputArguments: [{
                    dataType: opcua.DataType.Int16,
                    value: 0x88
                }]
            };
            callback(null, callMethodResult);
        } else {
            const callMethodResult = {
                statusCode: opcua.StatusCodes.Good,
                outputArguments: [{
                    dataType: opcua.DataType.Int16,
                    value: 0
                }]
            };
            callback(null, callMethodResult);
        }
    }

    updateOPCUAServerCurrentStateValues(skill_state) {
        // Skill State machine current state
        if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared")) {
            this.skill_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "cleared" },
                opcua.StatusCodes.Good, new Date());
            if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared.running")) {
                this.cleared_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "running" },
                    opcua.StatusCodes.Good, new Date());
                if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared.running.resetting")) {
                    this.running_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "resetting" },
                        opcua.StatusCodes.Good, new Date());
                    this.resetting_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: this.skill_state_machine.current_state.cleared.running.resetting },
                        opcua.StatusCodes.Good, new Date());
                } else if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared.running.idle")) {
                    this.running_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "idle" },
                        opcua.StatusCodes.Good, new Date());
                    this.idle_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: this.skill_state_machine.current_state.cleared.running.idle },
                        opcua.StatusCodes.Good, new Date());
                } else if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared.running.hold")) {
                    this.running_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "hold" },
                        opcua.StatusCodes.Good, new Date());
                    this.hold_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: this.skill_state_machine.current_state.cleared.running.hold },
                        opcua.StatusCodes.Good, new Date());
                } else if (hasOwnNestedProperty(this.skill_state_machine.current_state, "cleared.running.execute")) {
                    this.running_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: "execute" },
                        opcua.StatusCodes.Good, new Date());
                    this.execute_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: this.skill_state_machine.current_state.cleared.running.execute },
                        opcua.StatusCodes.Good, new Date());

                } else {
                    this.running_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: this.skill_state_machine.current_state.cleared.running },
                        opcua.StatusCodes.Good, new Date());
                }
            } else {
                this.cleared_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: this.skill_state_machine.current_state.cleared },
                    opcua.StatusCodes.Good, new Date());
            }
        } else {
            this.skill_state_machine_cs.setValueFromSource({ dataType: opcua.DataType.String, value: this.skill_state_machine.current_state },
                opcua.StatusCodes.Good, new Date());
        }
    }

    start() {
        this.skill_state_machine.start();
    }

    stop() {
        this.skill_state_machine.stop();
    }

    clear() {
        this.skill_state_machine.clear();
    }


}

module.exports = Skill;