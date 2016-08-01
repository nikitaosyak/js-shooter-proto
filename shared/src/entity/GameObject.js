
export class GameObject {

    /**
     * @param componentFactory {function(string)}
     */
    constructor(componentFactory) {
        /**
         * @type {Array.<Component>}
         * @private
         */
        this._comps = [];
        this._componentFactory = componentFactory;

        this._created = false;
        this._destroyed = false;
    }

    get created() { return this._created; }
    get destroyed() { return this._destroyed; }

    /** @param value {String} */
    addComponent(value) {
        if (this._created) throw 'GameObject: cannot add components to created GO';
        let comp = this._componentFactory(value);
        if (comp === null) throw 'GameObject: unknown component ' + value;
        this._comps.push(comp);
        return comp;
    }

    /** @param values {Array.<String>} */
    addComponents(values) {
        values.forEach(v => this.addComponent(v));
    }

    /**
     * @param value {String}
     * @returns {Component|*}
     */
    getComponent(value) {
        if (this._destroyed) throw 'GameObject: cannot get component of destroyed GO';
        let found = null;
        this._comps.forEach(c => {
            if (c.componentId !== value) return;
            found = c;
        });
        return found;
    }

    create() {
        if (this._created) throw 'GameObject: cannot create already created GO';
        this._created = true;
        this._comps.forEach(c => c.create());
    }

    update() {
        if (!this._created) throw 'GameObject: cannot update not created GO';
        if (this._destroyed) throw 'GameObject: cannot update destroyed GO';
        this._comps.forEach(c => c.update());
    }

    destroy() {
        if (this._destroyed) throw 'GameObject: cannot destroy already destroyed GO';
        this._destroyed = true;
        this._comps.forEach(c => c.destroy());
        delete this._comps;

        this._componentFactory = null;
        this._comps = null;
    }
}