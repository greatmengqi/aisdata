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
                            /*not use ignore files*/
                            if (item[0] == '.') {
                                //console.log(item + ' is a hide file.');
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

function getfilelist(path, outpath, callback) {

    //先读取配置文件，配置文件信息传给递归函数
    let list = [];
    let confObj = getConfObj(path);
    readDirRecur(path, confObj, function (path, confobj) {
        if (path.indexOf("configuration") == -1) { //不是配置文件
            let split = path.toString().trim().split("/");
            let filename = split[split.length - 1].split(".")[0];
            let name = filename + ".tsv";
            let level = 0;
            if (confobj.source_id == 47) { //东方通数据
                filename = moment(filename, "YYYYMMDDHH").unix();
            } else if (confobj.source_id == 65) { //本地数据
                level = 1;
                filename = moment(filename, "YYYY-MM-DD HH-mm").unix();
            }

            let fileObj = {
                file: {
                    path: path,
                    outpath: outpath + "/" + name
                }
                ,
                datesourceType: {
                    ais_time_type: parseInt(confobj.ais_time_type),
                    data_column_boundary: parseInt(confobj.data_column_boundary),
                    sourceid: parseInt(confobj.source_id)
                },
                sortkey: filename,
                level: level,
                // filterkey: 0
            };
            list.push(fileObj)
        }
    }).then(
            function (res) {
                list = list.sort((a, b) => {
                    if (a.sortkey != b.sortkey) {
                        return a.sortkey - b.sortkey
                    } else {
                        return a.level - b.level
                    }
                }).filter(((value, index, array) => {
                    return true
                }));
                callback(null, list)
            }
    )
}


function getConfObj(path) {
    let obj = {}
    let configurationPath = path + "\/configuration.txt"
    let string = ""
    if (fs.existsSync(configurationPath)) {
        string = fs.readFileSync(configurationPath).toString();
    }
    else {
        console.log(configurationPath + "  不存在");
        process.exit(-1)
    }

    while (string.indexOf("\r\n") != -1) {
        string = string.toString().replace("\r\n", "")
    }
    let split = string.toString().trim().split(";");
    for (let i in split) {
        if (split[i] != "") {
            let str = split[i].split(":")
            obj[str[0]] = str[1]
        }
    }
    return obj
}

module.exports.getfilelist = getfilelist;
