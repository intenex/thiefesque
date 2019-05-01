import defaults from 'lodash/defaults'; // crazy syntax wow look into this more
// lodash is god

// the basic prototype for everything in the game, from creatures to the player to items
// consists of a glyph and a position and a name, the basic building blocks for representation

class Entity extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.name = properties.name || '';
    this.x = properties.x || 0;
    this.y = properties.y || 0;

    // allow for some mixin functionality
    this.attachedMixins = {};
    const mixins = properties.mixins || []; // get all the mixins if any
    mixins.forEach(function(mixin) {
      defaults(this, mixin); // add all the properties of each mixin into the object at hand but use lodash's defaults which doesn't overwrite any existing properties which is a big no no here
      this.attachedMixins[mixin.name] = true; // add the mixin
      if (mixin.init) {
        mixin.init.call(this, properties); // call is just an immediate bind (or a bind is an immediate call), you pass in the object the 'this' scope should be and then the arguments to pass in to the call function so awesome
      }
    }.bind(this)); // bind this anonymous function to the object at hand so you have access to its scope in assigning the mixins
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
}

export default Entity;