const lineReader = require('line-reader');
const util = require('util');
const timeUtil = require('../AisDecode/TimeUtil');
const AisDecode = require("../AisDecode/blmParser.js").aisDecode;
const AisObject = require("../AisDecode/AisObject.js");
const WriteToFile = require("../AisDecode/BlmFile.js").writeToFile;
const Map = require("../AisDecode/Map.js");
let log = require("../log4js/logger");


function readEachLine(file, datesourceType, res, rej) {

    log.default.info(`${file.path}解析开始`);

    let staticMap = new Map();
    try {
        let count = 0;
        let aisPacket = "";
        let lastline = "";
        lineReader.eachLine(file.path, async function (line, last) {
                if (line == "") {
                    return
                }

                if (line.indexOf("!") != 0 && line.length < 30) {//时间行
                    lastline = line;
                    return
                }
                else {  //非时间行
                    if (line.indexOf("!") == 0) {
                        line = lastline.replace("\n", "") + line
                    }
                }

                //时间解析
                let time = 0;
                let timeIndex = 0;


                //分隔符解析
                if (datesourceType.data_column_boundary == ";") {
                    timeIndex = line.indexOf(";");
                } else {
                    line = line.replace(`${datesourceType.data_column_boundary}`, ';');
                    timeIndex = line.indexOf(";");
                }

                let tmpTime = line.substring(0, timeIndex);

                time = timeUtil.unifiedDate(tmpTime, datesourceType.ais_time_type, datesourceType.ais_time_format);

                let vdmIndex = line.indexOf("!");
                aisPacket = line.substring(vdmIndex, line.length);


                //获取当前报文的信息
                let aisData = AisDecode(time, aisPacket);

                if (aisData != null) {
                    let mmsi = aisData.mmsi;
                    let aisTime = aisData.time;


                    if (mmsi < 100000000 || mmsi > 999999999) {
                        return;
                    }


                    if (aisTime < 1000000000 || aisTime > 9999999999) {
                        return;
                    }

                    count++;

                    var lastData = staticMap.get(mmsi);

                    switch (aisData.packetType) {
                        case 0: { // 动态报文
                            if (lastData == null) {
                                lastData = new AisObject();
                            }
                            //这里的静态报文为默认值或者为map里的（上一个静态信息的，上一个动态性信息的，上一个动静态信息的）
                            lastData.srcid = datesourceType.sourceid;
                            lastData.messageType = aisData.messageType; //ais报文类型 1-27
                            lastData.packetType = aisData.packetType;
                            lastData.mmsi = aisData.mmsi;
                            lastData.time = aisData.time;
                            lastData.classType = aisData.classType; //报告类型 A or B
                            lastData.speed = aisData.speed;
                            lastData.status = aisData.status;//航行状态
                            lastData.rot = aisData.rot;//转向率
                            lastData.acc = aisData.acc;//位置的准确度
                            lastData.lon = aisData.lon;//经度
                            lastData.lat = aisData.lat;//纬度
                            lastData.course = aisData.course;//航向
                            lastData.headcourse = aisData.headcourse;//船首向
                            lastData.secondutc = aisData.secondutc;
                            break;
                        }
                        case 1: {
                            // 静态
                            if (lastData == null) {
                                lastData = new AisObject();
                                staticMap.put(mmsi, lastData);
                            }


                            lastData.mmsi = mmsi;
                            lastData.time = time;


                            lastData.srcid = datesourceType.sourceid;
                            lastData.messageType = aisData.messageType; //ais报文类型 1-27
                            lastData.packetType = aisData.packetType;


                            lastData.dest = aisData.dest;
                            lastData.imo = aisData.imo;
                            lastData.callsign = aisData.callsign;
                            lastData.shipname = aisData.shipname;
                            lastData.cargo = aisData.cargo;//货物类型
                            lastData.length = aisData.length;//米
                            lastData.width = aisData.width;//米
                            lastData.draught = aisData.draught;//吃水
                            lastData.eta = aisData.eta;
                            break;
                        }
                        case 2: //动静报文
                        case 3: { //其他报文
                            lastData = aisData;

                            lastData.srcid = datesourceType.sourceid;

                            lastData.messageType = aisData.messageType; //ais报文类型 1-27
                            lastData.packetType = aisData.packetType;
                            break;
                        }
                        default: {
                            return
                        }
                    }


                    if (!lastData.time) {
                        return  //没有时间的不要
                    }

                    let key = lastData.toRangKey();

                    let value = lastData.toHypertableValue(aisData.packetType);


                    let htString = util.format("%s\t%s\n", key, value);
                    if (aisData.packetType == 3) {
                        await WriteToFile(file.otherpath, htString);
                    }
                    else {
                        await WriteToFile(file.outpath, htString);
                    }

                    if (last) {
                        log.default.info(`${file.path}解析完成`);
                        res(0)
                    }
                }
            },
            function () {
            }
        )
    } catch (e) {
    }

}


//2015-02-13:20:59:33;!ABVDM,1,1,,B,403t?0AutVe0>`b`hn@3<PQ02<27,0*0E

module.exports.readEachLine = readEachLine;

