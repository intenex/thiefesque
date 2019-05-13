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
      tiles[x] = []; // or tiles.push([]);
      for (let y = 0; y < height; y++) {
        tiles[x][y] = TILES.wallTile; // or tiles[x].push(TILES.wallTile);
      }
    }

    // determine radius of the cave to carve it out
    const radius = (Math.min(width, height) - 2) / 2; // unclear on the -2 thing but whatever lol, ofc you want to halve it as the radius and not the diameter though, -2 just to give some edging between the outside of the wall and the cave floor right
    this.fillCircle(tiles, width / 2, height / 2,radius, TILES.floorTile);

    // randomly create 3-6 lakes
    const lakes = Math.round(Math.random() * 3) + 3;
    

  }
}