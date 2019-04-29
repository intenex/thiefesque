import * as ROT from 'rot-js';
import Game from './game';

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

startScreen.handleInput = e => {
  if (e.keyCode === ROT.VK_RETURN) {
    
  }
};

