const sql = require("../sqlServer/ssql");
const schedule = require('node-schedule');
const Map = require("../parseDataF/parseDateConf/Map.js");
const AisObject = require("../parseDataF/parseDateConf/AisObject.js");
let parseDatafunc = require("./parseData");
let mssql = require("mssql");
let async = require("async");
let logger = require("../log4js/logger")
let fs = require("fs")

let path = "C:\\Users\\great\\Desktop\\data\\新建文件夹"
let outpath = "C:\\Users\\great\\Desktop\\data\\新建文件夹\\"
let inputtable = ""
let outputtable = "t41_ais_static_" + Date.now();
let taskId = ""
let task = "";
let warn = {type: 0, status: 0, note: ""}

sql.query("SELECT  id  FROM catsic.dbo.d8_ais_storage WHERE nowStatus = 1", function (err, res) {
    if (err) {
        logger.err.error(err)
        return;
    }

    if (res.recordset.length != 0) //有一个程序正在执行
    {
        let id = res.recordset[0].id
        logger.default.warn(`${id}号任务正在执行`)
        sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus = 0 WHERE id = ${id};`, function (err, res) {
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
    // rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次
    // rule.minute = [0, 10, 20, 30, 40, 50];//每隔10分钟执行一次

    schedule.scheduleJob("0-59 * * * * *", function () {

        existRunningTask().then(getTaskID).then(getFilesList).then(getStaticMap).then(parseData).then(storeStaticMap)

    });


}

function existRunningTask() {
    return new Promise(function (resolve, reject) {
        try {
            sql.query("SELECT DISTINCT nowStatus  FROM catsic.dbo.d8_ais_storage", function (err, res) {
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
                sql.query("SELECT *  FROM catsic.dbo.d8_ais_storage T WHERE T.nowStatus = 0", function (err, res) {

                    if (res.recordset.length > 0) {
                        //有多个任务
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
                        inputtable = task.referenceTable
                        taskId = task.id
                        logger.default.warn("开始执行任务" + task.id)

                        sql.query(`SELECT dataSourceId,ais_time_type, data_column_boundary FROM catsic.dbo.d1_dataSource T WHERE dataSourceId =${task.sourceId}`, function (err, res) {
                            task.dataSourceInfo = res.recordset[0]
                            console.log(task);
                            sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 1 WHERE id = ${taskId}`, function (err, res) {
                                if (err) {
                                    logger.err.error(err)
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
            logger.err.error(e)
            reject(e)
        }
    })
}

function getFilesList(task, err) {
    if (err) {
        logger.err.error(err)
        return
    }

    return new Promise(async function (resolve, reject) {
        try {
            if (!task) {
                return
            }
            else {
                let list = []
                for (let i in task.files) {
                    let file = task.files[i];
                    let fileObj = {
                        file: {
                            fileName: file.fileName,
                            path: file.path + file.fileName, //使用真实路径
                            outpath: outpath + file.fileName + ".tsv",
                            taskId: taskId,
                            fileId: file.id,
                            startTime: file.startTime
                        }
                        ,
                        datesourceType: {
                            ais_time_type: parseInt(task.dataSourceInfo.ais_time_type),
                            data_column_boundary: task.dataSourceInfo.data_column_boundary,
                            sourceid: parseInt(task.dataSourceInfo.dataSourceId)
                        },
                        sortkey: file.startTime,
                    };

                    list.push(fileObj)
                }


                resolve(list.sort((a, b) => {
                    if (a.sortkey < b.sortkey) {
                        return -1
                    } else {
                        return 1
                    }
                }))
            }

        } catch (e) {
            logger.err.error(e)
            reject(e)
        }
    })

}

function getStaticMap(fileList, err) {
    if (err) {
        logger.err.error(err)
        return
    }
    return new Promise(function (resolve, reject) {
        try {
            sql.query(`SELECT * from  ${inputtable.split(".").map(str => {
                return "[" + str + "]"
            }).reduce((a, b) => {
                return a + "." + b
            })};`, function (err, res) {
                staticMap = new Map()

                let objarr = res.recordset

                for (let i in objarr) {
                    let obj = new AisObject();
                    obj.mmsi = objarr[i].mmsi;
                    obj.statictimestamp = objarr[i].statictimestamp;
                    obj.time = objarr[i].time;
                    obj.unstatictimestamp = objarr[i].unstatictimestamp;


                    obj.imo = objarr[i].imo;
                    obj.name = objarr[i].name;
                    obj.callsign = objarr[i].callsign;
                    obj.cargo = objarr[i].cargo;
                    obj.length = objarr[i].length;
                    obj.width = objarr[i].width;
                    obj.eta = objarr[i].eta;
                    obj.draught = objarr[i].draught;
                    obj.dest = objarr[i].dest;
                    obj.pos_type = objarr[i].pos_type;


                    obj.init_time = objarr[i].init_time;
                    obj.lon = objarr[i].lon;
                    obj.lat = objarr[i].lat;
                    obj.mileage = objarr[i].mileage;
                    obj.speed = objarr[i].speed
                    obj.static_init_flag = objarr[i].static_init_flag;
                    obj.unstatic_init_flag = objarr[i].unstatic_init_flag;

                    staticMap.put(obj.mmsi, obj)

                }
                resolve({staticMap: staticMap, fileList: fileList});
            })
        } catch (e) {
            logger.err.error(e)
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

function storeStaticMap(map, err) {
    if (err) {
        logger.err.error(err);
        return
    }
    return new Promise(function (resolve, reject) {

        let staticMapkeys = map.keys
        let staticMap = map.data


        let table = new mssql.Table("t41_ais_static_" + task.endDate);
        table.create = true;
        table.columns.add('mmsi', mssql.Int, {nullable: false, primary: true});
        table.columns.add('timestamp', mssql.Int, {nullable: false});
        table.columns.add('imo', mssql.NVarChar(255), {nullable: true});
        table.columns.add('name', mssql.NVarChar(255), {nullable: true});
        table.columns.add('callsign', mssql.NVarChar(255), {nullable: true});
        table.columns.add('cargo', mssql.Int, {nullable: false});
        table.columns.add('length', mssql.Float, {nullable: false});
        table.columns.add('width', mssql.Float, {nullable: false});
        table.columns.add('eta', mssql.BigInt, {nullable: false});
        table.columns.add('draught', mssql.Int, {nullable: false});
        table.columns.add('dest', mssql.NVarChar(255), {nullable: true});
        table.columns.add('classType', mssql.NVarChar(255), {nullable: true});

        for (let i in staticMapkeys) {
            let key = staticMapkeys[i]
            let value = staticMap[key]

            table.rows.add(
                    value.mmsi,
                    value.time ? value.time : 0,
                    value.imo,
                    value.name,
                    value.callsign,
                    value.cargo,
                    value.length,
                    value.width,
                    value.eta,
                    value.draught,
                    value.dest,
                    value.classType);
        }

        // console.log(outputtable);
        sql.bulkInsert(table, function (err, res) {
            if (err) {
                logger.err.error(err)
                return
            }
            sql.query(`INSERT INTO catsic.dbo.d8_reference_tables (createtime,tablename,startDate,endDate) values(${parseInt(Date.now() / 1000)},'AIS_DATA.dbo.${"t41_ais_static_" + task.endDate}','${task.startDate}','${task.endDate}')`, function (err, res) {
                if (err) {
                    console.log(err);
                }
                logger.default.info(`生成新的表格`)
            });
            sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 2 WHERE id = ${taskId}`, function (err, res) {
                logger.default.info(`${taskId}号任务执行成功`)
            });
            // sql.transaction(function (mssql, transaction, con) {
            //
            //     transaction.begin(function (err) {
            //         if (err) {
            //             logger.err.error(err)
            //             return;
            //         }
            //         //定义一个变量,如果自动回滚,则监听回滚事件并修改为true,无须手动回滚
            //         var rolledBack = false;
            //
            //         //监听回滚事件
            //         transaction.on('rollback', function (aborted) {
            //             logger.err.error('监听回滚')
            //             rolledBack = true;
            //         });
            //
            //         //监听提交事件
            //         transaction.on('commit', function () {
            //             logger.default.warn("监听提交")
            //             rolledBack = true;
            //         });
            //
            //         var request = new mssql.Request(transaction);
            //
            //
            //         var task1 = function (callback) {
            //             request.query(`DROP TABLE ${inputtable}`, function (err, result) {
            //                 if (err) {
            //                     logger.err.error(err)
            //                     callback(err, null);
            //                     return;
            //                 }
            //                 logger.default.warn(`${inputtable}删除成功`)
            //                 callback(null, result)
            //             })
            //
            //         };
            //         var task2 = function (callback) {
            //             request.query(`EXEC sp_rename '${outputtable}', '${inputtable}';`, function (err, result) {
            //                 if (err) {
            //                     console.log(err);
            //                     callback(err, null);
            //                     return;
            //                 }
            //                 logger.default.warn(`${outputtable}变更表名为${inputtable}`)
            //                 callback(null, result)
            //             })
            //
            //         };
            //
            //         async.series([task1, task2], function (err, result) {
            //             if (err) {
            //                 if (!rolledBack) {
            //
            //                     //如果sql语句错误会自动回滚,如果程序错误手动执行回滚,不然事物会一致挂起.
            //                     transaction.rollback(function (err) {
            //                         if (err) {
            //                             logger.err.error('rollback err :', err)
            //                             return;
            //                         }
            //                     });
            //                 }
            //             } else {
            //                 //执行提交
            //                 transaction.commit(function (err) {
            //                     if (err) {
            //                         logger.err.error('commit err :', err)
            //                         return;
            //                     }
            //                     logger.default.warn('提交成功')
            //                     sql.query(`UPDATE catsic.dbo.d8_ais_storage set nowStatus= 2 WHERE id = ${taskId}`, function (err, res) {
            //                         logger.default.info(`${taskId}号任务执行成功`)
            //                     });
            //                     con.close()
            //
            //                 });
            //             }
            //         })
            //     });
            //
            // })
        })
    })
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
