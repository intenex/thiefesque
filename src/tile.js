import Glyph from './glyph';

// right there should basically be singleton tiles awesome and you instantiate those just here? Interesting
// right their design is to namespace everything to Game instead of having it be global
// which is interesting and possibly the best JS could do in the past. Totally nuts though
// So lucky to have ES6 now can't wait to keep building with it

export class Tile extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.walkable = properties.walkable || false;
    this.diggable = properties.diggable || false;
  }

  isWalkable() {
    return this.walkable;
  }

  isDiggable() {
    return this.diggable;
  }

  getNeighborPositions(x, y) {
    const tiles = [];
    // generate all possible offsets
    for (let dX = -1; dX < 2; dX ++) {
      for (let dY = -1; dY < 2; dY++) {
        // Make sure not the tile we're starting from
        if (dX === 0 && dY === 0) {
          continue; // fucking love this def keep learning all of these
        }
        tiles.push({x: x + dX, y: y + dY});
      }
    }
    return tiles.randomize(); // this function does not exist you need to build it or find it in the ROT.JS library ideally under UTILS put UTILS in the window space and look through all its methods or something
  }
}

export const nullTile = new Tile();
export const floorTile = new Tile({
  character: '.',
  walkable: true
});
export const wallTile = new Tile({
  character: '#',
  foreground: 'goldenrod',
  diggable: true
});
export const stairsUpTile = new Tile({
  character: '<',
  foreground: 'white',
  isWalkable: true
});
export const stairsDownTile = new Tile({
  character: '>',
  foreground: 'white',
  isWalkable: true
});