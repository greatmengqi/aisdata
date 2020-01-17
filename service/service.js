const sql = require("../sqlServer/ssql");
const schedule = require('node-schedule');
let parseDatafunc = require("../parseData");
let log = require("../log4js/logger");
let config = require("../conf").config;
let cluster = require("cluster");
let fs = require("fs");
const parseDatefunc = require("../parseDataF/newparseDate");


let taskId = "";
let task = "";
let job = "";


if (cluster.isMaster) {
    sql.query("SELECT  id  FROM catsic.dbo.d8_ais_storage WHERE nowStatus = 1", function (err, res) {
        if (err) {
            log.default.error("启动检测：无法检测到解析任务状态，请检查数据库连接是否有误");
            process.exit(-1)
        }
        if (res.recordset.length !== 0) // 有程序正在执行
        {
            let id = res.recordset[0].id;
            log.default.warn(`启动检测：正在执行任务数量：1,任务ID:${id}`);

            sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus = 0 WHERE id = ${id};`, function (err, res) {
                if (err) {
                    log.default.error("启动检测：无法自动关闭正在执行的任务，请手动关闭");
                    process.exit(-1);
                }

                log.default.warn(`启动检测：停止任务,任务ID:${id}`);
                scheduleCronstyle()
            })
        } else {  //没有程序正在执行
            log.default.warn(`启动检测：正在执行任务数量：0`);
            scheduleCronstyle()
        }
    });

    function scheduleCronstyle() {

        let rule = new schedule.RecurrenceRule();

        rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次

        job = schedule.scheduleJob(rule, function () {

            existRunningTask().then(getTask).then(getFiles).then(parseData).then(finishTask).catch(ex => {

                switch (ex) {
                    case "success":
                        break;

                    case "file err":
                        sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 0 WHERE id = ${taskId}`, function (err, res) {
                            log.default.info("任务失败，带解析数据不存在");
                        });
                        break;
                    default :
                        log.default.error("任务退出");
                        //todo 修改任务状态
                        return true
                }

            })

        });
    }

    function existRunningTask() {
        return new Promise(function (resolve, reject) {
            try {
                sql.query("SELECT DISTINCT nowStatus FROM catsic.dbo.d8_ais_storage", function (err, res) {
                    // console.log(err, res);
                    if (res.recordset.map(obj => obj.nowStatus).indexOf(1) == -1)  //没有正在执行的任务
                    {
                        log.default.warn("正在执行任务数量：0");
                        resolve(0)
                    }
                    else {
                        log.default.warn("正在执行任务数量：1");
                        reject("success")
                    }
                })
            } catch (error) {
                reject("exit")
            }
        })
    }

    function getTask(task) {
        return new Promise(function (resolve, reject) {
            try {
                sql.query("SELECT *  FROM catsic.dbo.d8_ais_storage T WHERE T.nowStatus = 0 and T.invalidTime is null", function (err, res) {
                    if (res.recordset.length > 0) {

                        log.default.warn("等待执行任务数量：" + res.recordset.length);


                        //有多个任务
                        let package = res.recordset.map(obj => {
                            return {
                                files: JSON.parse(obj.packageInfo),
                                id: obj.id,
                                sourceId: obj.dataSourceId,
                                startDate: obj.startDate,
                                endDate: obj.endDate,
                                month: obj.startDate.replace("-", "").substring(0, 6)
                            }
                        });

                        //选取一个任务
                        package = package.sort((a, b) => {
                            if (a.startDate < b.startDate) {
                                return -1
                            } else {
                                return 1
                            }

                        });

                        task = package[0];
                        taskId = task.id;
                        log.default.warn("开始执行任务" + task.id);
                        let query =
                            `SELECT dataSourceId,ais_time_type, data_column_boundary,aisDataFileTimeStr FROM catsic.dbo.d1_dataSource T WHERE dataSourceId =${task.sourceId} and invalidTime is  null`
                        sql.query(query, function (err, res) {
                            task.dataSourceInfo = res.recordset[0];
                            sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 1 WHERE id = ${taskId}`, function (err, res) {
                                if (err) {
                                    reject("exit")
                                }
                                resolve(task, taskId)
                            })
                        })
                    }
                    else {
                        log.default.warn("等待执行任务数量：0");
                        reject("success")
                    }
                })
            } catch (e) {
                reject("exit");
            }
        })
    }


    function getFiles(task) {

        log.default.warn("获取待解析文件…………");
        return new Promise(async function (resolve, reject) {
            try {
                let list = [];
                let successful = true;

                task.files.forEach(jar => {
                    list = [...list, ...jar.tableFileInfo.map(file => {

                        if (!checkfile(file.filePath)) {
                            log.default.error(file.filePath + " not exist !!!")
                            successful = false
                        }

                        // todo
                        return {
                            file: {
                                filename: file.fileName,
                                path: file.filePath,
                                outpath: file.endPathStr,
                                otherpath: file.endPathStr + ".other",
                                id: file.id,
                                jarName: jar.endPathRar,
                                localoutpath: `/data/aisdata/${task.month}`,
                                localotherpath: `/data/otherdata/${task.month}`
                            },
                            datesourceType: {
                                //todo
                                ais_time_format: task.dataSourceInfo.aisDataFileTimeStr,
                                ais_time_type: task.dataSourceInfo.ais_time_type,
                                data_column_boundary: task.dataSourceInfo.data_column_boundary,
                                sourceid: parseInt(task.dataSourceInfo.dataSourceId)
                            },
                            taskId: task.id
                        }
                    })];
                });


                if (successful) {

                    // 新建当月数据存放位置
                    if (!fs.existsSync(`/data/aisdata/${task.month}`)) {
                        fs.mkdirSync(`/data/aisdata/${task.month}`)
                    }

                    if (!fs.existsSync(`/data/otherdata/${task.month}`)) {
                        fs.mkdirSync(`/data/otherdata/${task.month}`)
                    }

                    // 删除6个月之前的数据

                    if (fs.existsSync(`/data/aisdata/${lastSixMonth(task.month)}`)) {
                        fs.rmdirSync(`/data/aisdata/${lastSixMonth(task.month)}`)
                    }

                    if (fs.existsSync(`/data/otherdata/${lastSixMonth(task.month)}`)) {
                        fs.rmdirSync(`/data/otherdata/${lastSixMonth(task.month)}`)
                    }

                    sql.query(`update catsic.dbo.d8_ais_storage set packageNum= ${list.length} WHERE id = ${taskId}`, function (err) {
                        resolve(list)
                    });

                } else {
                    reject("file err");
                }
            } catch (e) {
                reject("exit")
            }
        })
    }

    function lastSixMonth(currentMonth) {
        year = currentMonth.substring(0, 4);
        month = currentMonth.substring(4);


        ms = {
            "01": "08",
            "02": "09",
            "03": "10",
            "04": "11",
            "05": "12",
            "06": "01",
            "07": "02",
            "08": "03",
            "09": "04",
            "10": "05",
            "11": "06",
            "12": "07"
        };

        if (month <= "05") {
            return `${parseInt(year) - 1}${ms[month]}`
        } else {
            return `${parseInt(year)}${ms[month]}`
        }
    }


    function parseData(data) {
        log.default.warn("开始解析…………");
        log.default.warn("待解析文件数量:" + data.length);
        console.log(data);
        return new Promise(function (resolve, reject) {
            parseDatafunc.parseData(data, resolve)
        })
    }

    function finishTask(data) {
        // console.log("data", data);
        if (data === 0) {
            sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 2 WHERE id = ${taskId}`, function (err, res) {
                log.default.info(task.id + "号任务完成");
            });
        }
    }

    function checkfile(file) {
        if (!fs.existsSync(file)) {
            return false
        }
        return true
    }

    function exist(error) {
        log.default.error(error);
        sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus=3  WHERE id = ${taskId}`, function (err, res) {
            log.default.info(task.id + "号任务失败");
            return
        })
    }
}
// 工作进程
else if (cluster.isWorker) {
    process.on('message', function (msg) {

        if (msg.topic === "fork_success" && msg.flag === 0) {
            // log.default.info("child start !!!");
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
            }).then(function (data) {
                // 子进程发送消息,0代表解析成功
                log.default.info("task finished :", msg.data.file.path);
                process.send({
                    topic: "task_finished_message",
                    flag: 0, //0成功 -1失败
                    data: {task: msg.data},
                    taskId: msg.data.taskId
                });
            });
        }
    });


    process.on('disconnect', () => {
        console.log('工作进程成功退出');
        process.exit(0);
    });
}





