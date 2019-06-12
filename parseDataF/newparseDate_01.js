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


function readEachLine(file, datesourceType, staticMap, callback) {
    console.log(Date.now());
    try {
        let mapAisLast = staticMap;
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

                    //时间解析
                    let time = 0;
                    let type = datesourceType.ais_time_type;
                    let timeIndex = 0;


                    //分隔符解析
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


                    //解析加拼接
                    let aisData = AisDecode(time, aisPacket);
                    if (aisData != null) {
                        count++;
                        console.log(count);
                        let mmsi = aisData.mmsi;
                        let aisTime = aisData.time;


                        if (mmsi < 100000000 || mmsi > 999999999) {
                            return;
                        }


                        if (aisTime < 1000000000 || aisTime > 9999999999) {
                            return;
                        }

                        var lastData = "";
                        var lastDataArr = mapAisLast.get(mmsi);

                        if (!lastDataArr) {
                            lastData = new AisObject();
                            //初始化mmsi
                            lastData.mmsi = aisData.mmsi;
                            lastData.packetType = aisData.packetType;
                            lastData.messageType = aisData.messageType;

                            if (aisData.packetType == 0) {
                                //初始化动态标志
                                lastData.unstatic_init_flag = 1;
                                //初始化里程信息
                                lastData.mileage = 0;
                                //初始化时间信息
                                lastData.time = aisData.time;
                                lastData.init_time = aisData.time;
                                //初始化最新时间
                                lastData.unstatictimestamp = aisData.time
                                //初始化动态信息
                                lastData.lon = aisData.x;
                                lastData.lat = aisData.y;
                                lastData.speed = aisData.speed;
                                lastData.classType = aisData.classType; //报告类型 A or B
                                lastData.status = aisData.status;//航行状态
                                lastData.rot = aisData.rot;//转向率
                                lastData.acc = aisData.acc;//位置的准确度
                                lastData.course = aisData.course;//航向
                                lastData.headcourse = aisData.headcourse;//船首向
                                lastData.secondutc = aisData.secondutc;//Second of UTC timestamp
                            }
                            else if (aisData.packetType == 1) {
                                //初始化静态标志
                                lastData.static_init_flag = 1;
                                //初始化时间信息
                                lastData.init_time = aisData.time;
                                lastData.time = aisData.time;
                                //初始化最新时间
                                lastData.statictimestamp = aisData.time;

                                //初始化静态信息

                                lastData.imo = aisData.imo != "" ? aisData.imo : "";
                                lastData.callsign = aisData.callsign != "" ? aisData.callsign : "";
                                lastData.name = aisData.shipname != "" ? aisData.shipname : "";
                                lastData.cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                                lastData.length = aisData.length > 0 ? aisData.length : 0;//米
                                lastData.width = aisData.width > 0 ? aisData.width : 0;//米
                                lastData.draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                                lastData.eta = aisData.eta;
                                lastData.dest = aisData.dest;//目的港

                            }
                            else if (aisData.packetType == 2) {


                                //初始化动态标志
                                lastData.unstatic_init_flag = 1;
                                //初始化静态标志
                                lastData.static_init_flag = 1;

                                //初始化时间信息
                                lastData.init_time = aisData.time;
                                lastData.time = aisData.time;
                                //初始化最新时间
                                lastData.unstatictimestamp = aisData.time;
                                //初始化最新时间
                                lastData.statictimestamp = aisData.time;


                                //初始化里程信息
                                lastData.mileage = 0;
                                //初始化速度
                                lastData.speed = aisData.speed;
                                //初始化位置信息
                                lastData.lon = aisData.x;
                                lastData.lat = aisData.y;
                                lastData.mmsi = aisData.mmsi;
                                lastData.time = aisData.time;
                                lastData.classType = aisData.classType; //报告类型 A or B
                                lastData.status = aisData.status;//航行状态
                                lastData.rot = aisData.rot;//转向率
                                lastData.acc = aisData.acc;//位置的准确度
                                lastData.course = aisData.course;//航向
                                lastData.headcourse = aisData.headcourse;//船首向
                                lastData.secondutc = aisData.secondutc;//Second of UTC timestamp

                                //初始化静态信息
                                lastData.imo = aisData.imo != "" ? aisData.imo : "";
                                lastData.callsign = aisData.callsign != "" ? aisData.callsign : "";
                                lastData.name = aisData.shipname != "" ? aisData.shipname : "";
                                lastData.cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                                lastData.length = aisData.length > 0 ? aisData.length : 0;//米
                                lastData.width = aisData.width > 0 ? aisData.width : 0;//米
                                lastData.draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                                lastData.eta = aisData.eta;
                                lastData.dest = aisData.dest;//目的港

                            }

                            mapAisLast.put(mmsi, [lastData]);
                        }
                        else {



                            //过滤所有静态信息已经初始化的队列
                            let staticInitArr = lastDataArr.filter(a => {
                                a.static_init_flag == 1
                            });

                            //过滤所有动态信息已经初始化的队列
                            let unstaticInitArr = lastDataArr.filter(a => {
                                a.unstatic_init_flag == 1
                            });
                            //已经初始化的队列
                            let InitArr = lastDataArr.filter(a => {
                                a.unstatic_init_flag == 1 && a.static_init_flag == 1
                            });

                            //静态信息已经初始化，而动态信息未初始化的队列
                            let static = lastDataArr.filter(a=>a.unstatic_init_flag != 1 && a.static_init_flag == 1);
                            //动态信息已经初始化，而静态信息未初始化的队列
                            let unstatic = lastDataArr.filter(a=>a.unstatic_init_flag == 1 && a.static_init_flag != 1);


                            if (aisData.packetType == 0) {
                                let temparr = []
                                //先遍历动态队列，看看是否有合格的队列
                                for (let i in unstaticInitArr) {
                                    let dis = getdist(unstaticInitArr[i].lon, unstaticInitArr[i].lon, aisData.x, aisData.y)
                                    let tempspeed = Math.abs(dis / (unstaticInitArr[i].unstatictimestamp - aisData.time))

                                    if (tempspeed < threshold) {
                                        temparr.push(unstaticInitArr[i])
                                    }

                                }

                                if (temparr.length > 0) {
                                    let temparrsorted = temparr.sort((a, b) => {
                                        return Math.abs(a.speed - aisData.speed) - Math.abs(b.speed - aisData.speed)
                                    })
                                    for (let i in lastDataArr) {
                                        if (lastDataArr[i] == temparrsorted[0]) {
                                            //里程信息？??????????????????????
                                            lastDataArr[i].mileage = 0;
                                            //时间信息
                                            lastDataArr[i].time = aisData.time;
                                            //最新时间
                                            lastDataArr[i].unstatictimestamp = aisData.time;

                                            lastDataArr[i].mmsi = aisData.mmsi;
                                            lastDataArr[i].packetType = aisData.packetType;
                                            lastDataArr[i].messageType = aisData.messageType;

                                            lastDataArr[i].lon = aisData.x;
                                            lastDataArr[i].lat = aisData.y;
                                            lastDataArr[i].speed = aisData.speed;
                                            lastDataArr[i].classType = aisData.classType; //报告类型 A or B
                                            lastDataArr[i].status = aisData.status;//航行状态
                                            lastDataArr[i].rot = aisData.rot;//转向率
                                            lastDataArr[i].acc = aisData.acc;//位置的准确度
                                            lastDataArr[i].course = aisData.course;//航向
                                            lastDataArr[i].headcourse = aisData.headcourse;//船首向
                                            lastDataArr[i].secondutc = aisData.secondutc;//Second of UTC timestamp

                                            lastData = lastDataArr[i];
                                            break;
                                        }
                                    }

                                }
                                else if (temparr.length == 0) {
                                    //合格队列为0，再和无动态初始化的数据对比
                                    if (static.length > 0) {
                                        // 和时间最近的静态数据合并
                                        let staticsorted = static.sort((a, b) => {
                                            return Math.abs(a.statictimestamp - aisData.time) - Math.abs(b.statictimestamp - aisData.time)
                                        })

                                        for (let i in lastDataArr) {
                                            if (lastDataArr[i] == staticsorted[0]) {
                                                //里程信息
                                                lastDataArr[i].mileage = 0;
                                                //时间信息
                                                lastDataArr[i].time = aisData.time;
                                                //最新时间
                                                lastDataArr[i].unstatictimestamp = aisData.time;

                                                lastDataArr[i].mmsi = aisData.mmsi;
                                                lastDataArr[i].packetType = aisData.packetType;
                                                lastDataArr[i].messageType = aisData.messageType;

                                                lastDataArr[i].lon = aisData.x;
                                                lastDataArr[i].lat = aisData.y;
                                                lastDataArr[i].speed = aisData.speed;
                                                lastDataArr[i].classType = aisData.classType; //报告类型 A or B
                                                lastDataArr[i].status = aisData.status;//航行状态
                                                lastDataArr[i].rot = aisData.rot;//转向率
                                                lastDataArr[i].acc = aisData.acc;//位置的准确度
                                                lastDataArr[i].course = aisData.course;//航向
                                                lastDataArr[i].headcourse = aisData.headcourse;//船首向
                                                lastDataArr[i].secondutc = aisData.secondutc;//Second of UTC timestamp
                                                lastData = lastDataArr[i];
                                            }
                                        }


                                    }
                                    else {
                                        // 无动态初始化的数据为0
                                        // 插入一个新的动态队列
                                        lastData = new AisObject();
                                        //初始化mmsi
                                        lastData.mmsi = aisData.mmsi;
                                        lastData.packetType = aisData.packetType;
                                        lastData.messageType = aisData.messageType;

                                        lastData.unstatictimestamp = aisData.time;
                                        lastData.init_time = aisData.time;
                                        lastData.time = aisData.time;
                                        lastData.unstatic_init_flag = 1;

                                        lastData.mileage = 0;

                                        lastData.lon = aisData.x;
                                        lastData.lat = aisData.y;
                                        lastData.speed = aisData.speed
                                        lastData.classType = aisData.classType; //报告类型 A or B
                                        lastData.status = aisData.status;//航行状态
                                        lastData.rot = aisData.rot;//转向率
                                        lastData.acc = aisData.acc;//位置的准确度
                                        lastData.course = aisData.course;//航向
                                        lastData.headcourse = aisData.headcourse;//船首向
                                        lastData.secondutc = aisData.secondutc;//Second of UTC timestamp
                                        lastDataArr.push(lastData)
                                    }
                                }

                            }
                            else if (aisData.packetType == 1) {
                                //新报文为静态报文
                                var flag = 0
                                //先遍历已经静态初始化的序列，如果发现同名的就更新该同名对象
                                for (let i in staticInitArr) {
                                    if (staticInitArr[i].name == aisData.shipname) {
                                        for (let j in lastDataArr) {
                                            if (lastDataArr[j] == staticInitArr[i]) {

                                                lastDataArr[j].mmsi = aisData.mmsi;
                                                lastDataArr[j].packetType = aisData.packetType;
                                                lastDataArr[j].messageType = aisData.messageType;

                                                //更新最新时间
                                                lastDataArr[j].statictimestamp = aisData.time
                                                lastDataArr[j].time = aisData.time

                                                lastDataArr[j].imo = aisData.imo != "" ? aisData.imo : "";
                                                lastDataArr[j].callsign = aisData.callsign != "" ? aisData.callsign : "";
                                                lastDataArr[j].name = aisData.shipname != "" ? aisData.shipname : "";
                                                lastDataArr[j].cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                                                lastDataArr[j].length = aisData.length > 0 ? aisData.length : 0;//米
                                                lastDataArr[j].width = aisData.width > 0 ? aisData.width : 0;//米
                                                lastDataArr[j].draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                                                lastDataArr[j].eta = aisData.eta;
                                                lastDataArr[j].dest = aisData.dest;//目的港
                                                lastData = lastDataArr[j];
                                                break;
                                            }
                                        }
                                        flag = 1;
                                        break;
                                    }

                                }

                                //如果静态都不合格看动态的，找出动态队列和当前点时间差最小的
                                if (flag == 0) {
                                    if (unstatic.length > 0) {
                                        let unstaticsorted = unstatic.sort((a, b) => {
                                            return Math.abs(a.unstatictimestamp - time) - Math.abs(b.unstatictimestamp - time)
                                        })
                                        let index = unstaticsorted[0];
                                        for (let i in lastDataArr) {
                                            if (lastDataArr[i] == index) {
                                                lastDataArr[i].mmsi = aisData.mmsi;
                                                lastDataArr[i].packetType = aisData.packetType;
                                                lastDataArr[i].messageType = aisData.messageType;

                                                //更新最新时间
                                                lastDataArr[i].statictimestamp = aisData.time
                                                lastDataArr[i].time = aisData.time

                                                lastDataArr[i].imo = aisData.imo != "" ? aisData.imo : "";
                                                lastDataArr[i].callsign = aisData.callsign != "" ? aisData.callsign : "";
                                                lastDataArr[i].name = aisData.shipname != "" ? aisData.shipname : "";
                                                lastDataArr[i].cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                                                lastDataArr[i].length = aisData.length > 0 ? aisData.length : 0;//米
                                                lastDataArr[i].width = aisData.width > 0 ? aisData.width : 0;//米
                                                lastDataArr[i].draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                                                lastDataArr[i].eta = aisData.eta;
                                                lastDataArr[i].dest = aisData.dest;//目的港
                                                lastData = lastDataArr[i]
                                            }
                                        }
                                    }
                                    else {
                                        //如果unstatic的长度为0 ,说明全是静态，但是静态都不合格，单列一队
                                        lastData = new AisObject();
                                        //初始化mmsi
                                        lastData.mmsi = aisData.mmsi;
                                        lastData.packetType = aisData.packetType;
                                        lastData.messageType = aisData.messageType;

                                        //初始化静态标志
                                        lastData.static_init_flag = 1;
                                        //初始化时间信息
                                        lastData.init_time = aisData.time;
                                        //初始化最新时间
                                        lastData.statictimestamp = aisData.time;
                                        lastData.time = aisData.time;

                                        //初始化静态信息

                                        lastData.imo = aisData.imo != "" ? aisData.imo : "";
                                        lastData.callsign = aisData.callsign != "" ? aisData.callsign : "";
                                        lastData.name = aisData.shipname != "" ? aisData.shipname : "";
                                        lastData.cargo = aisData.cargo != 0 ? aisData.cargo : 0;//货物类型
                                        lastData.length = aisData.length > 0 ? aisData.length : 0;//米
                                        lastData.width = aisData.width > 0 ? aisData.width : 0;//米
                                        lastData.draught = aisData.draught > 0 ? aisData.draught : 0;//吃水
                                        lastData.eta = aisData.eta;
                                        lastData.dest = aisData.dest;//目的港
                                        lastDataArr.push(lastData)
                                    }
                                }
                            }
                            else if (aisData.packetType == 2) {
                                return
                            }

                        }

                        let key = lastData.toRangKey();
                        let value = lastData.toHypertableValue(aisData.packetType);
                        let htString = util.format("%s\t%s\n", key, value);
                        await WriteToFile(file.outpath, htString);

                    }
                }
                ,
                function () {
                    console.log(Date.now());
                    callback()
                }
        )
    } catch (e) {
    }

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

function getdist(x1, y1, x2, y2) {

}

module.exports.parseMessage = parseMessage;
module.exports.readEachLine = readEachLine;
module.exports.PrereadEachLine = PrereadEachLine;
