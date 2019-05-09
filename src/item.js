import Glyph from './glyph';

class Item extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.name = properties.name || '';
  }
}

export default Item;