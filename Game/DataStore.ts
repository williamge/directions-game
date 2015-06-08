

let DataStore = {
    incrementPlayedCount: function() {
        let _count = localStorage.getItem('numberOfTimesPlayed');
        if (!_count) {
            localStorage.setItem('numberOfTimesPlayed', String(1));
        } else {
            localStorage.setItem('numberOfTimesPlayed', _count + 1);
        }
    },
    getPlayedCount: function(): number {
        let _count = localStorage.getItem('numberOfTimesPlayed');
        return _count || 0;
    },
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
    setTopScore: function(score: number) {
        let _topScores = DataStore.getTopScores();

        _topScores.push(score);
        _topScores.sort();
        _topScores = _topScores.reverse();

        localStorage.setItem('topScores', JSON.stringify(_topScores.map((scoreAsNumber) => String(scoreAsNumber))));
    }
};

export = DataStore;