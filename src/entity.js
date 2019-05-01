// the basic prototype for everything in the game, from creatures to the player to items
// consists of a glyph and a position and a name, the basic building blocks for representation

class Entity extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.name = properties.name || '';
    this.x = properties.x || 0;
    this.y = peroperties.y || 0;
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