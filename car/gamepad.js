
var KeysSupport = class {
    constructor(fAccelerate,bAccelerate) {
        this.fkPrev=false;
        this.bkPrev=false;
        this.keyAccelerate=0;
        this.fAccelerate=fAccelerate;
        this.bAccelerate=bAccelerate;

    }

    getNewValue(currentValue, fk, bk) {
        if ((fk != this.fkPrev) && (fk && currentValue <= 0)) {
            currentValue = 0.01;
        }
        if ((bk != this.bkPrev) && (bk && currentValue >= 0)) {
            currentValue = -0.01;
        }


        if (fk != this.fkPrev || bk != this.bkPrev) {
            this.keyAccelerate = 0.005;

        }

        var mn = 0;
        if (fk || bk) {
            mn = 1;
            this.keyAccelerate = this.keyAccelerate * this.fAccelerate;
        } else {
            mn = -1;
            this.keyAccelerate = this.keyAccelerate * this.bAccelerate;
        }
        this.fkPrev=fk;
        this.bkPrev=bk;

        if (currentValue < 0) {
            return Math.max(-1, Math.min(0, currentValue - mn * this.keyAccelerate));
            console.info("%d", currentValue);
        } else {
            return Math.max(0, Math.min(1, currentValue + mn * this.keyAccelerate));
        }
    }

}


var keyboardInterval;
var keyboardSupport=true;
var forwardKey=false;
var backwardKey=false;
var rightKey=false;
var leftKey=false;

var intL=0;

var backForward = new KeysSupport(1.2,1.1);
var leftRight = new KeysSupport(4,4);






function disconnecthandler(e) {
    console.log('gamepad disconnected');
}
function connecthandler(e) {
    console.log('gamepad connected');
}
function canGame() {
    return "getGamepads" in navigator;
}
var hasGP = false;


var prevState;

var steeringAS=0.10;
var steeringA=0.10;
var cameraA=1;
var steeringX=0;//15
var steeringY=0;//16
var cameraX=0;//17
var cameraY=0;//18



function roundMirror(toRound, mirror){

    if (mirror){
        return -toRound;
    }
    return toRound;
}
function round256(toRound, mirror){

    return Math.round(toRound*128)+128;
}

function reportOnGamepad() {
    var currentState=[];

    var gp = navigator.getGamepads()[0];
    var html = "";
    html += "id: "+gp.id+"<br/>";

    for(var i=0;i<gp.buttons.length;i++) {

        html+= "Button "+i+": ";
        if(gp.buttons[i].pressed) {
            currentState[i]=1;
        }else{
            currentState[i]=0;
        }
    }

    for(var i=0;i<gp.axes.length; i+=1) {

        var index = i+gp.buttons.length;
        var axe = gp.axes[i];
        axe=Math.round(axe*1000)/1000;

        var zn=1;
        if (axe<0){
            zn=-1;
            axe=Math.abs(axe);
        }

        axe=Math.pow(axe,2)*zn;

        currentState[index]=roundMirror(axe,(index==16 || index==18));


    }



    if (prevState!=null){
        for(var i=0;i<prevState.length;i++){
            if (i!=20) {//20 is the same as button 8
                if (prevState[i] != currentState[i]) {


                    onButtonChange(i,currentState[i]);


                }
            }
        }
    }


    prevState=currentState;

  //  $("#gamepadDisplay").html(html);
}

function drawAxis(selector,y,x){


    $(selector).children("div").css('top', (256-round256(y))+"px");
    $(selector).children("div").css('left', round256(x)+"px");
    $(selector).children("span").text("x="+(Math.round(100*x)/100)+"   y="+Math.round(y*100)/100);
}
function drawProgress(selector,value){

    $(selector).children().css('width', (value*100)+"%");
}


function updateCameraPosition(pox_x,pos_y){
    cameraXOld=cameraX;
    cameraYOld=cameraY;

    cameraX=pox_x*cameraA*2;
    cameraY=pos_y*cameraA*2;
    drawAxis("#camera",cameraY,cameraX);
    if (cameraX!=cameraXOld){
        sendCameraX();
    }
    if (cameraY!=cameraYOld){
        sendCameraY();
    }

}

function setSteeringY(steeringYNew){
    if (steeringY!=steeringYNew){
        steeringY=steeringYNew;
        drawAxis("#steering",steeringY,steeringX);
        sendSteeringY();
    }

}

function setSteeringX(steeringXNew){
    if (steeringX!=steeringXNew){
        steeringX=steeringXNew;
        drawAxis("#steering",steeringY,steeringX);
        sendSteeringX();
    }

}
function onButtonChange(i,value){


    if (i==16){
        setSteeringY(value*steeringA);
        keyboardSupport=false;
    }else if (i==15){
        setSteeringX(value);
        keyboardSupport=false;
    }else if (i==17){
        cameraX=value*cameraA;
        drawAxis("#camera",cameraY,cameraX);
        sendCameraX();
    }else if (i==18){
        cameraY=value*cameraA;
        drawAxis("#camera",cameraY,cameraX);
        sendCameraY();
    }


    else if (i==6 && value==1){
        steeringA=Math.min(1,steeringA+steeringAS);
       drawProgress("#steeringA",steeringA);
    }else if (i==8 && value==1){
        steeringA=Math.max(steeringAS,steeringA-steeringAS);
        drawProgress("#steeringA",steeringA);
    }else if (i==7 && value==1){
        cameraA=Math.min(1,cameraA+0.25);
        drawProgress("#cameraA",cameraA);
    }else if (i==9 && value==1){
        cameraA=Math.max(0.25,cameraA-0.25);
        drawProgress("#cameraA",cameraA);
    }else if (i==22 && value==-1){
        forwardKey=true;
    }else if (i==22 && value==1){
        backwardKey=true;
    }else if (i==22 && value==0){
        backwardKey=false;
        forwardKey=false;
    }else if (i==21 && value==1){
        rightKey=true;
    }else if (i==21 && value==-1){
        leftKey=true;
    }else if (i==21 && value==0){
        leftKey=false;
        rightKey=false;
    }else{
        console.log("unrecognize key "+i + " " + value);
    }



}
function sendLights(mode){

    console.info("sending lights  %d ",mode);
    sendCoordinates(6,mode);
}

function sendSteeringY(){
    var type;
    var tosent=steeringY;

    if (tosent<0){
       type=2;
        tosent=-tosent;
    }else{
        type=1;
    }
    tosent=Math.round(tosent*255);
    console.info("sending steering Y %d ",tosent);
    sendCoordinates(type,tosent);
}

function sendSteeringX(){
    var tosent=Math.round(210+steeringX*80);
    console.info("sending steering X %d",tosent);
    sendCoordinates(5,tosent/2);

}

function sendCameraY(){
    var tosent=Math.round(250-cameraY*140);
    console.info("sending camera Y %d",tosent);
    sendCoordinates(3,tosent/2);
}

function sendCameraX(){
    //150 = odchylenie
    //310 srodek
    var tosent=Math.round(310-cameraX*150);
    console.info(" cameraX %f sending %d",cameraX,tosent);
    sendCoordinates(4,tosent/2);
}

function sendCoordinates(type,value){
    var ab =new Uint8Array(4);


    ab[0]=3;
    ab[1]=0;
    ab[2]=type;
    ab[3]=Math.abs(value);
    console.info("sending ",ab);
    if (openedChanel!=undefined){
    //    openedChanel.send(ab); //TODO uncoment
    }else{
        console.log("cannot sent no open channel");
    }
}






function keyBoardCheck() {
    if (intL==0){
        if (keyboardSupport) {
            setSteeringY(backForward.getNewValue(steeringY, forwardKey, backwardKey));
            setSteeringX(leftRight.getNewValue(steeringX, rightKey, leftKey));
        }
        if (forwardKey||backwardKey||rightKey||leftKey){
            keyboardSupport=true;
        }


    }
    intL++;
    intL=intL%2;
}


function keyDown(k){
    if (k.keyCode==38){
        forwardKey=true;
    }else if (k.keyCode==40){
        backwardKey=true;
    }else if (k.keyCode==37){
        leftKey=true;
    }else if (k.keyCode==39){
        rightKey=true;
    }
    intL=0;
}

function keyUp(k){
    if (k.keyCode==38){
        forwardKey=false;
    }else if (k.keyCode==40){
        backwardKey=false;
    }else if (k.keyCode==37){
        leftKey=false;
    }else if (k.keyCode==39){
        rightKey=false;
    }
    intL=0;
}


