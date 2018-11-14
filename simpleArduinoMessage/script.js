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

	$('#sendToArduino').on('click', function() {
		var toSent = $('#hexToSend').val().split(' ').map(Number);
		remoteme.sendUserMessageByFasterChannel(arduinoDeviceId,toSent);
	});

	remoteme.directWebSocketConnectionConnect(arduinoDeviceId,webSocketLocalConnectionChange);//connect just after start

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

	if (state==ConnectingStatusEnum.CONNECTED) {
		$("#directWebSocketConnection").addClass('btn-success');
	}else if (state==ConnectingStatusEnum.ERROR){
		$("#directWebSocketConnection").addClass('btn-danger');
	}else if (state==ConnectingStatusEnum.DISCONNECTED){
		$("#directWebSocketConnection").addClass('btn-secondary');
	}
}

function webSocketConnectionChange(state){
	$("#webSocketState").removeClass('btn-secondary');
	$("#webSocketState").removeClass('btn-success');
	$("#webSocketState").removeClass('btn-danger');

	if (state==ConnectingStatusEnum.CONNECTED) {
		$("#webSocketState").addClass('btn-success');
	}else if (state==ConnectingStatusEnum.ERROR){
		$("#webSocketState").addClass('btn-danger');
	}else if (state==ConnectingStatusEnum.DISCONNECTED ){
		$("#webSocketState").addClass('btn-secondary');
	}
}





