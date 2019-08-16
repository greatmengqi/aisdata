const fs = require("fs");
const moment = require("moment")
var readdir = promisify(fs.readdir);
var stat = promisify(fs.stat);


function readDirRecur(file, confObj, callback) {
    return readdir(file).then(
        (files) => {
            files = files.map((item) => {
                var fullPath = file + '/' + item;
                return stat(fullPath).then((stats) => {
                    if (stats.isDirectory()) {
                        //读取配置文件，配置文件信息传给回调函数
                        let obj = getConfObj(fullPath);

                        return readDirRecur(fullPath, obj, callback);
                    } else {
                        if (item[0] == '.') {

                        } else {

                            callback && callback(fullPath, confObj)
                        }
                    }
                })
            });
            return Promise.all(files);
        });
}


function promisify(fn) {
    return function () {
        var args = arguments;
        return new Promise(function (resolve, reject) {
            [].push.call(args, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            fn.apply(null, args);
        });
    }
}


function getfilelist(path, outpath, otherpath, callback) {

    //先读取配置文件，配置文件信息传给递归函数
    let list = [];
    let confObj = getConfObj(path);


    readDirRecur(path, confObj, function (path, confobj) {

        if (path.indexOf("configuration") == -1) { //不是配置文件
            let split = path.toString().trim().split("/");
            let filename = split[split.length - 1].split(".")[0];
            let name = filename + ".tsv";

            let fileObj = {
                file: {
                    path: path,
                    outpath: outpath + "/" + name,
                    otherpath: otherpath + "/" + name
                },
                datesourceType: {
                    ais_time_type: parseInt(confobj.ais_time_type),
                    data_column_boundary: confobj.data_column_boundary,
                    sourceid: parseInt(confobj.source_id),
                    ais_time_format: confobj.ais_time_format
                },
            };
            list.push(fileObj)
        }
    }).then(
        function (res) {
            callback(null, list)
        }
    )
}


function getConfObj(path) {
    let obj = {}
    let confpath = "";

    let files = fs.readdirSync(path);
    for (let index in files) {
        if (files[index].indexOf(".json") != -1) {
            confpath = path+"/"+files[index]
        }
    }

    if (confpath === "") {
        console.log("config不存在");
        process.exit(-1)
    } else {
        return JSON.parse(fs.readFileSync(confpath).toString());
    }
}

module.exports.getfilelist = getfilelist;
