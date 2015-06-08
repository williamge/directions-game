import View = require('../lib/View')
import Button = require('./components/Button');
let Component = View.Component;


export function create(handlers: {
    restartGame: () => void;
    showScores : () => void;
    mainMenu : () => void;
}) {
    let mainComponent = Component<void, void>(
        function mainView(initialBindings) {
            let element = document.createElement('div');
            element.classList.add('overlay');

            let youLostText = document.createElement('h1');
            youLostText.textContent = 'Game Over';

            element.appendChild(youLostText);

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
        Button({
            label: 'Restart'
        }, {
            click: handlers.restartGame
        })(),
        Button({
            label: 'Scores'
        }, {
            click: handlers.showScores
        })(),
        Button({
            label: 'Main menu'
        }, {
            click: handlers.mainMenu
        })()
    );

    return mainElement;
}

