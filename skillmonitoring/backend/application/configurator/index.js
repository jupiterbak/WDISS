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
var http_server = null;
var userSettings = null;
var when = require('when');
micro_services = [];

module.exports = {
    app: app,
    init: function(_http_server, _app, _userSettings) {
        app = _app;
        userSettings = _userSettings;
        http_server = _http_server;
        // Initialize all required services
        // ------- Web Debugging server ------

        http_server.on('error', function(err) {
            app.log.error("server.uncaught-exception: " + err);
        });



        // ...
        // -----------------------------------

        // Initialize all the optional services
        userSettings.services = userSettings.services || [];
        var _apis = userSettings.services || [];
        if (_apis.length > 0) {
            _apis.forEach(function(el) {
                try {
                    var apiModule = require("../services/" + el.type);
                    var instance = new apiModule();
                    instance.init(app, el);
                    micro_services.push(instance);
                } catch (error) {
                    app.log.warn("SERVICE module cannot be initialized. Module: " + el.name + " - Error: " + error);
                    console.log(error.stack);
                }
            });
        } else {
            app.log.warn("No SERVICE settings defined");
        }

        // log the step
        app.log.info("Configurator initialized successfully.");
        return when.resolve();
    },
    start: function() {

        // Start all required services
        // ------- Web Debugging server ------
        http_server.listen(userSettings.uiPort, userSettings.uiHost, function() {
            app.log.info("Configurator webserver initialized successfully.");
        });




        // ...
        // -----------------------------------

        // Start all optional  services
        micro_services.forEach(function(s_el) {
            s_el.start();
        });

        app.log.info("Configurator start successfully.");
        return when.resolve();
    },
    stop: function() {
        // Stop all services
        micro_services.forEach(function(s_el) {
            try {
                s_el.stop();
            } catch (error) {
                app.log.warn("SERVICE module cannot be stopped. Module: " + s_el.name + " - Error: " + error);
                console.log(error.stack);
            }
        });

        app.log.info("Configurator stoped successfully.");
        return when.resolve();
    },

    getMicroServices: function() { return micro_services; },
    getApp: function() { return app; },
    getServer: function() { return http_server; }
};