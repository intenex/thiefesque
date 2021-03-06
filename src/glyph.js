export default class Glyph {
  constructor(properties = {}) {
    this.char = properties.character || ' '; // interesting the linter tells you to use dot notation over bracket hmm
    this.foreground = properties.foreground || 'white';
    this.background = properties.blackground || 'black';
  }

  getChar() {
    return this.char;
  }

  getForeground() {
    return this.foreground;
  }

  getBackground() {
    return this.background;
  }

  getRepresentation() { // shows the colored representation of a glyph
    return `%c{${this.foreground}}%b{${this.background}}${this.char}%c{white}%b{black}`;
  }
}