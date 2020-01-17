const fileUtil = require("./fileUtil");
let fs = require("fs");
const parseData = require("./parseData");
const async = require('async');
let config = require("./conf").config;
let cluster = require("cluster");
const parseDatefunc = require("./parseDataF/newparseDate");
let log = require("./log4js/logger");


if (cluster.isMaster) {

    let month = process.argv[2];


    let path = config.local.inDir + "/" + month;
    let outPath = config.local.outDir + "/" + month;
    let otherPath = config.local.otherDir + "/" + month;


    if (!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath)
    }

    if (!fs.existsSync(otherPath)) {
        fs.mkdirSync(otherPath)
    }

    async.auto(
        {
            func1: function (callback) {
                fileUtil.getfilelist(path, outPath, otherPath, callback)
            },
            func2: ["func1", function (res, callback) {
                parseData.parseData(res.func1, callback, true)
            }]
        }, function (err, res) {

        }
    );
}
else if (cluster.isWorker) {

    process.on('message', function (msg) {
        if (msg.topic === "fork_success" && msg.flag === 0) {
            log.default.info("child start !!!");
            process.send({
                topic: "child_ready_message",
                flag: 0, //0成功 -1失败
                data: {pid: process.pid}
            });
        }
        else if (msg.topic === "task_message" && msg.flag === 0) {


            log.default.info("child start task:", msg.data.file.path);

            new Promise(function (resolve, reject) {
                parseDatefunc.readEachLine(msg.data.file, msg.data.datesourceType, resolve, reject)
            }).then(function (err, data) {
                // 子进程发送消息,0代表解析成功
                log.default.info("task finished :", msg.data.file.path);

                fs.writeFileSync("./file", msg.data.file.path.trim() + "\n", {encoding: 'utf8', flag: 'a'});

                process.send({
                    topic: "task_finished_message",
                    flag: 0, //0成功 -1失败
                    data: {file: msg.data.file}
                });
            });
        }
    });

    process.on('disconnect', () => {
        console.log('工作进程成功退出');
        process.exit(0)
    });
}
