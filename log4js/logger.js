var log4js = require("log4js");
const logconf = require("./conf");
log4js.configure(logconf.conf)


let logger = {};

logger.default = log4js.getLogger();
logger.err = log4js.getLogger("error");


module.exports = logger;
