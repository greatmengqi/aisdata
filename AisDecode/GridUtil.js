var util=require("util");
function GridUtil(){

	function getGrid(lon1,lat1){
		var lon = parseFloat(lon1);
		var lat = parseFloat(lat1);
		var i=0;
		var j=0;
		var obj={}; 
		if(180 - lon <= 0.0000001)
		{
			i = parseInt(360/0.5)-1;
		}
		else
		{
			i = parseInt((lon + 180)/0.5);
		}

		j = parseInt((lat + 90)/0.25); 
		obj.i=i;
		obj.j=j;
		return obj;
	}
	this.getGrid= getGrid;
	
	
	this.getGridKey=function(lon,lat){
		var obj=getGrid(lon,lat);
		var strXindex=util.format("000%d",obj.i);
		var strYindex=util.format("000%d",obj.j);
		var xIndex=strXindex.slice(strXindex.length-3);
		var yIndex=strYindex.slice(strYindex.length-3);
		return util.format("%s%s",xIndex,yIndex);
	};
	
	this.getGridKeyFromIndex=function(i,j){
		var strXindex=util.format("000%d",i);
		var strYindex=util.format("000%d",j);
		var xIndex=strXindex.slice(strXindex.length-3);
		var yIndex=strYindex.slice(strYindex.length-3);
		return util.format("%s%s",xIndex,yIndex);
	};
}


module.exports=new GridUtil();