
/**
 * Singleton object providing an easy API for saving game information. Uses localStorage for the 
 * storage mechanism
 * @type {Object}
 */
let DataStore = {
    /**
     * Increments the number of times the game is played by 1. Sets the count at 1 if this 
     * value has not been saved yet.
     */
    incrementPlayedCount: function() {
        let _count = localStorage.getItem('numberOfTimesPlayed');
        if (!_count) {
            localStorage.setItem('numberOfTimesPlayed', String(1));
        } else {
            localStorage.setItem('numberOfTimesPlayed', _count + 1);
        }
    },
    /**
     * Returns the number of times the game has been played.
     * @return {number} Number of times the game has been played
     */
    getPlayedCount: function(): number {
        let _count = localStorage.getItem('numberOfTimesPlayed');
        return _count || 0;
    },
    /**
     * Returns an array of the top scores
     * @param  {number}   numberToGet Optional limit to how many top scores should be returned 
     * @return {number[]}             Top scores
     */
    getTopScores: function(numberToGet ?: number): number[] {
        let _topScores = localStorage.getItem('topScores');

        if (!_topScores) {
            return [];
        } else {
            let _topScoresParsed = JSON.parse(_topScores);
            return _topScoresParsed.slice(0, numberToGet || _topScoresParsed.length)
                .map((scoreAsString) => Number(scoreAsString));
        }
    },
    /**
     * Saves a new top score
     * @param {number} score Score to save
     */
    setTopScore: function(score: number) {
        let _topScores = DataStore.getTopScores();

        _topScores.push(score);
        _topScores.sort();
        _topScores = _topScores.reverse();

        localStorage.setItem('topScores', JSON.stringify(_topScores.map((scoreAsNumber) => String(scoreAsNumber))));
    }
};

export = DataStore;