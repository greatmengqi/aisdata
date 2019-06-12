const sql = require("../sqlServer/ssql");

let log = function () {

    let id = -1;
    this.taskStart = function (newid, message) {
        id = newid;
        this.update(1, message, null)
    };
    this.taskFinished = function (newid, message) {
        id = newid;
        this.update(2, message, null)
    };
    this.taskError = function (newid, errmessage) {
        id = newid;
        this.update(3, null, errmessage)
    };

    this.update = function (state, message, errMessage) {
        sql.query(`UPDATE catsic.dbo.d8_ais_task set nowStatus= ${state} WHERE id = ${id}`, function (err, res) {
            if (err) {
                console.log(err);
            }
            if (errMessage) {
                sql.query(`INSERT into [catsic].[dbo].[d8_ais_log] VALUES (getDate(),'${errMessage}',${id})`, function (err, res) {
                    // callback(err, res)
                })
            }
            else {
                sql.query(`INSERT into [catsic].[dbo].[d8_ais_log] VALUES (getDate(),'${message}',${id})`, function (err, res) {
                    // callback(err, res)
                })
            }
        })
    }
};


module.exports = new log();

