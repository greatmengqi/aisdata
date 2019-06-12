const lineReader = require('line-reader');
const util = require('util');
const timeUtil = require('./parseDateConf/TimeUtil');
const AisDecode = require("./parseDateConf/blmParser.js").aisDecode;
const AisObject = require("./parseDateConf/AisObject.js");
const WriteToFile = require("./parseDateConf/BlmFile.js").writeToFile;
let process = require("child_process");
const sql = require("../sqlServer/ssql");
let logger = require("../log4js/logger");

function readEachLine(file, datesourceType, staticMap, callback) {
    try {
        let mapAisLast = staticMap;
        let count = 0;
        let aisPacket = "";
        let lastline = "";
        logger.default.info("开始解析:" + file.path);
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

                    //时间解析
                    let time = 0;
                    let type = datesourceType.ais_time_type;
                    let timeIndex = 0;


                    //分隔符解析
                    if (datesourceType.data_column_boundary == ";") {
                        timeIndex = line.indexOf(";");
                    } else {
                        let temp = datesourceType.data_column_boundary.trim() + "!";
                        line = line.replace(temp, ';!');
                        timeIndex = line.indexOf(";");
                    }

                    let tmpTime = line.substring(0, timeIndex);
                    time = timeUtil.unifiedDate(tmpTime, type);

                    let vdmIndex = line.indexOf("!");
                    aisPacket = line.substring(vdmIndex, line.length);


                    //解析加拼接
                    let aisData = AisDecode(time, aisPacket);
                    if (aisData != null) {
                        // console.log(count);
                        let mmsi = aisData.mmsi;
                        let aisTime = aisData.time;

                        if (mmsi < 100000000 || mmsi > 999999999) {
                            return;
                        }


                        if (aisTime < 1000000000 || aisTime > 9999999999) {
                            return;
                        }
                        count++;

                        var lastData = mapAisLast.get(mmsi);
                        //如果之前map里面有mmsi,接下来为解析出来的信息会被map里的数据所替换
                        //如果之前的map里没有mmsi，接下来解析出来的存的就是新的信息

                        if (aisData.packetType == 0)//动态
                        {
                            if (lastData == null) {
                                lastData = new AisObject();
                                mapAisLast.put(mmsi, lastData);
                            }
                            //这里的静态报文为默认值或者为map里的（上一个静态信息的，上一个动态性信息的，上一个动静态信息的）
                            lastData.srcid = datesourceType.sourceid
                            lastData.packetType = aisData.packetType
                            lastData.messageType = aisData.messageType; //ais报文类型 1-27
                            lastData.mmsi = aisData.mmsi;
                            lastData.time = aisData.time;
                            lastData.classType = aisData.classType; //报告类型 A or B
                            lastData.speed = aisData.speed;
                            lastData.status = aisData.status;//航行状态
                            lastData.rot = aisData.rot;//转向率
                            lastData.acc = aisData.acc;//位置的准确度
                            lastData.lon = aisData.x;//经度
                            lastData.lat = aisData.y;//纬度
                            lastData.course = aisData.course;//航向
                            lastData.headcourse = aisData.headcourse;//船首向
                            lastData.secondutc = aisData.secondutc;//Second of UTC timestamp
                            lastData.dest = lastData.dest ? lastData.dest.replace("#", "") : "";
                            lastData.shipname = lastData.shipname ? lastData.shipname.replace("#", "") : "";
                            lastData.callsign = lastData.callsign ? lastData.callsign.replace("#", "") : "";
                        }

                        if (aisData.packetType == 1)//静态
                        {

                            if (lastData == null) {
                                lastData = new AisObject();
                                mapAisLast.put(mmsi, lastData);
                            }
                            //这里的动态报文为默认值或者为map里的
                            //加一个messagetype
                            lastData.srcid = datesourceType.sourceid
                            lastData.time = aisData.time
                            lastData.packetType = aisData.packetType
                            lastData.messageType = aisData.messageType
                            lastData.mmsi = aisData.mmsi;
                            lastData.imo = aisData.imo != "" ? aisData.imo : "";
                            lastData.callsign = aisData.callsign != "" ? aisData.callsign.trim().replace("#", "") : "";
                            lastData.shipname = aisData.shipname != "" ? aisData.shipname.trim().replace("#", "") : "";
                            lastData.cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                            lastData.length = aisData.length > 0 ? aisData.length : 0;//米
                            lastData.width = aisData.width > 0 ? aisData.width : 0;//米
                            lastData.draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                            lastData.eta = aisData.eta;
                            lastData.dest = aisData.dest.replace("#", "");//目的港
                        }

                        if (aisData.packetType == 2)//动静
                        {

                            if (lastData == null) {
                                lastData = new AisObject();
                                mapAisLast.put(mmsi, lastData);
                            }
                            lastData.srcid = datesourceType.sourceid
                            lastData.packetType = aisData.packetType
                            lastData.mmsi = aisData.mmsi;
                            lastData.time = aisData.time;
                            lastData.classType = aisData.classType; //报告类型 A or B
                            lastData.messageType = aisData.messageType; //ais报文类型 1-27
                            lastData.speed = aisData.speed;
                            lastData.status = aisData.status;//航行状态
                            lastData.rot = aisData.rot;//转向率
                            lastData.acc = aisData.acc;//位置的准确度
                            lastData.lon = aisData.x;//经度
                            lastData.lat = aisData.y;//纬度
                            lastData.course = aisData.course;//航向
                            lastData.headcourse = aisData.headcourse;//船首向
                            lastData.secondutc = aisData.secondutc;//Second of UTC timestamp

                            lastData.imo = aisData.imo != "" ? aisData.imo.replace("#", "") : "";
                            lastData.callsign = aisData.callsign != "" ? aisData.callsign.replace("#", "") : "";
                            lastData.shipname = aisData.shipname != "" ? aisData.shipname.trim().replace("#", "") : "";
                            lastData.cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                            lastData.length = aisData.length > 0 ? aisData.length : 0;//米
                            lastData.width = aisData.width > 0 ? aisData.width : 0;//米
                            lastData.draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                            lastData.eta = aisData.eta;
                            lastData.dest = aisData.dest.replace("#", "");//目的港

                        }


                        if (!lastData.time) {
                            return  //没有时间的不要
                        }


                        let key = lastData.toRangKey();
                        let value = lastData.toHypertableValue(aisData.packetType);
                        let htString = util.format("%s\t%s\n", key, value);
                        await WriteToFile(file.outpath, htString);
                    }
                }
                ,
                function () {
                    logger.default.info(file.path + "解析完毕");
                    let sqlsentence = `UPDATE  [catsic].[dbo].[d8_ais_storage] set packageNumJX  = (SELECT T.packageNumJX+1  FROM [catsic].[dbo].[d8_ais_storage] T where T.id = ${file.taskId}) WHERE id = ${file.taskId}`
                    console.log(sqlsentence);
                    sql.query(sqlsentence, function (err, res) {
                        if (err) {
                            logger.err.error(err)
                        }
                        logger.default.info(res)
                    })

                    sql.query(`UPDATE [catsic].[dbo].[d3_package] set rowNum = ${count},resPath = '${file.outpath}',status = 3 WHERE id = ${file.fileId}`, function () {

                    })

                    var dir = file.startTime.substr(0, 7).replace("-", "")

                    process.exec(`ssh root@10.86.11.66 "test -d /data/aisdata/${dir}"`, function (code, stdout, stderr) {
                        if (code) //如果远程不含该文件夹
                        {
                            process.exec(`ssh root@10.86.11.66 "mkdir /data/aisdata/${dir}"`)
                        }
                        else {
                            process.exec(`scp ${file.outpath} root@10.86.11.66:/data/aisdata/${dir}`)
                        }
                    });


                    callback()
                }
        )
    } catch (e) {
        logger.err.error(e)
    }

}


module.exports.readEachLine = readEachLine;

