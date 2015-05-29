
interface forEachFunction {
    (element, index, context): any
}

export function defaults(obj, _defaults) {
    var extendedObject = {};
    Object.keys(_defaults).forEach(function(key) {
        extendedObject[key] = _defaults[key];
    });
    Object.keys(this._target || {}).forEach(function(key) {
        extendedObject[key] = this._target[key];
    });

    return extendedObject;
}

class _fn {
    _target: any;
    constructor(obj){
        this._target = obj;
    }

    forEach(cb: forEachFunction): void {
        return Array.prototype.forEach.call(this._target, cb);
    }

    map(cb: forEachFunction): any[] {
        return Array.prototype.map.call(this._target, cb);
    }
    some(cb: forEachFunction): Boolean {
        return Array.prototype.some.call(this._target, cb);
    }
    constructAPI(): any {
        return Array.prototype.reduce.call(
            this._target,
            function(api, currentWidget) {
                Object.keys(currentWidget.modifiers).forEach(function(currentModifier) {
                    api[currentModifier] = currentWidget.modifiers[currentModifier];
                });
                return api;
            }, {}
        );
    }
    defaults(_defaults) {
        var extendedObject = {};
        Object.keys(_defaults).forEach(function(key) {
            extendedObject[key] = _defaults[key];
        });
        Object.keys(this._target || {}).forEach(function(key) {
            extendedObject[key] = this._target[key];
        });

        return extendedObject;
    }
    annotate(annotations: Object) {
        Object.keys(annotations).forEach((_annotation) => {
            this._target[_annotation] = annotations[_annotation];
        });
        return this._target;
    }
}

 function fn(obj) {
    return new _fn(obj);
}
