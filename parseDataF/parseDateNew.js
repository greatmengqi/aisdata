const lineReader = require('line-reader');
const Promise = require('bluebird');
const util = require('util');
const fs = require('fs');


const timeUtil = require('../../../../aisdata/parseDataF/parseDateConf/TimeUtil');
const db = require('../../../../aisdata/blmutil/sqlServer');
const AisDecode = require("../../../../aisdata/parseDataF/parseDateConf/blmParser.js").aisDecode;
const Map = require("../../../../aisdata/parseDataF/parseDateConf/Map.js");
const AisObject = require("../../../../aisdata/parseDataF/parseDateConf/AisObject.js");
const SrcId = 1;
const WriteToFile = require("../../../../aisdata/parseDataF/parseDateConf/BlmFile.js").writeToFile;

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
    // f = file.path.substring(0, file.path.lastIndexOf('.')) + '.tsv';x
    let fileName = file.path.split("/").pop()
    // console.log(fileName);

    file.outPath = file.path.replace("/Users/chenmengqi/catsicts/cs/data/", "/Users/chenmengqi/catsicts/cs/temp/")
    file.outPath = file.outPath.substring(0, file.outPath.lastIndexOf('.')) + ".tsv"
    console.log(file.outPath);
    // file.outPath = "/Users/chenmengqi/catsicts/cs/data/test/" + fileName.substring(0, fileName.lastIndexOf('.')) + '.tsv';
    return new Promise(async function (resolve, reject) {
        try {
            let mapAisLast = staticInfoMap;
            let count = 0;
            let aisPacket = "";

            eachLine(file.path,async function (line)
                {
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
                    let vdmIndex = line.indexOf("!");
                    let tmpTime = line.substring(0, timeIndex);
                    time = timeUtil.unifiedDate(tmpTime, type);
                    aisPacket = line.substring(vdmIndex, line.length);
                    let aisData = AisDecode(time, aisPacket);//在这里将数据解析出来
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


                        // var lastData = mapAisLast.get(mmsi);
                        var lastData = mapAisLast.get(mmsi);

                        if(aisData.packetType == 0)//动态
                        {
                            if(lastData == null)
                            {
                                lastData = new AisObject();
                                mapAisLast.put(mmsi, lastData);
                            }

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

                        if(aisData.packetType == 1)//静态
                        {
                            if(lastData != null)
                            {
                                lastData.mmsi = aisData.mmsi;
                                lastData.imo = aisData.imo!=""?aisData.imo:"";
                                lastData.callsign = aisData.callsign!=""?aisData.callsign:"";
                                lastData.shipname = aisData.shipname!=""?aisData.shipname:"";
                                lastData.cargo = aisData.cargo!=0?aisData.cargo:0;//货物类型
                                lastData.length = aisData.length>0?aisData.length:0;//米
                                lastData.width = aisData.width>0?aisData.width:0;//米
                                lastData.draught = aisData.draught>0?aisData.draught:0;//吃水
                                lastData.eta = aisData.eta;
                                lastData.dest = aisData.dest;//目的港
                            }

                            return;
                        }

                        if(aisData.packetType==2)//动静
                        {
                            if(lastData == null)
                            {
                                lastData = new AisObject();
                                mapAisLast.put(mmsi, lastData);
                            }

                            lastData.mmsi = aisData.mmsi;
                            lastData.time=aisData.time;
                            lastData.classType=aisData.classType; //报告类型 A or B
                            lastData.messageType=aisData.messageType; //ais报文类型 1-27
                            lastData.speed=aisData.speed;
                            lastData.status=aisData.status;//航行状态
                            lastData.rot=aisData.rot;//转向率
                            lastData.acc=aisData.acc;//位置的准确度
                            lastData.x=aisData.x;//经度
                            lastData.y=aisData.y;//纬度
                            lastData.course=aisData.course;//航向
                            lastData.headcourse=aisData.headcourse;//船首向
                            lastData.secondutc=aisData.secondutc;//Second of UTC timestamp

                            lastData.imo=aisData.imo!=""?aisData.imo:"";
                            lastData.callsign=aisData.callsign!=""?aisData.callsign:"";
                            lastData.shipname=aisData.shipname!=""?aisData.shipname:"";
                            lastData.cargo=aisData.cargo!=0?aisData.cargo:0;//货物类型
                            lastData.length=aisData.length>0?aisData.length:0;//米
                            lastData.width=aisData.width>0?aisData.width:0;//米
                            lastData.draught=aisData.draught>0?aisData.draught:0;//吃水
                            lastData.eta=aisData.eta;
                            lastData.dest=aisData.dest;//目的港
                        }

                        lastData.srcid = SrcId;
                        let key = lastData.toRangKey();
                        let value = lastData.toHypertableValue(aisData.packetType);
                        // console.log(value);
                        let htString = util.format("%s\tdescription\t%s\n", key, value);
                        await WriteToFile(file.outPath, htString);
                    }
                }
            ).then(function () {
               resolve(mapAisLast)
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

module.exports.parseMessage = parseMessage;
module.exports.readEachLine = readEachLine;
