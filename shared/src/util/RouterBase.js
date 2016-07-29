export class RouterBase {
    constructor() {}

    execute(method) {
        if (method in this) {
            arguments.shift();
            this[method].apply(this, arguments);
        } else {
            console.log('Router', typeof this, 'does not have method', method);
        }
    }
}