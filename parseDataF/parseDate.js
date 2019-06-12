const lineReader = require('line-reader');
const util = require('util');
const fs = require('fs');

const timeUtil = require('../../../../aisdata/parseDataF/parseDateConf/TimeUtil');
const AisDecode = require("../../../../aisdata/parseDataF/parseDateConf/blmParser.js").aisDecode;
const Map = require("../../../../aisdata/parseDataF/parseDateConf/Map.js");
const AisObject = require("../../../../aisdata/parseDataF/parseDateConf/AisObject.js");
const SrcId = 1;
const WriteToFile = require("../../../../aisdata/parseDataF/parseDateConf/BlmFile.js").writeToFile;

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

function readEachLine(file, datesourceType, staticInfoMap) {
    file.outPath = file.path.substring(0, file.path.lastIndexOf('.')) + '.tsv';
    return new Promise(async function (resolve, reject) {
        try {
            let mapAisLast = staticInfoMap;
            let count = 0;
            let aisPacket = "";
            eachLine(file.path, async function (line) {
                    let time = 0;
                    let type = datesourceType.ais_time_type;
                    let timeIndex = 0;
                    /* data_column_boundary = 3 = ';'   data_column_boundary = 4 = ':;' */
                    if (datesourceType.data_column_boundary == 3) {
                        timeIndex = line.indexOf(";");
                    } else if (datesourceType.data_column_boundary == 4) {
                        line = line.replace(/:;/, ';');
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


                        var lastData = aisData;

                        if (aisData.packetType == 0)//动态
                        {
                            //什么也不做，直接存到hbase
                        }

                        if (aisData.packetType == 1)//静态
                        {
                            //更新静态信息表
                            var staticInfo = mapAisLast[mmsi];
                            if (staticInfo == null) {
                                mapAisLast[mmsi] = lastData
                            } else {

                                if (lastData.time - staticInfo.time <= 3600 && lastData.time - staticInfo.time > 0) {
                                    //此信息在静态信息之后一个小时之内出现，用静态信息补充此信息，并更新静态信息
                                    // lastData.mmsi 用自己的
                                    // lastData.time 用自己的
                                    //由于只能存储静态信息，故只更新静态信息
                                    lastData.imo = isexist(lastData.imo) ? lastData.imo : staticInfo.imo
                                    lastData.shipname = isexist(lastData.shipname) ? lastData.shipname : staticInfo.shipname
                                    lastData.callsign = isexist(lastData.callsign) ? lastData.callsign : staticInfo.callsign
                                    lastData.cargo = isexist(lastData.cargo) ? lastData.cargo : staticInfo.cargo
                                    lastData.eta = isexist(lastData.eta) ? lastData.eta : staticInfo.eta
                                    lastData.draught = isexist(lastData.draught) ? lastData.draught : staticInfo.draught
                                    lastData.length = isexist(lastData.length) ? lastData.length : staticInfo.length
                                    lastData.width = isexist(lastData.width) ? lastData.width : staticInfo.width
                                    lastData.dest = isexist(lastData.dest) ? lastData.dest : staticInfo.dest
                                    lastData.classType = isexist(lastData.classType) ? lastData.classType : staticInfo.classType //设备类型
                                    mapAisLast[mmsi] = lastData
                                } else if (lastData.time - staticInfo.time > 3600) {
                                    mapAisLast[mmsi] = lastData
                                }
                            }

                        }

                        if (aisData.packetType == 2)//动静
                        {
                            //更新静态信息表
                            // console.log(aisData);
                            var staticInfo = mapAisLast[mmsi];
                            if (staticInfo == null) {
                                mapAisLast[mmsi] = lastData
                            } else {

                                if (lastData.time - staticInfo.time <= 3600 && lastData.time - staticInfo.time > 0) {
                                    //此信息在静态信息之后一个小时之内出现，用静态信息补充此信息，并更新静态信息
                                    // lastData.mmsi 用自己的
                                    // lastData.time 用自己的
                                    //由于只能存储静态信息，故只更新静态信息
                                    lastData.imo = isexist(lastData.imo) ? lastData.imo : staticInfo.imo
                                    lastData.shipname = isexist(lastData.shipname) ? lastData.shipname : staticInfo.shipname
                                    lastData.callsign = isexist(lastData.callsign) ? lastData.callsign : staticInfo.callsign
                                    lastData.cargo = isexist(lastData.cargo) ? lastData.cargo : staticInfo.cargo
                                    lastData.eta = isexist(lastData.eta) ? lastData.eta : staticInfo.eta
                                    lastData.draught = isexist(lastData.draught) ? lastData.draught : staticInfo.draught
                                    lastData.length = isexist(lastData.length) ? lastData.length : staticInfo.length
                                    lastData.width = isexist(lastData.width) ? lastData.width : staticInfo.width
                                    lastData.dest = isexist(lastData.dest) ? lastData.dest : staticInfo.dest
                                    lastData.classType = isexist(lastData.classType) ? lastData.classType : staticInfo.classType //设备类型
                                    mapAisLast[mmsi] = lastData
                                } else if (lastData.time - staticInfo.time > 3600) {
                                    mapAisLast[mmsi] = lastData
                                }
                            }
                        }

                        lastData.srcid = SrcId;
                        let key = lastData.toRangKey();
                        let value = lastData.toHypertableValue(aisData.packetType);
                        let htString = util.format("%s\t%s\n", key, value);
                        await WriteToFile(file.outPath, htString);
                    }
                }
            ).then(function () {
                resolve()
            })
        } catch (e) {
            reject(e);
        }

    })
}

function isexist(str) {
    if (str == "" || str == null || str <= 0) {
        return false
    } else {
        return true
    }
}

// let files = [{
//     path: 'C:\\Users\\冯中秀\\Desktop\\work\\测试数据\\test2.txt',
//     name: 'test',
//     realNum: 0,
//     size: 0
// }];
//
// let datesourceType = {
//     ais_time_type:0,
//     data_column_boundary:3
// };
//
//
// parseMessage(files, datesourceType, function () {
//     console.log(fs.readdirSync('C:\\Users\\冯中秀\\Desktop\\work\\测试数据'));
// });


module.exports.parseMessage = parseMessage;
module.exports.readEachLine = readEachLine;
