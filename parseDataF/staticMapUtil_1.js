const sqlserver = require("../sqlServer/ssql");
const Map = require("./parseDateConf/Map.js");
const AisObject = require("./parseDateConf/AisObject.js");

function getStaticMap(res, call) {
    let inputtable = res["func0"][2]
    let staticMap = "";
    if (inputtable == "null") {
        staticMap = new Map()
        call(null, staticMap)
    } else {
        sqlserver.query(`SELECT * from  ${inputtable};`, function (err, res) {
            console.log(res)
            staticMap = new Map()

            let objarr = res.recordset

            for (let i in objarr) {
                let obj = new AisObject();
                obj.mmsi = objarr[i].mmsi;
                obj.statictimestamp = objarr[i].statictimestamp;
                obj.time = objarr[i].time;
                obj.unstatictimestamp = objarr[i].unstatictimestamp;


                obj.imo = objarr[i].imo;
                obj.name = objarr[i].name;
                obj.callsign = objarr[i].callsign;
                obj.cargo = objarr[i].cargo;
                obj.length = objarr[i].length;
                obj.width = objarr[i].width;
                obj.eta = objarr[i].eta;
                obj.draught = objarr[i].draught;
                obj.dest = objarr[i].dest;
                obj.pos_type = objarr[i].pos_type;


                obj.init_time = objarr[i].init_time;
                obj.lon = objarr[i].lon;
                obj.lat = objarr[i].lat;
                obj.mileage = objarr[i].mileage;
                obj.speed = objarr[i].speed
                obj.static_init_flag = objarr[i].static_init_flag;
                obj.unstatic_init_flag = objarr[i].unstatic_init_flag;


                staticMap.put(obj.mmsi, obj)

            }
            // console.log(staticMap);
            call(null, staticMap)
        })
    }


}


module.exports.getStaticMap = getStaticMap
