(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var fn = require('../lib/fn');
var _Event = require('../lib/Event');
var ColourModel = require('../lib/ColourModel');
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
            NEW_DIRECTION: new _Event(),
            WRONG_MOVE: new _Event(),
            RIGHT_MOVE: new _Event(),
            POINTS_DEDUCTED: new _Event(),
            POINTS_GAINED: new _Event(),
            LOST_GAME: new _Event()
        };
        this._mySuperCoolColourModels = {
            left: new _GameColourModelLeft,
            right: new _GameColourModelRight,
            up: new _GameColourModelUp,
            down: new _GameColourModelDown
        };
        options = fn.defaults(options, {
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
    Game.prototype.wrongMove = function () {
        this.events.WRONG_MOVE.emit(null);
        this.points -= 2;
        this.events.POINTS_DEDUCTED.emit({
            change: -2
        });
        if (this.points <= -10) {
            this.events.LOST_GAME.emit(null);
        }
    };
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
exports.Game = Game;

},{"../lib/ColourModel":8,"../lib/Event":10,"../lib/fn":13}],2:[function(require,module,exports){
'use strict';
var _Event = require('../lib/Event');
var MainLoop = (function () {
    function MainLoop(game) {
        this.isPaused = true;
        this.events = {
            TICK: new _Event()
        };
        this.game = game;
    }
    MainLoop.prototype.loop = function () {
        var nowTime = (new Date()).getTime();
        var delta = nowTime - this.lastTime;
        this.lastTime = nowTime;
        this.game.update(delta);
        this.events.TICK.emit(null);
    };
    MainLoop.prototype.pause = function () {
        clearInterval(this.mainInterval);
        this.isPaused = true;
    };
    MainLoop.prototype.start = function () {
        this.lastTime = (new Date()).getTime();
        this.mainInterval = setInterval(this.loop.bind(this), 10);
        this.isPaused = false;
    };
    return MainLoop;
})();
module.exports = MainLoop;

},{"../lib/Event":10}],3:[function(require,module,exports){
var View = require('../lib/View');
var Button = require('./components/Button');
var Component = View.Component;
function create(handlers) {
    var mainComponent = Component(function mainView(initialBindings) {
        var element = document.createElement('div');
        element.classList.add('overlay');
        var youLostText = document.createElement('h1');
        youLostText.textContent = 'Game Over';
        element.appendChild(youLostText);
        return {
            element: element,
            methods: null
        };
    }, function mainController(methods, services) {
    }, function initialBindings(services) {
    })(null);
    var mainElement = mainComponent(Button({
        label: 'Restart'
    }, {
        click: handlers.restartGame
    })(), Button({
        label: 'Scores'
    }, {
        click: handlers.showScores
    })(), Button({
        label: 'Main menu'
    }, {
        click: handlers.mainMenu
    })());
    return mainElement;
}
exports.create = create;

},{"../lib/View":12,"./components/Button":6}],4:[function(require,module,exports){
var View = require('../lib/View');
var GameModule = require('../Game/Game');
var ColourWrapper = require('../lib/ColourWrapper');
var Surface = require('../Surface');
var Component = View.Component;
function create(servicesPackage) {
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
        [].slice.call(document.getElementsByTagName('body')).forEach(function (elem) {
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
                if (direction && currentKeyDown === null && !services.mainLoop.isPaused) {
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
    var directionComponent = Component(function directionView(bindings) {
        function makeDirectionElement(dir) {
            var newDirection = document.createElement('div');
            newDirection.classList.add('direction');
            newDirection.innerHTML = dir;
            return newDirection;
        }
        var element = document.createElement('div');
        element.id = 'directions';
        element.appendChild(makeDirectionElement(directionsMapping[bindings.direction]));
        var methods = {
            rightMoveExplodeDirection: function (newDirection) {
                var toExplode = element.children[0];
                toExplode.classList.add('exploded');
                function explodeThatStuff(elem) {
                    return function () {
                        elem.parentNode.removeChild(elem);
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
                        elem.parentNode.removeChild(elem);
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
    }, function bindings(services) {
        return {
            direction: services.game.currentDirection
        };
    })(servicesPackage);
    var scoreComponent = Component(function scoreView() {
        var element = document.createElement('div');
        element.classList.add('score');
        var methods = {
            refreshScore: function (pointsChange, points) {
                element.textContent = points.toString();
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
            methods.refreshScore(e.change, services.game.points);
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
    var touchControlsComponent = Component(function touchControlsView(bindings) {
        var element = document.createElement('div');
        element.classList.add('touch-controls');
        ['left', 'right', 'up', 'down'].forEach(function (direction) {
            var directionElem = document.createElement('div');
            directionElem.classList.add(direction);
            directionElem.classList.add("direction-press." + direction);
            directionElem.addEventListener('click', function (e) {
                bindings.makeMove(direction);
            });
            element.appendChild(directionElem);
        });
        return {
            element: element,
            methods: null
        };
    }, function dummyController() {
    }, function bindings(services) {
        return {
            makeMove: function (direction) {
                services.game.makeMove(direction);
            }
        };
    })(servicesPackage);
    var mainElement = mainComponent(osdComponent(directionComponent(), scoreComponent(), timerComponent(), touchControlsComponent()));
    return mainElement;
    var _a;
}
exports.create = create;

},{"../Game/Game":1,"../Surface":7,"../lib/ColourWrapper":9,"../lib/View":12}],5:[function(require,module,exports){
var View = require('../lib/View');
var Button = require('./components/Button');
var Component = View.Component;
function create(handlers) {
    var mainComponent = Component(function mainView(initialBindings) {
        var element = document.createElement('div');
        element.id = 'main-menu';
        return {
            element: element,
            methods: null
        };
    }, function mainController(methods, services) {
    }, function initialBindings(services) {
    })(null);
    var mainElement = mainComponent(Button({
        label: 'Start'
    }, {
        click: handlers.gameStartButtonPress
    })(), Button({
        label: 'High scores'
    })());
    return mainElement;
}
exports.create = create;

},{"../lib/View":12,"./components/Button":6}],6:[function(require,module,exports){
var View = require('../../lib/View');
var Component = View.Component;
module.exports = function (attrs, events) {
    if (attrs === void 0) { attrs = {}; }
    if (events === void 0) { events = {}; }
    return Component(function view(initialBindings) {
        var element = document.createElement('button');
        element.textContent = initialBindings.label;
        var methods = {
            addClickListener: function (cb) {
                element.addEventListener('click', cb);
            }
        };
        return {
            element: element,
            methods: methods
        };
    }, function controller(methods, services) {
        if (events.click) {
            methods.addClickListener(events.click);
        }
    }, function initialBindings(services) {
        return {
            label: attrs.label
        };
    })(null);
};

},{"../../lib/View":12}],7:[function(require,module,exports){
var HSL = require('./lib/HSL');
function createSurface(hsl) {
    var surface = document.createElement('div');
    surface.classList.add('surface');
    hsl = hsl || new HSL.HSL(Math.floor(Math.random() * 360), 100, 88);
    surface.style.backgroundColor = hsl.toCSSString();
    return surface;
}
exports.createSurface = createSurface;
function move(_Surface, direction, callbacks, transitionLength) {
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
}
exports.move = move;
function replaceWithNew(_Surface, newHSL) {
    var newSurface = this.createSurface(newHSL);
    _Surface.parentNode.replaceChild(newSurface, _Surface);
    return newSurface;
}
exports.replaceWithNew = replaceWithNew;

},{"./lib/HSL":11}],8:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function changeRange(value, originalRange, newRange) {
    newRange = newRange || [0, 1];
    var baselineValue = (value - originalRange[0]) / (originalRange[1] - originalRange[0]);
    return (newRange[1] - newRange[0]) * baselineValue + newRange[0];
}
exports.changeRange = changeRange;
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
exports.ColourModel = ColourModel;
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
exports.plainColourModel = plainColourModel;
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
exports.greyscaleColourModel = greyscaleColourModel;
exports.baseColourModels = {
    plain: new plainColourModel(),
    greyscale: new greyscaleColourModel()
};

},{}],9:[function(require,module,exports){
var HSL = require('./HSL');
var ColourModel = require('./ColourModel');
function randomTermGenerator(seed) {
    var random = Math.sin(seed) * 1000000;
    random = random - Math.floor(random);
    return random;
}
exports.randomTermGenerator = randomTermGenerator;
function hslFromSeed(seed, colourModel) {
    colourModel = colourModel || new ColourModel.ColourModel();
    var randomTerm = randomTermGenerator(seed);
    return new HSL.HSL(colourModel.hue(randomTerm), colourModel.saturation(randomTermGenerator(randomTerm)), colourModel.lightness(randomTermGenerator(randomTermGenerator(randomTerm))));
}
exports.hslFromSeed = hslFromSeed;

},{"./ColourModel":8,"./HSL":11}],10:[function(require,module,exports){
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
module.exports = _Event;

},{}],11:[function(require,module,exports){
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
exports.HSL = HSL;

},{}],12:[function(require,module,exports){
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
exports.Component = Component;

},{}],13:[function(require,module,exports){
function defaults(obj, _defaults) {
    var extendedObject = {};
    Object.keys(_defaults).forEach(function (key) {
        extendedObject[key] = _defaults[key];
    });
    Object.keys(this._target || {}).forEach(function (key) {
        extendedObject[key] = this._target[key];
    });
    return extendedObject;
}
exports.defaults = defaults;
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
function fn(obj) {
    return new _fn(obj);
}

},{}],14:[function(require,module,exports){
var GameModule = require('./Game/Game');
var MainLoop = require('./Game/MainLoop');
var GameScreen = require('./Screens/GameScreen');
var MainScreen = require('./Screens/MainScreen');
var GameOverOverlay = require('./Screens/GameOverOverlay');
document.addEventListener('DOMContentLoaded', function () {
    /***/
    var mainContainer = document.getElementById('main-container');
    function clearMainContainer() {
        while (mainContainer.children.length) {
            mainContainer.removeChild(mainContainer.children[0]);
        }
    }
    var manageScreens = {
        gameStart: function () {
            clearMainContainer();
            var game = new GameModule.Game();
            var mainLoop = new MainLoop(game);
            var servicesPackage = {
                game: game,
                mainLoop: mainLoop
            };
            var mainElement = GameScreen.create(servicesPackage);
            mainContainer.appendChild(mainElement);
            mainLoop.start();
            game.events.LOST_GAME.listen(function () {
                mainLoop.pause();
                manageScreens.gameOver();
            });
        },
        gameOver: function () {
            var gameOverOverlay = GameOverOverlay.create({
                restartGame: function () {
                    manageScreens.gameStart();
                },
                mainMenu: function () {
                    manageScreens.mainMenu();
                }
            });
            mainContainer.appendChild(gameOverOverlay);
        },
        mainMenu: function () {
            clearMainContainer();
            mainContainer.appendChild(MainScreen.create({
                gameStartButtonPress: manageScreens.gameStart
            }));
        }
    };
    manageScreens.mainMenu();
});

},{"./Game/Game":1,"./Game/MainLoop":2,"./Screens/GameOverOverlay":3,"./Screens/GameScreen":4,"./Screens/MainScreen":5}]},{},[14]);
