function AreaUtil(){
	/**
	 * 判断点在多边形内
	 * x，y pointArray<{x:,y:}>[]
	 * */
	this.pointInPolygon=function(x,y,pointsArray) {
		var polySides=pointsArray.length; 
		var j=polySides-1 ;
		var  oddNodes=false;
  
		for (i=0;i<polySides; i++) {
			if((pointsArray[i].y< y && pointsArray[j].y>=y || pointsArray[j].y<y && pointsArray[i].y>=y) &&  (pointsArray[i].x<=x || pointsArray[j].x<=x))
			{
				if(pointsArray[i].x+(y-pointsArray[i].y)/(pointsArray[j].y-pointsArray[i].y)*(pointsArray[j].x-pointsArray[i].x)<x) 
				{
					oddNodes=!oddNodes;}
			}
			j=i;
		}
		return oddNodes; 
	};
	
	/**
	 * 获取两点之间的距离
	 **/
	this.getDisBetweenTwoPoints = function(fromX,fromY, toX, toY){
		if(Math.abs(fromX) === Math.abs(toX) && Math.abs(fromX) == 180 && fromY == toY)
			return 0;
		PER_DEGREE= Math.PI / 180;
		RADIUS_OF_EARTH=6371012
		p1X = fromX * PER_DEGREE;
		p1Y = fromY * PER_DEGREE;
		p2X = toX * PER_DEGREE;
		p2Y = toY * PER_DEGREE;
		
		distM = Math.acos(Math.sin(p1Y)*Math.sin(p2Y) +
			Math.cos(p1Y)*Math.cos(p2Y)*Math.cos(p2X-p1X)) * RADIUS_OF_EARTH;
		
		return Math.round(distM*20)/20;  
	};
}

module.exports=new AreaUtil();
