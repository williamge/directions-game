
module GameModule {

    
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

    export enum events {
        NEW_DIRECTION,
        WRONG_MOVE,
        RIGHT_MOVE,
        POINTS_DEDUCTED,
        POINTS_GAINED,
    };

    export class Game {

        colourModels: any;
        currentDirection;
        points: number = 0;
        timeLeft: number = 100;

        private _listeners = {};

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
            options = f.n(options).defaults({
                colourModel: this._mySuperCoolColourModels
            });

            this.colourModels = options.colourModel;

            this.currentDirection = this.nextDirection();

            Object.keys(events).forEach(function(e) {
                this._listeners[events[e]] = [];
            }.bind(this));
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
        };

        wrongMove() {
            this.dispatchEvent(events.WRONG_MOVE);
            this.points -= 2;
            this.dispatchEvent(events.POINTS_DEDUCTED, {
                change: -2
            });
        };

        rightMove() {
            this.timeLeft = 100;
            this.dispatchEvent(events.RIGHT_MOVE);
            this.points += 1;
            this.dispatchEvent(events.POINTS_GAINED, {
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
            this.dispatchEvent(events.NEW_DIRECTION, {
                oldDirection: direction,
                newDirection: this.currentDirection
            });

            return true;
        }

        addEventListener(eventName, cb) {
            this._listeners[eventName].push(cb);
        }

        dispatchEvent(eventName, message ?: any) {
            this._listeners[eventName].forEach(function(cb) {
                cb(message || {});
            });
        }
    }
}