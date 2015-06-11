(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DataStore = {
    incrementPlayedCount: function () {
        var _count = localStorage.getItem('numberOfTimesPlayed');
        if (!_count) {
            localStorage.setItem('numberOfTimesPlayed', String(1));
        }
        else {
            localStorage.setItem('numberOfTimesPlayed', _count + 1);
        }
    },
    getPlayedCount: function () {
        var _count = localStorage.getItem('numberOfTimesPlayed');
        return _count || 0;
    },
    getTopScores: function (numberToGet) {
        var _topScores = localStorage.getItem('topScores');
        if (!_topScores) {
            return [];
        }
        else {
            var _topScoresParsed = JSON.parse(_topScores);
            return _topScoresParsed.slice(0, numberToGet || _topScoresParsed.length)
                .map(function (scoreAsString) { return Number(scoreAsString); });
        }
    },
    setTopScore: function (score) {
        var _topScores = DataStore.getTopScores();
        _topScores.push(score);
        _topScores.sort();
        _topScores = _topScores.reverse();
        localStorage.setItem('topScores', JSON.stringify(_topScores.map(function (scoreAsNumber) { return String(scoreAsNumber); })));
    }
};
module.exports = DataStore;

},{}],2:[function(require,module,exports){
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
        this.startingTimeLeft = 100;
        this.timeLeft = this.startingTimeLeft;
        this.movesMade = 0;
        this.lives = 5;
        this.events = {
            NEW_DIRECTION: new _Event(),
            WRONG_MOVE: new _Event(),
            RIGHT_MOVE: new _Event(),
            POINTS_DEDUCTED: new _Event(),
            POINTS_GAINED: new _Event(),
            LOST_GAME: new _Event(),
            SPEED_UP: new _Event()
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
        this.movesMade++;
        this.lives -= 1;
        this.events.WRONG_MOVE.emit(null);
        this.points -= 2;
        this.events.POINTS_DEDUCTED.emit({
            change: -2
        });
        if (this.lives <= 0) {
            this.events.LOST_GAME.emit(null);
        }
    };
    Game.prototype.rightMove = function () {
        this.movesMade++;
        if (this.movesMade % 10 == 0 && this.startingTimeLeft > 40) {
            this.startingTimeLeft -= 10;
            this.events.SPEED_UP.emit(null);
        }
        this.timeLeft = this.startingTimeLeft;
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

},{"../lib/ColourModel":12,"../lib/Event":14,"../lib/fn":17}],3:[function(require,module,exports){
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

},{"../lib/Event":14}],4:[function(require,module,exports){
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

},{"../lib/View":16,"./components/Button":9}],5:[function(require,module,exports){
var View = require('../lib/View');
var GameModule = require('../Game/Game');
var ColourWrapper = require('../lib/ColourWrapper');
var Surface = require('../Surface');
var Component = View.Component;
var Container = require('./components/Container');
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
            },
            blurScreen: function () {
                element.classList.add('blurred');
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
        services.game.events.LOST_GAME.listen(function () {
            methods.blurScreen();
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
                //Note: this needs to be done since the transition will only take effect if the element is added first without our transition
                //class, and THEN given a new class. The dummy statement just gives a chance for the element to be added to the DOM before we add our transition class.
                //We don't need a transition in the above function for the NEW_DIRECTION handler since that's adding a class to an element that is already in the DOM.
                var __dummy = toImplode.offsetHeight;
                toImplode.classList.add('imploded');
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
    var scoreComponent = Component(function scoreView(bindings) {
        var element = document.createElement('span');
        element.classList.add('score');
        element.textContent = bindings.initialScore.toString();
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
    }, function scoreBindings(services) {
        return {
            initialScore: services.game.points
        };
    })(servicesPackage);
    var livesComponent = Component(function livesView(bindings) {
        var element = document.createElement('span');
        element.classList.add('lives');
        function createLivesText(_lives) {
            var outputText = '';
            var i = 0;
            while (i++ < _lives) {
                outputText = outputText + '\u2764';
            }
            return outputText;
        }
        var livesText = document.createElement('span');
        element.appendChild(livesText);
        livesText.textContent = createLivesText(bindings.initialLives);
        var methods = {
            updateLife: function (lives) {
                livesText.textContent = createLivesText(lives);
            }
        };
        return {
            element: element,
            methods: methods
        };
    }, function livesController(methods, services) {
        function refreshLives(e) {
            methods.updateLife(services.game.lives);
        }
        services.game.events.WRONG_MOVE.listen(refreshLives);
    }, function livesBindings(services) {
        return {
            initialLives: services.game.lives
        };
    })(servicesPackage);
    var timerComponent = Component(function timerView() {
        var baseElement = document.createElement('div');
        baseElement.id = 'timer-base';
        var element = document.createElement('div');
        element.id = 'timer';
        baseElement.appendChild(element);
        var methods = {
            updateTimer: function (timeLeft) {
                element.style.transform = "scaleX(" + timeLeft / 100 + ")";
                element.style['-webkit-transform'] = "scaleX(" + timeLeft / 100 + ")";
            },
            makeSpeedUpText: function () {
                var speedElem = document.createElement('div');
                speedElem.classList.add('timer-speed-up-text');
                speedElem.textContent = 'Speed up!';
                baseElement.appendChild(speedElem);
                var __dummy = speedElem.offsetWidth;
                speedElem.style.transform = 'scale(2.0, 2.0)';
                speedElem.style['-webkit-transform'] = 'scale(2.0, 2.0)';
                setTimeout(function () {
                    baseElement.removeChild(speedElem);
                }, 500);
            }
        };
        return {
            element: baseElement,
            methods: methods
        };
    }, function timerComponent(methods, services) {
        services.mainLoop.events.TICK.listen(function () {
            methods.updateTimer(services.game.timeLeft);
        });
        services.game.events.SPEED_UP.listen(function () {
            methods.makeSpeedUpText();
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
    return mainComponent(osdComponent(directionComponent(), Container({
        'class': 'score-bar'
    }, scoreComponent(), livesComponent()), timerComponent(), touchControlsComponent()));
    var _a;
}
exports.create = create;

},{"../Game/Game":2,"../Surface":11,"../lib/ColourWrapper":13,"../lib/View":16,"./components/Container":10}],6:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var View = require('../lib/View');
var ColourWrapper = require('../lib/ColourWrapper');
var ColourModel = require('../lib/ColourModel');
var Button = require('./components/Button');
var Container = require('./components/Container');
var Component = View.Component;
var backgroundColourModel = (function (_super) {
    __extends(backgroundColourModel, _super);
    function backgroundColourModel() {
        _super.apply(this, arguments);
    }
    backgroundColourModel.prototype.hue = function (term) {
        return ColourModel.changeRange(term, [0, 1], [0, 360]);
    };
    backgroundColourModel.prototype.saturation = function (term) {
        return ColourModel.changeRange(term, [0, 1], [45, 55]);
    };
    return backgroundColourModel;
})(ColourModel.plainColourModel);
var _backgroundColourModel = new backgroundColourModel();
function create(handlers) {
    var mainComponent = Component(function mainView(initialBindings) {
        var element = document.createElement('div');
        element.id = 'main-menu';
        var background = document.createElement('div');
        background.id = 'background-container';
        element.appendChild(background);
        function addArrowToScreen(next) {
            var firstArrow = document.createElement('div');
            firstArrow.classList.add('arrow');
            firstArrow.classList.add('active');
            var randomDirection = [
                'left',
                'right',
                'up',
                'down'
            ][Math.round(Math.random() * 3)];
            var directionToUnicode = {
                'left': '&larr;',
                'right': '&rarr;',
                'up': '&uarr;',
                'down': '&darr;'
            };
            firstArrow.innerHTML = directionToUnicode[randomDirection];
            background.appendChild(firstArrow);
            var computedTransform = background.clientWidth - firstArrow.offsetLeft - firstArrow.offsetWidth;
            var animationDirections = {
                'left': 'translateX(',
                'right': 'translateX(-',
                'up': 'translateY(',
                'down': 'translateY(-'
            };
            var directionToMove = animationDirections[randomDirection];
            firstArrow.style.transform = "" + directionToMove + computedTransform + "px)";
            firstArrow.style['-webkit-transform'] = "" + directionToMove + computedTransform + "px)";
            firstArrow.style.backgroundColor = ColourWrapper.hslFromSeed(Math.random(), _backgroundColourModel).toCSSString();
            //HACK(wg): Done to force reflow of the DOM layout and start the transition, otherwise the transition is skipped.
            var __notUsed = firstArrow.offsetHeight;
            var transitionTime = 350;
            //Now that the element is in position, we can start the transition.
            //Since we're setting the position of the element dynamically, this is a safety feature to prevent a CSS transition from being applied during our initial positioning -- we only want the transition to run to move the element from right to left, not for setting it up.
            firstArrow.style.transition = "transform " + transitionTime + "ms";
            firstArrow.style['-webkit-transition'] = "-webkit-transform " + transitionTime + "ms";
            firstArrow.style.transform = '';
            firstArrow.style['-webkit-transform'] = '';
            setTimeout(function transitionEnd() {
                next();
            }, transitionTime);
        }
        (function addArrowsToScreenQuiteContinuously() {
            addArrowToScreen(function next() {
                setTimeout(addArrowsToScreenQuiteContinuously, 1);
            });
        })();
        return {
            element: element,
            methods: null
        };
    }, function mainController(methods, services) {
    }, function initialBindings(services) {
    })(null);
    return mainComponent(Container({
        'class': 'buttons-container'
    }, Button({
        label: 'Start'
    }, {
        click: handlers.gameStartButtonPress
    })(), handlers.tutorialButtonPress ? Button({
        label: 'Tutorial'
    }, {
        click: handlers.tutorialButtonPress
    })() : null, Button({
        label: 'High scores'
    }, {
        click: handlers.scoresButtonPress
    })()));
}
exports.create = create;

},{"../lib/ColourModel":12,"../lib/ColourWrapper":13,"../lib/View":16,"./components/Button":9,"./components/Container":10}],7:[function(require,module,exports){
var View = require('../lib/View');
var Button = require('./components/Button');
var Container = require('./components/Container');
var Component = View.Component;
var DataStore = require('../Game/DataStore');
function create(handlers) {
    var mainComponent = Component(function mainView(initialBindings) {
        var element = document.createElement('div');
        var scoresList = DataStore.getTopScores(15);
        if (scoresList.length == 0) {
            var emptyScoresText = document.createElement('p');
            emptyScoresText.textContent = 'No scores to display';
            element.appendChild(emptyScoresText);
        }
        else {
            var scoresListElem = document.createElement('ol');
            scoresList.forEach(function (score) {
                var scoreElem = document.createElement('li');
                scoreElem.textContent = score.toString();
                scoresListElem.appendChild(scoreElem);
            });
            element.appendChild(scoresListElem);
        }
        return {
            element: element,
            methods: null
        };
    }, function mainController(methods, services) {
    }, function initialBindings(services) {
    })(null);
    return Container({
        'class': 'scores'
    }, Button({
        label: 'Back to main menu'
    }, {
        click: handlers.mainMenuPress
    })(), mainComponent());
}
exports.create = create;

},{"../Game/DataStore":1,"../lib/View":16,"./components/Button":9,"./components/Container":10}],8:[function(require,module,exports){
var View = require('../lib/View');
var Component = View.Component;
var Button = require('./components/Button');
function create(handlers) {
    var mainComponent = Component(function mainView(initialBindings) {
        var element = document.createElement('div');
        element.classList.add('overlay');
        element.classList.add('tutorial');
        var title = document.createElement('h1');
        title.textContent = 'How to play';
        element.appendChild(title);
        var explanationBodyText = document.createElement('p');
        explanationBodyText.textContent = [
            'Hit the correct direction to get points. The arrow points towards the current direction',
            'to hit. Hitting the wrong direction will lose you points and cost you a life. Lose too',
            'many lives and you will lose the game.'
        ].join(' ');
        element.appendChild(explanationBodyText);
        var touchControlsExplanation = document.createElement('div');
        var touchControlsExplanationText = document.createElement('p');
        touchControlsExplanationText.textContent = 'Hit the sides of the screen.';
        touchControlsExplanation.appendChild(touchControlsExplanationText);
        var touchControlsPicture = document.createElement('div');
        touchControlsPicture.classList.add('touch-controls-picture');
        touchControlsPicture.innerHTML = "\n                <table>\n                    <tr>\n                        <td></td>\n                        <td class=\"outlined\">&uarr;</td>\n                        <td></td>\n                    </tr>\n                    <tr>\n                        <td class=\"outlined\">&larr;</td>\n                        <td></td>\n                        <td class=\"outlined\">&rarr;</td>\n                    </tr>\n                    <tr>\n                        <td></td>\n                        <td class=\"outlined\">&darr;</td>\n                        <td></td>\n                   </tr>\n               </table>\n            ";
        touchControlsExplanation.appendChild(touchControlsPicture);
        element.appendChild(touchControlsExplanation);
        var literallyJustTheWordOr = document.createElement('p');
        literallyJustTheWordOr.textContent = 'Or:';
        literallyJustTheWordOr.classList.add('just-the-word-or');
        element.appendChild(literallyJustTheWordOr);
        var keyboardControlsExplanation = document.createElement('div');
        var keyboardControlsExplanationText = document.createElement('p');
        keyboardControlsExplanationText.textContent = 'Press the arrow keys.';
        keyboardControlsExplanation.appendChild(keyboardControlsExplanationText);
        var keyboardControlsPicture = document.createElement('div');
        keyboardControlsPicture.innerHTML = "\n                <table>\n                    <tr>\n                        <td></td>\n                        <td class=\"outlined\">&uarr;</td>\n                        <td></td>\n                    </tr>\n                    <tr>\n                        <td class=\"outlined\">&larr;</td>\n                        <td class=\"outlined\">&darr;</td>\n                        <td class=\"outlined\">&rarr;</td>\n                    </tr>\n\n               </table>\n            ";
        keyboardControlsExplanation.appendChild(keyboardControlsPicture);
        element.appendChild(keyboardControlsExplanation);
        return {
            element: element,
            methods: null
        };
    }, function mainController(methods, services) {
    }, function initialBindings(services) {
    })(null);
    return mainComponent(Button({
        label: 'Play'
    }, {
        click: handlers.closeTutorial
    })());
}
exports.create = create;

},{"../lib/View":16,"./components/Button":9}],9:[function(require,module,exports){
var View = require('../../lib/View');
var Component = View.Component;
module.exports = function CreateButton(attrs, events) {
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

},{"../../lib/View":16}],10:[function(require,module,exports){
var View = require('../../lib/View');
var Component = View.Component;
module.exports = function CreateContainerElement(attrs) {
    var children = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        children[_i - 1] = arguments[_i];
    }
    var element = document.createElement(attrs.elementType || 'div');
    if (attrs.class) {
        element.classList.add(attrs.class);
    }
    children.filter(function (child) {
        return child != null;
    }).forEach(function (child) {
        element.appendChild(child);
    });
    return element;
};

},{"../../lib/View":16}],11:[function(require,module,exports){
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

},{"./lib/HSL":15}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./ColourModel":12,"./HSL":15}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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
            children.filter(function (child) {
                return child != null;
            }).forEach(function (child) {
                template.element.appendChild(child);
            });
            return template.element;
        };
    };
}
exports.Component = Component;

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
var GameModule = require('./Game/Game');
var MainLoop = require('./Game/MainLoop');
var GameScreen = require('./Screens/GameScreen');
var MainScreen = require('./Screens/MainScreen');
var ScoresScreen = require('./Screens/ScoresScreen');
var GameOverOverlay = require('./Screens/GameOverOverlay');
var TutorialOverlay = require('./Screens/TutorialOverlay');
var DataStore = require('./Game/DataStore');
document.addEventListener('DOMContentLoaded', function () {
    var mainContainer = document.getElementById('main-container');
    function clearMainContainer() {
        while (mainContainer.children.length) {
            mainContainer.removeChild(mainContainer.children[0]);
        }
    }
    var manageScreens = {
        gameStart: function (showTutorial) {
            clearMainContainer();
            var game = new GameModule.Game();
            var mainLoop = new MainLoop(game);
            var servicesPackage = {
                game: game,
                mainLoop: mainLoop
            };
            var mainElement = GameScreen.create(servicesPackage);
            //TODO(wg): consider moving this to the screen's code, kind of overstepping our boundaries here
            if (showTutorial) {
                mainElement.classList.add('blurred');
            }
            mainContainer.appendChild(mainElement);
            if (showTutorial) {
                var tutorialOverlay = manageScreens.tutorialOverlay({
                    closeTutorial: function () {
                        mainElement.classList.remove('blurred');
                        mainLoop.start();
                        mainContainer.removeChild(tutorialOverlay);
                    }
                });
                mainContainer.appendChild(tutorialOverlay);
            }
            else {
                mainLoop.start();
            }
            game.events.LOST_GAME.listen(function () {
                mainLoop.pause();
                mainContainer.appendChild(manageScreens.gameOverOverlay());
                DataStore.incrementPlayedCount();
                DataStore.setTopScore(game.points);
            });
        },
        /* Note: Basically done purely for convention, there's nothing to do yet that would
         * require an additional function to call this rather than just calling it directly. */
        tutorialOverlay: TutorialOverlay.create.bind(TutorialOverlay),
        gameOverOverlay: function () {
            return GameOverOverlay.create({
                restartGame: function () {
                    manageScreens.gameStart(false);
                },
                mainMenu: function () {
                    manageScreens.mainMenu();
                },
                showScores: function () {
                    manageScreens.showScores();
                }
            });
        },
        showScores: function () {
            clearMainContainer();
            mainContainer.appendChild(ScoresScreen.create({
                mainMenuPress: function () {
                    manageScreens.mainMenu();
                }
            }));
        },
        mainMenu: function () {
            clearMainContainer();
            var firstRun = DataStore.getPlayedCount() <= 0;
            mainContainer.appendChild(MainScreen.create({
                gameStartButtonPress: function () {
                    manageScreens.gameStart(firstRun);
                },
                tutorialButtonPress: !firstRun ? function () {
                    manageScreens.gameStart(true);
                } : null,
                scoresButtonPress: function () {
                    manageScreens.showScores();
                }
            }));
        }
    };
    manageScreens.mainMenu();
});

},{"./Game/DataStore":1,"./Game/Game":2,"./Game/MainLoop":3,"./Screens/GameOverOverlay":4,"./Screens/GameScreen":5,"./Screens/MainScreen":6,"./Screens/ScoresScreen":7,"./Screens/TutorialOverlay":8}]},{},[18]);
