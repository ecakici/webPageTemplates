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

	txt.val( txt.val() + "\n"+pad(new Date().getTime()-lastLogTime,3)+" "+str);

	if(txt.length)
		txt.scrollTop(txt[0].scrollHeight - txt.height());

	lastLogTime=new Date().getTime();

}

function pad(num, size) {
	var s = "          " + num;
	return s.substr(s.length-size);
}

function getMessageToSend(){
	return stringToByteArray($("#name").val());
}

function getReceiveDeviceId(){
	return $("#receiveDeviceId").val();
}


function sendWebsocket(){
	appendLog("--- Send by Websocket ---");
	remoteme.sendUserMessageWebsocket(getReceiveDeviceId(),getMessageToSend());
}
function sendWebrtc(){
	appendLog("--- Send by Webrtc ---");
	remoteme.sendUserMessageWebrtc(getReceiveDeviceId(),getMessageToSend());
}
function sendSync(){
	appendLog("--- Send Sync ---");
	remoteme.sendUserSyncMessageRest(getReceiveDeviceId(),getMessageToSend(), function (output) {
		appendLog("got asynch answer:");
		appendLogArray(output);
	});
}


function sendRest(){
	appendLog("--- Send by Rest ---");
	remoteme.sendUserMessageRest(getReceiveDeviceId(),getMessageToSend());

}

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


	remoteme.sendUserMessageByFasterChannel (pythonScriptDeviceId,[ledId,nextState]);

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

