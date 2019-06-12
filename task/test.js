const WriteToFile = require("../parseDataF/parseDateConf/BlmFile.js").writeToFile;

async function test() {
    while (true)
    {
        console.log('ok');
        await WriteToFile("C:\\学习\\技术学习\\java学习new\\spark2.0\\src\\data\\test.log","132131")
    }

}

test()

