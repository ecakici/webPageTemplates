var webSocket;
var thisDeviceId='####deviceId#';

function getWSUrl(){
    var ret;
    if (window.location.protocol=='https'){
        ret="wss://";
    }else{
        ret="ws://";
    }
    ret+=window.location.host+"/ws/"+deviceId;
    return ret;
    
}

function connectWS(){
    log("connectiong WS");
    webSocket = new WebSocket(getWSUrl());
    webSocket.binaryType = "arraybuffer";
    webSocket.onopen =onOpenWS;
    webSocket.onmessage =onMessageWS;
    webSocket.onerror=onError;
    webSocket.onclose=onClose;
    
}
function onError(event) {
   log("on error");
};

function onClose(event) {
   log("on close");
};

function onOpenWS(event) {
   log("websocket connected");
};

function writeShort(bytearray,pos,num){
    bytearray[pos]=(num & 0xff00) >> 8;
    bytearray[pos+1]=(num & 0xff) ;
 }
function writeArray(bytearray,pos,array){
    for(var i=0;i<array.length;i++){
        bytearray[i+pos]=array[i]
    }
}
function sendMessage(typeId,renevalWhenFailTypeId,receiveDeviceId,messageId,data) {
   
   if (typeof data === 'string' || data instanceof String){
       data=Array.from(new TextEncoder("utf-8").encode(data));
   }
   
   var ret = new Object();
   
   
   
    var bytearray = new Uint8Array(1*2+4*2+data.length);
    bytearray[0]=typeId;
    bytearray[1]=renevalWhenFailTypeId;
    writeShort(bytearray,2,receiveDeviceId);
    writeShort(bytearray,4,thisDeviceId);
    writeShort(bytearray,6,messageId);
    writeShort(bytearray,8,data.length);
    writeArray(bytearray,10,data);
   
    log(bytearray);
    webSocket.send(bytearray.buffer)
};

function onMessageWS(event) {
   var ret = new Object();
   
    var bytearray = new Uint8Array(event.data);

    ret.typeId = bytearray[0];
    ret.renevalWhenFailTypeId = bytearray[1];
    ret.receiveDeviceId = (bytearray[2]<<8)+bytearray[3];
    ret.senderDeviceId = (bytearray[4]<<8)+bytearray[5];
    ret.messageId = (bytearray[6]<<8)+bytearray[7];
    ret.size = (bytearray[8]<<8)+bytearray[9];
    var data=bytearray.subarray(10);
    ret.data=Array.from(data);
    ret.dataTExt= new TextDecoder("utf-8").decode(data);
    onMessage(ret);
   
};


function onMessage(object) {
    log(JSON.stringify(object));
}


function sendMessageButtonClick(){
    sendMessage(1,0,34,123,[1,2,3,4,5]);
 
}

function log(text){
   $( ".logContainer" ).append(text+"<br/>" );
   
}
