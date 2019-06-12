let bigDataTask = require("./bigDataTask");
let async = require("async");


const taskexec = {
    /**
     *
     * @param task
     *
     */
    autoTask: function (task) {
        // { id: 70,
        //         taskType: -2,
        //         createTime: 2019-05-14T16:37:46.323Z,
        //         month: '201905',
        //         startTime: '2019-05-14',
        //         endTime: '2019-05-14',
        //         info: {} }

        async.auto(
                {
                    func0: function (callback) {
                        bigDataTask.putdateToHdfs(task.id, task.month, callback)
                    },
                    func1: ["func0", function (res, callback) {
                        bigDataTask.storeDate(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func2: ["func1", function (res, callback) {
                        bigDataTask.shipClassifiguration(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func3: ["func2", function (res, callback) {
                        bigDataTask.mileageCalculation(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func4: ["func3", function (res, callback) {
                        bigDataTask.messageStatistic(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func5: ["func4", function (res, callback) {
                        bigDataTask.sectionCalculation(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func6: ["func5", function (res, callback) {
                        bigDataTask.staticPointEvent(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func7: ["func6", function (res, callback) {
                        bigDataTask.aisEventImport(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func8: ["func7", function (res, callback) {
                        bigDataTask.speedAbruptChange(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                    func9: ["func8", function (res, callback) {
                        bigDataTask.bigAngleEvent(task.id, task.month, task.startTime, task.endTime, callback)
                    }],
                }, function (err, res) {

                }
        );

        console.log("task start!!!");
        async
        //入库
        bigDataTask.putdateToHdfs(task.month);
        //队列划分
        //里程计算
        //事件计算
        //断面计算
        console.log("task finished!!!");
    },

    basicTask: function (task) {
        console.log("task start!!!");
        //入库
        //队列划分
        //里程计算
        //事件计算
        //断面计算
        console.log("task finished!!!");
    }
};

module.exports = taskexec;
