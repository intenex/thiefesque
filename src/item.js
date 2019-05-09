import Glyph from './glyph';

export default class Item extends Glyph {
  constructor(properties = {}) {
    super(properties);
    this.name = properties.name || '';
  }

  describe() {
    return this.name;
  }

  describeA(capitalize = false) {
    const prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    const string = this.describe();
    const firstLetter = string.charAt(0).toLowerCase();
    // if word starts with a vowel, use an, otherwise use a
    const prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0; // will return -1 if index not found in string love it
    return `${prefixes[prefix]} ${string}`;
  }
}