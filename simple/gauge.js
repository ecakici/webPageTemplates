

class TurnMeter{
	setValue(value){
		this.gauge.value=value;
	}
	constructor(canvasId)
	{
		var ticks=[];
		ticks.push("min");
		ticks.push(0);
		ticks.push("max");
		this.gauge=new LinearGauge({
			renderTo: canvasId,
			width: 400,
			height: 150,
			minValue: -255,
			maxValue: 255,
			majorTicks: ticks,
			minorTicks: 5,
			colorPlate: "#fff",
			borderShadowWidth: 0,
			borders: false,
			barBeginCircle: false,
			tickSide: "left",
			numberSide: "left",
			needleSide: "left",
			needleType: "arrow",
			needleWidth: 12,
			highlights: [],
			colorNeedle: "#dd0031",
			colorNeedle: "#dd0031",
			animationDuration: -1,
			animationRule: "linear",
			animationTarget: "plate",
			barWidth: 0,
			ticksWidth: 10,
			ticksWidthMinor:5
		}).draw();
	}
}
class SpeedMeter{

	setSpeed(speed){
		this.gauge.value=speed;
	}

	constructor(canvasId,title)
	{
		var ticks=[];
		ticks.push("min");
		for(var i=-200;i<=200;i+=50){
			ticks.push(i+"");
		}
		ticks.push("max");
		this.gauge = new RadialGauge({
			renderTo: canvasId,
			width: 300,
			height: 300,
			units: title,
			minValue: -255,
			maxValue: 255,
			majorTicks:ticks,
			minorTicks: 2,
			strokeTicks: true,
			highlights: [
				{
					"from": 200,
					"to": 255,
					"color": "#dd0031"
				},{
					"from": 120,
					"to": 200,
					"color": "#FFAD00"
				},
				{
					"from": -255,
					"to": -200,
					"color": "#dd0031"
				},{
					"from": -200,
					"to": -120,
					"color": "#FFAD00"
				}
			],
			colorPlate: "#fff",
			borderShadowWidth: 0,
			borders: false,
			needleType: "arrow",
			needleWidth: 2,
			needleCircleSize: 7,
			needleCircleOuter: true,
			needleCircleInner: false,
			animationDuration: -1,
			animationRule: "linear"
		}).draw();
	}
}