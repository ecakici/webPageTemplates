


var remoteme;

function setupComponents(){
	remoteme = new RemoteMe({
		automaticlyConnectWS: true,
		automaticlyConnectWebRTC:true,
		webSocketConnectionChange: webSocketConnectionChange,
		webRTCConnectionChange: webRtcConnectionChange,
	});




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



