//导入mssql模块 //基于版本@4.2.1  安装指令npm install mssql@4.2.1
// pool.close()非常重要，只创建，不关闭会造成非常严重的内存泄漏。 关闭池中的所有活动连接。
let mssql=require("mssql");
//数据库异常
mssql.on('error', err => {
    console.log("mssql异常原因："+err.message);
});

//引用配置参数模块
let configFile = require("./config")

let sql={};

//sql参数的类型
sql.direction={
    //输入参数
    Input:"input",
    //输出参数
    Output:"output",
    //返回参数
    Return:"return"
};

//配置存储过程是的输出输入
sql.sqlserver=mssql;

//默认config对象
let config=configFile.mssql_config;


/**
 * 初始化连接参数
 * @param {string} user 用户名
 * @param {string} password 密码
 * @param {string} server 服务器地址
 * @param {string} database 数据库名称
 * @param {string} port 数据库端口
 */
sql.initConfig=function(user,password,server,database,port){
    config.user = user;
    config.password =password;
    config.server =server;
    config.database= database;
    config.port = port;
}

/**
 * 执行存储过程
 * @param {string} procedure 存储过程名称
 * @param {JSON} params 存储过程参数
 * params的定义格式如：
 let params={
    //ID是存储过程的第一个参数，要去掉@符号
    ID:{
        //sqlType是该ID参数在sqlserver中的类型
        sqlType:sql.sqlserver.Int,
        //direction是表明ID参数是输入还是输出(output)参数
        direction:sql.direction.Input,
        //该ID参数的值
        inputValue:1
    },
    //Name是存储过程的第二个参数，要去掉@符号
    Name:{
        sqlType:sqlHelper.sqlserver.Int,
        direction:sqlHelper.direction.Output,
        outputValue:null
    }
};
 * @param {function} func 回调函数 共有四个参数 error:错误信息 recordsets:查询的表结果 returnValue:存储过程的返回值 affected:影响的行数
 */
sql.execute=function(procedure,params,func){
    try {
        var pool = new mssql.ConnectionPool(config,function(err){
            let request = pool.request();
            if (params != null) {
                for (let index in params) {
                    if (params[index].direction == sql.direction.Output) {
                        request.output(index, params[index].sqlType);
                    }
                    else {
                        request.input(index, params[index].sqlType, params[index].inputValue);
                    }
                }
            }
            request.execute(procedure,function(error, recordsets,returnValue,affected){
                if (error)
                {
                    doRelease(pool);//关闭连接池
                    func(error);
                }
                else {
                    for (let index in params) {
                        if (params[index].direction == sql.direction.Output) {
                            params[index].outputValue = request.parameters[index].value;
                        }
                    }
                    func(error, recordsets, returnValue,affected);//回调函数
                }
                doRelease(pool);//关闭连接池
            });
        });
    }catch(err){
        doRelease(pool);//关闭连接池
        func(err);
    }
};

/**
 * 执行sql文本(带params参数)
 * @param {string} sqlText 执行的sql语句
 * @param {JSON} params sql语句中的参数
 * @param {function} func 回调函数 共有两个个参数 error:错误消息 recordsets:查询的结果
 */
sql.queryWithParams=function(sqlText,params,func){
    try {
        var pool = new mssql.ConnectionPool(config,function(err) {
            let request = pool.request();
            request.multiple=true;
            if (params != null) {
                for(let index in params){
                    request.input(index,params[index].sqlType,params[index].inputValue);
                }
            }
            request.query(sqlText,function(err, result){
                doRelease(pool);//关闭连接池
                func(err, result);
            });
        });
    }catch(err){
        doRelease(pool);//关闭连接池
        func(err);
    }
};

/**
 * 执行sql文本
 * @param {string} sqlText 执行的sql语句
 * @param {function} func 回调函数 共有两个个参数 error:错误消息 recordsets:查询的结果
 */
sql.query=function(sqlText,func){
    sql.queryWithParams(sqlText,null,func);
};


/**
 * 执行大批量数据的插入
 * @param {sqlserver.Table} table 需要插入的数据表
 * 数据表的定义如下：
 let table=new sql.sqlserver.Table('UserInfoTest');
 table.create=true;
 table.columns.add('name',sqlHelper.sqlserver.NVarChar(50),{nullable:true});
 table.columns.add('pwd',sqlHelper.sqlserver.VarChar(200),{nullable:true});
 table.rows.add('张1','jjasdfienf');
 table.rows.add('张2','jjasdfienf');
 table.rows.add('张3','jjasdfienf');
 * @param {function} func 回调函数 共有两个参数 error:错误信息 rowcount:插入数据的行数
 */

sql.bulkInsert=function(tableObj,func){
    try {
        if(tableObj) {
            var pool = new mssql.ConnectionPool(config,function(err) {
                let request = pool.request()
                request.bulk(tableObj,function(err, result){
                    doRelease(pool);//关闭连接池
                    func(err, result);
                });
            });

            // //连接数据库异常
            // pool.on("error",  function(err) {
            //     doRelease(pool);//关闭连接池
            //     func(err);
            // });
        }
        else
            func(new ReferenceError('table parameter undefined!'));
    }catch(err){
        doRelease(pool);//关闭连接池
        func(err);
    }
};

/**
 * 如果需要处理大批量的数据行，通常应该使用流
 * @param {string} sqlText 需要执行的sql文本
 * @param {JSON} params 输入参数
 * @param {JSON} func 表示一个回调函数的JSON对象，如下所示：
 * {
    error:function(err){
        console.log(err);
    },
    columns:function(columns){
        console.log(columns);
    },
    row:function(row){
        console.log(row);
    },
    done:function(affected){
        console.log(affected);
    }
 */
sql.queryViaStreamWithParams=function(sqlText,params,func){
    try {
        var pool = new mssql.ConnectionPool(config,function(err){
            let request = pool.request();
            request.stream =true;
            if(params){
                for(let index in params){
                    request.input(index,params[index].sqlType,params[index].inputValue);
                }
            }
            request.query(sqlText);
            request.on('recordset',function(columns){
                //columns是一个JSON对象，表示 返回数据表的整个结构，包括每个字段名称以及每个字段的相关属性
                //如下所示
                /*
                { id:
                { index: 0,
                    name: 'id',
                    length: undefined,
                    type: [sql.Int],
                    scale: undefined,
                    precision: undefined,
                    nullable: false,
                    caseSensitive: false,
                    identity: true,
                    readOnly: true },
                    name:
                    { index: 1,
                        name: 'name',
                        length: 100,
                        type: [sql.NVarChar],
                        scale: undefined,
                        precision: undefined,
                        nullable: true,
                        caseSensitive: false,
                        identity: false,
                        readOnly: false },
                    Pwd:
                    { index: 2,
                        name: 'Pwd',
                        length: 200,
                        type: [sql.VarChar],
                        scale: undefined,
                        precision: undefined,
                        nullable: true,
                        caseSensitive: false,
                        identity: false,
                        readOnly: false } }
                */
                func.columns(columns);
            });
            request.on('row', function(row) {
                //row是一个JSON对象，表示 每一行的数据，包括字段名和字段值
                //如 { id: 1004, name: 'jsw', Pwd: '12345678' }
                //如果行数较多，会多次进入该方法，每次只返回一行
                func.row(row);
            });
            request.on('error', function(err) {
                //err是一个JSON对象，表示 错误信息
                //如下所示：
                /*
                { [RequestError: Incorrect syntax near the keyword 'from'.]
                    name: 'RequestError',
                        message: 'Incorrect syntax near the keyword \'from\'.',
                    code: 'EREQUEST',
                    number: 156,
                    lineNumber: 1,
                    state: 1,
                class: 15,
                    serverName: '06-PC',
                    procName: '' }
                */
                doRelease(pool);//关闭连接池
                func.error(err);
            });
            request.on('done', function(affected) {
                //affected是一个数值，表示 影响的行数
                //如 0
                //该方法是最后一个执行
                doRelease(pool);//关闭连接池
                func.done(affected);
            });
        });

    }catch(err){
        doRelease(pool);//关闭连接池
        func.error(err);
    }
};



/**
 * 如果需要处理大批量的数据行，通常应该使用流
 * @param {string} sqlText 需要执行的sql文本
 * @param {JSON} func 表示一个回调函数的JSON对象，如下所示：
 * {
    error:function(err){
        console.log(err);
    },
    columns:function(columns){
        console.log(columns);
    },
    row:function(row){
        console.log(row);
    },
    done:function(affected){
        console.log(affected);
    }
 */
sql.queryViaStream=function(sqlText,func){
    sql.queryViaStreamWithParams(sqlText,null,func);
};

function doRelease(connection) {
    if(connection)
    {
        connection.close(
            function(err) {
                if (err) { console.error(err.message); }
            });
    }
}

sql.transaction = function(callback){

    var connection =new  mssql.ConnectionPool(config, function (err) {

        var transaction = new mssql.Transaction(connection);

        callback(mssql, transaction,connection);
    })
};

//关闭数据库连接

module.exports=sql;
