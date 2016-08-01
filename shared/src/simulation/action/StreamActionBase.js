//
// stateless abstract stream action
export class StreamActionBase {

    constructor(clientId, startTime, actionType) {
        this.clientId = clientId;
        this.startTime = startTime;
        this.simulationTime = NaN;
        this.endTime = NaN;

        this._actionType = actionType;
    }

    /** @returns {String} */
    get type() { return this._actionType; }
    get simulationStarted() { return !isNaN(this.simulationTime); }
    get simulationEnded() { return this.simulationTime === this.endTime; }
    get ended() { return !isNaN(this.endTime); }
    get duration() { return this.ended ? this.endTime - this.startTime : this.simulationTime - this.startTime; }

    update(simulationTime) {
        this.simulationTime = simulationTime;
    }

    end(endTime) {
        this.endTime = endTime;
    }

    containsTime(time) {
        if (this.ended) {
            return time >= this.startTime && time <= this.endTime;
        } else {
            return time >= this.startTime && time <= this.simulationTime;
        }
    }

    getStateAtTime(time) {
        throw "override this abstract method in descendants";
    }
}