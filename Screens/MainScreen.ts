import View = require('../lib/View')
import MainLoop = require('../Game/MainLoop')
import GameModule = require('../Game/Game')
import ColourWrapper = require('../lib/ColourWrapper')
import Surface = require('../Surface');
import Button = require('./components/Button');
let Component = View.Component;


export function create(handlers: {
    gameStartButtonPress: () => void
}) {
    let mainComponent = Component<void, void>(
        function mainView(initialBindings) {
            let element = document.createElement('div');
            element.id = 'main-menu';

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
                label: 'Start'
            },
            {
                click: handlers.gameStartButtonPress
            })(),
        Button({
            label: 'High scores'
        })()
    );

    return mainElement
}

