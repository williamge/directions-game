import View = require('../lib/View')
import MainLoop = require('../Game/MainLoop')
import GameModule = require('../Game/Game')
import Button = require('./components/Button');
import Container = require('./components/Container');
let Component = View.Component;
import DataStore = require('../Game/DataStore');


export function create(handlers: {
    mainMenuPress: () => void
}) {
    let mainComponent = Component<void, void>(
        function mainView(initialBindings) {
            let element = document.createElement('div');
            element.id = 'scores';

            let scoresList = document.createElement('ol');

            DataStore.getTopScores(15).forEach((score) => {
                let scoreElem = document.createElement('li');
                scoreElem.textContent = score.toString();
                scoresList.appendChild(scoreElem);
            });

            element.appendChild(scoresList);

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

    return Container(
        {},
        Button({
            label: 'Back to main menu'
        }, {
            click: handlers.mainMenuPress
        })(),
        mainComponent()
    );
}

