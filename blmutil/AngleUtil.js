/**
 * Compute section
 */

function CSectionCompute(){
	/*
	 * 断面计算角度相对于Y轴(正北)
	 * 夹角：0 <= fAngle < 180
	 */
	this.computeAngleforY = function(startx, starty, endx, endy){
		var fAngle = this.computeAngleforX(startx, starty, endx, endy);
		
		if(fAngle >= 0 && fAngle <= 90)
			fAngle = 90 - fAngle;
		else
			fAngle = 270 - fAngle;

		return fAngle;
	};
	
	/*
	 * 断面计算角度相对于X轴(正东)
	 * 夹角：0 <= fAngle < 180
	 */
	this.computeAngleforX = function(startx, starty, endx, endy){
		var fPoorX = endx - startx;
		var fPoorY = endy - starty;
		var fSlope = 0;
		var fAngle = 0;
		
		if(fPoorX === 0){
			fAngle = 90;
		}else if(fPoorY === 0){
			fAngle = 0;
		}else{
			fSlope = fPoorY/fPoorX;
			var tmp = Math.atan(fSlope)*180/Math.PI;
			fAngle = tmp > 0 ? tmp : (Math.abs(tmp) + 90);
		}
		
		return fAngle;
	};
}
module.exports = new CSectionCompute();