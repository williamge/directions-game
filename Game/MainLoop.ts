'use strict';

import GameModule = require('./Game')
import _Event = require('../lib/Event')

/**
 * Helper class for handling a repeating game loop which can be paused and resumed. 
 */
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

    /**
     * Dispatches one run through the loop
     */
    private loop() {
        let nowTime = (new Date()).getTime();
        const delta = nowTime - this.lastTime;
        this.lastTime = nowTime;

        this.game.update(delta);
        this.events.TICK.emit(null);
    }

    /**
     * Pauses the game loop. Call #start to restart the loop.
     */
    pause() {
        clearInterval(this.mainInterval);
        this.isPaused = true;
    }

    /**
     * Starts or resumes the game loop.
     */
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


