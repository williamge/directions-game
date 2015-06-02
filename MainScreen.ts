import View = require('./View')
import MainLoop = require('./MainLoop')
import GameModule = require('./Game')
import fn = require('./fn')
import ColourWrapper = require('./ColourWrapper')
import Surface = require('./Surface');
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

    let Button = function(attrs: {
        label ?: string
    } ={}, events: any ={}) {
        return Component<{
            addClickListener: (cb) => void
        }, void>(
            function view(initialBindings) {
                let element = document.createElement('button');
                element.textContent = initialBindings.label;

                let methods = {
                    addClickListener : function(cb) {
                        element.addEventListener('click', cb);
                    }
                };

                return {
                    element,
                    methods
                };
            },
            function controller(methods, services){
                if (events.click) {
                    methods.addClickListener(events.click);
                }
            },
            function initialBindings(services) {
                return {
                    label: attrs.label
                };
            }
        )(null);
    };


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

