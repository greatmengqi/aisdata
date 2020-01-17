let config = {
    mssql_config: mssql_config = {
        // user: 'catsic',
        // password: 'boloomo20080828@))*)*@*()',
        // server: '192.168.129.115',

        // server: '192.168.94.200',
        // user: 'sa',
        // password: '123qwe!@#QWE',

        user: 'sa',
        password: '123qwe!@#QWE',
        server: '10.86.12.69',

        database: 'AIS_DATA',
        port: 1433,
        options: {},

        pool: {
            min: 0,
            max: 100,
            idleTimeoutMillis: 100000
        }
    }
};

module.exports = config;



