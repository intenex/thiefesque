// all available exports at bottom of this file https://github.com/ondras/rot.js/blob/master/dist/rot.js
// import { Display } from 'rot-js'; // object destructuring love it def keep getting way more into all of this for sure. Weird that you couldn't import an entire object like this though though this worked for specific imports
// const ROT = require('rot-js'); // old deprecated syntax love it
import * as ROT from 'rot-js'; // right make sense you forgot the aliasing that is necessary if things aren't named and there are multiple exports you have to name it yourself as an alias lucky to be able to just figure all this out as you go though for sure keep pushing at all of this for sure let's do this thing
import Player from './player'; // holy jesus fuck it just automatically fucking imported this

class Game {
    constructor() {
        this.display = new ROT.Display(); // holy shit this works reading the source is always a winning strategy wow
        this.map = {}; // this is just the POJO that will store all the map data insane damn Rot.JS is powerful amazing
        this.player = null; // fairly certain this is unnecessary but confirm later
        this.engine = null;
    }

    init() {
        document.body.appendChild(this.display.getContainer());
        this._generateMap();
        const scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);
        this.engine = new ROT.Engine(scheduler);
        this.engine.start(); // oh wow this engine is fantastic basically rot's engine is turn based as is every roguelike it just appears that everyone acts all at the same time but really every character has a move on every turn and everything else is locked while a certain actor moves amazing. Any JS object with an 'act' method is an actor amazing
    }

    _generateMap() {
        const digger = new ROT.Map.Digger();
        const freeCells = [];

        function digCallback(x, y, value) {
            if (value) { return; } // do not store walls

            const key = x + "," + y;
            freeCells.push(key);
            this.map[key] = "."; // ahhh interesting this is basically saying map a dot to every square that isn't a wall interesting // ah if this is in strict mode this will be undefined gotcha if not strict mode it'll be on global or window or something right look into this more
        }
        digger.create(digCallback.bind(this)); // this should just generate the whole map amazing and store as keys strings of the location on the map "x,y" // damn the rot.js tutorial is great in explaining some basics of JS as it goes so cool
        this._generateBoxes(freeCells);
        this._createPlayer(freeCells);
        this._drawWholeMap();
    }

    _generateBoxes(freeCells) {
        for (let i=0; i < 10; i++) { // amazing right ten boxes so incredible man can't wait to do this thing holy cow
            const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            const key = freeCells.splice(index, 1)[0]; // ah yeah freeCells is an array storing all the keys, the random index gets you a number to be the starting index to look for in freeCells dope. THis is ten or fewer boxes since duplicates are possible here
            this.map[key] = "*";
        }
    }

    _createPlayer(freeCells) {
        const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
        const key = freeCells.splice(index, 1)[0];
        const parts = key.split(",");
        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        this.player = new Player(x, y, this); // passing itself in as the game object right
    }

    _drawWholeMap() {
        for (const key in this.map) { // iterates over every single key in the object this.map amazing
            const parts = key.split(","); // right keys are just x and y coordinates in a string joined with a ','
            const x = parseInt(parts[0]); // getting the actual x and y dope there should be an object deconstruction way of doing this I think pretty sure ah well
            const y = parseInt(parts[1]);
            this.display.draw(x, y, this.map[key]); // ah amazing the draw function takes in an x and y coordinate integer and the visual representation of each map tile is stored as the value to each key in the this.map POJO love it so lucky to be able to read all this and understand it can't wait to keep pushing with this holy shit it's awesome
        }
    }
}

export default Game;