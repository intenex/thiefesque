class Glyph {
  constructor(properties = {character: ' ', foreground: 'white', background: 'black'}) {
    this.char = properties.character || ' '; // interesting the linter tells you to use dot notation over bracket hmm
    this.foreground = properties.foreground || 'white'; // need these defaults now since the entire object won't exist and will be replaced if anything in it is replaced
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
}

export default Glyph;