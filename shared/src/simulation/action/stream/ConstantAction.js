import {StreamActionBase} from "../StreamActionBase";

export class ConstantAction extends StreamActionBase {

    /** @return {string} */
    static get TYPE() { return 'CONSTANT_ACTION'; }

    constructor(clientId, startTime, state) {
        super(clientId, startTime, ConstantAction.TYPE);
        this.state = state;
    }

    getStateAtTime(_) { return this.state; }
}