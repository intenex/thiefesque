
// makes all the tiles for a given map
class Builder {
  constructor(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.tiles = new Array(depth); // look into if this is necessary or not
    this.regions = new Array(depth);
  }

  generateLevel() {
    // create empty map, better way of doing it hmm see if this is necessary at all
    const map = new Array(this.width);
    for (let w = 0; w < this.width; w++) {
      map[w] = new Array(this.height);
    }
    // Setup the map generator, using Map.Digger for the Tyrant algo vs the Map.Cellular option used by the tutorial as this one leads to more natural cavelike patterns versus man-made dungeons and also possibly leads to dead ends which are not great
    const generator = new ROT.Map.Digger(mapWidth, mapHeight);
    const generatorCB = (x, y, v) => { // making this an arrow function so you don't have to bind the scope here it automatically should have access to the scope here love it
      if (v) { // if v is true, meaning 1, then this is a wall tile. The Map generators return 1 and 0 generally to distinguish these two characteristics
        map[x][y] = TILES.wallTile;
      } else { // if v is false, meaning 0 (since 0 equals false in JS lol), then this is a floor tile
        map[x][y] = TILES.floorTile;
      }
    };
    generator.create(generatorCB);
  }
}

export default Builder;