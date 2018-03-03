


var remoteme;
var carController;
var ot;

function setupComponents(){
	ot = new OperationTimer(200);

	remoteme = new RemoteMe({
		automaticlyConnectWS: true,
		automaticlyConnectWebRTC:true,
		webSocketConnectionChange: webSocketConnectionChange,
		webRTCConnectionChange: webRtcConnectionChange,
	});
	carController = new CarController4WD();
	carController.xAxeCenter= 560;
	carController.xAxeRange=200;
	carController.yAxeCenter=430;
	carController.yAxeRange=200;
	carController.ignoreBackwardMode=true;

	new Touch(onLeftMove,onRightMove);
	send();//reset
}

function onLeftMove(x,y){
	carController.setTurn(-x/200);
	carController.setSpeed(y/100);


	send();
	/*carController.compute();
	console.info(x);
	console.info(carController.turn);
	console.info(carController.getRightSideSpeed()+" "+carController.getLeftSideSpeed());*/
}

function onRightMove(x,y){
	carController.setCameraPosition(-x/100,-y/100);

	send();
}


function send(){
	if  (remoteme.isWebRTCConnected()){
		ot.defaultDelay=200;
	}else{
		ot.defaultDelay=400;
	}
	ot.execute(sendNow)
}



function sendNow(){
	carController.compute();



	var ret = new Uint8Array(9);
	var pos=0;

	pos=putByte(ret, pos ,1);//mode 1 send camera and motors
	pos=putShort(ret, pos ,carController.getCameraX() );
	pos=putShort(ret, pos ,carController.getCameraY() );

	pos=putByte(ret, pos ,carController.getMotorMode(carController.getRightSideSpeed()) );
	pos=putByte(ret, pos ,Math.abs(carController.getRightSideSpeed()*255 ));

	pos=putByte(ret, pos ,carController.getMotorMode(-carController.getLeftSideSpeed()) );
	pos=putByte(ret, pos ,Math.abs(carController.getLeftSideSpeed()*255) );



	remoteme.sendUserMessageByFasterChannel(carScriptDeviceId,ret);

}

function webSocketConnectionChange(state){
	console.info("webosvcket change "+state);

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



function fullscreen() {
	var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
		(document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
		(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
		(document.msFullscreenElement && document.msFullscreenElement !== null);

	var docElm = document.documentElement;
	if (!isInFullScreen) {
		if (docElm.requestFullscreen) {
			docElm.requestFullscreen();
		} else if (docElm.mozRequestFullScreen) {
			docElm.mozRequestFullScreen();
		} else if (docElm.webkitRequestFullScreen) {
			docElm.webkitRequestFullScreen();
		} else if (docElm.msRequestFullscreen) {
			docElm.msRequestFullscreen();
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	}
}