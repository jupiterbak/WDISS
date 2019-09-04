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
var PRIORITYACTIONLIST = ["Clear", "UnHold", "Unsuspend", "PowerOn", "Reset", "Start", "ChangeLoad", "Hold", "Suspend", "Poweroff", "Standby", "Stop", "Abort", "SC"];
var Core = function() {};

Core.prototype.init = function(_app, _settings) {
    var self = this;
    self.app = _app;
    self.settings = _settings;

    self.app.log.info("LMCore[" + self.settings.core + "] initialized successfully!");
};

Core.prototype.clear = function() {
    var self = this;
    self.app.log.info("LMCore[" + self.settings.core + "] cleared!");
};

Core.prototype.selectAction = function(parameterObject) {
    var self = this;

    self.app.log.info("LMCore[" + self.settings.core + "] selecting actions.");
    if (parameterObject.environnement.targetLoad <= 0.0) {
        self.app.log.info("LMCore[" + self.settings.core + "] targetLoad is 0. Modify it to 0.001");
        parameterObject.environnement.targetLoad = 0.001;
    }

    for (let index = 0; index < PRIORITYACTIONLIST.length; index++) {
        const prioAction = PRIORITYACTIONLIST[index];
        for (let k = 0; k < parameterObject.possibleActions.length; k++) {
            const elem = parameterObject.possibleActions[k];
            if (elem.hasCause.name === prioAction) {
                return {
                    name: elem.hasCause.name,
                    parameter1: parameterObject.environnement.targetLoad,
                    parameter2: parameterObject.environnement.targetLoad
                }
            }
        }
    }
    return {
        name: "SC",
        parameter1: parameterObject.environnement.targetLoad,
        parameter2: parameterObject.environnement.targetLoad
    }
};

Core.prototype.train = function(reward) {
    var self = this;
};


Core.prototype.computeReward = function(environnement) {
    // TODO: Jupiter
    return 0.0;
}
module.exports = Core;