var ot;

function setup() {
	remoteme = new RemoteMe({
		automaticlyConnectWS: true,
		automaticlyConnectWebRTC: false,
		webSocketConnectionChange: undefined,
		webRTCConnectionChange: undefined,
		mediaConstraints: {'mandatory': {'OfferToReceiveAudio': false, 'OfferToReceiveVideo': false}}
	});

	ot = new OperationTimer();

}


function onMouseMove(e) {
	$("#output").html("no delay_____: "+e.x + " - " + e.y);//will be shows immidetly

	ot.setDelayForFunction(onMouseMoveN2, 500);
	ot.setDelayForFunction(onMouseMoveN3, 1100);

	ot.execute(onMouseMoveN, e.x, e.y);//not often then default 200ms
	ot.execute(onMouseMoveN2, e.x, e.y);//not often then default 500mx
	ot.execute(onMouseMoveN3, e.x, e.y);//not often then default 1100mx
}

function onMouseMoveN(x, y) {
	$("#output2").html("onMouseMoveN : "+x + " - " + y);
}

function onMouseMoveN2(x, y) {
	$("#output3").html("onMouseMoveN2: "+x + " - " + y);
}

function onMouseMoveN3(x, y) {
	$("#output4").html("onMouseMoveN3: "+x + " - " + y);
}