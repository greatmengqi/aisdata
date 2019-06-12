let parseDate = require("./parseDate");
const async = require('async');
let mssql = require("mssql");
const db = require("../sqlServer/ssql");
var log4js = require("log4js");
const logconf = require("../../../../aisdata/log4js/conf");
const fs = require("fs");
let sqlserver = require("../../../../aisdata/sqlServer/sqlServerQuery");


log4js.configure(logconf.conf)


var logFile = log4js.getLogger();
var errorFile = log4js.getLogger('error');


// logFile.warn('log-dir is a configuration-item in the log4js.json');
// errorFile.error('In This Test log-dir is : \'./logs/log_test/\'');


async.auto(
    {
        //func1、func2是并行执行
        func1: getStaticShipInfo,
        getfilelistfromtable:getfilelistfromtable,
        func2: ["getfilelistfromtable",getFilesNameList],
        func3: ["func1", "func2", parsedate],
        func4: ["func3", function (results, callback) {
            let staticInfoMap = results.func3[0]
            let referenceTable = results.func3[1]


            let table = new mssql.Table('t41_ais_static_temp');
            table.create = true;

            table.columns.add('classType', mssql.NVarChar(1), {nullable: true});
            table.columns.add('imo', mssql.VarChar(255), {nullable: true});
            table.columns.add('callsign', mssql.VarChar(255), {nullable: true});
            table.columns.add('shipname', mssql.VarChar(255), {nullable: true});
            table.columns.add('eta', mssql.VarChar(255), {nullable: true});
            table.columns.add('dest', mssql.VarChar(255), {nullable: true});
            table.columns.add('length', mssql.Float, {nullable: true});
            table.columns.add('width', mssql.Float, {nullable: true});
            table.columns.add('draught', mssql.VarChar(255), {nullable: true});
            table.columns.add('cargo', mssql.VarChar(255), {nullable: true});
            table.columns.add('mmsi', mssql.VarChar(255), {nullable: false, primary: true});
            table.columns.add('time', mssql.Int, {nullable: true});


            console.log(staticInfoMap);
            // console.log(referenceTable);
            for (let i in staticInfoMap) {
                table.rows.add(
                    staticInfoMap[i].classType,
                    staticInfoMap[i].imo,
                    staticInfoMap[i].callsign,
                    staticInfoMap[i].shipname,
                    staticInfoMap[i].eta,
                    staticInfoMap[i].dest,
                    staticInfoMap[i].length,
                    staticInfoMap[i].width,
                    staticInfoMap[i].draught,
                    staticInfoMap[i].cargo,
                    staticInfoMap[i].mmsi,
                    staticInfoMap[i].time
                );


            }
            db.query("drop TABLE catsic.dbo.t41_ais_static_temp;", function (err, res) {
                db.bulkInsert(table, function (err, result) {
                    if (err) {
                        errorFile.error("插入临时表失败", err)
                    }
                    else {
                        logFile.info("插入临时表成功", result)
                    }

                    db.query("delete from catsic.dbo.t41_ais_static where mmsi in (SELECT mmsi from catsic.dbo.t41_ais_static_temp );", function (err, res) {
                        if (err) {
                            errorFile.error("删除主表的重复数据失败", err)
                        } else {
                            logFile.info("删除主表的重复数据成功", result)
                        }


                        db.query("INSERT into catsic.dbo.t41_ais_static SELECT * FROM catsic.dbo.t41_ais_static_temp;", function (err, res) {
                            if (err) {
                                errorFile.error("数据导入失败", err)
                            } else {
                                logFile.info("数据导入成功", res)
                            }

                        })
                    })
                })
            })

            callback(null, 1)
        }]

    },
    function (err, results) {
        // console.log('err = ', err);
        // console.log('results = ', results);
    });



function getfilelistfromtable(callback) {
    //读取数据库
    let files = []
    let sql = `SELECT t1.path+t1.fileName as pathName,t2.ais_time_type,t2.data_column_boundary FROM catsic.dbo.d3_package t1 
        LEFT JOIN d1_dataSource t2 ON t1.dataSourceId = t2.id WHERE t1.invalidTime is NULL AND t1.status = 2;`
    sqlserver.async_query(sql).then(
        function (asyncQuery) {
            for (let i in asyncQuery) {
                files.push(asyncQuery[i].pathName)
            }
            callback(null,files)
        }
    );
}
function getStaticShipInfo(callback) {

    let sentence = `SELECT * from catsic.dbo.t41_ais_static;`
    sqlserver.query(sentence, function (err, res) {
        console.log(res);
        let tableMap = {}
        for (let i in res.recordset) {
            let mmsi = res.recordset[i].mmsi
            tableMap[mmsi] = res.recordset[i]
        }
        let referenceTable = JSON.parse(JSON.stringify(tableMap))

        callback(null, tableMap, referenceTable)
    })
}

function getFilesNameList(res,callback) {
    let fileListPath = "/Users/chenmengqi/catsicts/cs/src/aisdata/filelist.txt"
    let files = []

    if (fs.existsSync(fileListPath)) {
        files = fs.readFileSync(fileListPath).toString().split("\n");
        logFile.info(files)
    }
    else {
        files = res.getfilelistfromtable
    }

    let list = []

    for (let i in files) {
        if(files[i])
        {
            let file = {
                path: files[i],
                name: 'test',
                realNum: 0,
                size: 0
            };
            let datesourceType = {
                ais_time_type: 0,
                data_column_boundary: 3
            };
            let obj = {file: file, datesourceType: datesourceType}
            list.push(obj)
        }
    }
    callback(null, list)
}

function parsedate(results, callback) {
    // 获取解析文件列表
    let filesList = results.func2
    logFile.info(filesList);
    let staticInfoMap = results.func1[0];
    let referenceTable = results.func1[1];

    let prmlist = []

    for (let i in filesList) {
        let file = filesList[i]
        let path = file.file.path.replace("log", "tsv")
        console.log(path);
        db.query(`insert into catsic.dbo.t41_filelist(filepath,inhbase)VALUES('${path}',0);`, function (err, res) {
            console.log(err, res, 123);
            prmlist.push(parseDate.readEachLine(file.file, file.datesourceType, staticInfoMap))
        })


    }

    Promise.all(prmlist).then(
        function () {
            callback(null, [staticInfoMap, referenceTable]);
        }
    )


}

