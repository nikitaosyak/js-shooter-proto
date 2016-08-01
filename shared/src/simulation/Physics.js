class ShitCast {

    static complexCast(bodies, rayCall, canPunchThough, from, to, accuracy) {
        var result = [];
        while (true) {
            var r = ShitCast._cast(bodies, rayCall, from, to, accuracy);
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

/**
 * @param _matter {Matter}
 */
function Physics(_matter) {
    Matter = _matter;
    this._bodies = {};
    this._engine = Matter.Engine.create();
    this._world = Matter.World.create({gravity: {x:0, y:0}});
    this._engine.world = this._world;

    if (_matter !== 'undefined') {
        console.log('Physics: wrapper created. Matter injected');
    } else {
        console.error('Physics: wrapper cannot be initialized - Matter absent');
    }
}
Physics.prototype.constructor = Physics;

Physics.prototype = {

    /**
     * @param level {LevelModel}
     */
    initializeLevel: function(level) {
        var bs = level.bodies;
        for (var i = 0; i < bs.length; i++) {
            // this.addStaticBody(bs[i]);
            var b = level.bodies[i];
            var rectB = Matter.Bodies.rectangle(b.x, b.y, b.w, b.h, b.o);
            rectB.colorCheme = b.colorCheme;
            Matter.Body.setStatic(rectB, true);
            Matter.World.add(this._world, rectB);
        }
        console.log('Physics: level initialized');
    },

    addActorBody: function(clientId, x, y) {
        var b = Matter.Bodies.circle(x, y, GameParams.playerRadius, null, 32);
        b.friction = 1;
        b.frictionAir = 1;
        b.groupId = 1;
        b.clientId = clientId;

        Matter.World.add(this._world, b);
        this._bodies[clientId] = b;
    },

    deleteActorBody: function(clientId) {
        Matter.World.remove(this._world, this._bodies[clientId]);
        delete this._bodies[clientId];
    },

    getAllBodies: function() { return Matter.Composite.allBodies(this._engine.world); },

    getActorBody: function(clientId) {
        if (clientId in this._bodies) {
            return this._bodies[clientId];
        }
        return null;
    },

    translateActorBody: function(clientId, xAmount, yAmount) {
        var b = this.getActorBody(clientId);
        if (b === null) {
            console.warn('physics failed to get body of actor %i', clientId);
            return;
        }
        Matter.Body.translate(b, {x: xAmount, y: yAmount});
    },

    setActorBodyPosition: function(clientId, x, y) {
        var b = this.getActorBody(clientId);
        if (b === null) {
            console.warn('physics failed to get body of actor %i', clientId);
            return;
        }
        Matter.Body.translate(b, {x: x - b.position.x, y: y - b.position.y});
    },

    setActorBodyPositionMass: function(data, needOldPositions) {
        var oldPositions = [];
        for (var i = 0; i < data.length; i++) {
            var clientId = data[i].clientId;
            var state = data[i].state;

            var body = this._bodies[clientId];
            if (needOldPositions) {
                oldPositions.push({clientId: clientId, state: {x: body.position.x, y: body.position.y }});
            }
            
            Matter.Body.translate(
                body, 
                {
                    x: state.x - body.position.x,
                    y: state.y - body.position.y
                }
            );
        }
        return oldPositions;
    },

    simulateTimeSpan: function (clientId, timespan, vX, vY) {
        var isAngle = vX !== 0 && vY !== 0;
        if (isAngle) {
            // рассчет для частного случая. говно конечно.
            var vxSign = vX;
            var vySign = vY;
            var hipVel = 1 * Math.cos(45 * Math.PI / 180);
            vX = hipVel * vxSign;
            vY = hipVel * vySign;
        }

        var body = this._bodies[clientId];

        var extrasim = timespan % GameParams.dStep;
        var simulations = Math.floor(timespan/GameParams.dStep);
        var resultVelocity = GameParams.playerSpeed / (GameParams.dStep * 100);
        for(var i = 0; i < simulations; i++) {
            body.force = {x: vX * resultVelocity, y: vY * resultVelocity};
            Matter.Engine.update(this._engine, GameParams.dStep);
            if (isNaN(body.position.x)) {
                console.log('sim: ', resultVelocity, i, simulations, vX, vY);
                return {x: NaN, y: NaN};
            }
        }
        // console.log('simulated for', GameParams.dStep, i+1, 'times. total span:', timespan);
        if (extrasim > 0) {
            resultVelocity = GameParams.playerSpeed / (extrasim * 100);
            body.force = {x: vX * resultVelocity, y: vY * resultVelocity};
            Matter.Engine.update(this._engine, extrasim);
            // console.log('extrasimulated for', extrasim);   
            if (isNaN(body.position.x)) {
                console.log('extrasim: ', resultVelocity, extrasim);
                return {x: NaN, y: NaN};
            }
        }
        return {x: body.position.x, y: body.position.y};
    },

    shootRay: function(anchor, targetDir, anchorOffset, rayLen, bodyGetter, bodyGetterCtx) {
        var shotDir = {x: targetDir.x - anchor.x, y: targetDir.y - anchor.y};
        shotDir = SharedUtils.Point.setMagnitude(shotDir, anchorOffset);
        var shotOrigin = {x: anchor.x + shotDir.x, y: anchor.y + shotDir.y};

        var shotEnd = SharedUtils.Point.setPointMagnitude(
            shotOrigin,
            targetDir,
            rayLen
        );

        let shooter = (start, end, bdyGttr, bdyGttrCtx) => {
            let t = Date.now();
            let bodies = bdyGttr.call(bdyGttrCtx);
            let r = ShitCast.complexCast(bodies, Matter.Query.ray,
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
};

if (typeof module !== 'undefined') {
    module.exports.Physics = Physics;
}
