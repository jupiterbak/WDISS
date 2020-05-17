/**
 * Copyright 2019 Siemens AG.
 * 
 * File: SkillVis.js
 * Project: SP 347
 * Author:
 *  - Jupiter Bakakeu
 **/

const opcua = require("node-opcua");
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

const STATENODEIDMAPPING = {
    aborted: 62,
    aborting: 61,
    cleared: 71,
    clearing: 55,
    running: 75,
    stopping: 54,
    stopped: 53,
    resetting: 27,
    idle: 28,
    execute: 36,
    completing: 37,
    completed: 38,
    complete: 38,
    hold: 136,
    init_skill: 1018,
    skill_ready: 1017,
    execute_skill: 1013,
    wait_next_step: 1014,
    execution_end: 1014,
    holding: 1020,
    held: 1021,
    unholding: 1022,
    check_resource: 1026,
    initialize_resource: 1025,
    skill_initialized: 1027
};

class Skill {
    constructor(logger, opcua_server) {
        this.logger = logger;
        this.addressSpace = opcua_server.engine.addressSpace;

        // get the namespace Index
        this.skill_namespace_index = null;

        this.start_method = null;
        this.GetResult_method = null;

        this.result_trigger_node = null;
        this.result_trigger_value = 0;

        this.call_result = 0;
    }

    initialize() {
        var self = this;
        // get the namespace Index
        this.skill_namespace_index = this.addressSpace.getNamespaceIndex("http://siemens.com/automation_skills_test");
        this.skill_type_namespace_index = this.addressSpace.getNamespaceIndex("http://www.siemens.com/AutomationSkills");

        // Find the methods
        this.start_method_node = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=7002");
        this.GetResult_method_node = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=7003");
        this.result_trigger_node = this.addressSpace.findNode("ns=" + this.skill_namespace_index + ";i=6101");

        this.start_method = this.addressSpace.findMethod(this.start_method_node.nodeId);
        this.GetResult_method = this.addressSpace.findMethod(this.GetResult_method_node.nodeId);

        // Bind the methods
        this.start_method.bindMethod((inputArguments, context, callback) => {
            self.startSkillMethod(inputArguments, context, callback);
        });
        this.GetResult_method.bindMethod((inputArguments, context, callback) => {
            self.getSkillResultsMethod(inputArguments, context, callback);
        });

        // Set result trigger value
        self.result_trigger_node.setValueFromSource({ dataType: opcua.DataType.Int16, value: self.result_trigger_value }, opcua.StatusCodes.Good, new Date());
    }

    startSkillMethod(inputArguments, context, callback) {
        var self = this;
        this.logger.info("StartSkill is called.");
        const callMethodResult = {
            statusCode: opcua.StatusCodes.Good,
            outputArguments: []
        };
        this.call_result = inputArguments[0].value + inputArguments[1].value;
        callback(null, callMethodResult);
        setTimeout(() => {
            // Set result trigger value
            self.result_trigger_value = self.result_trigger_value + 1;
            self.result_trigger_node.setValueFromSource({ dataType: opcua.DataType.Int16, value: self.result_trigger_value }, opcua.StatusCodes.Good, new Date());            
        }, 2000);
    }

    getSkillResultsMethod(inputArguments, context, callback) {
        this.logger.info("GetSkillResult is called.");

        const callMethodResult = {
            statusCode: opcua.StatusCodes.Good,
            outputArguments: [{
                dataType: opcua.DataType.Int16,
                value: this.call_result
            }]
        };
        callback(null, callMethodResult);
    }

    start() {
    }

    stop() {
    }

    clear() {
    }
}

module.exports = Skill;