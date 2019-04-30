import Glyph from './glyph';

// right there should basically be singleton tiles awesome and you instantiate those just here? Interesting
// right their design is to namespace everything to Game instead of having it be global
// which is interesting and possibly the best JS could do in the past. Totally nuts though
// So lucky to have ES6 now can't wait to keep building with it

export class Tile extends Glyph {
  constructor(glyph) {
    this.glyph = glyph;
  }

}

export const nullTile = new Tile(new Glyph());
export const floorTile = new Tile(new Glyph({character: '.'}));
export const wallTile = new Tile(new Glyph({character: '#',
                                            foreground: 'goldenrod',
                                            isDiggable: true}));