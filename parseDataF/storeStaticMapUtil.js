const sqlserver = require("../sqlServer/ssql");
const Map = require("./parseDateConf/Map.js");
let mssql = require("mssql");


function storeStaticMap(res, call) {
    // let outputtable = res["func0"][3]
    // let staticMapkeys = res.func3.keys
    // let staticMap = res.func3.data
    //
    //
    // let table = new mssql.Table(outputtable);
    // table.create = true;
    // table.columns.add('mmsi', mssql.Int, {nullable: false, primary: true});
    // table.columns.add('timestamp', mssql.Int, {nullable: false});
    // table.columns.add('imo', mssql.NVarChar(255), {nullable: true});
    // table.columns.add('name', mssql.NVarChar(255), {nullable: true});
    // table.columns.add('callsign', mssql.NVarChar(255), {nullable: true});
    // table.columns.add('cargo', mssql.Int, {nullable: false});
    // table.columns.add('length', mssql.Float, {nullable: false});
    // table.columns.add('width', mssql.Float, {nullable: false});
    // table.columns.add('eta', mssql.BigInt, {nullable: false});
    // table.columns.add('draught', mssql.Int, {nullable: false});
    // table.columns.add('dest', mssql.NVarChar(255), {nullable: true});
    // table.columns.add('classType', mssql.NVarChar(255), {nullable: true});
    //
    // for (let i in staticMapkeys) {
    //     let key = staticMapkeys[i]
    //     let value = staticMap[key]
    //
    //     table.rows.add(
    //             value.mmsi,
    //             value.time ? value.time : 0,
    //             value.imo,
    //             value.name,
    //             value.callsign,
    //             value.cargo,
    //             value.length,
    //             value.width,
    //             value.eta,
    //             value.draught,
    //             value.dest,
    //             value.classType);
    // }
    //
    // sqlserver.bulkInsert(table, function (err, res) {
    //     console.log(err);
    //     console.log(res);
    // })
    call(null)

}

module.exports.storeStaticMap = storeStaticMap;
