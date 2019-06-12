var config = {
	"appenders":[
		{
			"type":"console"
		},
//						 {
//			            	 "type":"dateFile",
//			            	 "filename":"./logs/rizhi.log",
//			            	 "pattern":"-dd--hh.log",
//			            	 "alwaysIncludePattern":true,
//			            	 "category":"blmlog"
//						 },
		{"type":"file","filename":"./logs/rizhi.log","category":"blmlog"},
		{
			"type":"file",
			"filename":"./logs/errPack.log",
			"maxLogSize": 1024*1024*20,
			"backups":100000000,
			"category":"errorPacklog"
		}


	]
};

function ConfigLog(){
	this.getConfig = function (){
		return config;
	};

}

module.exports = ConfigLog;
