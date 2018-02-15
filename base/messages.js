

MessageType = {USER_MESSAGE:100, USER_MESSAGE_DELIVER_STATUS:101,USER_SYNC_MESSAGE:102,	SYNC_MESSAGE:120, SYNC_MESSAGE_RESPONSE:121,	REGISTER_DEVICE:200, REGISTER_CHILD_DEVICE:201,ADD_DATA:300,	LOG:20000,	SYSTEM_MESSAGE:20001};

WSUserMessageSettings = { NO_RENEWAL: 0, RENEWAL_IF_FAILED: 1};
AddDataMessageSetting = { NO_ROUND :  0, _1S :  1, _2S :  2, _5S :  3, _10S :  4, _15S :  5, _20S :  6, _30S :  7 };
DeviceType = { NETWORK: 1, SMARTPHONE: 2, WEBPAGE: 3, JSSCRIPT: 4 };
LogLevel = { INFO :  1, WARN :  2, ERROR :  3 };
LeafDeviceType = { LD_OTHER :  1, LD_EXTERNAL_SCRIPT :  2 ,LD_SERIAL :  3, LD_NRF24 :  4 , LD_WEB_SOCKET :  5 };

SyncMessageType = { USER : 0,GET_WEBRTC_CONENCTED_DEVICE_ID: 1};

AndroidMessageIcon = {DEFAULT_ICON:1,PERSON_ICON:2,THIEF_ICON:3,WINDOW_OPEN_ICON:4,BUNNY_ICON:5};
AndroidMessageSound= {DEFAULT_SOUND:1};



function getUserMessage( userMessageSettings, receiverDeviceId,senderDeviceId, messageId, data) {

	if (typeof data === 'string' || data instanceof String){
		data=stringToByteArray(data);
	}


	size=1+2+2+2+data.length;
	pos=0;
	var ret = new Uint8Array(4+size);


	pos=putShort(ret, pos , MessageType.USER_MESSAGE);
	pos=putShort(ret,pos,size);
	pos=putByte(ret,pos,userMessageSettings);
	pos=putShort(ret,pos,receiverDeviceId);
	pos=putShort(ret,pos,senderDeviceId);
	pos=putShort(ret,pos,messageId);
	pos=putArray(ret,pos,data);

	return ret;

}





//getUserMessage(1234,12,[1,2,3,4,5,6]);
//getUserMessage(1234,12,"remotemMe some text");
function getUserSyncMessage(   receiverDeviceId,senderDeviceId,  data) {

	if (typeof data === 'string' || data instanceof String){
		data=stringToByteArray(data);
	}


	size=2+2+8+data.length;
	pos=0;
	var ret = new Uint8Array(4+size);


	pos=putShort(ret, pos , MessageType.USER_SYNC_MESSAGE);
	pos=putShort(ret,pos,size);
	pos=putShort(ret,pos,receiverDeviceId);
	pos=putShort(ret,pos,senderDeviceId);
	pos=putLong(ret,pos,Math.floor(Math.random() * 1000000000));
	pos=putArray(ret,pos,data);

	return ret;
}


function getUserSyncResponseMessage(messageId,   data) {

	if (typeof data === 'string' || data instanceof String){
		data=stringToByteArray(data);
	}


	size=8+data.length;
	var pos=0;
	var ret = new Uint8Array(4+size);

	pos=putShort(ret, pos , MessageType.SYNC_MESSAGE_RESPONSE);
	pos=putShort(ret,pos,size);

	pos=putLong(ret,pos,messageId);
	pos=putArray(ret,pos,data);

	return ret;



}

//getLogMessage(LogLevel.INFO,[1,2,3,4,5,6]);
//getLogMessage(LogLevel.DEBUG,"remotemMe some text");
function getLogMessage(level,data){

    if (typeof data === 'string' || data instanceof String){
        data=stringToByteArray(data);
    }

    size=2+data.length;
    pos=0;
    var ret = new Uint8Array(4+size);


    pos=putShort(ret, pos ,  MessageType.LOG);
    pos=putShort(ret,pos,size);
    pos=putByte(ret,pos,level);
    pos=putString(ret,pos,data);


    return ret;
}

//getAndroidMessage(128,"some title","body something","#009900",AndroidMessageSound.DEFAULT_SOUND,AndroidMessageIcon.BUNNY_ICON);
function getAndroidMessage(receivedeviceId,title,body,color,sound,icon){
    size=stringToByteArray(title).length+1;
    size+=stringToByteArray(body).length+1;
    size+=3;//color
    size+=2;//icon sound
    var ret = new Uint8Array(size);
    pos=0;
    pos=putString(ret,pos,title);
    pos=putString(ret,pos,body);
    pos=putArray(ret,pos,parseHexString(color.substring(1)));
    pos=putByte(ret,pos,sound);
    pos=putByte(ret,pos,icon);

    return getUserMessage(WSUserMessageSettings.NO_RENEWAL,receivedeviceId,0,ret);


}

//getAddDataMessage(new Date().getTime(),AddDataMessageSetting._5S,[[1,123],[2,0.5]]);
function getAddDataMessage(time,settings,dataSeries){

    size=9+dataSeries.size()*10;
    var ret = new Uint8Array(4+size);

    pos=0;


    putShort(ret, pos , MessageType.ADD_DATA);
    putShort(ret,pos,size);
    putLong(ret,pos,time);
    putByte(ret,pos,settings);

    for (i=0;i<dataSeries.length;i++) {
        var ds=dataSeries[i];
        putShort(ret,pos,ds[0]);
        putDouble(ret,pos,ds[1]);
    }

    return Payload(ret,size+4);
}

function putByte(bytearray, pos, num){
    bytearray[pos++]=num
    return pos;
}

function putDouble(bytearray, pos, num) {
    var buffer = new ArrayBuffer(8);
    var longNum = new Float64Array(buffer);

    longNum[0] = num;


    return putArray(bytearray,pos,Array.from(new Uint8Array(buffer)).reverse())
}

function putNumber(byteArray, pos, num,byteSize) {
    tabindex=pos+byteSize;

    for ( var index = 0; index < byteSize; index ++ ) {
        var byte = num & 0xff;
        byteArray [ pos+byteSize-index-1 ] = byte;
        num = (num - byte) / 256 ;
    }

    return pos+byteSize;
}



function putLong(bytearray, pos, num){
    return putNumber(bytearray,pos,num,8);
}

function putInt(bytearray, pos, num){
    return putNumber(bytearray,pos,num,4);
}


function putShort(bytearray, pos, num){
    return putNumber(bytearray,pos,num,2);
}

function putString(bytearray, pos, text){
    if (typeof text === 'string' || text instanceof String){
        text=stringToByteArray(text);
    }

    for(var i=0;i<text.length;i++){
        bytearray[pos++]=text[i]
    }
    bytearray[pos++]=0;
    return pos;
}

function putArray(bytearray, pos, array){
    for(var i=0;i<array.length;i++){
        bytearray[pos++]=array[i]
    }
    return pos;
}

function readLong(bytearray,posObject){
	var ret=0;
	for(i=posObject.pos;i<posObject.pos+8;i++){
		ret =(ret<<8)+bytearray[i];
	}
	posObject.pos+=8;

	return ret;
}

function readShort(bytearray,posObject){
	posObject.pos+=2;
	return (bytearray[posObject.pos-2]<<8)+bytearray[posObject.pos-1];
}

function readByte(bytearray,posObject){
	posObject.pos+=1;
	return bytearray[posObject.pos-1];
}

function readRestArray(bytearray,posObject){
	var data = bytearray.subarray(posObject.pos);

	posObject.pos=bytearray.length;

	return data; //to convert it normal array use Array.from(data);


}

function stringToByteArray(text){
    return Array.from(new TextEncoder("utf-8").encode(text));
}

function byteArrayToString(byteArray){
	return new TextDecoder("utf-8").decode(byteArray);
}

function parseHexString(str) {
    var result = [];
   for(i=0;i<str.length;i+=2){
        result.push(parseInt(str.substring(i, i+2), 16));
    }
    return result;
}
