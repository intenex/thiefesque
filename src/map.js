import * as ROT from 'rot-js';
import * as TILES from './tile';

// yeah okay this is actually pretty good design love it

class Map {
  constructor(tiles) {
    this.tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of the tiles array
    this.width = tiles.length; // ah right all the columns makes sense dope a 2D array of tiles
    this.height = tiles[0].length; // a single column of all the rows
    this.entities = []; // keep track of all entities on a given map in a list
    this.scheduler = new ROT.Scheduler.Simple();
    this.engine = new ROT.Engine(this.scheduler);
  }

  getEngine() {
    return this.engine;
  }

  getEntities() {
    return this.entities;
  }

  getEntityAt(x, y) {
    // Iterate through all entities searching for one with the matching position hmmmm should be stored in some hash format for better searching then
    for (let i = 0; i < this.entities.length; i++) {
      if (this.entities[i].getX() === x && this.entities[i].getY() === y) {
        return this.entities[i];
      }
    }
    return false;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  // get the tile for a given coordinate set
  getTile(x, y) {
    // Make sure you're inside bounds. If not, return the null tile, right this Null Object pattern allows you to be able to treat all tiles the same even if they don't exist instead of separately having to do null checks all the time
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return TILES.nullTile;
    } else {
      return this.tiles[x][y] || TILES.nullTile; // if you're to do this why have a bounds check at all it'll just be undefined anyway sigh
    }
  }

  dig(x, y) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y).isDiggable()) {
      this.tiles[x][y] = TILES.floorTile;
    }
  }

  // to get the random starting position for the player so great heh
  getRandomFloorPosition() {
    // Randomly identify a tile that's a floor tile lol definitely a better way to do this but whatever
    let x, y;
    do {
      x = Math.floor(Math.random() * this.width);
      y = Math.floor(Math.random() * this.width);
    } while(this.getTile(x, y) != TILES.floorTile);
    return {x, y}; // JS is magic and will literally just translate this to {x: x, y: y}
  }
}

export default Map;