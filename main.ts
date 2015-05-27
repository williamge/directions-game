/// <reference path="fn.ts" />
/// <reference path="HSL.ts" />
/// <reference path="ColourWrapper.ts" />
/// <reference path="ColourModel.ts" />
/// <reference path="Game.ts" />

'use strict';



var brwsr = function(obj) {
    var _brwsr = {
        _target: obj,
        replaceWith: function(newChild) {
            return this._target.parentNode.replaceChild(newChild, this._target);
        },
        remove: function() {
            this._target.parentNode.removeChild(this._target);
        }
    };

    Object.defineProperty(_brwsr, 'textContent', {
        get: function() {
            return this._target.textContent || this._target.innerText;
        },
        set: function(value) {
            if (this._target.textContent !== undefined) {
                this._target.textContent = value;
            } else {
                this._target.innerText = value;
            }
        }
    });

    return _brwsr;
};


var Surface = {
    createSurface: function(hsl) {
        var surface = document.createElement('div');
        surface.classList.add('surface');
        hsl = hsl || new HSL.HSL(Math.floor(Math.random() * 360), 100, 88);
        surface.style.backgroundColor = hsl.toCSSString();

        return surface;
    },
    move: function(_Surface, direction, callbacks) {
        if (['left', 'right', 'up', 'down'].indexOf(direction) === -1) {
            throw new Error('Direction is invalid');
        }

        if (!_Surface.classList.contains('surface')) {
            throw new Error('Surface is not a valid Surface element.');
        }

        var noop = function() { };
        callbacks = callbacks || {};
        callbacks.end = callbacks.end || noop;

        //TODO(wg): dangerous, transitionend is very bad at firing
        _Surface.addEventListener('transitionend', callbacks.end);

        _Surface.classList.add(direction);
    },
    replaceWithNew: function(_Surface, newHSL) {
        var newSurface = this.createSurface(newHSL);
        brwsr(_Surface).replaceWith(newSurface);
        return newSurface;
    }
}

module GameViews {
    var game = new GameModule.Game();

    export enum events {
            TICK
    };

    class MainLoop {
        private lastTime;
        private mainInterval;

        private game;

        private _listeners = {};

        constructor(game: GameModule.Game) {
            this.lastTime = (new Date()).getTime();
            this.mainInterval = setInterval(
                this.loop.bind(this),
                10
            );        
            this.game = game;

            Object.keys(events).forEach(function(e) {
                this._listeners[events[e]] = [];
            }.bind(this));
        }    

        private loop() {
            let nowTime = (new Date()).getTime();
            const delta = nowTime - this.lastTime;
            this.lastTime = nowTime;

            this.game.update(delta);
            this.dispatchEvent(events.TICK, {});
        }    

        addEventListener(eventName, cb) {
            this._listeners[eventName].push(cb);
        }

        dispatchEvent(eventName, message ?: any) {
            this._listeners[eventName].forEach(function(cb) {
                cb(message || {});
            });
        }
    }

    let mainLoop = new MainLoop(game);

    //TODO(wg): on second thought it is dumb to have this as a class, it doesn't have a real lifetime, it's
    //just made and then render() is called immediately, make a factory function that takes
    //functions as parameters
    
/*
    interface TemplateResult<T> {
        element: HTMLElement;
        methods: T;
    }

    function myView() {
        let d = document.createElement('div')

        let methods = {};

        return {
            element: d,
            methods
        };
    }

    function Component<T>(
        View: () => TemplateResult<T>,
        controllerBody: (methods: any) => void,
        services
    ){
        return (services) => {
            return (children) => {
                let template = View(services?);

                controllerBody(template.methods, services);

                children.forEach((child) => {
                    template.element.appendChild(child);
                });

                return template.element;
            };
        }
    }

    let mainComponent = Component(
        myView,
        (methods) => {
            //call methods
        }
    )(services);

    let template = mainComponent(
        osdComponent(,
            directionsComponent(),
            scoreComponent(),
            timerComponent(),
            touchControlsComponent()
        )
    )

 */

    class View {
        protected element: HTMLElement;
        methods: any;

        constructor(children: HTMLElement[]) {
            this.element = this.construct(children);
            children.forEach((child) => {
                this.element.appendChild(child);
            });
        }

        construct(children : HTMLElement[] = []): HTMLElement {
            throw new Error('Abstract method: you have to override this method.');
        };

        render(bindings ?: any) {
            return this.element;
        }
    }

    class Component {
        protected children;
        constructor(children ?: HTMLElement[]) {
            this.children = children;
        }
        load(): HTMLElement {
            throw new Error('Abstract method: you have to override this method.');
        };
    }


    class mainView extends View {
        construct(children : HTMLElement[] = []) {
            let element = document.createElement('div');
            element.id = 'screen';

            let surface = Surface.createSurface(ColourWrapper.hslFromSeed(Math.random(), game.colourModels[game.currentDirection]));

            element.appendChild(surface);

            this.gameControls();

            //TODO(wg): move this to controller/component
            game.addEventListener(GameModule.events.NEW_DIRECTION, function(e) {
                Surface.move(
                    surface,
                    e.oldDirection,
                    {
                        end: function() {
                            surface = Surface.replaceWithNew(surface, ColourWrapper.hslFromSeed(Math.random(), game.colourModels[game.currentDirection]));
                        }
                    });
            });

            return element;
        }

        private gameControls() {
            f.n(document.getElementsByTagName('body')).forEach(function(elem) {
                var currentKeyDown;
                elem.addEventListener('keydown', function(e) {
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

                        game.makeMove(direction);
                    }
                });

                elem.addEventListener('keyup', function(e) {
                    currentKeyDown = null;
                });
            });
        }
    }

    class mainComponent extends Component {

        load() {
            let view = new mainView(this.children);
            let viewMethods = view.methods;
            return view.render();
        }
    }

    /***/

    class osdView extends View {
        construct(children : HTMLElement[] = []) {
            let element = document.createElement('div');
            element.classList.add('osd');

            return element;
        }
    }

    class osdComponent extends Component {
        load() {
            let view = new osdView(this.children);
            let viewMethods = view.methods;
            return view.render();
        }
    }

    /***/

    class directionsView extends View {
        static directionsMapping = {
            [GameModule.Game.directions.left]: '&larr;',
            [GameModule.Game.directions.right]: '&rarr;',
            [GameModule.Game.directions.up]: '&uarr;',
            [GameModule.Game.directions.down]: '&darr;'
        }

        construct(children) {
            let directionsElem = document.createElement('div');
            directionsElem.id = 'directions';

            directionsElem.appendChild(this.makeDirectionElement(directionsView.directionsMapping[game.currentDirection]));

            this.methods = {
                rightMoveExplodeDirection: (newDirection) => {
                    var toExplode: HTMLElement = <HTMLElement> this.element.children[0];
                    toExplode.classList.add('exploded');

                    function explodeThatStuff(elem) {
                        return function() {
                            brwsr(elem).remove();
                        }
                    }

                    setTimeout(explodeThatStuff(toExplode), 250);

                    var newDirectionElem = this.makeDirectionElement(directionsView.directionsMapping[newDirection]);
                    this.element.appendChild(newDirectionElem);
                },
                wrongMoveImplodeDirection:(currentDirection) => {
                    var toImplode: HTMLElement = <HTMLElement> this.makeDirectionElement(directionsView.directionsMapping[currentDirection]);
                    this.element.appendChild(toImplode);

                    //Note: this needs to be in a timeout since the transition will only take effect if the element is added first without our transition
                    //class, and THEN given a new class. The timeout just gives a chance for the element to be added to the DOM before we add our transition class.
                    //We don't need a transition in the above function for the NEW_DIRECTION handler since that's adding a class to an element that is already in the DOM.
                    setTimeout(function() {
                        toImplode.classList.add('imploded');
                    }, 10);

                    function implodeThatStuff(elem) {
                        return function() {
                            brwsr(elem).remove();
                        }
                    }

                    setTimeout(implodeThatStuff(toImplode), 250);
                }
            }

            return directionsElem;
        }

        private makeDirectionElement(dir) {
            var newDirection = document.createElement('div');
            newDirection.classList.add('direction');
            newDirection.innerHTML = dir;
            return newDirection;
        }
    }

    class directionsComponent extends Component {
        load() {
            let view = new directionsView(this.children);
            let viewMethods = view.methods;

            game.addEventListener(GameModule.events.NEW_DIRECTION, function(e) {
                viewMethods.rightMoveExplodeDirection(game.currentDirection);
            });
            game.addEventListener(GameModule.events.WRONG_MOVE, function(e) {
                viewMethods.wrongMoveImplodeDirection(game.currentDirection);
            });

            return view.render();
        }
    }

    /***/

    class scoreView extends View {
        construct(children : HTMLElement[] = []) {
            let element = document.createElement('div');
            element.classList.add('score');

            this.methods = {
                refreshScore: (pointsChange) => {
                    this.element.textContent = game.points.toString();
                    this.element.classList.remove('animate-good');
                    this.element.classList.remove('animate-bad');

                    if (pointsChange > 0) {
                        this.element.classList.add('animate-good');
                    } else {
                        this.element.classList.add('animate-bad');
                    }

                    setTimeout(() => {
                        this.element.classList.remove('animate-good');
                        this.element.classList.remove('animate-bad');
                    }, 250);
                }
            };

            return element;
        }
    }

    class scoreComponent extends Component {
        load() {
            let view = new scoreView(this.children);
            let viewMethods = view.methods;

            function refreshScore(e) {
                viewMethods.refreshScore(e.change);
            }

            game.addEventListener(GameModule.events.POINTS_DEDUCTED, refreshScore);
            game.addEventListener(GameModule.events.POINTS_GAINED, refreshScore);

            return view.render();
        }
    }

    /***/

    class timerView extends View {
        construct(children) {
            let element = document.createElement('div');
            element.id = 'timer';

            this.methods = {
                updateTimer: (timeLeft) => {
                    this.element.style.transform = `scaleX(${timeLeft / 100})`;
                }
            }

            return element;
        }
    }

    class timerComponent extends Component {
        load() {
            let view = new timerView(this.children);
            let viewMethods = view.methods;

            mainLoop.addEventListener(events.TICK, () => {
                viewMethods.updateTimer(game.timeLeft);
            });

            return view.render();
        }
    }

    /***/

    class touchControlsView extends View {
        construct(children) {
            let element = document.createElement('div');
            element.classList.add('touch-controls');

            ['left', 'right', 'up', 'down'].forEach(
                (direction) => {
                    const directionElem = document.createElement('div');
                    directionElem.classList.add(direction);
                    directionElem.classList.add(`direction-press.${direction}`);
                    directionElem.addEventListener('click', function(e) {
                        game.makeMove(direction);
                    });

                    element.appendChild(directionElem);
                }
                );

            return element;
        }
    }

    class touchControlsComponent extends Component {
        load() {
            let view = new touchControlsView(this.children);
            let viewMethods = view.methods;
            return view.render();
        }
    }

    function renderComponent(component, ...children):HTMLElement {
       return (new component(children)).load();
    }

    let template = renderComponent(mainComponent,
        renderComponent(osdComponent,
            renderComponent(directionsComponent),
            renderComponent(scoreComponent),
            renderComponent(timerComponent),
            renderComponent(touchControlsComponent)
        )
    );    
    document.getElementById('main-container').appendChild(template);
}