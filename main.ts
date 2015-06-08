import GameModule = require('./Game/Game');
import MainLoop = require('./Game/MainLoop');
import GameScreen = require('./Screens/GameScreen');
import MainScreen = require('./Screens/MainScreen');
import ScoresScreen = require('./Screens/ScoresScreen');
import GameOverOverlay = require('./Screens/GameOverOverlay');
import TutorialOverlay = require('./Screens/TutorialOverlay');
import DataStore = require('./Game/DataStore');

document.addEventListener('DOMContentLoaded', function(){

    let mainContainer = document.getElementById('main-container');

    function clearMainContainer() {
        while(mainContainer.children.length) {
            mainContainer.removeChild(mainContainer.children[0]);
        }
    }

    let manageScreens = {
        gameStart: function(showTutorial : boolean) {
            clearMainContainer();

            let game = new GameModule.Game();
            let mainLoop = new MainLoop(game);

            let servicesPackage = {
                game,
                mainLoop
            };

            let mainElement = GameScreen.create(servicesPackage);
            mainContainer.appendChild(mainElement);

            if (showTutorial) {
                let tutorialOverlay = manageScreens.tutorialOverlay({
                    closeTutorial: () => {
                        mainLoop.start();
                        mainContainer.removeChild(tutorialOverlay);
                    }
                });

                mainContainer.appendChild(tutorialOverlay);
            } else {
                mainLoop.start();
            }

            game.events.LOST_GAME.listen(function() {
                mainLoop.pause();
                mainContainer.appendChild(manageScreens.gameOverOverlay());

                DataStore.incrementPlayedCount();
                DataStore.setTopScore(game.points);
            });
        },
        /* Note: Basically done purely for convention, there's nothing to do yet that would
         * require an additional function to call this rather than just calling it directly. */
        tutorialOverlay: TutorialOverlay.create.bind(TutorialOverlay),
        gameOverOverlay: function() {
            return GameOverOverlay.create({
                restartGame: function() {
                    manageScreens.gameStart(false);
                },
                mainMenu: function() {
                    manageScreens.mainMenu();
                },
                showScores: () => {
                    manageScreens.showScores();
                }
            });
        },
        showScores: function() {
            clearMainContainer();
            mainContainer.appendChild(ScoresScreen.create({
                mainMenuPress: () => {
                    manageScreens.mainMenu();
                }
            }));
        },
        mainMenu: function() {
            clearMainContainer();
            let firstRun = DataStore.getPlayedCount() <= 0;
            mainContainer.appendChild(MainScreen.create({
                gameStartButtonPress: () => {
                    manageScreens.gameStart(firstRun);
                },
                tutorialButtonPress: !firstRun ? () => {
                    manageScreens.gameStart(true);
                } : null,
                scoresButtonPress: () => {
                    manageScreens.showScores();
                }
            }));
        }
    };

    manageScreens.mainMenu();

});