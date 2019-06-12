const sqlserver = require("../sqlServer/ssql");
const Map = require("./parseDateConf/Map.js");
const AisObject = require("./parseDateConf/AisObject.js");

function getStaticMap(callback) {
    // sqlserver.query("SELECT * from t41_ais_static;", function (err, res) {
    //     // console.log(res.recordsets);
    let staticMap = new Map()
    //
    //     let objarr = res.recordset
    //
    //     for (let i in objarr) {
    //         let obj = new AisObject();
    //         obj.mmsi = objarr[i].mmsi;
    //         obj.statictimestamp = objarr[i].statictimestamp;
    //         obj.timestamp = objarr[i].timestamp;
    //         obj.unstatictimestamp = objarr[i].unstatictimestamp;
    //
    //
    //         obj.imo = objarr[i].imo;
    //         obj.name = objarr[i].name;
    //         obj.callsign = objarr[i].callsign;
    //         obj.cargo = objarr[i].cargo;
    //         obj.length = objarr[i].length;
    //         obj.width = objarr[i].width;
    //         obj.eta = objarr[i].eta;
    //         obj.draught = objarr[i].draught;
    //         obj.dest = objarr[i].dest;
    //         obj.classType = objarr[i].pos_type;
    //
    //
    //         obj.init_time = objarr[i].init_time;
    //         obj.lon = objarr[i].lon;
    //         obj.lat = objarr[i].lat;
    //         obj.mileage = objarr[i].mileage;
    //         obj.speed = objarr[i].speed
    //         obj.static_init_flag = objarr[i].static_init_flag;
    //         obj.unstatic_init_flag = objarr[i].unstatic_init_flag;
    //
    //
    //         if (!staticMap.get(obj.mmsi)) {
    //             staticMap.put(obj.mmsi, [obj])
    //         }
    //         else {
    //             staticMap.get(obj.mmsi).push(obj)
    //         }
    //     }
    // });
    callback(null, staticMap)
}


module.exports.getStaticMap = getStaticMap
