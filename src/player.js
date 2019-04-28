import Game from "./game";

class Player {
  constructor(x, y, game) {
    this._x = x;
    this._y = y;
    this.game = game;
    this._draw()
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
    keyMap[76] = 6; // K
    keyMap[73] = 7; // I
  }
}

export default Player;