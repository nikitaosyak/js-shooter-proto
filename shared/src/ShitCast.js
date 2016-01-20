ShitCast = function() {};
ShitCast.prototype.constructor = ShitCast;

ShitCast.cast = function(rayCall, rayCallCtx, from, to) {
    var t = Date.now();
    var castV = {x: to.x-from.x, y: to.y-from.y};
    var offsetV = from;

    var originalLen = ShitCast.getMagnitude(castV);
    var currentLen = originalLen;
    var nextStep = currentLen/2;
    while (true) {
        // console.log('casting with len', currentLen);
        var result = rayCall.call(rayCallCtx, offsetV, {x: offsetV.x + castV.x, y: offsetV.y + castV.y});
        if (result.length == 1)  {
            // console.log('cast took', Date.now() - t);
            return result[0].body;
        }
        if (result.length > 1) {
            // console.log('ray is too long');
            currentLen -= nextStep;
            nextStep /= 2;
            if (currentLen <= 2) {
                // console.log('unable to find casts. time:', Date.now() - t);
                // console.log(result);
                return null;
            }
        } else if (result.length === 0) {
            if (currentLen == originalLen) {
                // console.log('no objects in a way. time:', Date.now() - t);
                return null;
            } else {
                // console.log('ray is too short');
                currentLen += nextStep;
                nextStep /= 2;
            }
        }

        ShitCast.setMagnitude(castV, currentLen);
    }
};

ShitCast.setMagnitude = function(pt, m) {
    pt = ShitCast.normalize(pt);
    pt.x *= m;
    pt.y *= m;
    return pt;
};

ShitCast.getMagnitude = function(pt) {
    return Math.sqrt((pt.x * pt.x) + (pt.y * pt.y));
};

ShitCast.normalize = function(pt) {
    if (pt.x !== 0 && pt.y !== 0) {
        var m = ShitCast.getMagnitude(pt);
        pt.x /= m;
        pt.y /= m;    
    }
    
    return pt;
};