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
    this.blocksLight = (properties.blocksLight !== undefined) ? properties.blocksLight : true; // either the property is defined as true or false in which case use that property or set it to true by default // love ternaries exact same structure here dope and dope that they do triple equals here lol you really should just learn triple and double equals appropriately in each case instead of just blindly always using triple equals
  }

  isWalkable() {
    return this.walkable;
  }

  isDiggable() {
    return this.diggable;
  }

  isBlockingLight() {
    return this.blocksLight;
  }
}

export const nullTile = new Tile();
export const floorTile = new Tile({
  character: '.',
  walkable: true,
  blocksLight: false // nothing is magic everything works exactly as you define it in code so incredible and beautiful and so much abstracted away damn programming is so accessible these days it's so nuts so insanely grateful to get to do this or anything you really do have the best life in the world jesus fucking christ most of all to be able to appreciate it all
});
export const wallTile = new Tile({
  character: '#',
  foreground: 'goldenrod',
  diggable: true,
  blocksLight: true // might as well be explicit here no reason not to be to make things more clear
});
export const stairsUpTile = new Tile({
  character: '<',
  foreground: 'white',
  walkable: true,
  blocksLight: false
});
export const stairsDownTile = new Tile({
  character: '>',
  foreground: 'white',
  walkable: true,
  blocksLight: false
});
export const waterTile = new Tile({
  character: '~',
  foreground: 'blue',
  walkable: false,
  blocksLight: false
});
export const holeTile = new Tile({
  character: 'O',
  foreground: 'white',
  walkable: true,
  blocksLight: false
});