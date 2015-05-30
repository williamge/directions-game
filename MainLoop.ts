'use strict';

import HSL = require('./HSL')
import ColourWrapper = require('./ColourWrapper')
import ColourModel = require('./ColourModel')
import GameModule = require('./Game')
import View = require('./View')
import GameScreen = require('./GameScreen')
import _Event = require('./Event')

class MainLoop {
    private lastTime;
    private mainInterval;

    private game;

    events = {
        TICK: new _Event<void>()
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

export = MainLoop;


