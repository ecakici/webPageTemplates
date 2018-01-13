



var components=[];

function setupComponents(){
	servos = $( ".servo" ).each(function() {
		servoId=parseInt($(this).attr("servoId"));


		spinnerComponent =$(this).find( ".spinner" ).spinner({
			spin:onSpin,
			max:4095,
			min:0


		});

		sliderComponent =$(this).find( ".slider" ).slider({
			slide:onSlide,
			max:4095

		});



		components[servoId]={spinner:$(this).find( ".spinner" ),
							slider:$(this).find( ".slider" )};



	});


}


function onSpin(event,ui){
	servoId=parseInt($(this.parentElement.parentElement).attr('servoId'));
	components[servoId].slider.slider('value',ui.value);



	setServo(servoId,ui.value);
}



function setServo(servoId, value) {
	console.log(servoId+" "+value);

	var ret = new Uint8Array(3);
	var pos=0;

	pos=putByte(ret, pos ,servoId );
	pos=putShort(ret, pos ,value );

	if  ($('#useWebRtc').is(":checked")){

		sendUserMessageWebrtc(444,ret);
	}else{

		sendUserMessage(444,ret);

	}
}


function onSlide(event,ui){
	servoId=parseInt($(this.parentElement).attr('servoId'));
	components[servoId].spinner.spinner('value',ui.value);
	setServo(servoId,ui.value);
}





