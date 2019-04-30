// all available exports at bottom of this file https://github.com/ondras/rot.js/blob/master/dist/rot.js
// import { Display } from 'rot-js'; // object destructuring love it def keep getting way more into all of this for sure. Weird that you couldn't import an entire object like this though though this worked for specific imports
// const ROT = require('rot-js'); // old deprecated syntax love it
import * as ROT from 'rot-js'; // right make sense you forgot the aliasing that is necessary if things aren't named and there are multiple exports you have to name it yourself as an alias lucky to be able to just figure all this out as you go though for sure keep pushing at all of this for sure let's do this thing
import * as SCREENS from './screens';

class Game {
    constructor() {
        this.map = {}; // this is just the POJO that will store all the map data insane damn Rot.JS is powerful amazing
        this.screenWidth = 80;
        this.screenHeight = 40;
        this.display = new ROT.Display({ width: this.screenWidth, height: this.screenHeight }); // holy shit this works reading the source is always a winning strategy wow

        document.body.appendChild(this.display.getContainer());

        this.screens = { startScreen: SCREENS.startScreen, // interesting the shorthand doesn't work when importing from a namespaced constant but this does
                         playScreen: SCREENS.playScreen,
                         winScreen: SCREENS.winScreen,
                         loseScreen: SCREENS.loseScreen };

        this.screens.startScreen.handleEvent = this.screens.startScreen.handleEvent.bind(this.screens.startScreen, this); // fucking love it right pass in this as a first curried argument to the game object fucking love it and keep the this to the object itself this is better design // oh god damn it I think it's because they're fucking arrow functions lol // damn why doesn't this work hmmm
        this.screens.playScreen.handleEvent = this.screens.playScreen.handleEvent.bind(this.screens.playScreen, this); // omfg yeah it was because of arrow functions now this is working just fine as you expected and binding like this is an actual design pattern fuck yeah

        this.switchScreen(this.screens.startScreen);
    }

    getDisplay() { // damn copy/paste keeps all the background color and all that totally amazing
        return this.display;
    }

    switchScreen(screen) {
        // if there was a screen already present, call its exit function
        if (this.currentScreen) { // shouldn't need to check if it's null because null is false a lot to improve here in this code but love it
            window.removeEventListener('keydown', this.currentScreen); // god damn it got it working correctly had to use your own logic lol thank god you get what's going on so you can do it so well
            this.currentScreen.exit();
        }
        // Clear the display
        this.getDisplay().clear(); // because methods are private you only want to use the .getDisplay() hmm okay let's believe it for now and refactor
        // Update our current screen, notify it we entered and then render it
        this.currentScreen = screen;
        if (this.currentScreen) { // wait why the fuck would screens be null check this later lol // right you can set it to null I suppose so check that it's not
            this.currentScreen.enter();
            this.currentScreen.render(this.getDisplay()); // the varied use of this.display vs this.getDisplay() they do is really very confusing crazy how poorly written a lot of code is even shit like this
        }
        window.addEventListener('keydown', this.currentScreen);
    }
}

export default Game;