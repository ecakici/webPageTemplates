var remoteme;

function setup(){
	remoteme = new RemoteMe({
		automaticlyConnectWS: true,
		webSocketConnectionChange: webSocketConnectionChange,
		onUserSyncMessage: onUserSyncMessage,
		onUserMessage:onUserMessage
	});

	$('#webSocketState').on('click', function() {
		if (remoteme.isWebSocketConnected()){
			remoteme.disconnectWebSocket();
		}else{
			remoteme.connectWebSocket();
		}

	});
	$('#directWebSocketConnection').on('click', function() {
		if (remoteme.isDirectWebSocketConnectionConnected(arduinoDeviceId)){
			remoteme.directWebSocketConnectionDisconnect(arduinoDeviceId);
		}else{
			remoteme.directWebSocketConnectionConnect(arduinoDeviceId,webSocketLocalConnectionChange);
		}

	});



	remoteme.getVariablesObserver().observe("maciek",VariableOberverType.NUMBER,function(value){
		console.info("changed "+value);
	});

}


function onUserMessage(sender,data){
	var remoteMeData = new RemoteMeData(data);
	if (remoteMeData.popInt8()==1){
		alert(byteArrayToString(remoteMeData.popRestBuffer()));
	}else{
		var txt = $("#incommingMessage");
		txt.val( txt.val() + byteArrayToString(data)+"\n");
	}

}

function onUserSyncMessage(sender,data){
	var inputNumber = parseInt(byteArrayToString(data));
	var ret= (inputNumber*3)+"";
	return ret;
}




function webSocketLocalConnectionChange(deviceId,state){
	$("#directWebSocketConnection").removeClass('btn-secondary');
	$("#directWebSocketConnection").removeClass('btn-success');
	$("#directWebSocketConnection").removeClass('btn-danger');

	if (state==WebsocketConnectingStatusEnum.CONNECTED) {
		$("#directWebSocketConnection").addClass('btn-success');
	}else if (state==WebsocketConnectingStatusEnum.ERROR){
		$("#directWebSocketConnection").addClass('btn-danger');
	}else if (state==WebsocketConnectingStatusEnum.DISCONNECTED){
		$("#directWebSocketConnection").addClass('btn-secondary');
	}
}

function webSocketConnectionChange(state){
	$("#webSocketState").removeClass('btn-secondary');
	$("#webSocketState").removeClass('btn-success');
	$("#webSocketState").removeClass('btn-danger');

	if (state==WebsocketConnectingStatusEnum.CONNECTED) {
		$("#webSocketState").addClass('btn-success');


	}else if (state==WebsocketConnectingStatusEnum.ERROR){
		$("#webSocketState").addClass('btn-danger');
	}else if (state==WebsocketConnectingStatusEnum.DISCONNECTED ){
		$("#webSocketState").addClass('btn-secondary');
	}
}





