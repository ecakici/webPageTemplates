$( document ).ready(function() {
	RemoteMe.getInstance().addGuestInfoChangeListener(guestInfo=>{
		onInfoChange(guestInfo);
	});

	RemoteMe.getInstance().addGuestStateChangeListener(active=>{
		onStateChange(active);
	});

});


function onStateChange(active){
	reload();
}



function reload(){
	showProgressBarModal("Reloading");
	location.reload();
}




function onInfoChange(guestInfo){
	renderHandlebars({guestInfo:guestInfo},'guestInfo');

}


