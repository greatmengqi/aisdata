const fileUtil = require("./fileUtil");
let fs = require("fs");
const staticMapUtil = require("./parseDataF/staticMapUtil");
const parseData = require("./parseData");
const storeStaticMapUtil = require("./parseDataF/storeStaticMapUtil");
const async = require('async');
var path = process.argv[2]
var outpath = process.argv[3]


// console.log(process.argv);
if (!fs.existsSync(outpath)) {
    fs.mkdirSync(outpath)
}

async.auto(
        {
            func1: function (callback) {
                fileUtil.getfilelist(path, outpath, callback)
            },
            func2: function (callback) {
                staticMapUtil.getStaticMap(callback)
            },
            func3: ["func1", "func2", function (res, callback) {
                parseData.parseData(res, callback)
            }],
            func4: ["func3", function (res, callback) {
                storeStaticMapUtil.storeStaticMap(res, callback)
            }]
        }, function (err, res) {

        }
);
