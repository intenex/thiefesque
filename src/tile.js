import Glyph from './glyph';

// right there should basically be singleton tiles awesome and you instantiate those just here? Interesting
// right their design is to namespace everything to Game instead of having it be global
// which is interesting and possibly the best JS could do in the past. Totally nuts though
// So lucky to have ES6 now can't wait to keep building with it

export class Tile extends Glyph {
  constructor(properties = { character: ' ', foreground: 'white', background: 'black' }) {
    properties.character = properties.character || ' '; // have to set these as defaults so that every object has at least these attributes if it's passed in without them
    properties.foreground = properties.foreground || 'white';
    properties.background = properties.background || 'black';
    super(properties); // call Glyph super with this love it
    this.isWalkable = properties.isWalkable || false;
    this.isDiggable = properties.isDiggable || false;
  }

  isWalkable() {
    return this.isWalkable;
  }

  isDiggable() {
    return this.isDiggable;
  }
}

export const nullTile = new Tile();
export const floorTile = new Tile({character: '.',
                                   isWalkable: true});
export const wallTile = new Tile({character: '#',
                                  foreground: 'goldenrod',
                                  isDiggable: true});