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
startScreen.handleInput = e => {
  if (e.keyCode === ROT.VK_RETURN) {
    this.switchScreen(this.screens.playScreen);
  }
};

export const playScreen = new Screen("play");

playScreen.render = display => {
  display.drawText(3, 5, "%c{red}%b{white}This game is so much fun!");
  display.drawText(4, 6, "Press [Enter] to win, or [Esc] to lose!");
};

playScreen.handleInput = e => {
  if (e.keyCode === ROT.VK_RETURN) {
    this.switchScreen(this.screens.winScreen);
  } else if (e.keyCode === ROT.VK_ESCAPE) { // ah that's nice shorthand for keycodes brilliant
    this.switchScreen(this.screens.loseScreen);
  }
};

export const wingScreen = new Screen("win");