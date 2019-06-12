var fs = require('fs');
let lineReader = require('line-reader')
let parseData = require("./parseDate")
const db = require('../../../../aisdata/blmutil/sqlServer');
var readdir = promisify(fs.readdir);
var stat = promisify(fs.stat);
var sqlexec = promisify(db.sql);

var readFile = promisify(fs.readFile);
var readLine = promisify(lineReader.open);


// 简单实现一个promisify


var fileList = []
var initPath = '/Users/chenmengqi/catsicts/cs/data'


let newdir = initPath.replace("/Users/chenmengqi/catsicts/cs/data","/Users/chenmengqi/catsicts/cs/temp")

// if(!fs.existsSync(newdir))
// {
//     fs.mkdirSync(newdir)
// }else {
//     fs.rmdirSync(newdir)
//     fs.mkdirSync(newdir)
// }

let sentence = `SELECT * from catsic.dbo.static_ship_message;`

// let table = getTable(sentence).then(
//     (res)=>{
//         return new Promise(function (resolve, reject) {
//             // console.log(res,'end')
//             resolve(res)
//         });
//     }
// ).then(
//     (res)=>{
//         return new Promise(function (resolve, reject) {
//             console.log(res,'end')
//             resolve(res)
//         });
//     }
// )


function getTable(sentence)
{
    return new Promise(function (resolve, reject) {
        db.sql(sentence,function (err,res) {
            if(err)
            {
                reject(err)
            }else
            {
                console.log(res,"before");
                resolve(res);
            }
        });
    })
}





readDirRecur(initPath, function (filePath) {

}).then(function ()
{

    // console.log(fileList)

    let contentList = fileList.map((filePath => {
        return new Promise(
            resolve => {
                lineReader.open(filePath, function (err, reader) {
                    if (err) {
                        console.log(err);
                    }
                    if (reader.hasNextLine()) {
                        reader.nextLine(function (undefined, line) {
                            resolve(filePath + ":::" + line)
                        });
                    }
                });
            }
        )
    }))

    Promise.all(contentList).then(function (list) {
        list.forEach(line => {
            line = line.split(":::")
            let localpath = line[0]
            let firstline = line[1]
            transdata(localpath, firstline)
        })
    })

}).catch(function (err) {
    console.log(err);
});

function readDirRecur(file, callback) {
    return readdir(file).then(
        (files) => {
            files = files.map((item) => {
                var fullPath = file + '/' + item;
                return stat(fullPath).then((stats) => {
                    if (stats.isDirectory()) {
                        let temp = fullPath.replace("/Users/chenmengqi/catsicts/cs/data/", "/Users/chenmengqi/catsicts/cs/temp/")
                        fs.mkdirSync(temp)
                        return readDirRecur(fullPath, callback);
                    } else {
                        /*not use ignore files*/
                        if (item[0] == '.') {
                            //console.log(item + ' is a hide file.');
                        } else {
                            fileList.push(fullPath)
                            callback && callback(fullPath)
                        }
                    }
                })
            });
            return Promise.all(files);
        });
}



function transdata(path, firstline) {

    let parm = {
        file: {
            path: path,
            // name: 'test',
            realNum: 0,
            size: 0
        },
        sourceType: {
            ais_time_type: 0,  //
            data_column_boundary: 3
        }
    }


    if (firstline.indexOf(":;") > 0) //那就是4
    {
        parm.sourceType.ais_time_type = 0
        parm.sourceType.data_column_boundary = 4
    }
    else { //那就是3
        parm.sourceType.ais_time_type = 0
        parm.sourceType.data_column_boundary = 3

    }


    console.log("正在解析文件：" + path)
    parseData.readEachLine(parm.file, parm.sourceType)


}

function promisify(fn) {
    return function () {
        var args = arguments;
        return new Promise(function (resolve, reject) {
            [].push.call(args, function (err, result) {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            fn.apply(null, args);
        });
    }
}








