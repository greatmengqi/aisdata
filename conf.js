let config = require("config-lite")({
    filename: 'default',
    config_basedir: __dirname,
    config_dir: 'config',
});

module.exports.config = config.default;
