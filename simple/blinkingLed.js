
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