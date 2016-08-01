import {StreamActionBase} from "../StreamActionBase";
import {SharedUtils} from "../../../util/game/SharedUtils";

export class MoveAction extends StreamActionBase {

    /** @return {string} */
    static get TYPE() { return 'MOVE_ACTION'; }

    constructor(clientid, startTime, vX, vY) {
        super(clientid, startTime, MoveAction.TYPE);
        
        this.velocityX = vX;
        this.velocityY = vY;
        
        this.currentState = {x: NaN, y:NaN};
        this.startState = {x: NaN, y: NaN};
        this.endState = {x: NaN, y: NaN};
    }

    get isZeroVelocity() { return this.velocityX === 0 && this.velocityY === 0; }
    
    getStateAtTime(time) {
        let t = (time - this.startState) / this.duration;

        if (this.ended) {
            return {
                x: SharedUtils.lerp(this.startState.x, this.endState.x, t),
                y: SharedUtils.lerp(this.startState.y, this.endState.y, t)
            };
        } else {
            return {
                x: SharedUtils.lerp(this.startState.x, this.currentState.x, t),
                y: SharedUtils.lerp(this.startState.y, this.currentState.y, t)
            };
        }
    }
}