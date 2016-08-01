import {ShitCast} from "./ShitCast";
/*jshint esversion: 6*/
export class SharedUtils {

    static sortAcc(a, b) {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    static lerp(a, b, t) { return a + (b - a)*t; }

    static get Point() { return {
        setPointMagnitude: function(anchor, destination, rayLen) {
            var vectorDir = {x: destination.x - anchor.x, y: destination.y - anchor.y };

            vectorDir = this.setMagnitude(vectorDir, rayLen);
            vectorDir = this.addPoint(vectorDir, anchor);
            return vectorDir;
        },
        truncateRay: function(start, end, truncateAmount) {
            var truncedStart = {x: end.x - start.x, y: end.y - start.y };
            truncedStart = this.normalize(truncedStart);
            truncedStart = this.setMagnitude(truncedStart, truncateAmount);
            truncedStart = this.addPoint(truncedStart, start);

            return {start: truncedStart, end: end};
        },
        setMagnitude: function(pt, m) {
            pt = this.normalize(pt);
            pt.x *= m;
            pt.y *= m;
            return pt;
        },
        getMagnitude: function(pt) {
            return Math.sqrt((pt.x * pt.x) + (pt.y * pt.y));
        },
        normalize: function(pt) {
            if (pt.x !== 0 && pt.y !== 0) {
                var m = this.getMagnitude(pt);
                pt.x /= m;
                pt.y /= m;
            }

            return pt;
        },
        addPoint: function(toAddPoint, additional) {
            toAddPoint.x += additional.x;
            toAddPoint.y += additional.y;
            return toAddPoint;
        }
    }};

    static shootRay(anchor, targetDir, anchorOffset, rayLen, bodyGetter, bodyGetterCtx) {

        var shotDir = {x: targetDir.x - anchor.x, y: targetDir.y - anchor.y};
        shotDir = SharedUtils.Point.setMagnitude(shotDir, anchorOffset);
        var shotOrigin = {x: anchor.x + shotDir.x, y: anchor.y + shotDir.y};

        var shotEnd = SharedUtils.Point.setPointMagnitude(
            shotOrigin,
            targetDir,
            rayLen
        );

        // var result = SharedUtils.shootRayRaw(shotOrigin, shotEnd, bodyGetter, bodyGetterCtx);
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
    };
}