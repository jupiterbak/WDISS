/**
 * Copyright 2018 Siemens AG.
 * 
 * File: SkillMonitoring.js
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
var os = require("os");
var http = require('http');
var express = require("express");

var storage = require("./storage");
var setting_manager = require("./setting_manager");

var util = require("./util");
var log = require("./log");

//var swagger = require("./swagger");
var configurator = require("./configurator");

var started = false;
process.env.SKILLMONITORING_HOME = process.env.SKILLMONITORING_HOME || path.resolve(__dirname + "/..");

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
    init: function(userSettings) {

        // Check that the user settings are consistent
        storage.init(userSettings.userDir, 'settings_' + require('os').hostname() + '.json', userSettings)
            .then(function() {
                return setting_manager.load(storage);
            });

        log.init(userSettings);
        setting_manager.init(userSettings);
        /** Configure the application webserver */
        var app = express();
        server = http.createServer(function(req, res) { app(req, res); });

        configurator.init(server, this, userSettings);
        // log the step
        log.info("SkillMonitoring initialized successfully.");

        return when.resolve();
    },

    start: function() {
        started = true;

        // Add a listener to the configuration changes
        storage.addConfigFileListener(function(_path) {
            if (path.basename(_path) === storage.getGlobalSettingsFile()) {
                var new_settings = setting_manager.load(storage);
                var state = this.isStarted();
                if (state) {
                    configurator.stop();
                }
                configurator.init(server, new_settings);
                if (state) {
                    configurator.start();
                }
            }
        });

        // Start the application
        console.log("\n\n===============================\n" + "SkillMonitoring engine.welcome\n===============================\n");
        if (setting_manager && setting_manager.version) {
            log.info("runtime.version SkillMonitoring :" + setting_manager.version);
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
        log.info("SkillMonitoring start successfully.");
        return when.resolve();
    },
    stop: function() {
        started = false;
        // Stop all modules
        configurator.stop();
        log.info("SkillMonitoring stopped successfully.");
        return when.resolve();
    },

    restart: function() {
        stop();
        start();
    },

    setting_manager: setting_manager,
    storage: storage,
    log: log,
    version: getVersion,
    settings: setting_manager,
    util: util,
    isStarted: function() {
        return started;
    },
    server: server,
    getConfigurator: function() { return configurator; },
    getSettingManager: function() { return setting_manager; },
    getStorage: function() { return storage; },
    getApp: function() { return this; },
    getServer: function() { return server; }
};