import {GameObject} from "./GameObject";
export class EntitySystemBase {
    constructor() {
        /**
         * @type {Array.<GameObject>}
         * @private
         */
        this._objects = [];
        this._factoryMethod = this.createComponent.bind(this);
    }

    createGO() {
        let go = new GameObject(this._factoryMethod);
        this._objects.push(go);
        return go;
    }

    createComponent(value) {
        throw 'EntitySystemBase: createComponent must be overriden!'
    }

    update() {
        let savedRemoveGO = null;
        this._objects.forEach(o => {
            if (o.destroyed) {
                savedRemoveGO = o;
                return;
            }
            if (!o.created) {
                o.create();
                return;
            }
            o.update();
        });

        if (savedRemoveGO === null) return;
        delete this._objects[this._objects.indexOf(savedRemoveGO)]
    }
}