



var components=[];
var ot;
var speedmeter;
var turnMeter;
var speedControll;
var turn;
var carController;


class CarController{

	constructor(){
		this.speed=0;
		this.turn=0;
	}


	setSpeed(speed){
		this.speed=speed;
		speedmeter.setValue(speed);
		setDrive();
	}

	setTurn(turn){
		this.turn=turn;
		turnMeter.setValue(turn);
		setDrive();
	}

	compute(){
		this.leftSpeed= this.speed;
		this.rightSpeed=this.speed;



		var mn=this.speed<0?-1:1;//so it turns while drivign backwards as a real car

		this.leftSpeed+=this.turn/2*mn;
		this.rightSpeed-=this.turn/2*mn;

		this.leftSpeed=Math.min(255,Math.max(-255,this.leftSpeed));
		this.rightSpeed=Math.min(255,Math.max(-255,this.rightSpeed));

	}

	getLeftSideMotorId(){
		return 1;
	}

	getRightSideMotorId(){
		return 0;
	}

	getLeftSideSpeed(){
		return Math.abs(this.leftSpeed);
	}

	getRightSideSpeed(){
		return Math.abs(this.rightSpeed);
	}

	getRightSideMode(){
		if (this.rightSpeed==0){
			return 1;
		}else if (this.rightSpeed<0){
			return 3;
		}else{
			return 2;
		}
	}

	getLeftSideMode(){
		if (this.leftSpeed==0){
			return 1;
		}else if (this.leftSpeed<0){
			return 2;//becsaue basles are mismatch
		}else{
			return 3;
		}
	}
}


function setupKeyboard(){
	$(document).keydown(function(e){

		if (e.which==38){//arrow up
			speedControll.setMode(1,e.shiftKey);
		}else if (e.which==40){//arrow down
			speedControll.setMode(-1,e.shiftKey);
		}else if (e.which==39){//arrow right
			turn.setMode(1);
		}else if (e.which==37){//arrow left
			turn.setMode(-1);
		}
	});

	$(document).keyup(function(e){
		if (e.which==38){//arrow up
			speedControll.setMode(0);
		}else if (e.which==40){//arrow down
			speedControll.setMode(0);
		}else if (e.which==39){//arrow right
			turn.setMode(0);
		}else if (e.which==37){//arrow left
			turn.setMode(0);
		}



	});
}

function setupComponents(){

	ot=new OperationTimer(200);

	carController = new CarController();

	speedmeter = new SpeedMeter('speed');
	turnMeter = new TurnMeter('turn')


	speedControll=new Control(-255,255,3,function(value){
		carController.setSpeed(value);
	});


	turn=new Control(-255,255,3,function(value){
		carController.setTurn(value);
	});
	turn.idleWait=0;
	turn.freeAccelerate=40;
	turn.accelerate=40;

	setupKeyboard();



	$('#messageMode button').on('click', function() {
		$('#messageMode button').removeClass('active')
		$(this).addClass('active');


	});


	$('#messageMode button').on('click', function() {
		$('#messageMode button').removeClass('active')
		$(this).addClass('active');
	});




	$('#webSocketState').on('click', function() {
		if (isWebSocketConnected()){
			disconnectWebSocket();
		}else{
			connectWebSocket();
		}

	});
	$('#webRTCState').on('click', function() {
		if (isWebRTCConnected()){
			disconnectWebRTC();
		}else{
			connectWebRTC();
		}
	});



}


function isWebRtc(){
	return $('#messageMode > .active').attr("webrtc");
}



function setDrive(){
	ot.execute("setDrive",setDriveNow)
}

function setDriveNow() {

	carController.compute();
	console.log("setting leftSide: "+carController.getLeftSideSpeed()+" right Side: "+carController.getRightSideSpeed());


	var ret = new Uint8Array(8);
	var pos=0;

	pos=putByte(ret, pos ,1 );//mode 1= setMotor
	pos=putByte(ret, pos ,carController.getLeftSideMotorId() );//motorId 1 = left side
	pos=putByte(ret, pos ,carController.getLeftSideMode() );
	pos=putByte(ret, pos ,carController.getLeftSideSpeed() );


	pos=putByte(ret, pos ,1 );//mode 1= setMotor
	pos=putByte(ret, pos ,carController.getRightSideMotorId() );//motorId 1 = left side
	pos=putByte(ret, pos ,carController.getRightSideMode() );
	pos=putByte(ret, pos ,carController.getRightSideSpeed() );


	if  (isWebRtc()){
		sendUserMessageWebrtc(444,ret);
	}else{
		sendUserMessage(444,ret);

	}
}



function webSocketConnectionChange(state){
	console.info("webosvcket change "+state);
	if (state){
		$("#webSocketState").removeClass('btn-secondary');
		$("#webSocketState").addClass('btn-success');
	}else{
		$("#webSocketState").removeClass('btn-success');
		$("#webSocketState").addClass('btn-secondary');
	}

}

function webRtcConnectionChange(state){
	if (state){
		$("#webRTCState").removeClass('btn-secondary');
		$("#webRTCState").addClass('btn-success');
	}else{
		$("#webRTCState").removeClass('btn-success');
		$("#webRTCState").addClass('btn-secondary');
	}
}



