let cluster = require("cluster");
let numCPUs = require('os').cpus().length;
let process = require('child_process');
const sql = require("./sqlServer/ssql");


function parseData(filesobj, res, local) {

    let count = 0;
    let workers = [];
    let files = [];

    let nums = filesobj.length;

    if (nums === 0 && local) {
        return
    }
    else if (nums === 0) {
        res(0)
    }


    for (let i = 0; i < numCPUs; i++) {

        let wk = cluster.fork();

        workers.push(wk);
        // 启动进程
        wk.send({
            topic: "fork_success",
            flag: 0, //0成功 -1失败
            data: {}
        });
    }

    // 主进程，任务调度
    cluster.on('message', (worker, message) => {
        if ((message.topic === "child_ready_message" || message.topic === "task_finished_message") && message.flag === 0) {


            if (message.topic === "child_ready_message") {
                // pids.push(message.data.pid)
            }


            if (filesobj.length !== 0) {
                // 发送任务
                worker.send({
                    topic: "task_message",
                    flag: 0, //0成功 -1失败
                    data: filesobj.pop()
                });

            }

            if (message.topic === "task_finished_message") {

                files.push(message.data.task.file);
                taskId = message.taskId;

                sql.query(`update catsic.dbo.d8_ais_storage set packageNumJX =${count + 1} WHERE id = ${taskId}`, function (err) {

                    if (count === nums - 1) {

                        let group = groupBy(files, "jarName");
                        let filesmap = group[0];
                        let keys = group[1];

                        zipAndMove(filesmap, keys, workers, res);
                    }
                    count++
                });
            }
        }
    });
}


function zipAndMove(files, keys, workers, res) {


    compress(0, keys, keys.length, files, workers, res);

    function compress(jarindex, jarkeys, jarlength, files, workers, res) {

        if (jarindex === jarlength) {
            workers.forEach(node => node.disconnect());
            res(0)
        } else {
            let key = keys[jarindex]
            let file = files[key][0];

            let ll = file.outpath.split("/");

            let path = ll.slice(0, ll.length - 1).join("/");

            let commond = `rar a \"${file.jarName}\" `;

            for (let j in files[key]) {

                let temp = files[key][j].outpath.split("/");
                commond = commond + ` \"${temp[temp.length - 1]}\"`

                let mv1 = `cp "${files[key][j].outpath} ${files[key][j].localoutpath}"`;
                let mv2 = `cp "${files[key][j].otherpath} ${files[key][j].localotherpath}"`;

                process.exec(mv1, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });

                process.exec(mv2, function (err) {
                    if (err) {
                        console.log(err);
                    }
                })
            }

            process.exec(`cd "${path}"; ${commond}`, function (err) {

                if (err) {
                    console.log(err);
                }
                compress(jarindex + 1, jarkeys, jarlength, files, workers, res)
            })
        }

    }
}

function groupBy(files, tag) {
    map = {};
    key = [];

    for (let index in files) {
        file = files[index];
        if (map.hasOwnProperty(file[tag])) {
            map[file[tag]].push(files[index])
        }
        else {
            key.push(file[tag]);
            map[file[tag]] = [files[index]]
        }
    }

    return [map, key]
}

exports.parseData = parseData;


