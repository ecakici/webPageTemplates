
class ToSend{
	constructor() {
		this.type=0;
		this.name="";
		this.values=[];


	}

	getSize(){
		var ret=2+this.name.length+1;
		switch (this.type){
			case VariableOberverType.BOOLEAN:ret+=1; break;
			case VariableOberverType.INTEGER:ret+=4; break;

		}
		return ret;
	}
	serialize(remoteMeData){
		remoteMeData.putShort(this.type);
		remoteMeData.putString(this.name);
		switch (this.type){
			case VariableOberverType.BOOLEAN:remoteMeData.putByte(this.values[0]?1:0); break;
			case VariableOberverType.INTEGER:remoteMeData.putInt32(this.values[0]); break;

		}

	}

}

class Observers {


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



	_onObserverPropagateMesage(remoteMeData){
		remoteMeData.popInt16();//size

		var senderDeviceId=remoteMeData.popInt16();

		var dataSize=remoteMeData.popInt16();

		for(var i=0;i<dataSize;i++){
			var type=remoteMeData.popUint16();
			var name=remoteMeData.popString();
			var toCall=this.observables[name+type];

			if (toCall!=undefined){
				if (type == VariableOberverType.BOOLEAN){
					toCall(remoteMeData.popByte()==1);
				}else if (type ==VariableOberverType.INTEGER){
					toCall(remoteMeData.popInt32());
				}else{
					console.warn(" observer type didnt found if u think its but contact me contact@remoteme.org");
				}
			}else{
				console.warn("ddint found observer with name "+name+" and type"+type);
			}

		}

	}


	setBoolean(name,value){
		this.set(name,VariableOberverType.BOOLEAN,[value]);
	}
	set(name,type,values){
		var current=new ToSend();
		current.name=name;
		current.type=type;
		current.values=values;
		this.toSend.push(current);

		if (this.sendNow){
			this._sendNow();
		}

	}

	_sendNow(){
		var ignoreDeviceId=[];

		var size=2+2+1+ignoreDeviceId.length*2;

		for (var current of this.toSend) {
			size+=current.getSize();
		}
		var ret = new RemoteMeData(4+size);
		ret.putShort(MessageType.OBSERVER_CHANGE_MESSAGE);
		ret.putShort(size);
		ret.putShort(thisDeviceId);

		ret.putByte(ignoreDeviceId.length);
		for (var current of ignoreDeviceId) {
			ret.putShort(current);
		}

		ret.putShort(this.toSend.length);

		for (var current of this.toSend) {
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


	}
	observeBoolean(name,onChange) {
		this.observe(name, VariableOberverType.BOOLEAN, onChange);
	}

	observeInteger(name,onChange){
		this.observe(name,VariableOberverType.INTEGER,onChange);
	}

	observe(name,type,onChange){

		var size=2+2+2+name.length+1;


		var ret = new RemoteMeData(4+size);

		ret.putShort(MessageType.OBSERVER_REGISTER_MESSAGE);
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

		this.observables[name+type]=onChange;
	}



}


