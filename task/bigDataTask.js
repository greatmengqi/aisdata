let process = require("child_process");
const sql = require("../sqlServer/ssql");
const async = require('async');
let log = require('./tasksql');


let hostname = "10.86.11.66";
let dir = "/home/cmq";


const bigDataTask = {

    /**
     * 数据上传到hdfs
     * @param month
     */
    putdateToHdfs: function (id, month /*201801*/, callback) {
        // 1 判断是否存在该月份数据
        process.exec(`ssh root@${hostname} "test -d /data/aisdata/${month}"`, function (code, stdout, stderr) {
            if (code) //如果远程不含该文件夹
            {
                log.taskError(id, `数据存在问题，请检查该月份数据是否已经解析或者网络连接是否有问题`);
                callback("err") //停止程序
            }
            else {
                //2 上传数据到hdfs
                process.exec(`ssh root@${hostname} "hadoop fs -put /data/aisdata/${month} /aisdata_origin"`, function (code, stdout, stderr) {
                    callback(null)
                })
            }
        });
    },


    /**
     * 存入数据到hbase
     * @param startTime
     * @param endTime
     */
    storeDate: function (id, month, startTime, endTime, callback) {
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/savaFile.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);

        //存入哪张表

        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                log.taskFinished(id, "数据入库成功");
                callback(null)
            } else {
                log.taskError(id, "数据入库失败")
                callback("err") //停止程序
            }
        });
    },


    /**
     * 串号船划分任务
     * @param task
     */
    shipClassifiguration: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                log.taskFinished(id, "串号船划分成功")
                callback(null)
            } else {
                log.taskError(id, "串号船划分失败")
                callback("err")
            }
        });
    },


    /**
     * 断面计算
     * @param task
     */
    sectionCalculation: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                log.taskFinished(task.id, "断面计算结束");
                callback(null)
            }
            else {
                log.taskError(id, "断面计算失败");
                callback("err")
            }
        });
    },


    /**
     * 里程计算
     * @param task
     */
    mileageCalculation: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                log.taskFinished(task.id)
                callback()
            }
        });
    },

    /**
     * 报文统计
     * @param task
     */
    messageStatistic: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                log.taskFinished(task.id)
                callback()
            }
        });
    },

    /**
     * 静态点事件
     * @param task
     */
    staticPointEvent: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                log.taskFinished(task.id)
                callback()
            }
        });
    },

    /**
     *速度骤变事件
     * @param task
     */
    speedAbruptChange: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                log.taskFinished(task.id)
                callback()
            }
        });
    },

    /**
     * 进出港事件
     * @param task
     */
    aisEventImport: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                // log.taskFinished(task.id)
                callback()
            }
        });
    },

    /**
     * 大角度转向事件
     * @param task
     */
    bigAngleEvent: function (id, month, startTime, endTime, callback) {
        // let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh SaveFileAsTimeTable.sh /aisdata_origin/${month} /aisdata/${month} ais_history_${month.substr(0, 4)} ais_area_${month.substr(0, 4)}`]);
        let spawn = process.spawn(`ssh`, [`root@${hostname}`, `sh ${dir}/test.sh`]);
        spawn.stdout.on('data', (data) => {
            console.log('data', data.toString());
        });

        spawn.stderr.on('data', (data) => {
            console.log(`spawn stderr: ${data}`);
        });

        spawn.on('close', (code) => {
            if (code == 0) {
                // log.taskFinished(task.id)
                callback()
            }
        });
    },
};

/**
 * 获取当前月份的上一个月份
 * @param month
 */
function getLastMonth(time /*2019-05*/) {
    let year = time.substr(0, 4);
    let month = parseInt(time.substr(5, 2));
    if (month == 1) {
        month = 12
        year = parseInt(year) - 1
    }
    else {
        month = parseInt(month) - 1
    }

    if (month < 10) {
        return "" + year + "-0" + month
    }
    else {
        return "" + year + "-" + month
    }

}

/**
 * 获取当前月份的下一个月份
 * @param month
 */
function getNextMonth(time /*2019-05*/) {
    let year = time.substr(0, 4);
    let month = parseInt(time.substr(5, 2));
    if (month == 12) {
        month = 1
        year = parseInt(year) + 1
    }
    else {
        month = parseInt(month) + 1
    }

    if (month < 10) {
        return "" + year + "-0" + month
    }
    else {
        return "" + year + "-" + month
    }
}


module.exports = bigDataTask;
