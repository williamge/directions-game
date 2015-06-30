
import HSL = require('./lib/HSL');

//TODO(wg): this should probably be replaced with a class that extends the HTMLElement class

/**
 * Creates a 'surface' element. A surface is an element with a solid colour (which can be optionally
 * specified, otherwise a random colour will be given).
 * @param {HSL} hsl Optional colour to give the surface
 */
export function createSurface(hsl) {
    var surface = document.createElement('div');
    surface.classList.add('surface');
    hsl = hsl || new HSL.HSL(Math.floor(Math.random() * 360), 100, 88);
    surface.style.backgroundColor = hsl.toCSSString();

    return surface;
}
/**
 * Starts the 'move' animation for a given surface element.
 * @param {HTMLElement(Surface)} _Surface             Surface element to apply effects to
 * @param {string} direction            Direction to 'move' the surface towards
 * @param {Object} callbacks            Optional callbacks to hook in to surface transition events
 * @param {number} transitionLength=250 how long the effect should last for
 */
export function move(_Surface, direction, callbacks, transitionLength=250) {
    if (['left', 'right', 'up', 'down'].indexOf(direction) === -1) {
        throw new Error('Direction is invalid');
    }

    if (!_Surface.classList.contains('surface')) {
        throw new Error('Surface is not a valid Surface element.');
    }

    var noop = function() { };
    callbacks = callbacks || {};
    callbacks.end = callbacks.end || noop;

    //It is very unfortunate that we cannot do the following:
    //    _Surface.addEventListener('transitionend', callbacks.end);
    //But browsers have spotty support for the transitionend event, and if we purely relied on that event to fire then
    //there can be plenty of opportunities where it will not and the element will be stuck in a state which it should not be in.
    //Examples include switching to another tab, down to just not using the right phone.
    //
    //As a result we are just using a timeout to simulate the event to cover our bases, blame the browsers.
    //
    //TODO(wg): Make sure this is still relevant and that we can't just use the event.
    setTimeout(callbacks.end, transitionLength);

    _Surface.classList.add(direction);
}
/**
 * Replaces a given surface element with a new one, using the provided optional colour element
 * @param {HTMLElement(Surface)} _Surface Surface element to be replaced
 * @param {HSL} newHSL   Optional colour for the new surface element
 */
export function replaceWithNew(_Surface, newHSL) {
    var newSurface = this.createSurface(newHSL);
    _Surface.parentNode.replaceChild(newSurface, _Surface);
    return newSurface;
}