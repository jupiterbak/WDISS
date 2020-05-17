/*global require,setInterval,console */
const path = require("path")
const opcua = require("node-opcua");
var yaml_config = require('node-yaml-config');
var config = yaml_config.load(__dirname + '/config.yml');

var Skill = require("./Skill.js");
var internal_kill = null;

const winston = require('winston');
const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize({ all: true }),
        winston.format.printf((log) => {
            return `${log.timestamp} - [${log.level}] | [${log.service}] : ${log.message}`;
        })
    ),
    defaultMeta: { service: 'Dummy Server' },
});

// Let's create an instance of OPCUAServer
var nodeset_filenames = [opcua.nodesets.standard,
    opcua.nodesets.di
];
if (config.server.serverNodeSet) {
    for (let index = 0; index < config.server.serverNodeSet.length; index++) {
        config.server.serverNodeSet[index] = path.join(__dirname, config.server.serverNodeSet[index]);
    }
    nodeset_filenames = nodeset_filenames.concat(config.server.serverNodeSet);
}

const server = new opcua.OPCUAServer({
    port: config.server.port,
    timeout: 15000,
    maxAllowedSessionNumber: 100,
    buildInfo: {
        productName: config.server.buildInfo.productName,
        buildNumber: config.server.buildInfo.buildNumber,
        buildDate: Date.now()
    },
    serverInfo: {
        applicationUri: config.server.serverInfo.applicationUri,
        productUri: config.server.serverInfo.productUri,
        applicationName: { text: config.server.serverInfo.applicationName }
    },
    nodeset_filename: nodeset_filenames,
    alternateHostname: config.server.ip,
    isAuditing: false,
    userManager: {
        isValidUser: function(userName, password) {
            if (userName === config.server.username && password === config.server.password) {
                return true;
            }
            if (userName === "root" && password === "root") {
                return true;
            }
            return false;
        }
    },
    allowAnonymous: config.server.allowAnonymous
});

function post_initialize() {
    // Initialize the internal state machine
    internal_kill = new Skill(logger, server);
    internal_kill.initialize();

    server.start(function() {
        process.title = "InsertSkill - SP347 Dummy server";
        logger.info("Server is now listening ... ( press CTRL+C to stop)");
        logger.info("port " + server.endpoints[0].port);
        const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        logger.info("The primary server endpoint url is " + endpointUrl);

        // Start the state machine
        internal_kill.start();
    });
}
server.initialize(post_initialize);

process.on('uncaughtException', function(err) {
    logger.info('Uncaught Exception:' + err.stack);

    process.exit(1);
});

// Stop the platform if the user request it
process.on('SIGINT', function() {
    logger.info("Shuting down Server  ... ( press CTRL+C to stop)");
    //internal_kill.stop();
    //internal_kill.clear();

    server.shutdown();
    process.exit(0);
});