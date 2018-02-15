function webSocketClicked(){
	if (remoteme.isWebSocketConnected()) {
		remoteme.disconnectWebSocket();
	}else{
		remoteme.connectWebSocket();
	}
}

function webRtcClicked(){
	if (remoteme.isWebRTCConnected()) {
		remoteme.disconnectWebRTC();
	}else{
		remoteme.connectWebRTC();
	}
}

function setup(){
	remoteme = new RemoteMe({
		automaticlyConnectWS: true,
		automaticlyConnectWebRTC:false,
		webSocketConnectionChange: webSocketConnectionChange,
		webRTCConnectionChange: webRtcConnectionChange,
		onUserMessage:onUserMessage,
		onUserSyncMessage:onUserSyncMessage,
		mediaConstraints: {'mandatory': {'OfferToReceiveAudio': false, 'OfferToReceiveVideo': false}}
	});
}


function appendLogArray(uintarray8){
	appendLog(new TextDecoder("utf-8").decode(uintarray8));
}

function clearLogs(){
	$("#logs").val("" );
}


var lastLogTime =new Date().getTime();

function appendLog(str){
	txt=$("#logs");

	txt.val( txt.val() + "\n"+pad(new Date().getTime()-lastLogTime,4)+" "+str);

	if(txt.length)
		txt.scrollTop(txt[0].scrollHeight - txt.height());

	lastLogTime=new Date().getTime();

}

function pad(num, size) {
	var s = "          " + num;
	return s.substr(s.length-size);
}





function webSocketConnectionChange(state){
	if (state==WebsocketConnectingStatusEnum.CONNECTED){
		$("#websocketButton").html("Websocket - connected");
	}else if (state==WebsocketConnectingStatusEnum.DISCONNECTED){
		$("#websocketButton").html("Websocket - disconnected");
	}else if (state==WebsocketConnectingStatusEnum.ERROR){
		$("#websocketButton").html("Websocket - error");
	}

}

function onUserMessage(senderDeviceId,data){
	appendLog("user message from device "+senderDeviceId+" comes ");
	appendLog("["+data+"] = string [" + byteArrayToString(data)+"]");

	if (remoteme.isWebSocketConnected()){
		remoteme.sendUserMessageWebsocket(senderDeviceId,"Hello "+ byteArrayToString(data));
	}else{
		remoteme.sendUserMessageRest(senderDeviceId,"Hello "+ byteArrayToString(data));
	}
}

function onUserSyncMessage(senderDeviceId,data){
	appendLog("sync user message from device "+senderDeviceId+" comes ");
	appendLog("["+data+"] = string [" + byteArrayToString(data)+"]");

	return "Hello sync "+byteArrayToString(data);

}

function webRtcConnectionChange(state){

	if (state==WebrtcConnectingStatusEnum.CONNECTED) {
		$("#webRtcButton").html("WebRTC - connected");
		$("#webRtcButton").prop("disabled",!true)
	}else if (state==WebrtcConnectingStatusEnum.CONNECTING) {
		$("#webRtcButton").html("WebRTC - connecting");
		$("#webRtcButton").prop("disabled",!false);
	}else if (state==WebrtcConnectingStatusEnum.DISCONNECTING) {
		$("#webRtcButton").html("WebRTC - disconnecting");
		$("#webRtcButton").prop("disabled",!false);
	}else if (state==WebrtcConnectingStatusEnum.CHECKING) {
		$("#webRtcButton").html("WebRTC - checking");
		$("#webRtcButton").prop("disabled",!false);
	}else if (state==WebrtcConnectingStatusEnum.DISCONNECTED) {
		$("#webRtcButton").html("WebRTC - disconected");
		$("#webRtcButton").prop("disabled",!true);
	}else if (state==WebrtcConnectingStatusEnum.FAILED) {
		$("#webRtcButton").html("WebRTC - failed");
		$("#webRtcButton").prop("disabled",!true);
	}
}

