const sql = require("../sqlServer/ssql");
const schedule = require('node-schedule');
let parseDatafunc = require("./parseData");
let logger = require("../log4js/logger");
let config = require("../conf").config;


let outpath = config.local.outDir; //本地存放地址
let otherPath = config.local.otherDir; //四号报文存放路径
let taskId = "";
let task = "";

console.log("程序开始");

sql.query("SELECT  id  FROM catsic.dbo.d8_ais_storage WHERE nowStatus = 1", function (err, res) {
    if (err) {
        logger.err.error(err);
        return;
    }
    if (res.recordset.length !== 0) // 有程序正在执行
    {
        let id = res.recordset[0].id;
        logger.default.warn(`${id}号任务正在执行`);
        sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus = 0 WHERE id = ${id};`, function (err, res) {
            if (err) {
                logger.err.error(err);
                return;
            }
            logger.default.warn(`停止${id}号任务`);
            scheduleCronstyle()
        })
    } else {  //没有程序正在执行
        logger.default.warn(`没有任务正在执行`);
        scheduleCronstyle()
    }
});

function scheduleCronstyle() {

    // let rule = new schedule.RecurrenceRule();

    // rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次

    schedule.scheduleJob("1 * * * * *", function () {
        existRunningTask().then(getTaskID).then(getFilesList).then(parseData).then(finishTask)
    });
}

function existRunningTask() {
    return new Promise(function (resolve, reject) {
        try {
            sql.query("SELECT DISTINCT nowStatus FROM catsic.dbo.d8_ais_storage", function (err, res) {
                // console.log(err, res);
                if (res.recordset.map(obj => obj.nowStatus).indexOf(1) == -1)  //没有正在执行的任务
                {
                    logger.default.warn("没有正在执行的任务");
                    resolve(0)
                }
                else {
                    logger.default.warn("有一个任务正在执行");
                    return
                }
            })
        } catch (e) {
            logger.err.error(e);
            reject(e)
        }

    })
}

function getTaskID(res, err) {
    if (err) {
        logger.err.error(err);
        return
    }
    return new Promise(function (resolve, reject) {
        try {
            if (res === 0) //没有正在运行的任务
            {
                sql.query("SELECT *  FROM catsic.dbo.d8_ais_storage T WHERE T.nowStatus = 0", function (err, res) {

                    if (res.recordset.length > 0) {
                        //有多个任务
                        // todo 缺少时间格式
                        let packageinfo = res.recordset.map(obj => {
                            return {
                                files: JSON.parse(obj.packageInfo),
                                id: obj.id,
                                sourceId: obj.dataSourceId,
                                referenceTable: obj.referenceTable,
                                startDate: obj.startDate,
                                endDate: obj.endDate
                            }
                        });
                        //选取一个任务
                        packageinfo = packageinfo.sort((a, b) => {
                            if (a.startDate < b.startDate) {
                                return -1
                            } else {
                                return 1
                            }

                        });

                        task = packageinfo[0];
                        taskId = task.id;
                        logger.default.warn("开始执行任务" + task.id);

                        sql.query(`SELECT dataSourceId,ais_time_type, data_column_boundary FROM catsic.dbo.d1_dataSource T WHERE dataSourceId =${task.sourceId}`, function (err, res) {
                            task.dataSourceInfo = res.recordset[0];
                            sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 1 WHERE id = ${taskId}`, function (err, res) {
                                if (err) {
                                    logger.err.error(err);
                                    return
                                }
                                resolve(task)
                            })
                        })
                    } else {
                        logger.default.warn("没有等待执行的任务");
                    }
                })
            }
        } catch (e) {
            logger.err.error(e);
            reject(e)
        }
    })
}

function getFilesList(task, err) {
    if (err) {
        logger.err.error(err);
        return
    }


    return new Promise(async function (resolve, reject) {
        try {
            if (!task) {
                return
            }
            else {
                let list = [];
                for (let i in task.files) {
                    let file = task.files[i];
                    let fileObj = {
                            file: {
                                fileName: file.fileName,
                                path: file.path,
                                outPath: outpath + "/" + file.startTime.substr(0, 7).replace("-", ""),
                                otherPath: otherPath + "/" + file.startTime.substr(0, 7).replace("-", ""),
                                fileId: file.id
                            },
                            datesourceType: {
                                //todo
                                // ais_time_format: task.dataSourceInfo.ais_time_format,
                                ais_time_format: "YYYY-MM-DD:HH:mm:ss",
                                ais_time_type:
                                    parseInt(task.dataSourceInfo.ais_time_type),
                                data_column_boundary:
                                task.dataSourceInfo.data_column_boundary,
                                sourceid:
                                    parseInt(task.dataSourceInfo.dataSourceId)
                            }
                            ,
                            sortkey: file.startTime,
                        }
                    ;
                    list.push(fileObj)
                }
                resolve(list)
            }
        } catch (e) {
            logger.err.error(e);
            reject(e)
        }
    })
}


function parseData(data, err) {
    if (err) {
        logger.err.error(err);
        return
    }
    return new Promise(function (resolve, reject) {
        parseDatafunc.parseData(data, resolve)
    })
}

function finishTask(data, err) {
    if (err) {
        logger.err.error(err);
        return
    }

    if (data == 0) {
        sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 2 WHERE id = ${taskId}`, function (err, res) {
            logger.default.info(task.id + "号任务完成");
        });
    }
}

