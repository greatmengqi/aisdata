var moment = require('moment');

function TimeUtil(){
	// 对Date的扩展，将 Date 转化为指定格式的String 
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	// 例子： 
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
	this.date2String = function(date,fmt) 
	{ //author: meizz 
		var o = { 
				"M+" : date.getMonth()+1,                 //月份 
				"d+" : date.getDate(),                    //日 
				"h+" : date.getHours(),                   //小时 
				"m+" : date.getMinutes(),                 //分 
				"s+" : date.getSeconds(),                 //秒 
				"q+" : Math.floor((date.getMonth()+3)/3), //季度 
				"S"  : date.getMilliseconds()             //毫秒 
		}; 
		if(/(y+)/.test(fmt)) 
			fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
		for(var k in o) 
			if(new RegExp("("+ k +")").test(fmt)) 
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
		return fmt; 
	};
	/*
	 * date格式化成字符串
	 * fmt 为'YYYY-MM-DD HH:mm:ss' 其中年月日必须大写  HH大写代表（00~23） 小写代表（01~12）
	 */
	
	this.dateFormat = function(date,fmt)
	{
		var day = moment(date);
		return day.format(fmt);
	};
	
	/*
	 * unix时间转化为字符串
	 * fmt 为'YYYY-MM-DD HH:mm:ss' 其中年月日必须大写  HH大写代表（00~23） 小写代表（01~12）
	 */
	this.time2String = function(unixtime,fmt)
	{
		var day = moment(new Date(unixtime*1000));
		return day.format(fmt);
	};
	this.getDayUnixTime = function(hour,miniute){
		var day = moment({hour: 0});   //获取今天的时间
		var duration= moment.duration({minutes: miniute,hours: hour});
		day.add(duration);
		return day.unix(); 
	};
	
}
var util=new TimeUtil();
module.exports=util;
global.blmTimeUtil=util;
