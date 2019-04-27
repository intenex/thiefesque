// all available exports at bottom of this file https://github.com/ondras/rot.js/blob/master/dist/rot.js
// import { Display } from 'rot-js'; // object destructuring love it def keep getting way more into all of this for sure. Weird that you couldn't import an entire object like this though though this worked for specific imports
// const ROT = require('rot-js'); // old deprecated syntax love it
import * as ROT from 'rot-js'; // right make sense you forgot the aliasing that is necessary if things aren't named and there are multiple exports you have to name it yourself as an alias lucky to be able to just figure all this out as you go though for sure keep pushing at all of this for sure let's do this thing

class Game {
    constructor() {
        this.display = new ROT.Display(); // holy shit this works reading the source is always a winning strategy wow
        this.map = {};
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
        digger.create(digCallback.bind(this));
    }
}

export default Game;