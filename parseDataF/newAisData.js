const async = require('async');
var schedule = require('node-schedule');
const db = require('../../../../aisdata/blmutil/sqlServer');
const fs = require('fs');
const lineReader = require('line-reader')
const Promise = require('bluebird');
const parseData = require("./parseDateNew")
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const readFile = promisify(fs.readFile);
const readLine = promisify(lineReader.open);


async.waterfall([
    getStaticShipInfo,
    getFilesName,
    analyticalData,
], function (err, staticInfoMap, referenceTable)
{
    // result now equals 'done'
    console.log(staticInfoMap);
    console.log(referenceTable);
    for (let i in staticInfoMap) {
        let sql = ""
        if (referenceTable[i]==null) {
            sql = `insert into catsic.dbo.t41_ais_static
            (classType,imo,callsign,shipname,eta,dest,length,width,draught,cargo,mmsi,time)values(
            '${staticInfoMap[i].classType}',
            '${staticInfoMap[i].imo}',
            '${staticInfoMap[i].callsign}',
            '${staticInfoMap[i].shipname}',
            '${staticInfoMap[i].eta}',
            '${staticInfoMap[i].dest}',
            '${staticInfoMap[i].length}',
            '${staticInfoMap[i].width}',
            '${staticInfoMap[i].draught}',
            '${staticInfoMap[i].cargo}',
            '${staticInfoMap[i].mmsi}',
            '${staticInfoMap[i].time}'
            );`
        }
        else {
            sql = `
            UPDATE catsic.dbo.t41_ais_static set 
            classType = '${staticInfoMap[i].classType}',
            imo='${staticInfoMap[i].imo}',
            callsign='${staticInfoMap[i].callsign}',
            shipname='${staticInfoMap[i].shipname}',
            eta='${staticInfoMap[i].eta}',
            dest='${staticInfoMap[i].dest}',
            length='${staticInfoMap[i].length}',
            width='${staticInfoMap[i].width}',
            draught='${staticInfoMap[i].draught}',
            cargo='${staticInfoMap[i].cargo}',
            mmsi='${staticInfoMap[i].mmsi}',
            time='${staticInfoMap[i].time}'
            WHERE mmsi = '${staticInfoMap[i].mmsi}';`
        }
        console.log(sql);
        db.sql(sql,function (err, res) {
            // console.log(err,res);
        })
    }
});


function getStaticShipInfo(callback) {

    let sentence = `SELECT * from catsic.dbo.t41_ais_static;`
    db.sql(sentence, function (err, res) {
        let tableMap = {}
        for (let i in res.recordset) {
            let mmsi = res.recordset[i].mmsi
            tableMap[mmsi] = res.recordset[i]
        }
        let referenceTable = JSON.parse(JSON.stringify(tableMap))


        callback(null, tableMap, referenceTable)
    })
}

function getFilesName(staticInfoMap, referenceTable, callback) {

    let fileList = []
    let initPath = '/Users/chenmengqi/catsicts/cs/data'

    function readDirRecur(file, callback) {
        return readdir(file).then(
            (files) => {
                files = files.map((item) => {
                    var fullPath = file + '/' + item;
                    return stat(fullPath).then((stats) => {
                        if (stats.isDirectory()) {
                            // let temp = fullPath.replace("/Users/chenmengqi/catsicts/cs/data/", "/Users/chenmengqi/catsicts/cs/temp/")
                            // fs.mkdirSync(temp)
                            return readDirRecur(fullPath, callback);
                        } else {
                            /*not use ignore files*/
                            if (item[0] == '.') {
                                //console.log(item + ' is a hide file.');
                            } else {
                                fileList.push(fullPath)
                                callback && callback(fullPath)
                            }
                        }
                    })
                });
                return Promise.all(files);
            });
    }

    readDirRecur(initPath, function (filePath) {

    }).then(function () {

        // console.log(fileList)

        let contentList = fileList.map((filePath => {
            return new Promise(
                resolve => {
                    lineReader.open(filePath, function (err, reader) {
                        if (err) {
                            console.log(err);
                        }
                        if (reader.hasNextLine()) {
                            reader.nextLine(function (undefined, line) {
                                resolve(filePath + ":::" + line)
                            });
                        }
                    });
                }
            )
        }))
        Promise.all(contentList).then(filesName => callback(null, staticInfoMap, referenceTable, filesName))
    })


}

function analyticalData(staticInfoMap, referenceTable, filesName, callback) {

    for (let i in filesName) {
        let line = filesName[i]
        line = line.split(":::")
        let localpath = line[0]
        let firstline = line[1]
        if (i != filesName.length - 1) {
            transdata(localpath, firstline, staticInfoMap)
        }
        else {
            transdata(localpath, firstline, staticInfoMap).then(
                function () {
                    callback(null, staticInfoMap, referenceTable)
                }
            )

        }
    }


    // filesName.forEach(line => {
    //     line = line.split(":::")
    //     let localpath = line[0]
    //     let firstline = line[1]
    //     transdata(localpath, firstline,staticInfoMap)
    // })
    // callback(null,staticInfoMap)
}


function print(arg1, callback) {
    console.log(arg1);
}

function promisify(fn) {
    return function () {
        var args = arguments;
        return new Promise(function (resolve, reject) {
            [].push.call(args, function (err, result) {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            fn.apply(null, args);
        });
    }
}

function transdata(path, firstline, staticInfoMap) {

    let parm = {
        file: {
            path: path,
            // name: 'test',
            realNum: 0,
            size: 0
        },
        sourceType: {
            ais_time_type: 0,  //
            data_column_boundary: 3
        }
    }


    if (firstline.indexOf(":;") > 0) //那就是4
    {
        parm.sourceType.ais_time_type = 0
        parm.sourceType.data_column_boundary = 4
    }
    else { //那就是3
        parm.sourceType.ais_time_type = 0
        parm.sourceType.data_column_boundary = 3

    }


    console.log("正在解析文件：" + path)
    return parseData.readEachLine(parm.file, parm.sourceType, staticInfoMap)
}
