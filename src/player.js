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

  /* remember promises and look into them way more so great
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
     https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep */

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