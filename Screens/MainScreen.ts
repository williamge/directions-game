import View = require('../lib/View')
import MainLoop = require('../Game/MainLoop')
import GameModule = require('../Game/Game')
import ColourWrapper = require('../lib/ColourWrapper')
import ColourModel = require('../lib/ColourModel');
import Surface = require('../Surface');
import Button = require('./components/Button');
import Container = require('./components/Container');
let Component = View.Component;


class backgroundColourModel extends ColourModel.plainColourModel {
    hue(term) {
        return ColourModel.changeRange(term, [0, 1], [0, 360]);
    }

    saturation(term) {
        return ColourModel.changeRange(term, [0, 1], [45, 55]);
    }
}

let _backgroundColourModel = new backgroundColourModel();

export function create(handlers: {
    gameStartButtonPress: () => void;
    tutorialButtonPress ?: () => void;
    scoresButtonPress: () => void;
}) {
    let mainComponent = Component<void, void>(
        function mainView(initialBindings) {
            let element = document.createElement('div');
            element.id = 'main-menu';

            let background = document.createElement('div');
            background.id = 'background-container';

            element.appendChild(background);

            function addArrowToScreen(next) {
                let firstArrow = document.createElement('div');
                firstArrow.classList.add('arrow');
                firstArrow.classList.add('active');

                let randomDirection = [
                    'left',
                    'right',
                    'up',
                    'down'
                ][Math.round(Math.random() * 3)];

                let directionToUnicode = {
                    'left': '&larr;',
                    'right': '&rarr;',
                    'up': '&uarr;',
                    'down': '&darr;'
                };

                firstArrow.innerHTML = directionToUnicode[randomDirection];

                background.appendChild(firstArrow);

                let computedTransform = background.clientWidth - firstArrow.offsetLeft - firstArrow.offsetWidth;

                let animationDirections = {
                    'left': 'translateX(',
                    'right': 'translateX(-',
                    'up': 'translateY(',
                    'down': 'translateY(-'
                };

                let directionToMove = animationDirections[randomDirection];

                firstArrow.style.transform = `${directionToMove}${computedTransform}px)`;

                firstArrow.style.backgroundColor = ColourWrapper.hslFromSeed(Math.random(), _backgroundColourModel).toCSSString();

                //HACK(wg): Done to force reflow of the DOM layout and start the transition, otherwise the transition is skipped.
                let __notUsed = firstArrow.offsetHeight;

                let transitionTime = 350;

                //Now that the element is in position, we can start the transition.
                //Since we're setting the position of the element dynamically, this is a safety feature to prevent a CSS transition from being applied during our initial positioning -- we only want the transition to run to move the element from right to left, not for setting it up.
                firstArrow.style.transition = `transform ${transitionTime}ms`;
                firstArrow.style.transform = '';
                setTimeout(function transitionEnd(){
                    next();
                }, transitionTime);
            }

            (function addArrowsToScreenQuiteContinuously() {
                addArrowToScreen(function next(){
                    setTimeout(addArrowsToScreenQuiteContinuously, 1);
                });
            })();

            return {
                element,
                methods: null
            };
        },
        function mainController(methods, services){

        },
        function initialBindings(services) {

        }
    )(null);

    return mainComponent(
        Container({
            'class': 'buttons-container'
        },
            Button({
                    label: 'Start'
                },
                {
                    click: handlers.gameStartButtonPress
                })(),
            handlers.tutorialButtonPress ? Button({
                    label: 'Tutorial'
                },
                {
                    click: handlers.tutorialButtonPress
                })() : null,
            Button({
                label: 'High scores'
            }, {
                click: handlers.scoresButtonPress
            })()
        )
    );
}

