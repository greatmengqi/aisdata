let line = require("line-reader");

let path = "C:\\Users\\great\\Desktop\\data\\test\\2015-02-13 12-1.tsv"
line.eachLine(path, async function (line, last){
    let mmsi = line.toString().split("-")[2].split("65#")[0];
    // console.log(mmsi);
    if(mmsi.trim() == "888888888")
    {
        console.log(line);
    }
    // console.log(line);
    //

})
