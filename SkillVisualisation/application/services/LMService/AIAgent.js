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

/**================================== AGENT ========================================== */
const ACTIONLIST = ["UnHold", "Unsuspend", "PowerOn", "Reset", "Start", "Hold", "Suspend", "Poweroff", "Standby", "Stop"];
var RBrain = require("./lib/rl.js");

// A single agent
var Agent = function(spec, type) {
    this.actions = [];
    for (let index = 0; index < ACTIONLIST.length; index++) {
        this.actions.push(index);
    }

    if (type === "DQN") {
        this.brain = new RBrain.RL.DQNAgent(this, spec); // set from outside
    } else if (type === "DP") {
        this.brain = new RBrain.RL.DPAgent(this, spec); // set from outside
    } else if (type === "TD") {
        this.brain = new RBrain.RL.TDAgent(this, spec); // set from outside
    } else {
        this.brain = new RBrain.RL.DQNAgent(this, spec); // set from outside
    }


    this.reward_bonus = 0.0;
    this.digestion_signal = 0.0;

    // outputs on world
    this.action = 0;

    this.prevactionix = -1;
    this.num_states = 5;
}
Agent.prototype = {
        getNumStates: function() {
            return this.num_states;
        },
        getMaxNumActions: function() {
            return this.actions.length;
        },
        forward: function(parameterObject) {
            // in forward pass the agent simply behaves in the environment
            // create input to brain
            var input_array = new Array(this.num_states);
            input_array[0] = parameterObject.environnement.targetLoad;
            input_array[1] = parameterObject.environnement.currentLoad;
            input_array[2] = parameterObject.environnement.maxAvgLoad;
            input_array[3] = parameterObject.environnement.currentState;
            input_array[4] = parameterObject.environnement.currentMode;

            this.action = this.brain.act(input_array);
        },
        backward: function(reward) {
            this.digestion_signal = reward;
            this.last_reward = reward; // for vis
            this.brain.learn(reward);
        }
    }
    /**=================================================================================== */

/**================================== BRAIN ========================================== */

/**=================================================================================== */

var Core = function() {};

Core.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;
    self.settings.coreSettings = self.settings.coreSettings || {
        type: "DQN"
    }

    this.spec = {}
    this.spec.update = 'qlearn'; // qlearn | sarsa
    this.spec.gamma = 0.9; // discount factor, [0, 1)
    this.spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
    this.spec.alpha = 0.005; // value function learning rate
    this.spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
    this.spec.experience_size = 1000; // size of experience
    this.spec.learning_steps_per_iteration = 5;
    this.spec.tderror_clamp = 1.0; // for robustness
    this.spec.num_hidden_units = 20 // number of neurons in hidden layer

    this.agent = new Agent(this.spec, self.settings.coreSettings.type);

    self.app.log.info("LMCore[" + self.settings.core + "] initialized successfully!");
}

Core.prototype.clear = function() {
    var self = this;
    self.app.log.info("LMCore[" + self.settings.core + "] cleared!");
};

Core.prototype.selectAction = function(parameterObject) {
    var self = this;
    if (parameterObject.environnement.targetLoad <= 0.0) {
        self.app.log.info("LMCore[" + self.settings.core + "] targetLoad is 0. Modify it to 0.001");
        parameterObject.environnement.targetLoad = 0.001;
    }

    self.agent.forward(parameterObject);
    // return agent's desired action
    return {
        name: ACTIONLIST[self.agent.action],
        parameter1: parameterObject.environnement.targetLoad,
        parameter2: parameterObject.environnement.targetLoad
    }
};

Core.prototype.train = function(reward) {
    var self = this;
    self.agent.backward(reward);
};

var forbiddenStateIndexes = [0, 2, 5, 9, 11, 20, 22];
Core.prototype.computeReward = function(parameterObject) {
    if (forbiddenStateIndexes.includes(parameterObject.environnement.currentState)) {
        return -0.7;
    }

    if (parameterObject.environnement.currentState === 16) { // State is Execute
        return 2.0;
    }

    if (parameterObject.environnement.currentState === 4) { // State is Execute
        return 0.5;
    }
    return 0;
}
module.exports = Core;