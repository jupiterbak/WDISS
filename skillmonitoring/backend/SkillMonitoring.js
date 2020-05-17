/**
 * Copyright 2018 Siemens AG.
 * 
 * File: application.js
 * Project: SP 347
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
 * -- 01.09.2019
 *      Initial implementation
 * --------------------------------------------------------------------
 **/

var path = require("path");
var fs = require("fs-extra");
var os = require('os');

var getNetworkInterface = function() {
    var ifaces = os.networkInterfaces();
    var address = "*";
    for (var dev in ifaces) {
        var iface = ifaces[dev].filter(function(details) {
            return details.family === 'IPv4' && details.internal === false;
        });
        if (iface.length > 0) address = iface[0].address;
    }

    return address;
};


var application = require("./application");
global.application = application;

// Configure the settings
var settings = {};
var userDir = path.join(__dirname, ".application_settings"); //process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
var userSettingsFile = path.join(userDir, 'settings_' + require('os').hostname() + '.js');
var userSettingsFileJson = path.join(userDir, 'settings_' + require('os').hostname() + '.json');

if (fs.existsSync(userSettingsFileJson)) {
    settings = JSON.parse(fs.readFileSync(userSettingsFileJson, 'utf8'));
    settings.settingsFile = userSettingsFileJson;
} else if (fs.existsSync(userSettingsFile)) {
    settings = require(userSettingsFile);
    settings.settingsFile = userSettingsFile;
} else {
    var defaultSettings = path.join(__dirname, "default_settings.js");
    var settingsStat = fs.statSync(defaultSettings);
    var settingsFile;

    fs.copySync(defaultSettings, userSettingsFile);
    if (settingsStat.mtime.getTime() < settingsStat.ctime.getTime()) {
        // Default settings file has not been modified - safe to copy
        fs.copySync(defaultSettings, userSettingsFile);
        settingsFile = userSettingsFile;
    } else {
        // Use default default_settings.js as it has been modified
        settingsFile = defaultSettings;
    }
    settings = require(settingsFile);
    settings.settingsFile = settingsFile;
}

try {

    settings.userDir = userDir;
    // Check and configure the setting file
    settings.verbose = true;
    settings.uiPort = settings.uiPort || 1717;
    settings.uiHost = settings.uiHost || getNetworkInterface();

} catch (err) {
    console.log("Error loading settings file: " + settingsFile);
    if (err.code == 'MODULE_NOT_FOUND') {
        if (err.toString().indexOf(settingsFile) === -1) {
            console.log(err.toString());
        }
    } else {
        console.log(err);
    }
    process.exit();
}

/** initialize the plattform */
try {
    application.init(settings);
} catch (err) {
    console.log("Failed to initialize application CLIENT: " + err);
    process.exit(1);
}

// Start the plattform
application.start().then(function() {
    process.title = "Skill Invocation Client Demo - SP347";
}).otherwise(function(err) {
    console.log("Application failed to start!" + err);
    process.exit(1);
});

process.on('uncaughtException', function(err) {
    console.log('[application] Uncaught Exception:' + err.stack);
    process.exit(1);
});

// Stop the platform if the user request it
process.on('SIGINT', function() {
    application.stop();
    process.exit(0);
});