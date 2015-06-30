import fn = require('../lib/fn')
import _Event = require('../lib/Event')
import ColourModel = require('../lib/ColourModel')

//TODO(wg): one day when TypeScript supports it, these should be inline class expressions
//Update: this looks like it's coming in TS 1.6, so look forward to that.
class _GameColourModelLeft extends ColourModel.plainColourModel {
    hue(term) {
        return ColourModel.changeRange(term, [0, 1], [0, 90]);
    }
}

class _GameColourModelRight extends ColourModel.plainColourModel {
    hue(term) {
        return ColourModel.changeRange(term, [0, 1], [90, 180]);
    }
}

class _GameColourModelUp extends ColourModel.plainColourModel {
    hue(term) {
        return ColourModel.changeRange(term, [0, 1], [180, 270]);
    }
}

class _GameColourModelDown extends ColourModel.plainColourModel {
    hue(term) {
        return ColourModel.changeRange(term, [0, 1], [270, 360]);
    }
}

/**
 * Core game class to handle main game logic.
 */
export class Game {

    colourModels: any;
    currentDirection;
    points: number = 0;
    private startingTimeLeft = 100;
    timeLeft: number = this.startingTimeLeft;

    private movesMade = 0;

    lives = 5;

    events = {
        NEW_DIRECTION: new _Event<{
                oldDirection: string,
                newDirection: string
            }>(),
        WRONG_MOVE: new _Event<void>(),
        RIGHT_MOVE: new _Event<void>(),
        POINTS_DEDUCTED: new _Event<{
                change: number
            }>(),
        POINTS_GAINED: new _Event<{
                change: number
            }>(),
        LOST_GAME: new _Event<void>(),
        SPEED_UP: new _Event<void>()
    };

    static directions = {
        left: 'left',
        right: 'right',
        up: 'up',
        down: 'down'
    };

    _mySuperCoolColourModels = {
        left: new _GameColourModelLeft,
        right: new _GameColourModelRight,
        up: new _GameColourModelUp,
        down: new _GameColourModelDown
    };

    /**
     * Just a helper for returning a direction based off of a numerical index
     * @param {number} index 
     */
    static _DirectionFromIndex(index) {
        return Game.directions[
            Object.keys(Game.directions)[
            index
            ]
        ];
    }

    /**
     * Returns a random direction.
     */
    static _RandomDirection() {
        return Game._DirectionFromIndex((Math.floor(Math.random() * 4)))
    }

    constructor(options?: any) {
        options = fn.defaults(options, {
            colourModel: this._mySuperCoolColourModels
        });

        this.colourModels = options.colourModel;

        this.currentDirection = this.nextDirection();
    }

    /**
     * Runs one frame through the update loop. 
     * @param {[type]} timeDelta [description]
     */
    update(timeDelta) {
        this.timeLeft -= 0.05 * timeDelta;
        if (this.timeLeft <= 0) {
            this.wrongMove();
            this.timeLeft = 100;
        }
    }

    /**
     * Returns the next direction in the game. 
     */
    nextDirection() {
        //Note: currently just calls Game._RandomDirection but could be changed in the future to use a different
        //mechanism for selecting directions (i.e. deterministic, or a balanced random) 
        return Game._RandomDirection();
    }

    /**
     * Handles logic for what should happen when the user makes a wrong move.
     */
    wrongMove() {
        this.movesMade++;

        this.lives -= 1;
        this.events.WRONG_MOVE.emit(null);
        this.points -= 2;
        this.events.POINTS_DEDUCTED.emit({
            change: -2
        });

        if (this.lives <= 0) {
            this.events.LOST_GAME.emit(null);
        }
    }

    /**
     * Handles logic for what should happen when the user makes a correct move.
     */
    rightMove() {
        this.movesMade++;

        if (this.movesMade % 10 == 0 && this.startingTimeLeft > 40) {
            this.startingTimeLeft -= 10;
            this.events.SPEED_UP.emit(null);
        }
        this.timeLeft = this.startingTimeLeft;

        this.events.RIGHT_MOVE.emit(null);
        this.points += 1;
        this.events.POINTS_GAINED.emit({
            change: 1
        });
    }

    /**
     * Makes a move in the game for the given direction. Will handle calling rightMove or wrongMove based off
     * of the given direction.
     * @param {string} direction Direction to move in the game
     */
    makeMove(direction) {

        if (direction !== this.currentDirection) {
            this.wrongMove();
            return false;
        }
        this.rightMove();

        this.currentDirection = this.nextDirection();
        this.events.NEW_DIRECTION.emit({
            oldDirection: direction,
            newDirection: this.currentDirection
        });

        return true;
    }

}
