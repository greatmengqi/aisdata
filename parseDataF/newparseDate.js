const lineReader = require('line-reader');
const util = require('util');
const fs = require('fs');


var readline = require('readline');


const timeUtil = require('./parseDateConf/TimeUtil');
const AisDecode = require("./parseDateConf/blmParser.js").aisDecode;
const Map = require("./parseDateConf/Map.js");
const AisObject = require("./parseDateConf/AisObject.js");
const WriteToFile = require("./parseDateConf/BlmFile.js").writeToFile;

const Promise = require('bluebird');
var eachLine = Promise.promisify(lineReader.eachLine)


function parseMessage(files, datesourceType, cb) {
    return new Promise(async function (resolve, reject) {
        let len = files.length;
        for (let i = 0; i < len; i++) {
            await readEachLine(files[i], datesourceType);
        }
        cb();
    })
}


function readEachLine(file, datesourceType) {
    return new Promise(async function (resolve, reject) {
        try {
            let mapAisLast = new Map();
            let count = 0;
            let aisPacket = "";
            let lastline = ""
            lineReader.eachLine(file.path, async function (line, last) {
                        if (line == "") {
                            return
                        }


                        if (line.indexOf("!") != 0 && line.length < 30) {
                            lastline = line
                            return  //时间
                        }
                        else {  //非时间行
                            if (line.indexOf("!") == 0) {
                                line = lastline.replace("\n", "") + line
                            }
                        }

                        let time = 0;
                        let type = datesourceType.ais_time_type;
                        let timeIndex = 0;
                        if (datesourceType.data_column_boundary == 0) {
                            timeIndex = line.indexOf(";");
                        } else if (datesourceType.data_column_boundary == 1) {
                            line = line.replace(/,!/, ';!');
                            timeIndex = line.indexOf(";");
                        } else {
                            return;
                        }

                        let tmpTime = line.substring(0, timeIndex);
                        time = timeUtil.unifiedDate(tmpTime, type);


                        let vdmIndex = line.indexOf("!");
                        aisPacket = line.substring(vdmIndex, line.length);


                        let aisData = AisDecode(time, aisPacket);


                        if (aisData != null) {
                            count++;
                            let mmsi = aisData.mmsi;
                            let aisTime = aisData.time;

                            if (mmsi < 100000000 || mmsi > 999999999) {
                                return;
                            }


                            if (aisTime < 1000000000 || aisTime > 9999999999) {
                                return;
                            }

                            var lastData = mapAisLast.get(mmsi);

                            if (aisData.packetType == 0)//动态
                            {
                                if (lastData == null) {
                                    lastData = new AisObject();
                                    mapAisLast.put(mmsi, lastData);
                                }
                                lastData.packetType = aisData.packetType
                                lastData.mmsi = aisData.mmsi;
                                lastData.time = aisData.time;
                                lastData.classType = aisData.classType; //报告类型 A or B
                                lastData.messageType = aisData.messageType; //ais报文类型 1-27
                                lastData.speed = aisData.speed;
                                lastData.status = aisData.status;//航行状态
                                lastData.rot = aisData.rot;//转向率
                                lastData.acc = aisData.acc;//位置的准确度
                                lastData.x = aisData.x;//经度
                                lastData.y = aisData.y;//纬度
                                lastData.course = aisData.course;//航向
                                lastData.headcourse = aisData.headcourse;//船首向
                                lastData.secondutc = aisData.secondutc;//Second of UTC timestamp


                            }

                            if (aisData.packetType == 1)//静态
                            {

                                if (lastData == null) {
                                    lastData = new AisObject();
                                    mapAisLast.put(mmsi, lastData);
                                }
                                //加一个messagetype
                                lastData.time = aisData.time
                                lastData.packetType = aisData.packetType
                                lastData.messageType = aisData.messageType
                                lastData.mmsi = aisData.mmsi;
                                lastData.imo = aisData.imo != "" ? aisData.imo : "";
                                lastData.callsign = aisData.callsign != "" ? aisData.callsign : "";
                                lastData.shipname = aisData.shipname != "" ? aisData.shipname : "";
                                lastData.cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                                lastData.length = aisData.length > 0 ? aisData.length : 0;//米
                                lastData.width = aisData.width > 0 ? aisData.width : 0;//米
                                lastData.draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                                lastData.eta = aisData.eta;
                                lastData.dest = aisData.dest;//目的港
                            }

                            if (aisData.packetType == 2)//动静
                            {

                                if (lastData == null) {
                                    lastData = new AisObject();
                                    mapAisLast.put(mmsi, lastData);
                                }
                                lastData.packetType = aisData.packetType
                                lastData.mmsi = aisData.mmsi;
                                lastData.time = aisData.time;
                                lastData.classType = aisData.classType; //报告类型 A or B
                                lastData.messageType = aisData.messageType; //ais报文类型 1-27
                                lastData.speed = aisData.speed;
                                lastData.status = aisData.status;//航行状态
                                lastData.rot = aisData.rot;//转向率
                                lastData.acc = aisData.acc;//位置的准确度
                                lastData.x = aisData.x;//经度
                                lastData.y = aisData.y;//纬度
                                lastData.course = aisData.course;//航向
                                lastData.headcourse = aisData.headcourse;//船首向
                                lastData.secondutc = aisData.secondutc;//Second of UTC timestamp

                                lastData.imo = aisData.imo != "" ? aisData.imo : "";
                                lastData.callsign = aisData.callsign != "" ? aisData.callsign : "";
                                lastData.shipname = aisData.shipname != "" ? aisData.shipname : "";
                                lastData.cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                                lastData.length = aisData.length > 0 ? aisData.length : 0;//米
                                lastData.width = aisData.width > 0 ? aisData.width : 0;//米
                                lastData.draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                                lastData.eta = aisData.eta;
                                lastData.dest = aisData.dest;//目的港


                            }


                            console.log(aisPacket);
                            let key = lastData.toRangKey();
                            let value = lastData.toHypertableValue(aisData.packetType);
                            let htString = util.format("%s\t%s\n", key, value);
                            await WriteToFile(file.outpath, htString);

                        }


                    }
                    ,

                    function () {
                        resolve()
                    }
            )
        }

        catch
                (e) {
            reject(e);
        }

    })
}

function PrereadEachLine(file, datesourceType, logFile) {


    file.outPath = file.path.substring(0, file.path.lastIndexOf('.')) + 'temp.log';

    return new Promise(async function (resolve, reject) {
        try {

            readFileToArr(file.path, function (arr) {

            })

            // lineReader.eachLine(file.path, async function (line, last) {
            //         if (line.indexOf(";") == 20) {
            //             line.replace("\n", "")
            //         }
            //
            //         await WriteToFile(file.outPath, line);
            //
            //         if (last) {
            //             logFile.info(file.path + "已经解析完毕");
            //             file.path = file.outPath
            //             resolve()
            //         }
            //
            //     }
            // )
        } catch (e) {
            reject(e);
        }

    })
}

function readFileToArr(fReadName, callback) {
    var fRead = fs.createReadStream(fReadName);
    var objReadline = readline.createInterface({
        input: fRead
    });
    var arr = new Array();
    let lastline = ""
    objReadline.on('line', function (line) {
        if (line.indexOf("!") == 0) {
            arr.push(lastline.replace("\n", "") + line)
            console.log(lastline.replace("\n", "") + line);
        }
        else {
            if (line.length > 30) {
                arr.push(line)
                // console.log(line);
            }
        }
        lastline = line

    });
    objReadline.on('close', function () {
        console.log(arr);
        callback(arr);
    });
}


function isexist(str) {
    if (str == "" || str == null || str <= 0) {
        return false
    } else {
        return true
    }
}

module.exports.parseMessage = parseMessage;
module.exports.readEachLine = readEachLine;
module.exports.PrereadEachLine = PrereadEachLine;
