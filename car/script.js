



var ot;
var speedmeter;
var turnMeter;
var speedControll;
var turn;
var carController;
var leftSideSpeedMeter ;
var rightSideSpeedMeter ;
var cameraPosition;

class CarController{

	constructor(){
		this.turn=0;
		this.speed=0;
		this.cameraX=0.5;
		this.cameraY=0.5;

		this.xAxeCenter= 582;
		this.xAxeRange=200;

		this.yAxeCenter=430;
		this.yAxeRange=200;


		this.cameraXDirection=-1;
		this.cameraYDirection=1;

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

		this.leftSpeed+=this.turn/mn;
		this.rightSpeed-=this.turn/mn;

		this.leftSpeed=Math.min(255,Math.max(-255,this.leftSpeed));
		this.rightSpeed=Math.min(255,Math.max(-255,this.rightSpeed));

		leftSideSpeedMeter.setValue(this.leftSpeed);
		rightSideSpeedMeter.setValue(this.rightSpeed);



	}

	getLeftSideMotorId(){
		return 1;
	}

	getRightSideMotorId(){
		return 0;
	}

	getCameraXId(){
		return 1;
	}
	getCameraYId(){
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

	setCameraPosition(x,y){
		this.cameraX=x;
		this.cameraY=y;

		cameraPosition.setPosition(x,y);
		setCamera();
	}

	getCameraX(){
		return this.xAxeCenter+(this.cameraX-0.5)*2*this.xAxeRange*this.cameraXDirection;
	}

	getCameraY(){
		return this.yAxeCenter+(this.cameraY-0.5)*2*this.yAxeRange*this.cameraYDirection;
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


var remoteme;

function setupComponents(){
	remoteme = new RemoteMe({
		automaticlyConnectWS: true,
		automaticlyConnectWebRTC:true,
		webSocketConnectionChange: webSocketConnectionChange,
		webRTCConnectionChange: webRtcConnectionChange,
	});

	ot=new OperationTimer(200);
	cameraPosition=new DotPosition("cameraPosition",100,100,-100,100,-100,100);



	speedmeter = new SpeedMeter('speed',"Speed",300,300);
	turnMeter = new TurnMeter('turn',320,100);

	leftSideSpeedMeter = new SpeedMeter('leftSideSpeed',"left",150,150);
	rightSideSpeedMeter = new SpeedMeter('rightSideSpeed',"right",150,150);


	speedControll=new Control(-255,255,3,function(value){
		carController.setSpeed(value);
	});


	turn=new Control(-255,255,3,function(value){
		carController.setTurn(value);
	});
	turn.idleWait=0;
	turn.freeAccelerate=40;
	turn.accelerate=40;


	carController = new CarController();
	carController.setSpeed(0);
	carController.setTurn(0);
	carController.setCameraPosition(0.5,0.5);


	setupKeyboard();


	$("#remoteVideo").mousemove( function( event ) {
		var video = $("#remoteVideo");
		var parentOffset =video.offset();

		var pox_x = event.pageX/video.width();
		var pos_y = event.pageY/video.height();

		carController.setCameraPosition(pox_x,pos_y);
	});



	$('#cameraCenter').on('click', function() {
		carController.setCameraPosition(0.5,0.5);


	});
	//-----------

	$('#messageMode button').on('click', function() {
		$('#messageMode button').removeClass('active')
		$(this).addClass('active');


	});


	$('#messageMode button').on('click', function() {
		$('#messageMode button').removeClass('active')
		$(this).addClass('active');
	});




	$('#webSocketState').on('click', function() {
		if (remoteme.isWebSocketConnected()){
			remoteme.disconnectWebSocket();
		}else{
			remoteme.connectWebSocket();
		}

	});
	$('#webRTCState').on('click', function() {
		if (remoteme.isWebRTCConnected()){
			remoteme.disconnectWebRTC();
		}else{
			remoteme.connectWebRTC();
		}
	});




}
counter=0;





function setDrive(){
	if  (remoteme.isWebRTCConnected()){
		ot.defaultDelay=150;
	}else{
		ot.defaultDelay=400;
	}
	ot.execute("setDrive",setDriveNow)
}

function setCamera(){
	if  (remoteme.isWebRTCConnected()){
		ot.defaultDelay=150;
	}else{
		ot.defaultDelay=400;
	}
	ot.execute("setCamera",setCameraNow)
}

function setCameraNow() {

	console.log("camera x:: "+carController.getCameraX()+" y: "+carController.getCameraY());


	var ret = new Uint8Array(8);
	var pos=0;

	pos=putByte(ret, pos ,2);//mode 2= setCamera
	pos=putByte(ret, pos ,carController.getCameraXId() );
	pos=putShort(ret, pos ,carController.getCameraX() );



	pos=putByte(ret, pos ,2);//mode 2= setCamera
	pos=putByte(ret, pos ,carController.getCameraYId() );
	pos=putShort(ret, pos ,carController.getCameraY() );


	remoteme.sendUserMessageByFasterChannel(carScriptDeviceId,ret);
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


	remoteme.sendUserMessageByFasterChannel(carScriptDeviceId,ret);
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
	if (state==WebrtcConnectingStatusEnum.CONNECTED){
		$("#webRTCState").removeClass('btn-secondary');
		$("#webRTCState").addClass('btn-success');


	}else{
		$("#webRTCState").removeClass('btn-success');
		$("#webRTCState").addClass('btn-secondary');
	}

	if (state==WebrtcConnectingStatusEnum.CONNECTED) {
		$("#webRTCStatusWindow").modal("show");
		$("#webRTCStatusWindow").find(".statusText").html("View Connected");
		setTimeout(function(){
			$("#webRTCStatusWindow").modal("hide");
		},1500);
	}else if (state==WebrtcConnectingStatusEnum.CONNECTING) {
		$("#webRTCStatusWindow").modal("show");
		$("#webRTCStatusWindow").find(".statusText").html("View Connecting");
	}else if (state==WebrtcConnectingStatusEnum.DISCONNECTING) {
		$("#webRTCStatusWindow").modal("show");
		$("#webRTCStatusWindow").find(".statusText").html("View Disconnecting");
	}else if (state==WebrtcConnectingStatusEnum.CHECKING) {
		$("#webRTCStatusWindow").modal("show");
		$("#webRTCStatusWindow").find(".statusText").html("View Checking");
	}else if (state==WebrtcConnectingStatusEnum.DISCONNECTED) {
		$("#webRTCStatusWindow").modal("show");
		$("#webRTCStatusWindow").find(".statusText").html("View Disconnected");
		setTimeout(function(){
			$("#webRTCStatusWindow").modal("hide");
		},1500);
	}else if (state==WebrtcConnectingStatusEnum.FAILED) {
		$("#webRTCStatusWindow").modal("show");
		$("#webRTCStatusWindow").find(".statusText").html("View Failed");
		setTimeout(function(){
			$("#webRTCStatusWindow").modal("hide");
		},1500);
	}
}



