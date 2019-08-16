const fileUtil = require("./fileUtil");
let fs = require("fs");
const parseData = require("./parseData");
const async = require('async');
let config = require("./conf").config;


let month = process.argv[2];


console.log(config);

let path = config.local.inDir + "/" + month;
let outPath = config.local.outDir + "/" + month;
let otherPath = config.local.otherDir + "/" + month;


if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath)
}

if (!fs.existsSync(otherPath)) {
    fs.mkdirSync(otherPath)
}

async.auto(
    {
        func1: function (callback) {
            fileUtil.getfilelist(path, outPath, otherPath, callback)
        },
        func2: ["func1", function (res, callback) {
            parseData.parseData(res, callback)
        }]
    }, function (err, res) {

    }
);
