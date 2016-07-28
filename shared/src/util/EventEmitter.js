export class EventEmitter {
    constructor() {
        /**
         * @type {Map}
         * @private
         */
        this._l = null;
    }

    _checkMap() {
        if (this._l === null) this._l = new Map();
    }

    /**
     * @param e {String}
     * @param cb {Function}
     */
    listen(e, cb) {
        this._checkMap();
        this._l.has(e) || this._l.set(e, []);

        let v = this._l.get(e);
        if (v.includes(cb)) throw 'EventEmitter on ' + this + ': cannot add callback on event ' + e + ' twice';
        v.push(cb);
    }

    /**
     * @param e {String}
     * @param cb {Function}
     */
    unlisten(e, cb) {
        // todo: implement this
        throw 'EventEmitter.unlisten is not implemented yet';
    }

    emit(e, ...args) {
        let v = this._l.get(e);

        if (v && v.length) {
            v.forEach((cb) => {
                cb(...args);
            });
        }
    }
}