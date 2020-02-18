$( document ).ready(function() {
	RemoteMe.getInstance().addGuestInfoChangeListener(guestInfo=>{
		onInfoChange(guestInfo);
	});

	RemoteMe.getInstance().addGuestStateChangeListener(active=>{
		onStateChange(active);
	});
	renderPayments();
});


function onStateChange(active){
	reload();
}



function reload(){
	showProgressBarModal("Reloading");
	location.reload();
}

function renderPayments(){
	var elementById = document.getElementById('stripePayments');
	if (elementById!=undefined){

		console.info(stripePayments);
		let template = Handlebars.compile(elementById.innerHTML);
		let innerHTML = template({stripePayments:stripePayments});
		document.getElementById('stripePaymentsTarget').innerHTML = innerHTML;
	}
}



function onInfoChange(guestInfo){
	renderInfo(guestInfo);
}



