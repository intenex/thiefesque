import * as ROT from 'rot-js';
import * as TILES from './tile';
import Map from './map';
import { Entity, Entities } from './entity';

/* amazing screen management so great
rough interface: enter(), exit(), render(display), handleInput(inputType, inputData) */

export class Screen {
  constructor(screen_type) {
    this.screen_type = screen_type;
  }

  // placeholder events to be overwritten
  enter() {
    console.log(`Entered ${this.screen_type} screen.`);
  }

  exit() {
    console.log(`Exited ${this.screen_type} screen.`);
  }

  handleEvent(e) {}
}

export const startScreen = new Screen("start");

// refactor methods like this to have the optional arguments come second not first so you can actually just omit them and take advantage of Javascript's flexible argument functionality
startScreen.render = function(game, display) {
  // Render prompt to the screen
  display.drawText(1, 1, "%c{yellow}Welcome to Thiefesque. Feel free to dig around."); // must be some regex for them to read strings like this interesting
  display.drawText(1, 2, "Press [Enter] to start.");
};

// ah hmm bind this later to the actual game object try it lol that might just work
// damn the problem is the binding isn't working here still hmm. but man everything else works incredible lol
// right fucking arrow functions have no scope and can't be bound god damn it lol
startScreen.handleEvent = function(game, e) { // okay triggering is working fine great
  if (e.keyCode === ROT.KEYS.VK_SPACE || e.keyCode === ROT.KEYS.VK_RETURN) {
    game.switchScreen(game.screens.playScreen);
  }
};

export const playScreen = new Screen("play"); // at least you know this export style is working amazing to remember it all

// playScreen.map = null; // pretty sure unnecessary man JS is great

// insane how easy it is to put together a fully functioning game now and how powerful some libraries are man
playScreen.enter = function(game) {
  const map = [];
  // Create a map based on these size parameters fuck yeah
  const mapWidth = 100;
  const mapHeight = 100;
  for (let x = 0; x < mapWidth; x++) {
    // Create nested array for the y values
    map.push([]);
    // Add all the tiles
    for (let y = 0; y < mapHeight; y++) {
      map[x].push(TILES.nullTile); // start out with null tiles for each tile hmmm
    }
  }
  // Setup the map generator, using Map.Digger for the Tyrant algo vs the Map.Cellular option used by the tutorial as this one leads to more natural cavelike patterns versus man-made dungeons and also possibly leads to dead ends which are not great
  const generator = new ROT.Map.Digger(mapWidth, mapHeight);
  const generatorCB = (x, y, v) => { // making this an arrow function so you don't have to bind the scope here it automatically should have access to the scope here love it
    if (v) { // if v is true, meaning 1, then this is a wall tile. The Map generators return 1 and 0 generally to distinguish these two characteristics
      map[x][y] = TILES.wallTile;
    } else { // if v is false, meaning 0 (since 0 equals false in JS lol), then this is a floor tile
      map[x][y] = TILES.floorTile;
    }
  };
  generator.create(generatorCB);
  this.player = new Entity(Entities.PlayerTemplate, game);
  this.map = new Map(map, this.player); // this still refers to the playScreen object at this point in time since it'll be called method style
  this.map.getEngine().start();
};

playScreen.move = function(dX, dY, game) {
  const newX = this.player.getX() + dX;
  const newY = this.player.getY() + dY;
  // try to move to the new cell -- this function is what updates the player's x and y position now as it should be
  this.player.tryMove(newX, newY, this.map);
  game.refresh();
};

playScreen.render = function(game, display) { // amazing that most 'variables' are in fact constants and not variable at all lol
  const screenWidth = game.getScreenWidth(); // have a single source of truth for all numbers everything else references so there's never any confusion and refactoring to have a different number is incredibly easy great code guidance now actually loving this
  const screenHeight = game.getScreenHeight();
  // make sure the x-axis doesn't go out of bounds
  let topLeftX = Math.max(0, this.player.getX() - Math.floor(screenWidth/2)); // note that if the screenWidth doesn't happen to be even for some reason you'll need to floor this not to end up with some crazy non-integer number lol
  // make sure you can still fit the entire game screen
  topLeftX = Math.min(topLeftX, this.map.getWidth() - screenWidth); // this stops you from scrolling too far right, right makes perfect sense, basically the hard cap to the right is the width of the map minus the screen width, e.g. if the map is 100 squares and the screen width is 80 squares, then never let the topLeftX go beyond 100-80, or 20, even if they move past that, love it totally get it now so great. The check here is to see if the width of the map minus the screen width is *less* than the current x position, that's what the minimum check is for, basically ensuring that the x position never exceeds a certain maximum, so great
  let topLeftY = Math.max(0, this.player.getY() - Math.floor(screenHeight/2));
  topLeftY = Math.min(topLeftY, this.map.getHeight() - screenHeight);

  // Render all map cells
  for (let x = topLeftX; x < topLeftX + screenWidth; x++) { // yeah makes sense topleftX is the leftmost square to display -- display screenWidth worth of squares since that'll fill up the entire visual display love it
    for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
      // Fetch the glyph for the tile and render it to the screen so fucking great
      const tile = this.map.getTile(x, y) // right this gets a Tile object and each of those has a getGlyph method amazing
      display.draw( // ah thank god you pass in the display here otherwise no way to really do it can't have two bound thises love it --> but anyway you could solve this by passing arguments into .bind at call time which you did do above love it
          x - topLeftX, // right because you want these to always be constant to the screen position love it
          y - topLeftY,
          tile.getChar(), // love semicolons letting you do things correctly on multiple lines passing in 5 arguments here to draw interesting can do it multiple ways it appears with the %c and %b and as just straight up arguments here hmm
          tile.getForeground(),
          tile.getBackground()
      );
    }
  }
  // Render all entities
  const entities = this.map.getEntities();
  entities.forEach(entity => {
    // only render the entity if they would show up on the screen
    if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
        entity.getX() < topLeftX + screenWidth &&
        entity.getY() < topLeftY + screenHeight) {
        display.draw( // draw that motherfucker
            entity.getX() - topLeftX,
            entity.getY() - topLeftY,
            entity.getChar(),
            entity.getForeground(),
            entity.getBackground()
        );
    }
  });
};

playScreen.handleEvent = function(game, e) {
  switch(e.keyCode) { // omg cases will fall through until a break is found holy fuck that's amazing LOL
    case ROT.KEYS.VK_SPACE:
    case ROT.KEYS.VK_RETURN:
      game.switchScreen(game.screens.winScreen);
      break;
    case ROT.KEYS.VK_ESCAPE:
      game.switchScreen(game.screens.loseScreen);
      break;
    case ROT.KEYS.VK_O: // man fall through mapping is totally the best
    case ROT.KEYS.VK_W:
    case ROT.KEYS.VK_UP:
      this.move(0, -1, game); // nevermind had a stroke of brilliance using the native currying power of .bind to solve this fantastically love this life so much man // lmao jesus fuck you can't reference itself because you rewrote the this binding lmao OMG I KNOW WHAT TO DO LOL WITH BIND YOU CAN PASS IN YOUR OWN ARGUMENTS BRILLIANT
      this.map.getEngine().unlock();
      break;
    case ROT.KEYS.VK_P:
    case ROT.KEYS.VK_E:
      this.move(1, -1, game);
      this.map.getEngine().unlock();
      break; // now you understand why break statements are important too so great man adding so much functionality here fucking love it
    case 186: // the semicolon ';', sadly no VK mapping for it it seems but it does expose the underpinnings of the magic of it anyway to do it this way so this is nice
    case ROT.KEYS.VK_D:
    case ROT.KEYS.VK_RIGHT: // damn so fucking smart
      this.move(1, 0, game);
      this.map.getEngine().unlock();
      break;
    case ROT.KEYS.VK_SLASH:
    case ROT.KEYS.VK_C:
      this.move(1, 1, game);
      this.map.getEngine().unlock();
      break;
    case ROT.KEYS.VK_PERIOD:
    case ROT.KEYS.VK_X:
    case ROT.KEYS.VK_DOWN:
      this.move(0, 1, game);
      this.map.getEngine().unlock();
      break;
    case ROT.KEYS.VK_COMMA:
    case ROT.KEYS.VK_Z:
      this.move(-1, 1, game);
      this.map.getEngine().unlock();
      break;
    case ROT.KEYS.VK_K:
    case ROT.KEYS.VK_A:
    case ROT.KEYS.VK_LEFT:
      this.move(-1, 0, game);
      this.map.getEngine().unlock();
      break;
    case ROT.KEYS.VK_I:
    case ROT.KEYS.VK_Q:
      this.move(-1, -1, game);
      this.map.getEngine().unlock();
      break;
  }
};

export const winScreen = new Screen("win");

winScreen.render = function(game, display) {
  // Render prompt to the screen
  for (let i = 0; i < 22; i ++) {
    const r = Math.round(Math.random() * 255); // hah love it exactly what you wanted to make earlier
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    const background = ROT.Color.toRGB([r, g, b]); // ooh what does this do ROT has such crazy general helper methods man really impressive this guy knew them all that's huge for sure not the best designed game but super knowledgable about using the library whenever applicable which is huge
    display.drawText(2, i + 1, `%b{${background}}You win!`); // ah %b for background and %c for color love it
  }
};

export const loseScreen = new Screen("lose");

loseScreen.render = function(game, display) {
  for (let i = 0; i < 22; i++) {
    display.drawText(2, i + 1, "%b{red}You lose! :(");
  }
};