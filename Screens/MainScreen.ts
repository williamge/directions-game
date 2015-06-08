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

                firstArrow.innerHTML = ['&larr;', '&rarr;', '&uarr;', '&darr;'][Math.floor(Math.random() * 4)];

                background.appendChild(firstArrow);

                let computedTransform = background.clientWidth - firstArrow.offsetLeft - firstArrow.offsetWidth;

                firstArrow.style.transform = `translateX(${computedTransform}px)`;

                firstArrow.style.backgroundColor = ColourWrapper.hslFromSeed(Math.random(), _backgroundColourModel).toCSSString();

                //HACK(wg): Done to force reflow of the DOM layout and start the transition, otherwise the transition is skipped.
                let __notUsed = firstArrow.offsetHeight;

                //Now that the element is in position, we can start the transition.
                //Since we're setting the position of the element dynamically, this is a safety feature to prevent a CSS transition from being applied during our initial positioning -- we only want the transition to run to move the element from right to left, not for setting it up.
                firstArrow.classList.add('ready-for-transition');
                firstArrow.style.transform = '';
                setTimeout(function transitionEnd(){
                    next();
                }, 750);
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

    let mainElement = mainComponent(
        Container({
            class: 'buttons-container'
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
                })(): null,
            Button({
                label: 'High scores'
            })()
        )
    );

    return mainElement
}

