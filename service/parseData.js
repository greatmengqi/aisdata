const parseDatefunc = require("../parseDataF/newparseDate_remote")
const async = require('async');

function parseData(res, resolve) {
    let index = 0;
    let filesobj = res;
    async.whilst(
        function () {
            return index < filesobj.length
        },
        function (callback) {
            let path = filesobj[index];
            index++;
            parseDatefunc.readEachLine(path.file, path.datesourceType, index, callback)
        },
        function (err) {

        }
    )
}


module.exports.parseData = parseData;
