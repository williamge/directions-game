var f;
(function (f) {
    var _fn = (function () {
        function _fn(obj) {
            this._target = obj;
        }
        _fn.prototype.forEach = function (cb) {
            return Array.prototype.forEach.call(this._target, cb);
        };
        _fn.prototype.map = function (cb) {
            return Array.prototype.map.call(this._target, cb);
        };
        _fn.prototype.some = function (cb) {
            return Array.prototype.some.call(this._target, cb);
        };
        _fn.prototype.constructAPI = function () {
            return Array.prototype.reduce.call(this._target, function (api, currentWidget) {
                Object.keys(currentWidget.modifiers).forEach(function (currentModifier) {
                    api[currentModifier] = currentWidget.modifiers[currentModifier];
                });
                return api;
            }, {});
        };
        _fn.prototype.defaults = function (_defaults) {
            var extendedObject = {};
            Object.keys(_defaults).forEach(function (key) {
                extendedObject[key] = _defaults[key];
            });
            Object.keys(this._target || {}).forEach(function (key) {
                extendedObject[key] = this._target[key];
            });
            return extendedObject;
        };
        _fn.prototype.annotate = function (annotations) {
            var _this = this;
            Object.keys(annotations).forEach(function (_annotation) {
                _this._target[_annotation] = annotations[_annotation];
            });
            return this._target;
        };
        return _fn;
    })();
    function n(obj) {
        return new _fn(obj);
    }
    f.n = n;
})(f || (f = {}));
var HSL;
(function (HSL_1) {
    var HSL = (function () {
        function HSL(hue, saturation, lightness) {
            this.hue = hue;
            this.saturation = saturation;
            this.lightness = lightness;
        }
        HSL.prototype.toCSSString = function () {
            return "hsl(" + this.hue + ", " + this.saturation + "%, " + this.lightness + "%)";
        };
        HSL.prototype.add = function (HSLtoAdd) {
            this.hue += HSLtoAdd.hue;
            this.saturation += HSLtoAdd.saturation;
            this.lightness += HSLtoAdd.lightness;
            return this;
        };
        HSL.prototype.scalarDivide = function (scalar) {
            this.hue = this.hue / scalar;
            this.saturation = this.saturation / scalar;
            this.lightness = this.lightness / scalar;
            return this;
        };
        HSL.prototype.scalarMultiply = function (scalar) {
            this.hue = this.hue * scalar;
            this.saturation = this.saturation * scalar;
            this.lightness = this.lightness * scalar;
            return this;
        };
        return HSL;
    })();
    HSL_1.HSL = HSL;
})(HSL || (HSL = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ColourModel;
(function (ColourModel_1) {
    function changeRange(value, originalRange, newRange) {
        newRange = newRange || [0, 1];
        var baselineValue = (value - originalRange[0]) / (originalRange[1] - originalRange[0]);
        return (newRange[1] - newRange[0]) * baselineValue + newRange[0];
    }
    ColourModel_1.changeRange = changeRange;
    var ColourModel = (function () {
        function ColourModel(mappings) {
            mappings = mappings || {};
            if (mappings.hue) {
                this.hue = mappings.hue;
            }
            if (mappings.saturation) {
                this.saturation = mappings.saturation;
            }
            if (mappings.lightness) {
                this.lightness = mappings.lightness;
            }
        }
        ColourModel.prototype.hue = function (term) {
            return changeRange(term, [0, 1], [0, 360]);
        };
        ColourModel.prototype.saturation = function (term) {
            return changeRange(term, [0, 1], [0, 100]);
        };
        ColourModel.prototype.lightness = function (term) {
            return changeRange(term, [0, 1], [0, 100]);
        };
        return ColourModel;
    })();
    ColourModel_1.ColourModel = ColourModel;
    var plainColourModel = (function (_super) {
        __extends(plainColourModel, _super);
        function plainColourModel() {
            _super.apply(this, arguments);
        }
        plainColourModel.prototype.hue = function (term) {
            return changeRange(term, [0, 1], [0, 360]);
        };
        plainColourModel.prototype.saturation = function (term) {
            return changeRange(term, [0, 1], [35, 45]);
        };
        plainColourModel.prototype.lightness = function (term) {
            return changeRange(term, [0, 1], [75, 85]);
        };
        return plainColourModel;
    })(ColourModel);
    ColourModel_1.plainColourModel = plainColourModel;
    var greyscaleColourModel = (function (_super) {
        __extends(greyscaleColourModel, _super);
        function greyscaleColourModel() {
            _super.apply(this, arguments);
        }
        greyscaleColourModel.prototype.hue = function (term) {
            return changeRange(term, [0, 1], [0, 0]);
        };
        greyscaleColourModel.prototype.saturation = function (term) {
            return changeRange(term, [0, 1], [0, 0]);
        };
        greyscaleColourModel.prototype.lightness = function (term) {
            return changeRange(term, [0, 1], [0, 100]);
        };
        return greyscaleColourModel;
    })(ColourModel);
    ColourModel_1.greyscaleColourModel = greyscaleColourModel;
    ColourModel_1.baseColourModels = {
        plain: new plainColourModel(),
        greyscale: new greyscaleColourModel()
    };
})(ColourModel || (ColourModel = {}));
/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />
var ColourWrapper;
(function (ColourWrapper) {
    function randomTermGenerator(seed) {
        var random = Math.sin(seed) * 1000000;
        random = random - Math.floor(random);
        return random;
    }
    ColourWrapper.randomTermGenerator = randomTermGenerator;
    function hslFromSeed(seed, colourModel) {
        colourModel = colourModel || new ColourModel.ColourModel();
        var randomTerm = randomTermGenerator(seed);
        return new HSL.HSL(colourModel.hue(randomTerm), colourModel.saturation(randomTermGenerator(randomTerm)), colourModel.lightness(randomTermGenerator(randomTermGenerator(randomTerm))));
    }
    ColourWrapper.hslFromSeed = hslFromSeed;
})(ColourWrapper || (ColourWrapper = {}));
var _Event;
(function (_Event_1) {
    var _Event = (function () {
        function _Event(childEvents) {
            var _this = this;
            this.listeners = [];
            childEvents = childEvents || [];
            childEvents.forEach(function (event) {
                event.listen(function (message) {
                    this.emit(message);
                }.bind(_this));
            });
        }
        _Event.prototype.listen = function (callback) {
            this.listeners.push(callback);
        };
        _Event.prototype.emit = function (message) {
            this.listeners.forEach(function (listener) {
                listener(message);
            });
        };
        return _Event;
    })();
    _Event_1._Event = _Event;
})(_Event || (_Event = {}));
/// <reference path="event.ts" />
var GameModule;
(function (GameModule) {
    //TODO(wg): one day when TypeScript supports it, these should be inline class expressions
    var _GameColourModelLeft = (function (_super) {
        __extends(_GameColourModelLeft, _super);
        function _GameColourModelLeft() {
            _super.apply(this, arguments);
        }
        _GameColourModelLeft.prototype.hue = function (term) {
            return ColourModel.changeRange(term, [0, 1], [0, 90]);
        };
        return _GameColourModelLeft;
    })(ColourModel.plainColourModel);
    var _GameColourModelRight = (function (_super) {
        __extends(_GameColourModelRight, _super);
        function _GameColourModelRight() {
            _super.apply(this, arguments);
        }
        _GameColourModelRight.prototype.hue = function (term) {
            return ColourModel.changeRange(term, [0, 1], [90, 180]);
        };
        return _GameColourModelRight;
    })(ColourModel.plainColourModel);
    var _GameColourModelUp = (function (_super) {
        __extends(_GameColourModelUp, _super);
        function _GameColourModelUp() {
            _super.apply(this, arguments);
        }
        _GameColourModelUp.prototype.hue = function (term) {
            return ColourModel.changeRange(term, [0, 1], [180, 270]);
        };
        return _GameColourModelUp;
    })(ColourModel.plainColourModel);
    var _GameColourModelDown = (function (_super) {
        __extends(_GameColourModelDown, _super);
        function _GameColourModelDown() {
            _super.apply(this, arguments);
        }
        _GameColourModelDown.prototype.hue = function (term) {
            return ColourModel.changeRange(term, [0, 1], [270, 360]);
        };
        return _GameColourModelDown;
    })(ColourModel.plainColourModel);
    var Game = (function () {
        function Game(options) {
            this.points = 0;
            this.timeLeft = 100;
            this.events = {
                NEW_DIRECTION: new _Event._Event(),
                WRONG_MOVE: new _Event._Event(),
                RIGHT_MOVE: new _Event._Event(),
                POINTS_DEDUCTED: new _Event._Event(),
                POINTS_GAINED: new _Event._Event()
            };
            this._mySuperCoolColourModels = {
                left: new _GameColourModelLeft,
                right: new _GameColourModelRight,
                up: new _GameColourModelUp,
                down: new _GameColourModelDown
            };
            options = f.n(options).defaults({
                colourModel: this._mySuperCoolColourModels
            });
            this.colourModels = options.colourModel;
            this.currentDirection = this.nextDirection();
        }
        Game._DirectionFromIndex = function (index) {
            return Game.directions[Object.keys(Game.directions)[index]];
        };
        Game._RandomDirection = function () {
            return Game._DirectionFromIndex((Math.floor(Math.random() * 4)));
        };
        Game.prototype.update = function (timeDelta) {
            this.timeLeft -= 0.05 * timeDelta;
            if (this.timeLeft <= 0) {
                this.wrongMove();
                this.timeLeft = 100;
            }
        };
        Game.prototype.nextDirection = function () {
            return Game._RandomDirection();
        };
        ;
        Game.prototype.wrongMove = function () {
            this.events.WRONG_MOVE.emit(null);
            this.points -= 2;
            this.events.POINTS_DEDUCTED.emit({
                change: -2
            });
        };
        ;
        Game.prototype.rightMove = function () {
            this.timeLeft = 100;
            this.events.RIGHT_MOVE.emit(null);
            this.points += 1;
            this.events.POINTS_GAINED.emit({
                change: 1
            });
        };
        Game.prototype.makeMove = function (direction) {
            if (direction !== this.currentDirection) {
                this.wrongMove();
                return false;
            }
            this.rightMove();
            this.currentDirection = this.nextDirection();
            this.events.NEW_DIRECTION.emit({
                oldDirection: direction,
                newDirection: this.currentDirection
            });
            return true;
        };
        Game.directions = {
            left: 'left',
            right: 'right',
            up: 'up',
            down: 'down'
        };
        return Game;
    })();
    GameModule.Game = Game;
})(GameModule || (GameModule = {}));
/// <reference path="fn.ts" />
/// <reference path="HSL.ts" />
/// <reference path="ColourWrapper.ts" />
/// <reference path="ColourModel.ts" />
/// <reference path="Game.ts" />
'use strict';
var brwsr = function (obj) {
    var _brwsr = {
        _target: obj,
        replaceWith: function (newChild) {
            return this._target.parentNode.replaceChild(newChild, this._target);
        },
        remove: function () {
            this._target.parentNode.removeChild(this._target);
        }
    };
    Object.defineProperty(_brwsr, 'textContent', {
        get: function () {
            return this._target.textContent || this._target.innerText;
        },
        set: function (value) {
            if (this._target.textContent !== undefined) {
                this._target.textContent = value;
            }
            else {
                this._target.innerText = value;
            }
        }
    });
    return _brwsr;
};
var Surface = {
    createSurface: function (hsl) {
        var surface = document.createElement('div');
        surface.classList.add('surface');
        hsl = hsl || new HSL.HSL(Math.floor(Math.random() * 360), 100, 88);
        surface.style.backgroundColor = hsl.toCSSString();
        return surface;
    },
    move: function (_Surface, direction, callbacks, transitionLength) {
        if (transitionLength === void 0) { transitionLength = 250; }
        if (['left', 'right', 'up', 'down'].indexOf(direction) === -1) {
            throw new Error('Direction is invalid');
        }
        if (!_Surface.classList.contains('surface')) {
            throw new Error('Surface is not a valid Surface element.');
        }
        var noop = function () { };
        callbacks = callbacks || {};
        callbacks.end = callbacks.end || noop;
        //It is very unfortunate that we cannot do the following:
        //    _Surface.addEventListener('transitionend', callbacks.end);
        //But browsers have spotty support for the transitionend event, and if we purely relied on that event to fire then
        //there can be plenty of opportunities where it will not and the element will be stuck in a state which it should not be in.
        //Examples include switching to another tab, down to just not using the right phone.
        //
        //As a result we are just using a timeout to simulate the event to cover our bases, blame the browsers.
        //
        //TODO(wg): Make sure this is still relevant and that we can't just use the event.
        setTimeout(callbacks.end, transitionLength);
        _Surface.classList.add(direction);
    },
    replaceWithNew: function (_Surface, newHSL) {
        var newSurface = this.createSurface(newHSL);
        brwsr(_Surface).replaceWith(newSurface);
        return newSurface;
    }
};
var GameViews;
(function (GameViews) {
    (function (events) {
        events[events["TICK"] = 0] = "TICK";
    })(GameViews.events || (GameViews.events = {}));
    var events = GameViews.events;
    ;
    var MainLoop = (function () {
        function MainLoop(game) {
            this.events = {
                TICK: new _Event._Event()
            };
            this.lastTime = (new Date()).getTime();
            this.mainInterval = setInterval(this.loop.bind(this), 10);
            this.game = game;
        }
        MainLoop.prototype.loop = function () {
            var nowTime = (new Date()).getTime();
            var delta = nowTime - this.lastTime;
            this.lastTime = nowTime;
            this.game.update(delta);
            this.events.TICK.emit(null);
        };
        return MainLoop;
    })();
    var game = new GameModule.Game();
    var mainLoop = new MainLoop(game);
    var servicesPackage = {
        game: game,
        mainLoop: mainLoop
    };
    function Component(View, controllerBody, initialBindings) {
        return function (services) {
            return function () {
                var children = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    children[_i - 0] = arguments[_i];
                }
                var _initialBindings = initialBindings ? initialBindings(services) : null;
                var template = View(_initialBindings);
                if (controllerBody) {
                    controllerBody(template.methods, services);
                }
                children.forEach(function (child) {
                    template.element.appendChild(child);
                });
                return template.element;
            };
        };
    }
    var mainComponent = Component(function mainView(initialBindings) {
        var element = document.createElement('div');
        element.id = 'screen';
        var surface = Surface.createSurface(ColourWrapper.hslFromSeed(Math.random(), initialBindings.direction));
        element.appendChild(surface);
        var methods = {
            newDirection: function (oldDirection, newHSL) {
                Surface.move(surface, oldDirection, {
                    end: function () {
                        surface = Surface.replaceWithNew(surface, newHSL);
                    }
                });
            }
        };
        return {
            element: element,
            methods: methods
        };
    }, function mainController(methods, services) {
        services.game.events.NEW_DIRECTION.listen(function (e) {
            methods.newDirection(e.oldDirection, ColourWrapper.hslFromSeed(Math.random(), services.game.colourModels[services.game.currentDirection]));
        });
        f.n(document.getElementsByTagName('body')).forEach(function (elem) {
            var currentKeyDown;
            elem.addEventListener('keydown', function (e) {
                var direction;
                switch (e.keyCode) {
                    case 37:
                        direction = GameModule.Game.directions.left;
                        break;
                    case 38:
                        direction = GameModule.Game.directions.up;
                        break;
                    case 39:
                        direction = GameModule.Game.directions.right;
                        break;
                    case 40:
                        direction = GameModule.Game.directions.down;
                        break;
                }
                if (direction && currentKeyDown === null) {
                    currentKeyDown = direction;
                    services.game.makeMove(direction);
                }
            });
            elem.addEventListener('keyup', function (e) {
                currentKeyDown = null;
            });
        });
    }, function initialBindings(services) {
        return {
            direction: services.game.colourModels[services.game.currentDirection]
        };
    })(servicesPackage);
    var osdComponent = Component(function osdView() {
        var element = document.createElement('div');
        element.classList.add('osd');
        return {
            element: element,
            methods: null
        };
    })(null);
    var directionsMapping = (_a = {},
        _a[GameModule.Game.directions.left] = '&larr;',
        _a[GameModule.Game.directions.right] = '&rarr;',
        _a[GameModule.Game.directions.up] = '&uarr;',
        _a[GameModule.Game.directions.down] = '&darr;',
        _a
    );
    var directionComponent = Component(function directionView() {
        function makeDirectionElement(dir) {
            var newDirection = document.createElement('div');
            newDirection.classList.add('direction');
            newDirection.innerHTML = dir;
            return newDirection;
        }
        var element = document.createElement('div');
        element.id = 'directions';
        element.appendChild(makeDirectionElement(directionsMapping[game.currentDirection]));
        var methods = {
            rightMoveExplodeDirection: function (newDirection) {
                var toExplode = element.children[0];
                toExplode.classList.add('exploded');
                function explodeThatStuff(elem) {
                    return function () {
                        brwsr(elem).remove();
                    };
                }
                setTimeout(explodeThatStuff(toExplode), 250);
                var newDirectionElem = makeDirectionElement(directionsMapping[newDirection]);
                element.appendChild(newDirectionElem);
            },
            wrongMoveImplodeDirection: function (currentDirection) {
                var toImplode = makeDirectionElement(directionsMapping[currentDirection]);
                element.appendChild(toImplode);
                //Note: this needs to be in a timeout since the transition will only take effect if the element is added first without our transition
                //class, and THEN given a new class. The timeout just gives a chance for the element to be added to the DOM before we add our transition class.
                //We don't need a transition in the above function for the NEW_DIRECTION handler since that's adding a class to an element that is already in the DOM.
                setTimeout(function () {
                    toImplode.classList.add('imploded');
                }, 10);
                function implodeThatStuff(elem) {
                    return function () {
                        brwsr(elem).remove();
                    };
                }
                setTimeout(implodeThatStuff(toImplode), 250);
            }
        };
        return {
            element: element,
            methods: methods
        };
    }, function directionController(methods, services) {
        services.game.events.NEW_DIRECTION.listen(function (e) {
            methods.rightMoveExplodeDirection(services.game.currentDirection);
        });
        services.game.events.WRONG_MOVE.listen(function (e) {
            methods.wrongMoveImplodeDirection(services.game.currentDirection);
        });
    })(servicesPackage);
    var scoreComponent = Component(function scoreView() {
        var element = document.createElement('div');
        element.classList.add('score');
        var methods = {
            refreshScore: function (pointsChange) {
                element.textContent = game.points.toString();
                element.classList.remove('animate-good');
                element.classList.remove('animate-bad');
                if (pointsChange > 0) {
                    element.classList.add('animate-good');
                }
                else {
                    element.classList.add('animate-bad');
                }
                setTimeout(function () {
                    element.classList.remove('animate-good');
                    element.classList.remove('animate-bad');
                }, 250);
            }
        };
        return {
            element: element,
            methods: methods
        };
    }, function scoreController(methods, services) {
        function refreshScore(e) {
            methods.refreshScore(e.change);
        }
        services.game.events.POINTS_DEDUCTED.listen(refreshScore);
        services.game.events.POINTS_GAINED.listen(refreshScore);
    })(servicesPackage);
    var timerComponent = Component(function timerView() {
        var element = document.createElement('div');
        element.id = 'timer';
        var methods = {
            updateTimer: function (timeLeft) {
                element.style.transform = "scaleX(" + timeLeft / 100 + ")";
            }
        };
        return {
            element: element,
            methods: methods
        };
    }, function timerComponent(methods, services) {
        services.mainLoop.events.TICK.listen(function () {
            methods.updateTimer(services.game.timeLeft);
        });
    })(servicesPackage);
    var touchControlsComponent = Component(function touchControlsView() {
        var element = document.createElement('div');
        element.classList.add('touch-controls');
        ['left', 'right', 'up', 'down'].forEach(function (direction) {
            var directionElem = document.createElement('div');
            directionElem.classList.add(direction);
            directionElem.classList.add("direction-press." + direction);
            directionElem.addEventListener('click', function (e) {
                game.makeMove(direction);
            });
            element.appendChild(directionElem);
        });
        return {
            element: element,
            methods: null
        };
    })(null);
    var mainElement = mainComponent(osdComponent(directionComponent(), scoreComponent(), timerComponent(), touchControlsComponent()));
    document.getElementById('main-container').appendChild(mainElement);
    var _a;
})(GameViews || (GameViews = {}));
//# sourceMappingURL=main.js.map