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
}

export default Player;