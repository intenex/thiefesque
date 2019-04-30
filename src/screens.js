import * as ROT from 'rot-js';

/* amazing screen management so great
rough interface: enter(), exit(), render(display), handleInput(inputType, inputData) */

export class Screen {
  constructor(screen_type, game) {
    this.screen_type = screen_type;
  }

  enter() {
    console.log(`Entered ${this.screen_type} screen.`);
  }

  exit() {
    console.log(`Exited ${this.screen_type} screen.`);
  }
}

export const startScreen = new Screen("start");

startScreen.render = display => {
  // Render prompt to the screen
  display.drawText(1, 1, "%c{yellow}Javascript Roguelike"); // must be some regex for them to read strings like this interesting
  display.drawText(1, 2, "Press [Enter] to start!");
};

// ah hmm bind this later to the actual game object try it lol that might just work
// damn the problem is the binding isn't working here still hmm. but man everything else works incredible lol
// right fucking arrow functions have no scope and can't be bound god damn it lol
startScreen.handleEvent = function(e) { // okay triggering is working fine great
  if (e.keyCode === ROT.KEYS.VK_SPACE || e.keyCode === ROT.KEYS.VK_RETURN) {
    this.switchScreen(this.screens.playScreen);
  }
};

export const playScreen = new Screen("play"); // at least you know this export style is working amazing to remember it all

// playScreen.map = null; // pretty sure unnecessary man JS is great

playScreen.render = display => {
  display.drawText(3, 5, "%c{red}%b{white}This game is so much fun!");
  display.drawText(4, 6, "Press [Enter] to win, or [Esc] to lose!");
};

playScreen.handleEvent = function(e) {
  if (e.keyCode === ROT.KEYS.VK_SPACE || e.keyCode === ROT.KEYS.VK_RETURN) { // this doesn't exist lol hmm look into this more
    this.switchScreen(this.screens.winScreen);
  } else if (e.keyCode === ROT.KEYS.VK_ESCAPE) { // ah that's nice shorthand for keycodes brilliant from ROT actually they don't work lol hilarious deprecated makes sense
    this.switchScreen(this.screens.loseScreen);
  }
};

export const winScreen = new Screen("win");

winScreen.render = display => {
  // Render prompt to the screen
  for (let i = 0; i < 22; i ++) {
    const r = Math.round(Math.random() * 255); // hah love it exactly what you wanted to make earlier
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    const background = ROT.Color.toRGB([r, g, b]); // ooh what does this do ROT has such crazy general helper methods man really impressive this guy knew them all that's huge for sure not the best designed game but super knowledgable about using the library whenever applicable which is huge
    display.drawText(2, i + 1, `%b{${background}}You win!`); // ah %b for background and %c for color love it
  }
};

winScreen.handleEvent = e => {};

export const loseScreen = new Screen("lose");

loseScreen.render = display => {
  for (let i = 0; i < 22; i++) {
    display.drawText(2, i + 1, "%b{red}You lose! :(");
  }
};

loseScreen.handleEvent = e => {};