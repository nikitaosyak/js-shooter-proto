if ("undefined" !== typeof exports) {
    var Matter = exports.Matter;
}

LevelModel = function() {
    console.log('LevelModel created');
    this._source = null;
    this.bodies = [];
    this.respawns = [];
    this.width = NaN;
    this.height = NaN;
};

LevelModel.prototype.constructor = LevelModel;

LevelModel.prototype = {
    fromTiledDescriptor: function(jsonSource) {
        console.log('loading level');
        this.width = jsonSource.width * jsonSource.tilewidth;
        this.height = jsonSource.height * jsonSource.tileheight;

        this._source = jsonSource;
        for (var layerIdx = 0; layerIdx < jsonSource.layers.length; layerIdx++) {
            var layer = jsonSource.layers[layerIdx];
            // console.log(layer.name);
            for (var boundIdx = 0; boundIdx < layer.objects.length; boundIdx++) {
                var levelObject = layer.objects[boundIdx];
                if (layer.name == 'respawns') {
                    this.respawns.push({x:levelObject.x, y:levelObject.y});
                    continue;
                }
                var angleRad = levelObject.rotation * Math.PI /180;
                // console.log(angleRad);
                var boundBody = Matter.Bodies.rectangle(levelObject.x + levelObject.width/2, levelObject.y + levelObject.height/2, levelObject.width, levelObject.height, {angle:angleRad});
                boundBody.colorScheme = layer.name;
                this.bodies.push(boundBody);
            }
        }

        return this;
    }
};

if (typeof module !== 'undefined') {
    module.exports.LevelModel = LevelModel;
}