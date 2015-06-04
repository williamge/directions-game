import GameModule = require('./Game/Game');
import MainLoop = require('./Game/MainLoop');
import GameScreen = require('./Screens/GameScreen');
import MainScreen = require('./Screens/MainScreen');
import GameOverOverlay = require('./Screens/GameOverOverlay');

document.addEventListener('DOMContentLoaded', function(){
    /***/

    let mainContainer = document.getElementById('main-container');

    function clearMainContainer() {
        while(mainContainer.children.length) {
            mainContainer.removeChild(mainContainer.children[0]);
        }
    }

    let manageScreens = {
        gameStart: function() {
            clearMainContainer();

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
                mainContainer.appendChild(manageScreens.gameOverOverlay());
            });
        },
        gameOverOverlay: function() {
            return GameOverOverlay.create({
                restartGame: function() {
                    manageScreens.gameStart();
                },
                mainMenu: function() {
                    manageScreens.mainMenu();
                }
            });
        },
        mainMenu: function() {
            clearMainContainer();
            mainContainer.appendChild(MainScreen.create({
                gameStartButtonPress: manageScreens.gameStart
            }));
        }
    };

    manageScreens.mainMenu();

});