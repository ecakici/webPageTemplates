function sendMessage(typeId,renevalWhenFailTypeId,receiveDeviceId,messageId,data) {

    if (typeof data === 'string' || data instanceof String){
        data=Array.from(new TextEncoder("utf-8").encode(data));
    }



    var bytearray = new Uint8Array(1*2+4*2+data.length);
    bytearray[0]=typeId;
    bytearray[1]=renevalWhenFailTypeId;
    writeShort(bytearray,2,receiveDeviceId);
    writeShort(bytearray,4,deviceId);
    writeShort(bytearray,6,messageId);
    writeShort(bytearray,8,data.length);
    writeArray(bytearray,10,data);

    log(bytearray);
    webSocket.send(bytearray.buffer)
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