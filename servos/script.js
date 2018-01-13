



var components=[];

function setupComponents(){

	servos = $( ".servo" ).each(function() {
		servoId=parseInt($(this).attr("servoId"));


		var sliderComponent =$(this).find( ".slider" ).slider({
			formatter: function (value) {
				return 'Current value: ' + value;
			}
		});


		var spinnerComponent=$(this).find( ".spinner" );

		sliderComponent.on('slide',onSlide).data({"servoId":servoId});

		//spinnerComponent.change(onSpin);


		spinnerComponent.bind('keyup mouseup',onSpin);

		components[servoId]={spinner:spinnerComponent,
			slider:sliderComponent,value:0};
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

function onSpin(event){
	var servoId=parseInt($(this.parentElement).attr('servoId'));
	var value=parseInt(components[servoId].spinner[0].value);
	if (isNaN(value) ){
		value=0;
	}
	components[servoId].slider.slider("setValue",value);
	components[servoId].value=value;

	setServo(servoId);
}

function onSlide(event){
	servoId=parseInt($(this.parentElement).attr('servoId'));


	components[servoId].spinner.val(event.value);
	components[servoId].value=event.value;
	setServo(servoId);
}



var timeoutsByServo=[];
function setServo(servoId){

	var timeout;
	if (isWebRtc()){
		timeout=30;
	}else{
		timeout=50;
	}

	clearTimeout(timeoutsByServo[servoId]);
	timeoutsByServo[servoId]=setTimeout( setServoNow,timeout,servoId);
}

function setServoNow(servoId) {
	value=components[servoId].value;
	console.log("setting servo: "+servoId+" "+value);


	var ret = new Uint8Array(3);
	var pos=0;

	pos=putByte(ret, pos ,servoId );
	pos=putShort(ret, pos ,value );

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



