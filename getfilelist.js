let fs = require("fs");




function getfilelist(dir) {
    if(fs.existsSync(dir))
    {
        let dirs = fs.readdirSync(dir);
        for (let i in dirs) {
            let path = "" + dir + "/" + dirs[i]
            if (fs.statSync(path).isDirectory()) {
                getfilelist(path)
            }
            else {

                if(path.indexOf(".log")!=-1)
                {
                    console.log(path);
                    // fs.appendFileSync('/data/ais/aisdata/filelist.txt', path+"\n")
                }

            }
        }
    }
    else {
        return
    }
}


var path = process.argv[2]
console.log(path);
getfilelist(path)
