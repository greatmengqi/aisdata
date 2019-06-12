const lineReader = require('line-reader');

let count = 0

lineReader.eachLine(path,function (line,last) {
    console.log(line);
},function () {

})

// var i = 1
//
// async.series([
//         function(callback) {
//             // do some stuff ...
//             i = 2
//             callback(null, 'one');
//         },
//         function(callback) {
//             // do some more stuff ...
//             i = 3
//             callback(null, 'two');
//         }
//     ],
// // optional callback
//     function(err, results) {
//         console.log(results)
//         console.log(i)
//     });
//
// console.log(i);
//
// async.series({
//     one: function(callback) {
//         setTimeout(function() {
//             callback(null, 1);
//         }, 200);
//     },
//     two: function(callback){
//         setTimeout(function() {
//             callback(null, 2);
//         }, 100);
//     }
// }, function(err, results) {
//     console.log(results);
//     // results is now equal to: {one: 1, two: 2}
// });

// async.parallel([
//         function(callback) {
//             setTimeout(function() {
//                 callback(null, 'one');
//             }, 200);
//         },
//         function(callback) {
//             setTimeout(function() {
//                 callback(null, 'two');
//             }, 100);
//         }
//     ],
// // optional callback
//     function(err, results) {
//         // the results array will equal ['one','two'] even though
//         // the second function had a shorter timeout.
//         console.log(results);
//     });
//
// // an example using an object instead of an array
// async.parallel({
//     one: function(callback) {
//         setTimeout(function() {
//             callback(null, 1);
//         }, 200);
//     },
//     two: function(callback) {
//         setTimeout(function() {
//             callback(null, 2);
//         }, 100);
//     }
// }, function(err, results) {
//     // results is now equals to: {one: 1, two: 2}
// });

// async.waterfall([
//     function(callback) {
//         callback(null, 'one', 'two');
//     },
//     function(arg1, arg2, callback) {
//         // arg1 now equals 'one' and arg2 now equals 'two'
//         console.log(arg1,arg2)
//         callback(null, 'three');
//     },
//     function(arg3, callback) {
//         // arg1 now equals 'three'
//         console.log(arg3)
//         callback(null, 'done');
//     }
// ], function (err, arg4) {
//     console.log(arg4)
//     // result now equals 'done'
// });
//
// // Or, with named functions:

// async.waterfall([
//     myFirstFunction,
//     mySecondFunction,
//     myLastFunction,
// ], function (err, result) {
//     // result now equals 'done'
// });



// function myFirstFunction(callback) {
//     let anotherList = [0,0,0]
//     appendlist(anotherList)
//     callback(null, anotherList);
// }
// function mySecondFunction(arg1, callback) {
//     // arg1 now equals 'one' and arg2 now equals 'two'
//     console.log(arg1);
//     callback(null, 'three');
// }
// function myLastFunction(arg1, callback) {
//     // arg1 now equals 'three'
//     callback(null, 'done');
// }
//
// function appendlist(anotherList) {
//     let list= [[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10],[1,2,3,4,5,6,7,8,9,10]]
//     list.forEach(arg =>{
//         arg.forEach(temp=>anotherList.push(temp))
//     })
// }


// function resolveAfter2Seconds() {
// //     return new Promise(resolve => {
// //         setTimeout(() => {
// //             resolve(2000);
// //         }, 2000);
// //     });
// // }
// // function resolveAfter3Seconds() {
// //     return new Promise(resolve => {
// //         setTimeout(() => {
// //             resolve(4000);;
// //         }, 4000);
// //     });
// // }
// //
// // async function asyncCall() {
// //     console.log('calling');
// //     console.log(await resolveAfter3Seconds());
// //     console.log(await resolveAfter2Seconds());
// //     // expected output: 'resolved'
// // }
// //
// // asyncCall();
const WriteToFile = require("../../../../aisdata/parseDataF/parseDateConf/BlmFile.js").writeToFile;

WriteToFile("/Users/chenmengqi/Desktop/data/2015-06-30_21-2的副本 2", "2015-06-30:21:58:54;!ABVDM,1,1,1,A,16:9t?0000`K8oPF7RT6gVFl05cd,0*27\n");


