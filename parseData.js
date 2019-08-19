const parseDatefunc = require("./parseDataF/newparseDate_local");
const async = require('async');

function parseData(res, callback) {

    let filesobj = res.func1;

    let index = 0;
    async.whilst(
        function () {
            return index < filesobj.length
        },
        function (callback) {
            let list = [];

            for (let j = 0; j < process.argv[3]; j++) {
                if (index === filesobj.length) {
                    break
                }

                let path = filesobj[index];
                list.push(new Promise(function (resolve, reject) {
                    parseDatefunc.readEachLine(path.file, path.datesourceType, resolve, reject);
                }));
                index++
            }

            Promise.all(list).then(function (data) {
                console.log(data);
                callback()
            })
        },
        function (err) {

        }
    )
}
exports.parseData = parseData;

