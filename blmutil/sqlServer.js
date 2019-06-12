var sql = require('mssql')


// function sqlexec(sentence, datesourceType, cb) {
//     sql.connect("mssql://catsic:boloomo20080828@))*)*@*()@192.168.129.115/catsic").then(function () {
//         //sql.connect("mssql://sa:123@localhost:1433/test").then(function() {
//         new sql.Request().query(sentence).then(function (recordset) {
//             console.log(recordset);
//         }).catch(function (err) {
//             console.log(err);
//         });
//
//     }).catch(function (err) {
//         console.log(err);
//     });
// }

var mssql = require('mssql');
var db = {};
var config = {
    user: 'catsic',
    password: 'boloomo20080828@))*)*@*()',
    server: '192.168.129.115',
    database: 'catsic',
    port: 1433,
    options: {
        // encrypt: true // Use this if you're on Windows Azure
    },
    pool: {
        min: 0,
        max: 10000,
        idleTimeoutMillis: 3000
    }
};

//执行sql,返回数据.
db.sql = function (sql, callBack) {
    var connection = new mssql.ConnectionPool(config, function (err)
    {
        if (err) {
            console.log(err);
            return;
        }
        var ps = new mssql.PreparedStatement(connection);
        ps.prepare(sql, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            ps.execute('', function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }

                ps.unprepare(function (err) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                        return;
                    }
                    callBack(err, result);
                });
            });
        });
    });
};




module.exports = db;
