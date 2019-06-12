const sql = require("../sqlServer/ssql");
const schedule = require('node-schedule');
let timeUtil = require("../blmutil/TimeUtil");
let mssql = require("mssql");
let async = require("async");
let logger = require("../log4js/logger")
let fs = require("fs")




schedule.scheduleJob(' 1-59 * * * * *', function () {
    let date = timeUtil.date2String(new Date(), "yyyy-MM-dd");
    console.log(date);
    sql.query(`INSERT into [catsic].[dbo].[d8_ais_task] 
    (taskType,startDate,endDate,createManId,createTime,taskInfo,nowStatus) VALUES 
    (-2,'${date}','${date}',0,getDate(),'{}',4)`,function (err, data) {
        if(err)
        {
            console.log(err);
        }
    })
});






