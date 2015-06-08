import View = require('../../lib/View')
let Component = View.Component;

export = function CreateButton(attrs: {
    label ?: string
} = {}, events: any ={}) {
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
}