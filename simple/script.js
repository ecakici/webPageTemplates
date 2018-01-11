
function onLedClick(thiz){
	var ledId=parseInt($(thiz).attr("ledId"));
	var nextState;
	if ($(thiz).hasClass("on")){
		$(thiz).removeClass( "on" );
		nextState=0;
	}else{
		$(thiz).addClass( "on" );
		nextState=1;
	}

	if  ($('#useWebRtc').is(":checked")){

		sendUserMessageWebrtc(444,[ledId,nextState]);
	}else{

		sendUserMessage(444,[ledId,nextState]);

	}
}

$( ".selector" ).slider({

});

var components=[];

function setupComponents(){
	servos = $( ".servo" ).each(function() {
		servoId=parseInt($(this).attr("servoId"));


		spinnerComponent =$(this).find( ".spinner" ).spinner({
			spin:onSpin,
			max:255,
			min:0


		});

		sliderComponent =$(this).find( ".slider" ).slider({
			slide:onSlide,
			max:255

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

	if  ($('#useWebRtc').is(":checked")){

		sendUserMessageWebrtc(444,[servoId,value]);
	}else{

		sendUserMessage(444,[servoId,value]);

	}
}


function onSlide(event,ui){
	servoId=parseInt($(this.parentElement).attr('servoId'));
	components[servoId].spinner.spinner('value',ui.value);
	setServo(servoId,ui.value);
}





