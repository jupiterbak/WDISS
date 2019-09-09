/**
 * Copyright 2018 Siemens AG.
 * 
 * File: SkillVis.js
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
var path = require('path');
var fs = require("fs");
var os = require("os");

var eventBus = require("./eventBus");
var configurationBus = require("./configurationBus");
var storage = require("./storage");
var setting_manager = require("./setting_manager");

var util = require("./util");
var log = require("./log");

//var swagger = require("./swagger");
var configurator = require("./configurator");

var started = false;
process.env.LEMS_HOME = process.env.LEMS_HOME || path.resolve(__dirname + "/..");

// Internal variable
var server = null;

var version;

function getVersion() {
    if (!version) {
        var pkg = require(path.join(__dirname, "..", "package.json"));
        version = pkg.version;
    }
    return version;
}

function reportMetrics() {
    var memUsage = process.memoryUsage();

    log.log({
        level: log.METRIC,
        event: "engine.memory.rss",
        value: memUsage.rss
    });
    log.log({
        level: log.METRIC,
        event: "engine.memory.heapTotal",
        value: memUsage.heapTotal
    });
    log.log({
        level: log.METRIC,
        event: "engine.memory.heapUsed",
        value: memUsage.heapUsed
    });
}

module.exports = {
    init: function(httpServer, userSettings) {

        // Check that the user settings are consistent
        if (!userSettings) {
            userSettings = httpServer;
            httpServer = null;
        }

        storage.init(userSettings.userDir, 'settings_' + require('os').hostname() + '.json', userSettings)
            .then(function() {
                return setting_manager.load(storage)
            });

        // Initialize all the modules from the settings
        // configurator
        var current_settings = setting_manager.getGlobalSetting();
        log.init(userSettings);
        setting_manager.init(userSettings);
        server = httpServer;

        configurator.init(httpServer, this, userSettings);
        // log the step
        log.info("SkillVis initialized successfully.");

        return when.resolve();
    },

    start: function() {
        started = true;
        var self = this;

        // Add a listener to the configuration changes
        storage.addConfigFileListener(function(_path, stats) {
            if (path.basename(_path) === storage.getGlobalSettingsFile()) {
                var new_settings = setting_manager.load(storage);
                var state = isStarted();
                if (state) {
                    configurator.stop();
                }
                configurator.init(httpServer, new_settings);
                if (state) {
                    configurator.start();
                }
            }
        });

        // Start the application
        console.log("\n\n===============================\n" + "SkillVis engine.welcome\n===============================\n");
        if (setting_manager && setting_manager.version) {
            log.info("runtime.version SkillVis :" + setting_manager.version);
        }
        log.info("runtime.version Node JS" + process.version);
        log.info(os.type() + " " + os.release() + " " + os.arch() + " " + os.endianness());

        if (log.metric()) {
            runtimeMetricInterval = setInterval(function() {
                reportMetrics();
            }, setting_manager.runtimeMetricInterval || 15000);
        }

        // Start all module
        configurator.start();
        log.info("SkillVis start successfully.");

        // setInterval(function() {
        //     self.eventBus.emit("ExecutePLCAction", {
        //         ip: "localhost",
        //         port: 48022,
        //         serverName: "DEMO",
        //         socketID: "8548585858",
        //         actionName: "Clear",
        //         parameters: [{
        //             dataType: 11, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
        //             arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
        //             value: Math.floor(Math.random() * 1000)
        //         }, {
        //             dataType: 11, // Null: 0, Boolean: 1, SByte: 2, // signed Byte = Int8 Byte : 3, // unsigned Byte = UInt8 Int16: 4, UInt16: 5, Int32: 6, UInt32: 7, Int64: 8, UInt64: 9, Float: 10, Double: 11, String: 12, DateTime: 13, Guid: 14, ByteString: 15, XmlElement: 16, NodeId: 17, ExpandedNodeId: 18, StatusCode: 19, QualifiedName: 20, LocalizedText: 21, ExtensionObject: 22, DataValue: 23, Variant: 24, DiagnosticInfo: 25
        //             arrayType: 0x00, //Scalar: 0x00, Array: 0x01, Matrix: 0x02
        //             value: Math.floor(Math.random() * 1000)
        //         }]
        //     });
        // }, 20000);

        // ########### TEST #############
        return when.resolve();
    },
    stop: function() {
        started = false;
        // Stop all modules
        configurator.stop();
        log.info("SkillVis stopped successfully.");
        return when.resolve();
    },

    restart: function(new_setting) {
        stop();
        start();
    },

    setting_manager: setting_manager,
    storage: storage,
    log: log,
    version: getVersion,
    log: log,
    settings: setting_manager,
    util: util,
    eventBus: eventBus,
    configurationBus: configurationBus,
    isStarted: function() {
        return started
    },

    getConfigurator: function() { return configurator },
    getSettingManager: function() { return setting_manager },
    getStorage: function() { return storage },
    getApp: function() { return this },
    getServer: function() { return server }
};