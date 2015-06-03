import GameModule = require('./Game/Game');
import MainLoop = require('./Game/MainLoop');
import GameScreen = require('./Screens/GameScreen');
import MainScreen = require('./Screens/MainScreen');

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