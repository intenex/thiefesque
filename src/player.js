import * as ROT from 'rot-js';

class Player {
  constructor(x, y, game) {
    this._x = x;
    this._y = y;
    this.game = game;
    this._draw();
  }

  _draw() {
    this.game.display.draw(this._x, this._y, "@", "#ff0"); // pretty amazing that you can draw colors like this so there's color support fantastic
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

    if (code === 13 || code === 32) { // enter or spacebar triggers checking a box to see if there's an anana --> oh brilliant so smart you can end the game with just Game.engine.lock(); man cannot WAIT to build this thing
      this._checkBox();
      return;
    }

    if (!(code in keyMap)) { return; } // if the code key is not in the object keyMap then just return it invalid input

    const diff = ROT.DIRS[8][keyMap[code]]; // keying into the 8 key option of offsets love it this returns an array of two position offsets x and y
    const newX = this._x + diff[0];
    const newY = this._y + diff[1];

    const newKey = newX + "," + newY;
    if (!(newKey in this.game.map)) { return; } // if the new position isn't in the game map then you can't move there dope and the map only holds open spaces right thanks to the way the map drawing was made amazing

    // the actual move consists of redrawing the old position and redrawing the new position love it

    this.game.display.draw(this._x, this._y, this.game.map[this._x + "," + this._y]); // this redraws the tile the player is moving from (which hasn't been changed yet to the new X and Y coordinates) with the actual map tile from the stored map (currently either a . or a * for a box)
    this._x = newX;
    this._y = newY;
    this._draw();
    window.removeEventListener("keydown", this);
    this.game.engine.unlock();
  }


}

export default Player;