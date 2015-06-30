import View = require('../../lib/View')
let Component = View.Component;

/**
 * Creates a generic container element.
 * @param {string}     attrs       
 * @param {HTMLElement[]} ...children
 */
export = function CreateContainerElement(
    attrs: {
        elementType ?: string;
        'class' ?: string;
    }, 
    ...children: HTMLElement[]
) {
    let element = document.createElement(attrs.elementType || 'div');

    if (attrs.class) {
        element.classList.add(attrs.class);
    }

    children.filter((child) => {
        return child != null;
    }).forEach((child) => {
        element.appendChild(child);
    });

    return element;
}