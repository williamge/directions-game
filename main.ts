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
    move: function(_Surface, direction, callbacks, transitionLength=250) {
        if (['left', 'right', 'up', 'down'].indexOf(direction) === -1) {
            throw new Error('Direction is invalid');
        }

        if (!_Surface.classList.contains('surface')) {
            throw new Error('Surface is not a valid Surface element.');
        }

        var noop = function() { };
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
    replaceWithNew: function(_Surface, newHSL) {
        var newSurface = this.createSurface(newHSL);
        brwsr(_Surface).replaceWith(newSurface);
        return newSurface;
    }
}

module GameViews {
    export enum events {
        TICK
    };

    class MainLoop {
        private lastTime;
        private mainInterval;

        private game;

        events = {
            TICK: new _Event._Event<void>()
        };

        constructor(game: GameModule.Game) {
            this.lastTime = (new Date()).getTime();
            this.mainInterval = setInterval(
                this.loop.bind(this),
                10
                );
            this.game = game;
        }

        private loop() {
            let nowTime = (new Date()).getTime();
            const delta = nowTime - this.lastTime;
            this.lastTime = nowTime;

            this.game.update(delta);
            this.events.TICK.emit(null);
        }
    }

    let game = new GameModule.Game();
    let mainLoop = new MainLoop(game);

    interface SimpleServicePackage {
        game: GameModule.Game;
        mainLoop: MainLoop
    }

    let servicesPackage: SimpleServicePackage = {
        game,
        mainLoop
    };

    /***/

    interface TemplateResult<T> {
        element: HTMLElement;
        methods: T;
    }

    function Component<T, U>(
        View: (initialBindings ?: any) => TemplateResult<T>,
        controllerBody ?: (methods, services ?: U) => void,
        initialBindings ?: (services ?: U) => any
    ){
        return (services : U) => {
            return (...children: HTMLElement[]) => {
                let _initialBindings = initialBindings ? initialBindings(services) : null;
                let template = View(_initialBindings);

                if (controllerBody) { 
                    controllerBody(template.methods, services);
                }

                children.forEach((child) => {
                    template.element.appendChild(child);
                });

                return template.element;
            };
        }
    }   

   let mainComponent = Component<{
           newDirection: (oldDirection, newHSL) => void
   }, SimpleServicePackage>(
       function mainView(initialBindings) {
           let element = document.createElement('div');
           element.id = 'screen';

           let surface = Surface.createSurface(ColourWrapper.hslFromSeed(Math.random(), initialBindings.direction));

           element.appendChild(surface);

           let methods = {
               newDirection: (oldDirection, newHSL) => {
                   Surface.move(
                       surface,
                       oldDirection,
                       {
                           end: function() {
                               surface = Surface.replaceWithNew(surface, newHSL);
                           }
                       });
               }
           }

           return {
               element,
               methods
           };
       },
       function mainController(methods, services){
           services.game.events.NEW_DIRECTION.listen(function(e) {
               methods.newDirection(e.oldDirection, ColourWrapper.hslFromSeed(Math.random(), services.game.colourModels[services.game.currentDirection]));
           });

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

                       services.game.makeMove(direction);
                   }
               });

               elem.addEventListener('keyup', function(e) {
                   currentKeyDown = null;
               });
           });
       },
       function initialBindings(services) {
           return {
               direction: services.game.colourModels[services.game.currentDirection]
            };
       }
   )(servicesPackage);

    let osdComponent = Component<void, void>(
        function osdView(){
            let element = document.createElement('div');
            element.classList.add('osd');

            return {
                element,
                methods: null
            };
        }
    )(null);


    let directionsMapping = {
        [GameModule.Game.directions.left]: '&larr;',
        [GameModule.Game.directions.right]: '&rarr;',
        [GameModule.Game.directions.up]: '&uarr;',
        [GameModule.Game.directions.down]: '&darr;'
    }


    let directionComponent = Component<{
        rightMoveExplodeDirection: (newDir: string) => void,
        wrongMoveImplodeDirection: (curDir: string) => void
    }, SimpleServicePackage>(
        function directionView() {
            function makeDirectionElement(dir) {
                var newDirection = document.createElement('div');
                newDirection.classList.add('direction');
                newDirection.innerHTML = dir;
                return newDirection;
            }

            let element = document.createElement('div');
            element.id = 'directions';

            element.appendChild(makeDirectionElement(directionsMapping[game.currentDirection]));

            let methods = {
                rightMoveExplodeDirection: (newDirection) => {
                    var toExplode: HTMLElement = <HTMLElement> element.children[0];
                    toExplode.classList.add('exploded');

                    function explodeThatStuff(elem) {
                        return function() {
                            brwsr(elem).remove();
                        }
                    }

                    setTimeout(explodeThatStuff(toExplode), 250);

                    var newDirectionElem = makeDirectionElement(directionsMapping[newDirection]);
                    element.appendChild(newDirectionElem);
                },
                wrongMoveImplodeDirection:(currentDirection) => {
                    var toImplode: HTMLElement = <HTMLElement> makeDirectionElement(directionsMapping[currentDirection]);
                    element.appendChild(toImplode);

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

            return {
                element,
                methods
            }
        },
        function directionController(methods, services) {
            services.game.events.NEW_DIRECTION.listen(function(e) {
                methods.rightMoveExplodeDirection(services.game.currentDirection);
            });
            services.game.events.WRONG_MOVE.listen(function(e) {
                methods.wrongMoveImplodeDirection(services.game.currentDirection);
            });
        }        
    )(servicesPackage);    

    let scoreComponent = Component<{
            refreshScore: (change) => void
    }, SimpleServicePackage>(
        function scoreView() {
            let element = document.createElement('div');
            element.classList.add('score');

            let methods = {
                refreshScore: (pointsChange) => {
                    element.textContent = game.points.toString();
                    element.classList.remove('animate-good');
                    element.classList.remove('animate-bad');

                    if (pointsChange > 0) {
                        element.classList.add('animate-good');
                    } else {
                        element.classList.add('animate-bad');
                    }

                    setTimeout(() => {
                        element.classList.remove('animate-good');
                        element.classList.remove('animate-bad');
                    }, 250);
                }
            };

            return {
                element,
                methods
            };
        },
        function scoreController(methods, services) {
            function refreshScore(e) {
                methods.refreshScore(e.change);
            }

            services.game.events.POINTS_DEDUCTED.listen(refreshScore);
            services.game.events.POINTS_GAINED.listen(refreshScore);
        }
    )(servicesPackage);

    let timerComponent = Component<{
            updateTimer: (timeLeft) => void
    }, SimpleServicePackage>(
        function timerView() {
            let element = document.createElement('div');
            element.id = 'timer';

            let methods = {
                updateTimer: (timeLeft) => {
                    element.style.transform = `scaleX(${timeLeft / 100})`;
                }
            }

            return {
                element,
                methods
            };
        },
        function timerComponent(methods, services) {
            services.mainLoop.events.TICK.listen(() => {
                methods.updateTimer(services.game.timeLeft);
            });
        }
    )(servicesPackage);

    let touchControlsComponent = Component<void, void>(
        function touchControlsView() {
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

            return {
                element,
                methods: null
            };
        }
    )(null);

    let mainElement = mainComponent(
        osdComponent(
            directionComponent(),
            scoreComponent(),
            timerComponent(),
            touchControlsComponent()
        )
    );

    document.getElementById('main-container').appendChild(mainElement);
}