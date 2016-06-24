/*jshint esversion: 6*/
class TimerData {
    constructor(callback, context, intervalObject) {
        this._callback = callback;
        this._context = context;
        this._interval = intervalObject;
    }
    
    fireTimerDataCallback(dt) {
        this._callback.apply(this._context, [dt]);
    }

    clearTimerData() {
        this._callback = null;
        this._context = null;
        clearInterval(this._interval);
        this._interval = null;
    }
}

export class TimerUtil {
    constructor() {
        this._started = Date.now();
        this._lastUpdate = this._started;

        /**
         * @type {{TimerData}} @private
         */
        this._timers = {};
    }

    get elapsed() {
        return Date.now() - this._started;
    }

    //noinspection JSMethodCanBeStatic
    get serverTime() {
        return Date.now();
    }

    /**
     * @param period {number}
     * @param callback {function}
     * @param context {Object}
     */
    addTimer(period, callback, context = null) {
        if (period in this._timers) {
            throw 'period of value ' + period + ' is already occupied';
        }

        this._timers[period] = new TimerData(
            callback,
            context,
            setInterval(TimerUtil._onTriggerInterval, period, this, period)
        );
    }

    removeTimer(period) {
        if (period in this._timers) {
            this._timers[period].clearTimerData();
            delete this._timers[period];
        } else {
            console.warn('TimerUtil.removeTimer: cannot find timer of period ' + period);
        }
    }

    removeAllTimers() {
        for (const k in this._timers) {
            this._timers[k].clearTimerData();
            delete this._timers[k];
        }
    }

    /**
     * @param self {TimerUtil}
     * @param period {number}
     * @private
     */
    static _onTriggerInterval(self, period) {
        if (period in self._timers) {
            self._timers[period].fireTimerDataCallback(period);
        } else {
            console.warn('TimerUtil._onTriggerInterval: extra tick on timer of period ' + period);
        }
    }
}