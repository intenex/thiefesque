import * as TILES from './tile';

// yeah okay this is actually pretty good design love it

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

  // get the tile for a given coordinate set
  getTile(x, y) {
    // Make sure you're inside bounds. If not, return the null tile, right this Null Object pattern allows you to be able to treat all tiles the same even if they don't exist instead of separately having to do null checks all the time
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return TILES.nullTile;
    } else {
      return this.tiles[x][y] || TILES.nullTile; // if you're to do this why have a bounds check at all it'll just be undefined anyway sigh
    }
  }
}