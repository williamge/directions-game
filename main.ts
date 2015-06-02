import GameModule = require('./Game');
import MainLoop = require('./MainLoop');
import GameScreen = require('./GameScreen');
import MainScreen = require('./MainScreen');

document.addEventListener('DOMContentLoaded', function(){
    /***/

    let mainContainer = document.getElementById('main-container');

    let gameStartButtonPress = function() {
        mainContainer.removeChild(mainContainer.children[0]);

        let game = new GameModule.Game();
        let mainLoop = new MainLoop(game);

        let servicesPackage = {
            game,
            mainLoop
        };

        let mainElement = GameScreen.create(servicesPackage);
        mainContainer.appendChild(mainElement);

        mainLoop.start();

        game.events.LOST_GAME.listen(function() {
            mainLoop.pause();
            alert("Oops you lost");
            //TODO(wg): show game over screen
        });
    };

    mainContainer.appendChild(MainScreen.create({
        gameStartButtonPress
    }));

});