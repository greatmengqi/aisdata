/*
 * 通过读取文件夹里的文件，来生成import.sh导入hypertable
 */
var fs = require('fs');
var outdir=require("./filepathConf.js").outdir;
var log = require('../blmlog/BlmLog.js').blmlog;
var writeToFile=require("./BlmFile.js").writeToFile;

{
	/*
	 * Start
	 */
	var pathArr = fs.readdirSync(outdir);
	var len = pathArr.length;

	if(len > 0){
		for(var i = 0; i < len; i ++){
			var fileName = pathArr[i];
			var Str = "echo \"USE 'jkydb'; LOAD DATA INFILE '" + fileName +	"' INTO TABLE 'ais_range';\" | /opt/hypertable/current/bin/ht shell\n";
			writeToFile(outdir + 'import.sh', Str);
		}
		
		log.info("[GeneralImportFile]: The current dir has %d files!", len);
	}else{
		log.info("[GeneralImportFile]: The current dir no files!");
	}
}
