import Glyph from './glyph';

export default class Item extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.name = properties.name || '';
  }
}