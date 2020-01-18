var fs = require('fs');
var msg='Hello world'+'\n';

fs.writeFile('./message.txt', '', (err) => {
    if (err) {
        console.log('写入文件操作失败');
    }
    else {
        console.log('next time');
    }
});
for(var i=0;i<3;i++){
    fs.appendFile('./message.txt', msg,function(err){
        if(err){
            console.log('error for writing: '+err);
        }
        else{
            //console.log('ok');
        }
    });
}

// fs.readFile("./message.txt", "utf-8", function(error, data) {
//     if (error)
//         return console.log("error for reading" + error.message);
//     var all_data=data.split('\n');
//     all_data.splice(all_data.length-1,1);
//     console.log(all_data.length);
//     console.log(all_data);
//     for(var i=0;i<all_data.length;i++){
//         var name=[];
//         name.push({
//             first:all_data[i].split('=')[0],
//             second:all_data[i].split('=')[1]
//         });
//         for(var j=i+1;j<all_data.length;j++){
//             var p1=all_data[j].split('=')[0];
//             var p2=all_data[j].split('=')[1];
//             if(name[0].first==p1){
//                 console.log(j);
//                 name.push({
//                     first:p1,
//                     second:p2
//                 });
//                 all_data.splice(j,1);
//             }
//             if(name.length==2){
//                 break;
//             }
//         }
//         //all_data.splice(i,1);
//         console.log(name);
//         console.log(all_data);
//     }
//     console.log(all_data);
// });