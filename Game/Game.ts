import fn = require('../lib/fn')
import _Event = require('../lib/Event')
import ColourModel = require('../lib/ColourModel')

//TODO(wg): one day when TypeScript supports it, these should be inline class expressions
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

export class Game {

    colourModels: any;
    currentDirection;
    points: number = 0;
    timeLeft: number = 100;

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
        LOST_GAME: new _Event<void>()
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

    static _DirectionFromIndex(index) {
        return Game.directions[
            Object.keys(Game.directions)[
            index
            ]
        ];
    }

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

    update(timeDelta) {
        this.timeLeft -= 0.05 * timeDelta;
        if (this.timeLeft <= 0) {
            this.wrongMove();
            this.timeLeft = 100;
        }
    }

    nextDirection() {
        return Game._RandomDirection();
    }

    wrongMove() {
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

    rightMove() {
        this.timeLeft = 100;
        this.events.RIGHT_MOVE.emit(null);
        this.points += 1;
        this.events.POINTS_GAINED.emit({
            change: 1
        });
    }

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
