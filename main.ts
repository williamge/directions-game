'use strict';

import HSL = require('./HSL')
import ColourWrapper = require('./ColourWrapper')
import ColourModel = require('./ColourModel')
import GameModule = require('./Game')
import View = require('./View')
import GameScreen = require('./GameScreen')
import _Event = require('./Event')

export var brwsr = function(obj) {
    var _brwsr = {
        _target: obj,
        replaceWith: function(newChild) {
            return this._target.parentNode.replaceChild(newChild, this._target);
        },
        remove: function() {
            this._target.parentNode.removeChild(this._target);
        }
    };

    Object.defineProperty(_brwsr, 'textContent', {
        get: function() {
            return this._target.textContent || this._target.innerText;
        },
        set: function(value) {
            if (this._target.textContent !== undefined) {
                this._target.textContent = value;
            } else {
                this._target.innerText = value;
            }
        }
    });

    return _brwsr;
};


export var Surface = {
    createSurface: function(hsl) {
        var surface = document.createElement('div');
        surface.classList.add('surface');
        hsl = hsl || new HSL.HSL(Math.floor(Math.random() * 360), 100, 88);
        surface.style.backgroundColor = hsl.toCSSString();

        return surface;
    },
    move: function(_Surface, direction, callbacks, transitionLength=250) {
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
    },
    replaceWithNew: function(_Surface, newHSL) {
        var newSurface = this.createSurface(newHSL);
        brwsr(_Surface).replaceWith(newSurface);
        return newSurface;
    }
}

export module GameMain {
    export enum events {
        TICK
    };

    export class MainLoop {
        private lastTime;
        private mainInterval;

        private game;

        events = {
            TICK: new _Event._Event<void>()
        };

        constructor(game: GameModule.Game) {
            this.lastTime = (new Date()).getTime();
            this.mainInterval = setInterval(
                this.loop.bind(this),
                10
                );
            this.game = game;
        }

        private loop() {
            let nowTime = (new Date()).getTime();
            const delta = nowTime - this.lastTime;
            this.lastTime = nowTime;

            this.game.update(delta);
            this.events.TICK.emit(null);
        }
    }

    let game = new GameModule.Game();
    let mainLoop = new MainLoop(game);

    let servicesPackage = {
        game,
        mainLoop
    };

    /***/

    let mainElement = GameScreen.create(servicesPackage)

    document.getElementById('main-container').appendChild(mainElement);
}