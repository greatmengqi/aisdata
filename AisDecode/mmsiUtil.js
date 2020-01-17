var util=require("util");

function getmmsi(mmsi){ 
	if(mmsi<=0 || mmsi>999999999)
		{return 0;}
	
	if(mmsi>100000000 && mmsi<=999999999){
		return mmsi;
	}
	
	var mmsiStr=util.format("999999999%d",mmsi);
	return parseInt(mmsiStr.slice(mmsiStr.length-9)); 
}

module.exports.getmmsi=getmmsi;