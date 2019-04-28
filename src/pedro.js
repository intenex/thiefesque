import * as ROT from 'rot-js';

class Pedro {
  constructor(x, y, game) {
    this._x = x;
    this._y = y;
    this.game = game;
    this._draw();
  }

  _draw() {
    this.game.display.draw(this._x, this._y, "P", "red");
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
      this.game.display.draw(this._x, this._y, this.game.map[this._x + "," + this._y]);
      this._x = path[0][0];
      this._y = path[0][1];
      this._draw();
    }
  }
}

export default Pedro;