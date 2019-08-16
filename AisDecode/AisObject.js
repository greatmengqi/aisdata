const util = require('util');
const geohash = require('ngeohash');
const mmsiUtil = require("./mmsiUtil.js");

function AisObject() {


    this.mmsi = 0;
    this.time = 0;
    //*******动态*******
    this.srcid = 0;
    this.packetType = -1;//0 动态报文  1静态报文 2 包含动态和静态报文 3 其他报文
    this.classType = ""; //报告类型 A or B
    this.messageType = 0; //ais报文类型 1-27
    this.speed = 0;
    this.status = 0;//航行状态
    this.rot = 0;//转向率
    this.acc = 0;//位置的准确度
    this.lon = 0;//经度
    this.lat = 0;//纬度
    this.course = 0;//航向
    this.headcourse = 0;//船首向
    this.secondutc = 0;//Second of UTC timestamp
    //this.maneuver=0;//特殊操纵
    this.geohash = "";

    //******静态*******
    this.imo = "";
    this.callsign = "";
    this.shipname = "";
    this.cargo = 0;//货物类型
    this.length = 0;//米
    this.width = 0;//米
    this.draught = 0;//吃水
    this.eta = 0;
    this.dest = "";//目的港


    this.key = "";


    this.toRangKey = function () {
        this.geohash = geohash.encode(this.lat, this.lon);
        return util.format("%s-%d-%d", this.geohash, this.time, this.mmsi);
    };

    this.toHypertableValue = function (packetType) {

        if (packetType == 3) {
            return util.format("%d#%d#%d#%d#%d#%d#%d#%s#%d",//9
                this.srcid, //0  *
                this.messageType,//1 *
                this.acc,//6 *
                this.lon,//7 *d
                this.lat,//8 *
                this.secondutc,//11 *
                this.mmsi,//21 *
                this.geohash,//22
                this.time,//23
            );
        } else {

            if (typeof this.dest !== "string") {
                console.log(this);
            }

            return util.format("%d#%d#%s#%d#%d#%d#%d#%d#%d#%d#%d#%d#%s#%s#%s#%d#%s#%d#%d#%d#%d#%d#%s#%d#%d",//25
                this.srcid, //0
                this.messageType,//1
                this.classType,//2
                this.status,//3
                this.rot,//4
                this.speed,//5
                this.acc,//6
                this.lon,//7
                this.lat,//8
                this.course,//9
                this.headcourse,//10
                this.secondutc,//11
                this.imo,//12
                this.callsign.replace("#", ""),//13
                this.shipname.replace("#", ""),//14
                this.eta,//15
                this.dest.replace("#", ""),//16
                this.length,//17
                this.width,//18
                this.draught,//19
                this.cargo,//20
                this.mmsi,//21
                this.geohash,//22
                this.time,//23
                this.packetType,//24
            );
        }

    };
}

module.exports = AisObject;
