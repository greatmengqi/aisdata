var conf = {
    appenders: { //日志追加者
        out: {type: 'console'},
        // task: {type: 'dateFile', filename: 'logs/task', "pattern": "yyyy-MM-dd.log", alwaysIncludePattern: true},
        // result: {type: 'dateFile', filename: 'logs/result', "pattern": "yyyy-MM-dd.log", alwaysIncludePattern: true},
        error: {type: 'dateFile', filename: 'logs/error', "pattern": "yyyy-MM.log", alwaysIncludePattern: true},
        default: {type: 'dateFile', filename: 'logs/default', "pattern": "yyyy-MM.log", alwaysIncludePattern: true},
        // rate: {type: 'dateFile', filename: 'logs/rate', "pattern": "yyyy-MM-dd.log", alwaysIncludePattern: true}
    },
    categories: {
        default: {appenders: ['out', 'default'], level: 'info'},
        // task: {appenders: ['task'], level: 'info'},
        // result: {appenders: ['result'], level: 'info'},
        error: {appenders: ['error'], level: 'error'},
        // rate: {appenders: ['rate'], level: 'warn'}
    }
}

module.exports.conf = conf;
