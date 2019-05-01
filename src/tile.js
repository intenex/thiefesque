import Glyph from './glyph';

// right there should basically be singleton tiles awesome and you instantiate those just here? Interesting
// right their design is to namespace everything to Game instead of having it be global
// which is interesting and possibly the best JS could do in the past. Totally nuts though
// So lucky to have ES6 now can't wait to keep building with it

export class Tile extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.walkable = properties.isWalkable || false;
    this.diggable = properties.isDiggable || false;
  }

  isWalkable() {
    return this.walkable;
  }

  isDiggable() {
    return this.diggable;
  }
}

export const nullTile = new Tile();
export const floorTile = new Tile({character: '.',
                                   walkable: true});
export const wallTile = new Tile({character: '#',
                                  foreground: 'goldenrod',
                                  diggable: true});