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

var app = null;
var when = require('when');
microservices = [];

module.exports = {
    app: app,
    init: function(httpServer, _app, userSettings) {
        app = _app;

        // Initialize all the services
        userSettings.services = userSettings.services || [];
        var _apis = userSettings.services || [];
        if (_apis.length > 0) {
            _apis.forEach(function(el) {
                try {
                    var apiModule = require("../services/" + el.type);
                    var instance = new apiModule();
                    instance.init(app, el);
                    microservices.push(instance);
                } catch (error) {
                    app.log.warn("MICRO SERVICE module cannot be initialized. Module: " + el.name + " - Error: " + error);
                    console.log(error.stack);
                }
            });
        } else {
            app.log.warn("No MICRO SERVICE settings defined");
        }

        // log the step
        app.log.info("Configurator initialized successfully.");
        return when.resolve();
    },
    start: function() {
        // Start all micro services
        microservices.forEach(function(s_el) {
            s_el.start();
        });

        app.log.info("Configurator start successfully.");
        return when.resolve();
    },
    stop: function() {
        // Stop all services
        microservices.forEach(function(s_el) {
            try {
                s_el.stop();
            } catch (error) {
                app.log.warn("MICRO SERVICE module cannot be stopped. Module: " + s_el.name + " - Error: " + error);
                console.log(error.stack);
            }
        });

        app.log.info("Configurator stoped successfully.");
        return when.resolve();
    },

    getMicroServices: function() { return apis },
    getApp: function() { return app }
};