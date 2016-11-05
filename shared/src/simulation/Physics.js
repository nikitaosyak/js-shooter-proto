import {GameParams} from "../GameParams";
import {SharedUtils} from "../util/game/SharedUtils";
class _ShitCast {

    static complexCast(bodies, rayCall, canPunchThough, from, to, accuracy) {
        var result = [];
        while (true) {
            var r = _ShitCast._cast(bodies, rayCall, from, to, accuracy);
            if (r === null || r === 'undefined') return result;
            result.unshift(r);
            if (!canPunchThough(r.body)) {
                return result;
            } else {
                bodies.splice(bodies.indexOf(r.body), 1);
            }
        }
    }

    static _cast(bodies, rayCall, from, to, accuracy) {
        var castV = {x: to.x-from.x, y: to.y-from.y};
        var offsetV = from;

        var originalLen = SharedUtils.Point.getMagnitude(castV);
        var currentLen = originalLen;
        var nextStep = currentLen/2;
        while (true) {
            // console.log('casting with len', currentLen);
            var result = rayCall(bodies, offsetV, {x: offsetV.x + castV.x, y: offsetV.y + castV.y});
            if (result.length == 1)  {
                result = result[0];
                originalLen = currentLen/2;
                nextStep = currentLen/2;
                while (true) {
                    var accResult = rayCall(bodies, offsetV, {x: offsetV.x + castV.x, y: offsetV.y + castV.y});
                    if (accResult.length > 0) {
                        currentLen -= nextStep;
                        nextStep /= 2;
                    } else {
                        if (nextStep < accuracy) {
                            return {body: result.body, rayLen: currentLen};
                        }
                        currentLen += nextStep;
                        nextStep /= 2;
                    }
                    SharedUtils.Point.setMagnitude(castV, currentLen);
                }
            }
            if (result.length > 1) {
                // console.log('ray is too long');
                currentLen -= nextStep;
                nextStep /= 2;
                if (currentLen <= 2) {
                    // console.log('unable to find casts');
                    return null;
                }
            } else if (result.length === 0) {
                if (currentLen == originalLen) {
                    // console.log('no objects in a way');
                    return null;
                } else {
                    // console.log('ray is too short');
                    currentLen += nextStep;
                    nextStep /= 2;
                }
            }

            SharedUtils.Point.setMagnitude(castV, currentLen);
        }
    }
}

var Matter = null;

export class Physics {
    /**
     * @param _matterInjection {Matter}
     */
    constructor(_matterInjection) {
        Matter = _matterInjection;

        this._bodies = {};
        this._engine = Matter.Engine.create();
        this._world = Matter.World.create({gravity: {x:0, y:0}});
        this._engine.world = this._world;

        if (_matterInjection !== 'undefined') {
            console.log('Physics: wrapper created. Matter injected');
        } else {
            console.error('Physics: wrapper cannot be initialized - Matter absent');
        }
    }

    get allBodies() { return Matter.Composite.allBodies(this._engine.world); }

    /**
     * @param level {LevelModel}
     */
    initializeLevel(level) {
        for (var i = 0; i < level.bodies.length; i++) {
            // this.addStaticBody(bs[i]);
            let b = level.bodies[i];
            let rectB = Matter.Bodies.rectangle(b.x, b.y, b.w, b.h, b.o);
            rectB.colorScheme = b.colorScheme;
            Matter.Body.setStatic(rectB, true);
            Matter.World.add(this._world, rectB);
        }
        console.log('Physics: level initialized');
    }

    /**
     * @param clientId  {String}
     * @param x         {Number}
     * @param y         {Number}
     */
    addActorBody(clientId, x, y) {
        let b = Matter.Bodies.circle(x, y, GameParams.playerRadius, null, 32);
        b.friction = 1; b.frictionAir = 1;
        b.groupId = 1; b.clientId = clientId;

        Matter.World.add(this._world, b);
        this._bodies[clientId] = b;
    }

    deleteActorBody(clientId) {
        if (clientId in this._bodies) {
            Matter.World.remove(this._world, this._bodies[clientId]);
            delete this._bodies[clientId];
        } else {
            throw 'Physics: deleteActorBody of client ' + clientId + ' FAILED';
        }
    }

    /**
    * @param clientId {String}
    */
    getActorBody(clientId) {
        if (clientId in this._bodies) {
            return this._bodies[clientId];
        }
        throw 'Physics: getActorBody of client ' + clientId + ' FAILED';
    }

    /**
     * @param clientId  {String}
     * @param xAmount   {Number}
     * @param yAmount   {Number}
     */
    translateActorBody(clientId, xAmount, yAmount) {
        Matter.Body.translate(
            this.getActorBody(clientId),
            {x: xAmount, y: yAmount}
        );
    }

    /**
     * @param clientId  {String}
     * @param x         {Number}
     * @param y         {Number}
     */
    setActorBodyPosition(clientId, x, y) {
        let b = this.getActorBody(clientId);
        Matter.Body.translate(
            b,
            {x: x - b.position.x, y: y - b.position.y}
        )
    }

    /**
     * @param rewindData {Array.<*>}
     * @returns          {Array.<*>}
     */
    rewindActorsPosition(rewindData) {
        let self = this;
        let oldPositions = [];
        rewindData.forEach(rd => {
            let b = self.getActorBody(rd.clientId);
            oldPositions.push({
                clientId: rd.clientId,
                state: {x: b.position.x, y: b.position.y}
            });
            self.setActorBodyPosition(rd.clientId, rd.state.x, rd.state.y);
        });
        return oldPositions;
    }

    /**
     * @param clientId  {String}
     * @param timespan  {Number}
     * @param vX        {Number}
     * @param vY        {Number}
     */
    simulateTimeSpan(clientId, timespan, vX, vY) {
        let isAngle = vX !== 0 && vY !== 0;
        if (isAngle) {
            // рассчет для частного случая. говно конечно.
            let hipVel = Math.cos(45 * Math.PI / 180);
            vX = hipVel * vX;
            vY = hipVel * vY;
        }

        let b = this.getActorBody(clientId);

        let extrasim = timespan % GameParams.dStep;
        let simulations = Math.floor(timespan/GameParams.dStep);
        let resultVelocity = GameParams.playerSpeed / (GameParams.dStep * 100);
        for(let i = 0; i < simulations; i++) {
            b.force = {x: vX * resultVelocity, y: vY * resultVelocity};
            Matter.Engine.update(this._engine, GameParams.dStep);
            if (isNaN(b.position.x) || isNaN(b.position.y)) {
                console.log('sim: ', resultVelocity, i, simulations, vX, vY);
                return {x: NaN, y: NaN};
            }
        }
        // console.log('simulated for', GameParams.dStep, i+1, 'times. total span:', timespan);
        if (extrasim > 0) {
            resultVelocity = GameParams.playerSpeed / (extrasim * 100);
            b.force = {x: vX * resultVelocity, y: vY * resultVelocity};
            Matter.Engine.update(this._engine, extrasim);
            // console.log('extrasimulated for', extrasim);
            if (isNaN(b.position.x) || isNaN(b.position.y)) {
                console.log('extrasim: ', resultVelocity, extrasim);
                return {x: NaN, y: NaN};
            }
        }
        return {x: b.position.x, y: b.position.y};
    }

    shootRay(anchor, targetDir, anchorOffset, rayLen, bodyGetter, bodyGetterCtx) {
        let shotDir = {x: targetDir.x - anchor.x, y: targetDir.y - anchor.y};
        shotDir = SharedUtils.Point.setMagnitude(shotDir, anchorOffset);
        let shotOrigin = {x: anchor.x + shotDir.x, y: anchor.y + shotDir.y};

        let shotEnd = SharedUtils.Point.setPointMagnitude(
            shotOrigin,
            targetDir,
            rayLen
        );

        let shooter = (start, end, bdyGttr, bdyGttrCtx) => {
            let t = Date.now();
            let bodies = bdyGttr.call(bdyGttrCtx);
            let r = _ShitCast.complexCast(bodies, Matter.Query.ray,
                function(bb) {
                    if ('clientId' in bb) return true;
                    return false;
                },
                start,
                end,
                1
            );
            // console.log('complex cast took', Date.now() - t);
            return r;
        };

        let result = shooter(shotOrigin, shotEnd, bodyGetter, bodyGetterCtx);

        if (result.length !== 0) {
            shotEnd = SharedUtils.Point.setPointMagnitude (
                shotOrigin,
                targetDir,
                result[0].rayLen
            );
        }

        return {start: shotOrigin, end: shotEnd, hits: result};
    }
}
