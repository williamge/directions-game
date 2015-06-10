import View = require('../lib/View')
import MainLoop = require('../Game//MainLoop')
import GameModule = require('../Game/Game')
import fn = require('../lib/fn')
import ColourWrapper = require('../lib/ColourWrapper')
import Surface = require('../Surface');
let Component = View.Component;

import Container = require('./components/Container');


interface SimpleServicePackage {
    game: GameModule.Game;
    mainLoop: MainLoop
}

export function create(servicesPackage: SimpleServicePackage) {
    let mainComponent = Component<{
            newDirection: (oldDirection, newHSL) => void;
            blurScreen: () => void;
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
                },
                blurScreen: () => {
                    element.classList.add('blurred');
                }
            };

            return {
                element,
                methods
            };
        },
        function mainController(methods, services){
            services.game.events.NEW_DIRECTION.listen(function(e) {
                methods.newDirection(e.oldDirection, ColourWrapper.hslFromSeed(Math.random(), services.game.colourModels[services.game.currentDirection]));
            });

            services.game.events.LOST_GAME.listen(function() {
                methods.blurScreen();
            });

            [].slice.call(document.getElementsByTagName('body')).forEach(function(elem) {
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
                    if (direction && currentKeyDown === null && !services.mainLoop.isPaused) {
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
     };


     let directionComponent = Component<{
         rightMoveExplodeDirection: (newDir: string) => void,
         wrongMoveImplodeDirection: (curDir: string) => void
     }, SimpleServicePackage>(
         function directionView(bindings) {
             function makeDirectionElement(dir) {
                 var newDirection = document.createElement('div');
                 newDirection.classList.add('direction');
                 newDirection.innerHTML = dir;
                 return newDirection;
             }

             let element = document.createElement('div');
             element.id = 'directions';

             element.appendChild(makeDirectionElement(directionsMapping[bindings.direction]));

             let methods = {
                 rightMoveExplodeDirection: (newDirection) => {
                     var toExplode: HTMLElement = <HTMLElement> element.children[0];
                     toExplode.classList.add('exploded');

                     function explodeThatStuff(elem) {
                         return function() {
                             elem.parentNode.removeChild(elem);
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
                             elem.parentNode.removeChild(elem);
                         }
                     }

                     setTimeout(implodeThatStuff(toImplode), 250);
                 }
             };

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
         },
         function bindings(services) {
             return {
                 direction: services.game.currentDirection
             }
         }    
     )(servicesPackage);    

     let scoreComponent = Component<{
             refreshScore: (change: number, points: number) => void
     }, SimpleServicePackage>(
         function scoreView(bindings) {
             let element = document.createElement('span');
             element.classList.add('score');

             element.textContent = bindings.initialScore.toString();

             let methods = {
                 refreshScore: (pointsChange: number, points: number) => {
                     element.textContent = points.toString();
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
                 methods.refreshScore(e.change, services.game.points);
             }

             services.game.events.POINTS_DEDUCTED.listen(refreshScore);
             services.game.events.POINTS_GAINED.listen(refreshScore);
         },
         function scoreBindings(services){
            return {
                initialScore: services.game.points
            };
         }
     )(servicesPackage);

    let livesComponent = Component<{
        updateLife: (lives: number) => void
    }, SimpleServicePackage>(
        function livesView(bindings) {
            let element = document.createElement('span');
            element.classList.add('lives');

            function createLivesText(_lives) {
                let outputText = '';
                var i = 0;
                while (i++ < _lives) {
                    outputText = outputText + '\u2764';
                }
                return outputText;
            }

            let livesText = document.createElement('span');
            element.appendChild(livesText);

            livesText.textContent = createLivesText(bindings.initialLives);

            let methods = {
                updateLife: (lives: number) => {
                    livesText.textContent = createLivesText(lives);
                }
            };

            return {
                element,
                methods
            };
        },
        function livesController(methods, services) {
            function refreshLives(e) {
                methods.updateLife(services.game.lives);
            }

            services.game.events.WRONG_MOVE.listen(refreshLives);
        },
        function livesBindings(services){
            return {
                initialLives: services.game.lives
            };
        }
    )(servicesPackage);

     let timerComponent = Component<{
         updateTimer: (timeLeft) => void;
         makeSpeedUpText: () => void;
     }, SimpleServicePackage>(
         function timerView() {
             let baseElement = document.createElement('div');
             baseElement.id = 'timer-base';

             let element = document.createElement('div');
             element.id = 'timer';

             baseElement.appendChild(element);

             let methods = {
                 updateTimer: (timeLeft) => {
                     element.style.transform = `scaleX(${timeLeft / 100})`;
                 },
                 makeSpeedUpText: () => {
                     let speedElem = document.createElement('div');
                     speedElem.classList.add('timer-speed-up-text');
                     speedElem.textContent = 'Speed up!';

                     baseElement.appendChild(speedElem);

                     let __dummy = speedElem.offsetWidth;

                     speedElem.style.transform = 'scale(2.0, 2.0)';

                     setTimeout(function(){
                         baseElement.removeChild(speedElem);
                     }, 500);
                 }
             };

             return {
                 element: baseElement,
                 methods
             };
         },
         function timerComponent(methods, services) {
             services.mainLoop.events.TICK.listen(() => {
                 methods.updateTimer(services.game.timeLeft);
             });
             services.game.events.SPEED_UP.listen(() => {
                 methods.makeSpeedUpText();
             })
         }
     )(servicesPackage);

     let touchControlsComponent = Component<void, SimpleServicePackage>(
         function touchControlsView(bindings) {
             let element = document.createElement('div');
             element.classList.add('touch-controls');

             ['left', 'right', 'up', 'down'].forEach(
                 (direction) => {
                     const directionElem = document.createElement('div');
                     directionElem.classList.add(direction);
                     directionElem.classList.add(`direction-press.${direction}`);
                     directionElem.addEventListener('click', function(e) {
                         bindings.makeMove(direction)
                     });

                     element.appendChild(directionElem);
                 }
                 );

             return {
                 element,
                 methods: null
             };
         },
         function dummyController(){

         },
         function bindings(services) {
             return {
                 makeMove: function(direction) {
                     services.game.makeMove(direction)
                 }
             }
         }    
     )(servicesPackage);

     return mainComponent(
         osdComponent(
             directionComponent(),
             Container( {
                     'class' : 'score-bar'
                 },
                 scoreComponent(),
                 livesComponent()
             ),
             timerComponent(),
             touchControlsComponent()
         )
     );
}

