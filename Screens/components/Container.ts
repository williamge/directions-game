import View = require('../../lib/View')
let Component = View.Component;

export = function CreateContainerElement(attrs: {
    elementType ?: string;
    'class' ?: string;
}, ...children: HTMLElement[]) {
    let element = document.createElement(attrs.elementType || 'div');

    if (attrs.class) {
        element.classList.add(attrs.class);
    }

    children.forEach((child) => {
        element.appendChild(child);
    });

    return element;
}