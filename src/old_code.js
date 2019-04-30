/*

// === game.js ===

// constructor() {} code

  // this._drawText();
  // this._generateMap();
  // const scheduler = new ROT.Scheduler.Simple();
  // scheduler.add(this.player, true);
  // scheduler.add(this.pedro, true); // amazing the engine will now go in turn of all the creatures in the scheduler totally incredible
  // this.engine = new ROT.Engine(scheduler);
  // this.engine.start(); // oh wow this engine is fantastic basically rot's engine is turn based as is every roguelike it just appears that everyone acts all at the same time but really every character has a move on every turn and everything else is locked while a certain actor moves amazing. Any JS object with an 'act' method is an actor amazing

// must bind this to the right this in the constructor function (.bind(this)); so great to understand everything that's key for sure
bindEventToScreen(event) { // so lucky to really understand 'this' better now and scoping and all that in JS so lucky to really get JS and be writing it now man such a great language tbh lol can't fucking wait to do this all so lucky that Mai wants to learn how to code so fucking great
  window.addEventListener(event, this.currentScreen); // short hand refactoring you can pass in an object and screens are objects with handleInput methods and it's passed the event yeah wow this is really poorly written lmao
}

_drawText() {
  for (let i = 0; i < 15; i++) {
    // Calculate foreground color, getting progressively darker
    // and the backgroudn color, getting progressively lighter so great
    const foreground = ROT.Color.toRGB([255 - (i * 0), // bc block scoped you can declare them all each time instead of having to do it once before the function love it if function scoped it wouldn't fly
    255 - (i * 20),
    255 - (i * 10)]);
    const background = ROT.Color.toRGB([i * 10, i * 20, i * 30]);
    const colors = `%c{${foreground}}%b{${background}}`;
    this.getDisplay().drawText(30, 25 + i, colors + "Hello, world!");
  }
}

_generateMap() {
  const digger = new ROT.Map.Digger(80, 40); // right you can leave this empty and it'll default presumably to 80 and 24 love it
  const freeCells = [];

  function digCallback(x, y, value) {
    if (value) { return; } // do not store walls

    const key = x + "," + y; // yeah the 2D array method is way better than this lol
    freeCells.push(key);
    this.map[key] = "."; // ahhh interesting this is basically saying map a dot to every square that isn't a wall interesting // ah if this is in strict mode this will be undefined gotcha if not strict mode it'll be on global or window or something right look into this more
  }
  digger.create(digCallback.bind(this)); // this should just generate the whole map amazing and store as keys strings of the location on the map "x,y" // damn the rot.js tutorial is great in explaining some basics of JS as it goes so cool
  this._generateBoxes(freeCells);
  this._drawWholeMap();
  this.player = this._createBeing(Player, freeCells); // need to call this after the map is already drawn since this thing's initialization function is what draws it on the first rendition so fucking amazing
  this.pedro = this._createBeing(Pedro, freeCells);
}

_generateBoxes(freeCells) {
  for (let i = 0; i < 10; i++) { // amazing right ten boxes so incredible man can't wait to do this thing holy cow
    const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
    const key = freeCells.splice(index, 1)[0]; // ah yeah freeCells is an array storing all the keys, the random index gets you a number to be the starting index to look for in freeCells dope. THis is ten or fewer boxes since duplicates are possible here
    this.map[key] = "*"; // god damn the JS linter is so fucking good
    if (!i) { this.ananas = key; } // right because 0 is falsey in JS amazing
  }
}

_createBeing(being, freeCells) {
  const index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
  const key = freeCells.splice(index, 1)[0];
  const parts = key.split(",");
  const x = parseInt(parts[0]);
  const y = parseInt(parts[1]);
  return new being(x, y, this); // what the fuck can't believe you can literally just fucking reference the constructor function like this jesus so many cool things to learn // passing itself in as the game object right
}

_drawWholeMap() {
  for (const key in this.map) { // iterates over every single key in the object this.map amazing
    const parts = key.split(","); // right keys are just x and y coordinates in a string joined with a ','
    const x = parseInt(parts[0]); // getting the actual x and y dope there should be an object deconstruction way of doing this I think pretty sure ah well
    const y = parseInt(parts[1]);
    this.getDisplay().draw(x, y, this.map[key]); // ah amazing the draw function takes in an x and y coordinate integer and the visual representation of each map tile is stored as the value to each key in the this.map POJO love it so lucky to be able to read all this and understand it can't wait to keep pushing with this holy shit it's awesome
  }
}

// === player.js ===

import { DIRS } from 'rot-js';

class Player {
  constructor(x, y, game) {
    this._x = x;
    this._y = y;
    this.game = game;
    this._draw();
  }

  getX() { // public reader methods needed for Pedro to know where the player is fantastic
    return this._x;
  }

  getY() {
    return this._y;
  }

  _draw() {
    this.game.getDisplay().draw(this._x, this._y, "@", "#ff0"); // pretty amazing that you can draw colors like this so there's color support fantastic
  }

  act() {
    this.game.engine.lock(); // wait for user input; do stuff when the user hits a key
    window.addEventListener("keydown", this); // whoah wtf this is an amazing way of handling event handlers -- pass an object as the callback function to the addEventListener call, and then that object must have a handleEvent() method which is then invoked when the event is triggered insane amazing wow
  }

  handleEvent(e) {
    // this is automatically triggered by JS when passed this object as the callback to a triggered event handler amazing
    const keyMap = {};
    // these are the keycodes to get lol https://keycode.info/
    // the ROT DIRS in order for an 8 direction showing with no 0, 0 middle key makes great sense love it
    // 8: [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]],
    // oh damn it they start clockwise from the top lol shit
    keyMap[79] = 0; // the O key, the 8 keys are OP;/.,KI in that order
    keyMap[80] = 1; // P
    keyMap[186] = 2; // ;
    keyMap[191] = 3; // /
    keyMap[190] = 4; // .
    keyMap[188] = 5; // ,
    keyMap[75] = 6; // K
    keyMap[73] = 7; // I

    const code = e.keyCode;

    // removing this functionality
    // if (code === 13 || code === 32) { // enter or spacebar triggers checking a box to see if there's an anana --> oh brilliant so smart you can end the game with just Game.engine.lock(); man cannot WAIT to build this thing
    //   this._checkBox();
    //   return;
    // }

    if (!(code in keyMap)) { return; } // if the code key is not in the object keyMap then just return it invalid input

    const diff = DIRS[8][keyMap[code]]; // keying into the 8 key option of offsets love it this returns an array of two position offsets x and y
    const newX = this._x + diff[0];
    const newY = this._y + diff[1];

    const newKey = newX + "," + newY;
    if (!(newKey in this.game.map)) { return; } // if the new position isn't in the game map then you can't move there dope and the map only holds open spaces right thanks to the way the map drawing was made amazing

    // the actual move consists of redrawing the old position and redrawing the new position love it

    this.game.getDisplay().draw(this._x, this._y, this.game.map[this._x + "," + this._y]); // this redraws the tile the player is moving from (which hasn't been changed yet to the new X and Y coordinates) with the actual map tile from the stored map (currently either a . or a * for a box)
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    this.game.engine.unlock();
  }

  _checkBox() {
    const key = this._x + "," + this._y;
    if (this.game.map[key] != "*") {
      alert("There is no box here!");
    } else if (key === this.game.ananas) {
      alert("Hooray! You found an ananas and won this game.");
      const keymap = [79, 80, 186, 191, 190, 188, 75, 73];
      // okay this victory dance does not work lol oh well look into it and why await isn't working correctly more later
      // keymap.forEach(async function(val, idx) { // a random clockwise victory dance lol
      //   const e = { keyCode: val }; // emulate an event object lmao
      //   this.game.engine.lock(); // just in case trying to unlock it when it's not locked causes some issue
      //   await this._sleep(2000); // oh right because it's a promise that executes only once right it returns the same thing each time it's called somehow no hmm
      //   alert(`iteration ${idx}`);
      //   this.handleEvent(e);
      // }.bind(this));
      this.game.engine.lock(); // so fucking amazing you can literally end the game by just locking the engine which puts a synchronous blocking call that prevents anything else from happening until the engine is unlocked again amazing and thus if you lock it at the end without doing anything else the game is effectively frozen and over so great
      window.removeEventListener("keydown", this);
    } else {
      alert("This box is empty :-(");
    }
  }

  // remember promises and look into them way more so great
     promises are async callback chains and either resolve or reject
     await pauses the async until a promise resolves or rejects
     look into async functions too ahhh yes these functions literally
     mean one thing, which is that the function will always return a
     promise, even if it actually returns a non-promise value, that will
     be wrapped in a promise object look into how this works more
     oh interesting it's like explicitly returning Promise.resolve(1)
     if you return 1, it basically means whatever you return will be
     passed as the argument to the resolve function (the .then that is
     chained on. Remember that resolve and reject only take one argument
     right? fucking love it. https://javascript.info/async-await
     Man this shit is so fucking cool can't wait to just learn literally everything
     note that await only pauses the current async function hmmm)
     https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep 

  // _sleep(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms)); // promises are created with a single callback that takes up to two arguments, resolve and reject, that specifies what to run when the promise is instantiated --> as soon as the Promise is created this function is run and the resolve function will consequently be triggered --> there is no chained .then so there is no resolve function here I believe but anyway this works great because of await which is way better than just chaining a .then to run the handleEvent because if you did that the code would keep running and there would just be a one second delay before everything happened not before each new action love this let's see if it works :)
  // }

  // _pausecomp(ms) {
  //   const date = new Date();
  //   let curDate = null;
  //   do { curDate = new Date(); } // https://www.w3schools.com/jsref/jsref_dowhile.asp amazing super cool this always executes at least once
  //   while (curDate-date < ms);
  // }
}

export default Player;

// === pedro.js ===

import * as ROT from 'rot-js';

class Pedro {
  constructor(x, y, game) {
    this._x = x;
    this._y = y;
    this.game = game;
    this._draw();
  }

  _draw() {
    this.game.getDisplay().draw(this._x, this._y, "P", "red");
  }

  act() {
    const x = this.game.player.getX();
    const y = this.game.player.getY();
    function passableCallback(x, y) {
      return (x + "," + y in this.game.map); // ah this will return true or false depending on if the position passed in is in the Game.map amazing
    }
    const astar = new ROT.Path.AStar(x, y, passableCallback.bind(this), { topology: 4 }); // you instantiate a Path.AStar with a target x and y coordinate love it // this is totally amazing you pass it the x and y positions as to where you want to find a path to, the passableCallback returns true or false when passed x and y coordinates as to whether a given move is a valid move, and topology:4 means it can only move in 4 directions right vs 8. Interesting, look into the AStar algorithm for sure so great https://en.wikipedia.org/wiki/A*_search_algorithm

    const path = [];
    function pathCallback(x, y) {
      path.push([x, y]); // interesting closure capturing the free variable path defined in the scope above this function definition
    }
    astar.compute(this._x, this._y, pathCallback); // amazing this begins the pathfinding so incredible starting from the x and y passed in here and at every step of the pathfinding it'll call the callback and pass it the x and y of the next step in the path damn this library is straight up incredible

    path.shift(); // ah interesting the astar.compute always pushes the x and y passed in as the first position in the path array makes sense
    if (path.length === 1) {
      this.game.engine.lock();
      alert("Game over: you were captured by Pedro!");
    } else {
      this.game.getDisplay().draw(this._x, this._y, this.game.map[this._x + "," + this._y]);
      this._x = path[0][0];
      this._y = path[0][1];
      this._draw();
    }
  }
}

export default Pedro;

*/