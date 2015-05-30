import GameModule = require('./Game');
import MainLoop = require('./MainLoop');
import GameScreen = require('./GameScreen');

document.addEventListener('DOMContentLoaded', function(){
    let game = new GameModule.Game();
    let mainLoop = new MainLoop(game);

    let servicesPackage = {
        game,
        mainLoop
    };

    /***/

    let mainElement = GameScreen.create(servicesPackage);

    document.getElementById('main-container').appendChild(mainElement);

});