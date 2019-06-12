/**
 * New node file
 */
var blmlog = require('../blmlog/BlmLog.js').blmlog;
var fs = require("fs"); 
function writeToFile(path,data){
	fs.appendFile(path,data, function (error) {
		if (error)
		{blmlog.error("pushilog error  data:"+data+" error:"+error);}
	}); 
}

module.exports.writeToFile=writeToFile;
