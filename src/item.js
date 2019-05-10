import DynamicGlyph from './dynamicglyph';

export default class Item extends DynamicGlyph {
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
    const prefix = 'aeiou'.includes(firstLetter) ? 1 : 0; // will return -1 if index not found in string love it
    return `${prefixes[prefix]} ${string}`;
  }
}