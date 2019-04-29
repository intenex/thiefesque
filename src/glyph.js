class Glyph {
  constructor(chr = ' ', foreground = 'white', background = 'black') {
    this.char = chr;
    this.foreground = foreground;
    this.background = background;
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