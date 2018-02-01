/**
 * you set functino to run
 * then when u are runing multiple through this class the real fiunction will be called not often once per some specific time
 */
class OperationTimer {


	constructor(defaultDelay) {
		this.toExecute = [];
		this.executeDelay = [];
		this.timers = [];

		if (defaultDelay == undefined) {
			this.defaultDelay = 10;
		} else {
			this.defaultDelay = defaultDelay;
		}
	}

	setDelayForOperationId(operationId, delay) {
		this.executeDelay[operationId] = delay;
	}

	executeWithThis(operationId, fun, thiz, ...parameters) {
		if (this.timers[operationId] == undefined) {//for first time we call it immidetly
			fun.apply(thiz, parameters);
			this.setTimeout(this, operationId);// we set timepout but nothing to execute
		} else {
			this.toExecute[operationId] = {'fun': fun, 'thiz': thiz, 'parameters': parameters};
			console.info("added to execute later");
		}


	}

	execute(operationId, fun, ...parameters) {
		this.executeWithThis(operationId, fun, undefined, parameters);

	}

	setTimeout(thiz, operationId) {
		var delayOfCurrent = thiz.executeDelay[operationId];
		if (delayOfCurrent == undefined) {
			delayOfCurrent = thiz.defaultDelay;
		}
		thiz.timers[operationId] = setTimeout(thiz.executeNow, delayOfCurrent, thiz, operationId);
	}

	executeNow(thiz, operationId) {

		var toExecute = thiz.toExecute[operationId];

		thiz.toExecute[operationId] = undefined;

		if (toExecute != undefined) {
			toExecute.fun.apply(toExecute.thiz, toExecute.parameters);
			thiz.setTimeout(thiz, operationId);
		} else {
			thiz.timers[operationId] = undefined;//so we call it again after some time of next execituin
		}
	}

}
