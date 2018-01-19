class Control {



	runFunction(thiz, ignoreIsRunning) {
		if (!thiz.isRunning || ignoreIsRunning) {
			setTimeout(thiz.calculate, 100, thiz);
		}

	}

	setMode(mode) {
		if (this.mode != mode) {
			this.counter = 0;
			this.runFunction(this);
			this.mode = mode;

			if (this.prevMode!=mode && mode!=0){
				this.idleCounter=0;
			}

			this.prevMode=mode;
		}

	}

	constructor(min, max, callOnChange) {
		this.isRunning = false;

		this.min = min;
		this.max = max;
		this.currentValue = 0;
		this.mode = 0;
		this.prevMode=0;

		this.counter = 0;
		this.idleCounter = 0;



		this.callOnChange = callOnChange;

		this.idleWait=7;//how log wiat with downing down
		this.accelerate = 3.4;
		this.freeAccelerate = 0.4;
	}


	calculate(thiz) {
		thiz.counter++;
		var realCounter = thiz.counter;
		thiz.isRunning = true;


		var newValue = thiz.currentValue;

		if (thiz.mode == 0) {

			if (newValue == 0) {
				thiz.isRunning = false;
			} else {
				if (thiz.idleCounter < thiz.idleWait) {
					thiz.idleCounter++;
				} else {
					realCounter-=thiz.idleCounter;
					var mn = newValue < 0 ? -1 : 1;

					newValue *= mn;
					newValue -= thiz.freeAccelerate * realCounter;
					newValue = Math.max(0, newValue);

					newValue *= mn;
				}

			}

		} else {

			if (thiz.idleCounter > 0) {
				thiz.idleCounter--;
			} else {
				if (thiz.mode == 1) {
					var mn = 1;
					if (newValue < 0) {
						newValue = 0;
						thiz.isRunning = false;
					} else {
						newValue += thiz.accelerate * realCounter * mn;
						newValue = Math.min(thiz.max, newValue);
					}


				} else if (thiz.mode == -1) {
					var mn = 1;
					if (newValue > 0) {
						newValue = 0;
						thiz.isRunning = false;
					} else {
						newValue -= thiz.accelerate * realCounter * mn;
						newValue = Math.max(thiz.min, newValue);
					}

				}



			}

		}

		newValue = Math.trunc(newValue);
		if (thiz.currentValue != newValue) {
		//	console.info(thiz.currentValue- newValue);
			thiz.currentValue = newValue;

			thiz.callOnChange(newValue);
		}

		if (thiz.isRunning) {
			thiz.runFunction(thiz, true);
		}


	}
}