'use strict';

import GameModule = require('./Game')
import _Event = require('../lib/Event')

class MainLoop {
    private lastTime;
    private mainInterval;

    private game;

    isPaused: boolean = true;

    events = {
        TICK: new _Event<void>()
    };

    constructor(game: GameModule.Game) {
        this.game = game;
    }

    private loop() {
        let nowTime = (new Date()).getTime();
        const delta = nowTime - this.lastTime;
        this.lastTime = nowTime;

        this.game.update(delta);
        this.events.TICK.emit(null);
    }

    pause() {
        clearInterval(this.mainInterval);
        this.isPaused = true;
    }

    start() {
        this.lastTime = (new Date()).getTime();
        this.mainInterval = setInterval(
            this.loop.bind(this),
            10
        );
        this.isPaused = false;
    }
}

export = MainLoop;

