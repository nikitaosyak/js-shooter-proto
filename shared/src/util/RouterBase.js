export class RouterBase {
    constructor() {}

    execute(method) {
        if (method in this) {
        	var args = Array.prototype.slice.call(arguments, 1);
            this[method].apply(this, args);
        } else {
            console.log('Router', typeof this, 'does not have method', method);
        }
    }
}