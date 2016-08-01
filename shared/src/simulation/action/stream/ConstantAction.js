import {StreamActionBase} from "../StreamActionBase";

export class ConstantAction extends StreamActionBase {
    constructor(clientId, startTime, state) {
        super(clientId, startTime, StreamActionBase.ActionType.CONSTANT_ACTION);
        this.state = state;
    }

    getStateAtTime(_) { return this.state; }
}