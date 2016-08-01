export class LevelModel {
    /**
     * @param jsonSource {String}
     */
    constructor(jsonSource) {
        this._source = jsonSource;
        this._width = jsonSource.width * jsonSource.tilewidth;
        this._height = jsonSource.height * jsonSource.tileheight;
        this._bodies = [];
        this._respawns = [];

        for (var layerIdx = 0; layerIdx < jsonSource.layers.length; layerIdx++) {
            var layer = jsonSource.layers[layerIdx];
            // console.log(layer.name);
            for (var boundIdx = 0; boundIdx < layer.objects.length; boundIdx++) {
                var levelObject = layer.objects[boundIdx];
                if (layer.name == 'respawns') {
                    this._respawns.push({x:levelObject.x, y:levelObject.y});
                    continue;
                }
                var x = levelObject.x, y = levelObject.y;
                var w = levelObject.width, h = levelObject.height;
                var hip = Math.sqrt((w/2 * w/2) + (h/2 * h/2));
                var bigAngle = Math.asin(h/2/hip);
                var angleRad = levelObject.rotation * Math.PI /180;
                var wholeAngle = angleRad + bigAngle;
                var xDiff = hip * Math.cos(wholeAngle);
                var yDiff = hip * Math.sin(wholeAngle);
                var boundBody = {
                    x: x + xDiff,
                    y: y + yDiff,
                    w: w, h: h,
                    o: {angle: angleRad},
                    colorScheme: layer.name
                };
                this._bodies.push(boundBody);
            }
        }

        console.log('LevelModel: loaded. spawns: ' + this._respawns.length + '; walls: ' + this._bodies.length);
    }

    /** @returns {number} */
    get width() { return this._width; }
    /** @returns {number} */
    get height() { return this._height; }
    /** @returns {Array.<*>} */
    get bodies() { return this._bodies; }
    /** @returns {Array.<*>} */
    get respawns() { return this._respawns; }
}