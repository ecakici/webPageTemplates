
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
			case VariableOberverType.TEXT:ret+=getArray(this.values[0]).length+1; break;
			case VariableOberverType.SMALL_INTEGER_3:ret+=6; break;
			case VariableOberverType.SMALL_INTEGER_2:ret+=4; break;
			case VariableOberverType.INTEGER_BOOLEAN:ret+=5; break;
			case VariableOberverType.DOUBLE:ret+=8; break;
			case VariableOberverType.TEXT_2:ret+=getArray(this.values[0]).length+1+getArray(this.values[1]).length+1; break;

		}
		return ret;
	}
	serialize(remoteMeData){
		remoteMeData.putShort(this.type);
		remoteMeData.putString(this.name);
		switch (this.type){
			case VariableOberverType.BOOLEAN:remoteMeData.putByte(this.values[0]?1:0); break;
			case VariableOberverType.INTEGER:remoteMeData.putInt32(this.values[0]); break;
			case VariableOberverType.TEXT:remoteMeData.putString(this.values[0]); break;
			case VariableOberverType.SMALL_INTEGER_3:
				remoteMeData.putInt16(this.values[0]);
				remoteMeData.putInt16(this.values[1]);
				remoteMeData.putInt16(this.values[2]);

				break;
			case VariableOberverType.SMALL_INTEGER_2:
				remoteMeData.putInt16(this.values[0]);
				remoteMeData.putInt16(this.values[1]);

				break;

			case VariableOberverType.INTEGER_BOOLEAN:
				remoteMeData.putInt32(this.values[0]);
				remoteMeData.putByte(this.values[1]?1:0);

				break;

			case VariableOberverType.DOUBLE:remoteMeData.putDouble(this.values[0]); break;

			case VariableOberverType.TEXT_2:
				remoteMeData.putString(this.values[0]);
				remoteMeData.putString(this.values[1]);

				break;

		}

	}

}

class Variables {


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
		var targetDeviceId=remoteMeData.popInt16();

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
				}else if (type ==VariableOberverType.INTEGER_BOOLEAN){
					toCall(remoteMeData.popInt32(),remoteMeData.popByte()==1);
				}else if (type ==VariableOberverType.SMALL_INTEGER_2){
					toCall(remoteMeData.popInt16(),remoteMeData.popInt16());
				}else if (type ==VariableOberverType.SMALL_INTEGER_3){
					toCall(remoteMeData.popInt16(),remoteMeData.popInt16(),remoteMeData.popInt16());
				}else if (type ==VariableOberverType.DOUBLE){
					toCall(remoteMeData.popDouble());
				}else if (type ==VariableOberverType.TEXT){
					toCall(remoteMeData.popString());
				}else if (type ==VariableOberverType.TEXT_2){
					toCall(remoteMeData.popString(),remoteMeData.popString());
				}else{
					console.warn(" variable type didnt found if u think its bug contact me contact@remoteme.org");
				}
			}else{
				console.warn("ddint found observer with name "+name+" and type"+type);
			}

		}

	}


	setBoolean(name,value){
		this.set(name,VariableOberverType.BOOLEAN,[value]);
	}

	setInteger(name,value){
		this.set(name,VariableOberverType.INTEGER,[value]);
	}

	setText(name,value){
		this.set(name,VariableOberverType.TEXT,[value]);
	}

	setSmallInteger3(name,value,value2,value3){
		this.set(name,VariableOberverType.SMALL_INTEGER_3,[value,value2,value3]);
	}

	setSmallInteger2(name,value,value2){
		this.set(name,VariableOberverType.SMALL_INTEGER_2,[value,value2]);
	}

	setIntegerBoolean(name,value,value2){
		this.set(name,VariableOberverType.INTEGER_BOOLEAN,[value,value2]);
	}

	setDouble(name,value){
		this.set(name,VariableOberverType.DOUBLE,[value]);
	}


	setText2(name,value,value2){
		this.set(name,VariableOberverType.TEXT_2,[value,value2]);
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
		ret.putShort(MessageType.VARIABLE_CHANGE_MESSAGE);
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


	observeText(name,onChange){
		this.observe(name,VariableOberverType.TEXT,onChange);
	}

	observeSmallInteger3(name,onChange){
		this.observe(name,VariableOberverType.SMALL_INTEGER_3,onChange);
	}

	observeSmallInteger2(name,onChange){
		this.observe(name,VariableOberverType.SMALL_INTEGER_2,onChange);
	}

	observeIntegerBoolean(name,onChange){
		this.observe(name,VariableOberverType.INTEGER_BOOLEAN,onChange);
	}

	observeDouble(name,onChange){
		this.observe(name,VariableOberverType.DOUBLE,onChange);
	}

	observeText2(name,onChange){
		this.observe(name,VariableOberverType.TEXT_2,onChange);
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



		if (this.remoteMe.isWebSocketConnected()){
			this.remoteMe.sendWebSocket(ret);
		}else{
			this.remoteMe.sendRest(ret);
		}

		this.observables[name+type]=onChange;
	}



}


