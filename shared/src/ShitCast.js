function ShitCast() {}

ShitCast.complexCast = function(bodies, rayCall, canPunchThough, from, to, accuracy) {
    var result = [];
    while (true) {
        var r = ShitCast.cast(bodies, rayCall, from, to, accuracy);
        if (r === null || r === 'undefined') return result;
        result.unshift(r);
        if (!canPunchThough(r.body)) {
            return result;
        } else {
            bodies.splice(bodies.indexOf(r.body), 1);
        }
    }
};

ShitCast.cast = function(bodies, rayCall, from, to, accuracy) {
    var castV = {x: to.x-from.x, y: to.y-from.y};
    var offsetV = from;

    var originalLen = SharedUtils.getMagnitude(castV);
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
                SharedUtils.setMagnitude(castV, currentLen);
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

        SharedUtils.setMagnitude(castV, currentLen);
    }
};