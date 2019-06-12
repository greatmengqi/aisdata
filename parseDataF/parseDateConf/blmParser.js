const AisObject=require("./AisObject.js");
const AisDecode=require("./AISdecode.js");
const mmsiUtil=require("./mmsiUtil.js");

function aisDecode(time,packet){
	var aisObj=new AisObject();
	aisObj.time=time;
	var decode= new AisDecode (packet);
	if(!decode.valid)
	{
		return null;
	}


	var mmsi=mmsiUtil.getmmsi(decode.mmsi);
	if(mmsi<=0)
		{return null;}

	switch (decode.aistype) {
	case 1:
	case 2:
	case 3: // class A position report
		aisObj.packetType=0;//0 动态报文  1静态报文 2 包含动态和静态报文
		aisObj.classType=decode.class; //报告类型 A or B
		aisObj.messageType=decode.aistype; //ais报文类型 1-27
		aisObj.mmsi=mmsi;
		//aisObj.time=decode;
		aisObj.speed=decode.sog;
		aisObj.status=decode.navstatus;//航行状态
		aisObj.rot=decode.rot;//转向率
		aisObj.acc=decode.acc;//位置的准确度
		aisObj.x=decode.lon;//经度
		aisObj.y=decode.lat;//纬度
		aisObj.course=decode.cog;//航向
		aisObj.headcourse=decode.hdg;//船首向
		aisObj.secondutc=decode.utc;//Second of UTC timestamp
		//aisObj.maneuver=0;//特殊操纵
		break;
	case 5:
		aisObj.mmsi = mmsi;
		aisObj.packetType=1;//0 动态报文  1静态报文 2 包含动态和静态报文
		aisObj.messageType=decode.aistype; //ais报文类型 1-27
		aisObj.imo=decode.imo;
		aisObj.callsign=decode.callsign;
		aisObj.shipname=new String(decode.shipname).replace('"', " ");
		aisObj.cargo=decode.cargo;//货物类型
		aisObj.length=decode.length;//米
		aisObj.width=decode.width;//米
		aisObj.draught=decode.draught;//吃水
		aisObj.eta=decode.eta;
		aisObj.dest=new String(decode.destination).replace('"', " ").replace("#","");//目的港
		break;
	case 18:
		aisObj.packetType=0;//0 动态报文  1静态报文 2 包含动态和静态报文
		aisObj.classType=decode.class; //报告类型 A or B
		aisObj.messageType=decode.aistype; //ais报文类型 1-27
		aisObj.mmsi=mmsi;
		//aisObj.time=decode;
		aisObj.speed=decode.sog;
		aisObj.status=decode.navstatus;//航行状态
		aisObj.rot=0;//转向率
		aisObj.acc=decode.acc;//位置的准确度
		aisObj.x=decode.lon;//经度
		aisObj.y=decode.lat;//纬度
		aisObj.course=decode.cog;//航向
		aisObj.headcourse=decode.hdg;//船首向
		aisObj.secondutc=decode.utc;//Second of UTC timestamp
		break;
	case 19:
		aisObj.packetType=2;//0 动态报文  1静态报文 2 包含动态和静态报文
		aisObj.classType=decode.class; //报告类型 A or B
		aisObj.messageType=decode.aistype; //ais报文类型 1-27
		aisObj.mmsi=mmsi;
		aisObj.speed=decode.sog;
		aisObj.status=decode.navstatus;//航行状态
		aisObj.rot=0;//转向率
		aisObj.acc=decode.acc;//位置的准确度
		aisObj.x=decode.lon;//经度
		aisObj.y=decode.lat;//纬度
		aisObj.course=decode.cog;//航向
		aisObj.headcourse=decode.hdg;//船首向
		aisObj.secondutc=decode.utc;//Second of UTC timestamp
		//静态
		aisObj.imo="";
		aisObj.callsign="";
		aisObj.shipname=new String(decode.shipname).replace('"', " ");
		aisObj.cargo=decode.cargo;//货物类型
		aisObj.length=decode.length;//米
		aisObj.width=decode.width;//米
		aisObj.draught=0;//吃水
		aisObj.eta=0;
		aisObj.dest="";//目的港

		break;

	case 24:  // Vesel static information
		if(0 === decode.part){
			aisObj.shipname=new String(decode.shipname).replace('"', " ");
		}
		else if ( decode.part === 1) {
			aisObj.cargo=decode.cargo;//货物类型
			aisObj.callsign=new String(decode.callsign).replace('"', " ");
			aisObj.length=decode.length;//米
			aisObj.width=decode.width;//米
		}
		break;
	default:
		aisObj=null;
	}

	return aisObj;
}

module.exports.aisDecode=aisDecode;
