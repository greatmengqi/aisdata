// let async = require("async");
//
// async.auto(
//         {
//             func0: function (callback) {
//                 console.log(0,"ok");
//                 callback()
//             },
//             func1: ["func0", function (res, callback) {
//                 console.log(res);
//                 console.log(1,"ok");
//                 callback(null)
//             }],
//             func2: ["func1", function (res, callback) {
//                 console.log(res);
//                 console.log(2,"ok");
//                 callback(null)
//             }]
//         },
//         function (err, res) {
//             console.log(3,err);
//             console.log(3,res);
//         });
let process = require("child_process");
process.exec("test -d ./data", function (code, stdout, stderr) {
    console.log("code", code);
    console.log("out", stdout);
    console.log("err", stderr);
});
