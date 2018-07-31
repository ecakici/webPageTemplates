
class ToSend{
	constructor() {
		this.type=0;
		this.name="";
		this.value=0;

	}

	getSize(){
		ret=2+this.name.length+1;
		switch (this.type){
			case VariableOberverType.BOOLEAN:ret+=1; break;
			case VariableOberverType.NUMBER:ret+=4; break;

		}
		return ret;
	}
	serialize(data){
		ret.putShort(this.type);
		ret.putString(this.name);
		switch (this.type){
			case VariableOberverType.BOOLEAN:ret.putByte(this.value?1:0); break;
			case VariableOberverType.NUMBER:ret.putInt32(this.value); break;

		}

	}

}

class VariablesObserver {


	begin(){
		this.sendNow=false;
	}
	commit(){
		if (this.toSend.length>0){
			this._sendNow();
		}
		this.sendNow=true;
	}
	constructor(remoteMe) {
		this.remoteMe=remoteMe;
		this.observables=[];
		this.sendNow=true;
		this.toSend=[];
	}



	_onChangeMesage(payload){

	}
	setVariable(name,value){
		if (typeof value =='boolean' ){
			setVariableBoolean(name,value);
		}else if (typeof value == 'number'){
			setVariableNumber(name,value);
		}else if (typeof value == 'string'){
			setVariableString(name,value);
		}
	}
	setVariableBoolean(name,value){
		var current=new ToSend();
		current.type=VariableOberverType.BOOLEAN;
		current.value=value;
		this.toSend+=current;
		if (this.sendNow){
			_sendNow();
		}

	}
	_sendNow(){
		var size=0;
		for (current of this.toSend) {
			size+=2+current.getSize();
		}
		var ret = new RemoteMeData(4+size);
		ret.putShort(MessageType.CHANGE_MESSAGE);
		ret.putShort(size);
		ret.putShort(thisDeviceId);
		ret.putShort(this.toSend.length);

		for (current of this.toSend) {
			current.serialize(ret);
		}

		for (var receiveDeviceId of Object.keys(this.remoteMe.directWebSocket)) {
			this.remoteMe.sendDirectWebsocket(receiveDeviceId,ret);
		}
		if (this.remoteMe.isWebRTCConnected()){
			this.remoteMe.sendWebRtc(ret);
		}

		if (this.remoteMe.isWebSocketConnected()){
			this.remoteMe.sendWebSocket(ret);
		}else{
			this.remoteMe.sendRest(ret);
		}

		this.toSend=[];

		for (current of this.toSend) {
			if (this.observables[current.name]!=undefined){
				this.observables[current.name](current.value);
			}
		}
	}

	observe(name,type,onChange){
		this.observables[name]=onChange;
		var size=2+2+2+name.length+1;


		var ret = new RemoteMeData(4+size);

		ret.putShort(MessageType.REBISTER_OBSERVER_MESSAGE);
		ret.putShort(size);
		ret.putShort(thisDeviceId);
		ret.putShort(1);
		ret.putShort(type);
		ret.putString(name);

		console.info(ret.getArray());

		if (this.remoteMe.isWebSocketConnected()){
			this.remoteMe.sendWebSocket(ret);
		}else{
			this.remoteMe.sendRest(ret);
		}

	}



}


