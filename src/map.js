import * as TILES from './tile';

// yeah okay this is actually pretty good design

class Map {
  constructor(tiles) {
    this.tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of the tiles array
    this.width = tiles.length; // ah right all the columns makes sense dope a 2D array of tiles
    this.height = tiles[0].length; // a single column of all the rows
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }
}