function SharedUtils() {}

SharedUtils.sortAcc = function(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

SharedUtils.lerp = function(a, b, t) {
    return a + (b-a)*t;
};

SharedUtils.shootRay = function(anchor, targetDir, anchorOffset, rayLen, bodyGetter, bodyGetterCtx) {
    
    var shotDir = {x: targetDir.x - anchor.x, y: targetDir.y - anchor.y};
    shotDir = SharedUtils.setMagnitude(shotDir, anchorOffset);
    var shotOrigin = {x: anchor.x + shotDir.x, y: anchor.y + shotDir.y};

    var shotEnd = SharedUtils.setPointMagnitude(
        shotOrigin, 
        targetDir,
        rayLen
    );

    var result = SharedUtils.shootRayRaw(shotOrigin, shotEnd, bodyGetter, bodyGetterCtx);

    if (result.length !== 0) {
        shotEnd = SharedUtils.setPointMagnitude (
            shotOrigin,
            targetDir,
            result[0].rayLen
        );
    }

    return {start: shotOrigin, end: shotEnd, hits: result};
};

SharedUtils.shootRayRaw = function(start, end, bodyGetter, bodyGetterCtx) {
    t = Date.now();
    var bodies = bodyGetter.call(bodyGetterCtx);
    var result = ShitCast.complexCast(bodies, Matter.Query.ray,
        function(bb) {
            // console.log(bb);
            if ('clientId' in bb) return true;
            return false;
        },
        start, 
        end,
        1
    );
    // console.log('complex cast took', Date.now() - t);
    return result;
};

SharedUtils.setPointMagnitude = function(anchor, destination, rayLen) {
    var vectorDir = {x: destination.x - anchor.x, y: destination.y - anchor.y };

    vectorDir = SharedUtils.setMagnitude(vectorDir, rayLen);
    vectorDir = SharedUtils.addPoint(vectorDir, anchor);
    return vectorDir;
};

SharedUtils.truncateRay = function(start, end, truncateAmount) {
    var truncedStart = {x: end.x - start.x, y: end.y - start.y };
    truncedStart = SharedUtils.normalize(truncedStart);
    truncedStart = SharedUtils.setMagnitude(truncedStart, truncateAmount);
    truncedStart = SharedUtils.addPoint(truncedStart, start);

    return {start: truncedStart, end: end};
};

SharedUtils.setMagnitude = function(pt, m) {
    pt = SharedUtils.normalize(pt);
    pt.x *= m;
    pt.y *= m;
    return pt;
};

SharedUtils.getMagnitude = function(pt) {
    return Math.sqrt((pt.x * pt.x) + (pt.y * pt.y));
};

SharedUtils.normalize = function(pt) {
    if (pt.x !== 0 && pt.y !== 0) {
        var m = SharedUtils.getMagnitude(pt);
        pt.x /= m;
        pt.y /= m;    
    }
    
    return pt;
};

SharedUtils.addPoint = function(toAddPoint, additional) {
    toAddPoint.x += additional.x;
    toAddPoint.y += additional.y;
    return toAddPoint;
};

if (typeof module !== 'undefined') {
    module.exports.SharedUtils = SharedUtils;
}