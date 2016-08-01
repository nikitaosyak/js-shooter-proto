
export class Player {
    /**
     * @param id    {Number}
     * @param x     {Number}
     * @param y     {Number}
     * @param name  {String}
     * @param isMe  {Boolean}
     */
    constructor(id, x, y, name, isMe) {
        this._id = id;

        this._pos = {x: x, y: y};
        this._lastSentPointer = {x: -1, y: -1};
        this._pointer = {x: -1, y: -1};

        this._alive = true;

        this._name = name;
        this._isMe = isMe;
    }

    get id() { return this._id; }
    get pos() { return this._pos; }
    get lastSentPointer() { return this._lastSentPointer; }
    get pointer() { return this._pointer; }
    get alive() { return this._alive; }
    get name() { return this._name; }
    get isMe() { return this._isMe; }

    destroyPlayer() {
        this._id = NaN;
        this._pos = null;
        this._lastSentPointer = null;
        this._pointer = null;
        this._alive = false;
    }
}