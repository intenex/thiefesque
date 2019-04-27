// all available exports at bottom of this file https://github.com/ondras/rot.js/blob/master/dist/rot.js
// import { Display } from 'rot-js'; // object destructuring love it def keep getting way more into all of this for sure. Weird that you couldn't import an entire object like this though though this worked for specific imports
// const ROT = require('rot-js'); // old deprecated syntax love it
import * as ROT from 'rot-js'; // right make sense you forgot the aliasing that is necessary if things aren't named and there are multiple exports you have to name it yourself as an alias lucky to be able to just figure all this out as you go though for sure keep pushing at all of this for sure let's do this thing

class Game {
    constructor() {
        this.display = new ROT.Display(); // holy shit this works reading the source is always a winning strategy wow
        this.map = {}; // this is just the POJO that will store all the map data insane damn Rot.JS is powerful amazing
    }

    init() {
        document.body.appendChild(this.display.getContainer());
    }

    _generateMap() {
        const digger = new ROT.Map.Digger();

        function digCallback(x, y, value) {
            if (value) { return; } // do not store walls

            const key = x + "," + y;
            this.map[key] = "."; // ah if this is in strict mode this will be undefined gotcha if not strict mode it'll be on global or window or something right look into this more
        }
        digger.create(digCallback.bind(this)); // this should just generate the whole map amazing and store as keys strings of the location on the map "x,y" // damn the rot.js tutorial is great in explaining some basics of JS as it goes so cool
    }

    _drawWholeMap() {
        for (const key in this.map) {
            const parts = key.split(","); // right keys are just x and y coordinates in a string joined with a ','
            const x = parseInt(parts[0]); // getting the actual x and y dope there should be an object deconstruction way of doing this I think pretty sure ah well
            const y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]); // ah amazing the draw function takes in an x and y coordinate integer and the visual representation of each map tile is stored as the value to each key in the this.map POJO love it so lucky to be able to read all this and understand it can't wait to keep pushing with this holy shit it's awesome
        }
    }
}

export default Game;