import Entity from './entity';
import Repository from './repository';

// love duck typing here with these Mixins and making literally
// all characters indistinguishable in implementation - makes it incredibly
// easy later on to have different races and character types for a character and
// for them to even polymorph over time. Roguelikes are such excellent tools in good
// complex system design in their total insane degree of conventional complexity and nuance
export const EntityMixins = {};

// this mixin denotes an entity having a field of vision with a given radius
EntityMixins.Sight = {
  name: 'Sight',
  groupName: 'Sight',
  init(template) {
    this.sightRadius = template.sightRadius || 5;
  },
  getSightRadius() {
    return this.sightRadius;
  }
};

EntityMixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act() {
    // check if the game is over
    if (!this.isAlive()) {
      this.game.screens.playScreen.setGameEnded(true);
      this.sendMessage(this, `You have died. Press [escape] to continue.`);
    }
    // Re-render the screen
    this.game.refresh();
    // Lock the engine and wait asynchronously
    // for the player to press a key
    this.getMap().getEngine().lock();
    // clear the message queue on every turn
    this.clearMessages();
  }
};

EntityMixins.WanderActor = {
  name: 'WanderActor',
  groupName: 'Actor',
  act() {
    // don't do anything if not on the same level as the player
    if (this.getZ() !== this.map.currentZ) {
      return false;
    }
    // randomly decide if moving forwards or backwards
    const moveOffset = (Math.random() >= 0.5) ? 1 : -1; // love improving on code while you do it
    // randomly decide if moving x or y
    const x = this.getX();
    const y = this.getY();
    if (Math.random() >= 0.5) {
      this.tryMove(x + moveOffset, y); // make z optional in tryMove
    } else {
      this.tryMove(x, y + moveOffset);
    }
  }
};

EntityMixins.FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  init() {
    this.growthsRemaining = 5;
  },
  act() {
    // don't do anything if not on the same level as the player
    if (this.getZ() !== this.map.currentZ) {
      return false;
    }
    // see if fungus should randomly grow this turn or not
    if (this.growthsRemaining > 0) {
      if (Math.random() <= 0.03) {
        // Generate the coordinates of a random adjacent square
        // by generating an offset of either -1, 0, or 1 for both the x and y coordinates
        // To do that, generate a number from 0 to 2 and subtract one, smart lol.
        // Note that Math.random() is not inclusive of 1 so you can safely do * 3 and be assured it will never actaully equal 1 * 3 and will always round down to 2 at the highest end of things, Math.floor is great, this is a smart method for sure wow
        const xOffset = Math.floor(Math.random() * 3) - 1;
        const yOffset = Math.floor(Math.random() * 3) - 1;
        // Make sure you're not trying to spawn on the same tile as the current spawning fungus lol
        if (xOffset !== 0 || yOffset !== 0) { // as long as one of these isn't true we're good, if they're both true then it's the same square as the spawning entity and this shouldn't happen
          // make sure this location is actually a floor and if so all good
          if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset, this.getZ())) {
            const entity = EntityRepository.create('fungus'); // rough can't have a circular require makes sense lol hmm // interesting even though this code I think is run when loaded into entities the FungusTemplate has to be defined here
            entity.setPosition(
              this.getX() + xOffset,
              this.getY() + yOffset,
              this.getZ());
            this.getMap().addEntity(entity);
            this.growthsRemaining--;

            this.sendMessageNearby(this.getMap(), // okay this is amazing lol
              entity.getX(), entity.getY(), entity.getZ(),
              `The fungus is spreading!`);
          }
        }
      }
    }
  }
};

EntityMixins.Destructible = {
  name: 'Destructible',
  init(template) {
    this.maxHP = template.maxHP || 10;
    // gives optionality to set starting HP to something lower than max HP, that would be really cool in some future Worm lung monster shit
    this.hp = template.hp || this.maxHP;
    this.defenseValue = template.defenseValue || 0;
  },
  getHP() { return this.hp; },
  getMaxHP() { return this.maxHP; },
  getDefenseValue() { return this.defenseValue; },
  takeDamage(attacker, damage) {
    this.hp -= damage;
    // if 0 or less HP, remove from map
    if (this.hp <= 0) {
      this.sendMessage(attacker, `You kill the ${this.getName()}`);
      this.kill();
    }
  }
};

EntityMixins.Attacker = {
  name: 'Attacker',
  groupName: 'Attacker',
  init(template) { // properties are passed in as an argument to the init call, and properties correspond to the Template that's passed in as an argument to the Entity constructor function love it
    this.attackValue = template.attackValue || 1;
  },
  getAttackValue() { return this.attackValue; },
  attack(target) {
    // only attack the entity if they are destructible
    if (target.hasMixin('Destructible')) {
      const attack = this.getAttackValue();
      const defense = target.getDefenseValue();
      const max = Math.max(0, attack - defense);
      const damage = 1 + Math.floor(Math.random() * max);

      this.sendMessage(this, `You strike the ${target.getName()} for ${damage} damage!`);
      this.sendMessage(target, `The ${this.getName()} strikes you for ${damage} damage!`);

      target.takeDamage(this, damage); // this will do minimum 1 damage no matter what even if the defender has insanely higher defense value which can lead to some very interesting monsters who can only ever take 1 damage per turn or something
    }
  }
};

EntityMixins.InventoryHolder = {
  name: 'InventoryHolder',
  init(template) {
    // default to 10 inventory slots.
    const inventorySlots = template.inventorySlots || 10;
    // set up a new empty inventory, one of the few times where you actually do want to instantiate the array to a bunch of empty items of a set length that will never increase unless they find some potion of inventory slot increasement or something
    this.items = new Array(inventorySlots);
  },
  getItems() {
    return this.items;
  },
  getItem(i) {
    return this.items[i];
  },
  addItem(item) {
    // try to find an empty slot in the inventory, returning true only if one was found --> if all slots are taken, don't add the item and return false, I like this actually
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i]) {
        this.items[i] = item;
        return true;
      }
    }
    return false;
  },
  removeItem(i) {
    this.items[i] = null; // interesting yeah you don't set things to undefined right only null love it
  },
  canAddItem() {
    // check if there are any empty slots
    for (let i = 0; i < this.items.length; i++) {
      if (!this.items[i]) {
        return true;
      }
    }
    return false;
  },
  pickupItems(indices) {
    // allow the player to pickup items from the map, where indices are the indices
    // for the array of items returned by Map.getItemsAt that specifies the specific items from the total array of items that you want to pick up
    const mapItems = this.map.getItemsAt(this.getX(), this.getY(), this.getZ());
    let added = 0;
    // iterate through all indices
    for (let i = 0; i < indices.length; i++) {
      // try to add the item. If the inventory isn't full, splice the item out of the list of items.
      // In order to get the right item going forward, you then have to offset the index by the number of items already added lol
      if (this.addItem(mapItems[indices[i] - added])) { // this returns true if successful in adding the item dope
        mapItems.splice(indices[i] - added, 1);
        added++;
      } else {
        // inventory is full, stop the loop
        break;
      }
    }
    // update the items in the map - this shouldn't be necessary since mapItems should point to the same array so test it without this actually
    this.map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
    // return true only if you added all items
    return added === indices.length;
  },
  dropItem(i) {
    // drops an item to the current map tile
    if (this.items[i]) {
      if (this.map) {
        this.map.addItem(this.getX(), this.getY(), this.getZ(), this.items[i]);
      }
      this.removeItem(i);
    }
  }
};

EntityMixins.MessageRecipient = {
  name: 'MessageRecipient',
  init(template) {
    this.messages = [];
  },
  receiveMessage(message) {
    this.messages.push(message);
  },
  getMessages() {
    return this.messages;
  },
  clearMessages() {
    this.messages = [];
  }
};

// kept out of the EntityRepo for now so it doesn't generate an automatic player template lol...would be amazing to create clones of yourself you have to fight though
export const PlayerTemplate = {
  character: '@',
  foreground: 'white',
  maxHP: 15,
  attackValue: 5,
  defenseValue: 2,
  sightRadius: 6,
  inventorySlots: 22,
  mixins: [EntityMixins.PlayerActor, EntityMixins.Sight,
  EntityMixins.Attacker, EntityMixins.Destructible,
  EntityMixins.MessageRecipient, EntityMixins.InventoryHolder]
};

export const EntityRepository = new Repository('entities', Entity); // insane that you can really pass constructor functions like this as variable names man I guess they're just objects like everything else so you should be able to do this in Ruby too no?

EntityRepository.define('bat', {
  name: 'bat',
  character: 'B',
  foreground: 'white',
  maxHP: 3,
  attackValue: 2,
  mixins: [EntityMixins.WanderActor, EntityMixins.Attacker, EntityMixins.Destructible]
});

EntityRepository.define('newt', {
  name: 'newt',
  character: ':',
  foreground: 'yellow',
  maxHP: 5,
  attackValue: 2,
  mixins: [EntityMixins.WanderActor, EntityMixins.Attacker, EntityMixins.Destructible]
});

EntityRepository.define('fungus', {
  name: 'fungus',
  character: 'F',
  foreground: 'green',
  maxHP: 6,
  mixins: [EntityMixins.FungusActor, EntityMixins.Destructible]
});