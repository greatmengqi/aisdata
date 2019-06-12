const util = require('util');
const geohash = require('ngeohash');
const gridUtil = require("./GridUtil.js");
const mmsiUtil = require("./mmsiUtil.js");

function AisObject() {

    //新增
    this.init_time = 0;

    this.static_init_flag = 0;
    this.statictimestamp = 0;

    this.unstatic_init_flag = 0;
    this.unstatictimestamp = 0;
    this.mileage = 0;


    this.mmsi = 0;
    this.time = 0;
    //*******动态*******
    this.srcid = 0;
    this.packetType = -1;//0 动态报文  1静态报文 2 包含动态和静态报文
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

    //******静态*******
    this.imo = "";
    this.callsign = "";
    this.name = "";
    this.cargo = 0;//货物类型
    this.length = 0;//米
    this.width = 0;//米
    this.draught = 0;//吃水
    this.eta = 0;
    this.dest = "";//目的港
    this.geohash = "";

    this.key = "";

    this.initDataFromRange = function (key, value) {
        if (key == null || value == null)
            return;

        this.key = key;
        var keyArr = [];
        keyArr = key.split("-");
        var tmpTime = keyArr[1];

        if (tmpTime < 1000000000 || tmpTime > 9999999999 || typeof(tmpTime) == "undefined")
            return;

        this.time = tmpTime;
        this.mmsi = mmsiUtil.getmmsi(keyArr[2]);

        var valueArr = [];
        valueArr = value.split("@");

        if (valueArr.length != 21)
            return;

        this.srcid = valueArr[0];
        this.messageType = valueArr[1];
        this.classType = valueArr[2];
        this.status = valueArr[3];
        this.rot = valueArr[4];
        this.speed = valueArr[5];
        this.acc = valueArr[6];
        this.x = valueArr[7];
        this.y = valueArr[8];
        this.course = valueArr[9];
        this.headcourse = valueArr[10];
        this.secondutc = valueArr[11];
        this.imo = valueArr[12];
        this.callsign = valueArr[13];
        this.shipname = valueArr[14];
        this.eta = valueArr[15];
        this.dest = valueArr[16];
        this.length = valueArr[17];
        this.width = valueArr[18];
        this.draught = valueArr[19];
        this.cargo = valueArr[20];
    };

    this.toRangKey = function () {
        this.geohash = geohash.encode(this.lat, this.lon);
        var rangkey = util.format("%s-%d-%d", this.geohash, this.time, this.mmsi);
        return rangkey;
    }

    this.toHypertableValue = function (packetType) {
        this.packetType = packetType;
        return util.format("%d#%d#%s#%d#%d#%d#%d#%d#%d#%d#%d#%d#%s#%s#%s#%d#%s#%d#%d#%d#%d#%d#%s#%d#%d",//25
                this.srcid, this.messageType, this.classType, this.status, this.rot, this.speed,
                this.acc, this.lon, this.lat, this.course, this.headcourse, this.secondutc,
                this.imo, this.callsign, this.name, this.eta, this.dest, this.length,
                this.width, this.draught, this.cargo, this.mmsi, this.geohash, this.time,
                this.packetType);
    };
}

module.exports = AisObject;
