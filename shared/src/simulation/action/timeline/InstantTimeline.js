import {InstantAction} from "../InstantAction";
export class InstantTimeline {
    constructor() {
        /**
         * @type {Array.<InstantAction>}
         * @private
         */
        this._timeline = [];
        this._sorted = false;
    }

    get maximumEET() { return this._timeline.length > 0 ? this._timeline[0].elapsedExecuteTime : 0; }
    get isEmpty() { return this._timeline.length === 0; }

    // /** @param value {InstantAction} */
    // add(value) {
    //     this._sorted = false;
    //     this._timeline.push(value);
    // }

    /**
     * @param clientId
     * @param currentTime - current server time
     * @param clientLag   - last client's lag
     * @param lerp        - client's interpolation time in the moment of action
     * @param data        - action data
     */
    addAction(clientId, currentTime, clientLag, lerp, data) {
        let elapsedActionTime = currentTime - clientLag - lerp;
        this._timeline.push(new InstantAction(clientId, elapsedActionTime, data));
        this._sorted = false;
    }

    /** @returns {InstantAction} */
    shift() {
        if (!this._sorted) {
            if (this._timeline.length > 1) {
                console.log('sorting timeline of len ' + this._timeline.length);
                this._timeline.sort(function(a, b) {
                    if (a.elapsedExecuteTime > b.elapsedExecuteTime) return -1;
                    if (a.elapsedExecuteTime < b.elapsedExecuteTime) return  1;
                    return 0;
                });
            }
            this._sorted = true;
        }
        return this._timeline.shift();
    }
}