import * as ROT from 'rot-js';
import Builder from './builder';
import Map from './map';
import Entity from './entity';
import { PlayerTemplate } from './entities';

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
startScreen.render = function(display) {
  // Render prompt to the screen
  display.drawText(1, 1, "%c{yellow}Welcome to Thiefesque. Feel free to dig around."); // must be some regex for them to read strings like this interesting
  display.drawText(1, 2, "Press [Enter] to start.");
};

// ah hmm bind this later to the actual game object try it lol that might just work
// damn the problem is the binding isn't working here still hmm. but man everything else works incredible lol
// right fucking arrow functions have no scope and can't be bound god damn it lol
startScreen.handleEvent = function(e) { // okay triggering is working fine great
  if (e.keyCode === ROT.KEYS.VK_SPACE || e.keyCode === ROT.KEYS.VK_RETURN) {
    this.game.switchScreen(this.game.screens.playScreen);
  }
};

export const playScreen = new Screen("play"); // at least you know this export style is working amazing to remember it all

playScreen.gameEnded = false; // no need to actually explicitly set but again doesn't hurt to be clear

playScreen.setGameEnded = function(gameEnded) {
  this.gameEnded = gameEnded;
};

// insane how easy it is to put together a fully functioning game now and how powerful some libraries are man
playScreen.enter = function() {
  // Create a map based on these size parameters fuck yeah
  const width = 100;
  const height = 100;
  const depth = 6;
  // create map from the tiles from the Builder
  const builder = new Builder(width, height, depth);
  const tiles = builder.getTiles();
  const upstairPos = builder.getAllUpstairPos();
  const downstairPos = builder.getAllDownstairPos();
  this.player = new Entity(PlayerTemplate, this.game);
  this.map = new Map(tiles, this.player, upstairPos, downstairPos); // this still refers to the playScreen object at this point in time since it'll be called method style
  this.map.getEngine().start();
};

playScreen.move = function(dX, dY, dZ) {
  const newX = this.player.getX() + dX;
  const newY = this.player.getY() + dY;
  const newZ = this.player.getZ() + dZ;
  // try to move to the new cell -- this function is what updates the player's x and y position now as it should be
  this.player.tryMove(newX, newY, newZ);
  this.game.refresh();
};

playScreen.render = function(display) { // amazing that most 'variables' are in fact constants and not variable at all lol
  // if there's a current subscreen, render that instead
  if (this.subScreen) {
    this.subScreen.render(display);
    return;
  }
  const screenWidth = this.game.getScreenWidth(); // have a single source of truth for all numbers everything else references so there's never any confusion and refactoring to have a different number is incredibly easy great code guidance now actually loving this
  const screenHeight = this.game.getScreenHeight();
  // make sure the x-axis doesn't go out of bounds
  let topLeftX = Math.max(0, this.player.getX() - Math.floor(screenWidth/2)); // note that if the screenWidth doesn't happen to be even for some reason you'll need to floor this not to end up with some crazy non-integer number lol
  // make sure you can still fit the entire game screen
  topLeftX = Math.min(topLeftX, this.map.getWidth() - screenWidth); // this stops you from scrolling too far right, right makes perfect sense, basically the hard cap to the right is the width of the map minus the screen width, e.g. if the map is 100 squares and the screen width is 80 squares, then never let the topLeftX go beyond 100-80, or 20, even if they move past that, love it totally get it now so great. The check here is to see if the width of the map minus the screen width is *less* than the current x position, that's what the minimum check is for, basically ensuring that the x position never exceeds a certain maximum, so great
  let topLeftY = Math.max(0, this.player.getY() - Math.floor(screenHeight/2));
  topLeftY = Math.min(topLeftY, this.map.getHeight() - screenHeight);
  const currentZ = this.player.getZ();

  // keep track of all visible map cells
  const visibleCells = {};
  // find all visible cells and add them to visibleCells
  this.map.getFov(currentZ).compute(
    this.player.getX(), this.player.getY(),
    this.player.getSightRadius(),
    (x, y, radius, visibility) => { // radius and visibility are never used thus far, but they are passed in here as arguments such that you could access them later, though not sure where you're passing in visibility from rn (maybe it has a default value unlcear how that would work though)
      visibleCells[`${x},${y}`] = true;
      this.map.setExplored(x, y, currentZ, true);
    }
  );
  
  // Render all map cells
  for (let x = topLeftX; x < topLeftX + screenWidth; x++) { // yeah makes sense topleftX is the leftmost square to display -- display screenWidth worth of squares since that'll fill up the entire visual display love it
    for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
      if (this.map.isExplored(x, y, currentZ)) { // only render the cell if it's in the array of all explored tiles
        // Fetch the glyph for the tile and render it to the screen so fucking great
        // technically a tile object right now but you're just using the glyph methods so calling it all a glyph for now
        let glyph = this.map.getTile(x, y, currentZ); // right this gets a Tile object and each of those has a getGlyph method amazing
        // only render the cell in its original color (otherwise render in a faded darkGray) if it's defined as true in the visibleCells object and not undefined --> on every rendering this updates anew which is great damn supercomputers are insane this would be totally unfeasible on anything less than a supercomputer absolutely unbelievable that we don't have to be too conscientious about performance with all this shit kind of nice actually thinking about having to optimize with scarcity of resources for everything instead of this insane fast and loose code man
        let foreground = glyph.getForeground();
        // if the cell is in the FOV, check if there are items or entities to display
        if (visibleCells[`${x},${y}`]) {
          // check for items first, since entities should overwrite tiles if there are both items and items love it
          const items = this.map.getItemsAt(x, y, currentZ);
          // if there's an items array, render the top most item, aka the last item put on the stack
          if (items) {
            glyph = items[items.length - 1];
          }
          // check if there's an entity at the given position
          if (this.map.getEntityAt(x, y, currentZ)) {
            glyph = this.map.getEntityAt(x, y, currentZ);
          }
          foreground = glyph.getForeground();
        } else {
          // if explored tile but not a visible cell, render the tile as darkGray
          foreground = 'darkGray';
        }
        display.draw( // ah thank god you pass in the display here otherwise no way to really do it can't have two bound thises love it --> but anyway you could solve this by passing arguments into .bind at call time which you did do above love it
          x - topLeftX, // right because you want these to always be constant to the screen position love it
          y - topLeftY,
          glyph.getChar(), // love semicolons letting you do things correctly on multiple lines passing in 5 arguments here to draw interesting can do it multiple ways it appears with the %c and %b and as just straight up arguments here hmm
          foreground,
          glyph.getBackground()
        );
      }
    }
  }

  // get all the messages in the player entity's queue and render them
  const messages = this.player.getMessages();
  messages.forEach((message, idx) => {
    // draw each message, incrementing the Y by the index each time
    display.drawText(0, idx, `%c{white}%b{black}${message}`); // unclear why sprintf was ever helpful hmm vs just clear interpolation even in ES5 format
  });

  // render player stats
  const stats = `%c{white}%b{black}HP: ${this.player.getHP()}/${this.player.getMaxHP()}`;
  display.drawText(0, screenHeight, stats);

  // render hunger state
  const hungerState = this.player.getHungerState();
  display.drawText(screenWidth - hungerState.length, screenHeight, hungerState); // render in the bottom right corner of the screen
};

// for subscreens like the inventory screen and other future screens
playScreen.setSubScreen = function(subScreen) {
  this.subScreen = subScreen;
  // refresh screen on changing the subscreen
  this.game.refresh();
};

playScreen.handleEvent = function(e) {
  // if there's a current subscreen, defer to that function instead
  if (this.subScreen) {
    this.subScreen.handleEvent(e);
    return;
  }
  if (this.gameEnded) {
    switch (e.key) {
      case 'Escape':
        this.game.switchScreen(this.game.screens.loseScreen);
        break;
    }
    return;
  }
  switch(e.key) { // omg cases will fall through until a break is found holy fuck that's amazing LOL
    case ' ':
    case 'Enter':
      this.game.switchScreen(this.game.screens.winScreen);
      break;
    case 'o': // man fall through mapping is totally the best
    case 'w':
    case 'ArrowUp':
      this.move(0, -1, 0); // nevermind had a stroke of brilliance using the native currying power of .bind to solve this fantastically love this life so much man // lmao jesus fuck you can't reference itself because you rewrote the this binding lmao OMG I KNOW WHAT TO DO LOL WITH BIND YOU CAN PASS IN YOUR OWN ARGUMENTS BRILLIANT
      this.map.getEngine().unlock();
      break;
    case 'p':
    case 'e':
      this.move(1, -1, 0);
      this.map.getEngine().unlock();
      break; // now you understand why break statements are important too so great man adding so much functionality here fucking love it
    case ';':
    case 'd':
    case 'ArrowRight': // damn so fucking smart
      this.move(1, 0, 0);
      this.map.getEngine().unlock();
      break;
    case '/':
    case 'c':
      this.move(1, 1, 0);
      this.map.getEngine().unlock();
      break;
    case '.':
    case 'x':
    case 'ArrowDown':
      this.move(0, 1, 0);
      this.map.getEngine().unlock();
      break;
    case ',':
    case 'z':
      this.move(-1, 1, 0);
      this.map.getEngine().unlock();
      break;
    case 'k':
    case 'a':
    case 'ArrowLeft':
      this.move(-1, 0, 0);
      this.map.getEngine().unlock();
      break;
    case 'i':
    case 'q':
      this.move(-1, -1, 0);
      this.map.getEngine().unlock();
      break;
    case '>':
      this.move(0, 0, 1);
      this.map.getEngine().unlock();
      break;
    case '<':
      this.move(0, 0, -1);
      this.map.getEngine().unlock();
      break;
    case 'I':
      if (this.game.inventoryScreen.setup(this.player, this.player.getItems())) { // this returns count, and if count is 0, this will evaluate to false in JS lol
        this.setSubScreen(this.game.screens.inventoryScreen);
      } else {
        // show the inventory
        // if the player has no items, send a message and don't take a turn
        this.player.sendMessage(this.player, "You are not carrying anything!");
        this.game.refresh();
        this.player.clearMessages();
      }
      break;
    case 'P':
      const items = this.map.getItemsAt(this.player.getX(), this.player.getY(), this.player.getZ());
      // if there are no items, show a message saying so
      if (!items) {
        this.player.sendMessage(this.player, "There is nothing here to pick up.");
        this.game.refresh(); // try to show the message immediately
        this.player.clearMessages(); // pretty sure it's because messages are only cleared on the next act not this one that you have to manually clear here otherwise messages will persist twice love it
      } else if (items.length === 1) {
        // if only one item, just try to pick it up no need to show a screen
        const item = items[0];
        if (this.player.pickupItems([0])) { // this returns true or false depending on if the item was successfully picked up great design // remember this takes an array of indices of items to try to pick up, if there's only one, just specify the first item love it
          this.player.sendMessage(this.player, `You pick up ${item.describeA()}.`);
          this.game.refresh();
          this.player.clearMessages();
        } else {
          this.player.sendMessage(this.player, "Your inventory is full! Nothing was picked up.");
          this.game.refresh();
          this.player.clearMessages();
        }
      } else {
        // show the pickup screen if there are multiple items
        this.game.screens.pickupScreen.setup(this.player, items);
        this.setSubScreen(this.game.screens.pickupScreen);
      }
      break;
    case 'D':
      if (this.game.screens.dropScreen.setup(this.player, this.player.getItems())) {
        // show the drop screen
        this.game.screens.dropScreen.setup(this.player, this.player.getItems());
        this.setSubScreen(this.game.screens.dropScreen);
      } else {
        // if the player has no items, send a message and don't take a turn
        this.player.sendMessage(this.player, "You have nothing to drop lol");
        this.game.refresh();
        this.player.clearMessages();
      }
      break;
    case 'E':
      if (this.game.screens.eatScreen.setup(this.player, this.player.getItems())) {
        this.setSubScreen(this.game.screens.eatScreen);
      } else {
        this.player.sendMessage(this.player, "You have nothing to eat.");
        this.game.refresh();
        this.player.clearMessages();
      }
      break;
  }
};

playScreen.showItemsSubScreen = function(subScreen, items, emptyMessage) {
  if (items && (subScreen.setup(this.player, items) > 0)) {
    this.setSubScreen(subScreen);
  } else {
    this.player.sendMessage(this.player, emptyMessage);
    this.game.refresh();
    this.player.clearMessages();
  }
};

export const winScreen = new Screen("win");

winScreen.render = function(display) {
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

loseScreen.render = function(display) {
  for (let i = 0; i < 22; i++) {
    display.drawText(2, i + 1, "%b{red}You lose! :(");
  }
};

// time to admit the basic Screen class is more of a handicap than anything else
export class ItemListScreen {
  constructor(template) {
    this.caption = template.caption;
    this.parentScreen = template.parentScreen; // can't believe this works lol
    this.okFunction = template.ok;
    // callback function to determine if an item should be shown on the screen, called for each item // by default, use identity function which returns whatever is passed in (so if a falsey value, like null or undefined or 0 or '', it'll return false)
    this.isAcceptableFunction = template.isAcceptable || function(x) { return x; }; // weird can't use fat arrow here? kind of makes sense since kind of ambiguous syntax
    // whether or not the user can select items on here
    this.canSelectItem = template.canSelect;
    // whether or not the user can select multiple items
    this.canSelectMultipleItems = template.canSelectMultipleItems;
    // whether or not a 'no item' option should appear
    this.hasNoItemOption = template.hasNoItemOption;
  }

  // needs to be separate from the initialization constructor function because these things are passed only later on
  setup(player, items) {
    this.player = player;
    // should be called before switching to the screen
    let count = 0;
    // iterate over each item, keeping only the acceptable ones and counting each acceptable item
    this.items = items.map(item => {
      if (this.isAcceptableFunction(item)) {
        count++;
        return item;
      } else {
        return null;
      }
    });
    // an empty set of selected indices
    this.selectedIndices = {};
    return count; // explicitly return so we can see if this is 0 and if so not show the screen
  }

  render(display) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    // render caption in the top row
    display.drawText(0, 0, this.caption);
    // render the no item row if enabled
    if (this.hasNoItemOption) {
      display.drawText(0, 1, '0 - no item');
    }
    let row = 0;
    for (let i = 0; i < this.items.length; i++) {
      // if there is an item, render it
      if (this.items[i]) {
        // get the letter matching the item's index
        const letter = letters.substring(i, i + 1);
        // if we have selected an item, show a +, else show a dash between
        // the letter and the item's name amazing
        const selectionState = (this.canSelectItem && this.canSelectMultipleItems &&
              this.selectedIndices[i]) ? '+' : '-';
        // check if item is worn or wielded
        let suffix = '';
        if (this.items[i] === this.player.getArmor()) {
          suffix = ' (wearing)';
        } else if (this.items[i] === this.player.getWeapon()) {
          suffix = ' (wielding)';
        }
        // render at the correct row and add 2 to give a space between the caption
        display.drawText(0, 2 + row, `${letter} ${selectionState} ${this.items[i].describe()} ${suffix}`);
        row++;
      }
    }
  }

  executeOkFunction() {
    // gather the selected items
    const selectedItems = {};
    for (const key in this.selectedIndices) {
      selectedItems[key] = this.items[key];
    }
    // switch back to the play screen
    this.parentScreen.setSubScreen(undefined);
    // call the OK function and end the player's turn if it returns true
    if (this.okFunction(selectedItems)) {
      this.player.getMap().getEngine().unlock();
    }
  }

  handleEvent(e) {
    const alpha = 'abcdefghijklmnopqrztuvwxyz';
    if (e.key === 'Escape') {
      this.parentScreen.setSubScreen(undefined);
    } else if (e.key === 'Enter') {
      // if they can't select an item on this screen or if they hit enter without any items selected, exit the screen
      if (!this.canSelectItem || Object.keys(this.selectedIndices).length === 0) {
        this.parentScreen.setSubScreen(undefined);
      } else {
        // handles what should happen when a player presses enter with items selected
        this.executeOkFunction();
      }
      // handle pressing zero when 'no item' selection is enabled
    } else if (e.key === '0' && this.canSelectItem && this.hasNoItemOption) {
      this.selectedIndices = {}; // this will basically clear all items and unequip them all correct? Interesting --> shouldn't it just be toggling the item to unwield it? Look into it more later
      this.executeOkFunction();
    } else if (this.canSelectItem && alpha.includes(e.key)) {  // if you can select items here and they press a key that corresponds to a letter of the alphabet lol
      // check if the key pressed corresponds to a valid item
      const index = alpha.indexOf(e.key);
      if (this.items[index]) {
        // if multiple selection is allowed, toggle the selection status for the given item,
        // otherwise just select this one item and exit the screen
        if (this.canSelectMultipleItems) {
          if (this.selectedIndices[index]) { // if already selected, deselect
            delete this.selectedIndices[index];
          } else {
            this.selectedIndices[index] = true;
          }
          // redraw the screen
          this.parentScreen.game.refresh();
        } else {
          this.selectedIndices[index] = true;
          this.executeOkFunction();
        }
      }
    }
  }
}

export const inventoryScreen = new ItemListScreen({
  parentScreen: playScreen,
  caption: 'Inventory',
  canSelect: false
});

export const pickupScreen = new ItemListScreen({
  parentScreen: playScreen,
  caption: 'Choose the items you wish to pick up',
  canSelect: true,
  canSelectMultipleItems: true,
  ok(selectedItems) {
    // Try to pick up all items, messaging the player if they couldn't
    // all be picked up
    if (!this.player.pickupItems(Object.keys(selectedItems))) { // an array of all the indexes that were toggled to true in the object selectedItems love it. Weird though if you're only using the keys here totally pointless to actually do the whole create selectedItems instead of just using selectedIndices in the executeOkFunction look into it more later
      this.player.sendMessage(this.player, "Your inventory is full! Not all items were picked up.");
    }
    return true;
  }
});

export const dropScreen = new ItemListScreen({
  parentScreen: playScreen,
  caption: 'Choose the item you wish to drop',
  canSelect: true,
  canSelectMultipleItems: false,
  ok(selectedItems) {
    // drop the selected item
    this.player.dropItem(Object.keys(selectedItems)[0]);
    return true;
  }
});

export const eatScreen = new ItemListScreen({
  parentScreen: playScreen,
  caption: 'Choose the item you wish to eat',
  canSelect: true,
  canSelectMultipleItems: false,
  isAcceptable(item) {
    return item && item.hasMixin('Edible');
  },
  ok(selectedItems) { // the function to execute if everything is okay
    // eat the item, removing it if there are no consumptions remaining
    const key = Object.keys(selectedItems)[0];
    const item = selectedItems[key];
    this.player.sendMessage(this.player, `You eat ${item.describeThe()}`);
    item.eat(this.player);
    if (!item.hasRemainingConsumptions()) {
      this.player.removeItem(key); // right have to do it here because it has to be part of the player removing it, the item can't remove itself of course
    }
    return true;
  }
});

export const wieldScreen = new ItemListScreen({
  parentScreen: playScreen,
  caption: 'Choose the item you wish to wield',
  canSelect: true,
  canSelectionMultipleItems: false,
  hasNoItemOption: true,
  isAcceptable(item) {
    return item && item.hasMixin('Equippable') && item.isWieldable();
  },
  ok(selectedItems) {
    // check if we have selected 'no item', in which case unwield love it okay that's how it works interesting, why not just let them toggle weidling on and off
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this.player.unwield();
      this.player.sendMessage(this.player, "You are empty handed.");
    } else {
      // make sure to unequip the item first in case it is being used as armor
      const item = selectedItems[keys[0]];
      this.player.unequip(item);
      this.player.wield(item);
      this.player.sendMessage(this.player, `You are wielding ${item.describeA()}`);
    }
    return true;
  }
});

export const wearScreen = new ItemListScreen({
  parentScreen: playScreen,
  caption: 'Choose the item you wish to wear',
  canSelect: true,
  canSelectMultipleItems: false,
  hasNoItemOption: true,
  isAcceptable(item) {
    return item && item.hasMixin('Equippable') && item.isWearable();
  },
  ok(selectedItems) {
    // check if selected 'no item', i.e. unequip
    const keys = Object.keys(selectedItems);
    if (keys.length === 0) {
      this.player.unwield();
      this.player.sendMessage(this.player, "You are not wearing anything.");
    } else {
      // make sure to unequip the item first in case it's being used as a weapon
      const item = selectedItems[keys[0]];
      this.player.unequip(item);
      this.player.wear(item);
      this.player.sendMessage(this.player, `You are waering ${item.describeA()}`);
    }
    return true;
  }
});