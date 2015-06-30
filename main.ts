import GameModule = require('./Game/Game');
import MainLoop = require('./Game/MainLoop');
import GameScreen = require('./Screens/GameScreen');
import MainScreen = require('./Screens/MainScreen');
import ScoresScreen = require('./Screens/ScoresScreen');
import GameOverOverlay = require('./Screens/GameOverOverlay');
import TutorialOverlay = require('./Screens/TutorialOverlay');
import DataStore = require('./Game/DataStore');

/**
 * Main entry point.
 */
document.addEventListener('DOMContentLoaded', function(){

    let mainContainer = document.getElementById('main-container');

    /**
     * Removes all of the children of the main container. Should be called before
     * switching to screens, probably shouldn't be called before adding an overlay. 
     */
    function clearMainContainer() {
        while(mainContainer.children.length) {
            mainContainer.removeChild(mainContainer.children[0]);
        }
    }

    /**
     * Object to hold the different screen transitions for the game.
     * @type {Object}
     */
    let manageScreens = {
        /**
         * Main game screen, for actually playing the game.
         * @param {boolean} showTutorial Set to true to show the tutorial overlay
         */
        gameStart: function(showTutorial : boolean) {
            clearMainContainer();

            let game = new GameModule.Game();
            let mainLoop = new MainLoop(game);

            let servicesPackage = {
                game,
                mainLoop
            };

            let mainElement = GameScreen.create(servicesPackage);

            //TODO(wg): consider moving this to the screen's code, kind of overstepping our boundaries here
            if (showTutorial) {
                mainElement.classList.add('blurred');
            }
            mainContainer.appendChild(mainElement);

            if (showTutorial) {
                //Adding the tutorial overlay
                let tutorialOverlay = manageScreens.tutorialOverlay({
                    closeTutorial: () => {
                        mainElement.classList.remove('blurred');
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
        /**
         * Returns a created game over overlay element with standard event listeners and options.
         */
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
        /**
         * Switches to the scores screen.
         */
        showScores: function() {
            clearMainContainer();
            mainContainer.appendChild(ScoresScreen.create({
                mainMenuPress: () => {
                    manageScreens.mainMenu();
                }
            }));
        },
        /**
         * Swithces to the main menu screen.
         */
        mainMenu: function() {
            clearMainContainer();

            //Note: We're only showing the tutorial screen on game start if the user has not
            //played the game yet.
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

    //Start off the game by switching to the main menu.
    manageScreens.mainMenu();

});