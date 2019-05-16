// all available exports at bottom of this file https://github.com/ondras/rot.js/blob/master/dist/rot.js
// import { Display } from 'rot-js'; // object destructuring love it def keep getting way more into all of this for sure. Weird that you couldn't import an entire object like this though though this worked for specific imports
// const ROT = require('rot-js'); // old deprecated syntax love it
import * as ROT from 'rot-js'; // right make sense you forgot the aliasing that is necessary if things aren't named and there are multiple exports you have to name it yourself as an alias lucky to be able to just figure all this out as you go though for sure keep pushing at all of this for sure let's do this thing
import * as SCREENS from './screens';
import Entity from './entity';
import { PlayerTemplate } from './entities';
import Builder from './builder';
import Dungeon from './maps/dungeon';
import BossCavern from './maps/bosscavern';

export default class Game {
    constructor() {
        // Create a map based on these size parameters fuck yeah
        const width = 100;
        const height = 100;
        const depth = 6;
        // create initial dungeon map from the tiles from the Builder
        const builder = new Builder(width, height, depth);
        const tiles = builder.getTiles();
        const upstairPos = builder.getAllUpstairPos();
        const downstairPos = builder.getAllDownstairPos();
        this.player = new Entity(PlayerTemplate, this);
        this.maps = {
            dungeon: new Dungeon(tiles, upstairPos, downstairPos), // this still refers to the playScreen object at this point in time since it'll be called method style
            bossCavern: new BossCavern(),
        };
        // add the player initially to the start map here, in this case the dungeon currently, this is solid refactoring to allow you to easily change the start map later and to not have the start map add the player itself, but to have it done here explicitly
        this.maps.dungeon.addEntityAtRandomPosition(this.player, 0);
        this.screenWidth = 80;
        this.screenHeight = 40;
        this.display = new ROT.Display({ width: this.screenWidth, height: this.screenHeight + 1 }); // make sure to keep one extra line at the bottom of the screen for displaying player stats

        document.body.appendChild(this.display.getContainer());

        this.screens = { startScreen: SCREENS.startScreen, // interesting the shorthand doesn't work when importing from a namespaced constant but this does
                         playScreen: SCREENS.playScreen,
                         winScreen: SCREENS.winScreen,
                         loseScreen: SCREENS.loseScreen,
                         inventoryScreen: SCREENS.inventoryScreen,
                         dropScreen: SCREENS.dropScreen,
                         pickupScreen: SCREENS.pickupScreen,
                         eatScreen: SCREENS.eatScreen,
                         wieldScreen: SCREENS.wieldScreen,
                         wearScreen: SCREENS.wearScreen,
                         examineScreen: SCDREENS.examineScreen,
                         gainStatScreen: SCREENS.gainStatScreen
                       };

        this.screens.playScreen.player = this.player;
        this.screens.playScreen.game = this;
        this.screens.startScreen.game = this;
        this.screens.startScreen.handleEvent = this.screens.startScreen.handleEvent.bind(this.screens.startScreen); // fucking love it right pass in this as a first curried argument to the game object fucking love it and keep the this to the object itself this is better design // oh god damn it I think it's because they're fucking arrow functions lol // damn why doesn't this work hmmm
        this.screens.playScreen.handleEvent = this.screens.playScreen.handleEvent.bind(this.screens.playScreen); // omfg yeah it was because of arrow functions now this is working just fine as you expected and binding like this is an actual design pattern fuck yeah

        this.switchScreen(this.screens.startScreen);
    }

    getDisplay() { // damn copy/paste keeps all the background color and all that totally amazing
        return this.display;
    }

    getScreenWidth() {
        return this.screenWidth;
    }

    getScreenHeight() {
        return this.screenHeight;
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
            this.currentScreen.enter(this); // only used for instantiating entities with game objects right now real weak system should def be a better way figure it out later for sure
            this.refresh();
        }
        window.addEventListener('keydown', this.currentScreen);
    }

    refresh() {
        // clear the screen
        this.display.clear();
        // render the screen
        this.currentScreen.render(this.display);
    }
}