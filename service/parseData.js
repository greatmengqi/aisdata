const parseDatefunc = require("../parseDataF/newparseDate_remote")
const async = require('async');
const fs = require("fs")
let logger = require("../log4js/logger");
const sql = require("../sqlServer/ssql");

function parseData(res, resolve) {
    let index = 0;
    let staticMap = res.staticMap;
    let filesobj = res.fileList;
    async.whilst(
            function () {
                if (index == filesobj.length) {
                    resolve(staticMap)
                }
                return index < filesobj.length
            },
            function (callback) {
                let path = filesobj[index];
                index++
                parseDatefunc.readEachLine(path.file, path.datesourceType, staticMap, callback)
            },
            function (err) {

            }
    )
}


module.exports.parseData = parseData;
