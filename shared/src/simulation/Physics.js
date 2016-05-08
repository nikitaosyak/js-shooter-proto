// matterjs for life!
if ("undefined" !== typeof exports) {
    var Matter = exports.Matter;
}

Physics = function() {
    this._bodies = {};
    this._engine = Matter.Engine.create();
    this._world = Matter.World.create({gravity: {x:0, y:0}});
    this._engine.world = this._world;
};
Physics.prototype.constructor = Physics;

Physics.prototype = {
    addStaticBody: function(b) {
        Matter.Body.setStatic(b, true);
        Matter.World.add(this._world, b);
    },

    addStaticBodies: function(bs) {
        for (var i = 0; i < bs.length; i++) {
            this.addStaticBody(bs[i]);
        }
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
    }
};

// Object.defineProperty(Physics.prototype, "wasSimulated", {
//     get: function() {
//         return this.simulationTime !== -1;
//     }
// });

if (typeof module !== 'undefined') {
    module.exports.Physics = Physics;
}
