import defaults from 'lodash/defaults'; // // lodash is god // crazy syntax wow look into this more
import Glyph from './glyph';

// the basic prototype for everything in the game, from creatures to the player to items
// consists of a glyph and a position and a name, the basic building blocks for representation

export class Entity extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.name = properties.name || '';
    this.x = properties.x || 0;
    this.y = properties.y || 0;

    // allow for some mixin functionality
    this.attachedMixins = {};
    this.attachedMixinGroups = {}; // specifies having some general class of functionality like movement of some sort, regardless of the specific type of movement implemented
    const mixins = properties.mixins || []; // get all the mixins if any
    mixins.forEach(function(mixin) {
      defaults(this, mixin); // add all the properties of each mixin into the object at hand but use lodash's defaults which doesn't overwrite any existing properties which is a big no no here
      this.attachedMixins[mixin.name] = true; // add the mixin to the list of all attached mixins so you can check for inclusion of a specific mixin later just by name or by passing in the object entirely with some nice metaprogramming magic
      if (mixin.groupName) { // if a mixin belongs to a group/class of similar mixins and has a name, add it here
        this.attachedMixinGroups[mixin.groupName] = true;
      }
      if (mixin.init) {
        mixin.init.call(this, properties); // hopefully this has access to properties in scope let's find out otherwise just do a normal for loop or define this function elsewhere separately, almost certain it should have access though since the function is defined here in the right scope even if passed in as a callback later that's how closures should work // call is just an immediate bind (or a bind is an immediate call), you pass in the object the 'this' scope should be and then the arguments to pass in to the call function so awesome
      }
    }.bind(this)); // bind this anonymous function to the object at hand so you have access to its scope in assigning the mixins
  }

  setMap(map) {
    this.map = map;
  }

  getMap() {
    return this.map;
  }

  // setter for name dope
  setName(name) {
    this.name = name;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  getName() {
    return this.name;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  hasMixin(obj) {
    // check if obj or name as a string was passed in
    if (typeof obj === 'object') {
      return this.attachedMixins[obj.name]; // this is a bool that returns either true or undefined (aka false)
    } else {
      return this.attachedMixins[name]; // if typeof obj === 'string' since string is a primitive so dope
    }
  }
}

// entity mixin
export const Moveable = {
  name: 'Moveable',
  tryMove(x, y, map) { // don't even have to fucking define the attribute name for this JS is so nuts so lucky to have learned all of this
    const tile = map.getTile(x, y);
    // Check if you can walk onto the tile and if so walk onto it
    if (tile.isWalkable()) {
      // update entity positoin
      this.x = x;
      this.y = y;
      return true;
      // check if the tile is diggable and if so, try to dig it
    } else if (tile.isDiggable()) {
      map.dig(x, y);
      return true;
    }
    return false;
  }
};