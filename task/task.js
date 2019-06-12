const sql = require("../sqlServer/ssql");
const schedule = require('node-schedule');
let mssql = require("mssql");

let logger = require("../log4js/logger")
let fs = require("fs")
let taskexec = require("./taskexec");
let tasksql = require('./tasksql');

let task = "";


sql.query("SELECT  id  FROM catsic.dbo.d8_ais_task WHERE nowStatus = 1", function (err, res) {
    if (err) {
        logger.err.error(err)
        return;
    }

    if (res.recordset.length != 0) //有一个程序正在执行
    {
        let id = res.recordset[0].id
        logger.default.warn(`${id}号任务正在执行`)
        sql.query(`UPDATE catsic.dbo.d8_ais_task set nowStatus = 4 WHERE id = ${id};`, function (err, res) {
            if (err) {
                logger.err.error(err)
                return;
            }
            logger.default.warn(`停止${id}号任务`)
            scheduleCronstyle()
        })
    } else {//没有一个程序正在执行
        scheduleCronstyle()
    }

})

function scheduleCronstyle() {

    let rule = new schedule.RecurrenceRule();
    rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次
    // rule.minute = [0, 10, 20, 30, 40, 50];//每隔10分钟执行一次

    schedule.scheduleJob(rule, function () {
        existRunningTask().then(getTaskID).then(exec)
    });


}

function existRunningTask() {
    return new Promise(function (resolve, reject) {
        try {
            sql.query("SELECT  id  FROM catsic.dbo.d8_ais_task WHERE nowStatus = 1", function (err, res) {
                // console.log(err, res);
                if (res.recordset.length == 0)  //没有正在执行的任务
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
            logger.err.error(e)
            reject(e)
        }
    })
}

function getTaskID(res, err) {
    if (err) {
        logger.err.error(err)
        return
    }
    return new Promise(function (resolve, reject) {
        try {
            if (res == 0) //没有正在运行的任务
            {
                sql.query("SELECT *  FROM catsic.dbo.d8_ais_task T WHERE T.nowStatus = 4", function (err, res) {
                    if (res.recordset.length > 0) {
                        //有多个任务
                        let tasklist = res.recordset.map(obj => {
                            // console.log(obj);
                            return {
                                id: obj.id,
                                taskType: obj.taskType,
                                createTime: obj.createTime,
                                month: obj.startDate.replace("-", "").substr(0, 6),
                                startTime: obj.startDate,
                                endTime: obj.endDate,
                                info: JSON.parse(obj.taskInfo),
                            }
                        });
                        //选取一个任务
                        tasklist = tasklist.sort((a, b) => {
                            if (a.tasktime < b.tasktime) {
                                return -1
                            }
                            else {
                                return 1
                            }

                        });

                        task = tasklist[0];

                        logger.default.warn("开始执行任务" + task.id)

                        sql.query(`UPDATE catsic.dbo.d8_ais_task set nowStatus= 1 WHERE id = ${task.id}`, function (err, res) {
                            if (err) {
                                logger.err.error(err)
                                return
                            }
                            resolve(task)
                        })
                    } else {
                        logger.default.warn("没有等待执行的任务");
                    }
                })
            }
        } catch (e) {
            logger.err.error(e)
            reject(e)
        }
    })
}

function exec(task, err) {
    // console.log(res);
    if (err) {
        logger.err.error(err);
        return
    }
    return new Promise(function (resolve, reject) {
        try {
            if (task.taskType == -2) {
                taskexec.autoTask(task)
            } else if (task.taskType == -1) {
                taskexec.basicTask(task)
            }
            resolve(null)
        } catch (e) {
            logger.err.error(e)
            reject(e)
        }
    })
}
