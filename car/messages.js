
MessageType = { USER_MESSAGE :  100, USER_MESSAGE_DELIVER_STATUS :  101,SYNC_MESSAGE: 120,SYNC_RESPONSE_MESSAGE: 121, WEBRTC_MESSAGE: 150, REGISTER_DEVICE :  200, REGISTER_CHILD_DEVICE :  201, ADD_DATA :  300, LOG: 20000};
WSUserMessageSettings = { NO_RENEWAL: 0, RENEWAL_IF_FAILED: 1};
AddDataMessageSetting = { NO_ROUND :  0, _1S :  1, _2S :  2, _5S :  3, _10S :  4, _15S :  5, _20S :  6, _30S :  7 };
DeviceType = { NETWORK: 1, SMARTPHONE: 2, WEBPAGE: 3, JSSCRIPT: 4 };
LogLevel = { INFO :  1, WARN :  2, ERROR :  3 };
LeafDeviceType = { LD_OTHER :  1, LD_EXTERNAL_SCRIPT :  2 ,LD_SERIAL :  3, LD_NRF24 :  4 , LD_WEB_SOCKET :  5 };

SyncMessageType = { USER : 0,GET_WEBRTC_CONENCTED_DEVICE_ID: 1};

AndroidMessageIcon = {DEFAULT_ICON:1,PERSON_ICON:2,THIEF_ICON:3,WINDOW_OPEN_ICON:4,BUNNY_ICON:5};
AndroidMessageSound= {DEFAULT_SOUND:1};


function sendWebSocket(bytearray){
    if (webSocket!=undefined){
        webSocket.send(bytearray.buffer)
    }else{
        log("websocket is not opened");
    }
}

function sendWebRtc(bytearray){
    if (openedChanel){
        openedChanel.send(bytearray.buffer)
    }else{
        log("webrtc channels is not opened")
    }

}


//getUserMessage(WSUserMessageSettings.NO_RENEWAL,1234,12,[1,2,3,4,5,6]);
//getUserMessage(WSUserMessageSettings.NO_RENEWAL,1234,12,"remotemMe some text");
function getUserMessage( userMessageSettings, receiverDeviceId, messageId, data) {

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
    pos=putShort(ret,pos,deviceId);
    pos=putShort(ret,pos,messageId);
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

//getAndroidMessage(123,"some title","body something","#009900",AndroidMessageSound.DEFAULT_SOUND,AndroidMessageIcon.BUNNY_ICON);
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
        bytearray[pos++]=array[i]
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

function stringToByteArray(text){
    return Array.from(new TextEncoder("utf-8").encode(text));
}

function parseHexString(str) {
    var result = [];
    while (str.length >= 8) {
        result.push(parseInt(str.substring(0, 8), 16));
        str = str.substring(8, str.length);
    }
    return result;
}
