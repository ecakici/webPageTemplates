$( document ).ready(function() {

    keyboardInterval=window.setInterval(keyBoardCheck, 30);
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);

    $(window).on("gamepadconnected", function() {
        hasGP = true;
        $("#gamepadPrompt").html("Gamepad connected!");
        console.log("connection event");
        repGP = window.setInterval(reportOnGamepad,20);
    });

    $(window).on("gamepaddisconnected", disconnecthandler);
    if (canGame()) {
        console.log('can game');
    }
    var checkGP = window.setInterval(function() {
        if(navigator.getGamepads()[0]) {
            if(!hasGP) $(window).trigger("gamepadconnected");
            window.clearInterval(checkGP);
        }
    }, 500);


    $("#remoteVideo").mousemove( function( event ) {
        var video = $("#remoteVideo");
        var parentOffset =video.offset();

        var pox_x = Math.round((event.pageX- parentOffset.left- video.width()/2)/video.width()*100)/100;
        var pos_y = Math.round((video.height()/2-event.pageY+ parentOffset.top)/video.height()*100)/100;

        updateCameraPosition(pox_x,pos_y);
    });

    $(document).keydown( function( event ) {


        $( "#keysOutput" ).html( "key down"+event.which );
    });

    $(document).keyup( function( event ) {


        $( "#keysOutput" ).html( "key up"+event.which );
    });
    $(document).focusout( function( event ) {

        $( "#keysOutput" ).html( "focus lost" );
    });

    $("#webrtcSend").click(function (event){
        var ab =new Uint8Array(18);
        for(i=2;i<18;i++){
            ab[i]=31+i;
        }

        ab[0]=3;
        ab[1]=0;

        openedChanel.send(ab);
    });


    $("#lightsOff").click(function (event){ sendLights(0);  });
    $("#lightsOn").click(function (event){ sendLights(24);  });
    $("#lightsRider").click(function (event){ sendLights(23);  });
    $("#lightsPolice").click(function (event){ sendLights(27);  });
    $("#lightsBlinkerL").click(function (event){ sendLights(25);  });
    $("#lightsBlinkerR").click(function (event){ sendLights(26);  });



    $("#websocketSend").click(function (event){


        var ab =new Uint8Array(20);
        for(i=2;i<20;i++){
            ab[i]=51+i;
        }

        ab[0]=3;
        ab[1]=0;
        webSocket.send(ab);
        // WebSocketSend(JSON.stringify(message));
    });


    $("#register").click(function (event){

        doRegister();
    });
    $("#disconnect").click(function (event){

        doDisconnect();
    });


    drawProgress("#steeringA",steeringA);
    drawProgress("#cameraA",cameraA);


    connectWS();
});