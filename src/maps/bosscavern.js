import Map from './../map';
import * as TILES from './../tile';

export default class BossCavern extends Map {
  constructor() {
    super(this.generateTiles(80, 40));
  }

  fillCircle(tiles, centerX, centerY, radius, tile) {
    // Copied from the DrawFilledCircle algorithm
    // http://stackoverflow.com/questions/1201200/fast-algorithm-for-drawing-filled-circles
    // http://en.wikipedia.org/wiki/Midpoint_circle_algorithm
    // okay this you did not really look into or understand definitely read more about this when you have internet and learn what it's doing, but you get the basic idea - the tile is the floor tile, and you're filling the entire circle with floor tiles, with the map passed in being all wall tiles to begin with
    let x = radius;
    let y = 0;
    let xChange = 1 - (radius << 1); // yeah def look into this more later lol // what the fuck is this shovel operator lol look into this more
    let yChange = 0;
    let radiusError = 0;

    while (x >= y) {
      for (let i = centerX - x; i <= centerX + x; i++) {
        tiles[i][centerY + y] = tile; // ah yes you are given a whole array and you just mutate what you're passed directly instead of returning anything nuts should make this function more pure hmm do a deep dup with merge or something, eh actually nah this is just like Object.assign() or something it mutates the first argument passed in hmm
        tiles[i][centerY - y] = tile;
      }
      for (let i = centerX - y; i <= centerX + y; i++) {
        tiles[i][centerY + x] = tile;
        tiles[i][centerY - x] = tile;
      }

      y++;
      radiusError += yChange;
      yChange += 2;
      if (((radiusError << 1) + xChange) > 0) {
        x--;
        radiusError += xChange;
        xChange += 2;
      }
    }
  }

  generateTiles(width, height) {
    // create the array of wall tiles
    const tiles = [];
    for (let x = 0; x < width; x++) {
      tiles[x] = [];
      for (let y = 0; y < height; y++) {
        tiles[x][y] = TILES.wallTile;
      }
    }
  }
}