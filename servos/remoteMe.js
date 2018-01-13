remoteMeDefaultConfig={
    automaticlyConnectWS:false,
	automaticlyConnectWebRTC:false,
    webSocketConnectionChange:undefined,
    webRtcConnectionChange:undefined,

};

var remoteMeConfig;


function remoteMeStart(config=undefined) {
	remoteMeConfig=remoteMeDefaultConfig
	if (config!=undefined){
		for(var k in config){
			remoteMeConfig[k]=config[k];
		}
	}

    if (remoteMeConfig.automaticlyConnectWS){
        connectWebSocket();
    }
}

function log(text) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.log(now + ': ', text);
}
function logTrace(text) {
    var now = (window.performance.now() / 1000).toFixed(3);
    console.debug(now + ': ', text);
}



function getWSUrl() {
    var ret;
    if (window.location.protocol == 'https') {
        ret = "wss://";
    } else {
        ret = "ws://";
    }
    ret += window.location.host + "/api/ws/v1/" + thisDeviceId;
    return ret;

}
var webSocket;

function connectWebSocket() {
    log("connectiong WS");
    webSocket = new WebSocket(getWSUrl());
    webSocket.binaryType = "arraybuffer";
    webSocket.onopen = onOpenWS;
    webSocket.onmessage = onMessageWS;
    webSocket.onerror = onErrorWS;
    webSocket.onclose = onCloseWS;

}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait1s() {
	await sleep(3000);

}


function restartWebSocket(){
    if (isWebSocketConnected()){
		disconnectWebSocket();
		setTimeout(connectWebSocket,1000);
    }else{
		connectWebSocket();
    }

}

function isWebSocketConnected(){
    return webSocket!=undefined && webSocket.readyState === webSocket.OPEN;
}

function disconnectWebSocket() {
    if (isWebSocketConnected()){
		webSocket.close();
    }
	webSocket=undefined;

}


function onErrorWS(event) {
    log("on error");
    if (remoteMeConfig.webSocketConnectionChange){
		remoteMeConfig.webSocketConnectionChange(false);
    }

};

function onCloseWS(event) {
    log("on close");

	if (remoteMeConfig.webSocketConnectionChange){
		remoteMeConfig.webSocketConnectionChange(false);
	}

    disconnectWebRTC();
};

function onOpenWS(event) {
    log("websocket connected");
	if (remoteMeConfig.automaticlyConnectWebRTC){
		connectWebRTC();
	}
	if (remoteMeConfig.webSocketConnectionChange){
		remoteMeConfig.webSocketConnectionChange(true);
	}

};


function onMessageWS(event) {

    log(JSON.stringify(event));
    var isWebrtcConfiguration = false;
    {
        ex=false;
        log("got websocket config " )
        try {

            var dataJson = JSON.parse(event.data);

        }
        catch (e) {
            ex=true;
        }

        if (!ex) {
            if (dataJson["cmd"] == "send") {
                isWebrtcConfiguration = true;
                doHandlePeerMessage(dataJson["msg"]);
            }
        }
    }

    if (!isWebrtcConfiguration) {
        var ret = new Object();

        var bytearray = new Uint8Array(event.data);

        ret.typeId = bytearray[0];
        ret.renevalWhenFailTypeId = bytearray[1];
        ret.receiveDeviceId = (bytearray[2] << 8) + bytearray[3];
        ret.senderDeviceId = (bytearray[4] << 8) + bytearray[5];
        ret.messageId = (bytearray[6] << 8) + bytearray[7];
        ret.size = (bytearray[8] << 8) + bytearray[9];
        var data = bytearray.subarray(10);
        ret.data = Array.from(data);
        ret.dataTExt = new TextDecoder("utf-8").decode(data);


    }

}





function sendBinaryMessage() {
    var http = new XMLHttpRequest();
    var url = "http://127.0.0.1:8082/api/~1_ySKpyx+'G23/rest/v1/sender/getUserMessage/";
    http.open("POST", url, true);

    http.setRequestHeader("Content-type", "text/plain");
    http.setRequestHeader("token", "~1_ySKpyx+'G23");


    http.send("12345");

}


//--------------- webrtc


function WebSocketSend(message) {
    if (webSocket.readyState == WebSocket.OPEN ||
        webSocket.readyState == WebSocket.CONNECTING) {
        log("sending websocket :" + message);
        webSocket.send(message);
        // var data = new ArrayBuffer(message);
        //var byteArray = new Uint8Array(message);
        //websocket.send(byteArray.buffer);
        return true;
    }
    log("failed to send :" + message);
    return false;
}

function isWebRTCConnected(){
    return openedChanel!=undefined;
}

function restartWebRTC(){
	disconnectWebRTC();
	connectWebRTC();
}

function connectWebRTC() {
    if (!isWebSocketConnected()){
        console.error("websocket is not connected cannot create webrtc connection");
        return;
    }
    // No Room concept, random generate room and client id.
    var register = {
        cmd: 'register',
        targetDeviceId:raspberryPiDeviceId
    };
    var register_message = JSON.stringify(register);
    WebSocketSend(register_message);
}

function doSend(data) {
    var message = {
        cmd: "send",
        msg: data,
        error: "",
        targetDeviceId:raspberryPiDeviceId
    };
    var data_message = JSON.stringify(message);
    if (WebSocketSend(data_message) == false) {
        log("Failed to send data: " + data_message);
        return false;
    }

    return true;
}

function disconnectWebRTC() {

	if (!isWebSocketConnected()){
		console.error("websocket is not connected cannot disconnect  webrtc connection");
		return;
	}

    var message = {
        cmd: "disconnect",
        msg: "",
        error: "",
        targetDeviceId:raspberryPiDeviceId
    };
    var data_message = JSON.stringify(message);
    if (WebSocketSend(data_message) == false) {
        log("Failed to send data: " + data_message);
        return false;
    }

	openedChanel=undefined;

}

//PEER conenction
var openedChanel=undefined;
var messageCounter = 0;
var peerConnection;
var pcConfig = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
var pcOptions = { optional: [ {DtlsSrtpKeyAgreement: true} ] };
var mediaConstraints = {'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true }};
var remoteStream;

///////////////////////////////////////////////////////////////////////////////
//
// PeerConnection
//
///////////////////////////////////////////////////////////////////////////////
function createPeerConnection() {

        peerConnection = new RTCPeerConnection(pcConfig, pcOptions);
        peerConnection.onicecandidate = function(event) {
            if (event.candidate) {
                var candidate = { type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                };
                doSend(JSON.stringify(candidate));
            } else {
                logTrace("End of candidates.");
            }
        };
        peerConnection.onconnecting = onSessionConnecting;
        peerConnection.onopen = onSessionOpened;
        peerConnection.ontrack = onRemoteStreamAdded;
        peerConnection.onremovestream = onRemoteStreamRemoved;
        peerConnection.ondatachannel =onDataChannel;

        logTrace("Created RTCPeerConnnection with config: " + JSON.stringify(pcConfig));


}


function onDataChannel(event){
    openedChanel=event.channel;

    logTrace("on data channel "+event.channel.label);
	if (remoteMeConfig.webRTCConnectionChange){
		remoteMeConfig.webRTCConnectionChange(true);
	}

	event.channel.onclose = function() {
		console.log("on data channel close  ");
		if (remoteMeConfig.webRTCConnectionChange) {
			remoteMeConfig.webRTCConnectionChange(false);
		}
	};
    event.channel.onmessage=function(e){
        console.log("on Message "+e);
    }
}

function onRemoteStreamAdded(event) {
    logTrace("Remote stream added:", event.streams );
    var remoteVideoElement = document.getElementById('remoteVideo');
    remoteVideo.srcObject = event.streams[0];
}

function sld_success_cb() {
    logTrace("setLocalDescription success");
}

function sld_failure_cb() {
    logTrace("setLocalDescription failed");
}

function aic_success_cb() {
    logTrace("addIceCandidate success");
}

function aic_failure_cb(x) {
    logTrace("addIceCandidate failed",x);
}


function doHandlePeerMessage(data) {
    ++messageCounter;
    var dataJson = JSON.parse(data);
    logTrace("Handle Message :", JSON.stringify(dataJson));



    if (dataJson["type"] == "offer" ) {        // Processing offer
        logTrace("Offer from PeerConnection" );
        var sdp_returned = forceChosenVideoCodec(dataJson.sdp, 'H264/90000');
        dataJson.sdp = sdp_returned;
        // Creating PeerConnection
        createPeerConnection();
        peerConnection.setRemoteDescription(new RTCSessionDescription(dataJson), onRemoteSdpSucces, onRemoteSdpError);
        peerConnection.createAnswer(function(sessionDescription) {
            logTrace("Create answer:", sessionDescription);
            peerConnection.setLocalDescription(sessionDescription,sld_success_cb,sld_failure_cb);
            var data = JSON.stringify(sessionDescription);
            logTrace("Sending Answer: " + data );
            doSend(data);
        }, function(error) { // error
            logTrace("Create answer error:", error);
        }, mediaConstraints); // type error
    }
    else if (dataJson["type"] == "candidate" ) {    // Processing candidate
        logTrace("Adding ICE candiate " + dataJson["candidate"]);

            var candidate = new RTCIceCandidate({sdpMLineIndex: dataJson.label, candidate: dataJson.candidate});
            peerConnection.addIceCandidate(candidate, aic_success_cb, aic_failure_cb);

            logTrace("sdpMLineIndex is null >>>>>> "+dataJson.sdpMLineIndex);


    }
}

function onSessionConnecting(message) {
    logTrace("Session connecting.");

}

function onSessionOpened(message) {
    logTrace("Session opened.");

}

function onRemoteStreamRemoved(event) {
    logTrace("Remote stream removed.");

}

function onRemoteSdpError(event) {
    console.error('onRemoteSdpError', event.name, event.message);
	if (remoteMeConfig.webRTCConnectionChange){
		remoteMeConfig.webRTCConnectionChange(false);
	}
}

function onRemoteSdpSucces() {
    logTrace('onRemoteSdpSucces');

}


function forceChosenVideoCodec(sdp, codec) {
    return maybePreferCodec(sdp, 'video', 'send', codec);
}

function forceChosenAudioCodec(sdp, codec) {
    return maybePreferCodec(sdp, 'audio', 'send', codec);
}

// Copied from AppRTC's sdputils.js:

// Sets |codec| as the default |type| codec if it's present.
// The format of |codec| is 'NAME/RATE', e.g. 'opus/48000'.
function maybePreferCodec(sdp, type, dir, codec) {
    var str = type + ' ' + dir + ' codec';
    if (codec === '') {
        logTrace('No preference on ' + str + '.');
        return sdp;
    }

    logTrace('Prefer ' + str + ': ' + codec);	// kclyu

    var sdpLines = sdp.split('\r\n');

    // Search for m line.
    var mLineIndex = findLine(sdpLines, 'm=', type);
    if (mLineIndex === null) {
        logTrace('* not found error: ' + str + ': ' + codec );	// kclyu
        return sdp;
    }

    // If the codec is available, set it as the default in m line.
    var codecIndex = findLine(sdpLines, 'a=rtpmap', codec);
    logTrace('mLineIndex Line: ' +  sdpLines[mLineIndex] );
    logTrace('found Prefered Codec in : ' + codecIndex + ': ' + sdpLines[codecIndex] );
    logTrace('codecIndex', codecIndex);
    if (codecIndex) {
        var payload = getCodecPayloadType(sdpLines[codecIndex]);
        if (payload) {
            sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], payload);
            //sdpLines[mLineIndex] = setDefaultCodecAndRemoveOthers(sdpLines, sdpLines[mLineIndex], payload);
        }
    }

    // delete id 100(VP8) and 101(VP8)

    logTrace('** Modified LineIndex Line: ' +  sdpLines[mLineIndex] );
    sdp = sdpLines.join('\r\n');
    return sdp;
}

// Find the line in sdpLines that starts with |prefix|, and, if specified,
// contains |substr| (case-insensitive search).
function findLine(sdpLines, prefix, substr) {
    return findLineInRange(sdpLines, 0, -1, prefix, substr);
}

// Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
// and, if specified, contains |substr| (case-insensitive search).
function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
        if (sdpLines[i].indexOf(prefix) === 0) {
            if (!substr ||
                sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                return i;
            }
        }
    }
    return null;
}

// Gets the codec payload type from an a=rtpmap:X line.
function getCodecPayloadType(sdpLine) {
    var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
    var result = sdpLine.match(pattern);
    return (result && result.length === 2) ? result[1] : null;
}

// Returns a new m= line with the specified codec as the first one.
function setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');

    // Just copy the first three parameters; codec order starts on fourth.
    var newLine = elements.slice(0, 3);

    // Put target payload first and copy in the rest.
    newLine.push(payload);
    for (var i = 3; i < elements.length; i++) {
        if (elements[i] !== payload) {
            newLine.push(elements[i]);
        }
    }
    return newLine.join(' ');
}


function setDefaultCodecAndRemoveOthers(sdpLines, mLine, payload) {
    var elements = mLine.split(' ');

    // Just copy the first three parameters; codec order starts on fourth.
    var newLine = elements.slice(0, 3);


    // Put target payload first and copy in the rest.
    newLine.push(payload);
    for (var i = 3; i < elements.length; i++) {
        if (elements[i] !== payload) {

            //  continue to remove all matching lines
            for(var line_removed = true;line_removed;) {
                line_removed = RemoveLineInRange(sdpLines, 0, -1, "a=rtpmap", elements[i] );
            }
            //  continue to remove all matching lines
            for(var line_removed = true;line_removed;) {
                line_removed = RemoveLineInRange(sdpLines, 0, -1, "a=rtcp-fb", elements[i] );
            }
        }
    }
    return newLine.join(' ');
}

function RemoveLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
        if (sdpLines[i].indexOf(prefix) === 0) {
            if (!substr ||
                sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                var str = "Deleting(index: " + i + ") : " + sdpLines[i];
                logTrace(str);
                sdpLines.splice(i, 1);
                return true;
            }
        }
    }
    return false;
}



//PEER connection closed


// functions for users

function sendUserMessage(receiveDeviceId,data){
	sendWebSocket(getUserMessage(WSUserMessageSettings.NO_RENEWAL,receiveDeviceId,thisDeviceId, 0,data));
}


function sendUserMessageWebrtc(receiveDeviceId,data){
	sendWebRtc(getUserMessage(WSUserMessageSettings.NO_RENEWAL,receiveDeviceId,thisDeviceId, 0,data));
}